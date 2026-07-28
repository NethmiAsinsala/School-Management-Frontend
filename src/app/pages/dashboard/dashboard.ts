import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SchoolApiService } from '../../services/school-api.service';
import { PageHeader } from '../../components/page-header/page-header';
import { StatCard } from '../../components/stat-card/stat-card';
import { QuickActions } from '../../components/quick-actions/quick-actions';
import { UpcomingEvents } from '../../components/upcoming-events/upcoming-events';
import { AttendanceChart } from '../../components/attendance-chart/attendance-chart';
import { RecentEnrollments } from '../../components/recent-enrollments/recent-enrollments';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PageHeader,
    StatCard,
    QuickActions,
    UpcomingEvents,
    AttendanceChart,
    RecentEnrollments
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  totalStudents = '0';
  totalStaff = '0';
  totalExams = '0';
  attendanceRate = '—';

  constructor(private readonly api: SchoolApiService, private readonly router: Router) {}

  ngOnInit(): void {
    forkJoin({ students: this.api.getPage<any>('students', { page: 0, size: 1 }), staff: this.api.getPage<any>('staff', { page: 0, size: 1 }), exams: this.api.getPage<any>('exams', { page: 0, size: 1 }) }).subscribe({
      next: totals => { this.totalStudents = String(totals.students.totalElements); this.totalStaff = String(totals.staff.totalElements); this.totalExams = String(totals.exams.totalElements); },
      error: error => console.error('Failed to load dashboard totals', error)
    });
  }
  onExportReports(): void {
    console.log('Export reports clicked');
  }

  onAddStudent(): void {
    this.router.navigate(['/admin/students']);
  }
}
