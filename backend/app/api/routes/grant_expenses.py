from logging import getLogger
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from psycopg.errors import DatabaseError
from sqlalchemy.exc import DatabaseError as SQL_ERR
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_superuser, get_current_active_user
from app.models import GrantExpense, GrantExpenseBase, GrantExpensePublic, GrantExpensesPublic, Grant

router = APIRouter(prefix="/grant-expenses", tags=["Grant Expenses"])
logger = getLogger("uvicorn.error")


@router.get("/", response_model=GrantExpensesPublic)
def read_grant_expenses(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    current_user=Depends(get_current_active_user),
) -> Any:
    """
    Returns a list of grant expenses. Regular users can only see expenses for their grants,
    superusers can see all expenses.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(GrantExpense)
        statement = select(GrantExpense).offset(skip).limit(limit)
    else:
        # Get expenses for grants owned by the current user
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
def create_grant_expense(
    *,
    session: SessionDep,
    expense_in: GrantExpenseBase,
    current_user=Depends(get_current_active_user),
) -> Any:
    """
    Create a new grant expense.
    """
    # Verify that the user has access to the grant
    grant = session.get(Grant, expense_in.grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    if not current_user.is_superuser and grant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    expense = GrantExpense.model_validate(expense_in)
    expense.created_by = current_user.id

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


@router.get("/{expense_id}", response_model=GrantExpensePublic)
def read_grant_expense(
    *,
    session: SessionDep,
    expense_id: str,
    current_user=Depends(get_current_active_user),
) -> Any:
    """
    Get grant expense by ID.
    """
    expense = session.get(GrantExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Grant expense not found")

    # Verify that the user has access to the grant
    grant = session.get(Grant, expense.grant_id)
    if not current_user.is_superuser and grant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return expense


@router.put("/{expense_id}", response_model=GrantExpensePublic)
def update_grant_expense(
    *,
    session: SessionDep,
    expense_id: str,
    expense_in: GrantExpenseBase,
    current_user=Depends(get_current_active_user),
) -> Any:
    """
    Update a grant expense.
    """
    expense = session.get(GrantExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Grant expense not found")

    # Verify that the user has access to the grant
    grant = session.get(Grant, expense.grant_id)
    if not current_user.is_superuser and grant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    expense_data = expense_in.model_dump(exclude_unset=True)
    for key, value in expense_data.items():
        setattr(expense, key, value)

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
def delete_grant_expense(
    *,
    session: SessionDep,
    expense_id: str,
    current_user=Depends(get_current_active_superuser),
) -> Any:
    """
    Delete a grant expense.
    """
    expense = session.get(GrantExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Grant expense not found")
    session.delete(expense)
    session.commit()
    return {"message": "Grant expense deleted successfully"} 