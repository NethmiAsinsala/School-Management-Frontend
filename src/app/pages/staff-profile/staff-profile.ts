import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SchoolApiService } from '../../services/school-api.service';

interface StaffProfileData { id: number; staffId: string; name: string; designation: string; department?: string; phoneNumber: string; loginEmail?: string; active: boolean; joiningDate?: string; employmentType?: string; staffCategory?: string; teachingCapable?: boolean; }
@Component({ selector: 'app-staff-profile', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './staff-profile.html', styleUrl: './staff-profile.css' })
export class StaffProfile implements OnInit {
  profile: StaffProfileData | null = null;
  editing = false;
  saving = false;
  error = '';
  constructor(private readonly route: ActivatedRoute, private readonly api: SchoolApiService) {}
  ngOnInit(): void { const id = this.route.snapshot.paramMap.get('id'); if (id) this.load(Number(id)); }
  load(id: number): void { this.api.get<StaffProfileData>(`staff/${id}`).subscribe({ next: profile => this.profile = profile, error: error => this.error = this.formatError(error) }); }
  save(): void {
    if (!this.profile || this.saving) return;
    this.saving = true; this.error = '';
    this.api.patch<StaffProfileData>(`staff/${this.profile.id}`, this.profile).subscribe({ next: profile => { this.profile = profile; this.saving = false; this.editing = false; }, error: error => { this.error = this.formatError(error); this.saving = false; } });
  }
  deactivate(): void {
    if (!this.profile || !this.profile.active || !confirm(`Deactivate ${this.profile.name}?`)) return;
    this.api.delete(`staff/${this.profile.id}`).subscribe({ next: () => { if (this.profile) this.profile.active = false; }, error: error => this.error = this.formatError(error) });
  }
  private formatError(error: any): string { return error?.error?.message || error?.error?.error || 'The request could not be completed.'; }
}
