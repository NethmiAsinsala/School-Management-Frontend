import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SchoolApiService } from '../../services/school-api.service';
interface Item { id: number; name: string; }
interface Subject { id: number; code: string; name: string; description: string; gradeIds?: number[]; classIds?: number[]; }
@Component({ selector: 'app-subjects', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './subjects.html', styleUrl: './subjects.css' })
export class Subjects implements OnInit {
  private version = 0; subjects: Subject[] = []; grades: Item[] = []; classes: Item[] = []; loading = true; saving = false; error = ''; success = ''; show = false; editing: Subject | null = null; keyword = ''; form: any = { code: '', name: '', description: '', gradeIds: [] as number[], classIds: [] as number[] };
  constructor(private api: SchoolApiService, private cdr: ChangeDetectorRef) { }
  ngOnInit() { forkJoin({ grades: this.api.getPage<Item>('grades', { page: 0, size: 200 }), classes: this.api.getPage<Item>('classes', { page: 0, size: 200 }) }).subscribe({ next: x => { this.grades = x.grades.content; this.classes = x.classes.content; this.load(); }, error: e => this.fail(e, 'Could not load subject setup data.') }); }
  load() { const version = ++this.version; this.loading = true; this.api.getPage<Subject>('subjects', { page: 0, size: 200, keyword: this.keyword || undefined }).subscribe({ next: x => { if (version !== this.version) return; this.subjects = x.content; this.loading = false; this.cdr.detectChanges(); }, error: e => { if (version !== this.version) return; this.fail(e, 'Could not load subjects.'); } }); }
  clearFilter() { this.keyword = ''; this.load(); }
  open(item?: Subject) { this.editing = item || null; this.form = item ? { code: item.code, name: item.name, description: item.description, gradeIds: [...(item.gradeIds || [])], classIds: [...(item.classIds || [])] } : { code: '', name: '', description: '', gradeIds: [], classIds: [] }; this.show = true; setTimeout(() => document.getElementById('subject-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }
  close() { this.show = false; this.editing = null; }
  save() { if (this.saving) return; const code = String(this.form.code || '').trim(); if (!code) { this.error = 'Enter a subject code.'; return; } const existing = this.subjects.find(x => x.code.trim().toLowerCase() === code.toLowerCase() && x.id !== this.editing?.id); if (existing) { this.error = `Subject code "${code}" already belongs to ${existing.name}. Edit that subject or use a different code.`; this.cdr.detectChanges(); return; } this.saving = true; this.persist(); }
  private persist() { const payload = { ...this.form, code: String(this.form.code).trim(), gradeIds: (this.form.gradeIds || []).map(Number), classIds: (this.form.classIds || []).map(Number) }; const request = this.editing ? this.api.patch(`subjects/${this.editing.id}`, payload) : this.api.post('subjects', payload); request.subscribe({ next: () => { this.saving = false; this.success = this.editing ? 'Subject updated.' : 'Subject created.'; this.close(); this.load(); }, error: e => { this.saving = false; this.fail(e, 'Could not save subject.'); } }); }
  remove(item: Subject) { if (!window.confirm(`Delete subject ${item.name}?`)) return; this.api.delete(`subjects/${item.id}`).subscribe({ next: () => { this.success = 'Subject deleted.'; this.load(); }, error: e => this.fail(e, 'Could not delete subject.') }); }
  private fail(e: any, fallback: string) { this.loading = false; this.error = e?.status === 409 ? `This subject conflicts with an existing record. Subject codes must be unique; choose a different code or edit the existing subject.` : (e?.error?.message || fallback); this.cdr.detectChanges(); }
}
