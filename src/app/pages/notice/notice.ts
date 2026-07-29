import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { PageResponse, SchoolApiService } from '../../services/school-api.service';

@Component(
  {
    selector: 'app-notices',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './notice.html',
    styleUrl: './notice.css'
  })
export class Notices implements OnInit {
  private requestVersion = 0;
  audienceFilter: any = 'all';
  statusFilter: any = 'published';
  activeNoticesCount = 0;
  totalViews = '—';
  totalNotices = 0;
  rangeStart = 0;
  rangeEnd = 0;
  currentPage = 1;
  showEditor = false;
  saving = false;
  editing: any = null;
  error = '';
  notices: any[] = [];
  draft: any = { title: '', message: '', audience: 'ALL', publishDate: '', expiryDate: '' };

  constructor(private api: SchoolApiService, private cdr: ChangeDetectorRef) { }
  ngOnInit() {
    this.loadNotices();
  }
  loadNotices() {
    const v = ++this.requestVersion;
    const page = { page: this.currentPage - 1, size: 10 };
    const requests: Observable<PageResponse<any>>[] = this.audienceFilter === 'staff' ?
      [this.api.getPage<any>('notices/audience/STAFF', page),
      this.api.getPage<any>('notices/audience/TEACHERS', page)] :
      [this.api.getPage<any>(
        this.audienceFilter === 'all' ? 'notices' : `notices/audience/${this.audienceFilter.toUpperCase()}`,
        page)]; forkJoin(requests)
          .subscribe({
            next: r => {
              if (v !== this.requestVersion) return;
              const raw = r.flatMap(x => x.content);
              const x = raw.filter((n: any) => this.statusFilter === 'published' ? n.published : !n.published);
              this.totalNotices = r.reduce((n, x) => n + x.totalElements, 0);
              this.activeNoticesCount = x.filter((n: any) => n.active).length;
              this.rangeStart = x.length ? (this.currentPage - 1) * 10 + 1 : 0;
              this.rangeEnd = this.rangeStart + x.length - 1;
              this.notices = x.map((n: any) => ({
                ...n, tags: [{ label: n.audience, theme: 'gray' }],
                description: n.message, state: n.published ? 'published' : 'scheduled',
                dateLabel: n.published ? 'Published' : 'Scheduled',
                dateValue: n.publishDate || 'Not scheduled',
                expires: n.expiryDate
              }));
              this.cdr.detectChanges();
            },
            error: e => {
              if (v !== this.requestVersion) return;
              this.error = e?.error?.message || 'Could not load notices.';
              this.cdr.detectChanges();
            }
          });
  }
  setAudienceFilter(x: any) {
    this.audienceFilter = x;
    this.currentPage = 1;
    this.loadNotices();
  }
  setStatusFilter(x: any) {
    this.statusFilter = x;
    this.currentPage = 1;
    this.loadNotices();
  }
  onDraftNewNotice() {
    this.editing = null;
    this.draft = { title: '', message: '', audience: 'ALL', publishDate: '', expiryDate: '' };
    this.showEditor = true;
  }
  cancelEditor() {
    this.showEditor = false;
    this.editing = null;
    this.draft = { title: '', message: '', audience: 'ALL', publishDate: '', expiryDate: '' };
  }
  saveNotice() {
    this.saving = true;
    const q = this.editing ? this.api.patch(`notices/${this.editing.id}`,
      this.draft) : this.api.post('notices', { ...this.draft, published: false, active: true }); q
        .subscribe({
          next: () => {
            this.saving = false;
            this.cancelEditor();
            this.loadNotices();
          },
          error: e => {
            this.saving = false;
            this.error = e?.error?.message || 'Could not save notice.';
          }
        });
  }
  onEditNotice(n: any) {
    this.editing = n;
    this.draft = {
      title: n.title,
      message: n.message,
      audience: n.audience,
      publishDate: n.publishDate || '',
      expiryDate: n.expiryDate || ''
    };
    this.showEditor = true;
  }
  onPrevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadNotices();
    }
  }
  onNextPage() {
    if (this.rangeEnd < this.totalNotices) {
      this.currentPage++;
      this.loadNotices();
    }
  }
}
