import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type AttendanceStatus = 'Present' | 'Absent' | 'Late';

interface StudentRow {
  initials: string;
  name: string;
  idNumber: string;
  timeLogged: string;
  status: AttendanceStatus;
  avatarTheme: 'blue' | 'purple';
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css'
})
export class Attendance {
  currentDate = 'Oct 24, 2023';
  selectedGrade = 'All Grades';

  currentPage = 1;
  totalPages = 3;
  totalEntries = 35;
  rangeStart = 1;
  rangeEnd = 4;

  students: StudentRow[] = [
    {
      initials: 'SP',
      name: 'Sahan Perera',
      idNumber: 'STU-2021-045',
      timeLogged: '07:45 AM',
      status: 'Present',
      avatarTheme: 'blue'
    },
    {
      initials: 'DF',
      name: 'Dinithi Fernando',
      idNumber: 'STU-2021-082',
      timeLogged: '-',
      status: 'Absent',
      avatarTheme: 'purple'
    },
    {
      initials: 'KS',
      name: 'Kavindu Silva',
      idNumber: 'STU-2021-112',
      timeLogged: '08:20 AM',
      status: 'Late',
      avatarTheme: 'purple'
    },
    {
      initials: 'NJ',
      name: 'Nethmi Jayasooriya',
      idNumber: 'STU-2021-154',
      timeLogged: '07:50 AM',
      status: 'Present',
      avatarTheme: 'blue'
    }
  ];

  goToPreviousDay(): void {
    console.log('Previous day clicked');
  }

  goToNextDay(): void {
    console.log('Next day clicked');
  }

  onMoreFilters(): void {
    console.log('More filters clicked');
  }

  onMarkAllPresent(): void {
    this.students = this.students.map(s => ({ ...s, status: 'Present' as AttendanceStatus, timeLogged: s.timeLogged === '-' ? '08:00 AM' : s.timeLogged }));
  }

  onExport(): void {
    console.log('Export clicked');
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  getStatusClass(status: AttendanceStatus): string {
    return 'status-' + status.toLowerCase();
  }
}