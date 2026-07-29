import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolApiService } from '../../services/school-api.service';

interface Student {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    admissionNumber?: string;
}
interface Doc {
    id: number;
    studentName: string;
    documentType: string;
    title: string;
    description?: string;
    originalFileName: string;
    fileSize: number;
    visibleToParent: boolean;
    createdAt: string;
}
@Component({
    selector: 'app-documents',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './document.html',
    styleUrl: './document.css'
})
export class Documents implements OnInit {
    students: Student[] = [];
    docs: Doc[] = [];
    studentId = 0;
    file: File | null = null;
    loading = true;
    saving = false;
    show = false;
    error = '';
    success = '';
    form: any = {
        documentType: 'OTHER',
        title: '',
        description: '',
        visibleToParent: false
    };
    constructor(private api: SchoolApiService, private cdr: ChangeDetectorRef) { }
    ngOnInit() {
        this.api.getPage<Student>('students',
            {
                page: 0,
                size: 500,
                active: true
            })
            .subscribe({
                next: x => {
                    this.students = x.content;
                    this.studentId = this.students[0]?.id || 0; this.load();
                },
                error: e => this.fail(e, 'Could not load students.')
            });
    }
    load() {
        this.loading = true;
        if (!this.studentId) {
            this.docs = [];
            this.loading = false;
            return;
        }
        this.api.getPage<Doc>(`documents/students/${this.studentId}`,
            {
                page: 0,
                size: 200
            })
            .subscribe({
                next: x => {
                    this.docs = x.content;
                    this.loading = false;
                    this.cdr.detectChanges();
                },
                error: e => this.fail(e, 'Could not load documents.')
            });
    }
    pick(event: Event) {
        this.file = (event.target as HTMLInputElement).files?.[0] || null;
    }
    open() {
        this.form = { documentType: 'OTHER', title: '', description: '', visibleToParent: false };
        this.file = null; this.show = true;
    }
    upload() {
        if (!this.file) {
            this.error = 'Choose a file to upload.';
            return;
        }
        this.saving = true;
        const data = new FormData();
        data.append('metadata', new Blob([JSON.stringify({
            studentId: this.studentId, ...this.form
        })],
            {
                type: 'application/json'
            }));
        data.append('file', this.file);
        this.api.postForm<Doc>('documents', data)
            .subscribe({
                next: () => {
                    this.saving = false;
                    this.show = false;
                    this.success = 'Document uploaded.';
                    this.load();
                },
                error: e => {
                    this.saving = false;
                    this.fail(e, 'Could not upload document.');
                }
            });
    }
    download(doc: Doc) {
        this.api.download(`documents/${doc.id}/download`)
            .subscribe({
                next: b => {
                    const u = URL.createObjectURL(b),
                        a = document.createElement('a');
                    a.href = u;
                    a.download = doc.originalFileName;
                    a.click(); URL.revokeObjectURL(u);
                },
                error: e => this.fail(e, 'Could not download document.')
            });
    }
    remove(doc: Doc) {
        if (!confirm(`Delete ${doc.title}?`)) return;
        this.api.delete(`documents/${doc.id}`)
            .subscribe({
                next: () => {
                    this.success = 'Document deleted.';
                    this.load();
                },
                error: e => this.fail(e, 'Could not delete document.')
            });
    }
    name(s: Student) {
        return s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || `Student #${s.id}`;
    }
    size(n: number) {
        return n < 1048576 ? `${Math.ceil(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`;
    }
    private fail(e: any, f: string) {
        this.loading = false;
        this.error = e?.error?.message || f; this.cdr.detectChanges();
    }
}
