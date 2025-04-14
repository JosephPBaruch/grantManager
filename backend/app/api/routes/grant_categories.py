from logging import getLogger
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from psycopg.errors import DatabaseError
from sqlalchemy.exc import DatabaseError as SQL_ERR
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_superuser
from app.models import GrantCategory, GrantCategoryBase, GrantCategoryPublic, GrantCategoriesPublic

router = APIRouter(prefix="/grant-categories", tags=["Grant Categories"])
logger = getLogger("uvicorn.error")


@router.get("/", response_model=GrantCategoriesPublic)
def read_grant_categories(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    current_user=Depends(get_current_active_superuser),
) -> Any:
    """
    Returns a list of all grant categories.
    """
    count_statement = select(func.count()).select_from(GrantCategory)
    count = session.exec(count_statement).one()

    statement = select(GrantCategory).offset(skip).limit(limit)
    categories = session.exec(statement).all()

    return GrantCategoriesPublic(data=categories, count=count)


@router.post("/", response_model=GrantCategoryPublic)
def create_grant_category(
    *,
    session: SessionDep,
    category_in: GrantCategoryBase,
    current_user=Depends(get_current_active_superuser),
) -> Any:
    """
    Create a new grant category.
    """
    category = GrantCategory.model_validate(category_in)

    try:
        session.add(category)
        session.commit()
        session.refresh(category)
    except SQL_ERR as e:
        driver = e.orig
        if isinstance(driver, DatabaseError):
            logger.error(driver)
            raise HTTPException(
                status_code=409,
                detail=driver.diag.message_primary,
                headers={"pg_code": driver.sqlstate},
            )
    return category


@router.get("/{category_id}", response_model=GrantCategoryPublic)
def read_grant_category(
    *,
    session: SessionDep,
    category_id: str,
    current_user=Depends(get_current_active_superuser),
) -> Any:
    """
    Get grant category by ID.
    """
    category = session.get(GrantCategory, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Grant category not found")
    return category


@router.put("/{category_id}", response_model=GrantCategoryPublic)
def update_grant_category(
    *,
    session: SessionDep,
    category_id: str,
    category_in: GrantCategoryBase,
    current_user=Depends(get_current_active_superuser),
) -> Any:
    """
    Update a grant category.
    """
    category = session.get(GrantCategory, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Grant category not found")

    category_data = category_in.model_dump(exclude_unset=True)
    for key, value in category_data.items():
        setattr(category, key, value)

    try:
        session.add(category)
        session.commit()
        session.refresh(category)
    except SQL_ERR as e:
        driver = e.orig
        if isinstance(driver, DatabaseError):
            logger.error(driver)
            raise HTTPException(
                status_code=409,
                detail=driver.diag.message_primary,
                headers={"pg_code": driver.sqlstate},
            )
    return category


@router.delete("/{category_id}")
def delete_grant_category(
    *,
    session: SessionDep,
    category_id: str,
    current_user=Depends(get_current_active_superuser),
) -> Any:
    """
    Delete a grant category.
    """
    category = session.get(GrantCategory, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Grant category not found")
    session.delete(category)
    session.commit()
    return {"message": "Grant category deleted successfully"} 