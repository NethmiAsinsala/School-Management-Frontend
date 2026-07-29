import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** Shared gateway for all REST endpoints, using the environment API URL. */
@Injectable({ providedIn: 'root' })
export class SchoolApiService {
  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Observable<T> {
    return this.http.get<T>(this.url(path), { params: this.params(params) });
  }

  getPage<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Observable<PageResponse<T>> {
    return this.get<PageResponse<T>>(path, params);
  }

  post<T>(path: string, body?: unknown): Observable<T> { return this.http.post<T>(this.url(path), body); }
  postForm<T>(path: string, body: FormData): Observable<T> { return this.http.post<T>(this.url(path), body); }
  patch<T>(path: string, body: unknown): Observable<T> { return this.http.patch<T>(this.url(path), body); }
  put<T>(path: string, body: unknown): Observable<T> { return this.http.put<T>(this.url(path), body); }
  delete<T = void>(path: string): Observable<T> { return this.http.delete<T>(this.url(path)); }
  download(path: string): Observable<Blob> { return this.http.get(this.url(path), { responseType: 'blob' }); }

  private url(path: string): string { return `${environment.apiUrl}/${path.replace(/^\//, '')}`; }

  private params(values?: Record<string, string | number | boolean | undefined>): HttpParams {
    return Object.entries(values ?? {}).reduce(
      (params, [key, value]) => value === undefined ? params : params.set(key, String(value)),
      new HttpParams()
    );
  }
}
