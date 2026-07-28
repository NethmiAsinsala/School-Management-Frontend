import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolApiService } from '../../services/school-api.service';

type SubjectCategory = 'core' | 'science' | 'language' | 'free';

interface TimetableCell {
  subject?: string;
  teacher?: string;
  room?: string;
  category: SubjectCategory;
  isFree?: boolean;
}

interface TimetableRow {
  time: string;
  monday: TimetableCell;
  tuesday: TimetableCell;
  wednesday: TimetableCell;
  thursday: TimetableCell;
  friday: TimetableCell;
}

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timetable.html',
  styleUrl: './timetable.css'
})
export class Timetable implements OnInit {
  selectedGrade = 'Select a class';
  selectedClassId = '';
  classes: { id: number; name: string }[] = [];
  todayColumn: keyof Omit<TimetableRow, 'time'> = 'wednesday';

  days: { key: keyof Omit<TimetableRow, 'time'>; label: string }[] = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' }
  ];

  rows: TimetableRow[] = [
    {
      time: '08:00 AM',
      monday: { subject: 'Mathematics', teacher: 'Mr. Smith', room: 'Rm 302', category: 'core' },
      tuesday: { subject: 'Physics', teacher: 'Dr. Allen', room: 'Lab 1', category: 'science' },
      wednesday: { subject: 'Mathematics', teacher: 'Mr. Smith', room: 'Rm 302', category: 'core' },
      thursday: { subject: 'English Lit', teacher: 'Ms. Davis', room: 'Rm 104', category: 'core' },
      friday: { category: 'free', isFree: true }
    },
    {
      time: '09:00 AM',
      monday: { subject: 'Chemistry', teacher: 'Dr. Allen', room: 'Lab 2', category: 'science' },
      tuesday: { subject: 'French', teacher: 'Mme. Dubois', room: 'Rm 201', category: 'language' },
      wednesday: { subject: 'Biology', teacher: 'Dr. Allen', room: 'Lab 1', category: 'science' },
      thursday: { subject: 'Mathematics', teacher: 'Mr. Smith', room: 'Rm 302', category: 'core' },
      friday: { subject: 'French', teacher: 'Mme. Dubois', room: 'Rm 201', category: 'language' }
    },
    {
      time: '10:00 AM',
      monday: { subject: 'English Lit', teacher: 'Ms. Davis', room: 'Rm 104', category: 'core' },
      tuesday: { subject: 'Mathematics', teacher: 'Mr. Smith', room: 'Rm 302', category: 'core' },
      wednesday: { category: 'free', isFree: true },
      thursday: { subject: 'Physics', teacher: 'Dr. Allen', room: 'Lab 1', category: 'science' },
      friday: { subject: 'Mathematics', teacher: 'Mr. Smith', room: 'Rm 302', category: 'core' }
    },
    {
      time: '11:00 AM',
      monday: { subject: 'Spanish', teacher: 'Sr. Lopez', room: 'Rm 205', category: 'language' },
      tuesday: { subject: 'Biology', teacher: 'Dr. Allen', room: 'Lab 1', category: 'science' },
      wednesday: { subject: 'English Lit', teacher: 'Ms. Davis', room: 'Rm 104', category: 'core' },
      thursday: { subject: 'Spanish', teacher: 'Sr. Lopez', room: 'Rm 205', category: 'language' },
      friday: { subject: 'Chemistry', teacher: 'Dr. Allen', room: 'Lab 2', category: 'science' }
    }
  ];

  constructor(private readonly api: SchoolApiService) {
    this.rows = [];
  }

  ngOnInit(): void {
    this.api.get<{ id: number; name: string }[]>('classes/active').subscribe({
      next: classes => { this.classes = classes; if (classes.length) { this.selectedClassId = String(classes[0].id); this.loadTimetable(); } },
      error: error => console.error('Failed to load classes', error)
    });
  }

  loadTimetable(): void {
    const classId = Number(this.selectedClassId);
    const current = this.classes.find(item => item.id === classId);
    this.selectedGrade = current?.name ?? 'Select a class';
    if (!classId) { this.rows = []; return; }
    this.api.get<any[]>(`timetable/class/${classId}`).subscribe({ next: entries => this.rows = this.mapRows(entries), error: error => { console.error('Failed to load timetable', error); this.rows = []; } });
  }

  private mapRows(entries: any[]): TimetableRow[] {
    const grouped = new Map<string, TimetableRow>();
    const blank = (): TimetableCell => ({ category: 'free', isFree: true });
    for (const entry of entries) {
      const key = entry.startTime;
      if (!grouped.has(key)) grouped.set(key, { time: entry.startTime, monday: blank(), tuesday: blank(), wednesday: blank(), thursday: blank(), friday: blank() });
      const day = String(entry.dayOfWeek).toLowerCase() as keyof Omit<TimetableRow, 'time'>;
      if (day in grouped.get(key)!) grouped.get(key)![day] = { subject: entry.subjectName, teacher: entry.staffName, room: entry.roomNumber || '—', category: 'core' };
    }
    return [...grouped.values()].sort((a, b) => a.time.localeCompare(b.time));
  }

  onGradeChange(): void {
    this.loadTimetable();
  }

  onEditTimetable(): void {
    console.log('Edit timetable clicked');
  }
}
