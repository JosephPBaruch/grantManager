from logging import getLogger
from typing import Any, List

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentSuperUser, CurrentUser, SessionDep
from app.models import (
    Grant,
    GrantPermission,
    Rule,
    RuleCondition,
    RuleCreate,
    RuleFilter,
    RulePublic,
    RulesPublic,
)
from app.permissions import has_grant_permission
from app.rule_templates import RULE_TEMPLATES
from app.rules import InvalidRule, create_rule_from_template, validate_rule

router = APIRouter(prefix="/rules", tags=["Rules"])
logger = getLogger("uvicorn.error")


@router.get(
    "/",
    response_model=RulesPublic,
)
def read_rules(
    session: SessionDep, _: CurrentSuperUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Returns a list of all the current rules in the database.
    """

    count_statement = select(func.count()).select_from(Rule)
    count = session.exec(count_statement).one()

    statement = select(Rule).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return RulesPublic(data=users, count=count)


@router.post("/", response_model=RulePublic)
async def create_rule(
    *,
    session: SessionDep,
    rule_create: RuleCreate,
    current_user: CurrentUser,
) -> Rule:
    rule = Rule(
        grant_id=rule_create.grant_id,
        created_by=current_user.id,
        name=rule_create.name,
        description=rule_create.description,
        rule_type=rule_create.rule_type,
        aggregator=rule_create.aggregator,
        error_message=rule_create.error_message,
        is_active=rule_create.is_active,
    )
    # Check that grant exists
    grant = session.get(Grant, rule.grant_id)
    if grant is None:
        raise InvalidRule(detail=f"Grant with id: {rule.grant_id} does not exist.")

    # Create the rule
    session.add(rule)
    session.commit()
    session.refresh(rule)

    # Create filters
    filters = []
    for filter_data in rule_create.filters:
        filter = RuleFilter(
            rule_id=rule.id,
            field=filter_data.field,
            operator=filter_data.operator,
            value=filter_data.value,
        )
        session.add(filter)
        filters.append(filter)
    session.commit()

    # Create conditions
    conditions = []
    for condition_data in rule_create.conditions:
        condition = RuleCondition(
            rule_id=rule.id,
            field=condition_data.field,
            operator=condition_data.operator,
            value=condition_data.value,
            order=condition_data.order,
        )
        session.add(condition)
        conditions.append(condition)
    session.commit()
    # Validate rule
    await validate_rule(session, rule, filters, conditions)

    return rule


@router.get("/grant/{grant_id}", response_model=RulesPublic)
async def read_grant_rules(
    session: SessionDep, grant_id: str, current_user: CurrentUser
) -> Any:
    """
    Get all rules for a specific grant.
    Only users with CREATE_RULES permission can view rules.
    """
    # Verify that the user has access to the grant
    permission = await has_grant_permission(
        session, str(grant_id), GrantPermission.CREATE_RULES, current_user
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    statement = select(Rule).where(Rule.grant_id == grant_id)
    rules = session.exec(statement).all()
    count = len(rules)

    return RulesPublic(data=rules, count=count)


@router.get("/templates", response_model=List[str])
async def get_rule_templates() -> Any:
    """
    Get a list of available rule templates.
    """
    return list(RULE_TEMPLATES.keys())


@router.post("/grant/{grant_id}/template/{template_name}", response_model=RulePublic)
async def create_rule_from_template_endpoint(
    session: SessionDep,
    grant_id: str,
    template_name: str,
    current_user: CurrentUser,
    **kwargs: Any,
) -> Any:
    """
    Create a new rule from a template.
    Only users with CREATE_RULES permission can create rules.
    """
    # Verify that the user has access to the grant
    permission = await has_grant_permission(
        session, str(grant_id), GrantPermission.CREATE_RULES, current_user
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    try:
        rule = await create_rule_from_template(
            session, template_name, grant_id, current_user.id, **kwargs
        )
        return rule
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/grant/{grant_id}", response_model=RulePublic)
async def create_custom_rule(
    session: SessionDep, grant_id: str, rule_in: RulePublic, current_user: CurrentUser
) -> Any:
    """
    Create a custom rule.
    Only users with CREATE_RULES permission can create rules.
    """
    permission = await has_grant_permission(
        session, str(grant_id), GrantPermission.CREATE_RULES, current_user
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    rule = Rule.model_validate(rule_in)
    rule.grant_id = grant_id
    rule.created_by = current_user.id

    session.add(rule)
    session.commit()
    session.refresh(rule)

    return rule


@router.put("/{rule_id}", response_model=RulePublic)
async def update_rule(
    session: SessionDep, rule_id: str, rule_in: RulePublic, current_user: CurrentUser
) -> Any:
    """
    Update a rule.
    Only users with CREATE_RULES permission can update rules.
    """

    rule = session.get(Rule, rule_id)

    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    permission = await has_grant_permission(
        session, str(rule.grant_id), GrantPermission.CREATE_RULES, current_user
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    rule_data = rule_in.model_dump(exclude_unset=True)
    for key, value in rule_data.items():
        setattr(rule, key, value)

    session.add(rule)
    session.commit()
    session.refresh(rule)

    return rule


@router.delete("/{rule_id}")
async def delete_rule(
    session: SessionDep, rule_id: str, current_user: CurrentUser
) -> Any:
    """
    Delete a rule.
    Only users with CREATE_RULES permission can delete rules.
    """
    rule = session.get(Rule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    permission = await has_grant_permission(
        session, str(rule.grant_id), GrantPermission.CREATE_RULES, current_user
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    session.delete(rule)
    session.commit()
    return {"message": "Rule deleted successfully"}


# END
