from logging import getLogger
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from psycopg.errors import DatabaseError
from sqlalchemy.exc import DatabaseError as SQL_ERR
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_superuser, get_current_active_user
from app.models import (
    GrantApproval,
    GrantApprovalBase,
    GrantApprovalPublic,
    GrantApprovalsPublic,
    Grant,
    GrantExpense,
)

router = APIRouter(prefix="/grant-approvals", tags=["Grant Approvals"])
logger = getLogger("uvicorn.error")


@router.get("/", response_model=GrantApprovalsPublic)
def read_grant_approvals(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    current_user=Depends(get_current_active_user),
) -> Any:
    """
    Returns a list of grant approvals. Regular users can only see approvals for their grants,
    superusers can see all approvals.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(GrantApproval)
        statement = select(GrantApproval).offset(skip).limit(limit)
    else:
        # Get approvals for grants owned by the current user
        count_statement = (
            select(func.count())
            .select_from(GrantApproval)
            .join(Grant, GrantApproval.grant_id == Grant.id)
            .where(Grant.owner_id == current_user.id)
        )
        statement = (
            select(GrantApproval)
            .join(Grant, GrantApproval.grant_id == Grant.id)
            .where(Grant.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )

    count = session.exec(count_statement).one()
    approvals = session.exec(statement).all()

    return GrantApprovalsPublic(data=approvals, count=count)


@router.post("/", response_model=GrantApprovalPublic)
def create_grant_approval(
    *,
    session: SessionDep,
    approval_in: GrantApprovalBase,
    current_user=Depends(get_current_active_user),
) -> Any:
    """
    Create a new grant approval.
    """
    # Verify that the user has access to the grant
    grant = session.get(Grant, approval_in.grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")

    # If there's an expense, verify it belongs to the grant
    if approval_in.expense_id:
        expense = session.get(GrantExpense, approval_in.expense_id)
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        if expense.grant_id != grant.id:
            raise HTTPException(status_code=400, detail="Expense does not belong to the grant")

    approval = GrantApproval.model_validate(approval_in)
    approval.approver_id = current_user.id

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
def read_grant_approval(
    *,
    session: SessionDep,
    approval_id: str,
    current_user=Depends(get_current_active_user),
) -> Any:
    """
    Get grant approval by ID.
    """
    approval = session.get(GrantApproval, approval_id)
    if not approval:
        raise HTTPException(status_code=404, detail="Grant approval not found")

    # Verify that the user has access to the grant
    grant = session.get(Grant, approval.grant_id)
    if not current_user.is_superuser and grant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return approval


@router.put("/{approval_id}", response_model=GrantApprovalPublic)
def update_grant_approval(
    *,
    session: SessionDep,
    approval_id: str,
    approval_in: GrantApprovalBase,
    current_user=Depends(get_current_active_user),
) -> Any:
    """
    Update a grant approval.
    """
    approval = session.get(GrantApproval, approval_id)
    if not approval:
        raise HTTPException(status_code=404, detail="Grant approval not found")

    # Verify that the user has access to the grant
    grant = session.get(Grant, approval.grant_id)
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
    current_user=Depends(get_current_active_superuser),
) -> Any:
    """
    Delete a grant approval.
    """
    approval = session.get(GrantApproval, approval_id)
    if not approval:
        raise HTTPException(status_code=404, detail="Grant approval not found")
    session.delete(approval)
    session.commit()
    return {"message": "Grant approval deleted successfully"} 