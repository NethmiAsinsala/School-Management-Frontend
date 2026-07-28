import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SchoolApiService } from '../../services/school-api.service';

interface StaffProfileData { id: number; staffId: string; name: string; designation: string; department?: string; phoneNumber: string; loginEmail?: string; active: boolean; joiningDate?: string; employmentType?: string; staffCategory?: string; }
@Component({ selector: 'app-staff-profile', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './staff-profile.html', styleUrl: './staff-profile.css' })
export class StaffProfile implements OnInit {
  profile: StaffProfileData | null = null;
  constructor(private readonly route: ActivatedRoute, private readonly api: SchoolApiService) {}
  ngOnInit(): void { const id = this.route.snapshot.paramMap.get('id'); if (id) this.api.get<StaffProfileData>(`staff/${id}`).subscribe({ next: profile => this.profile = profile, error: error => console.error('Failed to load staff profile', error) }); }
}
