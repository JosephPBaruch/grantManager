from logging import getLogger
from typing import Any

from fastapi import APIRouter, HTTPException
from psycopg.errors import DatabaseError
from sqlalchemy.exc import DatabaseError as SQL_ERR
from sqlalchemy.exc import DBAPIError
from sqlmodel import func, select

from app.api.deps import CurrentSuperUser, CurrentUser, SessionDep
from app.models import (
    Grant,
    GrantCategory,
    GrantExpense,
    GrantExpenseBase,
    GrantExpensePublic,
    GrantExpensesPublic,
)
from app.permissions import GrantPermission, GrantRole, has_grant_permission

router = APIRouter(prefix="/grant-expenses", tags=["Grant Expenses"])
logger = getLogger("uvicorn.error")


@router.get("/", response_model=GrantExpensesPublic)
async def read_grant_expenses(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Returns a list of grant expenses. Regular users can only see expenses for the grants,
    that they have the GrantPermission.VIEW_EXPENSES on, while
    superusers can see all expenses.
    """
    count_statement: Any  # Define type hint for count_statement
    statement: Any  # Define type hint for statement

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(GrantExpense)
        statement = select(GrantExpense).offset(skip).limit(limit)
    else:
        # Subquery to find grant_ids where the user has the 'VIEW_EXPENSES' permission
        subquery = (
            select(GrantRole.grant_id)
            .where(GrantRole.user_id == current_user.id)
            .where(
                GrantRole.permissions.any(GrantPermission.VIEW_EXPENSES.value)
            )  # Use enum value
        )

        # Count statement for expenses in allowed grants
        count_statement = (
            select(func.count())
            .select_from(GrantExpense)
            .where(GrantExpense.grant_id.in_(subquery))
        )

        # Main query to select expenses belonging to those grants
        statement = (
            select(GrantExpense)
            .where(GrantExpense.grant_id.in_(subquery))
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
    expense = GrantExpense(created_by=current_user.id, **grant_expense.model_dump())

    # Ensure the the category is valid
    category = session.exec(
        select(GrantCategory).where(GrantCategory.code == grant_expense.category)
    ).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid expense category")

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
                    "pg_code": driver.sqlstate if driver.sqlstate else "00000",
                    "detail": driver.diag.message_detail
                    if driver.diag.message_detail
                    else "",
                    "primary": driver.diag.message_primary
                    if driver.diag.message_primary
                    else "",
                    "hint": driver.diag.message_hint
                    if driver.diag.message_hint
                    else "",
                },
            )
    except DBAPIError as e:
        driver = e.orig
        if isinstance(driver, DatabaseError):
            logger.error(driver)
            raise HTTPException(
                status_code=409,
                detail=driver.diag.message_primary,
                headers={
                    "pg_code": driver.sqlstate if driver.sqlstate else "00000",
                    "detail": driver.diag.message_detail
                    if driver.diag.message_detail
                    else "",
                    "primary": driver.diag.message_primary
                    if driver.diag.message_primary
                    else "",
                    "hint": driver.diag.message_hint
                    if driver.diag.message_hint
                    else "",
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
