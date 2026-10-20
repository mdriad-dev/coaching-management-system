export interface User { id: number; email: string; full_name: string; role: string; }
export interface Branch { id: number; organization_id: number; code: string; name: string; is_active: boolean; }
export interface Student { id: number; branch_id: number; student_code: string; full_name: string; email?: string; phone?: string; is_active: boolean; }
export interface Course { id: number; organization_id: number; name: string; code: string; duration_months: number; monthly_fee: number; is_active: boolean; }
export interface Batch { id: number; branch_id: number; course_id: number; name: string; capacity: number; starts_on: string; is_active: boolean; }
export interface TokenResponse { access_token: string; token_type: string; }
export interface Teacher { id: number; branch_id: number; full_name: string; email?: string; subject_specialization: string; is_active: boolean; }
export interface TimetableEntry { id: number; branch_id: number; batch_id: number; teacher_id: number; weekday: string; starts_at: string; ends_at: string; room: string; }
export interface Mark { id: number; branch_id: number; student_id: number; batch_id: number; assessment_name: string; max_marks: number; obtained_marks: number; graded_at: string; }
export interface FeeBalance { student_id: number; total_due: number; total_paid: number; outstanding: number; }
