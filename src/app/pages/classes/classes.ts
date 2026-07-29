import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SchoolApiService } from '../../services/school-api.service';

interface Item {
  id: number;
  name: string;
}
interface ClassItem {
  id: number;
  name: string;
  section: string;
  gradeId?: number;
  gradeName?: string;
  academicYearId?: number;
  academicYearName?: string;
  subjectIds?: number[];
  active: boolean;
}
@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classes.html',
  styleUrl: './classes.css'
})
export class Classes implements OnInit {
  private version = 0;
  classes: ClassItem[] = [];
  grades: Item[] = [];
  years: Item[] = [];
  subjects: Item[] = [];
  loading = true;
  saving = false;
  error = '';
  success = '';
  show = false;
  editing: ClassItem | null = null;
  form: any = { name: '', section: '', gradeId: 0, academicYearId: 0, subjectIds: [] as number[] };

  constructor(private api: SchoolApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    forkJoin({
      grades: this.api.getPage<Item>('grades',
        { page: 0, size: 200 }),
      years: this.api.getPage<Item>('academic-years',
        { page: 0, size: 200 }),
      subjects: this.api.getPage<Item>('subjects', { page: 0, size: 200 })
    })
      .subscribe({
        next: x => {
          this.grades = x.grades.content;
          this.years = x.years.content;
          this.subjects = x.subjects.content;
          this.load();
        },
        error: e => this.fail(e, 'Could not load class setup data.')
      });
  }
  load() {
    const version = ++this.version;
    this.loading = true;
    this.api.getPage<ClassItem>('classes', { page: 0, size: 200 })
      .subscribe({
        next: x => {
          if (version !== this.version) return;
          this.classes = x.content;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: e => {
          if (version !== this.version) return;
          this.fail(e, 'Could not load classes.');
        }
      });
  }
  open(item?: ClassItem) {
    this.editing = item || null;
    this.form = item ? {
      name: item.name,
      section: item.section,
      gradeId: item.gradeId || 0,
      academicYearId: item.academicYearId || 0, subjectIds: [...(item.subjectIds || [])]
    } : { name: '', section: '', gradeId: 0, academicYearId: 0, subjectIds: [] };
    this.show = true; setTimeout(() => document.getElementById('class-editor')?.scrollIntoView({
      behavior: 'smooth', block: 'start'
    }));
  }
  close() {
    this.show = false;
    this.editing = null;
  }
  save() {
    if (this.saving) return;
    this.saving = true;
    const payload = { ...this.form, subjectIds: (this.form.subjectIds || []).map(Number) };
    const request = this.editing ? this.api.patch(`classes/${this.editing.id}`,
      payload) : this.api.post('classes', payload);
    request.subscribe({
      next: () => {
        this.saving = false;
        this.success = this.editing ? 'Class updated.' : 'Class created.';
        this.close(); this.load();
      },
      error: e => {
        this.saving = false;
        this.fail(e, 'Could not save class.');
      }
    });
  }
  toggle(item: ClassItem) {
    const request = item.active ?
      this.api.delete(`classes/${item.id}`) :
      this.api.post(`classes/${item.id}/activate`);
    request.subscribe({
      next: () => {
        this.success = 'Class status updated.';
        this.load();
      }, error: e => this.fail(e, 'Could not update class status.')
    });
  }
  private fail(e: any, fallback: string) {
    this.loading = false;
    this.error = e?.error?.message || fallback; this.cdr.detectChanges();
  }
}
