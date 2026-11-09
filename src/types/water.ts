/**
 * AquaSense Water Quality Monitoring System
 * Core Data Models and Types
 */

export interface WaterSample {
  id: string; // e.g. AQ-2026-1042
  name: string; // e.g. "North Branch Reservoir"
  location: string; // e.g. "Station B - Intake Pipe"
  timestamp: string; // ISO 8601 string
  ph: number; // 0.0 - 14.0
  tds: number; // mg/L (ppm)
  turbidity: number; // NTU
  temperature: number; // °C
  notes?: string;
  isDemo?: boolean;
  createdAt: number;
}

export interface ScreeningThresholds {
  phMin: number; // default 6.5
  phMax: number; // default 8.5
  tdsMax: number; // default 500 mg/L
  turbidityMax: number; // default 5.0 NTU
  tempOptimalMin: number; // default 10.0 °C
  tempOptimalMax: number; // default 25.0 °C
}

export type OverallStatus =
  | 'WITHIN DEMONSTRATION RANGES'
  | 'NEEDS ATTENTION'
  | 'INCOMPLETE DATA';

export type ParameterStatus = 'WITHIN_RANGE' | 'NEEDS_ATTENTION';

export interface ParameterEvaluation {
  parameter: 'ph' | 'tds' | 'turbidity' | 'temperature';
  displayName: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: ParameterStatus;
  classification: string;
  explanation: string;
  severity: 'normal' | 'moderate' | 'critical';
  deviation?: string;
}

export interface WaterQualityIndex {
  score: number; // 0 to 100
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  rating: 'Excellent / Pristine' | 'Good' | 'Fair / Moderate' | 'Marginal / Impaired' | 'Poor / Severe';
  description: string;
}

export interface WaterAnalysisResult {
  overallStatus: OverallStatus;
  evaluations: ParameterEvaluation[];
  failedParameters: string[];
  passedParameters: string[];
  summaryProse: string;
  recommendations: string[];
  disclaimer: string;
  sample: WaterSample;
  thresholdsUsed: ScreeningThresholds;
  wqi: WaterQualityIndex;
}

export interface NotificationToast {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
}
