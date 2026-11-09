/**
 * AquaSense Storage and Data Persistence
 * LocalStorage management, CSV export, and configuration persistence
 */

import { WaterSample, ScreeningThresholds } from '../types/water';
import { getInitialDemoSamples } from './demoData';
import { DEFAULT_THRESHOLDS } from './analysisEngine';

const SAMPLES_STORAGE_KEY = 'aquasense_samples_v1';
const THRESHOLDS_STORAGE_KEY = 'aquasense_thresholds_v1';
const THEME_STORAGE_KEY = 'aquasense_theme_v1';

export function getStoredSamples(): WaterSample[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAMPLES_STORAGE_KEY);
    if (!raw) {
      const demoSamples = getInitialDemoSamples();
      localStorage.setItem(SAMPLES_STORAGE_KEY, JSON.stringify(demoSamples));
      return demoSamples;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If empty array, don't automatically override unless requested
    return parsed;
  } catch (err) {
    console.error('Failed to read samples from localStorage:', err);
    return getInitialDemoSamples();
  }
}

export function saveSample(sample: WaterSample): void {
  const current = getStoredSamples();
  const existingIdx = current.findIndex((s) => s.id === sample.id);
  let updated: WaterSample[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = sample;
  } else {
    updated = [sample, ...current];
  }
  localStorage.setItem(SAMPLES_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('aquasense_samples_updated'));
}

export function deleteSample(id: string): void {
  const current = getStoredSamples();
  const updated = current.filter((s) => s.id !== id);
  localStorage.setItem(SAMPLES_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('aquasense_samples_updated'));
}

export function resetToDemoData(): void {
  const demoSamples = getInitialDemoSamples();
  localStorage.setItem(SAMPLES_STORAGE_KEY, JSON.stringify(demoSamples));
  window.dispatchEvent(new Event('aquasense_samples_updated'));
}

export function clearAllSamples(): void {
  localStorage.setItem(SAMPLES_STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event('aquasense_samples_updated'));
}

export function getStoredThresholds(): ScreeningThresholds {
  if (typeof window === 'undefined') return DEFAULT_THRESHOLDS;
  try {
    const raw = localStorage.getItem(THRESHOLDS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_THRESHOLDS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to load thresholds:', err);
  }
  return DEFAULT_THRESHOLDS;
}

export function saveThresholds(thresholds: ScreeningThresholds): void {
  localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(thresholds));
  window.dispatchEvent(new Event('aquasense_thresholds_updated'));
}

export function getStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (err) {
    console.error('Failed to load theme:', err);
  }
  return 'light';
}

export function saveTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function generateSampleId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `AQ-${year}-${randomSuffix}`;
}

/**
 * Exports sample records to RFC-4180 CSV and initiates browser download
 */
export function exportToCSV(
  samples: WaterSample[],
  filename = 'AquaSense_Water_Quality_Records.csv'
): void {
  if (!samples || samples.length === 0) return;

  const headers = [
    'Sample ID',
    'Sample Name',
    'Location',
    'Date & Time',
    'pH',
    'TDS (mg/L)',
    'Turbidity (NTU)',
    'Temperature (°C)',
    'Data Type',
    'Notes',
  ];

  const escapeCSV = (str: string | number | undefined) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = samples.map((s) => [
    escapeCSV(s.id),
    escapeCSV(s.name),
    escapeCSV(s.location),
    escapeCSV(s.timestamp),
    escapeCSV(s.ph.toFixed(2)),
    escapeCSV(s.tds.toFixed(1)),
    escapeCSV(s.turbidity.toFixed(2)),
    escapeCSV(s.temperature.toFixed(1)),
    escapeCSV(s.isDemo ? 'DEMO DATA' : 'USER RECORD'),
    escapeCSV(s.notes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
    '\r\n'
  );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports complete application database (samples + screening thresholds) as JSON
 */
export function exportAllDataJSON(): void {
  const samples = getStoredSamples();
  const thresholds = getStoredThresholds();

  const backupPayload = {
    app: 'AquaSense',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    thresholds,
    samples,
  };

  const jsonStr = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `AquaSense_Complete_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Imports and restores application database from JSON string
 */
export function importDataJSON(jsonStr: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || !Array.isArray(parsed.samples)) {
      return { success: false, count: 0, error: 'Invalid backup format: missing samples array.' };
    }

    const current = getStoredSamples();
    const existingIds = new Set(current.map((s) => s.id));
    const newSamples: WaterSample[] = [];

    parsed.samples.forEach((raw: any) => {
      if (raw && typeof raw.ph === 'number' && typeof raw.tds === 'number' && typeof raw.turbidity === 'number') {
        const id = raw.id || generateSampleId();
        if (!existingIds.has(id)) {
          newSamples.push({
            id,
            name: String(raw.name || 'Imported Sample'),
            location: String(raw.location || 'Field Location'),
            timestamp: raw.timestamp || new Date().toISOString(),
            ph: Number(raw.ph),
            tds: Number(raw.tds),
            turbidity: Number(raw.turbidity),
            temperature: Number(raw.temperature ?? 20),
            notes: raw.notes ? String(raw.notes) : undefined,
            isDemo: Boolean(raw.isDemo),
            createdAt: raw.createdAt || Date.now(),
          });
          existingIds.add(id);
        }
      }
    });

    const merged = [...newSamples, ...current];
    localStorage.setItem(SAMPLES_STORAGE_KEY, JSON.stringify(merged));

    if (parsed.thresholds && typeof parsed.thresholds.phMin === 'number') {
      saveThresholds(parsed.thresholds);
    }

    window.dispatchEvent(new Event('aquasense_samples_updated'));
    return { success: true, count: newSamples.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Failed to parse JSON file' };
  }
}
