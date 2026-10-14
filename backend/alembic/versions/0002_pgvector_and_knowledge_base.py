"""Enable pgvector extension and create HNSW vector search and knowledge base indexes.

Revision ID: 0002_pgvector_and_kb
Revises: 0001_security_schema
Create Date: 2026-10-14 16:55:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_pgvector_and_kb"
down_revision = "0001_security_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    if is_postgres:
        # Enable pgvector extension in PostgreSQL
        op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

        # Create native vector column on chunk_embeddings if using pgvector
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'chunk_embeddings' AND column_name = 'embedding'
                ) THEN
                    ALTER TABLE chunk_embeddings ADD COLUMN embedding vector(768);
                END IF;
            END $$;
            """
        )

        # Create HNSW index for ultra-fast approximate cosine nearest neighbor search
        op.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_chunk_embeddings_hnsw 
            ON chunk_embeddings USING hnsw (embedding vector_cosine_ops)
            WITH (m = 16, ef_construction = 64);
            """
        )

        # Create full-text search tsvector index on document chunks
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'document_chunks' AND column_name = 'tsv_content'
                ) THEN
                    ALTER TABLE document_chunks ADD COLUMN tsv_content tsvector
                    GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;
                    CREATE INDEX IF NOT EXISTS idx_chunks_tsv ON document_chunks USING gin(tsv_content);
                END IF;
            END $$;
            """
        )

    # Standard indexes on foreign keys and tenant isolation columns (PostgreSQL & SQLite)
    try:
        op.create_index("idx_chunks_course_id", "document_chunks", ["course_id"], if_not_exists=True)
    except Exception:
        pass

    try:
        op.create_index("idx_concept_rel_course", "concept_relationships", ["course_id"], if_not_exists=True)
    except Exception:
        pass


def downgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    if is_postgres:
        op.execute("DROP INDEX IF EXISTS idx_chunk_embeddings_hnsw;")
        op.execute("DROP INDEX IF EXISTS idx_chunks_tsv;")
        op.execute("ALTER TABLE chunk_embeddings DROP COLUMN IF EXISTS embedding;")
        op.execute("ALTER TABLE document_chunks DROP COLUMN IF EXISTS tsv_content;")

    try:
        op.drop_index("idx_chunks_course_id", table_name="document_chunks", if_exists=True)
    except Exception:
        pass

    try:
        op.drop_index("idx_concept_rel_course", table_name="concept_relationships", if_exists=True)
    except Exception:
        pass

