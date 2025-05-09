import re
from logging import getLogger
from typing import List
from uuid import UUID

from fastapi import HTTPException
from sqlmodel import Session, select, text

from app.models import (
    Grant,
    Rule,
    RuleCondition,
    RuleFilter,
    RulePublic,
    RuleTrigger,
    RuleType,
)
from app.rule_templates import RULE_TEMPLATES

logger = getLogger("uvicorn.error")


def clean(s):
    # Remove invalid characters
    s = re.sub("[^0-9a-zA-Z_]", "", s)

    # Remove multiple underscores
    s = re.sub("_+", "_", s)

    # Remove Dashes
    s = s.replace("-", "_")

    # Remove leading characters until we find a letter or underscore
    s = re.sub("^[^a-zA-Z_]+", "", s)

    # Ensure the string is not empty
    if not s:
        raise ValueError("Generated string is empty after cleaning.")

    return s


class InvalidRule(HTTPException):
    """Exception for invalid rules."""

    def __init__(self, detail=None, headers=None):
        super().__init__(418, detail, headers)


def _generate_trigger_name(rule_id: Rule) -> str:
    """Generate a unique trigger name for a rule."""
    return f"rule_trigger_{clean(rule_id.name)}_{clean(str(rule_id.id)[:8])}"


def _generate_function_name(rule_id: Rule) -> str:
    """Generate a unique function name for a rule."""
    return f"rule_function_{clean(rule_id.name)}_{clean(str(rule_id.id)[:8])}"


def _generate_trigger_function(
    rule: Rule, filters: List[RuleFilter], conditions: List[RuleCondition]
) -> str:
    """
    Generate a PostgreSQL trigger function for a rule.
    Returns the SQL function definition.
    """
    # Start building the function
    function_name = _generate_function_name(rule)
    sql = f"""
    CREATE OR REPLACE FUNCTION {function_name}()
    RETURNS TRIGGER AS $$
    DECLARE
        grant_start_date TIMESTAMP;
        grant_end_date TIMESTAMP;
        grant_total_amount DECIMAL;
        error_message TEXT;
    BEGIN
        -- Get grant information
        SELECT start_date, end_date, total_amount
        INTO grant_start_date, grant_end_date, grant_total_amount
        FROM "grant"
        WHERE id = '{rule.grant_id}';
        
        -- Check filters
    """
    # logger.info(f"Creating trigger function for rule: {rule.name}")
    # logger.info(f"Function name: {function_name}")
    # logger.info(f"sql: {sql}")

    # Add filter checks
    for filter in filters:
        field = filter.field
        operator = filter.operator
        value = filter.value
        # logger.info(f"Filter: {field} {operator} {value}")

        # Handle grant field references
        if value.startswith("grant."):
            grant_field = value.split(".")[1]
            value = f"grant_{grant_field}"

        sql += f"""
        IF NOT (NEW.{field} {operator.value} {value}) THEN
            RETURN NEW;
        END IF;
        """

    # Add condition checks
    if rule.rule_type == RuleType.EXPENSE:
        for condition in conditions:
            field = condition.field
            operator = condition.operator.value
            value = condition.value
            # Handle grant field references
            if value.startswith("grant."):
                grant_field = value.split(".")[1]
                value = f"grant_{grant_field}"

            sql += f"""
            IF NOT (NEW.{field} {operator} {value}) THEN
                RAISE EXCEPTION '{rule.error_message}';
            END IF;
            """
    else:  # BUDGET type rule
        # For budget rules, we need to aggregate existing expenses
        sql += f"""
        IF EXISTS (
            SELECT 1
            FROM (
                SELECT {rule.aggregator}({field}) as total
                FROM grant_expense
                WHERE grant_id = '{rule.grant_id}'
        """

        # Add filter conditions to the aggregation query
        for filter in filters:
            field = filter.field
            operator = filter.operator.value
            value = filter.value

            if value.startswith("grant."):
                grant_field = value.split(".")[1]
                value = f"grant_{grant_field}"

            sql += f" AND {field} {operator} {value}"

        sql += ") as agg"

        # Add condition checks for the aggregated value
        for condition in conditions:
            field = condition.field
            operator = condition.operator.value
            value = condition.value

            if value.startswith("grant."):
                grant_field = value.split(".")[1]
                value = f"grant_{grant_field}"

            sql += f" WHERE agg.total {operator} {value}"

        sql += ") THEN"
        sql += f" RAISE EXCEPTION '{rule.error_message}';"
        sql += " END IF;"

    # End the function
    sql += """
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """

    return sql


def create_trigger(
    session: Session,
    rule: Rule,
    filters: List[RuleFilter],
    conditions: List[RuleCondition],
) -> None:
    """
    Create a PostgreSQL trigger for a rule.
    """
    # Generate function and trigger names
    function_name = _generate_function_name(rule)
    trigger_name = _generate_trigger_name(rule)

    # Generate the trigger function
    function_sql = _generate_trigger_function(rule, filters, conditions)

    # Create the trigger function
    session.exec(text(function_sql))

    # Create the trigger
    trigger_sql = f"""
    DROP TRIGGER IF EXISTS {trigger_name} ON grant_expense;
    CREATE TRIGGER {trigger_name}
        BEFORE INSERT OR UPDATE
        ON grant_expense
        FOR EACH ROW
        EXECUTE FUNCTION {function_name}();
    """
    session.exec(text(trigger_sql))

    # Create the trigger record
    trigger = RuleTrigger(
        rule_id=rule.id, trigger_name=trigger_name, function_name=function_name
    )
    session.add(trigger)
    session.commit()


def _remove_trigger(session: Session, rule_id: UUID) -> None:
    """
    Remove a PostgreSQL trigger for a rule.
    """
    # Get the trigger record
    trigger = session.exec(
        select(RuleTrigger).where(RuleTrigger.rule_id == rule_id)
    ).first()

    if trigger:
        # Drop the trigger
        session.exec(
            text(f"DROP TRIGGER IF EXISTS {trigger.trigger_name} ON grant_expense;")
        )

        # Drop the function
        session.exec(text(f"DROP FUNCTION IF EXISTS {trigger.function_name}();"))

        # Delete the trigger record
        session.delete(trigger)
        session.commit()


async def validate_rule(
    session: Session,
    rule: Rule,
    filters: list[RuleFilter],
    conditions: list[RuleCondition],
) -> bool:
    if rule.rule_type == RuleType.BUDGET and rule.aggregator is None:
        # Need agitator
        raise InvalidRule(detail="Rule of type BUDGET must have aggregator.")

    # Check that grant exists
    grant = session.get(Grant, rule.grant_id)
    if grant is None:
        raise InvalidRule(detail=f"Grant with id: {rule.grant_id} does not exist.")

    # Get filters and conditions
    for f in filters:
        if not hasattr(grant, f.field):
            raise InvalidRule(detail=f"Field: {f.field} does not exist.")
    for c in conditions:
        if not hasattr(grant, c.field):
            raise InvalidRule(detail=f"Field: {c.field} does not exist.")
    return True


async def create_rule_from_template(
    session: Session,
    template_name: str,
    grant_id: UUID,
    user_id: UUID,
    kwargs: dict = {},
) -> RulePublic:
    """
    Create a new rule from a template and set up its PostgreSQL trigger.
    """
    if template_name not in RULE_TEMPLATES:
        raise ValueError(f"Unknown rule template: {template_name}")

    template = RULE_TEMPLATES[template_name]
    logger.info(f"Creating rule from template: {template_name}")
    # Create the rule
    rule = Rule(
        grant_id=grant_id,
        # created_by=user_id,
        name=kwargs.get("name", template["name"]),
        description=kwargs.get("description", template["description"]),
        rule_type=template["rule_type"],
        aggregator=template.get("aggregator"),
        error_message=kwargs.get("error_message", template["error_message"]),
        is_active=True,
    )

    session.add(rule)
    session.commit()
    session.refresh(rule)

    # Create filters
    filters = []
    for filter_data in template.get("filters", []):
        filter = RuleFilter(
            rule_id=rule.id,
            field=filter_data["field"],
            operator=filter_data["operator"],
            value=filter_data["value"],
        )
        session.add(filter)
        filters.append(filter)
    session.commit()

    # Create conditions
    conditions = []
    for condition_data in template.get("conditions", []):
        condition = RuleCondition(
            rule_id=rule.id,
            field=condition_data["field"],
            operator=condition_data["operator"],
            value=condition_data["value"],
            order=condition_data["order"],
        )
        session.add(condition)
        conditions.append(condition)
    session.commit()

    # Create the PostgreSQL trigger
    create_trigger(session, rule, filters, conditions)
    session.refresh(rule)

    return RulePublic(
        conditions=conditions,
        filters=filters,
        **rule.model_dump(),
    )


async def update_rule(
    session: Session, rule_id: UUID, rule_in: RulePublic
) -> RulePublic:
    """
    Update a rule using a RulePublic object and manage its trigger accordingly.
    """
    # Fetch the existing rule
    rule = session.get(Rule, rule_id)
    if not rule:
        raise ValueError(f"Rule not found: {rule_id}")

    # Update the rule fields
    rule_data = rule_in.model_dump(exclude_unset=True)
    for key, value in rule_data.items():
        if key == "filters" or key == "conditions":
            continue
        if key in rule.model_fields.keys():
            setattr(rule, key, value)
    session.add(rule)
    session.commit()
    session.refresh(rule)

    # Update filters
    if "filters" in rule_data:
        # Remove existing filters
        filters = session.exec(select(RuleFilter).where(RuleFilter.rule_id == rule_id))
        for filter in filters:
            session.delete(filter)
        session.commit()

        # Add new filters
        for filter_data in rule_in.filters:
            new_filter = RuleFilter(
                rule_id=rule_id,
                field=filter_data.field,
                operator=filter_data.operator,
                value=filter_data.value,
            )
            session.add(new_filter)

    # Update conditions
    if "conditions" in rule_data:
        # Remove existing conditions

        conditions = session.exec(
            select(RuleCondition).where(RuleCondition.rule_id == rule_id)
        )
        for condition in conditions:
            session.delete(condition)

        session.commit()

        # Add new conditions
        for condition_data in rule_in.conditions:
            new_condition = RuleCondition(
                rule_id=rule_id,
                field=condition_data.field,
                operator=condition_data.operator,
                value=condition_data.value,
                order=condition_data.order,
            )
            session.add(new_condition)

    session.commit()
    session.refresh(rule)

    # Manage triggers based on the rule's active status
    if rule.is_active:
        filters = session.exec(
            select(RuleFilter).where(RuleFilter.rule_id == rule_id)
        ).all()
        conditions = session.exec(
            select(RuleCondition).where(RuleCondition.rule_id == rule_id)
        ).all()
        create_trigger(session, rule, filters, conditions)
    else:
        _remove_trigger(session, rule_id)

    # Return the updated rule as a RulePublic object
    filters = session.exec(
        select(RuleFilter).where(RuleFilter.rule_id == rule_id)
    ).all()
    conditions = session.exec(
        select(RuleCondition).where(RuleCondition.rule_id == rule_id)
    ).all()
    session.refresh(rule)

    return RulePublic(
        **rule.model_dump(),
        filters=filters,
        conditions=conditions,
    )


async def delete_rule(session: Session, rule_id: UUID) -> None:
    """
    Delete a rule and its associated trigger.
    """
    # Remove the trigger first
    _remove_trigger(session, rule_id)

    # Delete the rule
    rule = session.get(Rule, rule_id)
    if rule:
        conditions = session.exec(
            select(RuleCondition).where(RuleCondition.rule_id == rule_id)
        )
        for condition in conditions:
            session.delete(condition)

        filters = session.exec(select(RuleFilter).where(RuleFilter.rule_id == rule_id))
        for filter in filters:
            session.delete(filter)

        session.delete(rule)
        session.commit()


async def get_rule_by_id(session: Session, rule_id: UUID) -> RulePublic:
    """Get a rule by its ID."""
    rule = session.get(Rule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    filters = session.exec(
        select(RuleFilter).where(RuleFilter.rule_id == rule_id)
    ).all()
    conditions = session.exec(
        select(RuleCondition).where(RuleCondition.rule_id == rule_id)
    ).all()
    return RulePublic(
        **rule.model_dump(),
        filters=filters,
        conditions=conditions,
    )


# End
