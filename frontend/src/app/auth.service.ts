import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenResponse, User } from './models';
import { API } from './api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'cms_access_token';

  login(email: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${API}/auth/login`, { email, password }).pipe(
      tap((result) => localStorage.setItem(this.tokenKey, result.access_token)),
    );
  }
  me(): Observable<User> { return this.http.get<User>(`${API}/auth/me`); }
  token(): string | null { return localStorage.getItem(this.tokenKey); }
  logout(): void { localStorage.removeItem(this.tokenKey); }
  isAuthenticated(): boolean { return Boolean(this.token()); }
}
