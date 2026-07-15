import type { Patient, TriageResult, RiskAssessment, AllocationDecision } from '@/types/hospital';
import { useHospitalStore } from '@/store/hospitalStore';

export function triagePatient(patient: Patient): TriageResult {
  let score = 0;
  const reasoning: string[] = [];

  // Vital signs scoring
  const { vitals } = patient;

  // Heart rate assessment
  if (vitals.heartRate > 120 || vitals.heartRate < 50) {
    score += 30;
    reasoning.push(`Abnormal heart rate (${vitals.heartRate} bpm) indicates cardiac stress`);
  } else if (vitals.heartRate > 100 || vitals.heartRate < 60) {
    score += 15;
    reasoning.push(`Heart rate (${vitals.heartRate} bpm) slightly outside normal range`);
  }

  // Blood pressure assessment
  if (vitals.bloodPressure.systolic > 180 || vitals.bloodPressure.systolic < 90) {
    score += 25;
    reasoning.push(`Blood pressure (${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}) is critically abnormal`);
  } else if (vitals.bloodPressure.systolic > 140 || vitals.bloodPressure.systolic < 100) {
    score += 10;
    reasoning.push(`Blood pressure moderately elevated/low`);
  }

  // Oxygen saturation
  if (vitals.oxygenSaturation < 90) {
    score += 35;
    reasoning.push(`Critical oxygen saturation (${vitals.oxygenSaturation}%) - immediate intervention needed`);
  } else if (vitals.oxygenSaturation < 95) {
    score += 20;
    reasoning.push(`Low oxygen saturation (${vitals.oxygenSaturation}%) requires monitoring`);
  }

  // Temperature
  if (vitals.temperature > 39.5 || vitals.temperature < 35) {
    score += 20;
    reasoning.push(`Temperature (${vitals.temperature.toFixed(1)}°C) indicates severe fever or hypothermia`);
  } else if (vitals.temperature > 38) {
    score += 10;
    reasoning.push(`Elevated temperature suggests infection`);
  }

  // Respiratory rate
  if (vitals.respiratoryRate > 30 || vitals.respiratoryRate < 10) {
    score += 25;
    reasoning.push(`Respiratory rate (${vitals.respiratoryRate}/min) critically abnormal`);
  } else if (vitals.respiratoryRate > 20) {
    score += 10;
    reasoning.push(`Elevated respiratory rate indicates respiratory distress`);
  }

  // Symptoms scoring
  const criticalSymptoms = ['Chest pain', 'Shortness of breath', 'Confusion', 'Weakness'];
  const seriousSymptoms = ['Fever', 'Dizziness', 'Palpitations', 'Abdominal pain'];

  patient.symptoms.forEach(symptom => {
    if (criticalSymptoms.includes(symptom)) {
      score += 15;
      reasoning.push(`${symptom} is a critical symptom requiring urgent attention`);
    } else if (seriousSymptoms.includes(symptom)) {
      score += 8;
      reasoning.push(`${symptom} suggests moderate severity`);
    }
  });

  // Comorbidities
  patient.comorbidities.forEach(comorbidity => {
    score += 5;
    reasoning.push(`${comorbidity} increases patient risk`);
  });

  // Age factor
  if (patient.age > 65) {
    score += 10;
    reasoning.push(`Advanced age (${patient.age}) increases vulnerability`);
  } else if (patient.age > 50) {
    score += 5;
  }

  // Determine severity
  let severity: TriageResult['severity'];
  if (score >= 80) {
    severity = 'critical';
  } else if (score >= 50) {
    severity = 'serious';
  } else if (score >= 25) {
    severity = 'stable';
  } else {
    severity = 'non-urgent';
  }

  return {
    severity,
    score,
    reasoning,
    timestamp: new Date(),
  };
}

export function assessRisk(patient: Patient, triageResult: TriageResult): RiskAssessment {
  const factors: string[] = [];
  let riskScore = 0;

  // Vital instability score
  const { vitals } = patient;
  const vitalInstability = 
    (vitals.heartRate > 100 ? 1 : 0) +
    (vitals.oxygenSaturation < 95 ? 2 : 0) +
    (vitals.respiratoryRate > 20 ? 1 : 0) +
    (vitals.temperature > 38 ? 1 : 0);

  if (vitalInstability >= 3) {
    riskScore += 40;
    factors.push('Multiple vital sign abnormalities detected - high instability');
  } else if (vitalInstability >= 2) {
    riskScore += 20;
    factors.push('Some vital instability detected');
  }

  // Multi-organ stress indicators
  if (patient.symptoms.includes('Chest pain') && patient.symptoms.includes('Shortness of breath')) {
    riskScore += 25;
    factors.push('Combined cardiac and respiratory symptoms suggest multi-organ stress');
  }

  // Age-adjusted risk
  if (patient.age > 70) {
    riskScore += 20;
    factors.push('Age over 70 significantly increases deterioration risk');
  } else if (patient.age > 60) {
    riskScore += 10;
    factors.push('Age factor increases risk');
  }

  // Comorbidity impact
  const highRiskComorbidities = ['Heart disease', 'COPD', 'Kidney disease', 'Immunocompromised'];
  const hasHighRiskComorbidity = patient.comorbidities.some(c => highRiskComorbidities.includes(c));
  if (hasHighRiskComorbidity) {
    riskScore += 20;
    factors.push('High-risk comorbidity present');
  }

  const deteriorationProbability = Math.min(95, riskScore + 5);
  const override = riskScore >= 60 && triageResult.severity !== 'critical';

  if (override) {
    factors.push('Risk assessment overrides triage: Escalating to critical priority');
  }

  return {
    riskLevel: riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low',
    deteriorationProbability,
    factors,
    override,
  };
}

export function allocateResources(
  patient: Patient,
  triageResult: TriageResult,
  riskAssessment: RiskAssessment,
  resources: ReturnType<typeof useHospitalStore.getState>['resources']
): { decision: AllocationDecision; reasoning: string } {
  const effectiveSeverity = riskAssessment.override ? 'critical' : triageResult.severity;

  // Critical patients
  if (effectiveSeverity === 'critical') {
    if (resources.icuBeds.available > 0) {
      return {
        decision: 'ICU',
        reasoning: 'Critical patient allocated to ICU based on severity and available capacity',
      };
    } else if (resources.wardBeds.available > 0) {
      return {
        decision: 'Ward',
        reasoning: 'ICU full - Critical patient placed in ward with enhanced monitoring',
      };
    } else {
      return {
        decision: 'Refer',
        reasoning: 'No beds available - Patient should be referred to another facility',
      };
    }
  }

  // Serious patients
  if (effectiveSeverity === 'serious') {
    if (resources.wardBeds.available > 0) {
      return {
        decision: 'Ward',
        reasoning: 'Serious patient allocated to ward for monitoring and treatment',
      };
    } else if (resources.icuBeds.available > 2) {
      return {
        decision: 'ICU',
        reasoning: 'Ward full but ICU has capacity - temporary ICU placement',
      };
    } else {
      return {
        decision: 'Wait',
        reasoning: 'Resources constrained - Patient in priority queue for next available bed',
      };
    }
  }

  // Stable patients
  if (effectiveSeverity === 'stable') {
    if (resources.wardBeds.available > 5) {
      return {
        decision: 'Ward',
        reasoning: 'Stable patient with adequate symptoms for ward observation',
      };
    } else {
      return {
        decision: 'Wait',
        reasoning: 'Stable patient in queue - resources prioritized for critical cases',
      };
    }
  }

  // Non-urgent
  return {
    decision: 'Wait',
    reasoning: 'Non-urgent case - Patient can wait or be directed to outpatient services',
  };
}

export function processPatient(patient: Patient, resources: ReturnType<typeof useHospitalStore.getState>['resources']) {
  const triageResult = triagePatient(patient);
  const riskAssessment = assessRisk(patient, triageResult);
  const allocation = allocateResources(patient, triageResult, riskAssessment, resources);

  return {
    ...patient,
    triageResult,
    riskAssessment,
    allocationDecision: allocation.decision,
    status: 'triaged' as const,
  };
}
