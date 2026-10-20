from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import get_db
from .models import User, UserBranch, UserRole
from .security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
Database = Annotated[Session, Depends(get_db)]


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Database) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        user_id = decode_access_token(token)
    except (ValueError, TypeError, jwt.InvalidTokenError):
        raise credentials_error from None
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise credentials_error
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_branch_access(db: Session, user: User, branch_id: int) -> None:
    if user.role in (
        UserRole.SUPER_ADMINISTRATOR.value,
        UserRole.ORGANIZATION_ADMINISTRATOR.value,
    ):
        return
    assignment = db.scalar(
        select(UserBranch).where(
            UserBranch.user_id == user.id, UserBranch.branch_id == branch_id
        )
    )
    if assignment is None:
        raise HTTPException(status_code=403, detail="Branch access denied")
