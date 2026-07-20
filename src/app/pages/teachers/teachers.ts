import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class Teachers {
  activeTab: 'all' | 'department' | 'status' = 'all';
  searchTerm = '';

  currentPage = 1;
  totalPages = 9;
  totalResults = 86;

  stats = [
    { label: 'Total Teachers', value: '86', accent: 'blue' as const, badge: '' },
    { label: 'Active Now', value: '72', accent: 'blue' as const, badge: 'Today' },
    { label: 'Departments', value: '8', accent: 'gray' as const, badge: '' },
    { label: 'On Leave', value: '4', accent: 'orange' as const, badge: '' }
  ];

  teachers: Teacher[] = [
    {
      name: 'Nilanthi Perera',
      role: 'Senior Lecturer',
      id: '#TCH-001',
      department: 'Science',
      contact: '+94 77 123 4567',
      status: 'Active',
      avatarUrl: ''
    },
    {
      name: 'Sunimal Silva',
      role: 'Head of Department',
      id: '#TCH-042',
      department: 'Mathematics',
      contact: '+94 71 987 6543',
      status: 'Active',
      avatarUrl: ''
    },
    {
      name: 'Kanthi Fernando',
      role: 'Instructor',
      id: '#TCH-089',
      department: 'English',
      contact: '+94 76 555 1212',
      status: 'Active'
    }
  ];

  setTab(tab: 'all' | 'department' | 'status'): void {
    this.activeTab = tab;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
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
