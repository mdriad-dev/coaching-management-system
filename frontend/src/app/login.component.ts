import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="page" style="max-width: 480px; padding-top: 10vh">
      <section class="card">
        <h1>Coaching Management System</h1>
        <p class="muted">Sign in to manage your authorized branches.</p>
        <form (ngSubmit)="submit()">
          <label class="field">Email <input type="email" name="email" [(ngModel)]="email" required /></label>
          <label class="field">Password <input type="password" name="password" [(ngModel)]="password" required minlength="8" /></label>
          @if (error) { <p class="error">{{ error }}</p> }
          <button class="button" type="submit" [disabled]="loading">{{ loading ? 'Signing in...' : 'Sign in' }}</button>
        </form>
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
      next: () => this.router.navigateByUrl('/'),
      error: (response: { error?: { detail?: string } }) => {
        this.error = response.error?.detail ?? 'Unable to sign in.';
        this.loading = false;
      },
    });
  }
}
