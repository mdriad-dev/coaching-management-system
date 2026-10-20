from datetime import datetime
from enum import StrEnum

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint, func
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
