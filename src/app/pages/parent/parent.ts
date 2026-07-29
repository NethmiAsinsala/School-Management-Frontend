import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { SchoolApiService } from '../../services/school-api.service';

interface ParentRecord { id: number; name: string; phoneNumber: string; address: string; occupation: string; loginEmail?: string; active: boolean; }
interface ParentForm { name: string; phoneNumber: string; address: string; occupation: string; loginEmail: string; loginPassword: string; }
interface StudentMini { id: number; name: string; admissionNumber?: string; currentClassName?: string; }
interface ParentStudentLink { studentId: number; relationshipType: string; primaryContact: boolean; emergencyContact: boolean; }

@Component({ selector: 'app-parents', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './parent.html', styleUrl: './parent.css' })
export class Parents implements OnInit, OnDestroy {
  readonly pageSize = 10;
  private readonly destroyed$ = new Subject<void>();
  private requestId = 0;
  parents: ParentRecord[] = [];
  students: StudentMini[] = [];
  query = '';
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
  editing: ParentRecord | null = null;
  selectedParent: ParentRecord | null = null;
  relationships: ParentStudentLink[] = [];
  relationshipsLoading = false;
  linkStudentId: number | null = null;
  linkForm = { relationshipType: 'Parent', primaryContact: false, emergencyContact: false };
  form: ParentForm = this.emptyForm();

  constructor(private readonly api: SchoolApiService, private readonly cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadParents(); this.loadStudents(); }
  ngOnDestroy(): void { this.destroyed$.next(); this.destroyed$.complete(); }

  loadParents(): void {
    const id = ++this.requestId;
    this.loading = true; this.error = '';
    const request = this.query.trim() ? this.api.getPage<ParentRecord>('parents/search', { keyword: this.query.trim(), page: this.page, size: this.pageSize }) : this.api.getPage<ParentRecord>('parents', { page: this.page, size: this.pageSize });
    request.pipe(takeUntil(this.destroyed$)).subscribe({
      next: data => { if (id !== this.requestId) return; this.parents = data.content; this.total = data.totalElements; this.totalPages = Math.max(1, data.totalPages); this.loading = false; this.cdr.detectChanges(); },
      error: error => { if (id !== this.requestId) return; this.loading = false; this.error = this.formatError(error); this.cdr.detectChanges(); }
    });
    forkJoin({
      active: this.api.get<ParentRecord[]>('parents/active'),
      inactive: this.api.get<ParentRecord[]>('parents/inactive')
    })
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: counts => {
          if (id === this.requestId) {
            this.activeCount = counts.active.length;
            this.inactiveCount = counts.inactive.length;
            this.cdr.detectChanges();
          }
        }
      });
  }
  loadStudents(): void {
    this.api.get<StudentMini[]>('students/active')
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: students => this.students = students
      });
  }
  search(): void {
    this.page = 0;
    this.loadParents();
  }
  clearSearch(): void {
    this.query = '';
    this.page = 0;
    this.loadParents();
  }
  previousPage(): void {
    if (this.page > 0) {
      this.page--; this.loadParents();
    }
  }
  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadParents();
    }
  }

  openCreate(): void {
    this.editing = null;
    this.form = this.emptyForm();
    this.error = '';
    this.success = '';
    this.showForm = true;
  }
  openEdit(parent: ParentRecord): void {
    this.editing = parent;
    this.form = {
      name: parent.name,
      phoneNumber: parent.phoneNumber,
      address: parent.address,
      occupation: parent.occupation,
      loginEmail: '',
      loginPassword: ''
    };
    this.error = '';
    this.success = '';
    this.showForm = true;
  }
  closeForm(): void {
    this.showForm = false;
    this.editing = null;
    this.form = this.emptyForm();
  }
  saveParent(): void {
    if (this.saving) return;
    this.saving = true; this.error = ''; this.success = '';
    const base = {
      name: this.form.name.trim(),
      phoneNumber: this.form.phoneNumber.trim(),
      address: this.form.address.trim(),
      occupation: this.form.occupation.trim()
    };
    const request = this.editing ? this.api.patch<ParentRecord>(`parents/${this.editing.id}`,
      base) : this.api.post<ParentRecord>('parents',
        {
          ...base,
          active: true,
          loginEmail: this.form.loginEmail.trim() || undefined,
          loginPassword: this.form.loginPassword || undefined
        });
    request.pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.success = this.editing ? 'Parent updated successfully.' : 'Parent created successfully.';
          this.closeForm();
          this.page = 0;
          this.loadParents();
        },
        error: error => {
          this.saving = false;
          this.error = this.formatError(error);
          this.cdr.detectChanges();
        }
      });
  }

  selectParent(parent: ParentRecord): void {
    this.selectedParent = parent;
    this.relationships = [];
    this.relationshipsLoading = true;
    this.linkStudentId = null;
    this.api.get<ParentStudentLink[]>(`parents/${parent.id}/students`)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: links => {
          this.relationships = links;
          this.relationshipsLoading = false;
          this.cdr.detectChanges();
        },
        error: error => {
          this.relationshipsLoading = false;
          this.error = this.formatError(error);
          this.cdr.detectChanges();
        }
      });
  }
  studentLabel(studentId: number): string {
    const student = this.students.find(item => item.id === studentId);
    return student ? `${student.name} (${student.admissionNumber || 'ID ' + student.id})` : `Student ID ${studentId}`;
  }
  availableStudents(): StudentMini[] {
    const linked = new Set(this.relationships.map(link => link.studentId));
    return this.students.filter(student => !linked.has(student.id));
  }
  linkStudent(): void {
    if (!this.selectedParent || !this.linkStudentId || this.saving) return;
    this.saving = true;
    this.error = '';
    this.success = '';
    this.api.post<ParentStudentLink>(`parents/${this.selectedParent.id}/students/${this.linkStudentId}`,
      {
        relationshipType: this.linkForm.relationshipType.trim(),
        isPrimaryContact: this.linkForm.primaryContact,
        isEmergencyContact: this.linkForm.emergencyContact
      })
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.success = 'Student relationship added successfully.';
          this.selectParent(this.selectedParent!);
        }, error: error => {
          this.saving = false;
          this.error = this.formatError(error);
          this.cdr.detectChanges();
        }
      });
  }
  unlinkStudent(link: ParentStudentLink): void {
    if (!this.selectedParent || !confirm(`Remove the relationship with ${this.studentLabel(link.studentId)
      }?`))
      return;
    this.api.delete(`parents/${this.selectedParent.id}/students/${link.studentId}`)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.success = 'Student relationship removed.';
          this.selectParent(this.selectedParent!);
        },
        error: error => this.error = this.formatError(error)
      });
  }
  updateContact(link: ParentStudentLink, type: 'primary' | 'emergency'): void {
    if (!this.selectedParent) return;
    const action = type === 'primary' ?
      (link.primaryContact ? 'remove-primary-contact' : 'set-primary-contact') :
      (link.emergencyContact ? 'remove-emergency-contact' : 'set-emergency-contact');
    this.api.post<void>(`parents/${this.selectedParent.id}/students/${link.studentId}/${action}`)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => this.selectParent(this.selectedParent!),
        error: error => this.error = this.formatError(error)
      });
  }
  changeStatus(parent: ParentRecord): void {
    const target = parent.active ? 'deactivate' : 'activate';
    if (!confirm(`${parent.active ? 'Deactivate' : 'Activate'} ${parent.name}?`)) return;
    this.api.post<void>(`parents/${parent.id}/${target}`)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.success = `Parent ${target}d successfully.`;
          this.loadParents();
        }, error: error => this.error = this.formatError(error)
      });
  }
  exportCurrentResults(): void {
    const header = ['Name', 'Phone', 'Email', 'Occupation', 'Address', 'Status'];
    const rows = this.parents.map(parent => [
      parent.name,
      parent.phoneNumber,
      parent.loginEmail ?? '',
      parent.occupation,
      parent.address,
      parent.active ? 'Active' : 'Inactive']);

    const csv = [header, ...rows]
      .map(row => row.map(value => `"${String(value)
        .replace(/"/g, '""')}"`)
        .join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv],
          {
            type: 'text/csv;charset=utf-8'

          }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'parents.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  private emptyForm(): ParentForm {
    return {
      name: '',
      phoneNumber: '',
      address: '',
      occupation: '',
      loginEmail: '',
      loginPassword: ''
    };
  }
  private formatError(error: any): string {
    return error?.error?.message || error?.error?.error || 'The request could not be completed. Check the entered details and try again.';
  }
}
