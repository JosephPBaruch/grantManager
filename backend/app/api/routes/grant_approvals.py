from logging import getLogger
from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException
from psycopg.errors import DatabaseError
from sqlalchemy.exc import DatabaseError as SQL_ERR
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Grant,
    GrantApproval,
    GrantApprovalBase,
    GrantApprovalPublic,
    GrantApprovalsPublic,
    GrantExpense,
    GrantExpensesPublic,
    GrantRole,
)
from app.permissions import GrantPermission, has_grant_permission

router = APIRouter(prefix="/grant-approvals", tags=["Grant Approvals"])
logger = getLogger("uvicorn.error")


@router.post("/pending-expenses", response_model=GrantExpensesPublic)
def get_expenses_without_requests(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Returns a list of expenses that do not have any grant approval requests.
    Regular users can only see expenses for their grants, superusers can see all expenses.
    """

    if current_user.is_superuser:
        statement = (
            select(GrantExpense)
            .join(
                GrantApproval, GrantExpense.id == GrantApproval.expense_id, isouter=True
            )
            .where(GrantApproval.id.is_(None))
            .offset(skip)
            .limit(limit)
        )
    else:
        # Subquery to find grant_ids where the user has the 'approve_expenses' permission
        subquery = (
            select(GrantRole.grant_id)
            .where(GrantRole.user_id == current_user.id)
            .where(GrantRole.permissions.any(GrantPermission.APPROVE_EXPENSES.value))
        )
        # Main query to select expenses belonging to those grants and having no approvals
        statement = (
            select(GrantExpense)
            .join(
                GrantApproval, GrantExpense.id == GrantApproval.expense_id, isouter=True
            )
            .where(GrantExpense.grant_id.in_(subquery))
            .where(GrantApproval.id.is_(None))
            .offset(skip)
            .limit(limit)
        )

    expenses = session.exec(statement).all()
    return GrantExpensesPublic(data=expenses, count=len(expenses))


@router.get("/", response_model=GrantApprovalsPublic)
def read_grant_approvals(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Returns a list of grant approvals. Regular users can only see approvals for
    the grants they have the GrantPermission.APPROVE_EXPENSES on,
    superusers can see all approvals.
    """

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(GrantApproval)
        statement = select(GrantApproval).offset(skip).limit(limit)
    else:
        # Subquery to find grant_ids where the user has the 'APPROVE_EXPENSES' permission
        subquery = (
            select(GrantRole.grant_id)
            .where(GrantRole.user_id == current_user.id)
            .where(GrantRole.permissions.any(GrantPermission.APPROVE_EXPENSES.value))
        )

        # Count statement for approvals in allowed grants
        count_statement = (
            select(func.count())
            .select_from(GrantApproval)
            .join(GrantExpense, GrantApproval.expense_id == GrantExpense.id)
            .where(GrantExpense.grant_id.in_(subquery))
        )

        # Main query to select approvals belonging to those grants
        statement = (
            select(GrantApproval)
            .join(GrantExpense, GrantApproval.expense_id == GrantExpense.id)
            .where(GrantExpense.grant_id.in_(subquery))
            .offset(skip)
            .limit(limit)
        )

    count = session.exec(count_statement).one()
    approvals = session.exec(statement).all()

    return GrantApprovalsPublic(data=approvals, count=count)


@router.post("/", response_model=GrantApprovalPublic)
async def create_grant_approval(
    *,
    session: SessionDep,
    approval_in: GrantApprovalBase,
    current_user: CurrentUser,
) -> Any:
    """
    Create a new grant approval.
    """

    # Validate that the expense exists
    statement = select(GrantExpense).where(GrantExpense.id == approval_in.expense_id)
    selected_expense = session.exec(statement).first()
    if not selected_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # Verify that the expense is not already approved
    existing_approval = session.exec(
        select(GrantApproval).where(GrantApproval.expense_id == approval_in.expense_id)
    ).first()
    if existing_approval:
        raise HTTPException(
            status_code=400, detail="Expense already has an approval request"
        )
    # Verify that the user has permission to approve expenses
    grant_id = selected_expense.grant_id
    permission = await has_grant_permission(
        session=session,
        grant_id=grant_id,
        permission=GrantPermission.APPROVE_EXPENSES,
        user_id=current_user.id,
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    approval = GrantApproval(
        approver_id=current_user.id, **approval_in.model_dump(exclude_unset=True)
    )

    try:
        session.add(approval)
        session.commit()
        session.refresh(approval)
    except SQL_ERR as e:
        driver = e.orig
        if isinstance(driver, DatabaseError):
            logger.error(driver)
            raise HTTPException(
                status_code=409,
                detail=driver.diag.message_primary,
                headers={"pg_code": driver.sqlstate},
            )
    return approval


@router.get("/{approval_id}", response_model=GrantApprovalPublic)
async def read_grant_approval(
    *,
    session: SessionDep,
    approval_id: str,
    current_user: CurrentUser,
) -> Any:
    """
    Get grant approval by ID.
    """
    approval = session.get(GrantApproval, approval_id)
    if not approval:
        raise HTTPException(status_code=404, detail="Grant approval not found")

    expense = session.get(GrantExpense, UUID(approval_id))

    # Verify that the user has access to the grant
    permission = await has_grant_permission(
        session=session,
        grant_id=expense.grant_id,
        permission=GrantPermission.APPROVE_EXPENSES,
        user_id=current_user.id,
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return approval


@router.put("/{approval_id}", response_model=GrantApprovalPublic)
async def update_grant_approval(
    *,
    session: SessionDep,
    approval_id: str,
    approval_in: GrantApprovalBase,
    current_user: CurrentUser,
) -> Any:
    """
    Update a grant approval.
    """
    approval = session.get(GrantApproval, approval_id)
    if not approval:
        raise HTTPException(status_code=404, detail="Grant approval not found")

    expense = session.get(GrantExpense, UUID(approval_id))

    # Verify that the user has access to the grant
    grant = session.get(Grant, expense.grant_id)
    permission = await has_grant_permission(
        session=session,
        grant_id=expense.grant_id,
        permission=GrantPermission.EDIT_EXPENSES,
        user_id=current_user.id,
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if not current_user.is_superuser and grant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    approval_data = approval_in.model_dump(exclude_unset=True)
    for key, value in approval_data.items():
        setattr(approval, key, value)

    try:
        session.add(approval)
        session.commit()
        session.refresh(approval)
    except SQL_ERR as e:
        driver = e.orig
        if isinstance(driver, DatabaseError):
            logger.error(driver)
            raise HTTPException(
                status_code=409,
                detail=driver.diag.message_primary,
                headers={"pg_code": driver.sqlstate},
            )
    return approval


@router.delete("/{approval_id}")
def delete_grant_approval(
    *,
    session: SessionDep,
    approval_id: str,
    current_user: CurrentUser,
) -> Any:
    """
    Delete a grant approval.
    """
    approval = session.get(GrantApproval, approval_id)
    if not approval:
        raise HTTPException(status_code=404, detail="Grant approval not found")
    # Verify that the user has access to the grant
    expense = session.get(GrantExpense, UUID(approval_id))
    grant = session.get(Grant, expense.grant_id)
    if not current_user.is_superuser and grant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    approval = session.get(GrantApproval, approval_id)

    if not approval:
        raise HTTPException(status_code=404, detail="Grant approval not found")
    session.delete(approval)
    session.commit()
    return {"message": "Grant approval deleted successfully"}
