import uuid
from datetime import datetime
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


# Generic message
class Message(SQLModel):
    message: str


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


class Selectors(SQLModel, table=True):
    """Selectors Table."""

    __tablename__ = "Selectors"
    SID: Optional[int] = Field(default=None, primary_key=True)
    Table: Optional[str] = Field(default=None, sa_column=Column(TEXT))
    Target: str = Field(sa_column=Column(TEXT))
    Aggregator: str = Field(default="MAX", sa_column=Column(TEXT))
    Type: str = Field(default="int", sa_column=Column(TEXT))


class Conditions(SQLModel, table=True):
    """Conditions Table."""

    __tablename__ = "Conditions"
    CID: Optional[int] = Field(default=None, primary_key=True)
    LeftSID: int = Field(foreign_key="Selectors.SID")
    Operator: str = Field(sa_column=Column(TEXT))
    RightSID: int = Field(foreign_key="Selectors.SID")


class Actions(SQLModel, table=True):
    """Actions Table."""

    __tablename__ = "Actions"
    id: Optional[int] = Field(default=None, primary_key=True)
    RuleID: int = Field(foreign_key="Rules.RuleID")
    CID: int = Field(foreign_key="Conditions.CID")
    Conjunction: str = Field(default="AND", sa_column=Column(TEXT))


class BudgetBase(SQLModel):
    """Base Budget Model."""

    name: str = Field(min_length=2, max_length=40)
    funding_source: str = Field()
    start_date: datetime = Field(
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False)
    )
    end_date: datetime = Field(
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False)
    )


class BudgetTable(BudgetBase, table=True):
    """Budget Table Model."""

    __tablename__ = "budget"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
