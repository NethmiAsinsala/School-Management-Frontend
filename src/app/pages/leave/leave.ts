import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolApiService } from '../../services/school-api.service';

interface LeaveRecord { id: number; staffName?: string; teacherName?: string; leaveType?: string; startDate?: string; endDate?: string; status: string; reason?: string; }
@Component({ selector: 'app-leave', standalone: true, imports: [CommonModule], templateUrl: './leave.html', styleUrl: './leave.css' })
export class Leave implements OnInit {
  requests: LeaveRecord[] = []; loading = false;
  constructor(private readonly api: SchoolApiService) {}
  get approvedCount(): number { return this.requests.filter(request => request.status === 'APPROVED').length; }
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.api.get<any>('teacher-leave-requests', { page: 0, size: 20 }).subscribe({ next: response => { this.requests = response.content ?? response; this.loading = false; }, error: error => { console.error('Failed to load leave requests', error); this.loading = false; } }); }
  act(request: LeaveRecord, decision: 'approve' | 'reject'): void { this.api.post(`teacher-leave-requests/${request.id}/${decision}`, {}).subscribe({ next: () => this.load(), error: error => console.error(`Unable to ${decision} request`, error) }); }
}
