import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'grid' },
    { label: 'Students', route: '/admin/students', icon: 'cap' },
    { label: 'Classes', route: '/admin/classes', icon: 'calendar' },
    { label: 'Subjects', route: '/admin/subjects', icon: 'document' },
    { label: 'Teachers', route: '/admin/teachers', icon: 'user' },
    { label: 'Staff', route: '/admin/staff', icon: 'users' },
    { label: 'Parents', route: '/admin/parents', icon: 'users' },
    { label: 'Attendance', route: '/admin/attendance', icon: 'check-square' },
    { label: 'Timetable', route: '/admin/timetable', icon: 'calendar' },
    { label: 'Exams', route: '/admin/exams', icon: 'document' },
    { label: 'Reports', route: '/admin/reports', icon: 'chart' },
    { label: 'Documents', route: '/admin/documents', icon: 'document-lib' },
    { label: 'Notices', route: '/admin/notices', icon: 'megaphone' },
    { label: 'Leave Requests', route: '/admin/leave', icon: 'calendar' }
  ];
}
