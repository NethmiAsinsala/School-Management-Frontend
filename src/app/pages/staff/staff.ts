import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { SchoolApiService } from '../../services/school-api.service';

interface StaffRecord { id: number; staffId: string; name: string; designation: string; department?: string; phoneNumber: string; active: boolean; staffCategory?: string; employmentType?: string; joiningDate?: string; }
interface StaffForm { staffId: string; name: string; designation: string; department: string; phoneNumber: string; staffCategory: string; employmentType: string; joiningDate: string; loginEmail: string; loginPassword: string; }

@Component({ selector: 'app-staff', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './staff.html', styleUrl: './staff.css' })
export class Staff implements OnInit, OnDestroy {
  readonly pageSize = 10;
  private readonly destroyed$ = new Subject<void>();
  private requestId = 0;
  staff: StaffRecord[] = [];
  query = '';
  department = '';
  category = '';
  active: boolean | undefined = undefined;
  page = 0;
  total = 0;
  totalPages = 1;
  activeCount = 0;
  inactiveCount = 0;
  loading = false;
  saving = false;
  error = '';
  success = '';
  showForm = false;
  editing: StaffRecord | null = null;
  form: StaffForm = this.emptyForm();

  constructor(private readonly api: SchoolApiService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void { this.destroyed$.next(); this.destroyed$.complete(); }

  load(): void {
    const id = ++this.requestId;
    this.loading = true;
    this.error = '';
    this.api.getPage<StaffRecord>('staff/filter', { page: this.page, size: this.pageSize, keyword: this.query.trim() || undefined, department: this.department.trim() || undefined, category: this.category || undefined, active: this.active }).pipe(takeUntil(this.destroyed$)).subscribe({
      next: data => {
        if (id !== this.requestId) return;
        this.staff = data.content;
        this.total = data.totalElements;
        this.totalPages = Math.max(1, data.totalPages);
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
    forkJoin({ active: this.api.getPage<StaffRecord>('staff/filter', { page: 0, size: 1, active: true }), inactive: this.api.getPage<StaffRecord>('staff/filter', { page: 0, size: 1, active: false }) }).pipe(takeUntil(this.destroyed$)).subscribe({
      next: totals => { if (id === this.requestId) { this.activeCount = totals.active.totalElements; this.inactiveCount = totals.inactive.totalElements; this.cdr.detectChanges(); } }
    });
  }

  search(): void { this.page = 0; this.load(); }
  setStatus(active: boolean | undefined): void { this.active = active; this.page = 0; this.load(); }
  clearFilters(): void { this.query = ''; this.department = ''; this.category = ''; this.active = undefined; this.page = 0; this.load(); }
  previousPage(): void { if (this.page > 0) { this.page--; this.load(); } }
  nextPage(): void { if (this.page + 1 < this.totalPages) { this.page++; this.load(); } }

  openCreate(): void { this.editing = null; this.form = this.emptyForm(); this.error = ''; this.success = ''; this.showForm = true; }
  openEdit(member: StaffRecord): void { this.editing = member; this.form = { staffId: member.staffId, name: member.name, designation: member.designation, department: member.department ?? '', phoneNumber: member.phoneNumber, staffCategory: member.staffCategory ?? 'ADMINISTRATIVE', employmentType: member.employmentType ?? 'PERMANENT', joiningDate: member.joiningDate ?? '', loginEmail: '', loginPassword: '' }; this.error = ''; this.success = ''; this.showForm = true; }
  closeForm(): void { this.showForm = false; this.editing = null; this.form = this.emptyForm(); }

  save(): void {
    if (this.saving) return;
    this.saving = true; this.error = ''; this.success = '';
    const base = { staffId: this.form.staffId, name: this.form.name.trim(), designation: this.form.designation.trim(), department: this.form.department.trim() || undefined, phoneNumber: this.form.phoneNumber.trim(), staffCategory: this.form.staffCategory, employmentType: this.form.employmentType, joiningDate: this.form.joiningDate || undefined, teachingCapable: this.form.staffCategory === 'ACADEMIC' };
    const request = this.editing ? this.api.patch<StaffRecord>(`staff/${this.editing.id}`, base) : this.api.post<StaffRecord>('staff', { ...base, active: true, loginEmail: this.form.loginEmail.trim() || undefined, loginPassword: this.form.loginPassword || undefined });
    request.pipe(takeUntil(this.destroyed$)).subscribe({
      next: () => { this.saving = false; this.success = this.editing ? 'Staff member updated successfully.' : 'Staff member created successfully.'; this.closeForm(); this.page = 0; this.load(); },
      error: error => { this.saving = false; this.error = this.formatError(error); this.cdr.detectChanges(); }
    });
  }

  deactivate(member: StaffRecord): void {
    if (!member.active || !confirm(`Deactivate ${member.name}?`)) return;
    this.error = ''; this.success = '';
    this.api.delete(`staff/${member.id}`).pipe(takeUntil(this.destroyed$)).subscribe({ next: () => { this.success = 'Staff member deactivated successfully.'; this.load(); }, error: error => { this.error = this.formatError(error); this.cdr.detectChanges(); } });
  }

  exportCurrentResults(): void {
    const header = ['Staff ID', 'Name', 'Designation', 'Category', 'Department', 'Phone', 'Employment', 'Status'];
    const rows = this.staff.map(member => [member.staffId, member.name, member.designation, member.staffCategory ?? '', member.department ?? '', member.phoneNumber, member.employmentType ?? '', member.active ? 'Active' : 'Inactive']);
    const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'staff.csv'; link.click(); URL.revokeObjectURL(url);
  }

  private emptyForm(): StaffForm { return { staffId: '', name: '', designation: '', department: '', phoneNumber: '', staffCategory: 'ADMINISTRATIVE', employmentType: 'PERMANENT', joiningDate: '', loginEmail: '', loginPassword: '' }; }
  private formatError(error: any): string { return error?.error?.message || error?.error?.error || 'The request could not be completed. Check the entered details and try again.'; }
}
