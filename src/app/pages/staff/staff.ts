import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SchoolApiService, PageResponse } from '../../services/school-api.service';

interface StaffRecord { id: number; staffId: string; name: string; designation: string; department?: string; phoneNumber: string; loginEmail?: string; active: boolean; staffCategory?: string; }

@Component({ selector: 'app-staff', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './staff.html', styleUrl: './staff.css' })
export class Staff implements OnInit {
  staff: StaffRecord[] = [];
  query = '';
  page = 0;
  total = 0;
  loading = false;
  showForm = false;
  form = { staffId: '', name: '', designation: '', department: '', phoneNumber: '', loginEmail: '', loginPassword: '', staffCategory: 'ADMINISTRATIVE', employmentType: 'PERMANENT', joiningDate: '' };

  constructor(private readonly api: SchoolApiService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const request = this.query.trim()
      ? this.api.getPage<StaffRecord>('staff/search', { name: this.query, page: this.page, size: 10 })
      : this.api.getPage<StaffRecord>('staff', { page: this.page, size: 10 });
    request.subscribe({ next: data => this.assign(data), error: error => { console.error('Failed to load staff', error); this.loading = false; } });
  }
  assign(data: PageResponse<StaffRecord>): void { this.staff = data.content; this.total = data.totalElements; this.loading = false; }
  save(): void {
    this.api.post<StaffRecord>('staff', { ...this.form, active: true, teachingCapable: this.form.staffCategory === 'ACADEMIC' }).subscribe({
      next: () => { this.showForm = false; this.form = { staffId: '', name: '', designation: '', department: '', phoneNumber: '', loginEmail: '', loginPassword: '', staffCategory: 'ADMINISTRATIVE', employmentType: 'PERMANENT', joiningDate: '' }; this.load(); },
      error: error => console.error('Failed to create staff member', error)
    });
  }
}
