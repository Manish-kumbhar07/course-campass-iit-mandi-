"""Add adaptive quiz multi-format assessment and grading columns.

Revision ID: 0003_adaptive_quiz
Revises: 0002_pgvector_and_kb
Create Date: 2026-10-14 17:15:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_adaptive_quiz"
down_revision = "0002_pgvector_and_kb"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    if is_postgres:
        # Add columns to quiz_questions
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_questions' AND column_name = 'expected_answer') THEN
                    ALTER TABLE quiz_questions ADD COLUMN expected_answer TEXT;
                    ALTER TABLE quiz_questions ADD COLUMN numerical_value DOUBLE PRECISION;
                    ALTER TABLE quiz_questions ADD COLUMN numerical_tolerance DOUBLE PRECISION DEFAULT 0.0;
                    ALTER TABLE quiz_questions ADD COLUMN numerical_unit VARCHAR(50);
                    ALTER TABLE quiz_questions ADD COLUMN rubric TEXT;
                    ALTER TABLE quiz_questions ADD COLUMN hint TEXT;
                    ALTER TABLE quiz_questions ADD COLUMN fingerprint VARCHAR(64);
                    ALTER TABLE quiz_questions ADD COLUMN verification_status VARCHAR(50) DEFAULT 'verified' NOT NULL;
                    CREATE INDEX IF NOT EXISTS idx_quiz_questions_fingerprint ON quiz_questions (fingerprint);
                END IF;
            END $$;
            """
        )

        # Add columns to quiz_attempt_answers
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_attempt_answers' AND column_name = 'submitted_text') THEN
                    ALTER TABLE quiz_attempt_answers ADD COLUMN submitted_text TEXT;
                    ALTER TABLE quiz_attempt_answers ADD COLUMN score DOUBLE PRECISION DEFAULT 0.0 NOT NULL;
                    ALTER TABLE quiz_attempt_answers ADD COLUMN feedback TEXT;
                    ALTER TABLE quiz_attempt_answers ADD COLUMN misconception_tag VARCHAR(100);
                    ALTER TABLE quiz_attempt_answers ADD COLUMN grading_method VARCHAR(50) DEFAULT 'deterministic' NOT NULL;
                END IF;
            END $$;
            """
        )


def downgrade() -> None:
    pass

