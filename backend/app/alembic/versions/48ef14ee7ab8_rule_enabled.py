"""Rule Enabled

Revision ID: 48ef14ee7ab8
Revises: a183a4d4189e
Create Date: 2025-03-17 14:00:06.840113

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "48ef14ee7ab8"
down_revision: Union[str, None] = "a183a4d4189e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("Rule", sa.Column("Enabled", sa.Boolean(), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("Rule", "Enabled")
    # ### end Alembic commands ###
