from logging import getLogger
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from psycopg.errors import DatabaseError
from sqlalchemy.exc import DatabaseError as SQL_ERR
from sqlmodel import func, select

from app.api.deps import (
    CurrentSuperUser,
    CurrentUser,
    GrantPermission,
    GrantPermissionChecker,
    SessionDep,
)
from app.models import Grant, GrantArchive, GrantBase, GrantPublic, GrantsPublic

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
    Returns a list of grants. Regular users can only see their own grants,
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


@router.get("/{grant_id}", response_model=GrantPublic)
def read_grant(
    *,
    session: SessionDep,
    grant_id: Annotated[
        str, Depends(GrantPermissionChecker(GrantPermission.VIEW_GRANT))
    ],
) -> Any:
    """
    Get grant by ID.
    """
    grant = session.get(Grant, grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    return grant


@router.put("/{grant_id}", response_model=GrantPublic)
def update_grant(
    *,
    session: SessionDep,
    grant_id: Annotated[
        str, Depends(GrantPermissionChecker(GrantPermission.MANAGE_GRANT))
    ],
    grant_in: GrantBase,
) -> Any:
    """
    Update a grant.
    """
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
    grant_id: Annotated[
        str, Depends(GrantPermissionChecker(GrantPermission.ARCHIVE_GRANT))
    ],
    current_user: CurrentUser,
) -> Any:
    """
    Archive a grant.
    """
    grant = session.get(Grant, grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    archive = GrantArchive(archived_by=current_user.id, **grant)
    session.add(archive)
    session.commit()
    session.delete(grant)
    session.commit()

    return {"message": "Grant deleted successfully"}


@router.delete("/delete/{grant_id}")
async def delete_grant(
    *, session: SessionDep, grant_id: str, user: CurrentSuperUser
) -> Any:
    """
    Archive a grant.
    """
    grant = session.get(Grant, grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    session.delete(grant)
    session.commit()
    return {"message": "Grant deleted successfully"}
