import { Injectable } from '@angular/core';
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

type DemoState = {
  user: User;
  branches: Branch[];
  students: Student[];
  courses: Course[];
  batches: Batch[];
  teachers: Teacher[];
  timetable: TimetableEntry[];
  marks: Mark[];
  feeBalances: FeeBalance[];
  enrollments: Enrollment[];
  payments: Payment[];
  attendance: AttendanceRecord[];
};

@Injectable({ providedIn: 'root' })
export class DemoService {
  // Versioned key to guarantee the fresh 20-record dataset loads in the user's browser
  private readonly key = 'cms_browser_demo_v2';

  private readonly seed: DemoState = {
    user: {
      id: 1,
      email: 'demo@coachingcms.app',
      full_name: 'Md. Riad (Coaching Owner)',
      role: 'super_administrator',
    },
    branches: [
      { id: 1, organization_id: 1, code: 'DHANMONDI', name: 'Main Campus (Dhanmondi)', is_active: true },
      { id: 2, organization_id: 1, code: 'UTTARA', name: 'Sector 7 Campus (Uttara)', is_active: true },
      { id: 3, organization_id: 1, code: 'MIRPUR', name: 'Mirpur 10 Branch', is_active: true },
    ],
    students: [
      { id: 1, branch_id: 1, student_code: 'STU-001', full_name: 'Rahim Ahmed', email: 'rahim.ahmed@gmail.com', phone: '+8801711223344', is_active: true },
      { id: 2, branch_id: 1, student_code: 'STU-002', full_name: 'Sadia Karim', email: 'sadia.karim@yahoo.com', phone: '+8801819876543', is_active: true },
      { id: 3, branch_id: 1, student_code: 'STU-003', full_name: 'Tanvir Hossain', email: 'tanvir.hossain@gmail.com', phone: '+8801912345678', is_active: true },
      { id: 4, branch_id: 1, student_code: 'STU-004', full_name: 'Nusrat Fariha', email: 'nusrat.fariha@outlook.com', phone: '+8801623456789', is_active: true },
      { id: 5, branch_id: 1, student_code: 'STU-005', full_name: 'Ayman Sadiq', email: 'ayman.sadiq@gmail.com', phone: '+8801734567890', is_active: true },
      { id: 6, branch_id: 1, student_code: 'STU-006', full_name: 'Mehnaz Tabassum', email: 'mehnaz.tabassum@gmail.com', phone: '+8801845678901', is_active: true },
      { id: 7, branch_id: 1, student_code: 'STU-007', full_name: 'Shakib Al Hasan', email: 'shakib.hasan@yahoo.com', phone: '+8801956789012', is_active: true },
      { id: 8, branch_id: 1, student_code: 'STU-008', full_name: 'Jannatul Ferdous', email: 'jannat.ferdous@gmail.com', phone: '+8801567890123', is_active: true },
      { id: 9, branch_id: 1, student_code: 'STU-009', full_name: 'Farhan Ishrak', email: 'farhan.ishrak@gmail.com', phone: '+8801778901234', is_active: true },
      { id: 10, branch_id: 1, student_code: 'STU-010', full_name: 'Tasnim Anika', email: 'tasnim.anika@outlook.com', phone: '+8801889012345', is_active: true },
      { id: 11, branch_id: 1, student_code: 'STU-011', full_name: 'Mahir Faisal', email: 'mahir.faisal@gmail.com', phone: '+8801990123456', is_active: true },
      { id: 12, branch_id: 1, student_code: 'STU-012', full_name: 'Sumaiya Akter', email: 'sumaiya.akter@yahoo.com', phone: '+8801601234567', is_active: true },
      { id: 13, branch_id: 1, student_code: 'STU-013', full_name: 'Rashed Chowdhury', email: 'rashed.chy@gmail.com', phone: '+8801712345678', is_active: true },
      { id: 14, branch_id: 1, student_code: 'STU-014', full_name: 'Ishrat Jahan', email: 'ishrat.jahan@gmail.com', phone: '+8801823456789', is_active: true },
      { id: 15, branch_id: 1, student_code: 'STU-015', full_name: 'Nafis Iqbal', email: 'nafis.iqbal@outlook.com', phone: '+8801934567890', is_active: true },
      { id: 16, branch_id: 1, student_code: 'STU-016', full_name: 'Zarin Subah', email: 'zarin.subah@gmail.com', phone: '+8801545678901', is_active: true },
      { id: 17, branch_id: 1, student_code: 'STU-017', full_name: 'Tahmidur Rahman', email: 'tahmid.rahman@gmail.com', phone: '+8801756789012', is_active: true },
      { id: 18, branch_id: 1, student_code: 'STU-018', full_name: 'Afia Rahman', email: 'afia.rahman@yahoo.com', phone: '+8801867890123', is_active: true },
      { id: 19, branch_id: 1, student_code: 'STU-019', full_name: 'Salman Muqtadir', email: 'salman.m@gmail.com', phone: '+8801978901234', is_active: true },
      { id: 20, branch_id: 1, student_code: 'STU-020', full_name: 'Nabila Huda', email: 'nabila.huda@gmail.com', phone: '+8801689012345', is_active: true },
    ],
    courses: [
      { id: 1, organization_id: 1, name: 'HSC Higher Mathematics', code: 'MTH-201', duration_months: 6, monthly_fee: 3500, is_active: true },
      { id: 2, organization_id: 1, name: 'Physics Advanced Mechanics & Optics', code: 'PHY-101', duration_months: 5, monthly_fee: 3200, is_active: true },
      { id: 3, organization_id: 1, name: 'Organic & Inorganic Chemistry', code: 'CHE-101', duration_months: 5, monthly_fee: 3000, is_active: true },
      { id: 4, organization_id: 1, name: 'Medical Biology & Genetics', code: 'BIO-101', duration_months: 6, monthly_fee: 3800, is_active: true },
      { id: 5, organization_id: 1, name: 'ICT & Python Programming', code: 'ICT-101', duration_months: 3, monthly_fee: 2500, is_active: true },
      { id: 6, organization_id: 1, name: 'SAT & IELTS Prep Masterclass', code: 'SAT-101', duration_months: 3, monthly_fee: 4500, is_active: true },
    ],
    batches: [
      { id: 1, branch_id: 1, course_id: 1, name: 'Morning Math Titans (Batch A)', capacity: 30, starts_on: '2026-01-15T09:00:00Z', is_active: true },
      { id: 2, branch_id: 1, course_id: 2, name: 'Evening Physics Pioneers (Batch B)', capacity: 25, starts_on: '2026-02-01T17:00:00Z', is_active: true },
      { id: 3, branch_id: 1, course_id: 3, name: 'Chemistry Weekend Elite (Batch C)', capacity: 28, starts_on: '2026-02-10T10:00:00Z', is_active: true },
      { id: 4, branch_id: 1, course_id: 4, name: 'Medical Biology Aspirants (Batch D)', capacity: 25, starts_on: '2026-02-15T15:00:00Z', is_active: true },
      { id: 5, branch_id: 1, course_id: 5, name: 'ICT Python Coders (Batch E)', capacity: 20, starts_on: '2026-03-01T16:00:00Z', is_active: true },
    ],
    teachers: [
      { id: 1, branch_id: 1, full_name: 'Dr. Kamrul Hassan', email: 'kamrul.hassan@buet.edu', subject_specialization: 'Higher Mathematics (BUET)', is_active: true },
      { id: 2, branch_id: 1, full_name: 'Prof. Nusrat Jahan', email: 'nusrat.jahan@du.ac.bd', subject_specialization: 'Physics Mechanics (DU)', is_active: true },
      { id: 3, branch_id: 1, full_name: 'Dr. Mahbubur Rahman', email: 'mahbub.chem@gmail.com', subject_specialization: 'Organic Chemistry', is_active: true },
      { id: 4, branch_id: 1, full_name: 'Dr. Tasneem Sharna', email: 'tasneem.dmc@gmail.com', subject_specialization: 'Medical Biology (DMC)', is_active: true },
      { id: 5, branch_id: 1, full_name: 'Engr. Fahim Shahriar', email: 'fahim.shahriar@iut.edu', subject_specialization: 'ICT & Algorithms (IUT)', is_active: true },
    ],
    timetable: [
      { id: 1, branch_id: 1, batch_id: 1, teacher_id: 1, weekday: 'Saturday', starts_at: '09:00', ends_at: '10:30', room: 'Auditorium 101' },
      { id: 2, branch_id: 1, batch_id: 1, teacher_id: 1, weekday: 'Monday', starts_at: '09:00', ends_at: '10:30', room: 'Auditorium 101' },
      { id: 3, branch_id: 1, batch_id: 2, teacher_id: 2, weekday: 'Sunday', starts_at: '17:00', ends_at: '18:30', room: 'Physics Lab 2' },
      { id: 4, branch_id: 1, batch_id: 2, teacher_id: 2, weekday: 'Tuesday', starts_at: '17:00', ends_at: '18:30', room: 'Physics Lab 2' },
      { id: 5, branch_id: 1, batch_id: 3, teacher_id: 3, weekday: 'Friday', starts_at: '10:00', ends_at: '12:00', room: 'Chemistry Hall' },
      { id: 6, branch_id: 1, batch_id: 4, teacher_id: 4, weekday: 'Wednesday', starts_at: '15:00', ends_at: '17:00', room: 'Medical Wing 3' },
    ],
    marks: [
      { id: 1, branch_id: 1, student_id: 1, batch_id: 1, assessment_name: 'HSC Model Test 1 (Calculus)', max_marks: 100, obtained_marks: 92, graded_at: '2026-02-01T00:00:00Z' },
      { id: 2, branch_id: 1, student_id: 2, batch_id: 2, assessment_name: 'Mechanics Mid-Term', max_marks: 100, obtained_marks: 88, graded_at: '2026-02-02T00:00:00Z' },
      { id: 3, branch_id: 1, student_id: 3, batch_id: 3, assessment_name: 'Organic Reactions Quiz', max_marks: 50, obtained_marks: 46, graded_at: '2026-02-03T00:00:00Z' },
      { id: 4, branch_id: 1, student_id: 4, batch_id: 4, assessment_name: 'Genetics & Botany Test', max_marks: 100, obtained_marks: 95, graded_at: '2026-02-04T00:00:00Z' },
      { id: 5, branch_id: 1, student_id: 5, batch_id: 5, assessment_name: 'Python Data Structures', max_marks: 50, obtained_marks: 49, graded_at: '2026-02-05T00:00:00Z' },
      { id: 6, branch_id: 1, student_id: 6, batch_id: 1, assessment_name: 'Trigonometry Blitz', max_marks: 50, obtained_marks: 44, graded_at: '2026-02-06T00:00:00Z' },
      { id: 7, branch_id: 1, student_id: 7, batch_id: 2, assessment_name: 'Optics & Waves Exam', max_marks: 100, obtained_marks: 90, graded_at: '2026-02-07T00:00:00Z' },
      { id: 8, branch_id: 1, student_id: 8, batch_id: 3, assessment_name: 'Periodic Table & Bonding', max_marks: 50, obtained_marks: 41, graded_at: '2026-02-08T00:00:00Z' },
    ],
    feeBalances: [
      { student_id: 1, total_due: 7000, total_paid: 7000, outstanding: 0 },
      { student_id: 2, total_due: 6400, total_paid: 4900, outstanding: 1500 },
      { student_id: 3, total_due: 6000, total_paid: 3000, outstanding: 3000 },
      { student_id: 4, total_due: 7600, total_paid: 7600, outstanding: 0 },
      { student_id: 5, total_due: 5000, total_paid: 4500, outstanding: 500 },
      { student_id: 6, total_due: 7000, total_paid: 5000, outstanding: 2000 },
      { student_id: 7, total_due: 6400, total_paid: 6400, outstanding: 0 },
      { student_id: 8, total_due: 6000, total_paid: 4800, outstanding: 1200 },
      { student_id: 9, total_due: 5000, total_paid: 5000, outstanding: 0 },
      { student_id: 10, total_due: 7600, total_paid: 5100, outstanding: 2500 },
      { student_id: 11, total_due: 9000, total_paid: 9000, outstanding: 0 },
      { student_id: 12, total_due: 7000, total_paid: 3500, outstanding: 3500 },
      { student_id: 13, total_due: 6400, total_paid: 6400, outstanding: 0 },
      { student_id: 14, total_due: 6000, total_paid: 5000, outstanding: 1000 },
      { student_id: 15, total_due: 5000, total_paid: 5000, outstanding: 0 },
      { student_id: 16, total_due: 5000, total_paid: 4200, outstanding: 800 },
      { student_id: 17, total_due: 7600, total_paid: 7600, outstanding: 0 },
      { student_id: 18, total_due: 7000, total_paid: 4800, outstanding: 2200 },
      { student_id: 19, total_due: 9000, total_paid: 9000, outstanding: 0 },
      { student_id: 20, total_due: 6400, total_paid: 4600, outstanding: 1800 },
    ],
    enrollments: [
      { id: 1, student_id: 1, batch_id: 1, enrolled_on: '2026-01-16T10:00:00Z', is_active: true },
      { id: 2, student_id: 2, batch_id: 2, enrolled_on: '2026-01-16T10:30:00Z', is_active: true },
      { id: 3, student_id: 3, batch_id: 3, enrolled_on: '2026-02-02T11:00:00Z', is_active: true },
      { id: 4, student_id: 4, batch_id: 4, enrolled_on: '2026-02-03T11:30:00Z', is_active: true },
      { id: 5, student_id: 5, batch_id: 5, enrolled_on: '2026-02-04T12:00:00Z', is_active: true },
      { id: 6, student_id: 6, batch_id: 1, enrolled_on: '2026-02-05T12:30:00Z', is_active: true },
      { id: 7, student_id: 7, batch_id: 2, enrolled_on: '2026-02-06T13:00:00Z', is_active: true },
      { id: 8, student_id: 8, batch_id: 3, enrolled_on: '2026-02-07T13:30:00Z', is_active: true },
      { id: 9, student_id: 9, batch_id: 5, enrolled_on: '2026-02-08T14:00:00Z', is_active: true },
      { id: 10, student_id: 10, batch_id: 4, enrolled_on: '2026-02-09T14:30:00Z', is_active: true },
      { id: 11, student_id: 11, batch_id: 1, enrolled_on: '2026-02-10T15:00:00Z', is_active: true },
      { id: 12, student_id: 12, batch_id: 1, enrolled_on: '2026-02-11T15:30:00Z', is_active: true },
      { id: 13, student_id: 13, batch_id: 2, enrolled_on: '2026-02-12T16:00:00Z', is_active: true },
      { id: 14, student_id: 14, batch_id: 3, enrolled_on: '2026-02-13T16:30:00Z', is_active: true },
      { id: 15, student_id: 15, batch_id: 5, enrolled_on: '2026-02-14T17:00:00Z', is_active: true },
      { id: 16, student_id: 16, batch_id: 5, enrolled_on: '2026-02-15T17:30:00Z', is_active: true },
      { id: 17, student_id: 17, batch_id: 4, enrolled_on: '2026-02-16T18:00:00Z', is_active: true },
      { id: 18, student_id: 18, batch_id: 1, enrolled_on: '2026-02-17T18:30:00Z', is_active: true },
      { id: 19, student_id: 19, batch_id: 1, enrolled_on: '2026-02-18T19:00:00Z', is_active: true },
      { id: 20, student_id: 20, batch_id: 2, enrolled_on: '2026-02-19T19:30:00Z', is_active: true },
    ],
    payments: [
      { id: 1, student_id: 1, amount: 7000, payment_method: 'bKash', transaction_reference: 'BKX99887711', paid_at: '2026-02-05T14:30:00Z' },
      { id: 2, student_id: 4, amount: 7600, payment_method: 'Nagad', transaction_reference: 'NGD55443322', paid_at: '2026-02-06T11:00:00Z' },
      { id: 3, student_id: 7, amount: 6400, payment_method: 'Cash', transaction_reference: 'REC-2026-01', paid_at: '2026-02-07T10:15:00Z' },
      { id: 4, student_id: 9, amount: 5000, payment_method: 'bKash', transaction_reference: 'BKX11223344', paid_at: '2026-02-08T16:20:00Z' },
      { id: 5, student_id: 11, amount: 9000, payment_method: 'Bank Transfer', transaction_reference: 'EBL-TRF-8812', paid_at: '2026-02-09T13:45:00Z' },
      { id: 6, student_id: 13, amount: 6400, payment_method: 'bKash', transaction_reference: 'BKX77889900', paid_at: '2026-02-10T09:30:00Z' },
      { id: 7, student_id: 15, amount: 5000, payment_method: 'Nagad', transaction_reference: 'NGD99881122', paid_at: '2026-02-11T15:10:00Z' },
      { id: 8, student_id: 17, amount: 7600, payment_method: 'Cash', transaction_reference: 'REC-2026-02', paid_at: '2026-02-12T12:00:00Z' },
      { id: 9, student_id: 19, amount: 9000, payment_method: 'bKash', transaction_reference: 'BKX44556677', paid_at: '2026-02-13T17:40:00Z' },
      { id: 10, student_id: 2, amount: 4900, payment_method: 'bKash', transaction_reference: 'BKX33445566', paid_at: '2026-02-14T11:20:00Z' },
      { id: 11, student_id: 6, amount: 5000, payment_method: 'Nagad', transaction_reference: 'NGD22334455', paid_at: '2026-02-15T14:05:00Z' },
      { id: 12, student_id: 10, amount: 5100, payment_method: 'Cash', transaction_reference: 'REC-2026-03', paid_at: '2026-02-16T10:50:00Z' },
      { id: 13, student_id: 14, amount: 5000, payment_method: 'Rocket', transaction_reference: 'RCK88776655', paid_at: '2026-02-17T16:15:00Z' },
      { id: 14, student_id: 18, amount: 4800, payment_method: 'bKash', transaction_reference: 'BKX66778899', paid_at: '2026-02-18T13:30:00Z' },
      { id: 15, student_id: 20, amount: 4600, payment_method: 'Nagad', transaction_reference: 'NGD11223388', paid_at: '2026-02-19T18:00:00Z' },
    ],
    attendance: [
      { id: 1, enrollment_id: 1, attended_on: '2026-02-10T09:00:00Z', status: 'present' },
      { id: 2, enrollment_id: 2, attended_on: '2026-02-10T17:00:00Z', status: 'present' },
      { id: 3, enrollment_id: 3, attended_on: '2026-02-11T10:00:00Z', status: 'present' },
      { id: 4, enrollment_id: 4, attended_on: '2026-02-11T15:00:00Z', status: 'present' },
      { id: 5, enrollment_id: 5, attended_on: '2026-02-12T16:00:00Z', status: 'late' },
      { id: 6, enrollment_id: 6, attended_on: '2026-02-12T09:00:00Z', status: 'present' },
      { id: 7, enrollment_id: 7, attended_on: '2026-02-13T17:00:00Z', status: 'absent' },
      { id: 8, enrollment_id: 8, attended_on: '2026-02-13T10:00:00Z', status: 'present' },
      { id: 9, enrollment_id: 9, attended_on: '2026-02-14T16:00:00Z', status: 'present' },
      { id: 10, enrollment_id: 10, attended_on: '2026-02-14T15:00:00Z', status: 'excused' },
    ],
  };

  private state(): DemoState {
    const saved = localStorage.getItem(this.key);
    if (saved) return JSON.parse(saved) as DemoState;
    this.save(this.seed);
    return structuredClone(this.seed);
  }

  private save(state: DemoState): void {
    localStorage.setItem(this.key, JSON.stringify(state));
  }

  user(): User {
    return this.state().user;
  }

  branches(): Branch[] {
    return this.state().branches;
  }

  snapshot(branchId: number): Pick<DemoState, 'students' | 'courses' | 'batches' | 'teachers' | 'timetable' | 'marks' | 'feeBalances' | 'enrollments' | 'payments' | 'attendance'> {
    const s = this.state();
    return {
      students: s.students.filter(x => x.branch_id === branchId && x.is_active),
      courses: s.courses.filter(x => x.is_active),
      batches: s.batches.filter(x => x.branch_id === branchId && x.is_active),
      teachers: s.teachers.filter(x => x.branch_id === branchId && x.is_active),
      timetable: s.timetable.filter(x => x.branch_id === branchId),
      marks: s.marks.filter(x => x.branch_id === branchId),
      feeBalances: s.feeBalances,
      enrollments: s.enrollments.filter(x => {
        const batch = s.batches.find(b => b.id === x.batch_id);
        return batch?.branch_id === branchId && x.is_active;
      }),
      payments: (s.payments || []).filter(p => {
        const student = s.students.find(st => st.id === p.student_id);
        return student?.branch_id === branchId;
      }),
      attendance: s.attendance || [],
    };
  }

  create(resource: string, branchId: number, payload: Record<string, string | number>): void {
    const s = this.state();
    const id = Date.now();

    if (resource === 'students') {
      s.students.push({
        id,
        branch_id: branchId,
        student_code: String(payload['student_code']),
        full_name: String(payload['full_name']),
        email: String(payload['email'] || ''),
        phone: String(payload['phone'] || ''),
        is_active: true,
      });
      s.feeBalances.push({ student_id: id, total_due: 0, total_paid: 0, outstanding: 0 });
    } else if (resource === 'courses') {
      s.courses.push({
        id,
        organization_id: 1,
        name: String(payload['name']),
        code: String(payload['code']),
        duration_months: Number(payload['duration_months']),
        monthly_fee: Number(payload['monthly_fee']),
        is_active: true,
      });
    } else if (resource === 'teachers') {
      s.teachers.push({
        id,
        branch_id: branchId,
        full_name: String(payload['full_name']),
        email: String(payload['email'] || ''),
        subject_specialization: String(payload['subject_specialization']),
        is_active: true,
      });
    } else if (resource === 'batches') {
      s.batches.push({
        id,
        branch_id: branchId,
        course_id: Number(payload['course_id']),
        name: String(payload['name']),
        capacity: Number(payload['capacity']),
        starts_on: String(payload['starts_on']),
        is_active: true,
      });
    } else if (resource === 'timetable') {
      s.timetable.push({
        id,
        branch_id: branchId,
        batch_id: Number(payload['batch_id']),
        teacher_id: Number(payload['teacher_id']),
        weekday: String(payload['weekday']),
        starts_at: String(payload['starts_at']),
        ends_at: String(payload['ends_at']),
        room: String(payload['room']),
      });
    } else if (resource === 'marks') {
      s.marks.push({
        id,
        branch_id: branchId,
        student_id: Number(payload['student_id']),
        batch_id: Number(payload['batch_id']),
        assessment_name: String(payload['assessment_name']),
        max_marks: Number(payload['max_marks']),
        obtained_marks: Number(payload['obtained_marks']),
        graded_at: new Date().toISOString(),
      });
    } else if (resource === 'enrollments') {
      if (!s.enrollments) s.enrollments = [];
      s.enrollments.push({
        id,
        student_id: Number(payload['student_id']),
        batch_id: Number(payload['batch_id']),
        enrolled_on: new Date().toISOString(),
        is_active: true,
      });
    } else if (resource === 'payments') {
      if (!s.payments) s.payments = [];
      const studentId = Number(payload['student_id']);
      const amount = Number(payload['amount']);
      s.payments.unshift({
        id,
        student_id: studentId,
        amount,
        payment_method: String(payload['payment_method']),
        transaction_reference: String(payload['transaction_reference'] || ''),
        paid_at: new Date().toISOString(),
      });
      const balance = s.feeBalances.find(b => b.student_id === studentId);
      if (balance) {
        balance.total_paid += amount;
        balance.outstanding = Math.max(0, balance.total_due - balance.total_paid);
      }
    } else if (resource === 'fee-charges') {
      const studentId = Number(payload['student_id']);
      const amountDue = Number(payload['amount_due']);
      const balance = s.feeBalances.find(b => b.student_id === studentId);
      if (balance) {
        balance.total_due += amountDue;
        balance.outstanding = Math.max(0, balance.total_due - balance.total_paid);
      }
    } else if (resource === 'attendance') {
      if (!s.attendance) s.attendance = [];
      s.attendance.unshift({
        id,
        enrollment_id: Number(payload['enrollment_id']),
        attended_on: String(payload['attended_on'] || new Date().toISOString()),
        status: String(payload['status'] || 'present'),
      });
    } else if (resource === 'branches') {
      s.branches.push({
        id,
        organization_id: 1,
        code: String(payload['code']).toUpperCase(),
        name: String(payload['name']),
        is_active: true,
      });
    }

    this.save(s);
  }

  remove(resource: string, id: number): void {
    const s = this.state();
    const collection = ({
      students: s.students,
      courses: s.courses,
      teachers: s.teachers,
      batches: s.batches,
      timetable: s.timetable,
      marks: s.marks,
      enrollments: s.enrollments,
      payments: s.payments,
      attendance: s.attendance,
      branches: s.branches,
    } as Record<string, Array<{ id: number; is_active?: boolean }>>)[resource];

    const item = collection?.find(x => x.id === id);
    if (item && 'is_active' in item) item.is_active = false;
    else if (item && collection) collection.splice(collection.indexOf(item), 1);
    this.save(s);
  }
}
