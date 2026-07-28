import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolApiService } from '../../services/school-api.service';

interface Guardian {
  initials?: string;
  avatarUrl?: string;
  name: string;
  students: { name: string; grade: string }[];
  contact: string;
  email: string;
  lastComm: string;
}

interface MeetingStat {
  label: string;
  count: number;
  dotColor: 'green' | 'red' | 'gray';
}

interface CommEntry {
  time: string;
  description: string;
  to: string;
  isLatest: boolean;
}

@Component({
  selector: 'app-parents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parent.html',
  styleUrl: './parent.css'
})
export class Parents implements OnInit {
  compactMode = false;

  totalResults = 240;
  rangeStart = 1;
  rangeEnd = 3;

  guardians: Guardian[] = [
    {
      initials: 'ER',
      name: 'Eleanor Richards',
      students: [
        { name: 'Oliver R.', grade: '10A' },
        { name: 'Sophia R.', grade: '8B' }
      ],
      contact: '555-0192',
      email: 'eleanor.r@example.com',
      lastComm: 'Oct 12, 2023'
    },
    {
      initials: 'MT',
      name: 'Marcus Thorne',
      students: [{ name: 'Leo T.', grade: '12C' }],
      contact: '555-0844',
      email: 'm.thorne@workspace.net',
      lastComm: 'Sep 28, 2023'
    },
    {
      avatarUrl: '',
      name: 'Sarah Chen',
      students: [{ name: 'Mia C.', grade: '9A' }],
      contact: '555-0911',
      email: 'schen88@example.com',
      lastComm: 'Today, 9:00 AM'
    }
  ];

  meetingStats: MeetingStat[] = [
    { label: 'Scheduled', count: 42, dotColor: 'green' },
    { label: 'Action Required', count: 12, dotColor: 'red' },
    { label: 'Completed (Term 1)', count: 184, dotColor: 'gray' }
  ];

  recentComms: CommEntry[] = [
    {
      time: 'Today, 9:00 AM',
      description: 'Email: Grade Update sent',
      to: 'To: Sarah Chen (Mia C.)',
      isLatest: true
    },
    {
      time: 'Yesterday, 2:30 PM',
      description: 'Call: Absence noted',
      to: 'To: Eleanor Richards (Oliver R.)',
      isLatest: false
    }
  ];
  showForm = false;
  parentForm = { name: '', phoneNumber: '', address: '', occupation: '', loginEmail: '', loginPassword: '' };

  constructor(private readonly api: SchoolApiService) {
    this.guardians = [];
    this.meetingStats = [];
    this.recentComms = [];
    this.totalResults = 0;
    this.rangeStart = 0;
    this.rangeEnd = 0;
  }

  ngOnInit(): void {
    this.api.getPage<any>('parents', { page: 0, size: 10 }).subscribe({
      next: response => {
        this.totalResults = response.totalElements;
        this.rangeEnd = Math.min(response.content.length, response.totalElements);
        this.guardians = response.content.map(parent => ({
          initials: parent.name.split(' ').map((part: string) => part[0]).join('').slice(0, 2),
          name: parent.name,
          students: [],
          contact: parent.phoneNumber,
          email: parent.loginEmail || '',
          lastComm: parent.updatedAt ? new Date(parent.updatedAt).toLocaleDateString() : '-'
        }));
      },
      error: error => console.error('Failed to load parents', error)
    });
  }

  toggleCompact(): void {
    this.compactMode = !this.compactMode;
  }

  onFilter(): void {
    console.log('Filter clicked');
  }

  onConnectParent(): void {
    this.showForm = !this.showForm;
  }

  saveParent(): void {
    this.api.post('parents', { ...this.parentForm, active: true }).subscribe({
      next: () => { this.showForm = false; this.parentForm = { name: '', phoneNumber: '', address: '', occupation: '', loginEmail: '', loginPassword: '' }; this.ngOnInit(); },
      error: error => console.error('Failed to create parent', error)
    });
  }

  onOpenGuardian(guardian: Guardian): void {
    console.log('Open guardian:', guardian.name);
  }

  onViewSchedule(): void {
    console.log('View schedule clicked');
  }

  onPrev(): void {
    console.log('Previous page');
  }

  onNext(): void {
    console.log('Next page');
  }
}
