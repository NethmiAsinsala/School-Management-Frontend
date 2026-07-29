import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SchoolApiService } from '../../services/school-api.service';

interface Option { id: number; name: string; }
interface Student { id: number; firstName?: string; lastName?: string; fullName?: string; name?: string; admissionNumber?: string; }
interface Report {
  id: number; studentId: number; studentName: string; className: string; academicTermName: string;
  status: 'DRAFT' | 'PUBLISHED'; overallPercentage?: number; overallGrade?: string;
  subjectCount: number; passedSubjectCount: number; attendancePercentage?: number;
  classTeacherRemarks?: string; principalRemarks?: string;
}
interface Readiness { canGenerate: boolean; subjectCount: number; markCount: number; attendanceRecordCount: number; items: { label: string; ready: boolean; message: string; }[]; }

@Component({ selector: 'app-reports', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './reports.html', styleUrl: './reports.css' })
export class Reports implements OnInit {
  private requestVersion = 0;
  classes: Option[] = [];
  terms: Option[] = [];
  students: Student[] = [];
  reports: Report[] = [];
  selectedClassId = 0;
  selectedTermId = 0;
  selectedStudentId = 0;
  loading = true;
  saving = false;
  error = '';
  success = '';
  showGenerate = false;
  editing: Report | null = null;
  readiness: Readiness | null = null;
  form = { classTeacherRemarks: '', principalRemarks: '' };

  constructor(private readonly api: SchoolApiService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    forkJoin({
      classes: this.api.getPage<Option>('classes', { page: 0, size: 200 }),
      terms: this.api.getPage<Option>('academic-terms', { page: 0, size: 200 })
    }).subscribe({
      next: ({ classes, terms }) => {
        this.classes = classes.content;
        this.terms = terms.content;
        this.selectedClassId = this.classes[0]?.id ?? 0;
        this.selectedTermId = this.terms[0]?.id ?? 0;
        this.refresh();
      },
      error: error => this.fail(error, 'Could not load classes and academic terms.')
    });
  }

  refresh(): void {
    const version = ++this.requestVersion;
    this.loading = true;
    this.error = '';
    this.success = '';
    if (!this.selectedClassId || !this.selectedTermId) {
      this.reports = [];
      this.students = [];
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    forkJoin({
      students: this.api.getPage<Student>('students', { classId: this.selectedClassId, active: true, page: 0, size: 500 }),
      reports: this.api.getPage<Report>(`academic-reports/classes/${this.selectedClassId}`, { academicTermId: this.selectedTermId, page: 0, size: 500 })
    }).subscribe({
      next: ({ students, reports }) => {
        if (version !== this.requestVersion) return;
        this.students = students.content;
        this.reports = reports.content;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        if (version !== this.requestVersion) return;
        this.reports = [];
        this.students = [];
        this.fail(error, 'Could not load reports for the selected class and term.');
      }
    });
  }

  openGenerate(): void {
    this.editing = null;
    this.selectedStudentId = this.students[0]?.id ?? 0;
    this.form = { classTeacherRemarks: '', principalRemarks: '' };
    this.showGenerate = true;
    this.checkReadiness();
  }

  openEdit(report: Report): void {
    this.editing = report;
    this.form = { classTeacherRemarks: report.classTeacherRemarks ?? '', principalRemarks: report.principalRemarks ?? '' };
    this.showGenerate = true;
    setTimeout(() => document.getElementById('report-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  closeEditor(): void { this.showGenerate = false; this.editing = null; this.readiness = null; }

  checkReadiness(): void {
    this.readiness = null;
    if (!this.selectedStudentId || !this.selectedTermId || this.editing) return;
    this.api.get<Readiness>('academic-reports/readiness', { studentId: this.selectedStudentId, academicTermId: this.selectedTermId }).subscribe({
      next: value => { this.readiness = value; this.cdr.detectChanges(); },
      error: error => this.fail(error, 'Could not check report readiness.')
    });
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;
    const request = this.editing
      ? this.api.patch<Report>(`academic-reports/${this.editing.id}`, this.form)
      : this.api.post<Report>('academic-reports', { studentId: this.selectedStudentId, academicTermId: this.selectedTermId, ...this.form });
    request.subscribe({
      next: () => { this.saving = false; this.success = this.editing ? 'Report remarks saved.' : 'Academic report generated.'; this.closeEditor(); this.refresh(); },
      error: error => { this.saving = false; this.fail(error, 'Could not save the academic report.'); }
    });
  }

  publish(report: Report): void {
    this.api.post<Report>(`academic-reports/${report.id}/publish`).subscribe({ next: () => { this.success = 'Report published.'; this.refresh(); }, error: error => this.fail(error, 'Could not publish the report.') });
  }

  regenerate(report: Report): void {
    this.api.post<Report>(`academic-reports/${report.id}/regenerate`).subscribe({ next: () => { this.success = 'Report regenerated from current marks and attendance.'; this.refresh(); }, error: error => this.fail(error, 'Could not regenerate the report.') });
  }

  delete(report: Report): void {
    if (!window.confirm(`Delete the draft report for ${report.studentName}?`)) return;
    this.api.delete(`academic-reports/${report.id}`).subscribe({ next: () => { this.success = 'Draft report deleted.'; this.refresh(); }, error: error => this.fail(error, 'Only draft reports can be deleted.') });
  }

  download(report: Report): void {
    this.api.download(`academic-reports/${report.id}/pdf`).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.studentName || 'academic-report'}-report-card.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: error => this.fail(error, 'Could not download the report card PDF.')
    });
  }

  get generatedCount(): number { return this.reports.length; }
  get publishedCount(): number { return this.reports.filter(x => x.status === 'PUBLISHED').length; }
  get averageScore(): string { const values = this.reports.map(x => Number(x.overallPercentage)).filter(Number.isFinite); return values.length ? `${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}%` : '—'; }
  get averageAttendance(): string { const values = this.reports.map(x => Number(x.attendancePercentage)).filter(Number.isFinite); return values.length ? `${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}%` : '—'; }
  studentName(student: Student): string { return student.fullName || student.name || `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() || `Student #${student.id}`; }

  private fail(error: any, fallback: string): void { this.error = error?.error?.message || fallback; this.loading = false; this.cdr.detectChanges(); }
}
