from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

from .dependencies import CurrentUser, Database, require_branch_access
from .models import (
    Attendance,
    Batch,
    Branch,
    Course,
    Enrollment,
    Payment,
    FeeCharge,
    Mark,
    Teacher,
    TimetableEntry,
    Student,
    User,
)
from .schemas import (
    AttendanceCreate,
    AttendanceResponse,
    BatchCreate,
    BatchResponse,
    BranchResponse,
    CourseCreate,
    CourseResponse,
    EnrollmentCreate,
    EnrollmentResponse,
    LoginRequest,
    PaymentCreate,
    PaymentResponse,
    FeeBalanceResponse,
    FeeChargeCreate,
    MarkCreate,
    MarkResponse,
    StudentCreate,
    StudentResponse,
    TokenResponse,
    TeacherCreate,
    TeacherResponse,
    TimetableCreate,
    TimetableResponse,
    UserResponse,
)
from .security import create_access_token, verify_password

router = APIRouter(prefix="/api/v1")


@router.post("/auth/login", response_model=TokenResponse, tags=["auth"])
def login(payload: LoginRequest, db: Database) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not user.is_active or not verify_password(
        payload.password, user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/auth/me", response_model=UserResponse, tags=["auth"])
def current_user(user: CurrentUser) -> User:
    return user


@router.get("/branches", response_model=list[BranchResponse], tags=["branches"])
def list_branches(user: CurrentUser, db: Database) -> list[Branch]:
    if user.role in {"super_administrator", "organization_administrator"}:
        return list(db.scalars(select(Branch).where(Branch.is_active.is_(True))))
    return list(
        db.scalars(
            select(Branch)
            .join(Branch.users)
            .where(Branch.is_active.is_(True), User.id == user.id)
        )
    )


@router.get(
    "/branches/{branch_id}/students",
    response_model=list[StudentResponse],
    tags=["students"],
)
def list_students(branch_id: int, user: CurrentUser, db: Database) -> list[Student]:
    require_branch_access(db, user, branch_id)
    return list(
        db.scalars(
            select(Student)
            .where(Student.branch_id == branch_id, Student.is_active.is_(True))
            .order_by(Student.full_name)
        )
    )


@router.post(
    "/branches/{branch_id}/students",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["students"],
)
def create_student(
    branch_id: int, payload: StudentCreate, user: CurrentUser, db: Database
) -> Student:
    require_branch_access(db, user, branch_id)
    branch = db.get(Branch, branch_id)
    if branch is None or not branch.is_active:
        raise HTTPException(status_code=404, detail="Branch not found")
    duplicate = db.scalar(
        select(Student).where(
            Student.branch_id == branch_id,
            Student.student_code == payload.student_code,
        )
    )
    if duplicate is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student code already exists in this branch",
        )
    student = Student(branch_id=branch_id, **payload.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get(
    "/branches/{branch_id}/courses",
    response_model=list[CourseResponse],
    tags=["courses"],
)
def list_courses(branch_id: int, user: CurrentUser, db: Database) -> list[Course]:
    require_branch_access(db, user, branch_id)
    branch = db.get(Branch, branch_id)
    if branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    return list(
        db.scalars(
            select(Course).where(
                Course.organization_id == branch.organization_id,
                Course.is_active.is_(True),
            )
        )
    )


@router.post(
    "/branches/{branch_id}/courses",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["courses"],
)
def create_course(
    branch_id: int, payload: CourseCreate, user: CurrentUser, db: Database
) -> Course:
    require_branch_access(db, user, branch_id)
    branch = db.get(Branch, branch_id)
    if branch is None or not branch.is_active:
        raise HTTPException(status_code=404, detail="Branch not found")
    duplicate = db.scalar(
        select(Course).where(
            Course.organization_id == branch.organization_id,
            Course.code == payload.code,
        )
    )
    if duplicate is not None:
        raise HTTPException(status_code=409, detail="Course code already exists")
    course = Course(organization_id=branch.organization_id, **payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get(
    "/branches/{branch_id}/batches",
    response_model=list[BatchResponse],
    tags=["batches"],
)
def list_batches(branch_id: int, user: CurrentUser, db: Database) -> list[Batch]:
    require_branch_access(db, user, branch_id)
    return list(
        db.scalars(
            select(Batch).where(
                Batch.branch_id == branch_id, Batch.is_active.is_(True)
            )
        )
    )


@router.post(
    "/branches/{branch_id}/batches",
    response_model=BatchResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["batches"],
)
def create_batch(
    branch_id: int, payload: BatchCreate, user: CurrentUser, db: Database
) -> Batch:
    require_branch_access(db, user, branch_id)
    branch = db.get(Branch, branch_id)
    course = db.get(Course, payload.course_id)
    if branch is None or not branch.is_active:
        raise HTTPException(status_code=404, detail="Branch not found")
    if course is None or course.organization_id != branch.organization_id:
        raise HTTPException(status_code=404, detail="Course not found")
    batch = Batch(branch_id=branch_id, **payload.model_dump())
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch


@router.post(
    "/branches/{branch_id}/enrollments",
    response_model=EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["enrollments"],
)
def create_enrollment(
    branch_id: int, payload: EnrollmentCreate, user: CurrentUser, db: Database
) -> Enrollment:
    require_branch_access(db, user, branch_id)
    student = db.get(Student, payload.student_id)
    batch = db.get(Batch, payload.batch_id)
    if student is None or student.branch_id != branch_id:
        raise HTTPException(status_code=404, detail="Student not found")
    if batch is None or batch.branch_id != branch_id:
        raise HTTPException(status_code=404, detail="Batch not found")
    duplicate = db.scalar(
        select(Enrollment).where(
            Enrollment.student_id == student.id,
            Enrollment.batch_id == batch.id,
            Enrollment.is_active.is_(True),
        )
    )
    if duplicate is not None:
        raise HTTPException(status_code=409, detail="Student is already enrolled")
    enrollment = Enrollment(**payload.model_dump())
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.post(
    "/branches/{branch_id}/attendance",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["attendance"],
)
def record_attendance(
    branch_id: int, payload: AttendanceCreate, user: CurrentUser, db: Database
) -> Attendance:
    require_branch_access(db, user, branch_id)
    enrollment = db.get(Enrollment, payload.enrollment_id)
    if enrollment is None:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    student = db.get(Student, enrollment.student_id)
    batch = db.get(Batch, enrollment.batch_id)
    if student is None or batch is None or batch.branch_id != branch_id:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    duplicate = db.scalar(
        select(Attendance).where(
            Attendance.enrollment_id == payload.enrollment_id,
            Attendance.attended_on == payload.attended_on,
        )
    )
    if duplicate is not None:
        raise HTTPException(status_code=409, detail="Attendance already recorded")
    attendance = Attendance(**payload.model_dump())
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.post(
    "/branches/{branch_id}/payments",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["payments"],
)
def record_payment(
    branch_id: int, payload: PaymentCreate, user: CurrentUser, db: Database
) -> Payment:
    require_branch_access(db, user, branch_id)
    student = db.get(Student, payload.student_id)
    if student is None or student.branch_id != branch_id:
        raise HTTPException(status_code=404, detail="Student not found")
    payment = Payment(**payload.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/branches/{branch_id}/teachers", response_model=list[TeacherResponse], tags=["teachers"])
def list_teachers(branch_id: int, user: CurrentUser, db: Database) -> list[Teacher]:
    require_branch_access(db, user, branch_id)
    return list(db.scalars(select(Teacher).where(Teacher.branch_id == branch_id, Teacher.is_active.is_(True)).order_by(Teacher.full_name)))


@router.post("/branches/{branch_id}/teachers", response_model=TeacherResponse, status_code=201, tags=["teachers"])
def create_teacher(branch_id: int, payload: TeacherCreate, user: CurrentUser, db: Database) -> Teacher:
    require_branch_access(db, user, branch_id)
    if db.get(Branch, branch_id) is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    teacher = Teacher(branch_id=branch_id, **payload.model_dump())
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.get("/branches/{branch_id}/timetable", response_model=list[TimetableResponse], tags=["timetable"])
def list_timetable(branch_id: int, user: CurrentUser, db: Database) -> list[TimetableEntry]:
    require_branch_access(db, user, branch_id)
    return list(db.scalars(select(TimetableEntry).where(TimetableEntry.branch_id == branch_id).order_by(TimetableEntry.weekday, TimetableEntry.starts_at)))


@router.post("/branches/{branch_id}/timetable", response_model=TimetableResponse, status_code=201, tags=["timetable"])
def create_timetable(branch_id: int, payload: TimetableCreate, user: CurrentUser, db: Database) -> TimetableEntry:
    require_branch_access(db, user, branch_id)
    batch = db.get(Batch, payload.batch_id)
    teacher = db.get(Teacher, payload.teacher_id)
    if batch is None or batch.branch_id != branch_id:
        raise HTTPException(status_code=404, detail="Batch not found")
    if teacher is None or teacher.branch_id != branch_id:
        raise HTTPException(status_code=404, detail="Teacher not found")
    if payload.ends_at <= payload.starts_at:
        raise HTTPException(status_code=422, detail="End time must be after start time")
    entry = TimetableEntry(branch_id=branch_id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.post("/branches/{branch_id}/marks", response_model=MarkResponse, status_code=201, tags=["marks"])
def record_mark(branch_id: int, payload: MarkCreate, user: CurrentUser, db: Database) -> Mark:
    require_branch_access(db, user, branch_id)
    student = db.get(Student, payload.student_id)
    batch = db.get(Batch, payload.batch_id)
    if student is None or student.branch_id != branch_id:
        raise HTTPException(status_code=404, detail="Student not found")
    if batch is None or batch.branch_id != branch_id:
        raise HTTPException(status_code=404, detail="Batch not found")
    if payload.obtained_marks > payload.max_marks:
        raise HTTPException(status_code=422, detail="Obtained marks cannot exceed maximum marks")
    mark = Mark(branch_id=branch_id, **payload.model_dump())
    db.add(mark)
    db.commit()
    db.refresh(mark)
    return mark


@router.get("/branches/{branch_id}/marks", response_model=list[MarkResponse], tags=["marks"])
def list_marks(branch_id: int, user: CurrentUser, db: Database) -> list[Mark]:
    require_branch_access(db, user, branch_id)
    return list(db.scalars(select(Mark).where(Mark.branch_id == branch_id).order_by(Mark.graded_at.desc())))


@router.post("/branches/{branch_id}/fee-charges", status_code=201, tags=["fees"])
def create_fee_charge(branch_id: int, payload: FeeChargeCreate, user: CurrentUser, db: Database) -> dict[str, int]:
    require_branch_access(db, user, branch_id)
    student = db.get(Student, payload.student_id)
    if student is None or student.branch_id != branch_id:
        raise HTTPException(status_code=404, detail="Student not found")
    charge = FeeCharge(branch_id=branch_id, **payload.model_dump())
    db.add(charge)
    db.commit()
    db.refresh(charge)
    return {"id": charge.id}


@router.get("/branches/{branch_id}/fee-balances", response_model=list[FeeBalanceResponse], tags=["fees"])
def fee_balances(branch_id: int, user: CurrentUser, db: Database) -> list[FeeBalanceResponse]:
    require_branch_access(db, user, branch_id)
    students = list(db.scalars(select(Student).where(Student.branch_id == branch_id, Student.is_active.is_(True))))
    balances = []
    for student in students:
        due = db.scalar(select(func.coalesce(func.sum(FeeCharge.amount_due), 0)).where(FeeCharge.student_id == student.id))
        paid = db.scalar(select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.student_id == student.id))
        balances.append(FeeBalanceResponse(student_id=student.id, total_due=due, total_paid=paid, outstanding=max(due - paid, 0)))
    return balances
