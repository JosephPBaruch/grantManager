import asyncio
from logging import getLogger
from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException
from psycopg.errors import DatabaseError
from sqlalchemy.exc import DatabaseError as SQL_ERR
from sqlmodel import func, select

from app.api.deps import (
    CurrentUser,
    GrantPermission,
    SessionDep,
)
from app.models import (
    Grant,
    GrantBase,
    GrantPublic,
    GrantRole,
    GrantRoleType,
    GrantsPublic,
    GrantUpdate,  # Import the new model
)
from app.permissions import DEFAULT_ROLE_PERMISSIONS, has_grant_permission

router = APIRouter(prefix="/grants", tags=["Grants"])
logger = getLogger("uvicorn.error")


@router.get("/", response_model=GrantsPublic)
def read_grants(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Returns a list of grants. Regular users can only see the grants they own or have access to,
    superusers can see all grants.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Grant)
        statement = select(Grant).offset(skip).limit(limit)
    else:
        count_statement = (
            select(func.count())
            .select_from(Grant)
            .where(Grant.owner_id == current_user.id)
        )
        statement = (
            select(Grant)
            .where(Grant.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )

    count = session.exec(count_statement).one()
    grants = session.exec(statement).all()

    return GrantsPublic(data=grants, count=count)


@router.post("/", response_model=GrantPublic)
def create_grant(
    *,
    session: SessionDep,
    grant_in: GrantBase,
    current_user: CurrentUser,
) -> Any:
    """
    Create a new grant.
    """
    grant = Grant(owner_id=current_user.id, **grant_in.model_dump())
    # Add default role for the grant
    grant_role = GrantRole(
        grant_id=grant.id,
        role_type=GrantRoleType.OWNER,
        user_id=current_user.id,
        permissions=DEFAULT_ROLE_PERMISSIONS[GrantRoleType.OWNER],
    )
    try:
        session.add(grant)
        session.add(grant_role)
        session.commit()
        session.refresh(grant)
        session.refresh(grant_role)
    except SQL_ERR as e:
        driver = e.orig
        if isinstance(driver, DatabaseError):
            logger.error(driver)
            raise HTTPException(
                status_code=409,
                detail=driver.diag.message_primary,
                headers={"pg_code": driver.sqlstate},
            )
    return grant


@router.get("/{grant_id}", response_model=GrantPublic)
def read_grant(
    *,
    session: SessionDep,
    grant_id: str,
    current_user: CurrentUser,
) -> Any:
    """
    Get grant by ID.
    """
    # Verify that the user has access to the grant
    permission = asyncio.run(
        has_grant_permission(
            session=session,
            user_id=current_user.id,
            grant_id=UUID(grant_id),
            permission=GrantPermission.VIEW_GRANT,
        )
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    grant = session.get(Grant, grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    return grant


@router.patch("/{grant_id}", response_model=GrantPublic)
def update_grant(
    *,
    session: SessionDep,
    grant_id: str,
    current_user: CurrentUser,
    grant_in: GrantUpdate,
) -> Any:
    """
    Update a grant.
    """
    permission = asyncio.run(
        has_grant_permission(
            session=session,
            user_id=current_user.id,
            grant_id=UUID(grant_id),
            permission=GrantPermission.EDIT_GRANT,
        )
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    grant = session.get(Grant, grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")

    grant_data = grant_in.model_dump(exclude_unset=True)
    for key, value in grant_data.items():
        setattr(grant, key, value)

    try:
        session.add(grant)
        session.commit()
        session.refresh(grant)
    except SQL_ERR as e:
        driver = e.orig
        if isinstance(driver, DatabaseError):
            logger.error(driver)
            raise HTTPException(
                status_code=409,
                detail=driver.diag.message_primary,
                headers={"pg_code": driver.sqlstate},
            )
    return grant


@router.delete("/{grant_id}")
async def archive_grant(
    *,
    session: SessionDep,
    grant_id: str,
    current_user: CurrentUser,
) -> Any:
    """
    Archive a grant.
    """

    permission = asyncio.run(
        has_grant_permission(
            session=session,
            user_id=current_user.id,
            grant_id=UUID(grant_id),
            permission=GrantPermission.ARCHIVE_GRANT,
        )
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    grant = session.get(Grant, grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    grant.status = "archived"
    session.add(grant)
    session.commit()
    session.refresh(grant)

    return {"message": "Grant Archived successfully"}


# @router.delete("/delete/{grant_id}")
# async def delete_grant(
#     *, session: SessionDep, grant_id: str, user: CurrentSuperUser
# ) -> Any:
#     """
#     Archive a grant.
#     """
#     grant = session.get(Grant, grant_id)
#     if not grant:
#         raise HTTPException(status_code=404, detail="Grant not found")
#     session.delete(grant)
#     session.commit()
#     return {"message": "Grant deleted successfully"}
