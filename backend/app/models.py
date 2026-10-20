from datetime import datetime, time
from enum import StrEnum

from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class UserRole(StrEnum):
    SUPER_ADMINISTRATOR = "super_administrator"
    ORGANIZATION_ADMINISTRATOR = "organization_administrator"
    BRANCH_MANAGER = "branch_manager"
    TEACHER = "teacher"
    ACCOUNTANT = "accountant"
    RECEPTIONIST = "receptionist"
    STUDENT = "student"


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    branches: Mapped[list["Branch"]] = relationship(back_populates="organization")


class Branch(Base):
    __tablename__ = "branches"

    id: Mapped[int] = mapped_column(primary_key=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"))
    code: Mapped[str] = mapped_column(String(30), index=True)
    name: Mapped[str] = mapped_column(String(200))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    organization: Mapped[Organization] = relationship(back_populates="branches")
    users: Mapped[list["UserBranch"]] = relationship(back_populates="branch")
    students: Mapped[list["Student"]] = relationship(back_populates="branch")
    __table_args__ = (UniqueConstraint("organization_id", "code"),)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(200))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default=UserRole.STUDENT.value)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    branches: Mapped[list["UserBranch"]] = relationship(back_populates="user")


class UserBranch(Base):
    __tablename__ = "user_branches"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), primary_key=True)
    user: Mapped[User] = relationship(back_populates="branches")
    branch: Mapped[Branch] = relationship(back_populates="users")


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), index=True)
    student_code: Mapped[str] = mapped_column(String(50), index=True)
    full_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    branch: Mapped[Branch] = relationship(back_populates="students")
    __table_args__ = (UniqueConstraint("branch_id", "student_code"),)


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"))
    name: Mapped[str] = mapped_column(String(200))
    code: Mapped[str] = mapped_column(String(50))
    duration_months: Mapped[int] = mapped_column()
    monthly_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    __table_args__ = (UniqueConstraint("organization_id", "code"),)


class Batch(Base):
    __tablename__ = "batches"

    id: Mapped[int] = mapped_column(primary_key=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    name: Mapped[str] = mapped_column(String(200))
    capacity: Mapped[int] = mapped_column(default=30)
    starts_on: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    batch_id: Mapped[int] = mapped_column(ForeignKey("batches.id"))
    enrolled_on: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    __table_args__ = (UniqueConstraint("student_id", "batch_id"),)


class AttendanceStatus(StrEnum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[int] = mapped_column(primary_key=True)
    enrollment_id: Mapped[int] = mapped_column(ForeignKey("enrollments.id"))
    attended_on: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20))
    __table_args__ = (UniqueConstraint("enrollment_id", "attended_on"),)


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    payment_method: Mapped[str] = mapped_column(String(30))
    transaction_reference: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    paid_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Teacher(Base):
    __tablename__ = "teachers"

    id: Mapped[int] = mapped_column(primary_key=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), index=True)
    full_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subject_specialization: Mapped[str] = mapped_column(String(120))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), index=True)
    batch_id: Mapped[int] = mapped_column(ForeignKey("batches.id"))
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))
    weekday: Mapped[str] = mapped_column(String(12))
    starts_at: Mapped[time] = mapped_column(Time())
    ends_at: Mapped[time] = mapped_column(Time())
    room: Mapped[str] = mapped_column(String(80))


class Mark(Base):
    __tablename__ = "marks"

    id: Mapped[int] = mapped_column(primary_key=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    batch_id: Mapped[int] = mapped_column(ForeignKey("batches.id"))
    assessment_name: Mapped[str] = mapped_column(String(120))
    max_marks: Mapped[Decimal] = mapped_column(Numeric(7, 2))
    obtained_marks: Mapped[Decimal] = mapped_column(Numeric(7, 2))
    graded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class FeeCharge(Base):
    __tablename__ = "fee_charges"

    id: Mapped[int] = mapped_column(primary_key=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    description: Mapped[str] = mapped_column(String(160))
    amount_due: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    due_on: Mapped[datetime] = mapped_column(DateTime(timezone=True))
