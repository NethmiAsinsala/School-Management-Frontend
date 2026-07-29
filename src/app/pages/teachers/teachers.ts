import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { SchoolApiService } from '../../services/school-api.service';

interface Teacher {
  id: number;
  staffId: string;
  name: string;
  designation: string;
  department?: string;
  phoneNumber: string;
  active: boolean;
  employmentType?: string;
  joiningDate?: string;
}

interface TeacherForm {
  staffId: string;
  name: string;
  designation: string;
  department: string;
  phoneNumber: string;
  employmentType: string;
  joiningDate: string;
  loginEmail: string;
  loginPassword: string;
}

@Component({ selector: 'app-teachers', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './teachers.html', styleUrl: './teachers.css' })
export class Teachers implements OnInit, OnDestroy {
  readonly pageSize = 10;
  private readonly destroyed$ = new Subject<void>();
  private requestId = 0;
  searchTerm = '';
  departmentFilter = '';
  activeOnly: boolean | undefined = undefined;
  currentPage = 1;
  totalPages = 1;
  totalResults = 0;
  activeCount = 0;
  inactiveCount = 0;
  loading = false;
  saving = false;
  error = '';
  success = '';
  showForm = false;
  editingTeacher: Teacher | null = null;
  teachers: Teacher[] = [];
  form: TeacherForm = this.emptyForm();

  constructor(private readonly api: SchoolApiService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadTeachers(); }
  ngOnDestroy(): void { this.destroyed$.next(); this.destroyed$.complete(); }

  loadTeachers(): void {
    const id = ++this.requestId;
    this.loading = true;
    this.error = '';
    const params = {
      page: this.currentPage - 1,
      size: this.pageSize,
      category: 'ACADEMIC',
      keyword: this.searchTerm.trim() || undefined,
      department: this.departmentFilter.trim() || undefined,
      active: this.activeOnly
    };
    this.api.getPage<Teacher>('staff/filter', params).pipe(takeUntil(this.destroyed$)).subscribe({
      next: directory => {
        if (id !== this.requestId) return;
        this.teachers = directory.content;
        this.totalResults = directory.totalElements;
        this.totalPages = Math.max(1, directory.totalPages);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        if (id !== this.requestId) return;
        this.loading = false;
        this.error = this.formatError(error);
        this.cdr.detectChanges();
      }
    });

    forkJoin({
      active: this.api.getPage<Teacher>('staff/filter', { page: 0, size: 1, category: 'ACADEMIC', active: true }),
      inactive: this.api.getPage<Teacher>('staff/filter', { page: 0, size: 1, category: 'ACADEMIC', active: false })
    }).pipe(takeUntil(this.destroyed$)).subscribe({
      next: counts => {
        if (id !== this.requestId) return;
        this.activeCount = counts.active.totalElements;
        this.inactiveCount = counts.inactive.totalElements;
        this.cdr.detectChanges();
      }
    });
  }

  search(): void { this.currentPage = 1; this.loadTeachers(); }
  clearFilters(): void { this.searchTerm = ''; this.departmentFilter = ''; this.activeOnly = undefined; this.currentPage = 1; this.loadTeachers(); }
  applyStatus(active: boolean | undefined): void { this.activeOnly = active; this.currentPage = 1; this.loadTeachers(); }
  goToPage(page: number): void { if (page >= 1 && page <= this.totalPages && page !== this.currentPage) { this.currentPage = page; this.loadTeachers(); } }
  pageStart(): number { return this.totalResults ? (this.currentPage - 1) * this.pageSize + 1 : 0; }
  pageEnd(): number { return Math.min(this.currentPage * this.pageSize, this.totalResults); }

  openCreate(): void { this.editingTeacher = null; this.form = this.emptyForm(); this.error = ''; this.success = ''; this.showForm = true; }
  openEdit(teacher: Teacher): void {
    this.editingTeacher = teacher;
    this.form = { staffId: teacher.staffId, name: teacher.name, designation: teacher.designation, department: teacher.department ?? '', phoneNumber: teacher.phoneNumber, employmentType: teacher.employmentType ?? 'PERMANENT', joiningDate: teacher.joiningDate ?? '', loginEmail: '', loginPassword: '' };
    this.error = ''; this.success = ''; this.showForm = true;
  }
  closeForm(): void { this.showForm = false; this.editingTeacher = null; this.form = this.emptyForm(); }

  saveTeacher(): void {
    if (this.saving) return;
    this.saving = true; this.error = ''; this.success = '';
    const base = { staffId: this.form.staffId, name: this.form.name.trim(), designation: this.form.designation.trim(), department: this.form.department.trim() || undefined, phoneNumber: this.form.phoneNumber.trim(), employmentType: this.form.employmentType, joiningDate: this.form.joiningDate || undefined, staffCategory: 'ACADEMIC', teachingCapable: true };
    const request = this.editingTeacher
      ? this.api.patch<Teacher>(`staff/${this.editingTeacher.id}`, base)
      : this.api.post<Teacher>('staff', { ...base, active: true, loginEmail: this.form.loginEmail.trim() || undefined, loginPassword: this.form.loginPassword || undefined });
    request.pipe(takeUntil(this.destroyed$)).subscribe({
      next: () => { this.saving = false; this.success = this.editingTeacher ? 'Teacher updated successfully.' : 'Teacher created successfully.'; this.closeForm(); this.currentPage = 1; this.loadTeachers(); },
      error: error => { this.saving = false; this.error = this.formatError(error); this.cdr.detectChanges(); }
    });
  }

  deactivate(teacher: Teacher): void {
    if (!teacher.active || !confirm(`Deactivate ${teacher.name}?`)) return;
    this.error = ''; this.success = '';
    this.api.delete(`staff/${teacher.id}`).pipe(takeUntil(this.destroyed$)).subscribe({
      next: () => { this.success = 'Teacher deactivated successfully.'; this.loadTeachers(); },
      error: error => { this.error = this.formatError(error); this.cdr.detectChanges(); }
    });
  }

  exportCurrentResults(): void {
    const header = ['Staff ID', 'Name', 'Designation', 'Department', 'Phone', 'Employment', 'Status'];
    const rows = this.teachers.map(t => [t.staffId, t.name, t.designation, t.department ?? '', t.phoneNumber, t.employmentType ?? '', t.active ? 'Active' : 'Inactive']);
    const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'teachers.csv'; link.click(); URL.revokeObjectURL(url);
  }

  private emptyForm(): TeacherForm { return { staffId: '', name: '', designation: 'Teacher', department: '', phoneNumber: '', employmentType: 'PERMANENT', joiningDate: '', loginEmail: '', loginPassword: '' }; }
  private formatError(error: any): string { return error?.error?.message || error?.error?.error || 'The request could not be completed. Check the entered details and try again.'; }
}
