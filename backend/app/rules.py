from typing import List
from uuid import UUID

from fastapi import HTTPException
from sqlmodel import Session, select, text

from app.models import Grant, Rule, RuleCondition, RuleFilter, RuleTrigger, RuleType
from app.rule_templates import RULE_TEMPLATES


class InvalidRule(HTTPException):
    """Exception for invalid rules."""

    def __init__(self, detail=None, headers=None):
        super().__init__(418, detail, headers)


def _generate_trigger_name(rule_id: UUID) -> str:
    """Generate a unique trigger name for a rule."""
    return f"rule_trigger_{rule_id}"


def _generate_function_name(rule_id: UUID) -> str:
    """Generate a unique function name for a rule."""
    return f"rule_function_{rule_id}"


def _generate_trigger_function(
    rule: Rule, filters: List[RuleFilter], conditions: List[RuleCondition]
) -> str:
    """
    Generate a PostgreSQL trigger function for a rule.
    Returns the SQL function definition.
    """
    # Start building the function
    function_name = _generate_function_name(rule.id)
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

    # Add filter checks
    for filter in filters:
        field = filter.field
        operator = filter.operator
        value = filter.value

        # Handle grant field references
        if value.startswith("grant."):
            grant_field = value.split(".")[1]
            value = f"grant_{grant_field}"

        sql += f"""
        IF NOT (NEW.{field} {operator} {value}) THEN
            RETURN NEW;
        END IF;
        """

    # Add condition checks
    if rule.rule_type == RuleType.EXPENSE:
        for condition in conditions:
            field = condition.field
            operator = condition.operator
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
            operator = filter.operator
            value = filter.value

            if value.startswith("grant."):
                grant_field = value.split(".")[1]
                value = f"grant_{grant_field}"

            sql += f" AND {field} {operator} {value}"

        sql += ") as agg"

        # Add condition checks for the aggregated value
        for condition in conditions:
            field = condition.field
            operator = condition.operator
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


def _create_trigger(
    session: Session,
    rule: Rule,
    filters: List[RuleFilter],
    conditions: List[RuleCondition],
) -> None:
    """
    Create a PostgreSQL trigger for a rule.
    """
    # Generate function and trigger names
    function_name = _generate_function_name(rule.id)
    trigger_name = _generate_trigger_name(rule.id)

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
    session: Session, template_name: str, grant_id: UUID, user_id: UUID, **kwargs
) -> Rule:
    """
    Create a new rule from a template and set up its PostgreSQL trigger.
    """
    if template_name not in RULE_TEMPLATES:
        raise ValueError(f"Unknown rule template: {template_name}")

    template = RULE_TEMPLATES[template_name]

    # Create the rule
    rule = Rule(
        grant_id=grant_id,
        created_by=user_id,
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
    _create_trigger(session, rule, filters, conditions)

    return rule


async def update_rule(session: Session, rule_id: UUID, is_active: bool) -> Rule:
    """
    Update a rule's active status and manage its trigger accordingly.
    """
    rule = session.get(Rule, rule_id)
    if not rule:
        raise ValueError(f"Rule not found: {rule_id}")

    if rule.is_active != is_active:
        rule.is_active = is_active
        session.commit()

        if is_active:
            # Get filters and conditions
            filters = session.exec(
                select(RuleFilter).where(RuleFilter.rule_id == rule_id)
            ).all()

            conditions = session.exec(
                select(RuleCondition).where(RuleCondition.rule_id == rule_id)
            ).all()

            # Create the trigger
            _create_trigger(session, rule, filters, conditions)
        else:
            # Remove the trigger
            _remove_trigger(session, rule_id)

    return rule


async def delete_rule(session: Session, rule_id: UUID) -> None:
    """
    Delete a rule and its associated trigger.
    """
    # Remove the trigger first
    _remove_trigger(session, rule_id)

    # Delete the rule
    rule = session.get(Rule, rule_id)
    if rule:
        session.delete(rule)
        session.commit()
