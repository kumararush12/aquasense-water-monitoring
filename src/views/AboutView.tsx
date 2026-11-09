/**
 * AquaSense Platform About & Architecture Page
 * Commercial technology overview, problem statement, objectives, architecture, limitations, and roadmap
 * Strictly adheres to non-academic, professional presentation
 */

import React from 'react';
import {
  Droplets,
  Layers,
  Cpu,
  ShieldCheck,
  Compass,
  Sparkles,
  Database,
  Code2,
  FileText,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-12 pb-16 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          About AquaSense
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Platform overview, scientific mission, software architecture, and diagnostic screening boundaries
        </p>
      </div>

      {/* Website Overview Banner */}
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          <Droplets className="w-4 h-4" />
          <span>Platform Overview</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Empowering Watershed Stewards with Transparent Environmental Intelligence
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          AquaSense is an open, modern environmental screening application engineered to simplify water quality surveillance. By unifying field parameter logging, instant rule-based diagnostic evaluation, multi-sample variance analysis, and certified PDF reporting, the platform bridges the divide between raw sensor telemetry and actionable environmental decision-making.
        </p>
      </div>

      {/* Problem Statement & Proposed Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem Statement */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            The Problem Statement
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Freshwater ecosystems worldwide face compounding threats from industrial effluents, non-point agricultural runoff, and deteriorating municipal distribution infrastructure. Traditional laboratory testing workflows can take days or weeks, while field technicians often lack accessible digital tools to record, validate, and compare parameter deviations across sampling sites in real time.
          </p>
        </div>

        {/* Proposed Solution */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            The AquaSense Solution
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            AquaSense delivers an immediate, zero-barrier screening tool capable of running offline in any modern browser. By codifying standard World Health Organization (WHO) and EPA secondary screening baselines into a deterministic rule engine, field personnel can instantly verify whether water samples exhibit healthy equilibrium or require immediate remediation.
          </p>
        </div>
      </div>

      {/* Main Objectives */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Core Objectives
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">
              01. Deterministic Screening
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Provide reproducible, rule-based physical-chemical parameter screening without opaque guesswork or arbitrary grading.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">
              02. Comprehensive Auditing
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Preserve longitudinal historical records in client storage, enabling date-filtered trends and multi-sample divergence comparison.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">
              03. Certified Reporting
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Generate standardized, publication-ready PDF reports and RFC-4180 CSV exports for institutional documentation.
            </p>
          </div>
        </div>
      </div>

      {/* Technologies Used */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Technology Stack & Architecture
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">React 19 & TypeScript</span>
            <p className="text-slate-600 dark:text-slate-400">
              Strictly typed component architecture ensuring reliable state transitions and type-safe data handling.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">Tailwind CSS v4</span>
            <p className="text-slate-600 dark:text-slate-400">
              Custom dark variant `@custom-variant dark`, fluid typography scale, and clean scientific UI palette.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">Recharts Visualization</span>
            <p className="text-slate-600 dark:text-slate-400">
              Dynamic SVG line, area, bar, and donut charts with custom tooltips and reference threshold bands.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">Client-Side LocalStorage</span>
            <p className="text-slate-600 dark:text-slate-400">
              Privacy-first offline data persistence with zero external tracking, telemetry, or server dependency.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">jsPDF Document Engine</span>
            <p className="text-slate-600 dark:text-slate-400">
              Deterministic PDF generation compiling structured parameter tables, analysis, and disclaimers.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">Lucide Icon Library</span>
            <p className="text-slate-600 dark:text-slate-400">
              Precision geometric icons supporting accessible UI states and affordance clarity.
            </p>
          </div>
        </div>
      </div>

      {/* Scientific Limitations & Future Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Limitations */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Screening Boundaries & Limitations</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            AquaSense operates as a physical-chemical screening tool. The platform explicitly does <strong>NOT</strong> test for microbiological pathogens (such as bacteria, viruses, or cysts), toxic heavy metals (such as arsenic, lead, and cadmium), or persistent synthetic organic compounds (PFAS, organophosphates). Drinking-water safety can only be verified by an accredited laboratory.
          </p>
        </div>

        {/* Future Improvements */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            <span>Roadmap & Future Improvements</span>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
            <li>IoT telemetry integration supporting Bluetooth Low Energy (BLE) multi-parameter probes.</li>
            <li>Geospatial GIS watershed mapping with interactive catchment basin heatmaps.</li>
            <li>Automated seasonal calibration offset adjustment for high-elevation or estuarine waterways.</li>
            <li>Multi-lingual localization for international watershed monitoring initiatives.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
