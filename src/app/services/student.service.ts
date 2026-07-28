import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse } from './school-api.service';

export interface StudentDTO {
  id: number;
  name: string;
  nameWithInitials?: string;
  admissionNumber: string;
  dateOfBirth?: string;
  admissionDate?: string;
  gender?: string;
  previousSchool?: string;
  guardianRelationship?: string;
  homeAddress?: string;
  currentClassId?: number;
  currentClassName: string;
  active: boolean;
  currentAcademicYearName: string;
  medium?: string;
  newParents?: Array<{ name: string; phoneNumber: string; email: string; password: string; address: string; occupation: string }>;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly apiUrl = `${environment.apiUrl}/students`;

  constructor(private readonly http: HttpClient) {}

  getStudents(page = 0, size = 10, active?: boolean): Observable<PageResponse<StudentDTO>> {
    const params: Record<string, string | number | boolean> = { page, size };
    if (active !== undefined) params['active'] = active;
    return this.http.get<PageResponse<StudentDTO>>(this.apiUrl, { params });
  }

  searchStudents(keyword: string, page = 0, size = 10): Observable<PageResponse<StudentDTO>> {
    return this.http.get<PageResponse<StudentDTO>>(`${this.apiUrl}/search`, { params: { name: keyword, page, size } });
  }

  createStudent(student: Partial<StudentDTO>): Observable<StudentDTO> {
    return this.http.post<StudentDTO>(this.apiUrl, student);
  }

  deactivateStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStudent(id: number, student: Partial<StudentDTO>): Observable<StudentDTO> {
    return this.http.patch<StudentDTO>(`${this.apiUrl}/${id}`, student);
  }
}
