import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolApiService } from '../../services/school-api.service';

interface SettingsData { schoolName?: string; schoolCode?: string; address?: string; phoneNumber?: string; email?: string; principalName?: string; principalTitle?: string; schoolStartTime?: string; schoolEndTime?: string; defaultLanguage?: string; timeZone?: string; }
@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  settings: SettingsData = {};
  loading = true;
  saving = false;

  constructor(private readonly api: SchoolApiService) {}

  ngOnInit(): void {
    this.api.get<SettingsData>('system-settings').subscribe({
      next: settings => { this.settings = settings; this.loading = false; },
      error: error => { console.error('Failed to load system settings', error); this.loading = false; }
    });
  }

  save(): void { this.saving = true; this.api.patch<SettingsData>('system-settings', this.settings).subscribe({ next: settings => { this.settings = settings; this.saving = false; }, error: error => { console.error('Failed to save system settings', error); this.saving = false; } }); }

}
