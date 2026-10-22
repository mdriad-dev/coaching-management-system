import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { RouterLink } from '@angular/router';
import { isBrowserDemo } from './api';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="login-page">
      <section class="login-visual" aria-label="Coaching management illustration">
        <div class="glow glow-one"></div><div class="glow glow-two"></div>
        <div class="floating-shape shape-one"></div><div class="floating-shape shape-two"></div>
        <div class="visual-copy">
          <div class="brand">
            <span class="brand-mark">⚡</span>
            <span>Coaching<span class="brand-muted">CMS</span></span>
          </div>
          <h2>Make every class<br><em>count.</em></h2>
          <p>One unified command center for your coaching centers, branches, fees, and students.</p>
        </div>
        <div class="illustration">
          <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
          <div class="book"><span></span><span></span><span></span></div>
          <div class="person person-left"><i></i><b></b><strong></strong></div>
          <div class="person person-right"><i></i><b></b><strong></strong></div>
          <div class="spark spark-one">✦</div><div class="spark spark-two">✦</div>
        </div>
        <div class="visual-footer">✦ &nbsp; Built for coaching owners across Bangladesh</div>
      </section>
      <section class="login-form-side">
        <div class="login-card">
          <div class="mobile-brand">
            <span class="brand-mark">⚡</span>
            <strong>CoachingCMS</strong>
          </div>
          <p class="eyebrow">EXECUTIVE ACCESS</p>
          <h1>Sign in to Command Center</h1>
          <p class="muted">Access branch operations, fee collections, and student records.</p>

          <form (ngSubmit)="submit()">
            <label class="field">
              Email address
              <input type="email" name="email" [(ngModel)]="email" placeholder="admin@example.com" autocomplete="email" required />
            </label>
            <label class="field">
              Password
              <input type="password" name="password" [(ngModel)]="password" placeholder="Admin123!" autocomplete="current-password" required minlength="6" />
            </label>
            @if (error) {
              <p class="error">{{ error }}</p>
            }
            <button class="button login-button" type="submit" [disabled]="loading">
              {{ loading ? 'Signing in...' : 'Sign in to dashboard' }} <span>→</span>
            </button>
          </form>
          <p class="login-note">Protected by coaching owner branch authorization.</p>
          <a class="back-home" routerLink="/">← Back to dashboard</a>
        </div>
      </section>
    </main>
  `,
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = 'admin@example.com';
  password = 'Admin123!';
  loading = false;
  error = '';

  ngOnInit(): void {
    if (isBrowserDemo) {
      this.router.navigateByUrl('/');
    }
  }

  submit(): void {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (err: any) => {
        this.error =
          err?.error?.detail ||
          err?.message ||
          'Invalid credentials. Please use admin@example.com and Admin123!';
        this.loading = false;
      },
    });
  }
}
