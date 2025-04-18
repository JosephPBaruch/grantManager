"""Update rules

Revision ID: a0f49c38fa90
Revises: e43967b59740
Create Date: 2025-04-15 15:05:52.129931

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision: str = 'a0f49c38fa90'
down_revision: Union[str, None] = 'e43967b59740'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('rule_created_by_fkey', 'rule', type_='foreignkey')
    op.drop_column('rule', 'created_by')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('rule', sa.Column('created_by', sa.UUID(), autoincrement=False, nullable=False))
    op.create_foreign_key('rule_created_by_fkey', 'rule', 'user', ['created_by'], ['id'])
    # ### end Alembic commands ###
