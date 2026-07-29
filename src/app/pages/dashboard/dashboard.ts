import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SchoolApiService } from '../../services/school-api.service';
import { PageHeader } from '../../components/page-header/page-header';

interface Student { id: number; name: string; admissionNumber?: string; currentClassName?: string; }
interface Notice { id: number; title: string; content?: string; published?: boolean; createdAt?: string; }
interface Attendance { status?: string; }

@Component({ selector: 'app-dashboard', standalone: true, imports: [CommonModule, PageHeader], templateUrl: './dashboard.html', styleUrl: './dashboard.css' })
export class DashboardComponent implements OnInit {
  totalStudents = 0;
  totalStaff = 0;
  totalExams = 0;
  attendanceRate = '—';
  recentStudents: Student[] = [];
  notices: Notice[] = [];
  loading = false;
  error = '';
  private requestId = 0;
  constructor(private readonly api: SchoolApiService, private readonly router: Router, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    const id = ++this.requestId; this.loading = true; this.error = '';
    const today = new Date().toISOString().slice(0, 10);
    forkJoin({
      students: this.api.getPage<Student>('students', { page: 0, size: 5, sort: 'createdAt,desc' }),
      staff: this.api.getPage<unknown>('staff', { page: 0, size: 1 }),
      exams: this.api.getPage<unknown>('exams', { page: 0, size: 1 }),
      attendance: this.api.getPage<Attendance>('attendance/filter', { page: 0, size: 100, from: today, to: today }),
      notices: this.api.getPage<Notice>('notices', { page: 0, size: 5, sort: 'createdAt,desc' })
    }).subscribe({
      next: data => {
        if (id !== this.requestId) return;
        this.totalStudents = data.students.totalElements;
        this.totalStaff = data.staff.totalElements;
        this.totalExams = data.exams.totalElements;
        const present = data.attendance.content.filter(record => record.status === 'PRESENT' || record.status === 'LATE').length;
        this.attendanceRate = data.attendance.totalElements ? `${Math.round((present / data.attendance.totalElements) * 100)}%` : '—';
        this.recentStudents = data.students.content;
        this.notices = data.notices.content;
        this.loading = false; this.cdr.detectChanges();
      },
      error: error => { if (id !== this.requestId) return; this.loading = false; this.error = error?.error?.message || 'Unable to load dashboard data.'; this.cdr.detectChanges(); }
    });
  }
  onAddStudent(): void { this.router.navigate(['/admin/students']); }
  viewStudent(): void { this.router.navigate(['/admin/students']); }
  viewNotices(): void { this.router.navigate(['/admin/notices']); }
  exportDashboard(): void { const csv = [['Metric', 'Value'], ['Students', this.totalStudents], ['Active staff', this.totalStaff], ['Exams', this.totalExams], ['Today attendance', this.attendanceRate]].map(row => row.join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'dashboard-summary.csv'; link.click(); URL.revokeObjectURL(url); }
}
