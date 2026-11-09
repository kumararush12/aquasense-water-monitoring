/**
 * AquaSense PDF Report Generator
 * Generates clean, publication-ready PDF water quality reports using jsPDF
 */

import { jsPDF } from 'jspdf';
import { WaterSample, WaterAnalysisResult } from '../types/water';
import { analyzeWaterSample } from './analysisEngine';
import { getStoredThresholds } from './storage';

export function generatePDFReport(sample: WaterSample): void {
  const thresholds = getStoredThresholds ? getStoredThresholds() : undefined;
  const analysis: WaterAnalysisResult = analyzeWaterSample(sample, thresholds);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Bar (Deep Navy background banner)
  doc.setFillColor(15, 23, 42); // slate-900 / navy
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title & Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AquaSense Environmental Monitoring', 16, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('SCIENTIFIC WATER QUALITY SCREENING & ANALYTICAL REPORT', 16, 19);

  // Report Date & ID in header right
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 16, 12, {
    align: 'right',
  });
  doc.text(`Doc Ref: REP-${sample.id}`, pageWidth - 16, 19, { align: 'right' });

  y = 38;

  // Sample Metadata Section
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Sample Identification & Chain of Custody', 20, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  // Column 1
  doc.text(`Sample ID: ${sample.id}`, 20, y + 14);
  doc.text(`Sample Name: ${sample.name}`, 20, y + 20);
  doc.text(`Location: ${sample.location}`, 20, y + 26);

  // Column 2
  const sampleDate = new Date(sample.timestamp).toLocaleString();
  doc.text(`Collection Time: ${sampleDate}`, 110, y + 14);
  doc.text(
    `Classification: ${sample.isDemo ? 'Demonstration Record (Fictional)' : 'Verified Field Input'}`,
    110,
    y + 20
  );
  if (sample.notes) {
    const truncatedNotes =
      sample.notes.length > 50
        ? sample.notes.substring(0, 47) + '...'
        : sample.notes;
    doc.text(`Notes: ${truncatedNotes}`, 110, y + 26);
  }

  y += 38;

  // Overall Screening Status Banner
  const isWithin = analysis.overallStatus === 'WITHIN DEMONSTRATION RANGES';
  if (isWithin) {
    doc.setFillColor(240, 253, 244); // green-50
    doc.setDrawColor(34, 197, 94); // green-500
    doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, 'FD');
    doc.setTextColor(22, 101, 52); // green-800
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('STATUS: WITHIN DEMONSTRATION RANGES', 20, y + 9);
    doc.setFontSize(9);
    doc.text(`WQI Score: ${analysis.wqi.score}/100 (Grade ${analysis.wqi.grade})`, pageWidth - 20, y + 9, { align: 'right' });
  } else {
    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(239, 68, 68); // red-500
    doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, 'FD');
    doc.setTextColor(153, 27, 27); // red-800
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(
      `STATUS: ${analysis.overallStatus} (${analysis.failedParameters.length} Flags)`,
      20,
      y + 9
    );
    doc.setFontSize(9);
    doc.text(`WQI Score: ${analysis.wqi.score}/100 (Grade ${analysis.wqi.grade})`, pageWidth - 20, y + 9, { align: 'right' });
  }

  y += 20;

  // Parameters Table Header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.line(14, y + 8, pageWidth - 14, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text('Parameter Indicator', 18, y + 5.5);
  doc.text('Measured Value', 70, y + 5.5);
  doc.text('Screening Reference', 110, y + 5.5);
  doc.text('Evaluation Status', 155, y + 5.5);

  y += 9;

  // Parameters Rows
  analysis.evaluations.forEach((evalItem) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    // Row zebra or line
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 7, pageWidth - 14, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.text(evalItem.displayName, 18, y + 4.5);

    doc.setFont('helvetica', 'normal');
    const valText = `${evalItem.value.toFixed(evalItem.parameter === 'tds' ? 0 : 2)} ${evalItem.unit}`;
    doc.text(valText, 70, y + 4.5);
    doc.text(evalItem.referenceRange, 110, y + 4.5);

    if (evalItem.status === 'WITHIN_RANGE') {
      doc.setTextColor(22, 101, 52);
      doc.text('Within Reference Range', 155, y + 4.5);
    } else {
      doc.setTextColor(185, 28, 28);
      doc.text(`Needs Attention (${evalItem.classification})`, 155, y + 4.5);
    }

    y += 8;
  });

  y += 4;

  // Analysis Breakdown & Findings
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Analytical Findings & Technical Interpretation', 20, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const findingsLines = doc.splitTextToSize(
    analysis.summaryProse,
    pageWidth - 40
  );
  doc.text(findingsLines, 20, y + 14);

  // Parameter explanations snippet
  let snippetY = y + 21;
  analysis.evaluations.forEach((item) => {
    if (snippetY < y + 36) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.displayName}: `, 20, snippetY);
      doc.setFont('helvetica', 'normal');
      const shortExp =
        item.explanation.length > 85
          ? item.explanation.substring(0, 82) + '...'
          : item.explanation;
      doc.text(shortExp, 65, snippetY);
      snippetY += 4.5;
    }
  });

  y += 44;

  // Actionable Treatment & Recommendations
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 36, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Recommended Actions & Mitigation Procedures', 20, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  let recY = y + 14;
  analysis.recommendations.slice(0, 4).forEach((rec, idx) => {
    doc.text(`${idx + 1}.`, 20, recY);
    const recLines = doc.splitTextToSize(rec, pageWidth - 48);
    doc.text(recLines, 26, recY);
    recY += recLines.length * 4.2;
  });

  y += 42;

  // Scientific & Regulatory Disclaimer
  doc.setFillColor(255, 251, 235); // amber-50
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setTextColor(180, 83, 9); // amber-700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(
    'MANDATORY SCIENTIFIC & REGULATORY COMPLIANCE DISCLAIMER',
    20,
    y + 6
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);
  const disclaimerLines = doc.splitTextToSize(
    analysis.disclaimer,
    pageWidth - 40
  );
  doc.text(disclaimerLines, 20, y + 12);

  // Footer
  const footerY = 286;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'AquaSense Environmental Systems · Precision Screening Suite · Educational & Research Use',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Save the PDF
  const filename = `AquaSense_Report_${sample.id}_${sample.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}
