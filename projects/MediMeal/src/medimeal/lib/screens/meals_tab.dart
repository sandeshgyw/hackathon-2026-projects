import 'dart:async';
import 'package:flutter/material.dart';
import 'package:medimeal/models/hydration_workflow.dart';
import 'package:medimeal/models/weekly_tracking_workflow.dart';

import 'package:medimeal/models/ingredient_evaluation_result.dart';
import 'package:medimeal/services/hydration_workflow_service.dart';
import 'package:medimeal/services/ingredient_evaluator_service.dart';

import '../models/care_state.dart';
import '../models/meal_plan.dart';
import '../models/medications.dart';
import '../models/timing_workflow.dart';
import '../services/gemini_meal_service.dart';
import '../services/timing_workflow_service.dart';
import '../widgets/section_title.dart';
import '../widgets/summary_card.dart';

class MealsTab extends StatefulWidget {
  final CareState? careState;
  final Medication? latestMedication;
  final TimingWorkflow? activeTimingWorkflow;
  final HydrationWorkflow? activeHydrationWorkflow;
  final WeeklyTrackingWorkflow? activeWeeklyTrackingWorkflow;

  const MealsTab({
    super.key,
    required this.careState,
    required this.latestMedication,
    required this.activeTimingWorkflow,
    required this.activeHydrationWorkflow,
    required this.activeWeeklyTrackingWorkflow,
  });

  @override
  State<MealsTab> createState() => _MealsTabState();
}

class _MealsTabState extends State<MealsTab> {
  final TextEditingController ingredientsController = TextEditingController();

  String selectedMealType = 'Breakfast';
  MealPlan? generatedMealPlan;
  bool isLoading = false;
  String? errorMessage;
  Timer? _timer;

  final List<String> mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  @override
  void initState() {
    super.initState();
    _startTimerIfNeeded();
  }

  @override
  void didUpdateWidget(covariant MealsTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    _startTimerIfNeeded();
  }

  void _startTimerIfNeeded() {
    _timer?.cancel();

    final workflow = widget.activeTimingWorkflow;
    if (workflow != null && workflow.isActive) {
      _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (!mounted) return;

        if (widget.activeTimingWorkflow == null ||
            !widget.activeTimingWorkflow!.isActive) {
          timer.cancel();
        } else {
          setState(() {});
        }
      });
    }
  }

  Future<void> generateMealPlan() async {
    if (ingredientsController.text.trim().isEmpty) {
      setState(() {
        errorMessage = 'Please enter at least one ingredient.';
      });
      return;
    }

    setState(() {
      isLoading = true;
      errorMessage = null;
      generatedMealPlan = null;
    });

    try {
      final bool isTimingActive = widget.activeTimingWorkflow != null &&
          widget.activeTimingWorkflow!.isActive;

      final String timingNote = isTimingActive
          ? '${TimingWorkflowService.formatRemaining(widget.activeTimingWorkflow!.remainingTime)} This recipe is for preparation now and eating later when the meal window opens.'
          : 'The meal window is open. This recipe can be eaten now.';

      final String supportNote = widget.activeHydrationWorkflow != null
          ? 'Hydration routine is active. Prefer simple, supportive, easy-to-follow meals for today.'
          : '';

      final String weeklyNote = widget.activeWeeklyTrackingWorkflow != null
          ? 'Weekly tracking is active. The recipe should respect the remaining allowance for this week and avoid pushing the user over the limit.'
          : '';

      final IngredientEvaluationResult evaluation =
          IngredientEvaluatorService.evaluate(
        ingredientsText: ingredientsController.text,
        latestMedication: widget.latestMedication,
        activeTimingWorkflow: widget.activeTimingWorkflow,
      );

      final mealPlan = await GeminiMealService.generateMealPlan(
        mealType: selectedMealType,
        timingNote: timingNote,
        evaluation: evaluation,
        careState: widget.careState,
        latestMedication: widget.latestMedication,
        supportNote: supportNote,
        weeklyNote: weeklyNote,
      );

      setState(() {
        generatedMealPlan = mealPlan;
      });
    } catch (e) {
      setState(() {
        errorMessage = e.toString();
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Widget _buildTimingStatusCard() {
    final bool hasTimingWorkflow = widget.activeTimingWorkflow != null;
    final bool isTimingActive =
        hasTimingWorkflow && widget.activeTimingWorkflow!.isActive;

    if (widget.activeHydrationWorkflow != null) {
      return Card(
        color: const Color(0xFF102A43),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(
                    Icons.water_drop_outlined,
                    color: Color(0xFF60A5FA),
                    size: 24,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'Hydration routine active',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF60A5FA),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                HydrationWorkflowService.buildProgressLabel(
                  widget.activeHydrationWorkflow!,
                ),
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Choose a simple meal that supports the rest of today’s routine.',
                style: TextStyle(
                  color: Color(0xFFE5E7EB),
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (!hasTimingWorkflow) {
      return const SummaryCard(
        text: 'Log a medication first to get care-aware meal guidance.',
      );
    }

    if (isTimingActive) {
      return Card(
        color: const Color(0xFF3B2A12),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(
                    Icons.warning_amber_rounded,
                    color: Color(0xFFFBBF24),
                    size: 24,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'Wait before eating',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFFFBBF24),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                TimingWorkflowService.formatRemaining(
                  widget.activeTimingWorkflow!.remainingTime,
                ),
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Meal window opens at ${TimingWorkflowService.formatAllowedTime(widget.activeTimingWorkflow!.eatAfter)}',
                style: const TextStyle(
                  color: Color(0xFFE5E7EB),
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'You can still generate a recipe now and prepare it in advance.',
                style: TextStyle(
                  color: Color(0xFFE5E7EB),
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Card(
      color: const Color(0xFF123227),
      child: const Padding(
        padding: EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.check_circle_outline,
                  color: Color(0xFF34D399),
                  size: 24,
                ),
                SizedBox(width: 8),
                Text(
                  'Meal window open',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF34D399),
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Text(
              'You can now generate a recipe for immediate eating.',
              style: TextStyle(
                color: Color(0xFFE5E7EB),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMealInputCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Ingredients',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: ingredientsController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Example: rice, spinach, eggs',
                hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                filled: true,
                fillColor: const Color(0xFF334155),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Meal Type',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              initialValue: selectedMealType,
              items: mealTypes
                  .map(
                    (type) => DropdownMenuItem(
                      value: type,
                      child: Text(type),
                    ),
                  )
                  .toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    selectedMealType = value;
                  });
                }
              },
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF334155),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 18),
            ElevatedButton(
              onPressed: isLoading ? null : generateMealPlan,
              child: Text(isLoading ? 'Generating...' : 'Generate Meal Plan'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGeneratedMealCard() {
    if (generatedMealPlan == null) {
      return const SummaryCard(
        text: 'No meal generated yet. Add ingredients and generate a plan.',
      );
    }

    return Card(
      key: ValueKey(
        '${generatedMealPlan!.title}-${generatedMealPlan!.warning}-${generatedMealPlan!.timingMessage}',
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              generatedMealPlan!.title,
              style: const TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              generatedMealPlan!.summary,
              style: const TextStyle(
                color: Color(0xFFCBD5E1),
                height: 1.4,
              ),
            ),
            if (generatedMealPlan!.warning.isNotEmpty) ...[
              const SizedBox(height: 14),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B2A12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFFFBBF24).withOpacity(0.35),
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.warning_amber_rounded,
                      color: Color(0xFFFBBF24),
                      size: 22,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Ingredient warning',
                            style: TextStyle(
                              color: Color(0xFFFBBF24),
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            generatedMealPlan!.warning,
                            style: const TextStyle(
                              color: Color(0xFFE5E7EB),
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
            if (generatedMealPlan!.timingMessage.isNotEmpty) ...[
              const SizedBox(height: 14),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  generatedMealPlan!.timingMessage,
                  style: const TextStyle(
                    color: Color(0xFFCBD5E1),
                    height: 1.4,
                  ),
                ),
              ),
            ],
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _showRecipeBottomSheet,
                    child: const Text('View Recipe'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: _showIngredientNotesBottomSheet,
                    child: const Text('Ingredient Notes'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showRecipeBottomSheet() {
    if (generatedMealPlan == null) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  generatedMealPlan!.title,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  generatedMealPlan!.summary,
                  style: const TextStyle(
                    color: Color(0xFFCBD5E1),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Ingredients Used',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                ...generatedMealPlan!.ingredientsUsed.map(
                  (ingredient) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(
                      '• $ingredient',
                      style: const TextStyle(color: Color(0xFFCBD5E1)),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Steps',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                ...generatedMealPlan!.steps.map(
                  (step) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Text(
                      '• $step',
                      style: const TextStyle(
                        color: Color(0xFFCBD5E1),
                        height: 1.4,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showIngredientNotesBottomSheet() {
    if (generatedMealPlan == null) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Ingredient Notes',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                if (generatedMealPlan!.whyIngredientsFit.isNotEmpty) ...[
                  const SizedBox(height: 18),
                  const Text(
                    'Why these ingredients fit',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...generatedMealPlan!.whyIngredientsFit.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Text(
                        '• $item',
                        style: const TextStyle(
                          color: Color(0xFFCBD5E1),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ),
                ],
                if (generatedMealPlan!
                    .whyIngredientsWereBlocked.isNotEmpty) ...[
                  const SizedBox(height: 18),
                  const Text(
                    'Why some ingredients were not used',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...generatedMealPlan!.whyIngredientsWereBlocked.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Text(
                        '• $item',
                        style: const TextStyle(
                          color: Color(0xFFCBD5E1),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ),
                ],
                if (generatedMealPlan!.blockedIngredients.isNotEmpty) ...[
                  const SizedBox(height: 18),
                  const Text(
                    'Ingredients not used',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...generatedMealPlan!.blockedIngredients.map(
                    (ingredient) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Text(
                        '• $ingredient',
                        style: const TextStyle(color: Color(0xFFCBD5E1)),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    ingredientsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final String topContextText = widget.latestMedication == null
        ? 'No active care guidance yet'
        : (widget.activeTimingWorkflow != null &&
                widget.activeTimingWorkflow!.isActive)
            ? 'Your next recipe is for later'
            : (widget.activeHydrationWorkflow != null)
                ? 'Your next recipe should feel simple and supportive today'
                : (widget.activeWeeklyTrackingWorkflow != null)
                    ? 'Your next recipe should fit within this week’s remaining allowance'
                    : 'You can plan your meal now';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Meals',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Generate care-aware meal suggestions',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Right now'),
          SummaryCard(text: topContextText),
          const SizedBox(height: 24),
          _buildTimingStatusCard(),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Meal Inputs'),
          _buildMealInputCard(),
          const SizedBox(height: 16),
          if (errorMessage != null) ...[
            Card(
              color: const Color(0xFF3F1D1D),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: Colors.redAccent,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        errorMessage!,
                        style: const TextStyle(
                          color: Color(0xFFFECACA),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
          const SectionTitle(title: 'Suggested Meal'),
          _buildGeneratedMealCard(),
        ],
      ),
    );
  }
}
