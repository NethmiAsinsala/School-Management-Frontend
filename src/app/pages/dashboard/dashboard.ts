import { Component } from '@angular/core';

import { PageHeader } from '../../components/page-header/page-header';
import { StatCard } from '../../components/stat-card/stat-card';
import { AttendanceChart } from '../../components/attendance-chart/attendance-chart';
import { QuickActions } from '../../components/quick-actions/quick-actions';
import { RecentEnrollments} from '../../components/recent-enrollments/recent-enrollments';
import { UpcomingEvents } from '../../components/upcoming-events/upcoming-events';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    PageHeader,
    StatCard,
    AttendanceChart,
    QuickActions,
    RecentEnrollments,
    UpcomingEvents
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {}