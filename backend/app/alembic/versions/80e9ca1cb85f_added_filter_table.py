"""Added Filter Table

Revision ID: 80e9ca1cb85f
Revises: 4c203bef5d2a
Create Date: 2025-03-21 14:05:15.975517

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision: str = '80e9ca1cb85f'
down_revision: Union[str, None] = '4c203bef5d2a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('budget', sa.Column('amount', sa.Float(), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('budget', 'amount')
    # ### end Alembic commands ###
