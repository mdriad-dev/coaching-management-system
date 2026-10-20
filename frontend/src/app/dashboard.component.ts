import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from './auth.service';
import { Batch, Branch, Course, Student, User } from './models';

const API = 'http://localhost:8000/api/v1';

@Component({
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, UpperCasePipe],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark">C</span><span>Coaching<span class="brand-muted">CMS</span></span></div>
        <nav class="nav-list" aria-label="Main navigation">
          <a class="nav-item active" href="#overview">▦ <span>Overview</span></a>
          <a class="nav-item" href="#students">♙ <span>Students</span><span class="nav-count">{{ students.length }}</span></a>
          <a class="nav-item" href="#courses">▤ <span>Courses & batches</span></a>
          <a class="nav-item disabled" href="#attendance">◷ <span>Attendance</span><span class="soon">Soon</span></a>
          <a class="nav-item disabled" href="#payments">৳ <span>Payments</span><span class="soon">Soon</span></a>
        </nav>
        <div class="sidebar-footer"><div class="security-note">⌁ <span>Branch data is protected<br>by server authorization</span></div></div>
      </aside>

      <div class="content-area">
        <header class="topbar">
          <button class="mobile-menu" aria-label="Toggle navigation">☰</button>
          <div class="topbar-title">Management portal</div>
          <div class="topbar-actions">
            <span class="role-pill">{{ user?.role || 'Authorized user' }}</span>
            <div class="avatar">{{ initials }}</div>
            <button class="sign-out" (click)="logout()">Sign out</button>
          </div>
        </header>

        <main class="page">
          <section class="hero" id="overview">
            <div>
              <p class="eyebrow">GOOD MORNING, {{ firstName | uppercase }}</p>
              <h1>Here’s your overview.</h1>
              <p class="hero-copy">Keep your coaching operations moving with one clear view of your branches.</p>
            </div>
            <label class="branch-picker"><span>Viewing branch</span>
              <select [(ngModel)]="selectedBranchId" (ngModelChange)="loadBranch()">
                @for (branch of branches; track branch.id) { <option [ngValue]="branch.id">{{ branch.name }} · {{ branch.code }}</option> }
              </select>
            </label>
          </section>

          @if (error) { <div class="error" role="alert"><strong>Something needs attention.</strong> {{ error }}</div> }
          @if (loading) { <div class="loading-bar" aria-label="Loading"></div> }

          <section class="stats-grid" aria-label="Branch statistics">
            <article class="stat-card blue"><div class="stat-icon">♙</div><div><span>Active students</span><strong>{{ students.length }}</strong><small>Currently enrolled</small></div></article>
            <article class="stat-card violet"><div class="stat-icon">▤</div><div><span>Active courses</span><strong>{{ courses.length }}</strong><small>Organization programs</small></div></article>
            <article class="stat-card green"><div class="stat-icon">▦</div><div><span>Active batches</span><strong>{{ batches.length }}</strong><small>Running at this branch</small></div></article>
            <article class="stat-card amber"><div class="stat-icon">↗</div><div><span>Branch status</span><strong>{{ selectedBranch ? 'Open' : '—' }}</strong><small>{{ selectedBranch?.name || 'No branch selected' }}</small></div></article>
          </section>

          <section class="content-grid">
            <article class="panel students-panel" id="students">
              <div class="panel-heading"><div><p class="eyebrow">DIRECTORY</p><h2>Students</h2></div><button class="button" (click)="showStudentForm = !showStudentForm">{{ showStudentForm ? 'Close form' : '+ Add student' }}</button></div>
              @if (showStudentForm) {
                <form class="student-form" (ngSubmit)="addStudent()">
                  <label>Student code<input name="code" placeholder="e.g. STU-002" [(ngModel)]="newStudent.student_code" required></label>
                  <label>Full name<input name="name" placeholder="Student name" [(ngModel)]="newStudent.full_name" required></label>
                  <label>Email<input name="email" placeholder="Optional email" type="email" [(ngModel)]="newStudent.email"></label>
                  <button class="button" type="submit" [disabled]="saving">{{ saving ? 'Saving...' : 'Save student' }}</button>
                </form>
              }
              <div class="table-toolbar"><div class="search-box">⌕<input aria-label="Search students" placeholder="Search by name or code..." [(ngModel)]="searchTerm"></div><span class="result-count">{{ filteredStudents.length }} of {{ students.length }} students</span></div>
              @if (!loading && filteredStudents.length === 0) { <div class="empty-state"><div class="empty-icon">♙</div><h3>{{ students.length ? 'No matching students' : 'No students yet' }}</h3><p>{{ students.length ? 'Try a different search term.' : 'Add your first student to this branch.' }}</p></div> }
              @else if (filteredStudents.length > 0) {
                <div class="table-wrap"><table><thead><tr><th>Student</th><th>Student code</th><th>Email</th><th>Status</th></tr></thead><tbody>
                  @for (student of filteredStudents; track student.id) { <tr><td><div class="student-cell"><span class="student-avatar">{{ student.full_name.charAt(0).toUpperCase() }}</span><strong>{{ student.full_name }}</strong></div></td><td class="code">{{ student.student_code }}</td><td>{{ student.email || '—' }}</td><td><span class="status active">Active</span></td></tr> }
                </tbody></table></div>
              }
            </article>

            <article class="panel" id="courses"><div class="panel-heading"><div><p class="eyebrow">ACADEMICS</p><h2>Courses</h2></div><span class="panel-link">{{ courses.length }} active</span></div>
              @for (course of courses; track course.id) { <div class="list-item"><span class="list-icon violet-bg">▤</span><div><strong>{{ course.name }}</strong><span>{{ course.code }} · {{ course.duration_months }} months</span></div><b>{{ course.monthly_fee | currency }}</b></div> } @empty { <div class="empty-small">No courses available.</div> }
            </article>
            <article class="panel"><div class="panel-heading"><div><p class="eyebrow">SCHEDULE</p><h2>Upcoming batches</h2></div><span class="panel-link">{{ batches.length }} active</span></div>
              @for (batch of batches; track batch.id) { <div class="list-item"><span class="list-icon green-bg">▦</span><div><strong>{{ batch.name }}</strong><span>Capacity {{ batch.capacity }} · Starts {{ batch.starts_on | date:'mediumDate' }}</span></div><span class="batch-dot"></span></div> } @empty { <div class="empty-small">No batches available.</div> }
            </article>
          </section>
        </main>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  user: User | null = null;
  branches: Branch[] = [];
  students: Student[] = [];
  courses: Course[] = [];
  batches: Batch[] = [];
  selectedBranchId = 0;
  showStudentForm = false;
  loading = true;
  saving = false;
  error = '';
  searchTerm = '';
  newStudent = { student_code: '', full_name: '', email: '' };

  get selectedBranch(): Branch | undefined { return this.branches.find(branch => branch.id === this.selectedBranchId); }
  get filteredStudents(): Student[] {
    const query = this.searchTerm.trim().toLowerCase();
    return query ? this.students.filter(student => `${student.full_name} ${student.student_code}`.toLowerCase().includes(query)) : this.students;
  }
  get firstName(): string { return this.user?.full_name.split(' ')[0] || 'there'; }
  get initials(): string { return this.user?.full_name.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase() || 'U'; }

  constructor() {
    this.auth.me().subscribe({ next: user => this.user = user, error: () => this.logout() });
    this.http.get<Branch[]>(`${API}/branches`).subscribe({
      next: branches => { this.branches = branches; this.selectedBranchId = branches[0]?.id ?? 0; this.loadBranch(); },
      error: () => { this.error = 'Unable to load branches. Check that the backend is running.'; this.loading = false; },
    });
  }
  loadBranch(): void {
    if (!this.selectedBranchId) { this.loading = false; return; }
    this.loading = true; this.error = '';
    const prefix = `${API}/branches/${this.selectedBranchId}`;
    forkJoin({ students: this.http.get<Student[]>(`${prefix}/students`), courses: this.http.get<Course[]>(`${prefix}/courses`), batches: this.http.get<Batch[]>(`${prefix}/batches`) })
      .subscribe({ next: result => { Object.assign(this, result); this.loading = false; }, error: () => { this.error = 'Unable to load branch data.'; this.loading = false; } });
  }
  addStudent(): void {
    this.saving = true; this.error = '';
    this.http.post<Student>(`${API}/branches/${this.selectedBranchId}/students`, this.newStudent).subscribe({
      next: () => { this.newStudent = { student_code: '', full_name: '', email: '' }; this.showStudentForm = false; this.saving = false; this.loadBranch(); },
      error: (response: { error?: { detail?: string } }) => { this.error = response.error?.detail ?? 'Unable to save student.'; this.saving = false; },
    });
  }
  logout(): void { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
