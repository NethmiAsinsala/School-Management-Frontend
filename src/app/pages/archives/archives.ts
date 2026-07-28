import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService, StudentDTO } from '../../services/student.service';

@Component({ selector: 'app-archives', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './archives.html', styleUrl: './archives.css' })
export class Archives implements OnInit {
  records: StudentDTO[] = []; query = ''; loading = false;
  constructor(private readonly students: StudentService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.students.getStudents(0, 50).subscribe({ next: page => { this.records = page.content.filter(student => !student.active); this.loading = false; }, error: error => { console.error('Failed to load student archives', error); this.loading = false; } }); }
  search(): void { if (!this.query.trim()) { this.load(); return; } this.loading = true; this.students.searchStudents(this.query, 0, 50).subscribe({ next: page => { this.records = page.content.filter(student => !student.active); this.loading = false; }, error: error => { console.error('Failed to search archives', error); this.loading = false; } }); }
}
