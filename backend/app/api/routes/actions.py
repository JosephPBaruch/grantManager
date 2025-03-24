from typing import Any

from fastapi import APIRouter, Depends
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_superuser
from app.models import Action, ActionBase, ActionsPublic

router = APIRouter(prefix="/rules/actions", tags=["Actions"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=ActionsPublic,
)
def read_actions(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Returns a list of all the current actions in the database.
    """

    count_statement = select(func.count()).select_from(Action)
    count = session.exec(count_statement).one()

    statement = select(Action).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return ActionsPublic(data=users, count=count)


@router.post("/", response_model=ActionsPublic)
def create_action(*, session: SessionDep, rule_create: ActionBase) -> Action:
    r = Action.model_validate(rule_create)
    session.exec(select())
    session.add(r)
    session.commit()
    session.refresh(r)
    return r
