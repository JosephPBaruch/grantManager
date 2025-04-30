import asyncio
import logging
from collections.abc import Generator
from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError
from sqlmodel import Session

from app.core import security
from app.core.config import settings
from app.core.db import engine
from app.models import GrantPermission, TokenPayload, User
from app.permissions import has_grant_permission

logger = logging.getLogger("uvicorn.error")

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


class Transaction:
    def __init__(self, session: Annotated[Session, Depends(get_db)]):
        self.session = session

    def __enter__(self):
        return self.session

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            # rollback and let the exception propagate
            self.session.rollback()
            return False

        self.session.commit()
        return True


def get_session(
    trans: Annotated[Transaction, Depends(Transaction)],
) -> Generator[Session, None, None]:
    with trans as t:
        yield t


SessionDep = Annotated[Session, Depends(get_session)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except ValidationError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = session.get(User, token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user


CurrentSuperUser = Annotated[User, Depends(get_current_active_superuser)]


class GrantPermissionChecker:
    """
    Check if the current user has a specific permission for a grant.
    Raises HTTPException if the user doesn't have the permission.
    """

    def __init__(self, permission: GrantPermission):
        self.permission = permission

    def __call__(self, session: SessionDep, grant_id: str, current_user: CurrentUser):
        """
        Check if the current user has a specific permission for a grant.
        Raises HTTPException if the user doesn't have the permission.
        """
        logger.info(
            f"Checking permission {self.permission} for user {current_user.id} on grant {grant_id}"
        )
        logger.info(f"Grant ID: {grant_id}, type: {type(grant_id)}")
        has_permission = asyncio.run(
            has_grant_permission(
                session, current_user.id, UUID(grant_id), self.permission
            )
        )

        if not has_permission:
            raise HTTPException(
                status_code=403,
                detail=f"User does not have permission: {self.permission}",
            )

        return grant_id
