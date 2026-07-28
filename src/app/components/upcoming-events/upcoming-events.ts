import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EventItem {
  day: string;
  month: string;
  title: string;
  meta: string;
  avatarCount?: number;
  tag?: string;
  accent: 'blue' | 'purple';
}

@Component({
  selector: 'app-upcoming-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upcoming-events.html',
  styleUrl: './upcoming-events.css'
})
export class UpcomingEvents {
  events: EventItem[] = [
    {
      day: '15',
      month: 'NOV',
      title: 'Science Fair Finals',
      meta: 'Main Auditorium • 09:00 AM',
      avatarCount: 4,
      accent: 'blue'
    },
    {
      day: '18',
      month: 'NOV',
      title: 'Parent-Teacher Meet',
      meta: 'Grade 10 & 11 Classrooms • 14:00 PM',
      tag: 'MANDATORY',
      accent: 'purple'
    }
  ];

  constructor() { this.events = []; }
}
