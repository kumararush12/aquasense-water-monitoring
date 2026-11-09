/**
 * AquaSense Certified Report Modal
 * Interactive detailed report viewer with PDF download, Print, and CSV export
 */

import React from 'react';
import {
  X,
  Download,
  Printer,
  FileSpreadsheet,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import { WaterSample } from '../types/water';
import { analyzeWaterSample } from '../utils/analysisEngine';
import { getStoredThresholds, exportToCSV } from '../utils/storage';
import { generatePDFReport } from '../utils/pdfGenerator';

interface ReportModalProps {
  sample: WaterSample | null;
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  sample,
  isOpen,
  onClose,
  onNotify,
}) => {
  if (!isOpen || !sample) return null;

  const thresholds = getStoredThresholds();
  const analysis = analyzeWaterSample(sample, thresholds);
  const isCompliant = analysis.overallStatus === 'WITHIN DEMONSTRATION RANGES';

  const handleDownloadPDF = () => {
    try {
      generatePDFReport(sample);
      if (onNotify) onNotify(`PDF report for ${sample.id} downloaded`, 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      if (onNotify) onNotify('Failed to generate PDF report', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportToCSV([sample], `AquaSense_Sample_${sample.id}.csv`);
    if (onNotify) onNotify(`Sample ${sample.id} exported to CSV`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400">
              Diagnostic Report
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-mono text-slate-500">{sample.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  AquaSense Environmental Platform
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Water Quality Screening & Diagnostic Report
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
              <div>
                Report ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">REP-{sample.id}</span>
              </div>
              <div>
                Generated: <span className="font-mono">{new Date().toLocaleDateString()}</span>
              </div>
              {sample.isDemo && (
                <div className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-900/50">
                  Demonstration Record
                </div>
              )}
            </div>
          </div>

          {/* Sample Identification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Sample Name</span>
              <span className="font-semibold text-slate-900 dark:text-white text-sm">{sample.name}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Location / Station</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                {sample.location}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Sampling Date & Time</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {new Date(sample.timestamp).toLocaleString()}
              </span>
            </div>
            {sample.notes && (
              <div className="sm:col-span-3 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Field / Sensory Notes</span>
                <p className="text-slate-700 dark:text-slate-300 italic">{sample.notes}</p>
              </div>
            )}
          </div>

          {/* Overall Screening Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              isCompliant
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-100'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-100'
            }`}
          >
            {isCompliant ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-bold tracking-tight">
                  Overall Screening Result: {analysis.overallStatus}
                </h4>
                <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-slate-900/70 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-700/80 text-xs">
                  <span className="text-slate-500 font-medium">Water Quality Index:</span>
                  <span className="font-mono font-bold">{analysis.wqi.score}/100</span>
                  <span className="font-bold px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-200 text-[10px]">
                    Grade {analysis.wqi.grade}
                  </span>
                </div>
              </div>
              <p className="text-xs mt-1.5 leading-relaxed opacity-90">
                {analysis.summaryProse}
              </p>
            </div>
          </div>

          {/* Parameter Evaluation Table */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Measured Physical-Chemical Parameters
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Parameter</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Measured</th>
                    <th className="py-2.5 px-4 font-semibold">Screening Reference</th>
                    <th className="py-2.5 px-4 font-semibold">Classification</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {analysis.evaluations.map((item) => (
                    <tr key={item.parameter} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-medium">{item.displayName}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                        {item.value.toFixed(item.parameter === 'tds' ? 0 : 2)} {item.unit}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {item.referenceRange}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {item.classification}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            item.status === 'WITHIN_RANGE'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {item.status === 'WITHIN_RANGE' ? 'Within Range' : 'Needs Attention'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Scientific Findings */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Parameter-Wise Scientific Explanation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {analysis.evaluations.map((item) => (
                <div
                  key={item.parameter}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center justify-between">
                    <span>{item.displayName}</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {item.value.toFixed(item.parameter === 'tds' ? 0 : 2)} {item.unit}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Targeted Action Protocols & Recommendations
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400 mt-0.5">
                    {i + 1}.
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mandatory Safety Disclaimer */}
          <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <span className="font-bold">Accredited Laboratory Testing Requirement: </span>
              {analysis.disclaimer}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            AquaSense Environmental Diagnostic Suite
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
