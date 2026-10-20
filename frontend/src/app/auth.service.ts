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
  private readonly demo = inject(DemoService);

  login(email: string, password: string): Observable<TokenResponse> {
    if (isBrowserDemo) {
      if (email !== 'demo@coachingcms.app' || password !== 'Demo123!') return throwError(() => new Error('Use demo@coachingcms.app and Demo123!'));
      return new Observable(subscriber => { localStorage.setItem(this.tokenKey, 'browser-demo-token'); subscriber.next({ access_token: 'browser-demo-token', token_type: 'bearer' }); subscriber.complete(); });
    }
    return this.http.post<TokenResponse>(`${API}/auth/login`, { email, password }).pipe(
      tap((result) => localStorage.setItem(this.tokenKey, result.access_token)),
    );
  }
  me(): Observable<User> { return isBrowserDemo ? new Observable(subscriber => { subscriber.next(this.demo.user()); subscriber.complete(); }) : this.http.get<User>(`${API}/auth/me`); }
  token(): string | null { return localStorage.getItem(this.tokenKey); }
  logout(): void { localStorage.removeItem(this.tokenKey); }
  isAuthenticated(): boolean { return Boolean(this.token()); }
}
