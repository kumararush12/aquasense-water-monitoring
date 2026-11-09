/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { SettingsModal } from './components/SettingsModal';
import { ReportModal } from './components/ReportModal';
import { HomeView } from './views/HomeView';
import { DashboardView } from './views/DashboardView';
import { TestingView } from './views/TestingView';
import { HistoryView } from './views/HistoryView';
import { ComparisonView } from './views/ComparisonView';
import { EducationView } from './views/EducationView';
import { AboutView } from './views/AboutView';
import { WaterSample, ScreeningThresholds, NotificationToast } from './types/water';
import {
  getStoredSamples,
  deleteSample,
  clearAllSamples,
  resetToDemoData,
  getStoredThresholds,
  getStoredTheme,
  saveTheme,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [samples, setSamples] = useState<WaterSample[]>([]);
  const [thresholds, setThresholds] = useState<ScreeningThresholds>(getStoredThresholds());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeReportSample, setActiveReportSample] = useState<WaterSample | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  // Initialize theme & load samples on mount
  useEffect(() => {
    const initialTheme = getStoredTheme();
    setTheme(initialTheme);
    saveTheme(initialTheme);

    const loaded = getStoredSamples();
    setSamples(loaded);
    setThresholds(getStoredThresholds());

    const handleSamplesUpdate = () => {
      setSamples(getStoredSamples());
    };

    const handleThresholdsUpdate = () => {
      setThresholds(getStoredThresholds());
    };

    window.addEventListener('aquasense_samples_updated', handleSamplesUpdate);
    window.addEventListener('aquasense_thresholds_updated', handleThresholdsUpdate);

    return () => {
      window.removeEventListener('aquasense_samples_updated', handleSamplesUpdate);
      window.removeEventListener('aquasense_thresholds_updated', handleThresholdsUpdate);
    };
  }, []);

  // Toast notification dispatcher
  const notify = useCallback(
    (message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    saveTheme(nextTheme);
    notify(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} theme`, 'info');
  };

  const handleDeleteSample = (id: string) => {
    deleteSample(id);
    setSamples(getStoredSamples());
  };

  const handleClearAll = () => {
    clearAllSamples();
    setSamples([]);
  };

  const handleResetDemo = () => {
    resetToDemoData();
    setSamples(getStoredSamples());
  };

  const handleOpenReport = (sample: WaterSample) => {
    setActiveReportSample(sample);
  };

  const handleNavigateToCompare = (selectedIds: string[]) => {
    setCompareIds(selectedIds);
    setActiveTab('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSampleSaved = (sample: WaterSample) => {
    setSamples(getStoredSamples());
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-cyan-500/20 selection:text-cyan-600 dark:selection:text-cyan-400">
      {/* Top Bar Contract Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'home' && (
          <HomeView onNavigate={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            samples={samples}
            thresholds={thresholds}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenReport={handleOpenReport}
            onResetDemoData={handleResetDemo}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'test' && (
          <TestingView
            thresholds={thresholds}
            onSampleSaved={handleSampleSaved}
            onOpenReport={handleOpenReport}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNotify={notify}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            samples={samples}
            thresholds={thresholds}
            onDeleteSample={handleDeleteSample}
            onClearAll={handleClearAll}
            onResetDemo={handleResetDemo}
            onOpenReport={handleOpenReport}
            onNavigateToCompare={handleNavigateToCompare}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNotify={notify}
          />
        )}

        {activeTab === 'compare' && (
          <ComparisonView
            samples={samples}
            thresholds={thresholds}
            initialSelectedIds={compareIds}
            onOpenReport={handleOpenReport}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNotify={notify}
          />
        )}

        {activeTab === 'education' && (
          <EducationView
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Modals */}
      <ReportModal
        sample={activeReportSample}
        isOpen={Boolean(activeReportSample)}
        onClose={() => setActiveReportSample(null)}
        onNotify={notify}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {
          setThresholds(getStoredThresholds());
          notify('Screening reference thresholds updated successfully.', 'success');
        }}
      />

      {/* Global Toast Alerts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
