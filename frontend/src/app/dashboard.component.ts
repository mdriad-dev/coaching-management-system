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

type DashboardTab = 'overview' | 'students' | 'finances' | 'academics' | 'faculty' | 'exams';

@Component({
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, UpperCasePipe],
  template: `
    <div class="app-shell" [class.theme-dark]="isDarkMode" [class.theme-light]="!isDarkMode">
      @if (isDarkMode) {
        <div class="cyber-glow-bg" aria-hidden="true"></div>
      }
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
          <button class="nav-item" [class.active]="activeTab === 'overview'" (click)="selectTab('overview')">
            ▦ <span>Executive Overview</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'students'" (click)="selectTab('students')">
            ♙ <span>Students Directory</span>
            <span class="nav-count">{{ students.length }}</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'finances'" (click)="selectTab('finances')">
            ৳ <span>Fees & Collections</span>
            @if (totalOutstanding > 0) {
              <span class="nav-count badge-due">৳{{ totalOutstanding | number:'1.0-0' }}</span>
            }
          </button>
          <button class="nav-item" [class.active]="activeTab === 'academics'" (click)="selectTab('academics')">
            ▤ <span>Courses & Batches</span>
            <span class="nav-count">{{ batches.length }}</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'faculty'" (click)="selectTab('faculty')">
            ♙ <span>Faculty & Schedule</span>
            <span class="nav-count">{{ teachers.length }}</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'exams'" (click)="selectTab('exams')">
            ✓ <span>Exams & Attendance</span>
          </button>
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
            <!-- Light / Dark Theme Switcher -->
            <button class="theme-toggle-btn" (click)="toggleTheme()" [title]="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
              {{ isDarkMode ? '☀️ Light' : '🌙 Dark' }}
            </button>
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
              <h1>Operations & Multi-Function Center</h1>
              <p class="hero-copy">Dedicated functional dashboards for admissions, financial cashflow, faculty routine, and academic performance.</p>
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

          <!-- Function Dashboard Selector Tabs Bar -->
          <nav class="function-tabs-bar" aria-label="Dashboard functions">
            <button class="function-tab" [class.active]="activeTab === 'overview'" (click)="selectTab('overview')">
              ▦ Overview
            </button>
            <button class="function-tab" [class.active]="activeTab === 'students'" (click)="selectTab('students')">
              ♙ Students ({{ students.length }})
            </button>
            <button class="function-tab" [class.active]="activeTab === 'finances'" (click)="selectTab('finances')">
              ৳ Fees & Collections
            </button>
            <button class="function-tab" [class.active]="activeTab === 'academics'" (click)="selectTab('academics')">
              ▤ Courses & Batches ({{ batches.length }})
            </button>
            <button class="function-tab" [class.active]="activeTab === 'faculty'" (click)="selectTab('faculty')">
              ♙ Faculty & Routine ({{ teachers.length }})
            </button>
            <button class="function-tab" [class.active]="activeTab === 'exams'" (click)="selectTab('exams')">
              ✓ Exams & Attendance
            </button>
          </nav>

          @if (error) {
            <div class="error" role="alert"><strong>Notice:</strong> {{ error }}</div>
          }
          @if (loading) {
            <div class="loading-bar" aria-label="Loading"></div>
          }

          <!-- ========================================== -->
          <!-- 1. EXECUTIVE OVERVIEW DASHBOARD -->
          <!-- ========================================== -->
          @if (activeTab === 'overview') {
            <!-- Owner Quick Action Toolbar -->
            <div class="quick-toolbar">
              <button class="button action-admit" (click)="openForm('student')">+ New Admission</button>
              <button class="button action-pay" (click)="openForm('payment')">৳ Collect Payment</button>
              <button class="button secondary" (click)="openForm('enrollment')">+ Enroll in Batch</button>
              <button class="button secondary" (click)="openForm('fee')">+ Charge Fee</button>
              <button class="button secondary" (click)="openForm('attendance')">+ Mark Attendance</button>
              <button class="button secondary" (click)="openForm('batch')">+ New Batch</button>
              <button class="button secondary" (click)="openForm('timetable')">+ Schedule Class</button>
            </div>

            <!-- Executive Statistics Grid -->
            <section class="stats-grid" aria-label="Coaching statistics">
              <article class="stat-card blue" (click)="selectTab('students')" style="cursor: pointer;" title="View Students Directory">
                <div class="stat-icon">♙</div>
                <div class="stat-content">
                  <span>Total Enrolled</span>
                  <strong>{{ students.length }}</strong>
                  <small>{{ enrollments.length }} batch enrollments · View all →</small>
                </div>
              </article>

              <article class="stat-card green" (click)="selectTab('finances')" style="cursor: pointer;" title="View Financial Ledger">
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

              <article class="stat-card amber" (click)="selectTab('finances')" style="cursor: pointer;" title="View Dues Ledger">
                <div class="stat-icon">!</div>
                <div class="stat-content">
                  <span>Outstanding Dues</span>
                  <strong style="color: #f87171;">৳{{ totalOutstanding | number:'1.0-0' }}</strong>
                  <small>{{ studentsWithDues }} students with dues · View all →</small>
                </div>
              </article>

              <article class="stat-card violet" (click)="selectTab('academics')" style="cursor: pointer;" title="View Courses & Batches">
                <div class="stat-icon">▦</div>
                <div class="stat-content">
                  <span>Active Batches</span>
                  <strong>{{ batches.length }}</strong>
                  <small>{{ courses.length }} courses · {{ teachers.length }} faculty</small>
                </div>
              </article>
            </section>

            <!-- Overview 2-Column Split -->
            <section class="content-grid">
              <!-- Left: Recent Admissions Preview -->
              <article class="panel">
                <div class="panel-heading">
                  <div>
                    <p class="eyebrow">ADMISSIONS PREVIEW</p>
                    <h2>Recent Students ({{ students.length }})</h2>
                  </div>
                  <div class="panel-actions">
                    <button class="button small-button action-admit" (click)="openForm('student')">+ Admit</button>
                    <button class="button secondary small-button" (click)="selectTab('students')">View All →</button>
                  </div>
                </div>

                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Code</th>
                        <th>Fee Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (s of students.slice(0, 6); track s.id) {
                        <tr>
                          <td>
                            <div class="student-cell">
                              <span class="student-avatar">{{ s.full_name.charAt(0).toUpperCase() }}</span>
                              <div>
                                <strong>{{ s.full_name }}</strong>
                                @if (s.phone) { <div style="font-size: 10px; color: #8b98ab;">{{ s.phone }}</div> }
                              </div>
                            </div>
                          </td>
                          <td class="code">{{ s.student_code }}</td>
                          <td>
                            @if (getStudentDue(s.id) > 0) {
                              <span class="status status-due">৳{{ getStudentDue(s.id) | number:'1.0-0' }} Due</span>
                            } @else {
                              <span class="status active">Paid in Full</span>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </article>

              <!-- Right: Recent Collections & Batches Preview -->
              <div style="display: grid; gap: 20px;">
                <article class="panel">
                  <div class="panel-heading">
                    <div>
                      <p class="eyebrow">CASHFLOW PREVIEW</p>
                      <h2>Recent Payments</h2>
                    </div>
                    <button class="button secondary small-button" (click)="selectTab('finances')">Full Ledger →</button>
                  </div>
                  @for (p of payments.slice(0, 4); track p.id) {
                    <div class="list-item">
                      <span class="list-icon green-bg">৳</span>
                      <div>
                        <strong>{{ getStudentName(p.student_id) }}</strong>
                        <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                          <span class="pay-method-badge" [class]="p.payment_method.toLowerCase()">{{ p.payment_method }}</span>
                          <span style="font-size: 11px; color: #8b98ab;">{{ p.paid_at | date:'mediumDate' }}</span>
                        </div>
                      </div>
                      <b class="pay-amount">+৳{{ p.amount | number:'1.0-0' }}</b>
                    </div>
                  }
                </article>

                <article class="panel">
                  <div class="panel-heading">
                    <div>
                      <p class="eyebrow">ACTIVE BATCHES</p>
                      <h2>Campus Batches ({{ batches.length }})</h2>
                    </div>
                    <button class="button secondary small-button" (click)="selectTab('academics')">All Batches →</button>
                  </div>
                  @for (b of batches.slice(0, 3); track b.id) {
                    <div class="list-item">
                      <span class="list-icon violet-bg">▦</span>
                      <div>
                        <strong>{{ b.name }}</strong>
                        <span>{{ getCourseName(b.course_id) }} · Capacity: {{ b.capacity }}</span>
                      </div>
                    </div>
                  }
                </article>
              </div>
            </section>
          }

          <!-- ========================================== -->
          <!-- 2. STUDENTS & ADMISSIONS DASHBOARD -->
          <!-- ========================================== -->
          @if (activeTab === 'students') {
            <article class="panel">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">STUDENT MANAGEMENT & ADMISSIONS</p>
                  <h2>Students Directory ({{ filteredStudents.length }} of {{ students.length }})</h2>
                </div>
                <div class="panel-actions">
                  <button
                    class="button small-button"
                    [class.secondary]="!showOnlyDue"
                    (click)="showOnlyDue = !showOnlyDue"
                  >
                    {{ showOnlyDue ? 'Showing: Dues Only' : 'Filter: Dues Only (' + studentsWithDues + ')' }}
                  </button>
                  <button class="button small-button action-admit" (click)="showStudentForm = !showStudentForm">
                    {{ showStudentForm ? '✕ Close Form' : '+ New Student Admission' }}
                  </button>
                  <button class="button secondary small-button" (click)="openForm('enrollment')">+ Enroll in Batch</button>
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
                  <button class="button action-admit" type="submit" [disabled]="saving">
                    {{ saving ? 'Saving...' : 'Save Student' }}
                  </button>
                </form>
              }

              <div class="table-toolbar">
                <div class="search-box">
                  ⌕
                  <input
                    aria-label="Search students"
                    placeholder="Search by name, student code, phone or email..."
                    [(ngModel)]="searchTerm"
                  />
                </div>
                <span class="result-count">
                  {{ filteredStudents.length }} students listed
                </span>
              </div>

              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Student Code</th>
                      <th>Guardian Phone</th>
                      <th>Fee Balance</th>
                      <th>Quick Action</th>
                      <th>Remove</th>
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
                            <a [href]="'tel:' + student.phone" class="phone-link">
                              ☎ {{ student.phone }}
                            </a>
                          } @else {
                            <span style="color: #64748b;">—</span>
                          }
                        </td>
                        <td>
                          @if (getStudentDue(student.id) > 0) {
                            <span class="status status-due">
                              ৳{{ getStudentDue(student.id) | number:'1.0-0' }} Due
                            </span>
                          } @else {
                            <span class="status active">Paid in Full</span>
                          }
                        </td>
                        <td>
                          <div style="display: flex; gap: 6px;">
                            @if (getStudentDue(student.id) > 0) {
                              <button class="button small-button action-pay" (click)="openPaymentFor(student.id)">৳ Collect</button>
                            }
                            <button class="button secondary small-button" (click)="openEnrollFor(student.id)">+ Batch</button>
                          </div>
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
            </article>
          }

          <!-- ========================================== -->
          <!-- 3. FINANCE & FEE COLLECTIONS DASHBOARD -->
          <!-- ========================================== -->
          @if (activeTab === 'finances') {
            <!-- Financial KPI Grid -->
            <section class="stats-grid" aria-label="Financial statistics">
              <article class="stat-card green">
                <div class="stat-icon">৳</div>
                <div class="stat-content">
                  <span>Total Collected</span>
                  <strong>৳{{ totalCollected | number:'1.0-0' }}</strong>
                  <div class="meter-bar">
                    <div class="meter-fill" [style.width.%]="collectionRate"></div>
                  </div>
                  <small>{{ collectionRate | number:'1.0-0' }}% collection rate</small>
                </div>
              </article>

              <article class="stat-card amber">
                <div class="stat-icon">!</div>
                <div class="stat-content">
                  <span>Outstanding Dues</span>
                  <strong style="color: #f87171;">৳{{ totalOutstanding | number:'1.0-0' }}</strong>
                  <small>{{ studentsWithDues }} students with dues</small>
                </div>
              </article>

              <article class="stat-card blue">
                <div class="stat-icon">▦</div>
                <div class="stat-content">
                  <span>Total Billed</span>
                  <strong>৳{{ totalDue | number:'1.0-0' }}</strong>
                  <small>Total tuition charges</small>
                </div>
              </article>

              <article class="stat-card violet">
                <div class="stat-icon">♙</div>
                <div class="stat-content">
                  <span>Payment Receipts</span>
                  <strong>{{ payments.length }}</strong>
                  <small>Recorded transactions</small>
                </div>
              </article>
            </section>

            <div class="quick-toolbar">
              <button class="button action-pay" (click)="openForm('payment')">৳ Collect Payment Receipt</button>
              <button class="button secondary" (click)="openForm('fee')">+ Issue New Tuition Charge</button>
            </div>

            <section class="content-grid">
              <!-- Left: Recent Payments Ledger -->
              <article class="panel">
                <div class="panel-heading">
                  <div>
                    <p class="eyebrow">PAYMENT RECEIPTS</p>
                    <h2>Transactions Ledger ({{ payments.length }})</h2>
                  </div>
                  <button class="button small-button action-pay" (click)="openForm('payment')">+ Add Payment</button>
                </div>

                @for (p of payments; track p.id) {
                  <div class="list-item">
                    <span class="list-icon green-bg">৳</span>
                    <div>
                      <strong>{{ getStudentName(p.student_id) }}</strong>
                      <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
                        <span class="pay-method-badge" [class]="p.payment_method.toLowerCase()">{{ p.payment_method }}</span>
                        <span style="font-size: 11px; color: #8b98ab;">
                          @if (p.transaction_reference) { {{ p.transaction_reference }} · } {{ p.paid_at | date:'mediumDate' }}
                        </span>
                      </div>
                    </div>
                    <b class="pay-amount">+৳{{ p.amount | number:'1.0-0' }}</b>
                    <button class="icon-button danger" (click)="remove('payments', p.id, 'Payment of ৳' + p.amount)">×</button>
                  </div>
                } @empty {
                  <div class="empty-small">No payment records yet. Click "+ Add Payment" to log collections.</div>
                }
              </article>

              <!-- Right: Outstanding Fee Balances by Student -->
              <article class="panel">
                <div class="panel-heading">
                  <div>
                    <p class="eyebrow">ACCOUNTS RECEIVABLE</p>
                    <h2>Students With Dues ({{ studentsWithDues }})</h2>
                  </div>
                  <button class="button secondary small-button" (click)="openForm('fee')">+ Charge Fee</button>
                </div>

                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Outstanding Due</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (b of feeBalances; track b.student_id) {
                        @if (b.outstanding > 0) {
                          <tr>
                            <td>
                              <strong>{{ getStudentName(b.student_id) }}</strong>
                              <div style="font-size: 10px; color: #8b98ab;">Paid: ৳{{ b.total_paid | number:'1.0-0' }} / Due: ৳{{ b.total_due | number:'1.0-0' }}</div>
                            </td>
                            <td>
                              <span class="status status-due">৳{{ b.outstanding | number:'1.0-0' }}</span>
                            </td>
                            <td>
                              <button class="button small-button action-pay" (click)="openPaymentFor(b.student_id)">৳ Collect</button>
                            </td>
                          </tr>
                        }
                      }
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          }

          <!-- ========================================== -->
          <!-- 4. COURSES & BATCHES DASHBOARD -->
          <!-- ========================================== -->
          @if (activeTab === 'academics') {
            <div class="quick-toolbar">
              <button class="button" (click)="openForm('batch')">+ Create Academic Batch</button>
              <button class="button action-admit" (click)="openForm('enrollment')">+ Enroll Student in Batch</button>
              <button class="button secondary" (click)="openForm('course')">+ Add New Course</button>
            </div>

            <section class="content-grid">
              <!-- Courses Curriculum Catalog -->
              <article class="panel">
                <div class="panel-heading">
                  <div>
                    <p class="eyebrow">CURRICULUM PROGRAMS</p>
                    <h2>Courses ({{ courses.length }})</h2>
                  </div>
                  <button class="button small-button" (click)="openForm('course')">+ Add Course</button>
                </div>
                @for (c of courses; track c.id) {
                  <div class="list-item">
                    <span class="list-icon violet-bg">▤</span>
                    <div>
                      <strong>{{ c.name }}</strong>
                      <span>{{ c.code }} · Duration: {{ c.duration_months }} months</span>
                    </div>
                    <b>৳{{ c.monthly_fee | number:'1.0-0' }}/mo</b>
                    <button class="icon-button danger" (click)="remove('courses', c.id, c.name)">×</button>
                  </div>
                } @empty {
                  <div class="empty-small">No courses registered.</div>
                }
              </article>

              <!-- Academic Batches -->
              <article class="panel">
                <div class="panel-heading">
                  <div>
                    <p class="eyebrow">BATCHES & CLASSES</p>
                    <h2>Academic Batches ({{ batches.length }})</h2>
                  </div>
                  <div class="panel-actions">
                    <button class="button small-button" (click)="openForm('batch')">+ New Batch</button>
                    <button class="button secondary small-button" (click)="openForm('enrollment')">+ Enroll</button>
                  </div>
                </div>
                @for (b of batches; track b.id) {
                  <div class="list-item">
                    <span class="list-icon green-bg">▦</span>
                    <div>
                      <strong>{{ b.name }}</strong>
                      <span>{{ getCourseName(b.course_id) }} · Max Capacity: {{ b.capacity }} · Starts {{ b.starts_on | date:'mediumDate' }}</span>
                    </div>
                    <button class="icon-button danger" (click)="remove('batches', b.id, b.name)">×</button>
                  </div>
                } @empty {
                  <div class="empty-small">No batches active at this branch.</div>
                }
              </article>
            </section>
          }

          <!-- ========================================== -->
          <!-- 5. FACULTY & SCHEDULE ROUTINE DASHBOARD -->
          <!-- ========================================== -->
          @if (activeTab === 'faculty') {
            <div class="quick-toolbar">
              <button class="button" (click)="openForm('teacher')">+ Register Faculty Teacher</button>
              <button class="button action-pay" (click)="openForm('timetable')">+ Schedule Class Slot</button>
            </div>

            <section class="content-grid">
              <!-- Faculty Teachers Directory -->
              <article class="panel">
                <div class="panel-heading">
                  <div>
                    <p class="eyebrow">INSTRUCTORS & MENTORS</p>
                    <h2>Faculty Teachers ({{ teachers.length }})</h2>
                  </div>
                  <button class="button small-button" (click)="openForm('teacher')">+ Add Teacher</button>
                </div>
                @for (t of teachers; track t.id) {
                  <div class="list-item">
                    <span class="list-icon blue-bg">♙</span>
                    <div>
                      <strong>{{ t.full_name }}</strong>
                      <span>{{ t.subject_specialization }} · {{ t.email || 'No email' }}</span>
                    </div>
                    <button class="icon-button danger" (click)="remove('teachers', t.id, t.full_name)">×</button>
                  </div>
                } @empty {
                  <div class="empty-small">No teachers registered yet.</div>
                }
              </article>

              <!-- Weekly Timetable Routine -->
              <article class="panel">
                <div class="panel-heading">
                  <div>
                    <p class="eyebrow">CLASS SCHEDULE</p>
                    <h2>Weekly Routine Timetable ({{ timetable.length }})</h2>
                  </div>
                  <button class="button small-button" (click)="openForm('timetable')">+ Schedule Slot</button>
                </div>
                @for (entry of timetable; track entry.id) {
                  <div class="list-item">
                    <span class="list-icon green-bg">◷</span>
                    <div>
                      <strong>{{ entry.weekday }} · {{ entry.starts_at }}–{{ entry.ends_at }}</strong>
                      <span>{{ entry.room }} · Batch: {{ getBatchName(entry.batch_id) }} · Instructor: {{ getTeacherName(entry.teacher_id) }}</span>
                    </div>
                    <button class="icon-button danger" (click)="remove('timetable', entry.id, entry.room)">×</button>
                  </div>
                } @empty {
                  <div class="empty-small">No classes scheduled on the weekly routine.</div>
                }
              </article>
            </section>
          }

          <!-- ========================================== -->
          <!-- 6. EXAMS & ATTENDANCE DASHBOARD -->
          <!-- ========================================== -->
          @if (activeTab === 'exams') {
            <div class="quick-toolbar">
              <button class="button action-admit" (click)="openForm('mark')">+ Record Exam Marks</button>
              <button class="button action-pay" (click)="openForm('attendance')">+ Mark Student Attendance</button>
            </div>

            <section class="content-grid">
              <!-- Exam Results & Marks Book -->
              <article class="panel">
                <div class="panel-heading">
                  <div>
                    <p class="eyebrow">ACADEMIC PERFORMANCE</p>
                    <h2>Exam & Model Test Results ({{ marks.length }})</h2>
                  </div>
                  <button class="button small-button action-admit" (click)="openForm('mark')">+ Record Marks</button>
                </div>
                @for (m of marks; track m.id) {
                  <div class="list-item">
                    <span class="list-icon violet-bg">✓</span>
                    <div>
                      <strong>{{ m.assessment_name }} · {{ getStudentName(m.student_id) }}</strong>
                      <span>Batch: {{ getBatchName(m.batch_id) }}</span>
                    </div>
                    <b style="color: #38bdf8;">{{ m.obtained_marks }} / {{ m.max_marks }}</b>
                    <button class="icon-button danger" (click)="remove('marks', m.id, m.assessment_name)">×</button>
                  </div>
                } @empty {
                  <div class="empty-small">No exam marks recorded yet.</div>
                }
              </article>

              <!-- Attendance Log -->
              <article class="panel">
                <div class="panel-heading">
                  <div>
                    <p class="eyebrow">ATTENDANCE TRACKING</p>
                    <h2>Daily Attendance Logs ({{ attendance.length }})</h2>
                  </div>
                  <button class="button small-button action-pay" (click)="openForm('attendance')">+ Mark Attendance</button>
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
                      [class.status-due]="att.status === 'absent'"
                      [class.status-late]="att.status === 'late'"
                    >
                      {{ att.status | uppercase }}
                    </span>
                    <button class="icon-button danger" (click)="remove('attendance', att.id, 'Attendance record')">×</button>
                  </div>
                } @empty {
                  <div class="empty-small">No attendance logs found.</div>
                }
              </article>
            </section>
          }
        </main>
      </div>

      <!-- Owner Interactive Modal Forms -->
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
              @if (activeForm === 'student') {
                <label>Student Code<input name="code" placeholder="e.g. STU-021" [(ngModel)]="formData.student_code" required /></label>
                <label>Full Name<input name="name" placeholder="Student name" [(ngModel)]="formData.full_name" required /></label>
                <label>Guardian Phone<input name="phone" placeholder="+8801700..." [(ngModel)]="formData.phone" /></label>
                <label>Email Address<input name="email" type="email" placeholder="student@example.com" [(ngModel)]="formData.email" /></label>
              } @else if (activeForm === 'course') {
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
                <label>Subject Specialization<input name="subject" placeholder="e.g. Higher Math (BUET)" [(ngModel)]="formData.subject_specialization" required /></label>
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

  activeTab: DashboardTab = 'overview';
  isDarkMode = true;

  selectedBranchId = 0;
  showStudentForm = false;
  showOnlyDue = false;
  loading = true;
  saving = false;
  error = '';
  searchTerm = '';
  newStudent = { student_code: '', full_name: '', email: '', phone: '' };
  menuOpen = false;

  activeForm: 'student' | 'course' | 'teacher' | 'batch' | 'timetable' | 'attendance' | 'mark' | 'fee' | 'payment' | 'enrollment' | 'branch' | null = null;
  formData: Record<string, any> = {};
  formError = '';

  selectTab(tab: DashboardTab): void {
    this.activeTab = tab;
    this.menuOpen = false;
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // fallback
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('cms_theme', this.isDarkMode ? 'dark' : 'light');
  }

  get formTitle(): string {
    const titles: Record<string, string> = {
      student: 'Admit New Student',
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
    const savedTheme = localStorage.getItem('cms_theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    }

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
      next: data => {
        Object.assign(this, data);
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to refresh branch records.';
        this.loading = false;
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  getStudentDue(studentId: number): number {
    return this.feeBalances.find(b => b.student_id === studentId)?.outstanding ?? 0;
  }

  getStudentName(studentId: number): string {
    return this.students.find(s => s.id === studentId)?.full_name ?? `Student #${studentId}`;
  }

  getCourseName(courseId: number): string {
    return this.courses.find(c => c.id === courseId)?.name ?? `Course #${courseId}`;
  }

  getBatchName(batchId: number): string {
    return this.batches.find(b => b.id === batchId)?.name ?? `Batch #${batchId}`;
  }

  getTeacherName(teacherId: number): string {
    return this.teachers.find(t => t.id === teacherId)?.full_name ?? `Teacher #${teacherId}`;
  }

  addStudent(): void {
    if (!this.selectedBranchId || !this.newStudent.full_name || !this.newStudent.student_code) return;
    this.saving = true;

    if (isBrowserDemo) {
      this.demo.create('students', this.selectedBranchId, this.newStudent as any);
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
      error: (res: any) => {
        this.error = res.error?.detail ?? 'Unable to admit student.';
        this.saving = false;
      },
    });
  }

  openPaymentFor(studentId: number): void {
    this.openForm('payment');
    this.formData['student_id'] = studentId;
    const due = this.getStudentDue(studentId);
    if (due > 0) this.formData['amount'] = due;
  }

  openEnrollFor(studentId: number): void {
    this.openForm('enrollment');
    this.formData['student_id'] = studentId;
  }

  openForm(type: 'student' | 'course' | 'teacher' | 'batch' | 'timetable' | 'attendance' | 'mark' | 'fee' | 'payment' | 'enrollment' | 'branch'): void {
    this.activeForm = type;
    this.formError = '';
    const nowIso = new Date().toISOString().slice(0, 16);

    const defaults: Record<string, Record<string, any>> = {
      student: { student_code: '', full_name: '', email: '', phone: '' },
      course: { name: '', code: '', duration_months: 6, monthly_fee: 3000 },
      batch: { course_id: this.courses[0]?.id, name: '', capacity: 30, starts_on: nowIso },
      teacher: { full_name: '', email: '', subject_specialization: '' },
      timetable: { batch_id: this.batches[0]?.id, teacher_id: this.teachers[0]?.id, weekday: 'Saturday', room: 'Room 101', starts_at: '09:00', ends_at: '10:30' },
      payment: { student_id: this.students[0]?.id, amount: 3000, payment_method: 'bKash', transaction_reference: '' },
      fee: { student_id: this.students[0]?.id, description: 'Monthly Tuition Fee', amount_due: 3000, due_on: nowIso },
      enrollment: { student_id: this.students[0]?.id, batch_id: this.batches[0]?.id },
      attendance: { enrollment_id: this.enrollments[0]?.id, attended_on: nowIso, status: 'present' },
      mark: { student_id: this.students[0]?.id, batch_id: this.batches[0]?.id, assessment_name: 'Monthly Model Test', max_marks: 100, obtained_marks: 85 },
      branch: { code: '', name: '' },
    };
    this.formData = { ...defaults[type] };
  }

  closeForm(): void {
    this.activeForm = null;
    this.formData = {};
    this.formError = '';
  }

  submitForm(): void {
    if (!this.activeForm || !this.selectedBranchId) return;
    this.saving = true;
    this.formError = '';

    if (isBrowserDemo) {
      const resourceMap: Record<string, string> = {
        student: 'students',
        course: 'courses',
        batch: 'batches',
        teacher: 'teachers',
        timetable: 'timetable',
        payment: 'payments',
        fee: 'fee-charges',
        enrollment: 'enrollments',
        attendance: 'attendance',
        mark: 'marks',
        branch: 'branches',
      };
      const resource = resourceMap[this.activeForm] || `${this.activeForm}s`;
      this.demo.create(resource, this.selectedBranchId, this.formData);
      this.saving = false;
      this.closeForm();
      this.loadBranch();
      return;
    }

    const branchPrefix = `${API}/branches/${this.selectedBranchId}`;
    let req;

    switch (this.activeForm) {
      case 'student':
        req = this.http.post(`${branchPrefix}/students`, this.formData);
        break;
      case 'course':
        req = this.http.post(`${branchPrefix}/courses`, this.formData);
        break;
      case 'batch':
        req = this.http.post(`${branchPrefix}/batches`, this.formData);
        break;
      case 'teacher':
        req = this.http.post(`${branchPrefix}/teachers`, this.formData);
        break;
      case 'timetable':
        req = this.http.post(`${branchPrefix}/timetable`, this.formData);
        break;
      case 'payment':
        req = this.http.post(`${API}/payments`, this.formData);
        break;
      case 'fee':
        req = this.http.post(`${branchPrefix}/fees`, this.formData);
        break;
      case 'enrollment':
        req = this.http.post(`${branchPrefix}/enrollments`, this.formData);
        break;
      case 'attendance':
        req = this.http.post(`${branchPrefix}/attendance`, this.formData);
        break;
      case 'mark':
        req = this.http.post(`${branchPrefix}/marks`, this.formData);
        break;
      case 'branch':
        req = this.http.post<Branch>(`${API}/branches`, this.formData);
        break;
    }

    if (!req) return;

    req.subscribe({
      next: (res: any) => {
        if (this.activeForm === 'branch' && res?.id) {
          this.branches.push(res);
          this.selectedBranchId = res.id;
        }
        this.saving = false;
        this.closeForm();
        this.loadBranch();
      },
      error: (res: any) => {
        this.formError = res.error?.detail ?? 'Unable to save record.';
        this.saving = false;
      },
    });
  }

  remove(type: 'students' | 'courses' | 'batches' | 'teachers' | 'timetable' | 'marks' | 'payments' | 'attendance', id: number, label: string): void {
    if (!confirm(`Are you sure you want to remove ${label}?`)) return;

    if (isBrowserDemo) {
      this.demo.remove(type, id);
      this.loadBranch();
      return;
    }

    let url = `${API}/branches/${this.selectedBranchId}/${type}/${id}`;
    if (type === 'payments') url = `${API}/payments/${id}`;

    this.http.delete(url).subscribe({
      next: () => this.loadBranch(),
      error: () => alert(`Unable to delete ${label}.`),
    });
  }
}
