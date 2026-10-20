export interface User { id: number; email: string; full_name: string; role: string; }
export interface Branch { id: number; organization_id: number; code: string; name: string; is_active: boolean; }
export interface Student { id: number; branch_id: number; student_code: string; full_name: string; email?: string; phone?: string; is_active: boolean; }
export interface Course { id: number; organization_id: number; name: string; code: string; duration_months: number; monthly_fee: number; is_active: boolean; }
export interface Batch { id: number; branch_id: number; course_id: number; name: string; capacity: number; starts_on: string; is_active: boolean; }
export interface TokenResponse { access_token: string; token_type: string; }
