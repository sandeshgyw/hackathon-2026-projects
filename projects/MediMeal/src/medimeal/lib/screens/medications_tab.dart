import 'package:flutter/material.dart';
import 'package:medimeal/models/medications.dart';

import '../widgets/medication_card.dart';
import '../widgets/section_title.dart';

class MedicationsTab extends StatelessWidget {
  final List<Medication> medications;
  final Function(Medication) onMedicationTaken;

  const MedicationsTab({
    super.key,
    required this.medications,
    required this.onMedicationTaken,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Medications',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Track and log today’s medications',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Today’s Medications'),
          ...medications.map(
            (medication) => MedicationCard(
              medication: medication,
              onTaken: () => onMedicationTaken(medication),
            ),
          ),
        ],
      ),
    );
  }
}
