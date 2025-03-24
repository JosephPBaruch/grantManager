from logging import getLogger
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from psycopg.errors import DatabaseError
from sqlalchemy.exc import DatabaseError as SQL_ERR
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_superuser
from app.models import Condition, ConditionBase, ConditionsPublic

router = APIRouter(prefix="/rules/conditions", tags=["Conditions"])
logger = getLogger("uvicorn.error")


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=ConditionsPublic,
)
def read_conditions(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Returns a list of all the current conditions in the database.
    """

    count_statement = select(func.count()).select_from(Condition)
    count = session.exec(count_statement).one()

    statement = select(Condition).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return ConditionsPublic(data=users, count=count)


@router.post("/", response_model=ConditionsPublic)
def create_condition(*, session: SessionDep, condition: ConditionBase) -> Condition:
    r = Condition.model_validate(condition)
    try:
        session.add(r)
        session.commit()
        session.refresh(r)
    except SQL_ERR as e:
        driver = e.orig
        if isinstance(driver, DatabaseError):
            logger.error(driver)
            raise HTTPException(
                status_code=409,
                detail=driver.diag.message_primary,
                headers={
                    "pg_code": driver.sqlstate,
                    "detail": driver.diag.message_detail,
                    "primary": driver.diag.message_primary,
                    "hint": driver.diag.message_hint,
                },
            )
    return r
