import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './document.html',
  styleUrl: './document.css'
})
export class Documents {
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
    console.log('Upload file clicked');
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
