import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { SchoolApiService } from '../../services/school-api.service';

type Status = 'PRESENT' | 'ABSENT' | 'LATE';
interface Record {
  id: number;
  studentId: number;
  studentName: string;
  classId?: number;
  className?: string;
  attendanceDate: string;
  status: Status;
  remarks?: string;
  createdAt?: string;
}
interface ClassItem {
  id: number;
  name: string;
}
interface Student {
  id: number;
  name: string;
  admissionNumber?: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css'
})
export class Attendance implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  private requestId = 0;
  date = new Date().toISOString().slice(0, 10);
  classId: number | undefined;
  status: Status | undefined;
  page = 0;
  total = 0;
  totalPages = 1;
  records: Record[] = [];
  classes: ClassItem[] = [];
  students: Student[] = [];
  loading = false;
  saving = false;
  error = '';
  success = '';

  constructor(private api: SchoolApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadClasses();
    this.load();
  }
  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  loadClasses() {
    this.api.get<ClassItem[]>('classes/active')
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: x => this.classes = x, error: e => this.error = this.msg(e)
      });
  }
  load() {
    const id = ++this.requestId;
    this.loading = true;
    this.error = '';
    this.api.getPage<Record>('attendance/filter',
      {
        page: this.page,
        size: 20,
        classId: this.classId,
        status: this.status,
        from: this.date,
        to: this.date
      })
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: r => {
          if (id !== this.requestId) return;
          this.records = r.content;
          this.total = r.totalElements;
          this.totalPages = Math.max(1, r.totalPages);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: e => {
          if (id !== this.requestId) return;
          this.loading = false;
          this.error = this.msg(e);
          this.cdr.detectChanges();
        }
      });
  }
  changeDate(days: number) {
    const d = new Date(this.date + 'T00:00:00');
    d.setDate(d.getDate() + days);
    this.date = d.toISOString().slice(0, 10);
    this.page = 0;
    this.load();
  }
  apply() {
    this.page = 0;
    this.load();
  }
  onClassChange() {
    this.page = 0;
    this.load();
    if (!this.classId) {
      this.students = [];
      return;
    }
    this.api.getPage<Student>('students', {
      page: 0,
      size: 200,
      classId: this.classId,
      active: true
    })
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: r => this.students = r.content, error: e => this.error = this.msg(e)
      });
  }
  setStatus(record: Record, status: Status) {
    if (this.saving || record.status === status) return;
    this.saving = true;
    this.api.patch<Record>(`attendance/${record.id}`,
      {
        studentId: record.studentId,
        attendanceDate: this.date,
        status,
        remarks: record.remarks
      })
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.success = 'Attendance updated.';
          this.load();
        }, error: e => {
          this.saving = false;
          this.error = this.msg(e);
        }
      });
  }
  markAllPresent() {
    if (!this.classId || !this.students.length || this.saving) return;
    this.saving = true;
    this.api.post<Record[]>('attendance/bulk',
      {
        classId: this.classId,
        attendanceDate: this.date,
        students: this.students.map(s => ({ studentId: s.id, status: 'PRESENT' }))
      })
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.success = 'Class attendance saved.';
          this.load();
        }, error: e => {
          this.saving = false;
          this.error = this.msg(e);
        }
      });
  }
  export() {
    const csv = [['Student', 'Class', 'Date', 'Status'],
    ...this.records.map(r => [r.studentName, r.className || '', r.attendanceDate, r.status])]
      .map(r => r
        .map(v => `"${String(v)
          .replace(/"/g, '""')}"`)
        .join(','))
      .join('\n');
    const u = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = u; a.download = `attendance-${this.date}.csv`;
    a.click(); URL.revokeObjectURL(u);
  }
  prev() {
    if (this.page) {
      this.page--;
      this.load();
    }
  }
  next() {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.load();
    }
  }
  label(s: Status) {
    return s[0] + s.slice(1).toLowerCase();
  }
  private msg(e: any) {
    return e?.error?.message || e?.error?.error || 'The attendance request could not be completed.';
  }
}
