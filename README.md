# AquaSense — Water Quality Monitoring & Diagnostic Platform

> **Monitor Water · Understand Quality · Protect Life**
> A modern, professional, browser-based environmental technology platform for physical-chemical water parameter screening, chronological trend analysis, multi-sample comparison, and publication-ready diagnostic reports.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Four Core Screening Parameters](#four-core-screening-parameters)
- [Deterministic Analysis Engine](#deterministic-analysis-engine)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Installation & Local Setup](#installation--local-setup)
- [Step-by-Step GitHub Upload Instructions](#step-by-step-github-upload-instructions)
- [Deployment Guide](#deployment-guide)
- [Important Scientific Limitations & Disclaimer](#important-scientific-limitations--disclaimer)
- [License](#license)

---

## Overview

**AquaSense** is a comprehensive environmental technology application designed for water technicians, environmental monitors, students, and watershed conservationists. It delivers rapid, client-side physical-chemical screening of water samples against configurable World Health Organization (WHO) and United States Environmental Protection Agency (EPA) demonstration reference ranges.

The platform requires **no external subscriptions, paid APIs, or cloud database infrastructure**. All data persistence runs securely and offline in client-side LocalStorage.

---

## Key Features

1. **Interactive SaaS Dashboard**
   - High-level KPIs: Total tests conducted, proportion within reference ranges, tests requiring attention, latest sample status.
   - Chronological parameter trend visualizations powered by **Recharts**:
     - pH trajectory with reference corridor limits (6.50–8.50).
     - Total Dissolved Solids (TDS) bar chart with 500 mg/L threshold line.
     - Turbidity area chart with 5.0 NTU clarity threshold.
     - Water temperature thermal tracking curve.
     - Donut chart showing overall compliance distribution.
   - Date range filters: *Today*, *Last 7 Days*, *Last 30 Days*, and *All Time*.
   - Filter toggle between Field/User records and Demonstration samples.

2. **Water Sample Testing & Diagnostic Form**
   - Automated Sample ID generation (`AQ-YYYY-XXXX`) with one-click regeneration.
   - Fields: Sample Name, Sampling Location, Date & Time, pH, TDS (mg/L), Turbidity (NTU), Temperature (°C), and Field Notes.
   - Real-time client-side input validation with descriptive inline feedback.
   - Quick-load preset scenarios: *Standard Tap Baseline*, *Acidic Mine Drainage*, *Turbid Stormwater Runoff*, and *High-Mineral Well*.
   - Instant rule-based diagnostic evaluation upon submission.

3. **Deterministic Water Quality Analysis Engine & WQI Scoring**
   - Evaluates each indicator against configurable screening standards.
   - Computes a mathematical **Water Quality Index (WQI)** score (0–100) and letter grade (A through E) using weighted sub-indices.
   - Classifies sample as **WITHIN DEMONSTRATION RANGES**, **NEEDS ATTENTION**, or **INCOMPLETE DATA**.
   - Generates contextual, engineering-grade remediation recommendations (e.g. limestone buffering, reverse osmosis, coagulant sedimentation, thermal aeration).

4. **Historical Records Archive & Data Mobility**
   - Full search across sample name, ID, location, and sensory notes.
   - Filter by Screening Status (*All*, *Within Range*, *Needs Attention*) and Origin (*All*, *Field User*, *Demo*).
   - Multi-parameter sorting: Newest, Oldest, Highest pH, Lowest pH, Highest TDS, Highest Turbidity.
   - Row-level actions: Open Diagnostic Report, Delete Sample.
   - Global actions: Multi-select comparison, Clear All records, Reset to 10 Demonstration samples.
   - **JSON Database Backup & Restore**: One-click download of the complete dataset and configuration as a `.json` backup, with instant file-upload restoration across devices.
   - Complete RFC-4180 compliant CSV export for spreadsheet auditing.

5. **Multi-Sample Comparison Tool**
   - Compare 2 to 5 water sources side-by-side in a structured comparison matrix.
   - Automated delta difference calculations ($\Delta\text{pH}$, $\Delta\text{TDS}$, $\Delta\text{Turbidity}$, $\Delta\text{Temp}$).
   - Highlights extreme parameter divergences across sites.
   - Comparative multi-bar charts for cross-sample visual analysis.

6. **Certified Report Generator**
   - Interactive report modal with full custody details, parameter tables, and findings.
   - One-click **Download PDF** using `jspdf` (clean vector layout with official banners and disclaimers).
   - Browser **Print Report** action with dedicated `@media print` clean formatting.
   - CSV export for single-sample integration into laboratory information systems (LIMS).

7. **Demonstration Mode**
   - Includes 10 realistic, varied fictional water samples (pristine mountain springs, treated municipal taps, industrial stormwater, pine bog acidity, and agricultural runoff).
   - Explicitly tagged with `DEMO DATA` to ensure clear separation from real field measurements.
   - One-click reset to restore the original demonstration dataset.

8. **Educational Hub & Interactive Simulator**
   - 9 scientific educational modules explaining water quality principles, parameter chemistry, pollution causes, and watershed conservation.
   - Interactive live parameter sandbox with real-time sliders for simulated testing.

9. **Dual-Theme Support (Light & Dark Mode)**
   - Seamless toggle between clean scientific light mode and low-glare dark mode.
   - Configured with Tailwind CSS v4 `@custom-variant dark`.

---

## Four Core Screening Parameters

| Parameter | Demonstration Reference Range | Significance |
| :--- | :--- | :--- |
| **pH (Potential of Hydrogen)** | `6.50 – 8.50` | Logarithmic measure of acidity/alkalinity. Low pH corrodes pipes and leaches heavy metals; high pH causes mineral encrustation and inhibits chlorine disinfection. |
| **Total Dissolved Solids (TDS)** | `≤ 500 mg/L` | Concentration of dissolved inorganic minerals and salts. Elevated TDS causes brackish taste, gastrointestinal irritation, and severe appliance scaling. |
| **Turbidity** | `≤ 5.0 NTU` | Measure of water clarity and suspended particulate matter. Suspended particles shield waterborne pathogens from UV and chlorination disinfection. |
| **Water Temperature** | `10.0 – 25.0 °C` | Fundamental driver of gas solubility and biological kinetics. Warmer water holds less dissolved oxygen (DO) and accelerates bacterial proliferation. |

*Note: Screening reference thresholds can be customized at any time via the Settings modal.*

---

## Tech Stack

- **Frontend Framework**: React 19 (Functional components, React Hooks)
- **Language**: TypeScript (Strict typing, comprehensive data models)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`, `@custom-variant dark`)
- **Data Visualization**: Recharts (Line, Bar, Area, Donut, and Radar charts)
- **Document Generation**: jsPDF (Vector PDF report compilation)
- **Icons**: Lucide React
- **Data Storage**: Client-Side LocalStorage (Offline capable, zero telemetry)
- **Build Tool**: Vite 8 & TSX

---

## Project Architecture

```
aquasense/
├── index.html                   # HTML entry point with fonts & metadata
├── metadata.json                # Project capabilities & configuration
├── package.json                 # Dependencies & build scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS plugin
├── README.md                    # Project documentation & GitHub guide
└── src/
    ├── main.tsx                 # Application mount point
    ├── App.tsx                  # Root component, routing, and global state
    ├── index.css                # Tailwind CSS v4 layer and print rules
    ├── assets/
    │   └── images/              # High-grade laboratory & field photography
    ├── components/
    │   ├── Navbar.tsx           # 3-Zone top navigation & mobile drawer
    │   ├── Footer.tsx           # Environmental science footer & disclaimers
    │   ├── Toast.tsx            # Feedback notification system
    │   ├── ConfirmModal.tsx     # Reusable accessible confirmation dialog
    │   ├── SettingsModal.tsx    # Configurable screening threshold settings
    │   └── ReportModal.tsx      # Diagnostic report viewer (PDF, Print, CSV)
    ├── types/
    │   └── water.ts             # TypeScript interfaces and data models
    ├── utils/
    │   ├── analysisEngine.ts    # Deterministic rule-based screening engine
    │   ├── demoData.ts          # 10 diverse fictional demonstration records
    │   ├── storage.ts           # LocalStorage, CSV export, and ID generator
    │   └── pdfGenerator.ts      # Client-side PDF report builder
    └── views/
        ├── HomeView.tsx         # Hero landing, parameter guide, workflow
        ├── DashboardView.tsx    # KPIs, Recharts trends, date filters
        ├── TestingView.tsx      # Testing form, live validation, presets
        ├── HistoryView.tsx      # Records table, search, multi-filters, sort
        ├── ComparisonView.tsx   # Side-by-side comparison matrix & diffs
        ├── EducationView.tsx    # 9 learning guides & parameter simulator
        └── AboutView.tsx        # System architecture, mission, and roadmap
```

---

## Installation & Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 18.0.0 or higher recommended)
- `npm` (Version 9.0.0 or higher)

### Steps

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aquasense-water-monitoring.git
   cd aquasense-water-monitoring
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` (or the port indicated in your terminal).

4. **Build for Production**:
   ```bash
   npm run build
   ```
   The compiled, production-ready static assets will be output to the `dist/` directory.

---

## Step-by-Step GitHub Upload Instructions

Follow these exact steps to push this complete project to your personal GitHub account:

### 1. Initialize Git Locally
Open your terminal in the root folder of the project:
```bash
git init
git add .
git commit -m "Initial commit: Complete AquaSense Water Quality Monitoring Platform"
```

### 2. Create a New Repository on GitHub
1. Log in to [GitHub](https://github.com).
2. Click the **+** icon in the upper-right corner and select **New repository**.
3. Set the Repository name to `aquasense-water-monitoring`.
4. Choose **Public** (or **Private**).
5. **Do NOT** check "Add a README file", ".gitignore", or "license" (we already have complete files included).
6. Click **Create repository**.

### 3. Link Remote and Push
Copy your repository URL from GitHub and run:
```bash
# Rename default branch to main
git branch -M main

# Add your GitHub repository as the origin remote
git remote add origin https://github.com/YOUR_USERNAME/aquasense-water-monitoring.git

# Push code to GitHub
git push -u origin main
```

*(Replace `YOUR_USERNAME` with your actual GitHub username).*

---

## Deployment Guide

Because AquaSense is an optimized client-side React SPA, it can be deployed for free in under two minutes to any static hosting provider:

### Deploying to Vercel
1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project folder and follow the prompts.
3. Or import your GitHub repository directly at [vercel.com/new](https://vercel.com/new).

### Deploying to Netlify
1. Drag and drop the `dist/` folder into [Netlify Drop](https://app.netlify.com/drop).
2. Or connect your GitHub repository and set the build command to `npm run build` with publish directory `dist`.

### Deploying to GitHub Pages
1. Install `gh-pages`: `npm install -D gh-pages`
2. Add `"homepage": "https://YOUR_USERNAME.github.io/aquasense-water-monitoring"` to `package.json`.
3. Add deploy script to `package.json`: `"deploy": "gh-pages -d dist"`.
4. Run `npm run build && npm run deploy`.

---

## Important Scientific Limitations & Disclaimer

> **SCIENTIFIC NOTICE**: AquaSense is an educational and screening platform. The rule-based evaluation of pH, TDS, Turbidity, and Temperature serves as a preliminary physical-chemical indicator. It **CANNOT** guarantee drinking water safety or substitute for accredited laboratory testing (e.g., microbiological cultures for *E. coli* or coliform pathogens, mass spectrometry for toxic heavy metals like lead and arsenic, or chromatography for synthetic pesticides and PFAS). Always escalate suspect water sources to certified analytical laboratories.

---

## License

This project is licensed under the Apache-2.0 License.
