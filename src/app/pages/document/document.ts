import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolApiService } from '../../services/school-api.service';
import { StudentService, StudentDTO } from '../../services/student.service';

interface DirectoryCard {
  name: string;
  description: string;
  fileCount: number;
  size: string;
  theme: 'blue' | 'gray' | 'purple';
  icon: 'folder' | 'staff' | 'legal';
}

interface RecentFile {
  name: string;
  date: string;
  size: string;
  fileType: 'pdf' | 'doc' | 'sheet' | 'shield' | 'archive';
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document.html',
  styleUrl: './document.css'
})
export class Documents implements OnInit {
  showUpload = false;
  students: StudentDTO[] = [];
  selectedFile: File | null = null;
  upload = { studentId: '', title: '', description: '', documentType: 'OTHER', visibleToParent: false };
  constructor(private readonly api: SchoolApiService, private readonly studentService: StudentService) {
    this.recentFiles = [];
  }
  ngOnInit(): void { this.studentService.getStudents(0, 100).subscribe({ next: page => this.students = page.content, error: error => console.error('Failed to load students', error) }); }
  directories: DirectoryCard[] = [
    {
      name: 'Curriculum',
      description: 'Syllabi, Lesson Plans, Standards',
      fileCount: 245,
      size: '1.2 GB',
      theme: 'blue',
      icon: 'folder'
    },
    {
      name: 'Staff Records',
      description: 'Contracts, Evaluations, Certs',
      fileCount: 128,
      size: '450 MB',
      theme: 'gray',
      icon: 'staff'
    },
    {
      name: 'Legal',
      description: 'Compliance, Policies, Audits',
      fileCount: 56,
      size: '120 MB',
      theme: 'purple',
      icon: 'legal'
    }
  ];

  recentFiles: RecentFile[] = [
    { name: '2024_Curriculum_Framework.pdf', date: 'Oct 24, 2023', size: '4.2 MB', fileType: 'pdf' },
    { name: 'Faculty_Handbook_Update.docx', date: 'Oct 22, 2023', size: '1.8 MB', fileType: 'doc' },
    { name: 'Q3_Budget_Projections.xlsx', date: 'Oct 20, 2023', size: '856 KB', fileType: 'sheet' },
    { name: 'Privacy_Policy_Compliance.pdf', date: 'Oct 18, 2023', size: '2.1 MB', fileType: 'shield' },
    { name: 'Archive_Student_Transcripts.zip', date: 'Oct 15, 2023', size: '145 MB', fileType: 'archive' }
  ];

  onUploadFile(): void {
    this.showUpload = !this.showUpload;
  }

  setFile(event: Event): void { this.selectedFile = (event.target as HTMLInputElement).files?.[0] ?? null; }
  submitUpload(): void {
    if (!this.selectedFile || !this.upload.studentId) return;
    const body = new FormData();
    body.append('file', this.selectedFile);
    body.append('metadata', new Blob([JSON.stringify({ ...this.upload, studentId: Number(this.upload.studentId) })], { type: 'application/json' }));
    this.api.post('documents', body).subscribe({ next: () => { this.showUpload = false; this.selectedFile = null; }, error: error => console.error('Failed to upload document', error) });
  }

  onOpenDirectory(dir: DirectoryCard): void {
    console.log('Open directory:', dir.name);
  }

  onViewAllFiles(): void {
    console.log('View all recent uploads clicked');
  }

  onDownloadFile(file: RecentFile): void {
    console.log('Download file:', file.name);
  }

  truncateName(name: string, maxLength = 22): string {
    return name.length > maxLength ? name.slice(0, maxLength) + '...' : name;
  }
}
