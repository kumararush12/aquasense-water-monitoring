/**
 * AquaSense Educational Knowledge Hub
 * Comprehensive scientific guides on water quality parameters, pollution, and laboratory testing
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Scale,
  FlaskConical,
  Eye,
  Thermometer,
  ShieldAlert,
  Droplets,
  TreePine,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { analyzeWaterSample } from '../utils/analysisEngine';
import { getStoredThresholds } from '../utils/storage';

interface EducationViewProps {
  onNavigate: (tab: string) => void;
}

export const EducationView: React.FC<EducationViewProps> = ({ onNavigate }) => {
  const [activeTopic, setActiveTopic] = useState<string>('intro');

  // Interactive parameter simulator state
  const [simPh, setSimPh] = useState(7.2);
  const [simTds, setSimTds] = useState(240);
  const [simTurbidity, setSimTurbidity] = useState(1.5);
  const [simTemp, setSimTemp] = useState(20.0);

  const thresholds = getStoredThresholds();
  const simAnalysis = analyzeWaterSample(
    {
      id: 'SIM-001',
      name: 'Interactive Simulator',
      location: 'Virtual Test Bench',
      timestamp: new Date().toISOString(),
      ph: simPh,
      tds: simTds,
      turbidity: simTurbidity,
      temperature: simTemp,
      isDemo: true,
      createdAt: Date.now(),
    },
    thresholds
  );

  const topics = [
    { id: 'intro', title: '1. What is Water Quality?', icon: Droplets },
    { id: 'importance', title: '2. Why Monitoring Matters', icon: TreePine },
    { id: 'ph', title: '3. What is pH?', icon: Scale },
    { id: 'tds', title: '4. What is TDS?', icon: FlaskConical },
    { id: 'turbidity', title: '5. What is Turbidity?', icon: Eye },
    { id: 'temperature', title: '6. Why Temperature Matters', icon: Thermometer },
    { id: 'pollution', title: '7. Effects of Water Pollution', icon: ShieldAlert },
    { id: 'conservation', title: '8. Water Conservation', icon: BookOpen },
    { id: 'laboratory', title: '9. Certified Laboratory Testing', icon: FlaskConical },
  ];

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Water Quality Educational Knowledge Hub
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore fundamental environmental water science, chemical dynamics, and watershed protection guidelines
        </p>
      </div>

      {/* Interactive Parameter Simulator Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive Learning Simulator</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Live Parameter Diagnostic Sandbox
            </h3>
            <p className="text-xs text-slate-300">
              Adjust the physical-chemical sliders below to observe real-time rule engine classifications
            </p>
          </div>

          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-2 self-start md:self-auto ${
              simAnalysis.overallStatus === 'WITHIN DEMONSTRATION RANGES'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                : 'bg-amber-950/80 text-amber-300 border-amber-700'
            }`}
          >
            {simAnalysis.overallStatus === 'WITHIN DEMONSTRATION RANGES' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span>{simAnalysis.overallStatus}</span>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          {/* pH Slider */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">pH Acidity</span>
              <span className="font-mono text-cyan-400 text-sm">{simPh.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="0.1"
              value={simPh}
              onChange={(e) => setSimPh(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Acidic (2.0)</span>
              <span>Neutral (7.0)</span>
              <span>Alkaline (12.0)</span>
            </div>
          </div>

          {/* TDS Slider */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">TDS (Dissolved Solids)</span>
              <span className="font-mono text-teal-400 text-sm">{Math.round(simTds)} mg/L</span>
            </div>
            <input
              type="range"
              min="10"
              max="1500"
              step="10"
              value={simTds}
              onChange={(e) => setSimTds(parseFloat(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Soft (10)</span>
              <span>Limit (500)</span>
              <span>Mineralized (1500)</span>
            </div>
          </div>

          {/* Turbidity Slider */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Turbidity (Clarity)</span>
              <span className="font-mono text-blue-400 text-sm">{simTurbidity.toFixed(1)} NTU</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="40"
              step="0.5"
              value={simTurbidity}
              onChange={(e) => setSimTurbidity(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Clear (0.1)</span>
              <span>Limit (5.0)</span>
              <span>Muddy (40.0)</span>
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Temperature</span>
              <span className="font-mono text-amber-400 text-sm">{simTemp.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="2"
              max="45"
              step="0.5"
              value={simTemp}
              onChange={(e) => setSimTemp(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Frigid (2°C)</span>
              <span>Optimal (20°C)</span>
              <span>Hot (45°C)</span>
            </div>
          </div>
        </div>

        {/* Live Simulator Diagnosis Output */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-semibold text-slate-200">Real-Time Evaluation Summary:</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400">Calculated WQI:</span>
              <span className="font-bold text-cyan-400 text-sm">{simAnalysis.wqi.score}/100</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200 font-bold text-[10px]">
                Grade {simAnalysis.wqi.grade} ({simAnalysis.wqi.rating})
              </span>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed">{simAnalysis.summaryProse}</p>
        </div>
      </div>

      {/* Main Educational Chapters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Educational Modules
          </div>
          <div className="space-y-1">
            {topics.map((t) => {
              const Icon = t.icon;
              const isActive = activeTopic === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTopic(t.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 shadow-2xs border border-cyan-200 dark:border-cyan-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                  <span className="truncate">{t.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic Content Body */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Topic 1 */}
          {activeTopic === 'intro' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                What is Water Quality?
              </h2>
              <p>
                Water quality describes the physical, chemical, and biological characteristics of water relative to a specific purpose, such as human consumption, agriculture, industry, or ecological habitat.
              </p>
              <p>
                Pure water ($H_2O$) does not exist in nature. As water travels through rainclouds, over land surfaces, and through underground soil and rock strata, it continuously dissolves minerals, gases, and organic matter.
              </p>
              <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200">
                <span className="font-bold">Key Insight: </span>
                Water that looks clear can still contain harmful dissolved chemicals or microscopic bacteria. Complete water analysis requires both physical screening and laboratory microbiology.
              </div>
            </div>
          )}

          {/* Topic 2 */}
          {activeTopic === 'importance' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Why Water Quality Monitoring Matters
              </h2>
              <p>
                Continuous water monitoring provides an early warning system. Rather than discovering contamination after people fall ill or fish die, regular parameter checks spot abnormalities early.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs">
                <li>
                  <strong>Public Health Protection:</strong> Detects changes in acidity that could dissolve toxic metals from domestic plumbing pipes.
                </li>
                <li>
                  <strong>Environmental Stewardship:</strong> Identifies agricultural fertilizer runoff, sediment erosion, and industrial discharge into rivers and lakes.
                </li>
                <li>
                  <strong>Economic Security:</strong> Prevents costly mineral scaling damage to municipal water pumps, agricultural drip lines, and industrial machinery.
                </li>
              </ul>
            </div>
          )}

          {/* Topic 3 */}
          {activeTopic === 'ph' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Understanding pH: Acidity and Alkalinity
              </h2>
              <p>
                pH stands for "potential of hydrogen" and measures the relative concentration of free hydrogen ($H^+$) and hydroxyl ($OH^-$) ions on a logarithmic scale from 0 to 14.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>pH 7.0:</strong> Pure neutral water balance.</li>
                <li><strong>pH &lt; 6.5 (Acidic):</strong> Corrodes copper, lead, and brass pipes, imparting a metallic or sour taste. Severely damages fish gills and amphibians.</li>
                <li><strong>pH 6.5 – 8.5 (Recommended):</strong> Safe reference range recommended by the World Health Organization and EPA.</li>
                <li><strong>pH &gt; 8.5 (Alkaline):</strong> Produces soda-like taste, mineral encrustation in water heaters, and reduces the disinfection potency of chlorine.</li>
              </ul>
            </div>
          )}

          {/* Topic 4 */}
          {activeTopic === 'tds' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Total Dissolved Solids (TDS)
              </h2>
              <p>
                Total Dissolved Solids (TDS) represents the combined mass of all organic and inorganic substances dissolved in a given volume of water, expressed in milligrams per liter (mg/L) or parts per million (ppm).
              </p>
              <p>
                Common dissolved solids include calcium, magnesium, sodium, potassium, carbonate, bicarbonate, chloride, and sulfate.
              </p>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">TDS Guidance Ranges:</div>
                <div>• &lt; 300 mg/L: Excellent crisp drinking water</div>
                <div>• 300 – 500 mg/L: Good reference quality (EPA secondary recommendation ceiling)</div>
                <div>• 500 – 1000 mg/L: Fair quality; noticeable hardness and scaling</div>
                <div>• &gt; 1000 mg/L: Unacceptable aesthetic quality; brackish taste and appliance scaling</div>
              </div>
            </div>
          )}

          {/* Topic 5 */}
          {activeTopic === 'turbidity' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Turbidity: Optical Clarity and Suspended Particles
              </h2>
              <p>
                Turbidity is the measure of relative clarity of a liquid. It is measured in Nephelometric Turbidity Units (NTU) by shining a beam of light through a sample and calculating how much light is scattered by suspended matter.
              </p>
              <p>
                Causes of turbidity include soil erosion, stormwater runoff, decaying organic matter, and algal blooms.
              </p>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                <span className="font-bold">Why it matters for disinfection: </span>
                High turbidity particles create physical "shields" that prevent ultraviolet light and chlorine from reaching and destroying waterborne bacteria and viruses.
              </div>
            </div>
          )}

          {/* Topic 6 */}
          {activeTopic === 'temperature' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Why Water Temperature Matters
              </h2>
              <p>
                Temperature is a fundamental ecological driver. It governs:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs">
                <li>
                  <strong>Dissolved Oxygen Retention:</strong> Cold water holds significantly more dissolved oxygen than warm water. High temperatures can cause hypoxia (oxygen depletion), causing fish suffocation.
                </li>
                <li>
                  <strong>Chemical Reaction Speeds:</strong> Warm water speeds up mineral dissolution and chemical corrosion.
                </li>
                <li>
                  <strong>Microbial Reproduction:</strong> Warm water accelerates the proliferation of algae blooms and bacteria such as <em>Legionella</em> inside distribution piping.
                </li>
              </ul>
            </div>
          )}

          {/* Topic 7 */}
          {activeTopic === 'pollution' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Sources and Effects of Water Pollution
              </h2>
              <p>
                Water pollution originates from point sources (identifiable pipes, industrial factories, sewage outfalls) and non-point sources (agricultural fertilizer wash-off, highway oil residue, urban stormwater).
              </p>
              <p>
                Consequences include eutrophication (toxic algal blooms that rob water of oxygen), heavy metal accumulation in fish tissue, and contamination of drinking aquifers that take decades to remediate.
              </p>
            </div>
          )}

          {/* Topic 8 */}
          {activeTopic === 'conservation' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Water Conservation & Watershed Stewardship
              </h2>
              <p>
                Conserving water reduces the volumetric strain on wastewater treatment plants and preserves natural stream baseflow during seasonal droughts.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>Eliminate household plumbing leaks immediately.</li>
                <li>Protect riparian buffer zones (vegetated banks along rivers) to naturally filter silt before it enters open water.</li>
                <li>Avoid dumping motor oils, paints, or synthetic lawn chemicals into storm drains.</li>
              </ul>
            </div>
          )}

          {/* Topic 9 */}
          {activeTopic === 'laboratory' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Why Certified Laboratory Testing is Essential
              </h2>
              <p>
                While digital field meters provide indispensable screening for pH, TDS, Turbidity, and Temperature, they <strong>CANNOT</strong> detect:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>Microbiological Pathogens:</strong> <em>Escherichia coli</em>, Salmonella, Giardia lamblia, and viral cysts requiring incubated culture media or PCR assays.</li>
                <li><strong>Heavy Metals:</strong> Lead, Arsenic, Cadmium, and Mercury requiring Inductively Coupled Plasma Mass Spectrometry (ICP-MS).</li>
                <li><strong>Synthetic Organic Compounds:</strong> Pesticides, herbicides, pharmaceuticals, and PFAS ("forever chemicals") requiring Gas Chromatography (GC-MS).</li>
              </ul>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <strong>Standard Protocol: </strong>
                Whenever screening indicators deviate or when testing unverified private wells, always submit samples to a state-certified water testing laboratory for complete potability testing.
              </div>
            </div>
          )}

          {/* Bottom Action */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Ready to test your knowledge with real data?
            </span>
            <button
              onClick={() => onNavigate('test')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              <span>Log Water Sample Test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
