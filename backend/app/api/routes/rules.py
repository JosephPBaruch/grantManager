import uuid
from logging import getLogger
from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
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
from app.permissions import get_user_grants_with_permission, has_grant_permission
from app.rule_templates import RULE_TEMPLATES
from app.rules import (
    InvalidRule,
    create_rule_from_template,
    create_trigger,
    delete_rule,
    get_rule_by_id,
    update_rule,
    validate_rule,
)

router = APIRouter(prefix="/rules", tags=["Rules"])
logger = getLogger("uvicorn.error")


@router.get(
    "/",
    response_model=RulesPublic,
)
async def read_rules(
    session: SessionDep, user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Returns a list of all the current rules in the database.
    """
    if user.is_superuser:
        count_statement = select(func.count()).select_from(Rule)
        count = session.exec(count_statement).one()

        statement = select(Rule.id).offset(skip).limit(limit)
        rules = session.exec(statement).all()
        rules = [await get_rule_by_id(session, rule_id) for rule_id in rules]

        return RulesPublic(data=rules, count=count)
    else:
        grants: List[UUID] = await get_user_grants_with_permission(
            session=session, user_id=user.id, permission=GrantPermission.CREATE_RULES
        )
        count_statement = select(func.count()).select_from(Rule)
        count = session.exec(count_statement).one()

        statement = (
            select(Rule).where(Rule.grant_id in grants).offset(skip).limit(limit)
        )
        rules = session.exec(statement).all()
        rules = [await get_rule_by_id(session, rule_id) for rule_id in rules]
        return RulesPublic(data=rules, count=count)


@router.post("/", response_model=RulePublic)
async def create_rule(
    *,
    session: SessionDep,
    rule_create: RuleCreate,
    current_user: CurrentUser,
    grant_id: str,
) -> Rule:
    # Verify that the user has access to the grant
    permission = await has_grant_permission(
        session=session,
        grant_id=uuid.UUID(grant_id),
        permission=GrantPermission.CREATE_RULES,
        user_id=current_user.id,
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

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
    # Create the PostgreSQL trigger
    create_trigger(session, rule, filters, conditions)
    session.refresh(rule)
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
        session=session,
        user_id=current_user.id,
        grant_id=grant_id,
        permission=GrantPermission.CREATE_RULES,
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # statement = select(Rule).where(Rule.grant_id == grant_id)
    statement = (
        select(Rule).where(Rule.grant_id == grant_id).order_by(Rule.created_at.desc())
    )
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
    kwargs: dict[str, Any] = dict(),
) -> Any:
    """
    Create a new rule from a template.
    Only users with CREATE_RULES permission can create rules.
    """
    # Verify that the user has access to the grant
    permission = await has_grant_permission(
        session=session,
        grant_id=grant_id,
        permission=GrantPermission.CREATE_RULES,
        user_id=current_user.id,
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    try:
        rule = await create_rule_from_template(
            session, template_name, uuid.UUID(grant_id), current_user.id, kwargs
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
        session=session,
        grant_id=grant_id,
        permission=GrantPermission.CREATE_RULES,
        user_id=current_user.id,
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
async def update_rule_route(
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
        session=session,
        grant_id=rule.grant_id,
        permission=GrantPermission.CREATE_RULES,
        user_id=current_user.id,
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    ret = await update_rule(
        session=session,
        rule_id=rule_id,
        rule_in=rule_in,
    )

    return ret


@router.delete("/{rule_id}")
async def delete_rule_route(
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
        session=session,
        grant_id=rule.grant_id,
        permission=GrantPermission.CREATE_RULES,
        user_id=current_user.id,
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    await delete_rule(session, rule_id)
    session.commit()
    return {"message": "Rule deleted successfully"}


# END
