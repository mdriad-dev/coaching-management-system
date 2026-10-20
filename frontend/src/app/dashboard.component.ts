import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from './auth.service';
import { Batch, Branch, Course, FeeBalance, Mark, Student, Teacher, TimetableEntry, User } from './models';
import { API } from './api';
import { isBrowserDemo } from './api';
import { DemoService } from './demo.service';

@Component({
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, UpperCasePipe],
  template: `
    <div class="app-shell">
      <aside class="sidebar" [class.mobile-open]="menuOpen">
        <div class="brand"><span class="brand-mark">C</span><span>Coaching<span class="brand-muted">CMS</span></span></div>
        <nav class="nav-list" aria-label="Main navigation">
          <a class="nav-item active" href="#overview">▦ <span>Overview</span></a>
          <a class="nav-item" href="#students">♙ <span>Students</span><span class="nav-count">{{ students.length }}</span></a>
          <a class="nav-item" href="#courses">▤ <span>Courses & batches</span></a>
          <a class="nav-item" href="#teachers">♙ <span>Teachers</span><span class="nav-count">{{ teachers.length }}</span></a>
          <a class="nav-item" href="#attendance">◷ <span>Attendance</span><span class="soon">API</span></a>
          <a class="nav-item" href="#payments">৳ <span>Fees & results</span></a>
        </nav>
        <div class="sidebar-footer"><div class="security-note">⌁ <span>Branch data is protected<br>by server authorization</span></div></div>
      </aside>

      <div class="content-area">
        <header class="topbar">
          <button class="mobile-menu" aria-label="Toggle navigation" (click)="menuOpen = !menuOpen">☰</button>
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
                  @for (student of filteredStudents; track student.id) { <tr><td><div class="student-cell"><span class="student-avatar">{{ student.full_name.charAt(0).toUpperCase() }}</span><strong>{{ student.full_name }}</strong></div></td><td class="code">{{ student.student_code }}</td><td>{{ student.email || '—' }}</td><td><span class="status active">Active</span></td><td><button class="icon-button danger" (click)="remove('students', student.id, student.full_name)" aria-label="Remove student">×</button></td></tr> }
                </tbody></table></div>
              }
            </article>

            <article class="panel" id="courses"><div class="panel-heading"><div><p class="eyebrow">ACADEMICS</p><h2>Courses</h2></div><button class="button small-button" (click)="openForm('course')">+ Add</button></div>
              @for (course of courses; track course.id) { <div class="list-item"><span class="list-icon violet-bg">▤</span><div><strong>{{ course.name }}</strong><span>{{ course.code }} · {{ course.duration_months }} months</span></div><b>{{ course.monthly_fee | currency }}</b><button class="icon-button danger" (click)="remove('courses', course.id, course.name)">×</button></div> } @empty { <div class="empty-small">No courses available.</div> }
            </article>
            <article class="panel"><div class="panel-heading"><div><p class="eyebrow">SCHEDULE</p><h2>Upcoming batches</h2></div><button class="button small-button" (click)="openForm('batch')">+ Add</button></div>
              @for (batch of batches; track batch.id) { <div class="list-item"><span class="list-icon green-bg">▦</span><div><strong>{{ batch.name }}</strong><span>Capacity {{ batch.capacity }} · Starts {{ batch.starts_on | date:'mediumDate' }}</span></div><button class="icon-button danger" (click)="remove('batches', batch.id, batch.name)">×</button></div> } @empty { <div class="empty-small">No batches available.</div> }
            </article>
            <article class="panel" id="teachers"><div class="panel-heading"><div><p class="eyebrow">FACULTY</p><h2>Teachers</h2></div><button class="button small-button" (click)="openForm('teacher')">+ Add</button></div>
              @for (teacher of teachers; track teacher.id) { <div class="list-item"><span class="list-icon blue-bg">♙</span><div><strong>{{ teacher.full_name }}</strong><span>{{ teacher.subject_specialization }} · {{ teacher.email || 'No email' }}</span></div><button class="icon-button danger" (click)="remove('teachers', teacher.id, teacher.full_name)">×</button></div> } @empty { <div class="empty-small">No teachers registered.</div> }
            </article>
            <article class="panel" id="attendance"><div class="panel-heading"><div><p class="eyebrow">TIMETABLE</p><h2>Class schedule</h2></div><div class="panel-actions"><button class="button small-button" (click)="openForm('timetable')">+ Class</button><button class="button secondary small-button" (click)="openForm('attendance')">+ Attendance</button></div></div>
              @for (entry of timetable; track entry.id) { <div class="list-item"><span class="list-icon green-bg">◷</span><div><strong>{{ entry.weekday }} · {{ entry.starts_at }}–{{ entry.ends_at }}</strong><span>Room {{ entry.room }} · Batch #{{ entry.batch_id }}</span></div><button class="icon-button danger" (click)="remove('timetable', entry.id, entry.room)">×</button></div> } @empty { <div class="empty-small">No classes scheduled.</div> }
            </article>
            <article class="panel" id="payments"><div class="panel-heading"><div><p class="eyebrow">ACADEMIC RESULTS</p><h2>Marks book</h2></div><button class="button small-button" (click)="openForm('mark')">+ Add</button></div>
              @for (mark of marks; track mark.id) { <div class="list-item"><span class="list-icon violet-bg">✓</span><div><strong>{{ mark.assessment_name }} · Student #{{ mark.student_id }}</strong><span>Batch #{{ mark.batch_id }}</span></div><b>{{ mark.obtained_marks }}/{{ mark.max_marks }}</b><button class="icon-button danger" (click)="remove('marks', mark.id, mark.assessment_name)">×</button></div> } @empty { <div class="empty-small">No marks recorded.</div> }
            </article>
            <article class="panel"><div class="panel-heading"><div><p class="eyebrow">FINANCE</p><h2>Fee balances</h2></div><div class="panel-actions"><button class="button small-button" (click)="openForm('fee')">+ Add fee</button><button class="button secondary small-button" (click)="openForm('payment')">+ Payment</button></div></div>
              @for (balance of feeBalances; track balance.student_id) { <div class="list-item"><span class="list-icon amber-bg">৳</span><div><strong>Student #{{ balance.student_id }}</strong><span>Due {{ balance.total_due | currency }} · Paid {{ balance.total_paid | currency }}</span></div><b [class.balance-due]="balance.outstanding > 0">{{ balance.outstanding | currency }}</b></div> } @empty { <div class="empty-small">No fee charges recorded.</div> }
            </article>
          </section>
        </main>
      </div>
      @if (activeForm) {
        <div class="modal-backdrop" (click)="closeForm()">
          <section class="modal-card" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
            <div class="panel-heading"><div><p class="eyebrow">NEW RECORD</p><h2>{{ formTitle }}</h2></div><button class="icon-button" (click)="closeForm()" aria-label="Close form">×</button></div>
            <form class="modal-form" (ngSubmit)="submitForm()">
              @if (activeForm === 'course') {
                <label>Course name<input name="name" [(ngModel)]="formData.name" required></label><label>Course code<input name="code" [(ngModel)]="formData.code" required></label><label>Duration (months)<input name="months" type="number" min="1" [(ngModel)]="formData.duration_months" required></label><label>Monthly fee<input name="fee" type="number" min="0" step=".01" [(ngModel)]="formData.monthly_fee" required></label>
              } @else if (activeForm === 'teacher') {
                <label>Full name<input name="name" [(ngModel)]="formData.full_name" required></label><label>Subject specialization<input name="subject" [(ngModel)]="formData.subject_specialization" required></label><label>Email<input name="email" type="email" [(ngModel)]="formData.email"></label>
              } @else if (activeForm === 'batch') {
                <label>Course ID<input name="course" type="number" [(ngModel)]="formData.course_id" required></label><label>Batch name<input name="name" [(ngModel)]="formData.name" required></label><label>Capacity<input name="capacity" type="number" min="1" [(ngModel)]="formData.capacity" required></label><label>Start date/time<input name="starts" type="datetime-local" [(ngModel)]="formData.starts_on" required></label>
              } @else if (activeForm === 'timetable') {
                <label>Batch ID<input name="batch" type="number" [(ngModel)]="formData.batch_id" required></label><label>Teacher ID<input name="teacher" type="number" [(ngModel)]="formData.teacher_id" required></label><label>Weekday<select name="weekday" [(ngModel)]="formData.weekday"><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option></select></label><label>Start time<input name="start" type="time" [(ngModel)]="formData.starts_at" required></label><label>End time<input name="end" type="time" [(ngModel)]="formData.ends_at" required></label><label>Room<input name="room" [(ngModel)]="formData.room" required></label>
              } @else if (activeForm === 'attendance') {
                <label>Enrollment ID<input name="enrollment" type="number" [(ngModel)]="formData.enrollment_id" required></label><label>Date/time<input name="date" type="datetime-local" [(ngModel)]="formData.attended_on" required></label><label>Status<select name="status" [(ngModel)]="formData.status"><option>present</option><option>absent</option><option>late</option><option>excused</option></select></label>
              } @else if (activeForm === 'mark') {
                <label>Student ID<input name="student" type="number" [(ngModel)]="formData.student_id" required></label><label>Batch ID<input name="batch" type="number" [(ngModel)]="formData.batch_id" required></label><label>Assessment<input name="assessment" [(ngModel)]="formData.assessment_name" required></label><label>Maximum marks<input name="max" type="number" min="1" [(ngModel)]="formData.max_marks" required></label><label>Obtained marks<input name="obtained" type="number" min="0" [(ngModel)]="formData.obtained_marks" required></label>
              } @else if (activeForm === 'fee') {
                <label>Student ID<input name="student" type="number" [(ngModel)]="formData.student_id" required></label><label>Description<input name="description" [(ngModel)]="formData.description" required></label><label>Amount due<input name="amount" type="number" min="0" step=".01" [(ngModel)]="formData.amount_due" required></label><label>Due date<input name="due" type="datetime-local" [(ngModel)]="formData.due_on" required></label>
              } @else {
                <label>Student ID<input name="student" type="number" [(ngModel)]="formData.student_id" required></label><label>Amount<input name="amount" type="number" min="0" step=".01" [(ngModel)]="formData.amount" required></label><label>Payment method<input name="method" [(ngModel)]="formData.payment_method" required></label><label>Reference<input name="reference" [(ngModel)]="formData.transaction_reference"></label>
              }
              @if (formError) { <p class="error">{{ formError }}</p> }
              <div class="modal-actions"><button type="button" class="button secondary" (click)="closeForm()">Cancel</button><button class="button" type="submit" [disabled]="saving">{{ saving ? 'Saving...' : 'Create record' }}</button></div>
            </form>
          </section>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly demo = inject(DemoService);
  user: User | null = null;
  branches: Branch[] = [];
  students: Student[] = [];
  courses: Course[] = [];
  batches: Batch[] = [];
  teachers: Teacher[] = [];
  timetable: TimetableEntry[] = [];
  marks: Mark[] = [];
  feeBalances: FeeBalance[] = [];
  selectedBranchId = 0;
  showStudentForm = false;
  loading = true;
  saving = false;
  error = '';
  searchTerm = '';
  newStudent = { student_code: '', full_name: '', email: '' };
  menuOpen = false;
  activeForm: 'course' | 'teacher' | 'batch' | 'timetable' | 'attendance' | 'mark' | 'fee' | 'payment' | null = null;
  formData: Record<string, string | number> = {};
  formError = '';
  get formTitle(): string { return ({ course: 'Add course', teacher: 'Add teacher', batch: 'Add batch', timetable: 'Schedule class', attendance: 'Record attendance', mark: 'Add marks', fee: 'Add fee charge', payment: 'Record payment' } as Record<string, string>)[this.activeForm || ''] || 'Add record'; }

  get selectedBranch(): Branch | undefined { return this.branches.find(branch => branch.id === this.selectedBranchId); }
  get filteredStudents(): Student[] {
    const query = this.searchTerm.trim().toLowerCase();
    return query ? this.students.filter(student => `${student.full_name} ${student.student_code}`.toLowerCase().includes(query)) : this.students;
  }
  get firstName(): string { return this.user?.full_name.split(' ')[0] || 'there'; }
  get initials(): string { return this.user?.full_name.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase() || 'U'; }

  constructor() {
    this.auth.me().subscribe({ next: user => this.user = user, error: () => this.logout() });
    if (isBrowserDemo) {
      this.branches = this.demo.branches();
      this.selectedBranchId = this.branches[0]?.id ?? 0;
      this.loadBranch();
      return;
    }
    this.http.get<Branch[]>(`${API}/branches`).subscribe({
      next: branches => { this.branches = branches; this.selectedBranchId = branches[0]?.id ?? 0; this.loadBranch(); },
      error: () => { this.error = 'Unable to load branches. Check that the backend is running.'; this.loading = false; },
    });
  }
  loadBranch(): void {
    if (!this.selectedBranchId) { this.loading = false; return; }
    this.loading = true; this.error = '';
    if (isBrowserDemo) {
      Object.assign(this, this.demo.snapshot(this.selectedBranchId));
      this.loading = false;
      return;
    }
    const prefix = `${API}/branches/${this.selectedBranchId}`;
    forkJoin({ students: this.http.get<Student[]>(`${prefix}/students`), courses: this.http.get<Course[]>(`${prefix}/courses`), batches: this.http.get<Batch[]>(`${prefix}/batches`), teachers: this.http.get<Teacher[]>(`${prefix}/teachers`), timetable: this.http.get<TimetableEntry[]>(`${prefix}/timetable`), marks: this.http.get<Mark[]>(`${prefix}/marks`), feeBalances: this.http.get<FeeBalance[]>(`${prefix}/fee-balances`) })
      .subscribe({ next: result => { Object.assign(this, result); this.loading = false; }, error: () => { this.error = 'Unable to load branch data.'; this.loading = false; } });
  }
  addStudent(): void {
    this.saving = true; this.error = '';
    if (isBrowserDemo) {
      this.demo.create('students', this.selectedBranchId, this.newStudent);
      this.newStudent = { student_code: '', full_name: '', email: '' };
      this.showStudentForm = false; this.saving = false; this.loadBranch();
      return;
    }
    this.http.post<Student>(`${API}/branches/${this.selectedBranchId}/students`, this.newStudent).subscribe({
      next: () => { this.newStudent = { student_code: '', full_name: '', email: '' }; this.showStudentForm = false; this.saving = false; this.loadBranch(); },
      error: (response: { error?: { detail?: string } }) => { this.error = response.error?.detail ?? 'Unable to save student.'; this.saving = false; },
    });
  }
  openForm(type: NonNullable<DashboardComponent['activeForm']>): void { this.activeForm = type; this.formError = ''; this.formData = type === 'batch' ? { capacity: 30 } : {}; }
  closeForm(): void { if (!this.saving) this.activeForm = null; }
  submitForm(): void {
    if (!this.activeForm) return;
    this.saving = true; this.formError = '';
    const endpoints: Record<string, string> = { course: 'courses', teacher: 'teachers', batch: 'batches', timetable: 'timetable', attendance: 'attendance', mark: 'marks', fee: 'fee-charges', payment: 'payments' };
    const payload = { ...this.formData };
    if (typeof payload['starts_on'] === 'string') payload['starts_on'] = new Date(payload['starts_on']).toISOString();
    if (typeof payload['attended_on'] === 'string') payload['attended_on'] = new Date(payload['attended_on']).toISOString();
    if (typeof payload['due_on'] === 'string') payload['due_on'] = new Date(payload['due_on']).toISOString();
    if (isBrowserDemo) {
      this.demo.create(endpoints[this.activeForm], this.selectedBranchId, payload);
      this.saving = false; this.activeForm = null; this.loadBranch();
      return;
    }
    this.http.post(`${API}/branches/${this.selectedBranchId}/${endpoints[this.activeForm]}`, payload).subscribe({
      next: () => { this.saving = false; this.activeForm = null; this.loadBranch(); },
      error: response => { this.saving = false; this.formError = response.error?.detail ?? 'The record could not be created.'; },
    });
  }
  private ask(message: string): string | null { return window.prompt(message); }
  addCourse(): void {
    const name = this.ask('Course name:'); const code = this.ask('Course code:'); const months = this.ask('Duration in months:'); const fee = this.ask('Monthly fee:');
    if (!name || !code || !months || !fee) return;
    this.http.post(`${API}/branches/${this.selectedBranchId}/courses`, { name, code, duration_months: Number(months), monthly_fee: Number(fee) }).subscribe({ next: () => this.loadBranch(), error: response => this.showApiError(response) });
  }
  addTeacher(): void {
    const full_name = this.ask('Teacher name:'); const subject_specialization = this.ask('Subject specialization:'); const email = this.ask('Email (optional):');
    if (!full_name || !subject_specialization) return;
    this.http.post(`${API}/branches/${this.selectedBranchId}/teachers`, { full_name, subject_specialization, email: email || null }).subscribe({ next: () => this.loadBranch(), error: response => this.showApiError(response) });
  }
  addBatch(): void {
    const course_id = this.ask('Course ID:'); const name = this.ask('Batch name:'); const capacity = this.ask('Capacity:'); const starts_on = this.ask('Start date/time (ISO):');
    if (!course_id || !name || !capacity || !starts_on) return;
    this.http.post(`${API}/branches/${this.selectedBranchId}/batches`, { course_id: Number(course_id), name, capacity: Number(capacity), starts_on }).subscribe({ next: () => this.loadBranch(), error: response => this.showApiError(response) });
  }
  addTimetable(): void {
    const batch_id = this.ask('Batch ID:'); const teacher_id = this.ask('Teacher ID:'); const weekday = this.ask('Weekday:'); const starts_at = this.ask('Start time (HH:MM):'); const ends_at = this.ask('End time (HH:MM):'); const room = this.ask('Room:');
    if (!batch_id || !teacher_id || !weekday || !starts_at || !ends_at || !room) return;
    this.http.post(`${API}/branches/${this.selectedBranchId}/timetable`, { batch_id: Number(batch_id), teacher_id: Number(teacher_id), weekday, starts_at, ends_at, room }).subscribe({ next: () => this.loadBranch(), error: response => this.showApiError(response) });
  }
  addMark(): void {
    const student_id = this.ask('Student ID:'); const batch_id = this.ask('Batch ID:'); const assessment_name = this.ask('Assessment name:'); const max_marks = this.ask('Maximum marks:'); const obtained_marks = this.ask('Obtained marks:');
    if (!student_id || !batch_id || !assessment_name || !max_marks || !obtained_marks) return;
    this.http.post(`${API}/branches/${this.selectedBranchId}/marks`, { student_id: Number(student_id), batch_id: Number(batch_id), assessment_name, max_marks: Number(max_marks), obtained_marks: Number(obtained_marks) }).subscribe({ next: () => this.loadBranch(), error: response => this.showApiError(response) });
  }
  addFeeCharge(): void {
    const student_id = this.ask('Student ID:'); const description = this.ask('Fee description:'); const amount_due = this.ask('Amount due:'); const due_on = this.ask('Due date/time (ISO):');
    if (!student_id || !description || !amount_due || !due_on) return;
    this.http.post(`${API}/branches/${this.selectedBranchId}/fee-charges`, { student_id: Number(student_id), description, amount_due: Number(amount_due), due_on }).subscribe({ next: () => this.loadBranch(), error: response => this.showApiError(response) });
  }
  addAttendance(): void {
    const enrollment_id = this.ask('Enrollment ID:'); const attended_on = this.ask('Date/time (ISO):'); const status = this.ask('Status: present, absent, late, or excused');
    if (!enrollment_id || !attended_on || !status) return;
    this.http.post(`${API}/branches/${this.selectedBranchId}/attendance`, { enrollment_id: Number(enrollment_id), attended_on, status }).subscribe({ next: () => this.loadBranch(), error: response => this.showApiError(response) });
  }
  addPayment(): void {
    const student_id = this.ask('Student ID:'); const amount = this.ask('Payment amount:'); const payment_method = this.ask('Payment method:'); const transaction_reference = this.ask('Transaction reference (optional):');
    if (!student_id || !amount || !payment_method) return;
    this.http.post(`${API}/branches/${this.selectedBranchId}/payments`, { student_id: Number(student_id), amount: Number(amount), payment_method, transaction_reference: transaction_reference || null }).subscribe({ next: () => this.loadBranch(), error: response => this.showApiError(response) });
  }
  remove(resource: string, id: number, label: string): void {
    if (!window.confirm(`Remove "${label}"? This action cannot be undone from the dashboard.`)) return;
    if (isBrowserDemo) {
      this.demo.remove(resource, id);
      this.loadBranch();
      return;
    }
    this.http.delete(`${API}/branches/${this.selectedBranchId}/${resource}/${id}`).subscribe({ next: () => this.loadBranch(), error: response => this.showApiError(response) });
  }
  private showApiError(response: { error?: { detail?: string } }): void { this.error = response.error?.detail ?? 'The operation could not be completed.'; }
  logout(): void { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
