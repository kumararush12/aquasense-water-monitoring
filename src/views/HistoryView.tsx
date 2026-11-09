/**
 * AquaSense Test History Archive
 * Complete historical records system with search, multi-filters, sorting, deletion, and CSV export
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  Trash2,
  RotateCcw,
  PlusCircle,
  Eye,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Calendar,
  Layers,
  Upload,
  Download,
} from 'lucide-react';
import { WaterSample, ScreeningThresholds } from '../types/water';
import { analyzeWaterSample } from '../utils/analysisEngine';
import { exportToCSV, exportAllDataJSON, importDataJSON } from '../utils/storage';
import { ConfirmModal } from '../components/ConfirmModal';

interface HistoryViewProps {
  samples: WaterSample[];
  thresholds: ScreeningThresholds;
  onDeleteSample: (id: string) => void;
  onClearAll: () => void;
  onResetDemo: () => void;
  onOpenReport: (sample: WaterSample) => void;
  onNavigateToCompare: (selectedIds: string[]) => void;
  onNavigate: (tab: string) => void;
  onNotify: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
}

type SortOption =
  | 'newest'
  | 'oldest'
  | 'ph-desc'
  | 'ph-asc'
  | 'tds-desc'
  | 'turbidity-desc';

export const HistoryView: React.FC<HistoryViewProps> = ({
  samples,
  thresholds,
  onDeleteSample,
  onClearAll,
  onResetDemo,
  onOpenReport,
  onNavigateToCompare,
  onNavigate,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'within' | 'attention'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'user' | 'demo'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation Modals State
  const [sampleToDelete, setSampleToDelete] = useState<WaterSample | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isResetDemoModalOpen, setIsResetDemoModalOpen] = useState(false);

  // Filtering
  const filteredSamples = useMemo(() => {
    return samples.filter((sample) => {
      // 1. Search filter
      const term = searchTerm.toLowerCase().trim();
      if (term) {
        const matchesName = sample.name.toLowerCase().includes(term);
        const matchesId = sample.id.toLowerCase().includes(term);
        const matchesLoc = sample.location.toLowerCase().includes(term);
        const matchesNotes = sample.notes?.toLowerCase().includes(term) || false;
        if (!matchesName && !matchesId && !matchesLoc && !matchesNotes) {
          return false;
        }
      }

      // 2. Source filter
      if (sourceFilter === 'user' && sample.isDemo) return false;
      if (sourceFilter === 'demo' && !sample.isDemo) return false;

      // 3. Status filter
      if (statusFilter !== 'all') {
        const analysis = analyzeWaterSample(sample, thresholds);
        const isPass = analysis.overallStatus === 'WITHIN DEMONSTRATION RANGES';
        if (statusFilter === 'within' && !isPass) return false;
        if (statusFilter === 'attention' && isPass) return false;
      }

      return true;
    });
  }, [samples, searchTerm, sourceFilter, statusFilter, thresholds]);

  // Sorting
  const sortedSamples = useMemo(() => {
    return [...filteredSamples].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'ph-desc':
          return b.ph - a.ph;
        case 'ph-asc':
          return a.ph - b.ph;
        case 'tds-desc':
          return b.tds - a.tds;
        case 'turbidity-desc':
          return b.turbidity - a.turbidity;
        default:
          return 0;
      }
    });
  }, [filteredSamples, sortBy]);

  // Selection toggle
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedSamples.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedSamples.map((s) => s.id));
    }
  };

  // CSV Export
  const handleExportFilteredCSV = () => {
    if (sortedSamples.length === 0) {
      onNotify('No records available to export.', 'warning');
      return;
    }
    const samplesToExport =
      selectedIds.length > 0
        ? sortedSamples.filter((s) => selectedIds.includes(s.id))
        : sortedSamples;

    exportToCSV(
      samplesToExport,
      `AquaSense_Export_${samplesToExport.length}_Records.csv`
    );
    onNotify(`Exported ${samplesToExport.length} records to CSV.`, 'success');
  };

  // Delete Handlers
  const confirmDeleteSample = () => {
    if (!sampleToDelete) return;
    onDeleteSample(sampleToDelete.id);
    setSelectedIds((prev) => prev.filter((id) => id !== sampleToDelete.id));
    onNotify(`Sample ${sampleToDelete.id} removed from records.`, 'info');
    setSampleToDelete(null);
  };

  const confirmClearAll = () => {
    onClearAll();
    setSelectedIds([]);
    setIsClearAllModalOpen(false);
    onNotify('All historical records cleared from storage.', 'warning');
  };

  const confirmResetDemo = () => {
    onResetDemo();
    setSelectedIds([]);
    setIsResetDemoModalOpen(false);
    onNotify('Reset test archive to initial 10 demonstration samples.', 'success');
  };

  const handleLaunchCompare = () => {
    if (selectedIds.length < 2) {
      onNotify('Select at least 2 water samples to launch side-by-side comparison.', 'info');
      return;
    }
    onNavigateToCompare(selectedIds);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Historical Water Quality Records
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, filter, audit, compare, and export all recorded physical-chemical sample tests
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length >= 2 && (
            <button
              onClick={handleLaunchCompare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={handleExportFilteredCSV}
            title="Download CSV spreadsheet of current samples"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              exportAllDataJSON();
              onNotify('Complete database backup JSON exported.', 'success');
            }}
            title="Backup all records and settings as a JSON file"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-600" />
            <span>Backup (JSON)</span>
          </button>

          <label
            title="Restore database backup from JSON file"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-purple-600" />
            <span>Restore</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const content = event.target?.result as string;
                  if (content) {
                    const res = importDataJSON(content);
                    if (res.success) {
                      onNotify(`Restored ${res.count} records from backup file.`, 'success');
                    } else {
                      onNotify(res.error || 'Failed to restore backup.', 'error');
                    }
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
          </label>

          <button
            onClick={() => setIsResetDemoModalOpen(true)}
            title="Reset to 10 Demonstration Samples"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-600" />
            <span>Reset Demo Data</span>
          </button>

          {samples.length > 0 && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              title="Clear all stored sample records"
              className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onNavigate('test')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Log Sample</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          {/* Live Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by sample name, ID, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3 flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(
              [
                { id: 'all', label: 'All Statuses' },
                { id: 'within', label: 'In Range' },
                { id: 'attention', label: 'Attention' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`flex-1 py-1 font-medium rounded-md transition-colors text-center ${
                  statusFilter === st.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Data Source Filter */}
          <div className="md:col-span-2 flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(
              [
                { id: 'all', label: 'All Sources' },
                { id: 'user', label: 'User' },
                { id: 'demo', label: 'Demo' },
              ] as const
            ).map((src) => (
              <button
                key={src.id}
                onClick={() => setSourceFilter(src.id)}
                className={`flex-1 py-1 font-medium rounded-md transition-colors text-center ${
                  sourceFilter === src.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {src.label}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-slate-500 text-[11px] whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
            >
              <option value="newest">Newest to Oldest</option>
              <option value="oldest">Oldest to Newest</option>
              <option value="ph-desc">Highest pH (Alkaline)</option>
              <option value="ph-asc">Lowest pH (Acidic)</option>
              <option value="tds-desc">Highest TDS (Minerals)</option>
              <option value="turbidity-desc">Highest Turbidity</option>
            </select>
          </div>
        </div>

        {/* Selected count info banner */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{sortedSamples.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{samples.length}</span> total samples
          </div>
          {selectedIds.length > 0 && (
            <div className="text-cyan-600 dark:text-cyan-400 font-medium">
              {selectedIds.length} sample(s) selected
            </div>
          )}
        </div>
      </div>

      {/* Historical Records Table */}
      {sortedSamples.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    title="Select/Deselect All"
                    className="text-slate-400 hover:text-cyan-600 p-1"
                  >
                    {selectedIds.length === sortedSamples.length && sortedSamples.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-cyan-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3 font-semibold">Sample ID & Name</th>
                <th className="py-3 px-3 font-semibold">Location</th>
                <th className="py-3 px-3 font-semibold">Date & Time</th>
                <th className="py-3 px-3 font-semibold text-right">pH</th>
                <th className="py-3 px-3 font-semibold text-right">TDS (mg/L)</th>
                <th className="py-3 px-3 font-semibold text-right">Turbidity (NTU)</th>
                <th className="py-3 px-3 font-semibold text-right">Temp (°C)</th>
                <th className="py-3 px-3 font-semibold">Screening Result</th>
                <th className="py-3 px-3 font-semibold">WQI Index</th>
                <th className="py-3 px-3 font-semibold">Origin</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {sortedSamples.map((sample) => {
                const analysis = analyzeWaterSample(sample, thresholds);
                const isPass = analysis.overallStatus === 'WITHIN DEMONSTRATION RANGES';
                const isSelected = selectedIds.includes(sample.id);

                return (
                  <tr
                    key={sample.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                      isSelected ? 'bg-cyan-50/40 dark:bg-cyan-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(sample.id)}
                        className="rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div
                        onClick={() => onOpenReport(sample)}
                        className="font-semibold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer"
                      >
                        {sample.name}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {sample.id}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-[160px] truncate">
                      {sample.location}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(sample.timestamp).toLocaleDateString()}{' '}
                      {new Date(sample.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {sample.ph.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {Math.round(sample.tds)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {sample.turbidity.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
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
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {analysis.wqi.score}
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
                    <td className="py-3 px-3">
                      {sample.isDemo ? (
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          DEMO DATA
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">
                          FIELD RECORD
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenReport(sample)}
                          title="View Full Diagnostic Report"
                          className="p-1.5 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSampleToDelete(sample)}
                          title="Delete Sample"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching water quality records found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Try adjusting your search criteria, clearing active filters, or adding a new water test record.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSourceFilter('all');
              }}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Clear Active Filters
            </button>
            <button
              onClick={() => setIsResetDemoModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm transition-colors"
            >
              Load Demo Records
            </button>
          </div>
        </div>
      )}

      {/* Delete Single Sample Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(sampleToDelete)}
        title="Delete Water Quality Record"
        message={`Are you sure you want to delete "${sampleToDelete?.name}" (${sampleToDelete?.id})? This action will remove the record permanently from local storage.`}
        confirmLabel="Delete Record"
        isDestructive={true}
        onConfirm={confirmDeleteSample}
        onCancel={() => setSampleToDelete(null)}
      />

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearAllModalOpen}
        title="Clear All Test Records"
        message="Are you sure you want to permanently clear all water quality records from local storage? This action cannot be undone."
        confirmLabel="Clear All Records"
        isDestructive={true}
        onConfirm={confirmClearAll}
        onCancel={() => setIsClearAllModalOpen(false)}
      />

      {/* Reset Demo Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetDemoModalOpen}
        title="Reset Demonstration Dataset"
        message="This will reset the local archive back to the initial 10 representative demonstration samples (covering acidic, turbid, high mineral, and baseline conditions). Any user-created samples will be replaced."
        confirmLabel="Reset to Demo Data"
        isDestructive={false}
        onConfirm={confirmResetDemo}
        onCancel={() => setIsResetDemoModalOpen(false)}
      />
    </div>
  );
};
