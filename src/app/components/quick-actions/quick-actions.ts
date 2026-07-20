import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface QuickAction {
  label: string;
  icon: 'check' | 'mail' | 'calendar';
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-actions.html',
  styleUrl: './quick-actions.css'
})
export class QuickActions {
  actions: QuickAction[] = [
    { label: 'Mark Attendance', icon: 'check' },
    { label: 'Send Broadcast', icon: 'mail' },
    { label: 'Schedule Exam', icon: 'calendar' }
  ];

  onAction(action: QuickAction): void {
    console.log('Quick action clicked:', action.label);
  }
}
