/**
 * AquaSense Landing Page / Home View
 * Scientific SaaS hero, parameter breakdown, system workflow, and environmental awareness
 */

import React, { useState } from 'react';
import heroWaterLabImg from '../assets/images/hero_water_lab_1794206680686.jpg';
import waterFieldSampleImg from '../assets/images/water_field_sample_1794206680603.jpg';
import {
  Droplets,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  FlaskConical,
  FileCheck,
  Scale,
  Thermometer,
  Waves,
  Eye,
  CheckCircle2,
  TreePine,
  ExternalLink,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 lg:pt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-cyan-700 dark:text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>Environmental Technology Platform</span>
                <span>·</span>
                <span>Scientific Water Screening</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] text-balance">
                Monitor Water.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-500 to-blue-600 dark:from-cyan-400 dark:via-teal-300 dark:to-blue-400">
                  Understand Quality.
                </span>{' '}
                Protect Life.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                AquaSense empowers water stewards, environmental technicians, and researchers to screen physical-chemical indicators, analyze watershed trends in real time, and generate certified diagnostic reports.
              </p>

              {/* Working CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('test')}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 rounded-xl shadow-lg shadow-cyan-600/25 hover:shadow-cyan-600/40 transition-all group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-all"
                >
                  <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Explore Dashboard</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Configurable WHO & EPA Reference Limits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Client-Side Offline Persistence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Deterministic Rule Engine</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Grade Laboratory Photography */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 group">
                <img
                  src={heroWaterLabImg}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('/images/hero_water_lab.jpg')) {
                      target.src = '/images/hero_water_lab.jpg';
                    }
                  }}
                  alt="AquaSense Environmental Laboratory Testing Equipment"
                  className="w-full h-[360px] sm:h-[420px] object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
                  <div className="text-white font-semibold text-sm">
                    Automated Physical-Chemical Diagnostics
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Multi-parameter screening with calibrated sensory algorithms and rapid report compilation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Water Quality Matters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Vital Ecosystem Health
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Why Water Quality Monitoring Matters
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Freshwater accounts for less than 1% of all water on Earth. Safeguarding this finite resource requires continuous vigilance, empirical measurement, and transparent documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Public Health & Safety
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Waterborne illnesses and corrosive leaching of lead and copper from municipal piping cause severe chronic harm. Screening pH, TDS, and clarity provides an essential first-line defense before distribution.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TreePine className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Aquatic Ecosystem Protection
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Fish, amphibians, and benthic macroinvertebrates rely on narrow pH corridors (6.5–8.5) and adequate dissolved oxygen. Thermal shock and silt turbidity suffocates fish gills and destroys spawning beds.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Agricultural & Industrial Integrity
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Excessive TDS causes severe soil salinization in agricultural irrigation and destroys industrial boilers and cooling towers through heavy scaling and mineral encrustation.
            </p>
          </div>
        </div>
      </section>

      {/* The Four Main Water Parameters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Core Screening Indicators
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Four Fundamental Physical-Chemical Parameters
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            AquaSense focuses on four foundational parameters that capture water balance, suspended colloidal load, mineral saturation, and thermal kinetics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. pH */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/50 transition-colors space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                6.50 – 8.50
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">pH Value</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Acidity & Alkalinity Scale</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Measures hydrogen ion concentration on a logarithmic 0–14 scale. Low pH (&lt;6.5) corrodes metallic plumbing, while high pH (&gt;8.5) induces scaling and bitter taste.
            </p>
          </div>

          {/* 2. TDS */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/50 transition-colors space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <FlaskConical className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                ≤ 500 mg/L
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Total Dissolved Solids</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dissolved Minerals & Salts</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Reflects the total concentration of dissolved inorganic salts (calcium, magnesium, sodium) and organic matter. Elevated TDS causes salty taste, pipe encrustation, and appliance failure.
            </p>
          </div>

          {/* 3. Turbidity */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/50 transition-colors space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                ≤ 5.0 NTU
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Turbidity</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Water Clarity & Suspended Matter</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Measures the scattering of light caused by suspended clays, silts, and organic particles. High turbidity blocks sunlight, absorbs heat, and protects pathogens from UV disinfection.
            </p>
          </div>

          {/* 4. Temperature */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/50 transition-colors space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Thermometer className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                10.0 – 25.0 °C
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Water Temperature</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dissolved Oxygen & Metabolic Rate</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Directly influences oxygen solubility and microbial growth rates. Colder water retains higher dissolved oxygen, while warm water accelerates bacterial growth and algae proliferation.
            </p>
          </div>
        </div>
      </section>

      {/* How the System Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              System Architecture & Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              From Field Measurement to Certified Diagnostic Intelligence
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              AquaSense provides an end-to-end analytical pipeline designed for deterministic screening and actionable insights.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="text-2xl font-mono font-bold text-cyan-400">01.</div>
              <h4 className="text-sm font-bold text-white">Sample Collection</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log water sample parameters from digital probe meters, field testing kits, or benchtop lab analyzers.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="text-2xl font-mono font-bold text-cyan-400">02.</div>
              <h4 className="text-sm font-bold text-white">Rule-Based Screening</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The engine evaluates readings deterministically against configurable EPA & WHO demonstration references.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="text-2xl font-mono font-bold text-cyan-400">03.</div>
              <h4 className="text-sm font-bold text-white">Multi-Sample Comparison</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Compare multiple water sources side-by-side to track watershed dispersion, post-storm runoff, and treatment efficacy.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="text-2xl font-mono font-bold text-cyan-400">04.</div>
              <h4 className="text-sm font-bold text-white">Certified PDF Reports</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generate clean, publication-ready PDF reports with parameter tables, remediation actions, and disclaimers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Field Showcase & Environmental Awareness */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
            <img
              src={waterFieldSampleImg}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('/images/water_field_sample.jpg')) {
                  target.src = '/images/water_field_sample.jpg';
                }
              }}
              alt="Environmental Field Water Quality Testing"
              className="w-full h-[360px] object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Watershed Preservation & Stewardship
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bridging Field Science with Digital Integrity
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Water connects every aspect of civilization. When municipal stormwater drains into pristine mountain tributaries or agricultural fertilizer leaches into groundwater aquifers, the consequences cascade through drinking networks and fragile wildlife habitats.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              AquaSense provides an accessible, scientific screening layer so that communities, educators, and field monitors can detect deviations early, substantiate concerns with hard data, and know exactly when to escalate samples for accredited laboratory culture testing.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('education')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span>Read Educational Guides</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('compare')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 rounded-lg transition-colors"
              >
                <span>Open Sample Comparison Tool</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Launch Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-cyan-600/20">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Ready to analyze a water sample?
            </h3>
            <p className="text-xs sm:text-sm text-cyan-100 mt-1 max-w-xl">
              Enter physical-chemical parameters or load realistic demonstration baseline data with a single click.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('test')}
              className="px-5 py-2.5 bg-white text-cyan-800 hover:bg-slate-100 rounded-xl font-bold text-xs shadow-md transition-colors whitespace-nowrap"
            >
              Analyze New Sample
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 bg-cyan-700/60 hover:bg-cyan-700/80 text-white rounded-xl font-semibold text-xs transition-colors whitespace-nowrap"
            >
              View Analytics
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
