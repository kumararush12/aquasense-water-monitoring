/**
 * AquaSense Water Testing & Diagnostic System
 * Form with real-time validation, automatic sample ID generator, rule-based analysis, and results panel
 */

import React, { useState } from 'react';
import {
  FlaskConical,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Save,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  WaterSample,
  ScreeningThresholds,
  WaterAnalysisResult,
} from '../types/water';
import { analyzeWaterSample } from '../utils/analysisEngine';
import { generateSampleId, saveSample } from '../utils/storage';
import { generatePDFReport } from '../utils/pdfGenerator';

interface TestingViewProps {
  thresholds: ScreeningThresholds;
  onSampleSaved: (sample: WaterSample) => void;
  onOpenReport: (sample: WaterSample) => void;
  onNavigate: (tab: string) => void;
  onNotify: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
}

interface FormState {
  id: string;
  name: string;
  location: string;
  dateTime: string;
  ph: string;
  tds: string;
  turbidity: string;
  temperature: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  location?: string;
  dateTime?: string;
  ph?: string;
  tds?: string;
  turbidity?: string;
  temperature?: string;
}

export const TestingView: React.FC<TestingViewProps> = ({
  thresholds,
  onSampleSaved,
  onOpenReport,
  onNavigate,
  onNotify,
}) => {
  const getInitialForm = (): FormState => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    return {
      id: generateSampleId(),
      name: '',
      location: '',
      dateTime: localIso,
      ph: '',
      tds: '',
      turbidity: '',
      temperature: '',
      notes: '',
    };
  };

  const [form, setForm] = useState<FormState>(getInitialForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [analysisResult, setAnalysisResult] = useState<WaterAnalysisResult | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Quick Preset Scenarios for Rapid Testing
  const presets = [
    {
      label: 'Standard Baseline (Clean Tap)',
      data: {
        name: 'Municipal Tap Baseline Test',
        location: 'Clean Water District Meter 1',
        ph: '7.20',
        tds: '250',
        turbidity: '2.0',
        temperature: '25.0',
        notes: 'Routine baseline screening verification sample.',
      },
    },
    {
      label: 'Acidic Mine / Creek Drainage',
      data: {
        name: 'Acidic Creek Inflow',
        location: 'Abandoned Quarry North Outfall',
        ph: '4.50',
        tds: '680',
        turbidity: '6.5',
        temperature: '18.0',
        notes: 'Noticeable sulfuric tint; acidic drainage simulation.',
      },
    },
    {
      label: 'Turbid Storm Runoff',
      data: {
        name: 'Stormwater Surface Inundation',
        location: 'Bridge Confluence Basin - Pier 4',
        ph: '7.10',
        tds: '380',
        turbidity: '24.5',
        temperature: '21.0',
        notes: 'Heavy silt and clay suspension following thunderstorm.',
      },
    },
    {
      label: 'High TDS Mineral Well',
      data: {
        name: 'Deep Saline Aquifer Well #9',
        location: 'Valley Agricultural Borehole',
        ph: '8.10',
        tds: '950',
        turbidity: '1.2',
        temperature: '22.5',
        notes: 'Heavy mineral taste and visible calcium scale deposits.',
      },
    },
  ];

  const handleApplyPreset = (preset: (typeof presets)[0]) => {
    setForm((prev) => ({
      ...prev,
      name: preset.data.name,
      location: preset.data.location,
      ph: preset.data.ph,
      tds: preset.data.tds,
      turbidity: preset.data.turbidity,
      temperature: preset.data.temperature,
      notes: preset.data.notes,
    }));
    setErrors({});
    setAnalysisResult(null);
    setIsSaved(false);
  };

  const handleRegenerateId = () => {
    setForm((prev) => ({ ...prev, id: generateSampleId() }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.name.trim()) {
      errs.name = 'Sample name is required (e.g., "Reservoir Inlet").';
    }
    if (!form.location.trim()) {
      errs.location = 'Sampling location is required.';
    }
    if (!form.dateTime) {
      errs.dateTime = 'Sampling date and time are required.';
    }

    // pH validation: 0 to 14
    if (form.ph.trim() === '') {
      errs.ph = 'pH value is required.';
    } else {
      const phNum = parseFloat(form.ph);
      if (isNaN(phNum) || phNum < 0 || phNum > 14) {
        errs.ph = 'pH must be a valid number between 0.00 and 14.00.';
      }
    }

    // TDS validation: >= 0
    if (form.tds.trim() === '') {
      errs.tds = 'TDS value is required.';
    } else {
      const tdsNum = parseFloat(form.tds);
      if (isNaN(tdsNum) || tdsNum < 0) {
        errs.tds = 'TDS cannot be negative (e.g. 50 - 2000 mg/L).';
      }
    }

    // Turbidity validation: >= 0
    if (form.turbidity.trim() === '') {
      errs.turbidity = 'Turbidity value is required.';
    } else {
      const turbNum = parseFloat(form.turbidity);
      if (isNaN(turbNum) || turbNum < 0) {
        errs.turbidity = 'Turbidity cannot be negative (e.g. 0.1 - 50 NTU).';
      }
    }

    // Temperature validation: valid number
    if (form.temperature.trim() === '') {
      errs.temperature = 'Temperature is required.';
    } else {
      const tempNum = parseFloat(form.temperature);
      if (isNaN(tempNum)) {
        errs.temperature = 'Temperature must be a valid numerical value in °C.';
      } else if (tempNum < -20 || tempNum > 100) {
        errs.temperature = 'Temperature is out of reasonable liquid range (-20 to 100 °C).';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      onNotify('Please correct highlighted validation errors in the form.', 'warning');
      return;
    }

    const sampleToAnalyze: WaterSample = {
      id: form.id,
      name: form.name.trim(),
      location: form.location.trim(),
      timestamp: new Date(form.dateTime).toISOString(),
      ph: parseFloat(form.ph),
      tds: parseFloat(form.tds),
      turbidity: parseFloat(form.turbidity),
      temperature: parseFloat(form.temperature),
      notes: form.notes.trim() || undefined,
      isDemo: false,
      createdAt: Date.now(),
    };

    const result = analyzeWaterSample(sampleToAnalyze, thresholds);
    setAnalysisResult(result);
    setIsSaved(false);
    onNotify('Water sample analyzed successfully.', 'info');
  };

  const handleSaveToHistory = () => {
    if (!analysisResult) return;
    saveSample(analysisResult.sample);
    setIsSaved(true);
    onSampleSaved(analysisResult.sample);
    onNotify(`Sample ${analysisResult.sample.id} saved to historical records!`, 'success');
  };

  const handleDownloadPDF = () => {
    if (!analysisResult) return;
    try {
      generatePDFReport(analysisResult.sample);
      onNotify('PDF Diagnostic Report generated and downloaded.', 'success');
    } catch (err) {
      console.error(err);
      onNotify('Failed to generate PDF report.', 'error');
    }
  };

  const handleResetForm = () => {
    setForm(getInitialForm());
    setErrors({});
    setAnalysisResult(null);
    setIsSaved(false);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Water Sample Testing & Diagnostic Engine
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Record physical-chemical sensor readings, execute rule-based compliance screening, and compile analytical reports
        </p>
      </div>

      {/* Quick Test Presets */}
      <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Rapid Testing Scenarios (Click to autofill sample parameters):</span>
          </span>
          <span className="text-slate-500 text-[11px]">One-click demonstration profiles</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 text-slate-700 dark:text-slate-200 rounded-lg shadow-2xs transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Testing Form */}
      <form onSubmit={handleAnalyze} className="space-y-6">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Sample Metadata & Custody Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Sample ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Sample ID (Auto-Generated)
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateId}
                  title="Generate New ID"
                  className="text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 p-0.5 rounded"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={form.id}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-700 dark:text-slate-300 cursor-not-allowed select-all"
              />
            </div>

            {/* Sample Name */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sample Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. North Reservoir Intake A"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.name
                    ? 'border-rose-400 bg-rose-50/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.name && (
                <p className="text-rose-500 text-[11px] mt-1">{errors.name}</p>
              )}
            </div>

            {/* Sample Location */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sampling Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Basin Valve 3B, River Mile 12"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.location
                    ? 'border-rose-400 bg-rose-50/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.location && (
                <p className="text-rose-500 text-[11px] mt-1">{errors.location}</p>
              )}
            </div>

            {/* Sampling Date and Time */}
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Collection Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.dateTime}
                onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                className={`w-full md:w-1/3 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-lg font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.dateTime
                    ? 'border-rose-400'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.dateTime && (
                <p className="text-rose-500 text-[11px] mt-1">{errors.dateTime}</p>
              )}
            </div>
          </div>

          {/* Physical-Chemical Parameters Grid */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Physical-Chemical Sensor Readings
              </h2>
              <span className="text-[11px] text-slate-500">
                All 4 indicator values are mandatory for screening
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* pH Input */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    pH Value <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">0.00 – 14.00</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="14"
                    placeholder="7.20"
                    value={form.ph}
                    onChange={(e) => setForm({ ...form, ph: e.target.value })}
                    className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errors.ph ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] text-slate-400 font-mono">
                    pH
                  </span>
                </div>
                {errors.ph && (
                  <p className="text-rose-500 text-[11px] mt-1">{errors.ph}</p>
                )}
                <p className="text-[10px] text-slate-500">Reference: {thresholds.phMin}–{thresholds.phMax}</p>
              </div>

              {/* TDS Input */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Total Dissolved Solids <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">mg/L (ppm)</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="250"
                    value={form.tds}
                    onChange={(e) => setForm({ ...form, tds: e.target.value })}
                    className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errors.tds ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] text-slate-400 font-mono">
                    mg/L
                  </span>
                </div>
                {errors.tds && (
                  <p className="text-rose-500 text-[11px] mt-1">{errors.tds}</p>
                )}
                <p className="text-[10px] text-slate-500">Limit: ≤ {thresholds.tdsMax} mg/L</p>
              </div>

              {/* Turbidity Input */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Turbidity (Clarity) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">NTU</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="2.00"
                    value={form.turbidity}
                    onChange={(e) => setForm({ ...form, turbidity: e.target.value })}
                    className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errors.turbidity ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] text-slate-400 font-mono">
                    NTU
                  </span>
                </div>
                {errors.turbidity && (
                  <p className="text-rose-500 text-[11px] mt-1">{errors.turbidity}</p>
                )}
                <p className="text-[10px] text-slate-500">Limit: ≤ {thresholds.turbidityMax} NTU</p>
              </div>

              {/* Temperature Input */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Water Temperature <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">°C</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="25.0"
                    value={form.temperature}
                    onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                    className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errors.temperature ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] text-slate-400 font-mono">
                    °C
                  </span>
                </div>
                {errors.temperature && (
                  <p className="text-rose-500 text-[11px] mt-1">{errors.temperature}</p>
                )}
                <p className="text-[10px] text-slate-500">Corridor: {thresholds.tempOptimalMin}–{thresholds.tempOptimalMax}°C</p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="pt-2">
            <label className="block font-semibold text-xs text-slate-700 dark:text-slate-300 mb-1">
              Field Observations & Sensory Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Odorless, slight yellow tint, sampling probe calibrated with pH 7.0 buffer..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetForm}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Form</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 rounded-lg shadow-md shadow-cyan-600/25 transition-all"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Analyze Water Quality</span>
            </button>
          </div>
        </div>
      </form>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            {/* Result Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Screening Diagnosis Complete
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Analytical Evaluation for {analysisResult.sample.name} ({analysisResult.sample.id})
                </h3>
              </div>

              {/* Status & WQI Badge Cluster */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">
                  <span className="text-slate-500">Water Quality Index:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{analysisResult.wqi.score}/100</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    analysisResult.wqi.grade === 'A'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : analysisResult.wqi.grade === 'B'
                      ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                      : analysisResult.wqi.grade === 'C'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}>
                    Grade {analysisResult.wqi.grade}
                  </span>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                    analysisResult.overallStatus === 'WITHIN DEMONSTRATION RANGES'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  }`}
                >
                  {analysisResult.overallStatus === 'WITHIN DEMONSTRATION RANGES' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>{analysisResult.overallStatus}</span>
                </div>
              </div>
            </div>

            {/* Prose Summary */}
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800">
              {analysisResult.summaryProse}
            </p>

            {/* Parameter Cards Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysisResult.evaluations.map((item) => (
                <div
                  key={item.parameter}
                  className={`p-4 rounded-xl border space-y-2 ${
                    item.status === 'WITHIN_RANGE'
                      ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                      : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.displayName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.status === 'WITHIN_RANGE'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {item.status === 'WITHIN_RANGE' ? 'Within Range' : 'Attention'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {item.value.toFixed(item.parameter === 'tds' ? 0 : 2)}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{item.unit}</span>
                    <span className="text-xs text-slate-400 font-mono">
                      (Ref: {item.referenceRange})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Recommendations */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Actionable Engineering & Environmental Recommendations
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {analysisResult.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scientific Disclaimer */}
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold">Important Scientific Notice: </span>
                {analysisResult.disclaimer}
              </div>
            </div>

            {/* Next Step Working Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveToHistory}
                  disabled={isSaved}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors ${
                    isSaved
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaved ? 'Sample Saved to History' : 'Save Result to History'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Download PDF Report</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenReport(analysisResult.sample)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  View Full Report Modal
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('history')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  <span>Go to Historical Archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
