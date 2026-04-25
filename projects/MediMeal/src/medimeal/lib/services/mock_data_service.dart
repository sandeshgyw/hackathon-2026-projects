import 'package:medimeal/models/medications.dart';

class MockDataService {
  static List<Medication> getMedications() {
    return [
      Medication(
        id: '1',
        name: 'Levothyroxine',
        dosage: '50 mcg',
        time: '6:00 AM',
        instructions: 'Morning dose with timing-sensitive follow-up',
        workflowType: 'timing_sensitive',
      ),
      Medication(
        id: '2',
        name: 'Amoxicillin',
        dosage: '500 mg',
        time: '9:00 AM',
        instructions: 'Daily support routine and adherence tracking',
        workflowType: 'hydration_support',
      ),
      Medication(
        id: '3',
        name: 'Allopurinol',
        dosage: '100 mg',
        time: '1:00 PM',
        instructions: 'Adaptive weekly food-awareness workflow',
        workflowType: 'weekly_limit_tracking',
      ),
    ];
  }
}
