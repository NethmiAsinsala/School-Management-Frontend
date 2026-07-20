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
    { label: 'Teachers', route: '/admin/teachers', icon: 'user' },
    { label: 'Parents', route: '/admin/parents', icon: 'users' },
    { label: 'Attendance', route: '/admin/attendance', icon: 'check-square' },
    { label: 'Exams', route: '/admin/exams', icon: 'document' },
    { label: 'Reports', route: '/admin/reports', icon: 'chart' },
    { label: 'Settings', route: '/admin/settings', icon: 'gear' }
  ];
}
