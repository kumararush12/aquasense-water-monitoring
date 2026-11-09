/**
 * AquaSense Footer Component
 * Professional environmental science footer with parameters quick-ref and disclaimer
 */

import React from 'react';
import { Droplets, ShieldCheck, FileText, Compass, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
                <Droplets className="w-4 h-4 text-slate-950" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">AquaSense</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Advanced environmental technology platform for water quality parameter screening, rule-based diagnostic analysis, and certified analytical reporting.
            </p>
            <div className="pt-2 text-xs text-cyan-400 font-medium">
              Monitor Water · Understand Quality · Protect Life
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Interactive Dashboard & Analytics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('test')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Water Sample Testing & Diagnostic Form
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('history')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Historical Sample Records Archive
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('compare')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Multi-Sample Parameter Comparison Tool
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('education')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Water Quality Educational Knowledge Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  System Architecture & About
                </button>
              </li>
            </ul>
          </div>

          {/* Screening Reference Standards */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Demonstration Screening Baselines
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex justify-between border-b border-slate-800 pb-1">
                <span>Acidity / Alkalinity (pH)</span>
                <span className="font-mono text-cyan-400">6.50 – 8.50</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1">
                <span>Total Dissolved Solids (TDS)</span>
                <span className="font-mono text-cyan-400">≤ 500 mg/L</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1">
                <span>Turbidity (Clarity)</span>
                <span className="font-mono text-cyan-400">≤ 5.0 NTU</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1">
                <span>Water Temperature</span>
                <span className="font-mono text-cyan-400">10.0 – 25.0 °C</span>
              </li>
            </ul>
            <p className="text-[11px] text-slate-500 mt-2">
              Based on WHO and EPA secondary drinking water aesthetic guidance. Configurable in Settings.
            </p>
          </div>

          {/* Environmental Stewardship */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Watershed Stewardship
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every body of fresh water connects to a broader ecosystem. Continuous screening enables early detection of industrial leaks, agricultural runoff, and sediment displacement before irreparable watershed degradation occurs.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Offline-capable client storage (zero tracking)</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="rounded-lg bg-slate-950/60 p-4 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-amber-400">SCIENTIFIC DISCLAIMER: </span>
            AquaSense is an educational and screening platform. The rule-based evaluation of pH, TDS, Turbidity, and Temperature serves as a preliminary physical-chemical indicator. It cannot guarantee drinking water safety or substitute for accredited laboratory testing (e.g., microbiological cultures for coliforms/pathogens, spectrometry for toxic heavy metals, or gas chromatography for synthetic organic chemicals).
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              © {new Date().getFullYear()} AquaSense Environmental Systems. Built with React, TypeScript & Tailwind CSS.
            </div>
            <div className="flex items-center gap-4">
              <span>Open Source Architecture</span>
              <span>·</span>
              <span>RFC-4180 CSV Compliant</span>
              <span>·</span>
              <span>Client-Side LocalStorage</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
