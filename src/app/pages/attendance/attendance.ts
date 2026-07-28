import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolApiService } from '../../services/school-api.service';

type AttendanceStatus = 'Present' | 'Absent' | 'Late';

interface StudentRow {
  initials: string;
  name: string;
  idNumber: string;
  timeLogged: string;
  status: AttendanceStatus;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css'
})
export class Attendance implements OnInit {
  currentDate = new Date().toLocaleDateString();
  selectedGrade = 'All Grades';

  currentPage = 1;
  totalPages = 1;
  rangeStart = 0;
  rangeEnd = 0;
  totalEntries = 0;

  students: StudentRow[] = [];

  constructor(private readonly api: SchoolApiService) {}

  ngOnInit(): void {
    this.loadAttendance();
  }

  private loadAttendance(): void {
    this.api.getPage<any>('attendance', { page: this.currentPage - 1, size: 10 }).subscribe({
      next: response => {
        this.totalPages = Math.max(response.totalPages, 1);
        this.totalEntries = response.totalElements;
        this.rangeStart = response.totalElements === 0 ? 0 : response.number * response.size + 1;
        this.rangeEnd = Math.min((response.number + 1) * response.size, response.totalElements);
        this.students = response.content.map(record => ({
          initials: record.studentName.split(' ').map((part: string) => part[0]).join('').slice(0, 2),
          name: record.studentName,
          idNumber: `STU-${record.studentId}`,
          timeLogged: record.createdAt ? new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
          status: record.status[0] + record.status.slice(1).toLowerCase() as AttendanceStatus
        }));
      },
      error: error => console.error('Failed to load attendance', error)
    });
  }

  goToPrevDay(): void {
    console.log('Go to previous day');
  }

  goToNextDay(): void {
    console.log('Go to next day');
  }

  onMoreFilters(): void {
    console.log('More filters clicked');
  }

  onMarkAllPresent(): void {
    this.students = this.students.map(s => ({
      ...s,
      status: 'Present' as AttendanceStatus,
      timeLogged: s.timeLogged === '-' ? '09:00 AM' : s.timeLogged
    }));
  }

  onExport(): void {
    console.log('Export attendance clicked');
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadAttendance();
  }

  getStatusClass(status: AttendanceStatus): string {
    return 'status-' + status.toLowerCase();
  }
}
