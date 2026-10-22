from decimal import Decimal
from datetime import datetime, UTC, time

from sqlalchemy import select

from .db import Base, SessionLocal, engine
from .models import (
    Batch,
    Branch,
    Course,
    Enrollment,
    FeeCharge,
    Organization,
    Payment,
    Student,
    Teacher,
    TimetableEntry,
    User,
    UserBranch,
    UserRole,
)
from .security import hash_password


DEMO_STUDENTS = [
    ("STU-001", "Rahim Ahmed", "rahim.ahmed@gmail.com", "+8801711223344"),
    ("STU-002", "Sadia Karim", "sadia.karim@yahoo.com", "+8801819876543"),
    ("STU-003", "Tanvir Hossain", "tanvir.hossain@gmail.com", "+8801912345678"),
    ("STU-004", "Nusrat Fariha", "nusrat.fariha@outlook.com", "+8801623456789"),
    ("STU-005", "Ayman Sadiq", "ayman.sadiq@gmail.com", "+8801734567890"),
    ("STU-006", "Mehnaz Tabassum", "mehnaz.tabassum@gmail.com", "+8801845678901"),
    ("STU-007", "Shakib Al Hasan", "shakib.hasan@yahoo.com", "+8801956789012"),
    ("STU-008", "Jannatul Ferdous", "jannat.ferdous@gmail.com", "+8801567890123"),
    ("STU-009", "Farhan Ishrak", "farhan.ishrak@gmail.com", "+8801778901234"),
    ("STU-010", "Tasnim Anika", "tasnim.anika@outlook.com", "+8801889012345"),
    ("STU-011", "Mahir Faisal", "mahir.faisal@gmail.com", "+8801990123456"),
    ("STU-012", "Sumaiya Akter", "sumaiya.akter@yahoo.com", "+8801601234567"),
    ("STU-013", "Rashed Chowdhury", "rashed.chy@gmail.com", "+8801712345678"),
    ("STU-014", "Ishrat Jahan", "ishrat.jahan@gmail.com", "+8801823456789"),
    ("STU-015", "Nafis Iqbal", "nafis.iqbal@outlook.com", "+8801934567890"),
    ("STU-016", "Zarin Subah", "zarin.subah@gmail.com", "+8801545678901"),
    ("STU-017", "Tahmidur Rahman", "tahmid.rahman@gmail.com", "+8801756789012"),
    ("STU-018", "Afia Rahman", "afia.rahman@yahoo.com", "+8801867890123"),
    ("STU-019", "Salman Muqtadir", "salman.m@gmail.com", "+8801978901234"),
    ("STU-020", "Nabila Huda", "nabila.huda@gmail.com", "+8801689012345"),
]


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
                name="Main Campus (Dhanmondi)",
            )
            db.add(branch)
            db.flush()

        user = db.scalar(select(User).where(User.email == "admin@example.com"))
        if user is None:
            user = User(
                email="admin@example.com",
                full_name="Md. Riad (Coaching Owner)",
                password_hash=hash_password("Admin123!"),
                role=UserRole.SUPER_ADMINISTRATOR.value,
            )
            db.add(user)
            db.flush()

        if db.get(UserBranch, {"user_id": user.id, "branch_id": branch.id}) is None:
            db.add(UserBranch(user_id=user.id, branch_id=branch.id))

        # Courses
        course_math = db.scalar(select(Course).where(Course.code == "MTH-201"))
        if course_math is None:
            course_math = Course(
                organization_id=organization.id,
                name="HSC Higher Mathematics",
                code="MTH-201",
                duration_months=6,
                monthly_fee=Decimal("3500.00"),
            )
            db.add(course_math)
            db.flush()

        course_phy = db.scalar(select(Course).where(Course.code == "PHY-101"))
        if course_phy is None:
            course_phy = Course(
                organization_id=organization.id,
                name="Physics Advanced Mechanics & Optics",
                code="PHY-101",
                duration_months=5,
                monthly_fee=Decimal("3200.00"),
            )
            db.add(course_phy)
            db.flush()

        course_che = db.scalar(select(Course).where(Course.code == "CHE-101"))
        if course_che is None:
            course_che = Course(
                organization_id=organization.id,
                name="Organic & Inorganic Chemistry",
                code="CHE-101",
                duration_months=5,
                monthly_fee=Decimal("3000.00"),
            )
            db.add(course_che)
            db.flush()

        # Batches
        batch_math = db.scalar(select(Batch).where(Batch.branch_id == branch.id, Batch.name == "Morning Math Titans"))
        if batch_math is None:
            batch_math = Batch(
                branch_id=branch.id,
                course_id=course_math.id,
                name="Morning Math Titans",
                capacity=30,
                starts_on=datetime.now(UTC),
            )
            db.add(batch_math)
            db.flush()

        batch_phy = db.scalar(select(Batch).where(Batch.branch_id == branch.id, Batch.name == "Evening Physics Pioneers"))
        if batch_phy is None:
            batch_phy = Batch(
                branch_id=branch.id,
                course_id=course_phy.id,
                name="Evening Physics Pioneers",
                capacity=25,
                starts_on=datetime.now(UTC),
            )
            db.add(batch_phy)
            db.flush()

        # Teachers
        teacher1 = db.scalar(select(Teacher).where(Teacher.branch_id == branch.id, Teacher.full_name == "Dr. Kamrul Hassan"))
        if teacher1 is None:
            teacher1 = Teacher(
                branch_id=branch.id,
                full_name="Dr. Kamrul Hassan",
                email="kamrul.hassan@buet.edu",
                subject_specialization="Higher Mathematics (BUET)",
            )
            db.add(teacher1)
            db.flush()

        # 20 Students Seed
        for code, name, email, phone in DEMO_STUDENTS:
            st = db.scalar(select(Student).where(Student.branch_id == branch.id, Student.student_code == code))
            if st is None:
                st = Student(
                    branch_id=branch.id,
                    student_code=code,
                    full_name=name,
                    email=email,
                    phone=phone,
                )
                db.add(st)
                db.flush()

                # Enroll in batch
                target_batch = batch_math if int(code.split("-")[1]) % 2 == 1 else batch_phy
                enrollment = Enrollment(student_id=st.id, batch_id=target_batch.id)
                db.add(enrollment)
                db.flush()

                # Charge Fee
                fee = FeeCharge(
                    branch_id=branch.id,
                    student_id=st.id,
                    description="Monthly Tuition Fee",
                    amount_due=Decimal("3500.00"),
                    due_on=datetime.now(UTC),
                )
                db.add(fee)

                # Payment (partially or fully paid)
                if int(code.split("-")[1]) % 3 != 0:
                    pay = Payment(
                        student_id=st.id,
                        amount=Decimal("3500.00") if int(code.split("-")[1]) % 2 == 0 else Decimal("2000.00"),
                        payment_method="bKash" if int(code.split("-")[1]) % 2 == 0 else "Nagad",
                        transaction_reference=f"TRX-{code}",
                    )
                    db.add(pay)


if __name__ == "__main__":
    seed_demo_data()
    print("Demo data is ready.")
    print("Login: admin@example.com")
    print("Password: Admin123!")
