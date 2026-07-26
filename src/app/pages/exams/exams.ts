import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ScheduleItem {
  month: string;
  day: string;
  dateTheme: 'blue' | 'purple';
  title: string;
  meta: string;
  time: string;
  duration: string;
}

interface OperationItem {
  label: string;
  icon: 'printer' | 'roster' | 'queue';
}

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exams.html',
  styleUrl: './exams.css'
})
export class Exams {
  processingStages = ['Scanning OMRs', 'Reviewing', 'Publishing'];
  currentStageIndex = 1; // "Reviewing" is the active/current stage
  processingPercent = 68;
  processingSubject = 'Grade 10 Mathematics';

  schedule: ScheduleItem[] = [
    {
      month: 'NOV',
      day: '14',
      dateTheme: 'blue',
      title: 'Advanced Physics (Theory)',
      meta: 'Grade 12 • Section A & B • Room 402',
      time: '09:00 AM',
      duration: '3 Hours'
    },
    {
      month: 'NOV',
      day: '15',
      dateTheme: 'purple',
      title: 'World History',
      meta: 'Grade 10 • All Sections • Main Hall',
      time: '10:30 AM',
      duration: '2 Hours'
    },
    {
      month: 'NOV',
      day: '18',
      dateTheme: 'blue',
      title: 'Computer Science Practicals',
      meta: 'Grade 11 • Section C • CS Lab 1',
      time: '01:00 PM',
      duration: '1.5 Hours'
    }
  ];

  operations: OperationItem[] = [
    { label: 'Print Hall Tickets', icon: 'printer' },
    { label: 'Invigilator Duty Roster', icon: 'roster' },
    { label: 'Result Publishing Queue', icon: 'queue' }
  ];

  isStageDone(index: number): boolean {
    return index < this.currentStageIndex;
  }

  isStageActive(index: number): boolean {
    return index === this.currentStageIndex;
  }

  onViewActiveExams(): void {
    console.log('View active exams clicked');
  }

  onViewPendingResults(): void {
    console.log('View pending results clicked');
  }

  onViewAllSchedule(): void {
    console.log('View all schedule clicked');
  }

  onScheduleItemClick(item: ScheduleItem): void {
    console.log('Open schedule item:', item.title);
  }

  onOperationClick(operation: OperationItem): void {
    console.log('Operation clicked:', operation.label);
  }
}
