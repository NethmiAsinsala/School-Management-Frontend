import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type EnrollmentStatus = 'Active' | 'Pending' | 'Inactive';

interface Enrollment {
  studentId: string;
  name: string;
  grade: string;
  status: EnrollmentStatus;
}

@Component({
  selector: 'app-recent-enrollments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-enrollments.html',
  styleUrl: './recent-enrollments.css'
})
export class RecentEnrollments {
  enrollments: Enrollment[] = [
    { studentId: 'STU-2041', name: 'Amara Perera', grade: 'Grade 9', status: 'Active' },
    { studentId: 'STU-2042', name: 'Kavindu Silva', grade: 'Grade 7', status: 'Active' },
    { studentId: 'STU-2043', name: 'Nethmi Fernando', grade: 'Grade 11', status: 'Pending' },
    { studentId: 'STU-2044', name: 'Dulanjana Rathnayake', grade: 'Grade 10', status: 'Active' },
    { studentId: 'STU-2045', name: 'Ishan Jayasuriya', grade: 'Grade 8', status: 'Inactive' }
  ];

  onView(enrollment: Enrollment): void {
    console.log('View student:', enrollment.studentId);
  }
}
