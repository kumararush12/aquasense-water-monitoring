/**
 * AquaSense Screening Threshold Settings Modal
 * Configurable scientific screening references for pH, TDS, Turbidity, and Temperature
 */

import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, RotateCcw, Check, Info } from 'lucide-react';
import { ScreeningThresholds } from '../types/water';
import { DEFAULT_THRESHOLDS } from '../utils/analysisEngine';
import { getStoredThresholds, saveThresholds } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [thresholds, setThresholds] = useState<ScreeningThresholds>(DEFAULT_THRESHOLDS);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setThresholds(getStoredThresholds());
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    setErrorMsg(null);
  };

  const handleSave = () => {
    if (thresholds.phMin >= thresholds.phMax) {
      setErrorMsg('pH Minimum must be less than pH Maximum.');
      return;
    }
    if (thresholds.phMin < 0 || thresholds.phMax > 14) {
      setErrorMsg('pH thresholds must be between 0.0 and 14.0.');
      return;
    }
    if (thresholds.tdsMax <= 0) {
      setErrorMsg('TDS Maximum must be greater than 0 mg/L.');
      return;
    }
    if (thresholds.turbidityMax <= 0) {
      setErrorMsg('Turbidity Maximum must be greater than 0 NTU.');
      return;
    }
    if (thresholds.tempOptimalMin >= thresholds.tempOptimalMax) {
      setErrorMsg('Optimal Temperature Minimum must be less than Maximum.');
      return;
    }

    saveThresholds(thresholds);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-50 dark:bg-cyan-950/40 rounded-lg text-cyan-600 dark:text-cyan-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Screening Reference Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust baseline demonstration ranges for analysis engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-4 text-xs">
          {/* pH Range */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              pH Reference Range (Standard: 6.50 – 8.50)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500">Minimum pH</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  value={thresholds.phMin}
                  onChange={(e) =>
                    setThresholds({
                      ...thresholds,
                      phMin: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Maximum pH</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  value={thresholds.phMax}
                  onChange={(e) =>
                    setThresholds({
                      ...thresholds,
                      phMax: parseFloat(e.target.value) || 14,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* TDS Max */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Total Dissolved Solids (TDS) Upper Limit (mg/L)
            </label>
            <input
              type="number"
              step="10"
              min="10"
              max="5000"
              value={thresholds.tdsMax}
              onChange={(e) =>
                setThresholds({
                  ...thresholds,
                  tdsMax: parseFloat(e.target.value) || 500,
                })
              }
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Standard EPA secondary aesthetic recommendation is 500 mg/L.
            </p>
          </div>

          {/* Turbidity Max */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Turbidity Upper Limit (NTU)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.1"
              max="100"
              value={thresholds.turbidityMax}
              onChange={(e) =>
                setThresholds({
                  ...thresholds,
                  turbidityMax: parseFloat(e.target.value) || 5.0,
                })
              }
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              WHO screening aesthetic threshold: 5.0 NTU (ideal drinking water target &lt; 1 NTU).
            </p>
          </div>

          {/* Temperature Range */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Optimal Temperature Corridor (°C)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500">Min Temp (°C)</span>
                <input
                  type="number"
                  step="1"
                  value={thresholds.tempOptimalMin}
                  onChange={(e) =>
                    setThresholds({
                      ...thresholds,
                      tempOptimalMin: parseFloat(e.target.value) || 10,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Max Temp (°C)</span>
                <input
                  type="number"
                  step="1"
                  value={thresholds.tempOptimalMax}
                  onChange={(e) =>
                    setThresholds({
                      ...thresholds,
                      tempOptimalMax: parseFloat(e.target.value) || 25,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="flex items-start gap-2 p-3 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg text-slate-600 dark:text-slate-300 text-xs">
          <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <span>
            These reference values guide the local rule-based analysis engine. Changing them recalculates screening classifications across the dashboard and sample reports.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Reference Thresholds</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
