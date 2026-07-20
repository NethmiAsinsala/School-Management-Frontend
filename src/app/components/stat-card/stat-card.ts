import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TrendType = 'up' | 'down' | 'neutral';
export type IconTheme = 'blue' | 'purple' | 'violet';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCard {
  @Input() icon: 'users' | 'book' | 'document' | 'user-check' = 'users';
  @Input() theme: IconTheme = 'blue';
  @Input() label = '';
  @Input() value = '';
  @Input() valueSuffix = '';
  @Input() trendText = '';
  @Input() trendType: TrendType = 'neutral';
}
