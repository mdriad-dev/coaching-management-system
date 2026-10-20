from datetime import datetime, time
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .models import AttendanceStatus, UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: UserRole


class BranchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    code: str
    name: str
    is_active: bool


class StudentCreate(BaseModel):
    student_code: str = Field(min_length=1, max_length=50)
    full_name: str = Field(min_length=1, max_length=200)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=30)


class StudentResponse(StudentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    branch_id: int
    is_active: bool


class CourseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    code: str = Field(min_length=1, max_length=50)
    duration_months: int = Field(gt=0, le=120)
    monthly_fee: Decimal = Field(ge=0, decimal_places=2, max_digits=12)


class CourseResponse(CourseCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    is_active: bool


class BatchCreate(BaseModel):
    course_id: int = Field(gt=0)
    name: str = Field(min_length=1, max_length=200)
    capacity: int = Field(gt=0, le=1000)
    starts_on: datetime


class BatchResponse(BatchCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    branch_id: int
    is_active: bool


class EnrollmentCreate(BaseModel):
    student_id: int = Field(gt=0)
    batch_id: int = Field(gt=0)


class EnrollmentResponse(EnrollmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    enrolled_on: datetime
    is_active: bool


class AttendanceCreate(BaseModel):
    enrollment_id: int = Field(gt=0)
    attended_on: datetime
    status: AttendanceStatus


class AttendanceResponse(AttendanceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


class PaymentCreate(BaseModel):
    student_id: int = Field(gt=0)
    amount: Decimal = Field(gt=0, decimal_places=2, max_digits=12)
    payment_method: str = Field(min_length=1, max_length=30)
    transaction_reference: str | None = Field(default=None, max_length=100)


class PaymentResponse(PaymentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    paid_at: datetime


class TeacherCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    email: EmailStr | None = None
    subject_specialization: str = Field(min_length=1, max_length=120)


class TeacherResponse(TeacherCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    branch_id: int
    is_active: bool


class TimetableCreate(BaseModel):
    batch_id: int = Field(gt=0)
    teacher_id: int = Field(gt=0)
    weekday: str = Field(min_length=3, max_length=12)
    starts_at: time
    ends_at: time
    room: str = Field(min_length=1, max_length=80)


class TimetableResponse(TimetableCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    branch_id: int


class MarkCreate(BaseModel):
    student_id: int = Field(gt=0)
    batch_id: int = Field(gt=0)
    assessment_name: str = Field(min_length=1, max_length=120)
    max_marks: Decimal = Field(gt=0, decimal_places=2, max_digits=7)
    obtained_marks: Decimal = Field(ge=0, decimal_places=2, max_digits=7)


class MarkResponse(MarkCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    branch_id: int
    graded_at: datetime


class FeeChargeCreate(BaseModel):
    student_id: int = Field(gt=0)
    description: str = Field(min_length=1, max_length=160)
    amount_due: Decimal = Field(gt=0, decimal_places=2, max_digits=12)
    due_on: datetime


class FeeBalanceResponse(BaseModel):
    student_id: int
    total_due: Decimal
    total_paid: Decimal
    outstanding: Decimal
