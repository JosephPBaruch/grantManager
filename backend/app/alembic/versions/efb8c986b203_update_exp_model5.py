"""Update exp Model5

Revision ID: efb8c986b203
Revises: 140e7baa97d7
Create Date: 2025-04-15 10:32:50.685286

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision: str = 'efb8c986b203'
down_revision: Union[str, None] = '140e7baa97d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('grant_expense_category_fkey', 'grant_expense', type_='foreignkey')
    op.create_foreign_key(None, 'grant_expense', 'grant_category', ['category'], ['code'])
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'grant_expense', type_='foreignkey')
    op.create_foreign_key('grant_expense_category_fkey', 'grant_expense', 'grant_category', ['category'], ['name'])
    # ### end Alembic commands ###
