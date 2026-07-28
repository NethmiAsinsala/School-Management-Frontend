import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolApiService } from '../../services/school-api.service';

type TeacherStatus = 'Active' | 'On Leave';

interface Teacher {
  name: string;
  role: string;
  id: string;
  department: string;
  contact: string;
  status: TeacherStatus;
  avatarUrl?: string;
}

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css'
})
export class Teachers implements OnInit {
  activeTab: 'all' | 'department' | 'status' = 'all';
  searchTerm = '';

  currentPage = 1;
  totalPages = 1;
  totalResults = 0;

  stats = [
    { label: 'Total Teachers', value: '0', accent: 'blue' as const, badge: '' },
    { label: 'Active Now', value: '0', accent: 'blue' as const, badge: '' },
    { label: 'Departments', value: '0', accent: 'gray' as const, badge: '' },
    { label: 'On Leave', value: '0', accent: 'orange' as const, badge: '' }
  ];

  teachers: Teacher[] = [];

  constructor(private readonly api: SchoolApiService) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  private loadTeachers(): void {
    this.api.getPage<any>('staff/filter', { page: this.currentPage - 1, size: 10, category: 'ACADEMIC' }).subscribe({
      next: response => {
        this.totalPages = Math.max(response.totalPages, 1);
        this.totalResults = response.totalElements;
        this.stats[0].value = String(response.totalElements);
        this.teachers = response.content.map(staff => ({
          name: staff.name,
          role: staff.designation,
          id: staff.staffId,
          department: staff.department || 'Unassigned',
          contact: staff.phoneNumber,
          status: staff.active ? 'Active' : 'On Leave',
          avatarUrl: ''
        }));
      },
      error: error => console.error('Failed to load teachers', error)
    });
  }

  setTab(tab: 'all' | 'department' | 'status'): void {
    this.activeTab = tab;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadTeachers();
  }

  onExport(): void {
    console.log('Export teachers clicked');
  }

  onAddTeacher(): void {
    console.log('Add new teacher clicked');
  }

  onViewTeacher(teacher: Teacher): void {
    console.log('View teacher:', teacher.id);
  }

  getDepartmentClass(department: string): string {
    return 'dept-' + department.toLowerCase();
  }
}
