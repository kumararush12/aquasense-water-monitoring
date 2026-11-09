/**
 * AquaSense Water Quality Analysis Engine
 * Deterministic, rule-based scientific screening analyzer
 */

import {
  WaterSample,
  ScreeningThresholds,
  WaterAnalysisResult,
  ParameterEvaluation,
  OverallStatus,
  WaterQualityIndex,
} from '../types/water';

export const DEFAULT_THRESHOLDS: ScreeningThresholds = {
  phMin: 6.5,
  phMax: 8.5,
  tdsMax: 500, // EPA Secondary Maximum Contaminant Level (mg/L)
  turbidityMax: 5.0, // World Health Organization aesthetic guideline (NTU)
  tempOptimalMin: 10.0,
  tempOptimalMax: 25.0,
};

export const SCIENTIFIC_DISCLAIMER =
  'IMPORTANT SCIENTIFIC DISCLAIMER: AquaSense provides preliminary screening based on four physical-chemical indicator parameters (pH, TDS, turbidity, and temperature). These parameters CANNOT establish drinking water potability on their own. Pathogenic microorganisms (such as E. coli, Cryptosporidium, and viruses), toxic heavy metals (such as lead, arsenic, and cadmium), and synthetic chemical pollutants (pesticides, PFAS) require specialized certified laboratory testing to confirm microbiological and toxicological safety.';

/**
 * Calculates a composite Water Quality Index (WQI) score (0–100)
 * based on weighted sub-indices of pH, TDS, Turbidity, and Temperature
 */
export function calculateWQI(
  ph: number,
  tds: number,
  turbidity: number,
  temperature: number,
  thresholds: ScreeningThresholds = DEFAULT_THRESHOLDS
): WaterQualityIndex {
  // 1. pH Sub-Index (Weight: 30%)
  const phDiff = Math.abs(ph - 7.0);
  let qPh = Math.max(0, 100 - phDiff * 25);
  if (ph < 5.0 || ph > 9.5) qPh = Math.max(0, 40 - (Math.abs(ph - 7.0) - 2.5) * 20);

  // 2. TDS Sub-Index (Weight: 25%)
  let qTds = 100;
  if (tds > 250) {
    qTds = Math.max(0, 100 - ((tds - 250) / 1250) * 100);
  }

  // 3. Turbidity Sub-Index (Weight: 30%)
  let qTurb = 100;
  if (turbidity > 1.0) {
    qTurb = Math.max(0, 100 - ((turbidity - 1.0) / 30) * 100);
  }

  // 4. Temperature Sub-Index (Weight: 15%)
  let qTemp = 100;
  if (temperature < 12) {
    qTemp = Math.max(40, 100 - (12 - temperature) * 5);
  } else if (temperature > 22) {
    qTemp = Math.max(20, 100 - (temperature - 22) * 4);
  }

  const score = Math.max(0, Math.min(100, Math.round(qPh * 0.30 + qTds * 0.25 + qTurb * 0.30 + qTemp * 0.15)));

  let grade: 'A' | 'B' | 'C' | 'D' | 'E' = 'A';
  let rating: WaterQualityIndex['rating'] = 'Excellent / Pristine';
  let description = 'Optimal chemical balance, low dissolved mineral solids, and high optical clarity.';

  if (score >= 90) {
    grade = 'A';
    rating = 'Excellent / Pristine';
    description = 'Exceptional physical-chemical equilibrium across all measured indicators.';
  } else if (score >= 75) {
    grade = 'B';
    rating = 'Good';
    description = 'Well within acceptable baseline screening limits; minor parameter variations.';
  } else if (score >= 60) {
    grade = 'C';
    rating = 'Fair / Moderate';
    description = 'Moderate departure from baseline; surveillance or basic treatment advised.';
  } else if (score >= 40) {
    grade = 'D';
    rating = 'Marginal / Impaired';
    description = 'One or more indicators exhibit significant divergence; remediation required.';
  } else {
    grade = 'E';
    rating = 'Poor / Severe';
    description = 'Severely compromised physical-chemical characteristics; unfit without comprehensive purification.';
  }

  return { score, grade, rating, description };
}

/**
 * Analyzes a water sample using configurable screening thresholds
 */
export function analyzeWaterSample(
  sample: Partial<WaterSample>,
  thresholds: ScreeningThresholds = DEFAULT_THRESHOLDS
): WaterAnalysisResult {
  const evaluations: ParameterEvaluation[] = [];
  const failedParameters: string[] = [];
  const passedParameters: string[] = [];
  const recommendations: string[] = [];

  // Check completeness
  const isComplete =
    sample.ph !== undefined &&
    !isNaN(sample.ph) &&
    sample.tds !== undefined &&
    !isNaN(sample.tds) &&
    sample.turbidity !== undefined &&
    !isNaN(sample.turbidity) &&
    sample.temperature !== undefined &&
    !isNaN(sample.temperature);

  if (!isComplete) {
    return {
      overallStatus: 'INCOMPLETE DATA',
      evaluations: [],
      failedParameters: ['Missing mandatory parameter fields'],
      passedParameters: [],
      summaryProse:
        'The water sample record lacks one or more vital parameter values. Complete readings for pH, TDS, Turbidity, and Temperature are required for rule-based screening.',
      recommendations: [
        'Collect and record missing physical-chemical sensor readings.',
      ],
      disclaimer: SCIENTIFIC_DISCLAIMER,
      sample: sample as WaterSample,
      thresholdsUsed: thresholds,
      wqi: {
        score: 0,
        grade: 'E',
        rating: 'Poor / Severe',
        description: 'Incomplete parameters prevented WQI calculation.',
      },
    };
  }

  const ph = sample.ph!;
  const tds = sample.tds!;
  const turbidity = sample.turbidity!;
  const temp = sample.temperature!;

  // 1. pH Evaluation
  let phStatus: 'WITHIN_RANGE' | 'NEEDS_ATTENTION' = 'WITHIN_RANGE';
  let phClassification = 'Neutral / Balanced';
  let phExplanation = '';
  let phSeverity: 'normal' | 'moderate' | 'critical' = 'normal';
  let phDeviation = 'Within baseline';

  if (ph < thresholds.phMin) {
    phStatus = 'NEEDS_ATTENTION';
    if (ph < 5.0) {
      phClassification = 'Strongly Acidic';
      phSeverity = 'critical';
      phExplanation = `pH ${ph.toFixed(2)} is severely below the reference range (${thresholds.phMin}–${thresholds.phMax}). High acidity accelerates metal pipe corrosion, leaches toxic heavy metals (such as copper and lead), and can severely harm aquatic biodiversity.`;
      recommendations.push(
        'Implement neutralization treatment using calcium carbonate (limestone) or sodium hydroxide injection.'
      );
      recommendations.push(
        'Inspect distribution piping for corrosion and test for leached copper and lead.'
      );
    } else {
      phClassification = 'Moderately Acidic';
      phSeverity = 'moderate';
      phExplanation = `pH ${ph.toFixed(2)} is slightly below the recommended screening baseline (${thresholds.phMin}–${thresholds.phMax}). May cause slight pipe corrosion and sour taste.`;
      recommendations.push(
        'Consider limestone contact filtration or alkaline buffering to elevate pH toward neutral (7.0).'
      );
    }
    phDeviation = `${(thresholds.phMin - ph).toFixed(2)} units below minimum threshold`;
    failedParameters.push('pH');
  } else if (ph > thresholds.phMax) {
    phStatus = 'NEEDS_ATTENTION';
    if (ph > 9.5) {
      phClassification = 'Strongly Alkaline';
      phSeverity = 'critical';
      phExplanation = `pH ${ph.toFixed(2)} is significantly above the reference ceiling (${thresholds.phMin}–${thresholds.phMax}). High alkalinity imparts a bitter, soda-like taste, promotes rapid mineral scale formation in pipes and heating appliances, and decreases chlorine disinfection efficiency.`;
      recommendations.push(
        'Utilize mild acid dosing (such as dilute food-grade citric or sulfuric acid in controlled treatment) or CO2 injection to lower pH.'
      );
    } else {
      phClassification = 'Moderately Alkaline';
      phSeverity = 'moderate';
      phExplanation = `pH ${ph.toFixed(2)} is above the reference ceiling (${thresholds.phMin}–${thresholds.phMax}). Can contribute to mineral encrustation and scale buildup on plumbing fixtures.`;
      recommendations.push(
        'Monitor scaling tendencies and evaluate acid buffering or water softening.'
      );
    }
    phDeviation = `${(ph - thresholds.phMax).toFixed(2)} units above maximum threshold`;
    failedParameters.push('pH');
  } else {
    phClassification =
      ph >= 6.8 && ph <= 7.4 ? 'Optimal Neutral' : 'Acceptable Reference Range';
    phExplanation = `pH ${ph.toFixed(2)} is within the standard reference corridor (${thresholds.phMin}–${thresholds.phMax}). Indicates balanced hydrogen-ion concentration, safe for non-corrosive conveyance and healthy aquatic balance.`;
    passedParameters.push('pH');
  }

  evaluations.push({
    parameter: 'ph',
    displayName: 'pH (Potential of Hydrogen)',
    value: ph,
    unit: 'pH',
    referenceRange: `${thresholds.phMin} – ${thresholds.phMax}`,
    status: phStatus,
    classification: phClassification,
    explanation: phExplanation,
    severity: phSeverity,
    deviation: phDeviation,
  });

  // 2. TDS Evaluation
  let tdsStatus: 'WITHIN_RANGE' | 'NEEDS_ATTENTION' = 'WITHIN_RANGE';
  let tdsClassification = 'Acceptable Dissolved Solids';
  let tdsExplanation = '';
  let tdsSeverity: 'normal' | 'moderate' | 'critical' = 'normal';
  let tdsDeviation = 'Within baseline';

  if (tds > thresholds.tdsMax) {
    tdsStatus = 'NEEDS_ATTENTION';
    if (tds > 1000) {
      tdsClassification = 'Very High Mineral / Saline Content';
      tdsSeverity = 'critical';
      tdsExplanation = `TDS of ${Math.round(tds)} mg/L exceeds both the screening threshold (${thresholds.tdsMax} mg/L) and standard potable guidance limits (1000 mg/L). Indicates elevated dissolved salts, calcium, carbonates, or industrial runoff, resulting in brackish taste, heavy scaling, and potential osmotic stress.`;
      recommendations.push(
        'Deploy membrane separation technologies such as high-pressure Reverse Osmosis (RO) or Electrodialysis.'
      );
      recommendations.push(
        'Conduct ionic chromatography to identify specific dissolved ions (sodium, sulfates, chlorides, nitrates).'
      );
    } else {
      tdsClassification = 'Elevated Dissolved Solids';
      tdsSeverity = 'moderate';
      tdsExplanation = `TDS of ${Math.round(tds)} mg/L is above the demonstration aesthetic threshold (${thresholds.tdsMax} mg/L). May cause hard water deposits, aesthetic mineral tastes, and reduced appliance lifespan.`;
      recommendations.push(
        'Assess whether ion-exchange water softening or point-of-use reverse osmosis is needed for downstream applications.'
      );
    }
    tdsDeviation = `${Math.round(tds - thresholds.tdsMax)} mg/L above maximum threshold`;
    failedParameters.push('TDS');
  } else {
    if (tds < 50) {
      tdsClassification = 'Low Mineral (Soft / Rainwater)';
      tdsExplanation = `TDS of ${Math.round(tds)} mg/L indicates very low dissolved mineral content. While crystal clear, ultra-low TDS water can be aggressive/corrosive to metallic plumbing and has a flat taste.`;
    } else if (tds <= 300) {
      tdsClassification = 'Excellent Dissolved Solids Balance';
      tdsExplanation = `TDS of ${Math.round(tds)} mg/L is in the ideal range (<300 mg/L) for crisp palatability and low scaling propensity. Well within the ${thresholds.tdsMax} mg/L screening limit.`;
    } else {
      tdsClassification = 'Good Reference Range';
      tdsExplanation = `TDS of ${Math.round(tds)} mg/L is within the acceptable screening limit of ${thresholds.tdsMax} mg/L.`;
    }
    passedParameters.push('TDS');
  }

  evaluations.push({
    parameter: 'tds',
    displayName: 'Total Dissolved Solids (TDS)',
    value: tds,
    unit: 'mg/L',
    referenceRange: `≤ ${thresholds.tdsMax} mg/L`,
    status: tdsStatus,
    classification: tdsClassification,
    explanation: tdsExplanation,
    severity: tdsSeverity,
    deviation: tdsDeviation,
  });

  // 3. Turbidity Evaluation
  let turbStatus: 'WITHIN_RANGE' | 'NEEDS_ATTENTION' = 'WITHIN_RANGE';
  let turbClassification = 'Clear Water';
  let turbExplanation = '';
  let turbSeverity: 'normal' | 'moderate' | 'critical' = 'normal';
  let turbDeviation = 'Within baseline';

  if (turbidity > thresholds.turbidityMax) {
    turbStatus = 'NEEDS_ATTENTION';
    if (turbidity > 15.0) {
      turbClassification = 'Severely Cloudy / High Suspended Solids';
      turbSeverity = 'critical';
      turbExplanation = `Turbidity of ${turbidity.toFixed(1)} NTU substantially exceeds the screening limit of ${thresholds.turbidityMax} NTU. High turbidity shields waterborne pathogens from UV and chlorination disinfection, clogs filters, and indicates surface runoff, erosion, or algal blooms.`;
      recommendations.push(
        'Apply rapid chemical coagulation (e.g. alum or polyaluminum chloride) followed by flocculation and sedimentation.'
      );
      recommendations.push(
        'Utilize multi-media dual-sand filtration and microfiltration prior to any chemical disinfection.'
      );
    } else {
      turbClassification = 'Moderately Turbid';
      turbSeverity = 'moderate';
      turbExplanation = `Turbidity of ${turbidity.toFixed(1)} NTU exceeds the demonstration reference of ${thresholds.turbidityMax} NTU. Noticeable haziness due to suspended clays, silts, or organic colloidal matter.`;
      recommendations.push(
        'Employ cartridge or slow sand filtration to clarify the water column.'
      );
    }
    turbDeviation = `${(turbidity - thresholds.turbidityMax).toFixed(1)} NTU above limit`;
    failedParameters.push('Turbidity');
  } else {
    if (turbidity < 1.0) {
      turbClassification = 'Crystal Clear (High Clarity)';
      turbExplanation = `Turbidity of ${turbidity.toFixed(2)} NTU indicates high optical transparency, well beneath the ${thresholds.turbidityMax} NTU guideline. Highly suitable for efficient UV penetration and disinfection.`;
    } else {
      turbClassification = 'Acceptable Screening Clarity';
      turbExplanation = `Turbidity of ${turbidity.toFixed(1)} NTU is within the ${thresholds.turbidityMax} NTU threshold. Water shows adequate physical clarity.`;
    }
    passedParameters.push('Turbidity');
  }

  evaluations.push({
    parameter: 'turbidity',
    displayName: 'Turbidity (Optical Clarity)',
    value: turbidity,
    unit: 'NTU',
    referenceRange: `≤ ${thresholds.turbidityMax} NTU`,
    status: turbStatus,
    classification: turbClassification,
    explanation: turbExplanation,
    severity: turbSeverity,
    deviation: turbDeviation,
  });

  // 4. Temperature Evaluation
  // Temperature influences oxygen solubility, chemical reaction rate, and microbial growth
  let tempStatus: 'WITHIN_RANGE' | 'NEEDS_ATTENTION' = 'WITHIN_RANGE';
  let tempClassification = 'Normal Ambient / Fresh';
  let tempExplanation = '';
  let tempSeverity: 'normal' | 'moderate' | 'critical' = 'normal';
  let tempDeviation = 'Within baseline';

  if (temp < thresholds.tempOptimalMin) {
    tempClassification = 'Cold Water Temperature';
    tempExplanation = `Temperature of ${temp.toFixed(1)}°C provides high dissolved oxygen retention capacity and suppresses biological activity, though it may slow down chemical coagulation treatment kinetics.`;
    tempDeviation = `${(thresholds.tempOptimalMin - temp).toFixed(1)}°C below standard ambient`;
  } else if (temp > thresholds.tempOptimalMax) {
    if (temp > 32.0) {
      tempStatus = 'NEEDS_ATTENTION';
      tempClassification = 'Elevated Thermal Range';
      tempSeverity = 'moderate';
      tempExplanation = `Temperature of ${temp.toFixed(1)}°C is elevated. Warm water carries significantly lower dissolved oxygen (DO), accelerates microbial and biofilm reproduction in distribution networks, and promotes bacterial colonization (e.g. Legionella).`;
      recommendations.push(
        'Inspect for thermal discharge sources and maintain active circulation and secondary disinfectant residual.'
      );
      tempDeviation = `${(temp - thresholds.tempOptimalMax).toFixed(1)}°C above recommended range`;
      failedParameters.push('Temperature');
    } else {
      tempClassification = 'Warm Ambient Range';
      tempExplanation = `Temperature of ${temp.toFixed(1)}°C is moderately warm. Temperature governs biochemical reaction rates and gas solubility (lower oxygen saturation at higher temps).`;
    }
  } else {
    tempClassification = 'Moderate / Optimal Ambient Range';
    tempExplanation = `Temperature of ${temp.toFixed(1)}°C is in the standard ambient bracket (${thresholds.tempOptimalMin}°C–${thresholds.tempOptimalMax}°C). Provides balanced biological stability and gas solubility.`;
  }

  if (tempStatus === 'WITHIN_RANGE') {
    passedParameters.push('Temperature');
  }

  evaluations.push({
    parameter: 'temperature',
    displayName: 'Water Temperature',
    value: temp,
    unit: '°C',
    referenceRange: `${thresholds.tempOptimalMin} – ${thresholds.tempOptimalMax} °C`,
    status: tempStatus,
    classification: tempClassification,
    explanation: tempExplanation,
    severity: tempSeverity,
    deviation: tempDeviation,
  });

  // Determine Overall Status
  let overallStatus: OverallStatus = 'WITHIN DEMONSTRATION RANGES';
  if (failedParameters.length > 0) {
    overallStatus = 'NEEDS ATTENTION';
  }

  // Generate Summary Prose
  let summaryProse = '';
  if (overallStatus === 'WITHIN DEMONSTRATION RANGES') {
    summaryProse = `All tested parameters (pH ${ph.toFixed(2)}, TDS ${Math.round(tds)} mg/L, Turbidity ${turbidity.toFixed(1)} NTU, Temperature ${temp.toFixed(1)}°C) satisfy the configured baseline screening ranges. The sample demonstrates balanced acidity, low dissolved mineral solids, and high optical clarity.`;
    if (recommendations.length === 0) {
      recommendations.push(
        'Maintain regular parameter surveillance to detect seasonal or watershed fluctuations.'
      );
      recommendations.push(
        'Conduct periodic certified laboratory testing for microbiological pathogens (coliforms/E. coli) and heavy metals.'
      );
    }
  } else {
    summaryProse = `The sample flagged ${failedParameters.length} parameter(s) requiring attention: ${failedParameters.join(', ')}. Divergences from the demonstration screening standards require investigation and possible remediation before use.`;
  }

  // Compute Water Quality Index (WQI)
  const wqi = calculateWQI(ph, tds, turbidity, temp, thresholds);

  return {
    overallStatus,
    evaluations,
    failedParameters,
    passedParameters,
    summaryProse,
    recommendations,
    disclaimer: SCIENTIFIC_DISCLAIMER,
    sample: sample as WaterSample,
    thresholdsUsed: thresholds,
    wqi,
  };
}
