from logging import getLogger
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from psycopg.errors import DatabaseError
from sqlalchemy.exc import DatabaseError as SQL_ERR
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_superuser, get_current_active_user
from app.models import Grant, GrantBase, GrantPublic, GrantsPublic

router = APIRouter(prefix="/grants", tags=["Grants"])
logger = getLogger("uvicorn.error")


@router.get("/", response_model=GrantsPublic)
def read_grants(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    current_user=Depends(get_current_active_user),
) -> Any:
    """
    Returns a list of grants. Regular users can only see their own grants,
    superusers can see all grants.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Grant)
        statement = select(Grant).offset(skip).limit(limit)
    else:
        count_statement = select(func.count()).select_from(Grant).where(Grant.owner_id == current_user.id)
        statement = select(Grant).where(Grant.owner_id == current_user.id).offset(skip).limit(limit)

    count = session.exec(count_statement).one()
    grants = session.exec(statement).all()

    return GrantsPublic(data=grants, count=count)


@router.post("/", response_model=GrantPublic)
def create_grant(
    *,
    session: SessionDep,
    grant_in: GrantBase,
    current_user=Depends(get_current_active_user),
) -> Any:
    """
    Create a new grant.
    """
    grant = Grant.model_validate(grant_in)
    grant.owner_id = current_user.id

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
    grant_id: str,
    current_user=Depends(get_current_active_user),
) -> Any:
    """
    Get grant by ID.
    """
    grant = session.get(Grant, grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    if not current_user.is_superuser and grant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return grant


@router.put("/{grant_id}", response_model=GrantPublic)
def update_grant(
    *,
    session: SessionDep,
    grant_id: str,
    grant_in: GrantBase,
    current_user=Depends(get_current_active_user),
) -> Any:
    """
    Update a grant.
    """
    grant = session.get(Grant, grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    if not current_user.is_superuser and grant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

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
def delete_grant(
    *,
    session: SessionDep,
    grant_id: str,
    current_user=Depends(get_current_active_superuser),
) -> Any:
    """
    Delete a grant.
    """
    grant = session.get(Grant, grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    session.delete(grant)
    session.commit()
    return {"message": "Grant deleted successfully"} 