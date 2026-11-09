/**
 * AquaSense Multi-Sample Comparison Tool
 * Side-by-side comparison table, difference highlighting, and interactive comparative charts
 */

import React, { useState, useMemo } from 'react';
import {
  Scale,
  Plus,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { WaterSample, ScreeningThresholds } from '../types/water';
import { analyzeWaterSample } from '../utils/analysisEngine';
import { exportToCSV } from '../utils/storage';

interface ComparisonViewProps {
  samples: WaterSample[];
  thresholds: ScreeningThresholds;
  initialSelectedIds?: string[];
  onOpenReport: (sample: WaterSample) => void;
  onNavigate: (tab: string) => void;
  onNotify: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  samples,
  thresholds,
  initialSelectedIds = [],
  onOpenReport,
  onNavigate,
  onNotify,
}) => {
  // If initialSelectedIds provided and valid, use them; otherwise pick first 2-3 samples
  const defaultSelection = useMemo(() => {
    if (initialSelectedIds.length >= 2) {
      return initialSelectedIds.slice(0, 5);
    }
    return samples.slice(0, 3).map((s) => s.id);
  }, [initialSelectedIds, samples]);

  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelection);

  // Selected water samples
  const comparedSamples = useMemo(() => {
    return samples.filter((s) => selectedIds.includes(s.id));
  }, [samples, selectedIds]);

  // Available samples to add (not yet in comparison)
  const availableSamples = useMemo(() => {
    return samples.filter((s) => !selectedIds.includes(s.id));
  }, [samples, selectedIds]);

  const handleAddSample = (id: string) => {
    if (selectedIds.length >= 5) {
      onNotify('Comparison is limited to a maximum of 5 samples simultaneously.', 'warning');
      return;
    }
    setSelectedIds((prev) => [...prev, id]);
  };

  const handleRemoveSample = (id: string) => {
    if (selectedIds.length <= 1) {
      onNotify('Keep at least one sample in the comparison view.', 'info');
      return;
    }
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  // Comparative metrics and extremes
  const comparisonStats = useMemo(() => {
    if (comparedSamples.length === 0) return null;

    const phValues = comparedSamples.map((s) => s.ph);
    const tdsValues = comparedSamples.map((s) => s.tds);
    const turbValues = comparedSamples.map((s) => s.turbidity);
    const tempValues = comparedSamples.map((s) => s.temperature);

    return {
      phMin: Math.min(...phValues),
      phMax: Math.max(...phValues),
      phDelta: Math.max(...phValues) - Math.min(...phValues),

      tdsMin: Math.min(...tdsValues),
      tdsMax: Math.max(...tdsValues),
      tdsDelta: Math.max(...tdsValues) - Math.min(...tdsValues),

      turbMin: Math.min(...turbValues),
      turbMax: Math.max(...turbValues),
      turbDelta: Math.max(...turbValues) - Math.min(...turbValues),

      tempMin: Math.min(...tempValues),
      tempMax: Math.max(...tempValues),
      tempDelta: Math.max(...tempValues) - Math.min(...tempValues),
    };
  }, [comparedSamples]);

  // Chart data formatted for side-by-side Recharts
  const comparativeChartData = useMemo(() => {
    return [
      {
        parameter: 'pH (units)',
        ...Object.fromEntries(
          comparedSamples.map((s) => [s.name.substring(0, 15), s.ph])
        ),
      },
      {
        parameter: 'Turbidity (NTU)',
        ...Object.fromEntries(
          comparedSamples.map((s) => [s.name.substring(0, 15), s.turbidity])
        ),
      },
      {
        parameter: 'Temp (°C)',
        ...Object.fromEntries(
          comparedSamples.map((s) => [s.name.substring(0, 15), s.temperature])
        ),
      },
    ];
  }, [comparedSamples]);

  const tdsChartData = useMemo(() => {
    return comparedSamples.map((s) => ({
      name: s.name.length > 20 ? s.name.substring(0, 18) + '...' : s.name,
      tds: Math.round(s.tds),
      id: s.id,
    }));
  }, [comparedSamples]);

  const colors = ['#0891b2', '#0d9488', '#2563eb', '#d97706', '#7c3aed'];

  const handleExportComparison = () => {
    exportToCSV(comparedSamples, `AquaSense_Sample_Comparison.csv`);
    onNotify('Exported comparison dataset to CSV.', 'success');
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Water Quality Multi-Sample Comparison
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyze divergence, parameter variance, and treatment impact across multiple monitored water samples
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportComparison}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Comparison CSV</span>
          </button>
        </div>
      </div>

      {/* Sample Selector Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Currently Compared Samples ({comparedSamples.length} of max 5):
          </span>
          {availableSamples.length > 0 && selectedIds.length < 5 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Add sample:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddSample(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="" disabled>
                  Select sample to add...
                </option>
                {availableSamples.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Selected Sample Badges */}
        <div className="flex flex-wrap gap-2">
          {comparedSamples.map((sample, idx) => (
            <div
              key={sample.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <span className="font-semibold">{sample.name}</span>
              <span className="font-mono text-[11px] text-slate-400">({sample.id})</span>
              <button
                onClick={() => handleRemoveSample(sample.id)}
                className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors"
                title="Remove from comparison"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {comparedSamples.length > 0 ? (
        <>
          {/* Detailed Side-by-Side Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold w-48">Parameter Metric</th>
                  <th className="py-3 px-3 font-semibold w-32">Demonstration Ref</th>
                  {comparedSamples.map((sample, idx) => (
                    <th key={sample.id} className="py-3 px-4 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: colors[idx % colors.length] }}
                        />
                        <span className="truncate max-w-[140px]">{sample.name}</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 font-normal">
                        {sample.id}
                      </div>
                    </th>
                  ))}
                  {comparisonStats && comparedSamples.length >= 2 && (
                    <th className="py-3 px-4 font-semibold text-right bg-slate-100/50 dark:bg-slate-800/30">
                      Delta (Max - Min)
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {/* 1. Overall Status Row */}
                <tr className="bg-slate-50/50 dark:bg-slate-800/20 font-semibold">
                  <td className="py-3 px-4 text-slate-900 dark:text-white">
                    Overall Screening Result
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-normal text-[11px]">
                    All in range
                  </td>
                  {comparedSamples.map((sample) => {
                    const analysis = analyzeWaterSample(sample, thresholds);
                    const isPass =
                      analysis.overallStatus === 'WITHIN DEMONSTRATION RANGES';
                    return (
                      <td key={sample.id} className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isPass
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {isPass ? 'Within Range' : 'Attention'}
                        </span>
                      </td>
                    );
                  })}
                  {comparedSamples.length >= 2 && (
                    <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                      -
                    </td>
                  )}
                </tr>

                {/* 2. Water Quality Index Row */}
                <tr className="bg-slate-50/30 dark:bg-slate-800/10">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Water Quality Index (WQI)
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    0 – 100 Index
                  </td>
                  {comparedSamples.map((sample) => {
                    const analysis = analyzeWaterSample(sample, thresholds);
                    return (
                      <td key={sample.id} className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {analysis.wqi.score}/100
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              analysis.wqi.grade === 'A'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : analysis.wqi.grade === 'B'
                                ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                                : analysis.wqi.grade === 'C'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            Grade {analysis.wqi.grade}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                  {comparedSamples.length >= 2 && (
                    <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/30 text-[11px]">
                      Δ {Math.max(...comparedSamples.map((s) => analyzeWaterSample(s, thresholds).wqi.score)) - Math.min(...comparedSamples.map((s) => analyzeWaterSample(s, thresholds).wqi.score))} pts
                    </td>
                  )}
                </tr>

                {/* 2. pH Row */}
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    pH (Acidity / Alkalinity)
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    {thresholds.phMin} – {thresholds.phMax}
                  </td>
                  {comparedSamples.map((sample) => {
                    const isMin = comparisonStats?.phMin === sample.ph;
                    const isMax = comparisonStats?.phMax === sample.ph;
                    const isOutOfRange =
                      sample.ph < thresholds.phMin || sample.ph > thresholds.phMax;

                    return (
                      <td key={sample.id} className="py-3 px-4">
                        <span
                          className={`font-mono tabular-nums font-bold text-sm ${
                            isOutOfRange
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {sample.ph.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          {isMin && <span className="text-cyan-600">Lowest</span>}
                          {isMax && <span className="text-amber-600">Highest</span>}
                        </div>
                      </td>
                    );
                  })}
                  {comparisonStats && comparedSamples.length >= 2 && (
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/30">
                      Δ {comparisonStats.phDelta.toFixed(2)} pH
                    </td>
                  )}
                </tr>

                {/* 3. TDS Row */}
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    Total Dissolved Solids (TDS)
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    ≤ {thresholds.tdsMax} mg/L
                  </td>
                  {comparedSamples.map((sample) => {
                    const isMax = comparisonStats?.tdsMax === sample.tds;
                    const isOutOfRange = sample.tds > thresholds.tdsMax;

                    return (
                      <td key={sample.id} className="py-3 px-4">
                        <span
                          className={`font-mono tabular-nums font-bold text-sm ${
                            isOutOfRange
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {Math.round(sample.tds)} mg/L
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {isMax && <span className="text-amber-600">Highest mineral</span>}
                        </div>
                      </td>
                    );
                  })}
                  {comparisonStats && comparedSamples.length >= 2 && (
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/30">
                      Δ {Math.round(comparisonStats.tdsDelta)} mg/L
                    </td>
                  )}
                </tr>

                {/* 4. Turbidity Row */}
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    Turbidity (Optical Clarity)
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    ≤ {thresholds.turbidityMax} NTU
                  </td>
                  {comparedSamples.map((sample) => {
                    const isMax = comparisonStats?.turbMax === sample.turbidity;
                    const isOutOfRange = sample.turbidity > thresholds.turbidityMax;

                    return (
                      <td key={sample.id} className="py-3 px-4">
                        <span
                          className={`font-mono tabular-nums font-bold text-sm ${
                            isOutOfRange
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {sample.turbidity.toFixed(2)} NTU
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {isMax && <span className="text-rose-600">Cloudiest</span>}
                        </div>
                      </td>
                    );
                  })}
                  {comparisonStats && comparedSamples.length >= 2 && (
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/30">
                      Δ {comparisonStats.turbDelta.toFixed(2)} NTU
                    </td>
                  )}
                </tr>

                {/* 5. Temperature Row */}
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    Water Temperature
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    {thresholds.tempOptimalMin} – {thresholds.tempOptimalMax} °C
                  </td>
                  {comparedSamples.map((sample) => (
                    <td key={sample.id} className="py-3 px-4">
                      <span className="font-mono tabular-nums font-bold text-sm text-slate-900 dark:text-white">
                        {sample.temperature.toFixed(1)} °C
                      </span>
                    </td>
                  ))}
                  {comparisonStats && comparedSamples.length >= 2 && (
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/30">
                      Δ {comparisonStats.tempDelta.toFixed(1)} °C
                    </td>
                  )}
                </tr>

                {/* 6. Sampling Location */}
                <tr className="text-slate-500">
                  <td className="py-3 px-4">Sampling Location</td>
                  <td className="py-3 px-3">-</td>
                  {comparedSamples.map((sample) => (
                    <td key={sample.id} className="py-3 px-4 truncate max-w-[180px]">
                      {sample.location}
                    </td>
                  ))}
                  {comparedSamples.length >= 2 && (
                    <td className="py-3 px-4 bg-slate-100/50 dark:bg-slate-800/30"></td>
                  )}
                </tr>

                {/* 7. Report Action Link */}
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Detailed Report
                  </td>
                  <td className="py-3 px-3">-</td>
                  {comparedSamples.map((sample) => (
                    <td key={sample.id} className="py-3 px-4">
                      <button
                        onClick={() => onOpenReport(sample)}
                        className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        Open Full Report
                      </button>
                    </td>
                  ))}
                  {comparedSamples.length >= 2 && (
                    <td className="py-3 px-4 bg-slate-100/50 dark:bg-slate-800/30"></td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Visual Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TDS Comparison Bar Chart */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Dissolved Mineral Content (TDS) Comparison
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Threshold limit: ≤ {thresholds.tdsMax} mg/L
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-600">mg/L</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tdsChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-2 rounded bg-slate-900 text-white text-xs">
                              <div className="font-semibold">{data.name}</div>
                              <div className="font-mono text-cyan-400">
                                TDS: {data.tds} mg/L
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="tds" fill="#0891b2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* pH & Turbidity Multi-Parameter Chart */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Physical Parameters Comparison
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Side-by-side indicator scale across samples
                  </p>
                </div>
                <span className="text-xs font-mono text-teal-600">Multi-axis</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparativeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="parameter" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    {comparedSamples.map((sample, idx) => (
                      <Bar
                        key={sample.id}
                        dataKey={sample.name.substring(0, 15)}
                        fill={colors[idx % colors.length]}
                        radius={[3, 3, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <p className="text-xs text-slate-500">
            No samples selected for comparison. Add samples from above or from the Test History page.
          </p>
          <button
            onClick={() => onNavigate('history')}
            className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 rounded-lg"
          >
            Go to Historical Archive
          </button>
        </div>
      )}
    </div>
  );
};
