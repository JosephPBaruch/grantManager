import uuid
from datetime import datetime, UTC
from typing import Optional

from pydantic import EmailStr
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import TEXT
from sqlmodel import TIMESTAMP, Field, SQLModel


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int



# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


class RuleBase(SQLModel):
    Name: str = Field(default="Rule Name", sa_column=Column(TEXT))
    Description: Optional[str] = Field(sa_column=Column(TEXT))
    Table: str = Field(sa_column=Column(TEXT))
    Enabled: Optional[bool] = Field(default=True)


class Rule(RuleBase, table=True):
    """Rules Table."""

    __tablename__ = "Rules"
    RuleID: Optional[int] = Field(default=None, primary_key=True)
    Trigger: Optional[str] = Field(sa_column=Column(TEXT))


# Properties to return via API
class RuleCreate(RuleBase):
    pass


class RulePublic(RuleBase):
    RuleID: Optional[int] = Field(default=None, primary_key=True)
    Trigger: Optional[str] = Field(sa_column=Column(TEXT))


class RulesPublic(SQLModel):
    data: list[RulePublic]
    count: int


class SelectorsBase(SQLModel):
    """"""

    Table: Optional[str] = Field(default=None, sa_column=Column(TEXT))
    Target: str = Field(sa_column=Column(TEXT))
    Aggregator: str = Field(default="MAX", sa_column=Column(TEXT))
    Type: str = Field(default="int", sa_column=Column(TEXT))


class Selectors(SelectorsBase, table=True):
    """Selectors Table."""

    __tablename__ = "Selectors"
    SID: Optional[int] = Field(default=None, primary_key=True)


class SelectorsPublic(SQLModel):
    data: list[Selectors]
    count: int


class ConditionBase(SQLModel):
    LeftSID: int = Field(foreign_key="Selectors.SID")
    Operator: str = Field(sa_column=Column(TEXT))
    RightSID: int = Field(foreign_key="Selectors.SID")


class Condition(ConditionBase, table=True):
    """Conditions Table."""

    __tablename__ = "Conditions"
    CID: Optional[int] = Field(default=None, primary_key=True)


class ConditionsPublic(SQLModel):
    data: list[Condition]
    count: int


class ActionBase(SQLModel):
    RuleID: int = Field(foreign_key="Rules.RuleID")
    CID: int = Field(foreign_key="Conditions.CID")
    Conjunction: str = Field(default="AND", sa_column=Column(TEXT))


class Action(ActionBase, table=True):
    """Actions Table."""

    __tablename__ = "Actions"
    id: Optional[int] = Field(default=None, primary_key=True)


class ActionsPublic(SQLModel):
    data: list[Action]
    count: int


class _RulesSystemTables(SQLModel, table=True):
    """Meta Table for specifying tables not part of the rules system."""

    __tablename__ = "SystemRulesTables"
    name: Optional[str] = Field(default=None, primary_key=True)


class GrantBase(SQLModel):
    """Base Grant Model."""
    title: str = Field(min_length=2, max_length=255)
    grant_number: str = Field(unique=True, index=True)
    funding_agency: str = Field()
    owner_id: uuid.UUID = Field(foreign_key="user.id")
    start_date: datetime = Field(
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False)
    )
    end_date: datetime = Field(
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False)
    )
    total_amount: float = Field(default=0)
    status: str = Field(default="active")  # active, completed, terminated
    description: Optional[str] = Field(default=None)


class Grant(GrantBase, table=True):
    """Grant Table Model."""
    __tablename__ = "grant"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.now(UTC),
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now(UTC),
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False)
    )


class GrantCategoryBase(SQLModel):
    """Base Grant Category Model."""
    name: str = Field(unique=True, index=True)
    description: Optional[str] = Field(default=None)
    code: str = Field(unique=True, index=True)  # e.g., "SAL" for salary, "TRV" for travel
    is_active: bool = Field(default=True)


class GrantCategory(GrantCategoryBase, table=True):
    """Grant Category Table Model."""
    __tablename__ = "grant_category"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class GrantExpenseBase(SQLModel):
    """Base Grant Expense Model."""
    budget_line_id: uuid.UUID = Field(foreign_key="grant_budget_line.id")
    amount: float = Field()
    date: datetime = Field(
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False)
    )
    description: str = Field()
    invoice_number: Optional[str] = Field(default=None)
    status: str = Field(default="pending")  # pending, approved, rejected, paids


class GrantExpense(GrantExpenseBase, table=True):
    """Grant Expense Table Model."""
    __tablename__ = "grant_expense"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False)
    )
    created_by: uuid.UUID = Field(foreign_key="user.id")


class GrantApprovalBase(SQLModel):
    """Base Grant Approval Model."""
    grant_id: uuid.UUID = Field(foreign_key="grant.id")
    expense_id: Optional[uuid.UUID] = Field(default=None, foreign_key="grant_expense.id")
    approver_id: uuid.UUID = Field(foreign_key="user.id")
    status: str = Field()  # approved, rejected, pending
    comments: Optional[str] = Field(default=None)
    level: int = Field()  # Approval level (1, 2, 3, etc.)


class GrantApproval(GrantApprovalBase, table=True):
    """Grant Approval Table Model."""
    __tablename__ = "grant_approval"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False)
    )


# Public models for API responses
class GrantPublic(GrantBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class GrantCategoryPublic(GrantCategoryBase):
    id: uuid.UUID


class GrantExpensePublic(GrantExpenseBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    created_by: uuid.UUID


class GrantApprovalPublic(GrantApprovalBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# List response models
class GrantsPublic(SQLModel):
    data: list[GrantPublic]
    count: int


class GrantCategoriesPublic(SQLModel):
    data: list[GrantCategoryPublic]
    count: int


class GrantExpensesPublic(SQLModel):
    data: list[GrantExpensePublic]
    count: int


class GrantApprovalsPublic(SQLModel):
    data: list[GrantApprovalPublic]
    count: int
