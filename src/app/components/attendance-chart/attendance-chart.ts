import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attendance-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-chart.html',
  styleUrl: './attendance-chart.css'
})
export class AttendanceChart {
  range: 'week' | 'month' = 'week';

  weekData = [
    { day: 'Mon', value: 88 },
    { day: 'Tue', value: 91 },
    { day: 'Wed', value: 94 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 93 }
  ];

  monthData = [
    { day: 'Wk 1', value: 89 },
    { day: 'Wk 2', value: 92 },
    { day: 'Wk 3', value: 87 },
    { day: 'Wk 4', value: 94 }
  ];

  get activeData() {
    return this.range === 'week' ? this.weekData : this.monthData;
  }

  setRange(range: 'week' | 'month'): void {
    this.range = range;
  }

  /** Builds a smooth SVG path for the line chart based on active data. */
  getLinePath(width: number, height: number): string {
    const data = this.activeData;
    const max = 100;
    const min = 70;
    const stepX = width / (data.length - 1);

    const points = data.map((d, i) => {
      const x = i * stepX;
      const y = height - ((d.value - min) / (max - min)) * height;
      return { x, y };
    });

    return points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(' ');
  }

  getPointY(value: number, height: number): number {
    const max = 100;
    const min = 70;
    return height - ((value - min) / (max - min)) * height;
  }
}
