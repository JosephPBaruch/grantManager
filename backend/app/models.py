import uuid
from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import EmailStr
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import ARRAY
from sqlmodel import TIMESTAMP, Field, SQLModel, String

from app.utils import get_utc_now


# Generic message
class Message(SQLModel):
    message: str


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


class RuleType(str, Enum):
    """Enum for rule types."""

    EXPENSE = "expense"
    BUDGET = "budget"


class RuleOperator(Enum):
    """Enum for rule operators."""

    EQUALS = "="
    NOT_EQUALS = "!="
    GREATER_THAN = ">"
    LESS_THAN = "<"
    GREATER_THAN_EQUALS = ">="
    LESS_THAN_EQUALS = "<="
    IN = "IN"


class RuleAggregator(str, Enum):
    """Enum for rule aggregators."""

    SUM = "SUM"
    MAX = "MAX"
    MIN = "MIN"
    AVG = "AVG"
    COUNT = "COUNT"


class RuleFilterBase(SQLModel):
    """Base Rule Filter Model."""

    field: str = Field()  # The field to filter on (e.g., "date", "category")
    operator: RuleOperator = Field()
    value: str = Field()  # The value to compare against


class RuleFilter(RuleFilterBase, table=True):
    """Rule Filter Table Model."""

    __tablename__ = "rule_filter"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    rule_id: uuid.UUID = Field(foreign_key="rule.id")
    created_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )


class RuleConditionBase(SQLModel):
    """Base Rule Condition Model."""

    field: str = Field()  # The field to check (e.g., "amount")
    operator: RuleOperator = Field()
    value: str = Field()  # The value to compare against
    order: int = Field()  # The order of the condition in the rule


class RuleCondition(RuleConditionBase, table=True):
    """Rule Condition Table Model."""

    __tablename__ = "rule_condition"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    rule_id: uuid.UUID = Field(foreign_key="rule.id")
    created_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )


class RuleBase(SQLModel):
    """Base Rule Model."""

    grant_id: uuid.UUID = Field(foreign_key="grant.id")
    name: str = Field()
    description: Optional[str] = Field(default=None)
    rule_type: RuleType = Field()
    aggregator: Optional[RuleAggregator] = Field(
        default=None
    )  # Only for BUDGET type rules
    error_message: str = Field()
    is_active: bool = Field(default=True)


class RuleCreate(RuleBase):
    """Model for creating a new rule."""

    filters: List[RuleFilterBase] = Field(default_factory=list)
    conditions: List[RuleConditionBase] = Field(default_factory=list)


class Rule(RuleBase, table=True):
    """Rule Table Model."""

    __tablename__ = "rule"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )


# Public models for API responses
class RuleFilterPublic(RuleFilterBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class RuleConditionPublic(RuleConditionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class RulePublic(RuleBase):
    """Public model for a rule."""

    id: uuid.UUID
    filters: List[RuleFilterPublic] = Field(default_factory=list)
    conditions: List[RuleConditionPublic] = Field(default_factory=list)


class RulesPublic(SQLModel):
    """Public model for list of rules."""

    data: List[RulePublic]
    count: int


class GrantBase(SQLModel):
    """Base Grant Model."""

    title: str = Field(min_length=2, max_length=255)
    funding_agency: str = Field()
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
    owner_id: uuid.UUID = Field(foreign_key="user.id")
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )


class GrantUpdate(SQLModel):
    """Model for partial updates to a grant."""

    title: Optional[str] = None
    funding_agency: Optional[str] = None
    total_amount: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    description: Optional[str] = None


class GrantCategoryBase(SQLModel):
    """Base Grant Category Model."""

    name: str = Field(unique=True, index=True)
    description: Optional[str] = Field(default=None)
    code: str = Field(
        unique=True, index=True
    )  # e.g., "SAL" for salary, "TRV" for travel
    is_active: bool = Field(default=True)


class GrantCategory(GrantCategoryBase, table=True):
    """Grant Category Table Model."""

    __tablename__ = "grant_category"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class GrantExpenseBase(SQLModel):
    """Base Grant Expense Model."""

    amount: float = Field()
    date: datetime = Field(sa_column=Column(TIMESTAMP(timezone=True), nullable=False))
    description: str = Field()
    category: str = Field(
        foreign_key="grant_category.code"
    )  # e.g., "SAL" for salary, "TRV" for travel, "EQP" for equipment
    invoice_number: Optional[str] = Field(default=None)
    grant_id: uuid.UUID = Field(foreign_key="grant.id")


class ApprovalStatus(str, Enum):
    """Enum for Approval Status."""

    APPROVED = "approved"
    REJECTED = "rejected"


class GrantExpense(GrantExpenseBase, table=True):
    """Grant Expense Table Model."""

    __tablename__ = "grant_expense"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )
    created_by: uuid.UUID = Field(foreign_key="user.id")


class GrantApprovalBase(SQLModel):
    """Base Grant Approval Model."""

    expense_id: Optional[uuid.UUID] = Field(foreign_key="grant_expense.id")
    status: ApprovalStatus = Field(default="approved")  # approved, rejected
    comments: Optional[str] = Field(default=None)


class GrantApproval(GrantApprovalBase, table=True):
    """Grant Approval Table Model."""

    __tablename__ = "grant_approval"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )
    approver_id: uuid.UUID = Field(foreign_key="user.id")


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


class GrantRoleType(str, Enum):
    """Enum for grant role types."""

    OWNER = "owner"
    ADMIN = "admin"
    USER = "user"


class GrantPermission(str, Enum):
    """Enum for grant permissions."""

    APPROVE_EXPENSES = "approve_expenses"
    CREATE_RULES = "create_rules"
    MANAGE_ROLES = "manage_roles"
    VIEW_BUDGET = "view_budget"
    VIEW_EXPENSES = "view_expenses"
    EDIT_EXPENSES = "edit_expenses"
    SUBMIT_EXPENSES = "submit_expenses"
    MANAGE_GRANT = "manage_grant"
    ARCHIVE_GRANT = "archive_grant"
    VIEW_GRANT = "view_grant"
    EDIT_GRANT = "edit_grant"


class GrantRoleBase(SQLModel):
    """Base Grant Role Model."""

    grant_id: uuid.UUID = Field(foreign_key="grant.id")
    user_id: uuid.UUID = Field(foreign_key="user.id")
    role_type: GrantRoleType = Field()
    permissions: list[GrantPermission] = Field(
        default_factory=list, sa_column=Column(ARRAY(String()))
    )


class GrantRole(GrantRoleBase, table=True):
    """Grant Role Table Model."""

    __tablename__ = "grant_role"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )


# Public models for API responses
class GrantRolePublic(GrantRoleBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class GrantRolesPublic(SQLModel):
    data: list[GrantRolePublic]
    count: int


class RuleTrigger(SQLModel, table=True):
    """Rule Trigger Table Model."""

    __tablename__ = "rule_trigger"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    rule_id: uuid.UUID = Field(foreign_key="rule.id")
    trigger_name: str = Field(unique=True)  # Name of the PostgreSQL trigger
    function_name: str = Field(unique=True)  # Name of the PostgreSQL function
    created_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
    )
