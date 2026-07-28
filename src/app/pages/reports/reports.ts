import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GradeBar {
  grade: string;
  value: number;
  theme: 'default' | 'highlight' | 'warn';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports {
  periodMode: 'term' | 'year' = 'term';
  currentPeriod = 'Oct 2024';

  gradeDistribution: GradeBar[] = [
    { grade: 'A', value: 62, theme: 'default' },
    { grade: 'B', value: 100, theme: 'highlight' },
    { grade: 'C', value: 58, theme: 'default' },
    { grade: 'D', value: 30, theme: 'default' },
    { grade: 'F', value: 18, theme: 'warn' }
  ];

  tuitionCollected = '$2.4M';
  tuitionTrend = '+12% vs last term';
  tuitionProgressPercent = 78;
  outstanding = '$145k';
  scholarships = '$320k';

  growthLinePath = 'M0,90 C60,88 110,85 150,70 C190,55 220,20 260,12 C300,5 340,10 380,20 C420,30 460,32 500,30 C540,28 570,22 600,20 C630,18 660,20 700,22';
  growthMarkerX = 260;
  growthMarkerY = 12;
  growthPercent = '+24% Growth';

  constructor() {
    this.currentPeriod = 'Select academic data';
    this.gradeDistribution = [];
    this.tuitionCollected = '—';
    this.tuitionTrend = 'No financial API data';
    this.tuitionProgressPercent = 0;
    this.outstanding = '—';
    this.scholarships = '—';
    this.growthPercent = 'No report data';
  }

  setPeriodMode(mode: 'term' | 'year'): void {
    this.periodMode = mode;
  }

  onExportPdf(): void {
    console.log('Export grade distribution as PDF');
  }

  onExportCsvChart(): void {
    console.log('Export grade distribution as CSV');
  }

  onMoreOptions(): void {
    console.log('More chart options clicked');
  }

  onDownloadFinancial(): void {
    console.log('Download financial health data');
  }

  onViewFullLedger(): void {
    console.log('View full ledger clicked');
  }

  onGenerateReport(): void {
    console.log('Generate cognitive growth report clicked');
  }

  onExportCsvGrowth(): void {
    console.log('Export cognitive growth CSV clicked');
  }
}
