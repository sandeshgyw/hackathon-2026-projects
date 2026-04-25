import 'package:flutter/material.dart';

import '../models/care_state.dart';
import '../models/workflow_suggestion.dart';
import '../widgets/care_state_card.dart';
import '../widgets/section_title.dart';
import '../widgets/summary_card.dart';

class HomeTab extends StatelessWidget {
  final String planSummary;
  final WorkflowSuggestion? latestSuggestion;
  final VoidCallback onActivateWorkflow;
  final int activeWorkflowCount;
  final CareState? latestCareState;

  const HomeTab({
    super.key,
    required this.planSummary,
    required this.latestSuggestion,
    required this.onActivateWorkflow,
    required this.activeWorkflowCount,
    required this.latestCareState,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'MediMeal',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Adaptive care workflows for your day',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Plan My Day'),
          SummaryCard(text: planSummary),
          const SizedBox(height: 24),
          const SectionTitle(title: 'What’s Next'),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: latestSuggestion == null
                  ? const Text(
                      'No next-step suggestion yet. Log a medication in the Meds tab.',
                      style: TextStyle(color: Color(0xFFCBD5E1)),
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          latestSuggestion!.title,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          latestSuggestion!.description,
                          style: const TextStyle(
                            color: Color(0xFFCBD5E1),
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 14),
                        ElevatedButton(
                          onPressed: onActivateWorkflow,
                          child: Text(latestSuggestion!.actionLabel),
                        ),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Quick Status'),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$activeWorkflowCount active workflow${activeWorkflowCount == 1 ? '' : 's'}',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Use the tabs below to manage medications, workflows, and insights.',
                    style: TextStyle(
                      color: Color(0xFFCBD5E1),
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Care Snapshot'),
          CareStateCard(careState: latestCareState),
        ],
      ),
    );
  }
}
