from decimal import Decimal
from datetime import datetime, UTC

from sqlalchemy import select

from .db import Base, SessionLocal, engine
from .models import (
    Batch,
    Branch,
    Course,
    Organization,
    Student,
    User,
    UserBranch,
    UserRole,
)
from .security import hash_password


def seed_demo_data() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal.begin() as db:
        organization = db.scalar(
            select(Organization).where(Organization.name == "Demo Coaching Organization")
        )
        if organization is None:
            organization = Organization(name="Demo Coaching Organization")
            db.add(organization)
            db.flush()

        branch = db.scalar(
            select(Branch).where(
                Branch.organization_id == organization.id, Branch.code == "MAIN"
            )
        )
        if branch is None:
            branch = Branch(
                organization_id=organization.id,
                code="MAIN",
                name="Main Branch",
            )
            db.add(branch)
            db.flush()

        user = db.scalar(select(User).where(User.email == "admin@example.com"))
        if user is None:
            user = User(
                email="admin@example.com",
                full_name="System Administrator",
                password_hash=hash_password("Admin123!"),
                role=UserRole.ORGANIZATION_ADMINISTRATOR.value,
            )
            db.add(user)
            db.flush()
        if db.get(UserBranch, {"user_id": user.id, "branch_id": branch.id}) is None:
            db.add(UserBranch(user_id=user.id, branch_id=branch.id))

        course = db.scalar(
            select(Course).where(
                Course.organization_id == organization.id, Course.code == "PY-101"
            )
        )
        if course is None:
            course = Course(
                organization_id=organization.id,
                name="Python Fundamentals",
                code="PY-101",
                duration_months=3,
                monthly_fee=Decimal("125.00"),
            )
            db.add(course)
            db.flush()

        batch = db.scalar(
            select(Batch).where(Batch.branch_id == branch.id, Batch.name == "Morning")
        )
        if batch is None:
            db.add(
                Batch(
                    branch_id=branch.id,
                    course_id=course.id,
                    name="Morning",
                    capacity=30,
                    starts_on=datetime.now(UTC),
                )
            )

        if db.scalar(
            select(Student).where(
                Student.branch_id == branch.id, Student.student_code == "STU-001"
            )
        ) is None:
            db.add(
                Student(
                    branch_id=branch.id,
                    student_code="STU-001",
                    full_name="Demo Student",
                    email="student@example.com",
                    phone="+8801000000000",
                )
            )


if __name__ == "__main__":
    seed_demo_data()
    print("Demo data is ready.")
    print("Login: admin@example.com")
    print("Password: Admin123!")
