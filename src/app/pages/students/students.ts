import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { StudentService, StudentDTO } from '../../services/student.service';
import { SchoolApiService } from '../../services/school-api.service';
import { Subscription, finalize, forkJoin, map, of, switchMap } from 'rxjs';

type MainTab = 'directory' | 'enrollment' | 'archives';

interface StudentRow {
  id: number;
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
  file?: File;
  documentType: 'CERTIFICATE' | 'REPORT_CARD' | 'MEDICAL_RECORD' | 'OTHER';
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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './students.html',
  styleUrl: './students.css'
})
export class Students implements OnInit, OnDestroy {

  activeTab: MainTab = 'directory';
  searchTerm = '';

  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  totalStudents = 0;

  stats = [
    { label: 'Total Students', value: '0', icon: 'users', theme: 'blue' as const },
    { label: 'New Registrations', value: '-', icon: 'trend', theme: 'green' as const },
    { label: 'Attendance Rate', value: '-', icon: 'check', theme: 'orange' as const },
    { label: 'Fee Status', value: '-', icon: 'card', theme: 'purple' as const }
  ];

  students: StudentRow[] = [];
  classes: { id: number; name: string }[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  submittingEnrollment = false;
  private studentsRequest?: Subscription;
  private studentsRequestVersion = 0;

  currentStep = 1;
  totalSteps = 4;
  stepLabels = [
    'Personal Info',
    'Academic',
    'Guardian',
    'Documents'
  ];

  enrollmentForm: FormGroup;

  documents: DocItem[] = [
    { label: 'Birth Certificate', uploaded: false, documentType: 'CERTIFICATE' },
    { label: 'Previous Academic Transcripts', uploaded: false, documentType: 'REPORT_CARD' },
    { label: 'Medical/Immunization Records', uploaded: false, documentType: 'MEDICAL_RECORD' },
    { label: 'Guardian ID Proof', uploaded: false, documentType: 'OTHER' }
  ];

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

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private api: SchoolApiService,
    private cdr: ChangeDetectorRef
  ) {

    this.archivedStudents = [];

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
        medium: ['ENGLISH', Validators.required],
        previousSchool: [''],
        admissionDate: ['', Validators.required],
        section: ['']
      }),

      guardian: this.fb.group({
        guardianName: ['', Validators.required],
        relationship: ['', Validators.required],
        guardianContact: ['', Validators.required],
        guardianEmail: ['', [Validators.required, Validators.email]],
        guardianPassword: ['', [Validators.required, Validators.minLength(8)]],
        occupation: ['', Validators.required],
        address: ['', Validators.required]
      })

    });
  }

  ngOnInit(): void {
    this.loadStudents();
    this.api.get<{ id: number; name: string }[]>('classes/active').subscribe({ next: classes => this.classes = classes, error: error => console.error('Failed to load classes', error) });
  }

  ngOnDestroy(): void {
    this.studentsRequest?.unsubscribe();
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

  onDocumentSelected(doc: DocItem, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    doc.file = file;
    doc.uploaded = true;
  }

  onCancelEnrollment(): void {
    this.enrollmentForm.reset();
    this.currentStep = 1;
    this.documents.forEach(doc => {
      doc.uploaded = false;
      doc.file = undefined;
    });
    this.activeTab = 'directory';
  }

  onSubmitEnrollment(): void {

    if (this.submittingEnrollment) {
      return;
    }

    if (this.enrollmentForm.invalid) {
      this.enrollmentForm.markAllAsTouched();
      return;
    }

    const { personal, academic, guardian } = this.enrollmentForm.getRawValue();
    this.submittingEnrollment = true;
    this.errorMessage = '';
    this.successMessage = '';
    const student: Partial<StudentDTO> = {
      name: personal.fullName,
      nameWithInitials: personal.fullName,
      dateOfBirth: personal.dob,
      gender: personal.gender.charAt(0).toUpperCase() + personal.gender.slice(1),
      admissionDate: academic.admissionDate,
      previousSchool: academic.previousSchool || undefined,
      medium: academic.medium,
      guardianRelationship: guardian.relationship || undefined,
      homeAddress: guardian.address || undefined,
      currentClassId: Number(academic.gradeApplying) || undefined,
      newParents: [{ name: guardian.guardianName, phoneNumber: guardian.guardianContact, email: guardian.guardianEmail, password: guardian.guardianPassword, address: guardian.address, occupation: guardian.occupation }],
      active: true
    };

    this.studentService.createStudent(student).pipe(
      switchMap(createdStudent => {
        const uploads = this.documents
          .filter(doc => doc.file)
          .map(doc => this.uploadEnrollmentDocument(createdStudent.id, doc));
        return uploads.length ? forkJoin(uploads).pipe(map(() => createdStudent)) : of(createdStudent);
      }),
      finalize(() => this.submittingEnrollment = false)
    ).subscribe({
      next: createdStudent => {
        this.successMessage = `${createdStudent.name} was enrolled successfully.`;
        this.onCancelEnrollment();
        this.loadStudents();
      },
      error: error => {
        this.errorMessage = this.formatApiError(error, 'Enrollment could not be completed. Please review the form and try again.');
      }
    });

  }

  onAddNewStudent(): void {
    this.activeTab = 'enrollment';
  }

  onGetTemplate(): void {
    console.log('Download template');
  }

  onViewProgress(): void {
    console.log('View progress');
  }

  loadStudents(): void {
    this.studentsRequest?.unsubscribe();
    const requestVersion = ++this.studentsRequestVersion;
    this.loading = true;
    this.errorMessage = '';

    this.studentsRequest = this.studentService
      .getStudents(this.currentPage - 1, this.pageSize)
      .pipe(finalize(() => {
        if (requestVersion === this.studentsRequestVersion) {
          this.loading = false;
        }
      }))
      .subscribe({
        next: response => {
          if (requestVersion !== this.studentsRequestVersion) return;
          this.totalPages = Math.max(response.totalPages, 1);
          this.totalStudents = response.totalElements;
          this.students = response.content.map(student => ({
            id: student.id,
            studentId:
              student.admissionNumber ?? ('STU-' + student.id),
            name: student.name,
            email: student.currentAcademicYearName ?? '',
            avatarUrl: '',
            initials: student.name
              ?.split(' ')
              .map((x: string) => x[0])
              .join('')
              .substring(0, 2),
            avatarTheme: 'blue',
            className:
              student.currentClassName ?? 'Not Assigned',
            contact: student.active ? 'Active' : 'Inactive',
          }));
          this.cdr.detectChanges();
        },

        error: error => {
          if (requestVersion !== this.studentsRequestVersion) return;
          this.errorMessage = error.error?.message || `Unable to load students (HTTP ${error.status})`;
          this.cdr.detectChanges();
          console.error('Failed to load students', error);
        }
      });

  }

  search(): void {

    if (!this.searchTerm.trim()) {
      this.loadStudents();
      return;
    }
    this.studentService
      .searchStudents(this.searchTerm)
      .subscribe({
        next: response => {
          this.totalPages = Math.max(response.totalPages, 1);
          this.totalStudents = response.totalElements;
          this.students = response.content.map((student: any) => ({
            id: student.id,
            studentId:
              student.admissionNumber ||
              `STU-${student.id}`,
            name: student.name,
            email: student.currentAcademicYearName || '',
            avatarUrl: '',
            initials: student.name
              ?.split(' ')
              .map((word: string) => word.charAt(0))
              .join('')
              .substring(0, 2),
            avatarTheme: 'blue',
            className:
              student.currentClassName || 'Not Assigned',
            contact:
              student.active ? 'Active' : 'Inactive'
          }));
        },

        error: error => {
          console.error(error);
        }
      });
  }

  goToPage(page: number): void {

    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadStudents();
  }

  private uploadEnrollmentDocument(studentId: number, document: DocItem) {
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify({
      studentId,
      documentType: document.documentType,
      title: document.label,
      description: `Submitted during enrollment: ${document.label}`,
      visibleToParent: true
    })], { type: 'application/json' }));
    formData.append('file', document.file!);
    return this.api.post('documents', formData);
  }

  private formatApiError(error: any, fallback: string): string {
    const fieldErrors = error?.error?.fieldErrors as Record<string, string> | undefined;
    if (fieldErrors && Object.keys(fieldErrors).length) {
      return Object.values(fieldErrors)[0];
    }
    if (error?.status === 409) {
      return 'A record with the same unique details already exists. Use a different guardian email or contact number.';
    }
    return error?.error?.message || fallback;
  }

  deactivateStudent(student: StudentRow): void {
    this.studentService.deactivateStudent(student.id).subscribe({
      next: () => this.loadStudents(),
      error: error => this.errorMessage = error.error?.message || 'Unable to archive student'
    });
  }

  onExportArchiveList(): void {
    console.log('Export archive list');
  }

  onClearArchiveFilters(): void {
    this.archiveExitYear = 'all';
    this.archiveExitReason = 'all';
    this.archiveSearchTerm = '';
  }

  onViewProfile(student: ArchivedStudent): void {
    console.log(student);
  }

  onRestoreStudent(student: ArchivedStudent): void {
    console.log(student);
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
