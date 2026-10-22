import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { TokenResponse, User } from './models';
import { API, isBrowserDemo } from './api';
import { DemoService } from './demo.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'cms_access_token';
  private readonly loggedOutKey = 'cms_logged_out';
  private readonly demo = inject(DemoService);

  login(email: string, password: string): Observable<TokenResponse> {
    localStorage.removeItem(this.loggedOutKey);
    if (isBrowserDemo) {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      const validOwner =
        (cleanEmail === 'admin@example.com' && cleanPass === 'Admin123!') ||
        (cleanEmail === 'demo@coachingcms.app' && cleanPass === 'Demo123!') ||
        cleanPass.toLowerCase() === 'admin123!' ||
        cleanPass.toLowerCase() === 'demo123!' ||
        cleanPass.length >= 4;

      if (!validOwner) {
        return throwError(() => ({
          error: { detail: 'Incorrect credentials. Please use admin@example.com and Admin123!' },
        }));
      }

      return new Observable((subscriber) => {
        localStorage.setItem(this.tokenKey, 'browser-demo-token');
        subscriber.next({ access_token: 'browser-demo-token', token_type: 'bearer' });
        subscriber.complete();
      });
    }
    return this.http.post<TokenResponse>(`${API}/auth/login`, { email, password }).pipe(
      tap((result) => localStorage.setItem(this.tokenKey, result.access_token)),
    );
  }

  me(): Observable<User> {
    return isBrowserDemo
      ? new Observable((subscriber) => {
          subscriber.next(this.demo.user());
          subscriber.complete();
        })
      : this.http.get<User>(`${API}/auth/me`);
  }

  token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.setItem(this.loggedOutKey, 'true');
  }

  isAuthenticated(): boolean {
    if (localStorage.getItem(this.loggedOutKey) === 'true') {
      return false;
    }
    if (isBrowserDemo) {
      if (!this.token()) {
        localStorage.setItem(this.tokenKey, 'browser-demo-token');
      }
      return true;
    }
    return Boolean(this.token());
  }
}
