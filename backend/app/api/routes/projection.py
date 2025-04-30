from logging import getLogger
from uuid import UUID

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    ExpenseProjection,
    Grant,
    GrantApproval,
    GrantExpense,
)
from app.permissions import GrantPermission, has_grant_permission

router = APIRouter(prefix="/grant-projection", tags=["Grant Projections"])
logger = getLogger("uvicorn.error")


async def _calculate_approved_grant_expenses(
    session: SessionDep,
    grant_id: UUID,
) -> float:
    """
    Calculate the total expenses for a specific grant.
    """

    statement = (
        select(GrantExpense)
        .join(GrantApproval, GrantExpense.id == GrantApproval.expense_id, isouter=True)
        .where(GrantApproval.id.is_(None))
        .where(GrantExpense.grant_id == grant_id)
    )
    expenses = session.exec(statement).all()
    total_expenses = sum(expense.amount for expense in expenses)
    return total_expenses


async def _calculate_unapproved_grant_expenses(
    session: SessionDep,
    grant_id: UUID,
) -> float:
    """
    Calculate the total expenses for a specific grant.
    """
    statement = (
        select(GrantExpense)
        .join(GrantApproval, GrantExpense.id == GrantApproval.expense_id, isouter=True)
        .where(GrantApproval.id.isnot(None))
        .where(GrantExpense.grant_id == grant_id)
    )
    expenses = session.exec(statement).all()
    total_expenses = sum(expense.amount for expense in expenses)
    return total_expenses


async def _calculate_grant_expense_projection(
    session: SessionDep,
    grant_id: UUID,
) -> ExpenseProjection:
    """
    Calculate the total expenses for a specific grant.
    """
    approved_expenses = await _calculate_approved_grant_expenses(session, grant_id)
    pending_expenses = await _calculate_unapproved_grant_expenses(session, grant_id)
    grant_total_funds = session.exec(
        select(Grant.total_amount).where(Grant.id == grant_id)
    ).first()
    if not grant_total_funds:
        raise HTTPException(status_code=404, detail="Grant not found")
    projection = ExpenseProjection(
        grant_id=grant_id,
        grant_total_funds=grant_total_funds,
        existing_expense_amount=approved_expenses,
        projected_expense_amount=pending_expenses,
        grant_projected_remaining_funds=grant_total_funds
        - (approved_expenses + pending_expenses),
        grant_current_remaining_funds=grant_total_funds - approved_expenses,
    )
    return projection


@router.get("/{grant_id}", response_model=ExpenseProjection)
async def get_projection(
    session: SessionDep,
    current_user: CurrentUser,
    grant_id: str,
) -> ExpenseProjection:
    """Return ExpenseProjection for a specific grant."""

    if current_user.is_superuser:
        return await _calculate_grant_expense_projection(
            session=session, grant_id=UUID(grant_id)
        )

    # Check if the user has permission to view the grant
    permission = await has_grant_permission(
        session=session,
        grant_id=UUID(grant_id),
        permission=GrantPermission.VIEW_EXPENSES,
        user_id=current_user.id,
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return await _calculate_grant_expense_projection(
        session=session, grant_id=UUID(grant_id)
    )


# End
