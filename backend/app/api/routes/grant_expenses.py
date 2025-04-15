from logging import getLogger
from typing import Any

from fastapi import APIRouter, HTTPException
from psycopg.errors import DatabaseError
from sqlalchemy.exc import DatabaseError as SQL_ERR
from sqlmodel import func, select

from app.api.deps import CurrentSuperUser, CurrentUser, SessionDep
from app.models import (
    Grant,
    GrantExpense,
    GrantExpenseBase,
    GrantExpensePublic,
    GrantExpensesPublic,
)
from app.permissions import GrantPermission, has_grant_permission

router = APIRouter(prefix="/grant-expenses", tags=["Grant Expenses"])
logger = getLogger("uvicorn.error")


@router.get("/", response_model=GrantExpensesPublic)
async def read_grant_expenses(
    session: SessionDep,
    current_user: CurrentUser,
    grant_id: str,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Returns a list of grant expenses. Regular users can only see expenses for their grants,
    superusers can see all expenses.
    """
    # Verify that the user has access to the grant
    permission = await has_grant_permission(
        session,
        grant_id=grant_id,
        permission=GrantPermission.VIEW_EXPENSES,
        user_id=current_user.id,
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    count_statement = (
        select(func.count())
        .select_from(GrantExpense)
        .join(Grant, GrantExpense.grant_id == Grant.id)
        .where(Grant.owner_id == current_user.id)
    )
    statement = (
        select(GrantExpense)
        .join(Grant, GrantExpense.grant_id == Grant.id)
        .where(Grant.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    count = session.exec(count_statement).one()
    expenses = session.exec(statement).all()

    return GrantExpensesPublic(data=expenses, count=count)


@router.post("/", response_model=GrantExpensePublic)
async def create_grant_expense(
    *,
    session: SessionDep,
    grant_expense: GrantExpenseBase,
    current_user: CurrentUser,
) -> Any:
    """
    Create a new grant expense.
    """
    # Verify that the user has access to the grant
    grant = session.get(Grant, grant_expense.grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")

    # Check if user has permission to submit expenses
    permission = await has_grant_permission(
        session,
        grant_id=grant_expense.grant_id,
        permission=GrantPermission.SUBMIT_EXPENSES,
        user_id=current_user.id,
    )

    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Create the expense
    expense = GrantExpense(
        created_by=current_user.id, status="pending", **grant_expense.model_dump()
    )
    expense.created_by = current_user.id

    # Invalid Rules will be caught by the trigger, and expense will not be created
    try:
        session.add(expense)
        session.commit()
        session.refresh(expense)
    except SQL_ERR as e:
        driver = e.orig
        if isinstance(driver, DatabaseError):
            logger.error(driver)
            raise HTTPException(
                status_code=409,
                detail=driver.diag.message_primary,
                headers={
                    "pg_code": driver.sqlstate,
                    "detail": driver.diag.message_detail,
                    "primary": driver.diag.message_primary,
                    "hint": driver.diag.message_hint,
                },
            )
    return expense


@router.get("/{expense_id}", response_model=GrantExpensePublic)
async def read_grant_expense(
    *,
    session: SessionDep,
    expense_id: str,
    current_user: CurrentUser,
) -> Any:
    """
    Get grant expense by ID.
    """
    expense = session.get(GrantExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Grant expense not found")

    # Verify that the user has access to the grant
    permission = await has_grant_permission(
        session=session,
        grant_id=expense.grant_id,
        permission=GrantPermission.VIEW_EXPENSES,
        user_id=current_user.id,
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return expense


@router.put("/{expense_id}", response_model=GrantExpensePublic)
async def update_grant_expense(
    *,
    session: SessionDep,
    expense_id: str,
    expense_in: GrantExpenseBase,
    current_user: CurrentUser,
) -> Any:
    """
    Update a grant expense.
    """
    expense = session.get(GrantExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Grant expense not found")

    # Verify that the user has access to the grant
    permission = await has_grant_permission(
        session=session,
        grant_id=expense.grant_id,
        permission=GrantPermission.EDIT_EXPENSES,
        user_id=current_user.id,
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    expense_data = expense_in.model_dump(exclude_unset=True)
    for key, value in expense_data.items():
        setattr(expense, key, value)

    # Invalid Rules will be caught by the trigger, and expense will not be updated
    try:
        session.add(expense)
        session.commit()
        session.refresh(expense)
    except SQL_ERR as e:
        driver = e.orig
        if isinstance(driver, DatabaseError):
            logger.error(driver)
            raise HTTPException(
                status_code=409,
                detail=driver.diag.message_primary,
                headers={"pg_code": driver.sqlstate},
            )
    return expense


@router.delete("/{expense_id}")
async def delete_grant_expense(
    *,
    session: SessionDep,
    expense_id: str,
    current_user: CurrentSuperUser,
) -> Any:
    """
    Delete a grant expense.
    """
    expense = session.get(GrantExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Grant expense not found")
    # Verify that the user has access to the grant
    permission = await has_grant_permission(
        session=session,
        grant_id=expense.grant_id,
        permission=GrantPermission.EDIT_EXPENSES,
        user_id=current_user.id,
    )
    if not permission:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    session.delete(expense)
    session.commit()
    return {"message": "Grant expense deleted successfully"}
