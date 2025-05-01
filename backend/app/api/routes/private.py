from fastapi import APIRouter, HTTPException
from psycopg.errors import DatabaseError
from pydantic import BaseModel
from sqlalchemy.exc import DatabaseError as SQL_ERR
from sqlmodel import select

from app.api.deps import SessionDep
from app.core.security import get_password_hash
from app.models import (
    Grant,
    GrantBase,
    GrantCategory,
    GrantExpense,
    GrantRole,
    GrantRoleType,
    User,
    UserPublic,
)
from app.permissions import DEFAULT_ROLE_PERMISSIONS, GrantRole

router = APIRouter(tags=["private"], prefix="/private")


class PrivateUserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    is_verified: bool = False


@router.post("/users/", response_model=UserPublic)
def create_user(user_in: PrivateUserCreate, session: SessionDep) -> UserPublic:
    """
    Create a new user.
    """

    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
    )

    session.add(user)
    session.commit()

    return user


SAMPLE_GRANT = {
    "users": [
        {
            "email": "john@example.com",
            "full_name": "John Doe",
            "password": "password123",
            "is_verified": True,
        },
        {
            "email": "sam@example.com",
            "full_name": "Sam Smith",
            "password": "password123",
            "is_verified": True,
        },
        {
            "email": "barney@example.com",
            "full_name": "Barney Clown",
            "password": "password123",
            "is_verified": True,
        },
    ],
    "grant": GrantBase(
        title="Sample Grant",
        description="This is a sample grant.",
        start_date="2023-01-01",
        end_date="2023-12-31",
        total_amount=100000.0,
        funding_agency="Sample Agency",
        status="active",
    ),
    "grant_expense_categories": [
        GrantCategory(
            code="TRV",
            name="Travel",
            description="Travel expenses",
        ),
        GrantCategory(
            code="PAY",
            name="Pay",
            description="Pay expenses",
        ),
    ],
    "grant_expenses": [
        {
            "description": "Travel1.",
            "amount": 1000.0,
            "date": "2023-06-01",
            "category": "TRV",
        },
        {
            "description": "Travel 2.",
            "amount": 1000.0,
            "date": "2023-06-01",
            "category": "TRV",
        },
        {
            "description": "Payment 1",
            "amount": 600.0,
            "date": "2023-06-01",
            "category": "PAY",
        },
        {
            "description": "Payment 1",
            "amount": 400.0,
            "date": "2023-06-01",
            "category": "PAY",
        },
        {
            "description": "Payment 3",
            "amount": 200.0,
            "date": "2023-06-01",
            "category": "PAY",
        },
    ],
}


@router.post("/sample_grant")
def create_sample_grant(session: SessionDep):
    user_ids = []
    for user in SAMPLE_GRANT["users"]:
        found_user = session.exec(
            select(User).where(User.email == user["email"])
        ).first()
        if found_user:
            user_ids.append(found_user.id)
            continue
        user_in = PrivateUserCreate(**user)
        u = create_user(user_in, session)
        user_ids.append(u.id)

    grant = Grant(owner_id=user_ids[0], **SAMPLE_GRANT["grant"].model_dump())
    # Add default role for the grant
    grant_role = GrantRole(
        grant_id=grant.id,
        role_type=GrantRoleType.OWNER,
        user_id=user_ids[0],
        permissions=DEFAULT_ROLE_PERMISSIONS[GrantRoleType.OWNER],
    )
    grant_role2 = GrantRole(
        grant_id=grant.id,
        role_type=GrantRoleType.ADMIN,
        user_id=user_ids[1],
        permissions=DEFAULT_ROLE_PERMISSIONS[GrantRoleType.ADMIN],
    )
    grant_role3 = GrantRole(
        grant_id=grant.id,
        role_type=GrantRoleType.USER,
        user_id=user_ids[2],
        permissions=DEFAULT_ROLE_PERMISSIONS[GrantRoleType.USER],
    )
    try:
        session.add(grant)
        session.add(grant_role)
        session.add(grant_role2)
        session.add(grant_role3)
        session.commit()
        session.refresh(grant)
        session.refresh(grant_role)
        session.refresh(grant_role2)
        session.refresh(grant_role3)
    except SQL_ERR as e:
        driver = e.orig
        if isinstance(driver, DatabaseError):
            raise HTTPException(
                status_code=409,
                detail=driver.diag.message_primary,
                headers={"pg_code": driver.sqlstate},
            )

    for category in SAMPLE_GRANT["grant_expense_categories"]:
        cat = session.exec(
            select(GrantCategory).where(GrantCategory.code == category.code)
        ).first()
        if cat:
            continue
        category = GrantCategory(**category.model_dump())
        session.add(category)
        session.commit()

    for expense in SAMPLE_GRANT["grant_expenses"]:
        expense = GrantExpense(**expense, created_by=user_ids[0])
        expense.grant_id = grant.id
        session.add(expense)
        session.commit()

    # Create the expense
    session.commit()
