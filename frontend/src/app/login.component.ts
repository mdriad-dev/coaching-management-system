import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="login-page">
      <section class="login-visual" aria-label="Coaching management illustration">
        <div class="glow glow-one"></div><div class="glow glow-two"></div>
        <div class="floating-shape shape-one"></div><div class="floating-shape shape-two"></div>
        <div class="visual-copy"><div class="brand"><span class="brand-mark">C</span><span>Coaching<span class="brand-muted">CMS</span></span></div><h2>Make every class<br><em>count.</em></h2><p>One calm, connected space for your students, teachers, and branches.</p></div>
        <div class="illustration">
          <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
          <div class="book"><span></span><span></span><span></span></div>
          <div class="person person-left"><i></i><b></b><strong></strong></div>
          <div class="person person-right"><i></i><b></b><strong></strong></div>
          <div class="spark spark-one">✦</div><div class="spark spark-two">✦</div>
        </div>
        <div class="visual-footer">✦ &nbsp; Built for better learning outcomes</div>
      </section>
      <section class="login-form-side">
        <div class="login-card">
          <div class="mobile-brand"><span class="brand-mark">C</span><strong>CoachingCMS</strong></div>
          <p class="eyebrow">WELCOME BACK</p><h1>Sign in to your workspace</h1><p class="muted">Manage your authorized branches with confidence.</p>
          <form (ngSubmit)="submit()">
            <label class="field">Email address <input type="email" name="email" [(ngModel)]="email" placeholder="you@example.com" autocomplete="email" required /></label>
            <label class="field">Password <input type="password" name="password" [(ngModel)]="password" placeholder="Enter your password" autocomplete="current-password" required minlength="8" /></label>
            @if (error) { <p class="error">{{ error }}</p> }
            <button class="button login-button" type="submit" [disabled]="loading">{{ loading ? 'Signing in...' : 'Sign in to dashboard' }} <span>→</span></button>
          </form>
          <p class="login-note">Your access is protected by branch-level authorization.</p><a class="back-home" routerLink="/">← Back to project overview</a>
        </div>
      </section>
    </main>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  email = ''; password = ''; loading = false; error = '';
  submit(): void {
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (response: { error?: { detail?: string } }) => {
        this.error = response.error?.detail ?? 'Unable to sign in.';
        this.loading = false;
      },
    });
  }
}
