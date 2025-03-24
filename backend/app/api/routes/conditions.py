from typing import Any

from fastapi import APIRouter, Depends
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_superuser
from app.models import Condition, ConditionBase, ConditionsPublic

router = APIRouter(prefix="/rules/conditions", tags=["Conditions"])


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
    session.exec(select())
    session.add(r)
    session.commit()
    session.refresh(r)
    return r
