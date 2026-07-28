import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolApiService } from '../../services/school-api.service';

type AudienceFilter = 'all' | 'parents' | 'staff' | 'students';
type StatusFilter = 'published' | 'scheduled' | 'drafts';
type NoticeState = 'published' | 'scheduled';

interface NoticeTag {
  label: string;
  theme: 'red' | 'gray' | 'blue';
  icon?: 'warning' | 'clock';
}

interface Notice {
  tags: NoticeTag[];
  title: string;
  description: string;
  state: NoticeState;
  dateLabel: string;
  dateValue: string;
  expires?: string;
  views?: string;
  highPriority?: boolean;
}

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notice.html',
  styleUrl: './notice.css'
})
export class Notices implements OnInit {
  audienceFilter: AudienceFilter = 'all';
  statusFilter: StatusFilter = 'published';

  activeNoticesCount = 12;
  totalViews = '4.2k';

  totalNotices = 45;
  rangeStart = 1;
  rangeEnd = 3;
  currentPage = 1;
  showEditor = false;
  saving = false;
  draft = { title: '', message: '', audience: 'ALL', publishDate: '', expiryDate: '' };

  notices: Notice[] = [
    {
      tags: [
        { label: 'High Priority', theme: 'red', icon: 'warning' },
        { label: 'All Audiences', theme: 'gray' }
      ],
      title: 'Campus Closure Due to Severe Weather Warnings',
      description: 'Please be advised that all campus facilities will be closed tomorrow, October 24th, due to expected severe weather...',
      state: 'published',
      dateLabel: 'Published',
      dateValue: 'Oct 23, 08:00 AM',
      expires: 'Oct 25',
      views: '1.2k',
      highPriority: true
    },
    {
      tags: [
        { label: 'Parents', theme: 'blue' },
        { label: 'Event', theme: 'gray' }
      ],
      title: 'Annual Parent-Teacher Conferences Registration Open',
      description: 'Registration for the Fall Parent-Teacher conferences is now live. Please log in to the parent portal to secure you...',
      state: 'published',
      dateLabel: 'Published',
      dateValue: 'Oct 20, 09:30 AM',
      expires: 'Nov 10',
      views: '854'
    },
    {
      tags: [
        { label: 'Scheduled', theme: 'gray', icon: 'clock' },
        { label: 'Staff', theme: 'gray' }
      ],
      title: 'Q4 Faculty Meeting Agenda Updates',
      description: 'Please review the updated agenda for the upcoming Q4 faculty meeting. Several new discussion points regardin...',
      state: 'scheduled',
      dateLabel: 'Scheduled For',
      dateValue: 'Oct 28, 07:00 AM'
    }
  ];

  constructor(private readonly api: SchoolApiService) {
    this.notices = [];
    this.activeNoticesCount = 0;
    this.totalViews = '—';
    this.totalNotices = 0;
  }

  ngOnInit(): void {
    this.loadNotices();
  }

  loadNotices(): void {
    this.api.getPage<any>('notices', { page: 0, size: 10 }).subscribe({
      next: response => {
        this.totalNotices = response.totalElements;
        this.activeNoticesCount = response.content.filter(notice => notice.active).length;
        this.notices = response.content.map(notice => ({
          tags: [{ label: notice.audience?.replaceAll('_', ' ') || 'All Audiences', theme: 'gray' }],
          title: notice.title,
          description: notice.message,
          state: notice.published ? 'published' : 'scheduled',
          dateLabel: notice.published ? 'Published' : 'Scheduled For',
          dateValue: notice.publishDate || '-',
          expires: notice.expiryDate,
          highPriority: false
        }));
      },
      error: error => console.error('Failed to load notices', error)
    });
  }

  setAudienceFilter(filter: AudienceFilter): void {
    this.audienceFilter = filter;
  }

  setStatusFilter(filter: StatusFilter): void {
    this.statusFilter = filter;
  }

  onDraftNewNotice(): void {
    this.showEditor = !this.showEditor;
  }

  saveNotice(): void {
    this.saving = true;
    this.api.post('notices', { ...this.draft, published: false, active: true, publishDate: this.draft.publishDate || null, expiryDate: this.draft.expiryDate || null }).subscribe({
      next: () => { this.saving = false; this.showEditor = false; this.draft = { title: '', message: '', audience: 'ALL', publishDate: '', expiryDate: '' }; this.loadNotices(); },
      error: error => { console.error('Failed to save notice', error); this.saving = false; }
    });
  }

  onEditNotice(notice: Notice): void {
    console.log('Edit notice:', notice.title);
  }

  onPrevPage(): void {
    console.log('Previous page');
  }

  onNextPage(): void {
    console.log('Next page');
  }
}
