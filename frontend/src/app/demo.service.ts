import { Injectable } from '@angular/core';
import { Branch, Batch, Course, FeeBalance, Mark, Student, Teacher, TimetableEntry, User } from './models';

type DemoState = {
  user: User; branches: Branch[]; students: Student[]; courses: Course[];
  batches: Batch[]; teachers: Teacher[]; timetable: TimetableEntry[]; marks: Mark[];
  feeBalances: FeeBalance[];
};

@Injectable({ providedIn: 'root' })
export class DemoService {
  private readonly key = 'cms_browser_demo';
  private readonly seed: DemoState = {
    user: { id: 1, email: 'demo@coachingcms.app', full_name: 'Demo Administrator', role: 'admin' },
    branches: [{ id: 1, organization_id: 1, code: 'MAIN', name: 'Main Campus', is_active: true }],
    students: [
      { id: 1, branch_id: 1, student_code: 'ST-001', full_name: 'Rahim Ahmed', email: 'rahim@example.com', is_active: true },
      { id: 2, branch_id: 1, student_code: 'ST-002', full_name: 'Sadia Karim', email: 'sadia@example.com', is_active: true },
    ],
    courses: [{ id: 1, organization_id: 1, name: 'English Intensive', code: 'ENG-101', duration_months: 6, monthly_fee: 3500, is_active: true }],
    batches: [{ id: 1, branch_id: 1, course_id: 1, name: 'Morning Batch', capacity: 30, starts_on: '2026-01-15T09:00:00Z', is_active: true }],
    teachers: [{ id: 1, branch_id: 1, full_name: 'Nusrat Jahan', email: 'nusrat@example.com', subject_specialization: 'English', is_active: true }],
    timetable: [{ id: 1, branch_id: 1, batch_id: 1, teacher_id: 1, weekday: 'Monday', starts_at: '09:00', ends_at: '11:00', room: 'Room A' }],
    marks: [{ id: 1, branch_id: 1, student_id: 1, batch_id: 1, assessment_name: 'Monthly Test', max_marks: 100, obtained_marks: 86, graded_at: '2026-02-01T00:00:00Z' }],
    feeBalances: [{ student_id: 1, total_due: 3500, total_paid: 2500, outstanding: 1000 }, { student_id: 2, total_due: 3500, total_paid: 3500, outstanding: 0 }],
  };

  private state(): DemoState {
    const saved = localStorage.getItem(this.key);
    if (saved) return JSON.parse(saved) as DemoState;
    this.save(this.seed);
    return structuredClone(this.seed);
  }
  private save(state: DemoState): void { localStorage.setItem(this.key, JSON.stringify(state)); }
  user(): User { return this.state().user; }
  branches(): Branch[] { return this.state().branches; }
  snapshot(branchId: number): Pick<DemoState, 'students' | 'courses' | 'batches' | 'teachers' | 'timetable' | 'marks' | 'feeBalances'> {
    const s = this.state();
    return {
      students: s.students.filter(x => x.branch_id === branchId && x.is_active),
      courses: s.courses.filter(x => x.is_active),
      batches: s.batches.filter(x => x.branch_id === branchId && x.is_active),
      teachers: s.teachers.filter(x => x.branch_id === branchId && x.is_active),
      timetable: s.timetable.filter(x => x.branch_id === branchId),
      marks: s.marks.filter(x => x.branch_id === branchId),
      feeBalances: s.feeBalances,
    };
  }
  create(resource: string, branchId: number, payload: Record<string, string | number>): void {
    const s = this.state();
    const id = Date.now();
    if (resource === 'students') s.students.push({ id, branch_id: branchId, student_code: String(payload['student_code']), full_name: String(payload['full_name']), email: String(payload['email'] || ''), is_active: true });
    if (resource === 'courses') s.courses.push({ id, organization_id: 1, name: String(payload['name']), code: String(payload['code']), duration_months: Number(payload['duration_months']), monthly_fee: Number(payload['monthly_fee']), is_active: true });
    if (resource === 'teachers') s.teachers.push({ id, branch_id: branchId, full_name: String(payload['full_name']), email: String(payload['email'] || ''), subject_specialization: String(payload['subject_specialization']), is_active: true });
    if (resource === 'batches') s.batches.push({ id, branch_id: branchId, course_id: Number(payload['course_id']), name: String(payload['name']), capacity: Number(payload['capacity']), starts_on: String(payload['starts_on']), is_active: true });
    if (resource === 'timetable') s.timetable.push({ id, branch_id: branchId, batch_id: Number(payload['batch_id']), teacher_id: Number(payload['teacher_id']), weekday: String(payload['weekday']), starts_at: String(payload['starts_at']), ends_at: String(payload['ends_at']), room: String(payload['room']) });
    if (resource === 'marks') s.marks.push({ id, branch_id: branchId, student_id: Number(payload['student_id']), batch_id: Number(payload['batch_id']), assessment_name: String(payload['assessment_name']), max_marks: Number(payload['max_marks']), obtained_marks: Number(payload['obtained_marks']), graded_at: new Date().toISOString() });
    this.save(s);
  }
  remove(resource: string, id: number): void {
    const s = this.state();
    const collection = ({ students: s.students, courses: s.courses, teachers: s.teachers, batches: s.batches, timetable: s.timetable, marks: s.marks } as Record<string, Array<{ id: number; is_active?: boolean }>>)[resource];
    const item = collection?.find(x => x.id === id);
    if (item && 'is_active' in item) item.is_active = false;
    else if (item && collection) collection.splice(collection.indexOf(item), 1);
    this.save(s);
  }
}
