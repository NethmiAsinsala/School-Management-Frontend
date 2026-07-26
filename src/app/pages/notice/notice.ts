import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class Notices {
  audienceFilter: AudienceFilter = 'all';
  statusFilter: StatusFilter = 'published';

  activeNoticesCount = 12;
  totalViews = '4.2k';

  totalNotices = 45;
  rangeStart = 1;
  rangeEnd = 3;
  currentPage = 1;

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

  setAudienceFilter(filter: AudienceFilter): void {
    this.audienceFilter = filter;
  }

  setStatusFilter(filter: StatusFilter): void {
    this.statusFilter = filter;
  }

  onDraftNewNotice(): void {
    console.log('Draft new notice clicked');
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
