import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { PageResponse, SchoolApiService } from '../../services/school-api.service';

interface Teacher { id: number; name: string; staffId: string; designation: string; department?: string; phoneNumber: string; active: boolean; }
interface TeacherForm { staffId: string; name: string; designation: string; department: string; phoneNumber: string; loginEmail: string; loginPassword: string; employmentType: string; joiningDate: string; }

@Component({ selector: 'app-teachers', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './teachers.html', styleUrl: './teachers.css' })
export class Teachers implements OnInit, OnDestroy {
  readonly pageSize = 10;
  private readonly destroyed$ = new Subject<void>();
  private requestId = 0;
  searchTerm = '';
  activeOnly: boolean | undefined = undefined;
  currentPage = 1;
  totalPages = 1;
  totalResults = 0;
  activeCount = 0;
  inactiveCount = 0;
  loading = false;
  error = '';
  showForm = false;
  saving = false;
  teachers: Teacher[] = [];
  form: TeacherForm = this.emptyForm();

  constructor(private readonly api: SchoolApiService) {}
  ngOnInit(): void { this.loadTeachers(); }
  ngOnDestroy(): void { this.destroyed$.next(); this.destroyed$.complete(); }

  loadTeachers(): void {
    const id = ++this.requestId;
    this.loading = true;
    this.error = '';
    const params = { page: this.currentPage - 1, size: this.pageSize, category: 'ACADEMIC', keyword: this.searchTerm.trim() || undefined, active: this.activeOnly };
    forkJoin({
      directory: this.api.getPage<Teacher>('staff/filter', params),
      active: this.api.getPage<Teacher>('staff/filter', { page: 0, size: 1, category: 'ACADEMIC', active: true }),
      inactive: this.api.getPage<Teacher>('staff/filter', { page: 0, size: 1, category: 'ACADEMIC', active: false })
    }).pipe(takeUntil(this.destroyed$)).subscribe({
      next: data => {
        if (id !== this.requestId) return;
        this.teachers = data.directory.content;
        this.totalResults = data.directory.totalElements;
        this.totalPages = Math.max(1, data.directory.totalPages);
        this.activeCount = data.active.totalElements;
        this.inactiveCount = data.inactive.totalElements;
        this.loading = false;
      },
      error: error => { if (id === this.requestId) { this.loading = false; this.error = this.formatError(error); } }
    });
  }

  applyFilter(active: boolean | undefined): void { this.activeOnly = active; this.currentPage = 1; this.loadTeachers(); }
  search(): void { this.currentPage = 1; this.loadTeachers(); }
  goToPage(page: number): void { if (page >= 1 && page <= this.totalPages && page !== this.currentPage) { this.currentPage = page; this.loadTeachers(); } }
  pageStart(): number { return this.totalResults ? (this.currentPage - 1) * this.pageSize + 1 : 0; }
  pageEnd(): number { return Math.min(this.currentPage * this.pageSize, this.totalResults); }
  resetForm(): void { this.form = this.emptyForm(); this.error = ''; this.showForm = false; }

  saveTeacher(): void {
    if (this.saving) return;
    this.saving = true; this.error = '';
    const body = { ...this.form, staffCategory: 'ACADEMIC', teachingCapable: true, active: true, loginEmail: this.form.loginEmail || undefined, loginPassword: this.form.loginPassword || undefined, joiningDate: this.form.joiningDate || undefined };
    this.api.post<Teacher>('staff', body).pipe(takeUntil(this.destroyed$)).subscribe({
      next: () => { this.saving = false; this.resetForm(); this.currentPage = 1; this.loadTeachers(); },
      error: error => { this.saving = false; this.error = this.formatError(error); }
    });
  }

  exportCurrentResults(): void {
    const header = ['Staff ID', 'Name', 'Designation', 'Department', 'Phone', 'Status'];
    const rows = this.teachers.map(t => [t.staffId, t.name, t.designation, t.department ?? '', t.phoneNumber, t.active ? 'Active' : 'Inactive']);
    const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = 'teachers.csv'; link.click(); URL.revokeObjectURL(link.href);
  }

  private emptyForm(): TeacherForm { return { staffId: '', name: '', designation: 'Teacher', department: '', phoneNumber: '', loginEmail: '', loginPassword: '', employmentType: 'PERMANENT', joiningDate: '' }; }
  private formatError(error: any): string { return error?.error?.message || error?.error?.error || 'The request could not be completed. Check the entered details and try again.'; }
}
