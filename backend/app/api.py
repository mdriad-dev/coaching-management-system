from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from .dependencies import CurrentUser, Database, require_branch_access
from .models import Branch, Student, User
from .schemas import (
    BranchResponse,
    LoginRequest,
    StudentCreate,
    StudentResponse,
    TokenResponse,
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
