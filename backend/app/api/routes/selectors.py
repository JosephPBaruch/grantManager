from typing import Any

from fastapi import APIRouter, Depends
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_superuser
from app.models import Selectors, SelectorsBase, SelectorsPublic

router = APIRouter(prefix="/rules/selectors", tags=["Selectors"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=SelectorsPublic,
)
def read_selectors(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Returns a list of all the current selectors in the database.
    """

    count_statement = select(func.count()).select_from(Selectors)
    count = session.exec(count_statement).one()

    statement = select(Selectors).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return SelectorsPublic(data=users, count=count)


@router.post("/", response_model=SelectorsPublic)
def create_selector(*, session: SessionDep, rule_create: SelectorsBase) -> Selectors:
    r = Selectors.model_validate(rule_create)
    session.exec(select())
    session.add(r)
    session.commit()
    session.refresh(r)
    return r
