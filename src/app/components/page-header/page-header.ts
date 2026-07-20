import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css'
})
export class PageHeader {
  @Input() userName = 'Dr. S. Wickrama';
  @Input() userRole = 'Principal';
  @Input() avatarUrl = '';
  @Input() hasNotifications = true;
}
