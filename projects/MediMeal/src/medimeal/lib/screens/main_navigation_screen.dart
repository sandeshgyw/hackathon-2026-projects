import 'package:flutter/material.dart';
import 'package:medimeal/models/medications.dart';

import '../models/active_workflow.dart';
import '../models/care_state.dart';

import '../models/workflow_suggestion.dart';
import '../services/mock_data_service.dart';
import '../services/workflow_engine.dart';
import 'home_tab.dart';
import 'insights_tab.dart';
import 'medications_tab.dart';
import 'workflows_tab.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int selectedIndex = 0;

  late List<Medication> medications;

  String? latestSummary;
  WorkflowSuggestion? latestSuggestion;
  CareState? latestCareState;
  List<ActiveWorkflow> activeWorkflows = [];

  @override
  void initState() {
    super.initState();
    medications = MockDataService.getMedications();
  }

  void onMedicationTaken(Medication medication) {
    final result = WorkflowEngine.processMedicationTaken(medication);

    setState(() {
      latestSummary = result.nextStepSummary;
      latestSuggestion = result.suggestion;
      latestCareState = result.careState;
      selectedIndex = 0;
    });
  }

  void activateWorkflow() {
    if (latestSuggestion == null) return;

    final newWorkflow = ActiveWorkflow(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: latestSuggestion!.title,
      description: latestSuggestion!.description,
      status: 'Active',
    );

    setState(() {
      activeWorkflows.add(newWorkflow);
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Workflow activated')),
    );
  }

  String currentWorkflowText(int count) {
    if (count == 0) {
      return 'No active workflows are running yet.';
    } else if (count == 1) {
      return '1 active workflow is supporting today’s routine.';
    } else {
      return '$count active workflows are supporting today’s routine.';
    }
  }

  String buildPlanMyDaySummary() {
    if (latestSummary == null) {
      return 'No actions logged yet. Mark a medication as taken to begin today’s care flow.';
    }

    final workflowCount = activeWorkflows.length;
    final careSummary = latestCareState?.summary ?? 'No active care state.';
    final caution = latestCareState?.caution ?? '';

    return '''
$latestSummary

${currentWorkflowText(workflowCount)}

Care status: $careSummary
${caution.isNotEmpty ? '\nCaution: $caution' : ''}
''';
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomeTab(
        planSummary: buildPlanMyDaySummary(),
        latestSuggestion: latestSuggestion,
        onActivateWorkflow: activateWorkflow,
        activeWorkflowCount: activeWorkflows.length,
        latestCareState: latestCareState,
      ),
      MedicationsTab(
        medications: medications,
        onMedicationTaken: onMedicationTaken,
      ),
      WorkflowsTab(
        activeWorkflows: activeWorkflows,
      ),
      InsightsTab(
        careState: latestCareState,
      ),
    ];

    return Scaffold(
      body: SafeArea(
        child: pages[selectedIndex],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            selectedIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.medication_outlined),
            selectedIcon: Icon(Icons.medication),
            label: 'Meds',
          ),
          NavigationDestination(
            icon: Icon(Icons.sync_alt_outlined),
            selectedIcon: Icon(Icons.sync_alt),
            label: 'Workflows',
          ),
          NavigationDestination(
            icon: Icon(Icons.insights_outlined),
            selectedIcon: Icon(Icons.insights),
            label: 'Insights',
          ),
        ],
      ),
    );
  }
}
