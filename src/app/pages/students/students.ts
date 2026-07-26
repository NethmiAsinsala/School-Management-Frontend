import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

type MainTab = 'directory' | 'enrollment' | 'archives';

interface StudentRow {
  studentId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
  avatarTheme?: 'blue' | 'purple';
  className: string;
  contact: string;
}

interface DocItem {
  label: string;
  uploaded: boolean;
}

type ExitReason = 'Graduated' | 'Transferred' | 'Withdrawn';

interface ArchivedStudent {
  archiveId: string;
  name: string;
  batchYear: string;
  exitReason: ExitReason;
  archiveDate: string;
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './students.html',
  styleUrl: './students.css'
})
export class Students {
  activeTab: MainTab = 'directory';

  // ---------- Directory tab state ----------
  searchTerm = '';
  currentPage = 1;
  totalPages = 3;

  stats = [
    { label: 'Total Students', value: '1,248', icon: 'users', theme: 'blue' as const },
    { label: 'New Registrations', value: '+12', icon: 'trend', theme: 'green' as const },
    { label: 'Attendance Rate', value: '94%', icon: 'check', theme: 'orange' as const },
    { label: 'Fee Status', value: '88%', icon: 'card', theme: 'purple' as const }
  ];

  students: StudentRow[] = [
    {
      studentId: '#STU-101',
      name: 'Amara Perera',
      email: 'amara.p@school.edu',
      avatarUrl: '',
      className: 'Grade 10-A',
      contact: '+94 77 123 4567'
    },
    {
      studentId: '#STU-102',
      name: 'Dinuka Jayasuriya',
      email: 'dinuka.j@school.edu',
      avatarUrl: '',
      className: 'Grade 9-B',
      contact: '+94 77 987 6543'
    },
    {
      studentId: '#STU-103',
      name: 'Kasun Wickramasinghe',
      email: 'kasun.w@school.edu',
      avatarUrl: '',
      className: 'Grade 10-A',
      contact: '+94 77 456 7890'
    },
    {
      studentId: '#STU-104',
      name: 'Sajani Fernando',
      email: 'sajani.f@school.edu',
      initials: 'SF',
      avatarTheme: 'purple',
      className: 'Grade 8-C',
      contact: '+94 77 222 3333'
    }
  ];

  // ---------- Enrollment wizard state ----------
  currentStep = 1;
  totalSteps = 4;
  stepLabels = ['Personal Info', 'Academic', 'Guardian', 'Documents'];

  enrollmentForm: FormGroup;

  documents: DocItem[] = [
    { label: 'Birth Certificate', uploaded: false },
    { label: 'Previous Academic Transcripts', uploaded: false },
    { label: 'Medical/Immunization Records', uploaded: false },
    { label: 'Guardian ID Proof', uploaded: false }
  ];

  // ---------- Archives tab state ----------
  archiveExitYear = 'all';
  archiveExitReason = 'all';
  archiveSearchTerm = '';

  archiveCurrentPage = 1;
  archiveTotalPages = 3;
  archiveTotalEntries = 42;

  archivedStudents: ArchivedStudent[] = [
    {
      archiveId: 'AC-19-042',
      name: 'Eleanor Vance',
      batchYear: 'Class of 2023',
      exitReason: 'Graduated',
      archiveDate: 'May 15, 2023'
    },
    {
      archiveId: 'AC-21-118',
      name: 'Marcus Thorne',
      batchYear: 'Class of 2024',
      exitReason: 'Transferred',
      archiveDate: 'Aug 22, 2023'
    },
    {
      archiveId: 'AC-20-003',
      name: 'Sophia Chen',
      batchYear: 'Class of 2023',
      exitReason: 'Graduated',
      archiveDate: 'May 15, 2023'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.enrollmentForm = this.fb.group({
      personal: this.fb.group({
        fullName: ['', Validators.required],
        dob: ['', Validators.required],
        gender: ['', Validators.required],
        bloodGroup: [''],
        nationality: ['']
      }),
      academic: this.fb.group({
        gradeApplying: ['', Validators.required],
        previousSchool: [''],
        admissionDate: ['', Validators.required],
        section: ['']
      }),
      guardian: this.fb.group({
        guardianName: ['', Validators.required],
        relationship: ['', Validators.required],
        guardianContact: ['', Validators.required],
        guardianEmail: ['', Validators.email],
        address: ['']
      })
    });
  }

  get progressPercent(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  get personalGroup(): FormGroup {
    return this.enrollmentForm.get('personal') as FormGroup;
  }

  get academicGroup(): FormGroup {
    return this.enrollmentForm.get('academic') as FormGroup;
  }

  get guardianGroup(): FormGroup {
    return this.enrollmentForm.get('guardian') as FormGroup;
  }

  setTab(tab: MainTab): void {
    this.activeTab = tab;
  }

  setStep(step: number): void {
    if (step < 1 || step > this.totalSteps) {
      return;
    }
    this.currentStep = step;
  }

  goNext(): void {
    const group = this.getCurrentStepGroup();
    if (group && group.invalid) {
      group.markAllAsTouched();
      return;
    }
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  goBack(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private getCurrentStepGroup(): FormGroup | null {
    switch (this.currentStep) {
      case 1:
        return this.personalGroup;
      case 2:
        return this.academicGroup;
      case 3:
        return this.guardianGroup;
      default:
        return null;
    }
  }

  toggleDocUploaded(doc: DocItem): void {
    doc.uploaded = !doc.uploaded;
  }

  onCancelEnrollment(): void {
    this.enrollmentForm.reset();
    this.currentStep = 1;
    this.documents.forEach(d => (d.uploaded = false));
    this.activeTab = 'directory';
  }

  onSubmitEnrollment(): void {
    if (this.enrollmentForm.invalid) {
      this.enrollmentForm.markAllAsTouched();
      return;
    }
    console.log('Enrollment submitted:', this.enrollmentForm.value, this.documents);
    this.onCancelEnrollment();
  }

  onAddNewStudent(): void {
    this.activeTab = 'enrollment';
  }

  onGetTemplate(): void {
    console.log('Download CSV template clicked');
  }

  onViewProgress(): void {
    console.log('View progress clicked');
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  // ---------- Archives tab methods ----------
  onExportArchiveList(): void {
    console.log('Export archive list clicked');
  }

  onClearArchiveFilters(): void {
    this.archiveExitYear = 'all';
    this.archiveExitReason = 'all';
    this.archiveSearchTerm = '';
  }

  onViewProfile(student: ArchivedStudent): void {
    console.log('View profile:', student.archiveId);
  }

  onRestoreStudent(student: ArchivedStudent): void {
    console.log('Restore student:', student.archiveId);
  }

  getExitReasonClass(reason: ExitReason): string {
    return 'reason-' + reason.toLowerCase();
  }

  goToArchivePage(page: number): void {
    if (page < 1 || page > this.archiveTotalPages) {
      return;
    }
    this.archiveCurrentPage = page;
  }
}
