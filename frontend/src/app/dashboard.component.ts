import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from './auth.service';
import {
  AttendanceRecord,
  Batch,
  Branch,
  Course,
  Enrollment,
  FeeBalance,
  Mark,
  Payment,
  Student,
  Teacher,
  TimetableEntry,
  User,
} from './models';
import { API, isBrowserDemo } from './api';
import { DemoService } from './demo.service';

@Component({
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, UpperCasePipe],
  template: `
    <div class="app-shell">
      <div class="cyber-glow-bg" aria-hidden="true"></div>
      <aside class="sidebar" [class.mobile-open]="menuOpen">
        <div class="brand">
          <span class="brand-mark">⚡</span>
          <span>Coaching<span class="brand-muted">CMS</span></span>
        </div>
        <div class="system-status-pill">
          <span class="pulse-indicator"></span>
          <span>COMMAND CENTER · LIVE</span>
        </div>
        <nav class="nav-list" aria-label="Main navigation">
          <a class="nav-item active" href="#overview">▦ <span>Executive Overview</span></a>
          <a class="nav-item" href="#students">
            ♙ <span>Students Directory</span>
            <span class="nav-count">{{ students.length }}</span>
          </a>
          <a class="nav-item" href="#finances">
            ৳ <span>Fees & Collections</span>
            @if (totalOutstanding > 0) {
              <span class="nav-count badge-due">৳{{ totalOutstanding | number:'1.0-0' }}</span>
            }
          </a>
          <a class="nav-item" href="#courses">▤ <span>Courses & Batches</span></a>
          <a class="nav-item" href="#teachers">
            ♙ <span>Faculty</span>
            <span class="nav-count">{{ teachers.length }}</span>
          </a>
          <a class="nav-item" href="#attendance">◷ <span>Attendance & Schedule</span></a>
        </nav>
        <div class="sidebar-footer">
          <div class="security-note">
            ⌁ <span>Owner Executive Edition<br>Multi-branch protected</span>
          </div>
        </div>
      </aside>

      <div class="content-area">
        <header class="topbar">
          <button class="mobile-menu" aria-label="Toggle navigation" (click)="menuOpen = !menuOpen">☰</button>
          <div class="topbar-left">
            <div class="topbar-title">Coaching Command Center</div>
            <div class="branch-indicator-chip">
              <span class="branch-dot-active"></span>
              <span>{{ selectedBranch?.name || 'All Campuses' }}</span>
            </div>
          </div>
          <div class="topbar-actions">
            <span class="currency-chip">BDT ৳ ACTIVE</span>
            <span class="role-pill">{{ user?.role || 'Coaching Owner' }}</span>
            <div class="avatar">{{ initials }}</div>
            <button class="sign-out" (click)="logout()">Sign out</button>
          </div>
        </header>

        <main class="page">
          <section class="hero" id="overview">
            <div>
              <p class="eyebrow">WELCOME BACK, {{ firstName | uppercase }} (OWNER)</p>
              <h1>Operations & Financial Center</h1>
              <p class="hero-copy">Real-time overview of admissions, fee collection rate, faculty timetable and campus operations.</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: end;">
              <label class="branch-picker">
                <span>Active Branch</span>
                <select [(ngModel)]="selectedBranchId" (ngModelChange)="loadBranch()">
                  @for (branch of branches; track branch.id) {
                    <option [ngValue]="branch.id">{{ branch.name }} ({{ branch.code }})</option>
                  }
                </select>
              </label>
              <button class="button secondary small-button" style="margin-bottom: 3px;" (click)="openForm('branch')" title="Add New Campus">+ Branch</button>
            </div>
          </section>

          @if (error) {
            <div class="error" role="alert"><strong>Notice:</strong> {{ error }}</div>
          }
          @if (loading) {
            <div class="loading-bar" aria-label="Loading"></div>
          }

          <!-- Owner Quick Action Toolbar -->
          <div class="quick-toolbar">
            <button class="button action-admit" (click)="showStudentForm = !showStudentForm">
              {{ showStudentForm ? '✕ Close Form' : '+ New Admission' }}
            </button>
            <button class="button action-pay" (click)="openForm('payment')">৳ Collect Payment</button>
            <button class="button secondary" (click)="openForm('enrollment')">+ Enroll in Batch</button>
            <button class="button secondary" (click)="openForm('fee')">+ Charge Fee</button>
            <button class="button secondary" (click)="openForm('attendance')">+ Mark Attendance</button>
            <button class="button secondary" (click)="openForm('batch')">+ New Batch</button>
            <button class="button secondary" (click)="openForm('timetable')">+ Schedule Class</button>
          </div>

          <!-- Executive Owner Statistics Grid -->
          <section class="stats-grid" aria-label="Coaching statistics">
            <article class="stat-card blue">
              <div class="stat-icon">♙</div>
              <div class="stat-content">
                <span>Total Enrolled</span>
                <strong>{{ students.length }}</strong>
                <small>{{ enrollments.length }} batch enrollments</small>
              </div>
            </article>

            <article class="stat-card green">
              <div class="stat-icon">৳</div>
              <div class="stat-content">
                <span>Collected Fees</span>
                <strong>৳{{ totalCollected | number:'1.0-0' }}</strong>
                <div class="meter-bar">
                  <div class="meter-fill" [style.width.%]="collectionRate"></div>
                </div>
                <small>{{ collectionRate | number:'1.0-0' }}% collected (of ৳{{ totalDue | number:'1.0-0' }})</small>
              </div>
            </article>

            <article class="stat-card amber">
              <div class="stat-icon">!</div>
              <div class="stat-content">
                <span>Outstanding Dues</span>
                <strong style="color: #f87171;">৳{{ totalOutstanding | number:'1.0-0' }}</strong>
                <small>{{ studentsWithDues }} students with pending dues</small>
              </div>
            </article>

            <article class="stat-card violet">
              <div class="stat-icon">▦</div>
              <div class="stat-content">
                <span>Active Batches</span>
                <strong>{{ batches.length }}</strong>
                <small>{{ courses.length }} courses · {{ teachers.length }} faculty</small>
              </div>
            </article>
          </section>

          <section class="content-grid">
            <!-- Student Management & Admission Panel -->
            <article class="panel students-panel" id="students">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">ADMISSIONS & DIRECTORY</p>
                  <h2>Students ({{ filteredStudents.length }})</h2>
                </div>
                <div class="panel-actions">
                  <button
                    class="button small-button"
                    [class.secondary]="!showOnlyDue"
                    (click)="showOnlyDue = !showOnlyDue"
                  >
                    {{ showOnlyDue ? 'Showing: Dues Only' : 'Filter: Dues Only (' + studentsWithDues + ')' }}
                  </button>
                  <button class="button small-button" (click)="showStudentForm = !showStudentForm">
                    {{ showStudentForm ? 'Close' : '+ Admit' }}
                  </button>
                </div>
              </div>

              @if (showStudentForm) {
                <form class="student-form" (ngSubmit)="addStudent()" style="grid-template-columns: 1fr 1.3fr 1.2fr 1.2fr auto;">
                  <label>
                    Student code
                    <input name="code" placeholder="e.g. STU-105" [(ngModel)]="newStudent.student_code" required />
                  </label>
                  <label>
                    Full name
                    <input name="name" placeholder="Student name" [(ngModel)]="newStudent.full_name" required />
                  </label>
                  <label>
                    Phone / Guardian
                    <input name="phone" placeholder="+8801700..." [(ngModel)]="newStudent.phone" />
                  </label>
                  <label>
                    Email (optional)
                    <input name="email" placeholder="email@example.com" type="email" [(ngModel)]="newStudent.email" />
                  </label>
                  <button class="button" type="submit" [disabled]="saving">
                    {{ saving ? 'Saving...' : 'Save' }}
                  </button>
                </form>
              }

              <div class="table-toolbar">
                <div class="search-box">
                  ⌕
                  <input
                    aria-label="Search students"
                    placeholder="Search by name, code or phone..."
                    [(ngModel)]="searchTerm"
                  />
                </div>
                <span class="result-count">
                  {{ filteredStudents.length }} of {{ students.length }} students
                </span>
              </div>

              @if (!loading && filteredStudents.length === 0) {
                <div class="empty-state">
                  <div class="empty-icon">♙</div>
                  <h3>{{ students.length ? 'No matching students' : 'No students enrolled yet' }}</h3>
                  <p>{{ students.length ? 'Try a different search term or reset the due filter.' : 'Admit your first student to this branch.' }}</p>
                </div>
              } @else if (filteredStudents.length > 0) {
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Code</th>
                        <th>Contact</th>
                        <th>Fee Balance</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (student of filteredStudents; track student.id) {
                        <tr>
                          <td>
                            <div class="student-cell">
                              <span class="student-avatar">{{ student.full_name.charAt(0).toUpperCase() }}</span>
                              <div>
                                <strong>{{ student.full_name }}</strong>
                                @if (student.email) {
                                  <div style="font-size: 10px; color: #8b98ab;">{{ student.email }}</div>
                                }
                              </div>
                            </div>
                          </td>
                          <td class="code">{{ student.student_code }}</td>
                          <td>
                            @if (student.phone) {
                              <a [href]="'tel:' + student.phone" style="color: #456bd2; text-decoration: none; font-size: 11px;">
                                ☎ {{ student.phone }}
                              </a>
                            } @else {
                              <span style="color: #b0bac9;">—</span>
                            }
                          </td>
                          <td>
                            @if (getStudentDue(student.id) > 0) {
                              <span class="status" style="color: #c04f4f; background: #fff0f0; font-weight: 700;">
                                ৳{{ getStudentDue(student.id) | number:'1.0-0' }} Due
                              </span>
                            } @else {
                              <span class="status active">Paid in Full</span>
                            }
                          </td>
                          <td>
                            <button
                              class="icon-button danger"
                              (click)="remove('students', student.id, student.full_name)"
                              aria-label="Remove student"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </article>

            <!-- Financial Management & Payments Ledger -->
            <article class="panel" id="finances">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">FINANCE & CASHFLOW</p>
                  <h2>Recent Payments (৳{{ totalCollected | number:'1.0-0' }})</h2>
                </div>
                <div class="panel-actions">
                  <button class="button small-button" style="background: #27a881;" (click)="openForm('payment')">+ Payment</button>
                  <button class="button secondary small-button" (click)="openForm('fee')">+ Charge Fee</button>
                </div>
              </div>

              @for (p of payments; track p.id) {
                <div class="list-item">
                  <span class="list-icon green-bg">৳</span>
                  <div>
                    <strong>{{ getStudentName(p.student_id) }}</strong>
                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                      <span class="pay-method-badge" [class]="p.payment_method.toLowerCase()">{{ p.payment_method }}</span>
                      <span class="pay-meta">@if (p.transaction_reference) { {{ p.transaction_reference }} · } {{ p.paid_at | date:'mediumDate' }}</span>
                    </div>
                  </div>
                  <b class="pay-amount">+৳{{ p.amount | number:'1.0-0' }}</b>
                  <button class="icon-button danger" (click)="remove('payments', p.id, 'Payment of ৳' + p.amount)">×</button>
                </div>
              } @empty {
                <div class="empty-small">No payment records yet. Click "+ Payment" to log cash or bKash collections.</div>
              }
            </article>

            <!-- Courses Panel -->
            <article class="panel" id="courses">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">CURRICULUM</p>
                  <h2>Courses</h2>
                </div>
                <button class="button small-button" (click)="openForm('course')">+ Add Course</button>
              </div>
              @for (course of courses; track course.id) {
                <div class="list-item">
                  <span class="list-icon violet-bg">▤</span>
                  <div>
                    <strong>{{ course.name }}</strong>
                    <span>{{ course.code }} · {{ course.duration_months }} months</span>
                  </div>
                  <b>৳{{ course.monthly_fee | number:'1.0-0' }}/mo</b>
                  <button class="icon-button danger" (click)="remove('courses', course.id, course.name)">×</button>
                </div>
              } @empty {
                <div class="empty-small">No courses defined.</div>
              }
            </article>

            <!-- Upcoming Batches Panel -->
            <article class="panel">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">BATCHES & ENROLLMENTS</p>
                  <h2>Batches & Classes</h2>
                </div>
                <div class="panel-actions">
                  <button class="button small-button" (click)="openForm('batch')">+ New Batch</button>
                  <button class="button secondary small-button" (click)="openForm('enrollment')">+ Enroll</button>
                </div>
              </div>
              @for (batch of batches; track batch.id) {
                <div class="list-item">
                  <span class="list-icon green-bg">▦</span>
                  <div>
                    <strong>{{ batch.name }}</strong>
                    <span>{{ getCourseName(batch.course_id) }} · Cap: {{ batch.capacity }} · Starts {{ batch.starts_on | date:'mediumDate' }}</span>
                  </div>
                  <button class="icon-button danger" (click)="remove('batches', batch.id, batch.name)">×</button>
                </div>
              } @empty {
                <div class="empty-small">No batches active at this branch.</div>
              }
            </article>

            <!-- Faculty Panel -->
            <article class="panel" id="teachers">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">FACULTY</p>
                  <h2>Teachers & Instructors</h2>
                </div>
                <button class="button small-button" (click)="openForm('teacher')">+ Add Teacher</button>
              </div>
              @for (teacher of teachers; track teacher.id) {
                <div class="list-item">
                  <span class="list-icon blue-bg">♙</span>
                  <div>
                    <strong>{{ teacher.full_name }}</strong>
                    <span>{{ teacher.subject_specialization }} · {{ teacher.email || 'No email' }}</span>
                  </div>
                  <button class="icon-button danger" (click)="remove('teachers', teacher.id, teacher.full_name)">×</button>
                </div>
              } @empty {
                <div class="empty-small">No teachers registered yet.</div>
              }
            </article>

            <!-- Timetable & Class Schedule Panel -->
            <article class="panel" id="attendance">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">SCHEDULE</p>
                  <h2>Weekly Routine</h2>
                </div>
                <button class="button small-button" (click)="openForm('timetable')">+ Schedule Class</button>
              </div>
              @for (entry of timetable; track entry.id) {
                <div class="list-item">
                  <span class="list-icon green-bg">◷</span>
                  <div>
                    <strong>{{ entry.weekday }} · {{ entry.starts_at }}–{{ entry.ends_at }}</strong>
                    <span>Room {{ entry.room }} · {{ getBatchName(entry.batch_id) }} · {{ getTeacherName(entry.teacher_id) }}</span>
                  </div>
                  <button class="icon-button danger" (click)="remove('timetable', entry.id, entry.room)">×</button>
                </div>
              } @empty {
                <div class="empty-small">No classes scheduled on the routine.</div>
              }
            </article>

            <!-- Exam Results & Marks Book Panel -->
            <article class="panel">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">ACADEMIC PERFORMANCE</p>
                  <h2>Exam Results</h2>
                </div>
                <button class="button small-button" (click)="openForm('mark')">+ Record Marks</button>
              </div>
              @for (mark of marks; track mark.id) {
                <div class="list-item">
                  <span class="list-icon violet-bg">✓</span>
                  <div>
                    <strong>{{ mark.assessment_name }} · {{ getStudentName(mark.student_id) }}</strong>
                    <span>{{ getBatchName(mark.batch_id) }}</span>
                  </div>
                  <b>{{ mark.obtained_marks }} / {{ mark.max_marks }}</b>
                  <button class="icon-button danger" (click)="remove('marks', mark.id, mark.assessment_name)">×</button>
                </div>
              } @empty {
                <div class="empty-small">No exam results recorded.</div>
              }
            </article>

            <!-- Attendance Logs Panel -->
            <article class="panel">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">DAILY ATTENDANCE</p>
                  <h2>Attendance Log</h2>
                </div>
                <button class="button small-button" (click)="openForm('attendance')">+ Mark Attendance</button>
              </div>
              @for (att of attendance; track att.id) {
                <div class="list-item">
                  <span class="list-icon blue-bg">◷</span>
                  <div>
                    <strong>Enrollment #{{ att.enrollment_id }}</strong>
                    <span>{{ att.attended_on | date:'mediumDate' }}</span>
                  </div>
                  <span
                    class="status"
                    [class.active]="att.status === 'present'"
                    [style.background]="att.status === 'absent' ? '#ffebe8' : (att.status === 'late' ? '#fff4db' : '')"
                    [style.color]="att.status === 'absent' ? '#c04f4f' : (att.status === 'late' ? '#b08020' : '')"
                  >
                    {{ att.status | uppercase }}
                  </span>
                  <button class="icon-button danger" (click)="remove('attendance', att.id, 'Attendance record')">×</button>
                </div>
              } @empty {
                <div class="empty-small">No attendance records logged.</div>
              }
            </article>
          </section>
        </main>
      </div>

      <!-- Owner Interactive Modal Forms (With Smart Dropdowns!) -->
      @if (activeForm) {
        <div class="modal-backdrop" (click)="closeForm()">
          <section class="modal-card" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
            <div class="panel-heading">
              <div>
                <p class="eyebrow">OWNER ACTION</p>
                <h2>{{ formTitle }}</h2>
              </div>
              <button class="icon-button" (click)="closeForm()" aria-label="Close form">×</button>
            </div>

            <form class="modal-form" (ngSubmit)="submitForm()">
              @if (activeForm === 'course') {
                <label>Course Name<input name="name" placeholder="e.g. Higher Math Intensive" [(ngModel)]="formData.name" required /></label>
                <label>Course Code<input name="code" placeholder="e.g. MTH-201" [(ngModel)]="formData.code" required /></label>
                <label>Duration (months)<input name="months" type="number" min="1" [(ngModel)]="formData.duration_months" required /></label>
                <label>Monthly Tuition (BDT)<input name="fee" type="number" min="0" step="1" [(ngModel)]="formData.monthly_fee" required /></label>
              } @else if (activeForm === 'batch') {
                <label style="grid-column: 1 / -1;">
                  Select Course
                  <select name="course_id" [(ngModel)]="formData.course_id" required>
                    <option [ngValue]="undefined" disabled selected>-- Choose Course --</option>
                    @for (c of courses; track c.id) {
                      <option [ngValue]="c.id">{{ c.name }} ({{ c.code }})</option>
                    }
                  </select>
                </label>
                <label>Batch Name<input name="name" placeholder="e.g. Morning Math Batch A" [(ngModel)]="formData.name" required /></label>
                <label>Max Capacity<input name="capacity" type="number" min="1" [(ngModel)]="formData.capacity" required /></label>
                <label style="grid-column: 1 / -1;">Start Date<input name="starts" type="datetime-local" [(ngModel)]="formData.starts_on" required /></label>
              } @else if (activeForm === 'enrollment') {
                <label style="grid-column: 1 / -1;">
                  Select Student
                  <select name="student_id" [(ngModel)]="formData.student_id" required>
                    <option [ngValue]="undefined" disabled selected>-- Choose Student --</option>
                    @for (s of students; track s.id) {
                      <option [ngValue]="s.id">{{ s.full_name }} ({{ s.student_code }})</option>
                    }
                  </select>
                </label>
                <label style="grid-column: 1 / -1;">
                  Select Batch
                  <select name="batch_id" [(ngModel)]="formData.batch_id" required>
                    <option [ngValue]="undefined" disabled selected>-- Choose Batch --</option>
                    @for (b of batches; track b.id) {
                      <option [ngValue]="b.id">{{ b.name }} (Cap: {{ b.capacity }})</option>
                    }
                  </select>
                </label>
              } @else if (activeForm === 'teacher') {
                <label>Full Name<input name="name" placeholder="e.g. Dr. Kamrul Hassan" [(ngModel)]="formData.full_name" required /></label>
                <label>Subject Specialization<input name="subject" placeholder="e.g. Physics / Mathematics" [(ngModel)]="formData.subject_specialization" required /></label>
                <label style="grid-column: 1 / -1;">Email Address<input name="email" type="email" placeholder="teacher@coaching.com" [(ngModel)]="formData.email" /></label>
              } @else if (activeForm === 'timetable') {
                <label>
                  Select Batch
                  <select name="batch_id" [(ngModel)]="formData.batch_id" required>
                    <option [ngValue]="undefined" disabled selected>-- Choose Batch --</option>
                    @for (b of batches; track b.id) {
                      <option [ngValue]="b.id">{{ b.name }}</option>
                    }
                  </select>
                </label>
                <label>
                  Assign Teacher
                  <select name="teacher_id" [(ngModel)]="formData.teacher_id" required>
                    <option [ngValue]="undefined" disabled selected>-- Choose Teacher --</option>
                    @for (t of teachers; track t.id) {
                      <option [ngValue]="t.id">{{ t.full_name }} ({{ t.subject_specialization }})</option>
                    }
                  </select>
                </label>
                <label>
                  Weekday
                  <select name="weekday" [(ngModel)]="formData.weekday">
                    <option>Saturday</option>
                    <option>Sunday</option>
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                  </select>
                </label>
                <label>Room / Hall<input name="room" placeholder="e.g. Room 201" [(ngModel)]="formData.room" required /></label>
                <label>Start Time<input name="start" type="time" [(ngModel)]="formData.starts_at" required /></label>
                <label>End Time<input name="end" type="time" [(ngModel)]="formData.ends_at" required /></label>
              } @else if (activeForm === 'payment') {
                <label style="grid-column: 1 / -1;">
                  Select Student
                  <select name="student_id" [(ngModel)]="formData.student_id" required>
                    <option [ngValue]="undefined" disabled selected>-- Choose Student to Pay --</option>
                    @for (s of students; track s.id) {
                      <option [ngValue]="s.id">{{ s.full_name }} ({{ s.student_code }}) · Due: ৳{{ getStudentDue(s.id) }}</option>
                    }
                  </select>
                </label>
                <label>Payment Amount (BDT)<input name="amount" type="number" min="1" step="1" [(ngModel)]="formData.amount" required /></label>
                <label>
                  Payment Method
                  <select name="method" [(ngModel)]="formData.payment_method">
                    <option>bKash</option>
                    <option>Cash</option>
                    <option>Nagad</option>
                    <option>Rocket</option>
                    <option>Bank Transfer</option>
                  </select>
                </label>
                <label style="grid-column: 1 / -1;">
                  Receipt / Transaction Ref
                  <input name="reference" placeholder="e.g. TRX-8899 or Money Receipt #102" [(ngModel)]="formData.transaction_reference" />
                </label>
              } @else if (activeForm === 'fee') {
                <label style="grid-column: 1 / -1;">
                  Select Student
                  <select name="student_id" [(ngModel)]="formData.student_id" required>
                    <option [ngValue]="undefined" disabled selected>-- Choose Student --</option>
                    @for (s of students; track s.id) {
                      <option [ngValue]="s.id">{{ s.full_name }} ({{ s.student_code }})</option>
                    }
                  </select>
                </label>
                <label style="grid-column: 1 / -1;">
                  Fee Description
                  <input name="description" placeholder="e.g. Monthly Tuition Fee - October" [(ngModel)]="formData.description" required />
                </label>
                <label>Amount Due (BDT)<input name="amount" type="number" min="1" step="1" [(ngModel)]="formData.amount_due" required /></label>
                <label>Due Date<input name="due" type="datetime-local" [(ngModel)]="formData.due_on" required /></label>
              } @else if (activeForm === 'attendance') {
                <label style="grid-column: 1 / -1;">
                  Select Enrollment
                  <select name="enrollment_id" [(ngModel)]="formData.enrollment_id" required>
                    <option [ngValue]="undefined" disabled selected>-- Choose Enrolled Student --</option>
                    @for (en of enrollments; track en.id) {
                      <option [ngValue]="en.id">{{ getStudentName(en.student_id) }} · {{ getBatchName(en.batch_id) }}</option>
                    }
                  </select>
                </label>
                <label>Attendance Date<input name="date" type="datetime-local" [(ngModel)]="formData.attended_on" required /></label>
                <label>
                  Status
                  <select name="status" [(ngModel)]="formData.status">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </label>
              } @else if (activeForm === 'mark') {
                <label>
                  Select Student
                  <select name="student_id" [(ngModel)]="formData.student_id" required>
                    <option [ngValue]="undefined" disabled selected>-- Choose Student --</option>
                    @for (s of students; track s.id) {
                      <option [ngValue]="s.id">{{ s.full_name }} ({{ s.student_code }})</option>
                    }
                  </select>
                </label>
                <label>
                  Select Batch
                  <select name="batch_id" [(ngModel)]="formData.batch_id" required>
                    <option [ngValue]="undefined" disabled selected>-- Choose Batch --</option>
                    @for (b of batches; track b.id) {
                      <option [ngValue]="b.id">{{ b.name }}</option>
                    }
                  </select>
                </label>
                <label style="grid-column: 1 / -1;">
                  Exam / Assessment Name
                  <input name="assessment" placeholder="e.g. Monthly Model Test - Paper 1" [(ngModel)]="formData.assessment_name" required />
                </label>
                <label>Max Marks<input name="max" type="number" min="1" [(ngModel)]="formData.max_marks" required /></label>
                <label>Obtained Marks<input name="obtained" type="number" min="0" [(ngModel)]="formData.obtained_marks" required /></label>
              } @else if (activeForm === 'branch') {
                <label>Branch Code<input name="code" placeholder="e.g. MIRPUR" [(ngModel)]="formData.code" required /></label>
                <label>Branch Name<input name="name" placeholder="e.g. Mirpur 10 Campus" [(ngModel)]="formData.name" required /></label>
              }

              @if (formError) {
                <p class="error" style="grid-column: 1 / -1;">{{ formError }}</p>
              }

              <div class="modal-actions">
                <button type="button" class="button secondary" (click)="closeForm()">Cancel</button>
                <button class="button" type="submit" [disabled]="saving">
                  {{ saving ? 'Saving...' : 'Save Record' }}
                </button>
              </div>
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
  enrollments: Enrollment[] = [];
  payments: Payment[] = [];
  attendance: AttendanceRecord[] = [];

  selectedBranchId = 0;
  showStudentForm = false;
  showOnlyDue = false;
  loading = true;
  saving = false;
  error = '';
  searchTerm = '';
  newStudent = { student_code: '', full_name: '', email: '', phone: '' };
  menuOpen = false;

  activeForm: 'course' | 'teacher' | 'batch' | 'timetable' | 'attendance' | 'mark' | 'fee' | 'payment' | 'enrollment' | 'branch' | null = null;
  formData: Record<string, any> = {};
  formError = '';

  get formTitle(): string {
    const titles: Record<string, string> = {
      course: 'Add New Course Program',
      teacher: 'Register Faculty Teacher',
      batch: 'Create Academic Batch',
      timetable: 'Schedule Class Slot',
      attendance: 'Record Student Attendance',
      mark: 'Record Exam Marks',
      fee: 'Issue Fee Charge',
      payment: 'Record Fee Payment Receipt',
      enrollment: 'Enroll Student in Batch',
      branch: 'Add New Coaching Branch',
    };
    return titles[this.activeForm || ''] || 'Add Record';
  }

  get selectedBranch(): Branch | undefined {
    return this.branches.find(b => b.id === this.selectedBranchId);
  }

  get totalCollected(): number {
    return this.feeBalances.reduce((sum, b) => sum + (Number(b.total_paid) || 0), 0);
  }

  get totalOutstanding(): number {
    return this.feeBalances.reduce((sum, b) => sum + (Number(b.outstanding) || 0), 0);
  }

  get totalDue(): number {
    return this.feeBalances.reduce((sum, b) => sum + (Number(b.total_due) || 0), 0);
  }

  get collectionRate(): number {
    const due = this.totalDue;
    if (due <= 0) return 100;
    return Math.min(100, Math.round((this.totalCollected / due) * 100));
  }

  get studentsWithDues(): number {
    return this.feeBalances.filter(b => b.outstanding > 0).length;
  }

  get filteredStudents(): Student[] {
    const query = this.searchTerm.trim().toLowerCase();
    let result = this.students;

    if (this.showOnlyDue) {
      const dueStudentIds = new Set(this.feeBalances.filter(b => b.outstanding > 0).map(b => b.student_id));
      result = result.filter(s => dueStudentIds.has(s.id));
    }

    if (query) {
      result = result.filter(s =>
        `${s.full_name} ${s.student_code} ${s.phone || ''} ${s.email || ''}`.toLowerCase().includes(query)
      );
    }
    return result;
  }

  get firstName(): string {
    return this.user?.full_name.split(' ')[0] || 'Owner';
  }

  get initials(): string {
    return this.user?.full_name.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase() || 'OW';
  }

  constructor() {
    this.auth.me().subscribe({ next: user => this.user = user, error: () => this.logout() });
    if (isBrowserDemo) {
      this.branches = this.demo.branches();
      this.selectedBranchId = this.branches[0]?.id ?? 0;
      this.loadBranch();
      return;
    }
    this.http.get<Branch[]>(`${API}/branches`).subscribe({
      next: branches => {
        this.branches = branches;
        this.selectedBranchId = branches[0]?.id ?? 0;
        this.loadBranch();
      },
      error: () => {
        this.error = 'Unable to load branches. Check that the backend is running.';
        this.loading = false;
      },
    });
  }

  loadBranch(): void {
    if (!this.selectedBranchId) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.error = '';

    if (isBrowserDemo) {
      Object.assign(this, this.demo.snapshot(this.selectedBranchId));
      this.loading = false;
      return;
    }

    const prefix = `${API}/branches/${this.selectedBranchId}`;
    forkJoin({
      students: this.http.get<Student[]>(`${prefix}/students`),
      courses: this.http.get<Course[]>(`${prefix}/courses`),
      batches: this.http.get<Batch[]>(`${prefix}/batches`),
      teachers: this.http.get<Teacher[]>(`${prefix}/teachers`),
      timetable: this.http.get<TimetableEntry[]>(`${prefix}/timetable`),
      marks: this.http.get<Mark[]>(`${prefix}/marks`),
      feeBalances: this.http.get<FeeBalance[]>(`${prefix}/fee-balances`),
      enrollments: this.http.get<Enrollment[]>(`${prefix}/enrollments`),
      payments: this.http.get<Payment[]>(`${prefix}/payments`),
      attendance: this.http.get<AttendanceRecord[]>(`${prefix}/attendance`),
    }).subscribe({
      next: result => {
        Object.assign(this, result);
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load branch data.';
        this.loading = false;
      },
    });
  }

  getStudentName(studentId: number): string {
    const s = this.students.find(x => x.id === studentId);
    return s ? `${s.full_name} (${s.student_code})` : `Student #${studentId}`;
  }

  getBatchName(batchId: number): string {
    const b = this.batches.find(x => x.id === batchId);
    return b ? b.name : `Batch #${batchId}`;
  }

  getTeacherName(teacherId: number): string {
    const t = this.teachers.find(x => x.id === teacherId);
    return t ? t.full_name : `Teacher #${teacherId}`;
  }

  getCourseName(courseId: number): string {
    const c = this.courses.find(x => x.id === courseId);
    return c ? `${c.name} (${c.code})` : `Course #${courseId}`;
  }

  getStudentDue(studentId: number): number {
    const b = this.feeBalances.find(x => x.student_id === studentId);
    return b ? b.outstanding : 0;
  }

  addStudent(): void {
    this.saving = true;
    this.error = '';
    if (isBrowserDemo) {
      this.demo.create('students', this.selectedBranchId, this.newStudent);
      this.newStudent = { student_code: '', full_name: '', email: '', phone: '' };
      this.showStudentForm = false;
      this.saving = false;
      this.loadBranch();
      return;
    }
    this.http.post<Student>(`${API}/branches/${this.selectedBranchId}/students`, this.newStudent).subscribe({
      next: () => {
        this.newStudent = { student_code: '', full_name: '', email: '', phone: '' };
        this.showStudentForm = false;
        this.saving = false;
        this.loadBranch();
      },
      error: (response: { error?: { detail?: string } }) => {
        this.error = response.error?.detail ?? 'Unable to save student.';
        this.saving = false;
      },
    });
  }

  openForm(type: NonNullable<DashboardComponent['activeForm']>): void {
    this.activeForm = type;
    this.formError = '';
    const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    if (type === 'batch') {
      this.formData = { capacity: 30, course_id: this.courses[0]?.id, starts_on: nowLocal };
    } else if (type === 'enrollment') {
      this.formData = { student_id: this.students[0]?.id, batch_id: this.batches[0]?.id };
    } else if (type === 'timetable') {
      this.formData = {
        batch_id: this.batches[0]?.id,
        teacher_id: this.teachers[0]?.id,
        weekday: 'Saturday',
        starts_at: '09:00',
        ends_at: '10:30',
        room: 'Room 101',
      };
    } else if (type === 'payment') {
      this.formData = {
        student_id: this.students[0]?.id,
        amount: this.getStudentDue(this.students[0]?.id) || 1000,
        payment_method: 'bKash',
        transaction_reference: '',
      };
    } else if (type === 'fee') {
      this.formData = {
        student_id: this.students[0]?.id,
        description: 'Monthly Tuition Fee',
        amount_due: 3500,
        due_on: nowLocal,
      };
    } else if (type === 'attendance') {
      this.formData = {
        enrollment_id: this.enrollments[0]?.id,
        status: 'present',
        attended_on: nowLocal,
      };
    } else if (type === 'mark') {
      this.formData = {
        student_id: this.students[0]?.id,
        batch_id: this.batches[0]?.id,
        assessment_name: 'Monthly Model Test',
        max_marks: 100,
        obtained_marks: 85,
      };
    } else if (type === 'branch') {
      this.formData = { code: '', name: '' };
    } else {
      this.formData = {};
    }
  }

  closeForm(): void {
    if (!this.saving) this.activeForm = null;
  }

  submitForm(): void {
    if (!this.activeForm) return;
    this.saving = true;
    this.formError = '';

    const endpoints: Record<string, string> = {
      course: 'courses',
      teacher: 'teachers',
      batch: 'batches',
      timetable: 'timetable',
      attendance: 'attendance',
      mark: 'marks',
      fee: 'fee-charges',
      payment: 'payments',
      enrollment: 'enrollments',
    };

    const payload = { ...this.formData };
    if (typeof payload['starts_on'] === 'string') payload['starts_on'] = new Date(payload['starts_on']).toISOString();
    if (typeof payload['attended_on'] === 'string') payload['attended_on'] = new Date(payload['attended_on']).toISOString();
    if (typeof payload['due_on'] === 'string') payload['due_on'] = new Date(payload['due_on']).toISOString();

    if (this.activeForm === 'branch') {
      if (isBrowserDemo) {
        this.demo.create('branches', this.selectedBranchId, payload);
        this.branches = this.demo.branches();
        this.selectedBranchId = this.branches[this.branches.length - 1]?.id || this.selectedBranchId;
        this.saving = false;
        this.activeForm = null;
        this.loadBranch();
        return;
      }
      this.http.post<Branch>(`${API}/branches`, payload).subscribe({
        next: branch => {
          this.branches.push(branch);
          this.selectedBranchId = branch.id;
          this.saving = false;
          this.activeForm = null;
          this.loadBranch();
        },
        error: response => {
          this.saving = false;
          this.formError = response.error?.detail ?? 'The branch could not be created.';
        },
      });
      return;
    }

    const endpointName = endpoints[this.activeForm];
    if (isBrowserDemo) {
      this.demo.create(endpointName, this.selectedBranchId, payload);
      this.saving = false;
      this.activeForm = null;
      this.loadBranch();
      return;
    }

    this.http.post(`${API}/branches/${this.selectedBranchId}/${endpointName}`, payload).subscribe({
      next: () => {
        this.saving = false;
        this.activeForm = null;
        this.loadBranch();
      },
      error: response => {
        this.saving = false;
        this.formError = response.error?.detail ?? 'The record could not be created.';
      },
    });
  }

  remove(resource: string, id: number, label: string): void {
    if (!window.confirm(`Remove "${label}"? This action cannot be undone.`)) return;
    if (isBrowserDemo) {
      this.demo.remove(resource, id);
      this.loadBranch();
      return;
    }
    this.http.delete(`${API}/branches/${this.selectedBranchId}/${resource}/${id}`).subscribe({
      next: () => this.loadBranch(),
      error: response => {
        this.error = response.error?.detail ?? 'The operation could not be completed.';
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
