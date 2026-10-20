import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from './auth.service';
import { Batch, Branch, Course, Student, User } from './models';

const API = 'http://localhost:8000/api/v1';

@Component({
  standalone: true,
  template: `
    <header style="background:#172554;color:white">
      <div class="page" style="padding-top:18px;padding-bottom:18px;display:flex;justify-content:space-between;align-items:center">
        <div><strong>Coaching CMS</strong><div style="opacity:.75;font-size:.85rem">{{ user?.full_name }}</div></div>
        <button class="button secondary" (click)="logout()">Sign out</button>
      </div>
    </header>
    <main class="page">
      <div style="display:flex;justify-content:space-between;align-items:end;gap:16px;flex-wrap:wrap">
        <div><h1>Dashboard</h1><p class="muted">Academic and operational overview for your authorized branches.</p></div>
        <label class="field" style="min-width:220px">Branch
          <select [(ngModel)]="selectedBranchId" (ngModelChange)="loadBranch()">
            @for (branch of branches; track branch.id) { <option [ngValue]="branch.id">{{ branch.name }} ({{ branch.code }})</option> }
          </select>
        </label>
      </div>
      @if (error) { <p class="error">{{ error }}</p> }
      <section class="grid">
        <article class="card"><span class="muted">Active students</span><h2>{{ students.length }}</h2></article>
        <article class="card"><span class="muted">Active courses</span><h2>{{ courses.length }}</h2></article>
        <article class="card"><span class="muted">Active batches</span><h2>{{ batches.length }}</h2></article>
      </section>
      <section class="card" style="margin-top:24px">
        <div style="display:flex;justify-content:space-between;align-items:center"><h2>Students</h2><button class="button" (click)="showStudentForm = !showStudentForm">Add student</button></div>
        @if (showStudentForm) {
          <form (ngSubmit)="addStudent()" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">
            <input name="code" placeholder="Student code" [(ngModel)]="newStudent.student_code" required>
            <input name="name" placeholder="Full name" [(ngModel)]="newStudent.full_name" required>
            <input name="email" placeholder="Email" type="email" [(ngModel)]="newStudent.email">
            <button class="button" type="submit">Save</button>
          </form>
        }
        @if (students.length === 0) { <p class="muted">No students found for this branch.</p> }
        @else {
          <table><thead><tr><th>Code</th><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
            <tbody>@for (student of students; track student.id) { <tr><td>{{ student.student_code }}</td><td>{{ student.full_name }}</td><td>{{ student.email || '—' }}</td><td>{{ student.phone || '—' }}</td></tr> }</tbody>
          </table>
        }
      </section>
      <section class="grid" style="margin-top:24px">
        <article class="card"><h2>Courses</h2>@for (course of courses; track course.id) { <p><strong>{{ course.code }}</strong> {{ course.name }}<br><span class="muted">{{ course.duration_months }} months · {{ course.monthly_fee | currency }}</span></p> } @empty { <p class="muted">No courses found.</p> }</article>
        <article class="card"><h2>Batches</h2>@for (batch of batches; track batch.id) { <p><strong>{{ batch.name }}</strong><br><span class="muted">Capacity {{ batch.capacity }} · starts {{ batch.starts_on | date }}</span></p> } @empty { <p class="muted">No batches found.</p> }</article>
      </section>
    </main>
  `,
  imports: [FormsModule, CurrencyPipe, DatePipe],
})
export class DashboardComponent {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  user: User | null = null; branches: Branch[] = []; students: Student[] = []; courses: Course[] = []; batches: Batch[] = [];
  selectedBranchId = 0; showStudentForm = false; error = '';
  newStudent = { student_code: '', full_name: '', email: '' };

  constructor() {
    this.auth.me().subscribe({ next: user => this.user = user, error: () => this.logout() });
    this.http.get<Branch[]>(`${API}/branches`).subscribe({
      next: branches => { this.branches = branches; this.selectedBranchId = branches[0]?.id ?? 0; this.loadBranch(); },
      error: () => this.error = 'Unable to load branches. Check that the backend is running.',
    });
  }
  loadBranch(): void {
    if (!this.selectedBranchId) return;
    const prefix = `${API}/branches/${this.selectedBranchId}`;
    forkJoin({
      students: this.http.get<Student[]>(`${prefix}/students`),
      courses: this.http.get<Course[]>(`${prefix}/courses`),
      batches: this.http.get<Batch[]>(`${prefix}/batches`),
    }).subscribe({ next: result => Object.assign(this, result), error: () => this.error = 'Unable to load branch data.' });
  }
  addStudent(): void {
    this.http.post<Student>(`${API}/branches/${this.selectedBranchId}/students`, this.newStudent).subscribe({
      next: () => { this.newStudent = { student_code: '', full_name: '', email: '' }; this.showStudentForm = false; this.loadBranch(); },
      error: (response: { error?: { detail?: string } }) => this.error = response.error?.detail ?? 'Unable to save student.',
    });
  }
  logout(): void { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
