from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from psycopg2.errors import lookup
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_superuser
from app.models import Budget, BudgetBase, BudgetsPublic

router = APIRouter(prefix="/budget", tags=["Budgets"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=BudgetsPublic,
)
def read_budget(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Returns a list of all the current budgets in the database.
    """

    count_statement = select(func.count()).select_from(Budget)
    count = session.exec(count_statement).one()

    statement = select(Budget).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return BudgetsPublic(data=users, count=count)


@router.post("/", response_model=BudgetsPublic)
def create_budget(*, session: SessionDep, rule_create: BudgetBase) -> Budget:
    r = Budget.model_validate(rule_create)
    try:
        session.exec(select())
        session.add(r)
        session.commit()
        session.refresh(r)
    except lookup("RSERR") as E:
        raise HTTPException(status_code=409, detail=E.pgcode)
    return r
