from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep, TableNamesDep, get_current_active_superuser
from app.models import Rule, RuleCreate, RulePublic, RulesPublic

router = APIRouter(prefix="/rules", tags=["Rules"])


@router.get("/")
async def get_rules(session: SessionDep):
    ""
    rules = session.exec(select(Rule)).all()
    return rules


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=RulesPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Returns a list of all the current rules in the database.
    """

    count_statement = select(func.count()).select_from(Rule)
    count = session.exec(count_statement).one()

    statement = select(Rule).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return RulesPublic(data=users, count=count)


@router.post("/", response_model=RulePublic)
def create_rule(
    *, session: SessionDep, table_names: TableNamesDep, rule_create: RuleCreate
) -> Rule:
    r = Rule.model_validate(rule_create, update={"Trigger": ""})
    if r.Table not in table_names:
        raise HTTPException(
            status_code=400,
            detail=f"The Table must exist in the database. Valid tables: {table_names}",
        )
    session.exec(select())
    session.add(r)
    session.commit()
    session.refresh(r)
    return r


# END
