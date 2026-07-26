import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './timetable.html',
  styleUrl: './timetable.css'
})
export class Timetable {
  selectedGrade = 'Grade 10 - A';
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

  onGradeChange(): void {
    console.log('Grade selector clicked');
  }

  onEditTimetable(): void {
    console.log('Edit timetable clicked');
  }
}
