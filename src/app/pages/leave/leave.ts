import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolApiService } from '../../services/school-api.service';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave.html',
  styleUrl: './leave.css'
})
export class Leave implements OnInit {
  private requestVersion = 0;
  tab = 'student';
  rows: any[] = [];
  parents: any[] = [];
  students: any[] = [];
  parentStudents: any[] = [];
  loading = false;
  saving = false;
  loadingPeople = false;
  showApplyForm = false;
  showTeacherApplyForm = false;
  error = '';
  form = { parentId: 0, studentId: 0, startDate: '', endDate: '', reason: '', note: '' };
  teacherForm = { leaveType: 'CASUAL', durationType: 'FULL_DAY', startDate: '', endDate: '', startTime: '', endTime: '', reason: '' };

  constructor(private api: SchoolApiService, private auth: Auth, private cdr: ChangeDetectorRef) { }

  get isTeacher(): boolean { return this.auth.currentUser()?.role === 'TEACHER'; }

  ngOnInit() { this.load(); }

  select(tab: string) {
    if (this.tab === tab && !this.loading) return;
    this.tab = tab;
    this.showApplyForm = false;
    this.showTeacherApplyForm = false;
    this.load();
  }

  load() {
    const version = ++this.requestVersion;
    this.loading = true;
    this.error = '';
    this.rows = [];
    const path = this.tab === 'student'
      ? 'leave-requests'
      : this.isTeacher ? 'teacher-portal/my-leave-requests' : 'teacher-leave-requests';
    this.api.getPage<any>(path, { page: 0, size: 100 }).subscribe({
      next: response => {
        if (version !== this.requestVersion) return;
        this.rows = response.content ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        if (version !== this.requestVersion) return;
        this.error = error?.error?.message || 'Could not load leave data.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openApplyForm() {
    this.showApplyForm = true;
    this.error = '';
    this.form = { parentId: 0, studentId: 0, startDate: '', endDate: '', reason: '', note: '' };
    this.parentStudents = [];
    if (this.parents.length && this.students.length) return;
    this.loadingPeople = true;
    this.api.get<any[]>('parents/active').subscribe({
      next: parents => { this.parents = parents ?? []; this.finishPeopleLoad(); },
      error: error => { this.error = error?.error?.message || 'Could not load parents.'; this.finishPeopleLoad(); }
    });
    this.api.get<any[]>('students/active').subscribe({
      next: students => { this.students = students ?? []; this.finishPeopleLoad(); },
      error: error => { this.error = error?.error?.message || 'Could not load students.'; this.finishPeopleLoad(); }
    });
  }

  private peopleRequestsDone = 0;
  private finishPeopleLoad() {
    this.peopleRequestsDone++;
    if (this.peopleRequestsDone < 2) return;
    this.peopleRequestsDone = 0;
    this.loadingPeople = false;
    this.cdr.detectChanges();
  }

  onParentChange() {
    this.form.studentId = 0;
    this.parentStudents = [];
    if (!this.form.parentId) return;
    this.api.get<any[]>(`parents/${this.form.parentId}/students`).subscribe({
      next: relations => {
        const ids = new Set((relations ?? []).map(item => item.studentId));
        this.parentStudents = this.students.filter(student => ids.has(student.id));
        this.cdr.detectChanges();
      },
      error: error => { this.error = error?.error?.message || 'Could not load students linked to this parent.'; this.cdr.detectChanges(); }
    });
  }

  cancelApply() { this.showApplyForm = false; this.error = ''; }

  openTeacherApplyForm() {
    this.showTeacherApplyForm = true;
    this.error = '';
    this.teacherForm = { leaveType: 'CASUAL', durationType: 'FULL_DAY', startDate: '', endDate: '', startTime: '', endTime: '', reason: '' };
  }

  cancelTeacherApply() { this.showTeacherApplyForm = false; this.error = ''; }

  submitStudentLeave() {
    if (!this.form.parentId || !this.form.studentId || !this.form.startDate || !this.form.endDate || !this.form.reason.trim()) {
      this.error = 'Parent, student, dates, and reason are required.';
      return;
    }
    if (this.form.endDate < this.form.startDate) {
      this.error = 'End date must be on or after the start date.';
      return;
    }
    this.saving = true;
    this.error = '';
    this.api.post('leave-requests', {
      parentId: this.form.parentId,
      studentId: this.form.studentId,
      startDate: this.form.startDate,
      endDate: this.form.endDate,
      reason: this.form.reason.trim(),
      note: this.form.note.trim() || null
    }).subscribe({
      next: () => {
        this.saving = false;
        this.showApplyForm = false;
        this.load();
      },
      error: error => {
        this.error = error?.error?.message || 'Could not submit the leave request.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitTeacherLeave() {
    if (!this.isTeacher) {
      this.error = 'Teacher leave must be submitted while signed in with the teacher account. The backend does not permit administrators to submit leave on behalf of a teacher.';
      return;
    }
    if (!this.teacherForm.startDate || !this.teacherForm.endDate || !this.teacherForm.reason.trim()) {
      this.error = 'Leave type, dates, and reason are required.';
      return;
    }
    if (this.teacherForm.endDate < this.teacherForm.startDate) {
      this.error = 'End date must be on or after the start date.';
      return;
    }
    if (this.teacherForm.durationType === 'PARTIAL_DAY' && (!this.teacherForm.startTime || !this.teacherForm.endTime)) {
      this.error = 'Start and end time are required for a partial-day leave.';
      return;
    }
    this.saving = true;
    this.error = '';
    this.api.post('teacher-portal/my-leave-requests', {
      leaveType: this.teacherForm.leaveType,
      durationType: this.teacherForm.durationType,
      startDate: this.teacherForm.startDate,
      endDate: this.teacherForm.endDate,
      startTime: this.teacherForm.durationType === 'PARTIAL_DAY' ? this.teacherForm.startTime : null,
      endTime: this.teacherForm.durationType === 'PARTIAL_DAY' ? this.teacherForm.endTime : null,
      reason: this.teacherForm.reason.trim()
    }).subscribe({
      next: () => { this.saving = false; this.showTeacherApplyForm = false; this.load(); },
      error: error => { this.error = error?.error?.message || 'Could not submit teacher leave.'; this.saving = false; this.cdr.detectChanges(); }
    });
  }

  review(row: any, decision: 'approve' | 'reject') {
    const action = decision === 'approve' ? 'Approve' : 'Reject';
    const input = window.prompt(`${action} remarks${this.tab === 'teacher' ? ' (required)' : ' (optional)'}:`);
    if (input === null) return;
    const reviewerRemarks = input.trim() || (this.tab === 'teacher' ? `${action}d by administrator.` : '');
    const path = this.tab === 'student' ? `leave-requests/${row.id}/${decision}` : `teacher-leave-requests/${row.id}/${decision}`;
    this.api.post(path, { reviewerRemarks }).subscribe({
      next: () => this.load(),
      error: error => { this.error = error?.error?.message || `Could not ${decision} leave request.`; this.cdr.detectChanges(); }
    });
  }
}
