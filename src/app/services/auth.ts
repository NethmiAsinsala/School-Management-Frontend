import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export type Role = 'ADMIN' | 'TEACHER' | 'PARENT' | 'STAFF'; // update to match org.edu.util.Role's actual values

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

const TOKEN_KEY = 'sms_access_token';
const USER_KEY = 'sms_current_user';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  // Reactive current-user state components can read via currentUser()
  currentUser = signal<UserResponse | null>(this.readStoredUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthTokenResponse> {
    return this.http
      .post<AuthTokenResponse>(`${environment.apiUrl}/auth/tokens`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem(TOKEN_KEY, response.accessToken);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          this.currentUser.set(response.user);
        })
      );
  }

  logout(): void {
    const token = this.getToken();
    // Best-effort server-side logout (blacklists the token); proceed with local cleanup regardless.
    this.http.delete(`${environment.apiUrl}/auth/tokens`, {}).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
    if (!token) {
      this.clearSession();
    }
  }

  /** Clears an expired or unauthorized browser session before protected data loads. */
  invalidateSession(): void {
    this.clearSession();
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      if (token) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        this.currentUser.set(null);
      }
      return false;
    }
    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return typeof decoded.exp !== 'number' || decoded.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  private readStoredUser(): UserResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
