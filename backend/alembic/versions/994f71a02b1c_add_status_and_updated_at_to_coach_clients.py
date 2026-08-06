"""add_status_and_updated_at_to_coach_clients

Revision ID: 994f71a02b1c
Revises: 855eec36ca1e
Create Date: 2026-08-06 17:42:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '994f71a02b1c'
down_revision: Union[str, Sequence[str], None] = '855eec36ca1e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    coach_status_enum = sa.Enum('PENDING', 'ACCEPTED', 'REJECTED', name='coachstatus')
    coach_status_enum.create(op.get_bind(), checkfirst=True)

    op.add_column('coach_clients', sa.Column('status', sa.Enum('PENDING', 'ACCEPTED', 'REJECTED', name='coachstatus'), nullable=False, server_default='PENDING'))
    op.add_column('coach_clients', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))


def downgrade() -> None:
    op.drop_column('coach_clients', 'updated_at')
    op.drop_column('coach_clients', 'status')
    coach_status_enum = sa.Enum('PENDING', 'ACCEPTED', 'REJECTED', name='coachstatus')
    coach_status_enum.drop(op.get_bind(), checkfirst=True)
