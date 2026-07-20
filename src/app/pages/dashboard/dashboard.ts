import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../components/page-header/page-header';
import { StatCard } from '../../components/stat-card/stat-card';
import { QuickActions } from '../../components/quick-actions/quick-actions';
import { UpcomingEvents } from '../../components/upcoming-events/upcoming-events';
import { AttendanceChart } from '../../components/attendance-chart/attendance-chart';
import { RecentEnrollments } from '../../components/recent-enrollments/recent-enrollments';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PageHeader,
    StatCard,
    QuickActions,
    UpcomingEvents,
    AttendanceChart,
    RecentEnrollments
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  onExportReports(): void {
    console.log('Export reports clicked');
  }

  onAddStudent(): void {
    console.log('Add student clicked');
  }
}
