/**
 * AquaSense Main Dashboard View
 * Analytical KPIs, parameter averages, dynamic Recharts trends, and date filters
 */

import React, { useState, useMemo } from 'react';
import {
  Droplets,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  PlusCircle,
  FileSpreadsheet,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { WaterSample, ScreeningThresholds } from '../types/water';
import { analyzeWaterSample } from '../utils/analysisEngine';
import { exportToCSV } from '../utils/storage';

interface DashboardViewProps {
  samples: WaterSample[];
  thresholds: ScreeningThresholds;
  onNavigate: (tab: string) => void;
  onOpenReport: (sample: WaterSample) => void;
  onResetDemoData: () => void;
  onOpenSettings: () => void;
}

type DateFilter = 'today' | '7days' | '30days' | 'all';
type SourceFilter = 'all' | 'user' | 'demo';

export const DashboardView: React.FC<DashboardViewProps> = ({
  samples,
  thresholds,
  onNavigate,
  onOpenReport,
  onResetDemoData,
  onOpenSettings,
}) => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  // Filter samples based on date and source
  const filteredSamples = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;

    return samples.filter((sample) => {
      // Source filter
      if (sourceFilter === 'user' && sample.isDemo) return false;
      if (sourceFilter === 'demo' && !sample.isDemo) return false;

      // Date filter
      const sampleTime = new Date(sample.timestamp).getTime();
      if (dateFilter === 'today') {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        return sampleTime >= todayStart;
      }
      if (dateFilter === '7days') {
        return sampleTime >= now - dayMs * 7;
      }
      if (dateFilter === '30days') {
        return sampleTime >= now - dayMs * 30;
      }
      return true;
    });
  }, [samples, dateFilter, sourceFilter]);

  // Sort chronological for charts (oldest to newest)
  const chronologicalSamples = useMemo(() => {
    return [...filteredSamples].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [filteredSamples]);

  // Reverse for recent list (newest first)
  const recentSamples = useMemo(() => {
    return [...filteredSamples].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [filteredSamples]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = filteredSamples.length;
    if (total === 0) {
      return {
        total: 0,
        withinRange: 0,
        needsAttention: 0,
        latestSample: null,
        avgPh: 0,
        avgTds: 0,
        avgTurbidity: 0,
        avgTemp: 0,
        phTrend: 'flat' as const,
        tdsTrend: 'flat' as const,
        turbTrend: 'flat' as const,
        tempTrend: 'flat' as const,
      };
    }

    let withinRangeCount = 0;
    let sumPh = 0;
    let sumTds = 0;
    let sumTurbidity = 0;
    let sumTemp = 0;
    let sumWqi = 0;

    filteredSamples.forEach((sample) => {
      const analysis = analyzeWaterSample(sample, thresholds);
      if (analysis.overallStatus === 'WITHIN DEMONSTRATION RANGES') {
        withinRangeCount++;
      }
      sumPh += sample.ph;
      sumTds += sample.tds;
      sumTurbidity += sample.turbidity;
      sumTemp += sample.temperature;
      sumWqi += analysis.wqi.score;
    });

    const latest = recentSamples[0] || null;
    const previous = recentSamples[1] || null;

    const calcTrend = (current?: number, prev?: number) => {
      if (current === undefined || prev === undefined) return 'flat' as const;
      if (current > prev + 0.05) return 'up' as const;
      if (current < prev - 0.05) return 'down' as const;
      return 'flat' as const;
    };

    return {
      total,
      withinRange: withinRangeCount,
      needsAttention: total - withinRangeCount,
      latestSample: latest,
      avgPh: sumPh / total,
      avgTds: sumTds / total,
      avgTurbidity: sumTurbidity / total,
      avgTemp: sumTemp / total,
      avgWqi: Math.round(sumWqi / total),
      phTrend: calcTrend(latest?.ph, previous?.ph),
      tdsTrend: calcTrend(latest?.tds, previous?.tds),
      turbTrend: calcTrend(latest?.turbidity, previous?.turbidity),
      tempTrend: calcTrend(latest?.temperature, previous?.temperature),
    };
  }, [filteredSamples, recentSamples, thresholds]);

  // Chart data format
  const chartData = useMemo(() => {
    return chronologicalSamples.map((s) => {
      const d = new Date(s.timestamp);
      const label = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      return {
        id: s.id,
        name: s.name,
        timestamp: label,
        ph: Number(s.ph.toFixed(2)),
        tds: Math.round(s.tds),
        turbidity: Number(s.turbidity.toFixed(2)),
        temperature: Number(s.temperature.toFixed(1)),
        isDemo: s.isDemo,
      };
    });
  }, [chronologicalSamples]);

  // Distribution chart data
  const pieData = useMemo(() => {
    return [
      { name: 'Within Demonstration Range', value: stats.withinRange, color: '#06b6d4' },
      { name: 'Needs Attention', value: stats.needsAttention, color: '#f59e0b' },
    ];
  }, [stats]);

  const handleExport = () => {
    exportToCSV(filteredSamples, `AquaSense_Dashboard_Data_${dateFilter}.csv`);
  };

  const latest = stats.latestSample;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Water Quality Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time screening metrics, chronological trend analysis, and parameter evaluations
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setDateFilter(filter.id)}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  dateFilter === filter.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            {(
              [
                { id: 'all', label: 'All Records' },
                { id: 'user', label: 'Field/User' },
                { id: 'demo', label: 'Demo' },
              ] as const
            ).map((src) => (
              <button
                key={src.id}
                onClick={() => setSourceFilter(src.id)}
                className={`px-2 py-1 font-medium rounded-md transition-colors ${
                  sourceFilter === src.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {src.label}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <button
            onClick={handleExport}
            title="Export filtered records to CSV"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            onClick={() => onNavigate('test')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Test</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tests */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Tests Conducted</span>
            <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {stats.total}
            </div>
            {stats.total > 0 && (
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300">
                Mean WQI: {stats.avgWqi}/100
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>Active monitoring archive</span>
            {stats.latestSample && (
              <>
                <span>·</span>
                <span className="truncate">Latest: {new Date(stats.latestSample.timestamp).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Within Screening Range */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Within Screening Ranges</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {stats.withinRange}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {stats.total > 0
              ? `${Math.round((stats.withinRange / stats.total) * 100)}% of tested samples passed all thresholds`
              : 'No test records'}
          </div>
        </div>

        {/* Requiring Attention */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Requires Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {stats.needsAttention}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {stats.total > 0
              ? `${Math.round((stats.needsAttention / stats.total) * 100)}% outside configured screening ranges`
              : 'No test records'}
          </div>
        </div>

        {/* Latest Test Details */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Latest Monitored Sample</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          {latest ? (
            <div>
              <div
                onClick={() => onOpenReport(latest)}
                className="font-bold text-sm text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer truncate"
              >
                {latest.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                <span className="font-mono">{latest.id}</span>
                <span>·</span>
                <span className="truncate">{latest.location}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-1">No recorded samples yet</div>
          )}
        </div>
      </div>

      {/* Individual Parameter Cards (Latest Readings + Units + Trends) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Parameter Summary & Recent Readings
          </h2>
          <button
            onClick={onOpenSettings}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Configure References</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. pH Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                pH (Potential of Hydrogen)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Ref: {thresholds.phMin}–{thresholds.phMax}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {latest ? latest.ph.toFixed(2) : '--'}
                </span>
                <span className="ml-1 text-xs text-slate-500">pH</span>
              </div>
              {latest && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    latest.ph >= thresholds.phMin && latest.ph <= thresholds.phMax
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {latest.ph >= thresholds.phMin && latest.ph <= thresholds.phMax
                    ? 'In Range'
                    : 'Attention'}
                </span>
              )}
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Avg pH: {stats.avgPh > 0 ? stats.avgPh.toFixed(2) : '--'}</span>
              <span className="flex items-center gap-0.5">
                {stats.phTrend === 'up' && (
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
                )}
                {stats.phTrend === 'down' && (
                  <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
                )}
                {stats.phTrend === 'flat' && (
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="capitalize">{stats.phTrend} trend</span>
              </span>
            </div>
          </div>

          {/* 2. TDS Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Total Dissolved Solids
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Ref: ≤ {thresholds.tdsMax} mg/L
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {latest ? Math.round(latest.tds) : '--'}
                </span>
                <span className="ml-1 text-xs text-slate-500">mg/L</span>
              </div>
              {latest && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    latest.tds <= thresholds.tdsMax
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {latest.tds <= thresholds.tdsMax ? 'In Range' : 'Elevated'}
                </span>
              )}
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Avg TDS: {stats.avgTds > 0 ? Math.round(stats.avgTds) : '--'} mg/L</span>
              <span className="flex items-center gap-0.5">
                {stats.tdsTrend === 'up' && (
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                )}
                {stats.tdsTrend === 'down' && (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {stats.tdsTrend === 'flat' && (
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="capitalize">{stats.tdsTrend} trend</span>
              </span>
            </div>
          </div>

          {/* 3. Turbidity Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Turbidity (Clarity)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Ref: ≤ {thresholds.turbidityMax} NTU
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {latest ? latest.turbidity.toFixed(2) : '--'}
                </span>
                <span className="ml-1 text-xs text-slate-500">NTU</span>
              </div>
              {latest && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    latest.turbidity <= thresholds.turbidityMax
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {latest.turbidity <= thresholds.turbidityMax ? 'Clear' : 'Turbid'}
                </span>
              )}
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Avg Turb: {stats.avgTurbidity > 0 ? stats.avgTurbidity.toFixed(2) : '--'} NTU</span>
              <span className="flex items-center gap-0.5">
                {stats.turbTrend === 'up' && (
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                )}
                {stats.turbTrend === 'down' && (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {stats.turbTrend === 'flat' && (
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="capitalize">{stats.turbTrend} trend</span>
              </span>
            </div>
          </div>

          {/* 4. Temperature Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Water Temperature
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Ref: {thresholds.tempOptimalMin}–{thresholds.tempOptimalMax} °C
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {latest ? latest.temperature.toFixed(1) : '--'}
                </span>
                <span className="ml-1 text-xs text-slate-500">°C</span>
              </div>
              {latest && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    latest.temperature >= thresholds.tempOptimalMin &&
                    latest.temperature <= thresholds.tempOptimalMax
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {latest.temperature >= thresholds.tempOptimalMin &&
                  latest.temperature <= thresholds.tempOptimalMax
                    ? 'Optimal'
                    : 'Thermal Shift'}
                </span>
              )}
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Avg Temp: {stats.avgTemp > 0 ? stats.avgTemp.toFixed(1) : '--'} °C</span>
              <span className="flex items-center gap-0.5">
                {stats.tempTrend === 'up' && (
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                )}
                {stats.tempTrend === 'down' && (
                  <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
                )}
                {stats.tempTrend === 'flat' && (
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="capitalize">{stats.tempTrend} trend</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Chronological Parameter Trends ({chartData.length} Data Points)
          </h2>
          <span className="text-[11px] text-slate-500">
            Hover over any chart node for sample diagnosis
          </span>
        </div>

        {/* Chart Row 1: pH Trend & Overall Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* pH Trends Chart */}
          <div className="lg:col-span-8 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  pH Acidity / Alkalinity Curve
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target screening baseline: {thresholds.phMin} – {thresholds.phMax} pH
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                pH units
              </span>
            </div>

            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis
                      domain={[4, 11]}
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      unit=""
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs shadow-lg space-y-1">
                              <div className="font-semibold">{data.name}</div>
                              <div className="text-[11px] text-slate-400">{data.timestamp}</div>
                              <div className="font-mono text-cyan-400 font-bold">
                                pH: {data.ph}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      y={thresholds.phMin}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{ value: `Min ${thresholds.phMin}`, fill: '#f59e0b', fontSize: 10 }}
                    />
                    <ReferenceLine
                      y={thresholds.phMax}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{ value: `Max ${thresholds.phMax}`, fill: '#f59e0b', fontSize: 10 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ph"
                      stroke="#0891b2"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#0891b2' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No records to display
                </div>
              )}
            </div>
          </div>

          {/* Screening Distribution Donut */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Screening Distribution
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Compliance proportion against active standards
              </p>
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              {stats.total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="p-2 rounded bg-slate-900 text-white text-xs">
                              <span className="font-semibold">{data.name}: </span>
                              <span className="font-mono">{data.value} samples</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400">No data</div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span>Within Range</span>
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {stats.withinRange}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Needs Attention</span>
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {stats.needsAttention}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Row 2: TDS & Turbidity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TDS Chart */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Total Dissolved Solids (TDS) Trajectory
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  EPA secondary aesthetic limit: {thresholds.tdsMax} mg/L
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                mg/L
              </span>
            </div>

            <div className="h-56 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs shadow-lg space-y-1">
                              <div className="font-semibold">{data.name}</div>
                              <div className="font-mono text-teal-400 font-bold">
                                TDS: {data.tds} mg/L
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      y={thresholds.tdsMax}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{ value: `Max ${thresholds.tdsMax}`, fill: '#ef4444', fontSize: 10 }}
                    />
                    <Bar dataKey="tds" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No data
                </div>
              )}
            </div>
          </div>

          {/* Turbidity Area Chart */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Turbidity (Suspended Particulate Clarity)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Screening clarity baseline: ≤ {thresholds.turbidityMax} NTU
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                NTU
              </span>
            </div>

            <div className="h-56 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="turbGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs shadow-lg space-y-1">
                              <div className="font-semibold">{data.name}</div>
                              <div className="font-mono text-blue-400 font-bold">
                                Turbidity: {data.turbidity} NTU
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      y={thresholds.turbidityMax}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{
                        value: `Limit ${thresholds.turbidityMax} NTU`,
                        fill: '#ef4444',
                        fontSize: 10,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="turbidity"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#turbGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Temperature Trend */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Water Temperature & Thermal Fluctuation
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Optimal ecological corridor: {thresholds.tempOptimalMin} – {thresholds.tempOptimalMax} °C
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              °C
            </span>
          </div>

          <div className="h-52 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="°C" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs shadow-lg space-y-1">
                            <div className="font-semibold">{data.name}</div>
                            <div className="font-mono text-amber-400 font-bold">
                              Temp: {data.temperature} °C
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={thresholds.tempOptimalMin}
                    stroke="#0284c7"
                    strokeDasharray="4 4"
                    label={{ value: '10°C Min', fill: '#0284c7', fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={thresholds.tempOptimalMax}
                    stroke="#d97706"
                    strokeDasharray="4 4"
                    label={{ value: '25°C Max', fill: '#d97706', fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#d97706"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#d97706' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Monitored Samples Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recent Tested Samples
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any sample to view full diagnostic report
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>View All Records Archive</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Sample Name & Location</th>
                <th className="py-3 px-3 font-semibold text-right">pH</th>
                <th className="py-3 px-3 font-semibold text-right">TDS (mg/L)</th>
                <th className="py-3 px-3 font-semibold text-right">Turbidity (NTU)</th>
                <th className="py-3 px-3 font-semibold text-right">Temp (°C)</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Source</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentSamples.slice(0, 6).map((sample) => {
                const analysis = analyzeWaterSample(sample, thresholds);
                const isPass = analysis.overallStatus === 'WITHIN DEMONSTRATION RANGES';
                return (
                  <tr
                    key={sample.id}
                    onClick={() => onOpenReport(sample)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {sample.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{sample.id}</span>
                        <span>·</span>
                        <span className="truncate max-w-[200px]">{sample.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {sample.ph.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {Math.round(sample.tds)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {sample.turbidity.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {sample.temperature.toFixed(1)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          isPass
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {isPass ? 'Within Range' : 'Attention'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {sample.isDemo ? (
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          Demo Data
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">
                          Field Record
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReport(sample);
                        }}
                        className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
