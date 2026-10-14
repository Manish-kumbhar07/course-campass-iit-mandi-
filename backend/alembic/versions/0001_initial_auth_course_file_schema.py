"""Initial CourseCompass schema including auth, course ownership and documents.

Revision ID: 0001_security_schema
Revises:
"""
from alembic import op
from app.models.base import Base
import app.models  # noqa: F401

revision = "0001_security_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind(), checkfirst=True)


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind(), checkfirst=True)
