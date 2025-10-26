"""Add fusion denormalized table

Revision ID: 28c5ff523ffd
Revises: 458c82c15520
Create Date: 2025-10-25 12:55:00.744308

"""

from typing import Sequence, Union

import advanced_alchemy
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "28c5ff523ffd"
down_revision: Union[str, None] = "458c82c15520"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "fusion_denormalized",
        sa.Column("path", sa.String(length=15), nullable=False),
        sa.Column("vote_count", sa.Integer(), nullable=False),
        sa.Column("vote_score", sa.Numeric(), nullable=False),
        sa.Column("is_removed", sa.Boolean(), nullable=False),
        sa.Column("head_name", sa.String(length=100), nullable=False),
        sa.Column("head_name_separator_index", sa.String(length=10), nullable=False),
        sa.Column("head_type_1", sa.String(length=20), nullable=False),
        sa.Column("head_type_2", sa.String(length=20), nullable=True),
        sa.Column("head_height", sa.Integer(), nullable=False),
        sa.Column("head_weight", sa.Integer(), nullable=False),
        sa.Column("head_pokedex_id", sa.Integer(), nullable=False),
        sa.Column("head_families", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("body_name", sa.String(length=100), nullable=False),
        sa.Column("body_name_separator_index", sa.String(length=10), nullable=False),
        sa.Column("body_type_1", sa.String(length=20), nullable=False),
        sa.Column("body_type_2", sa.String(length=20), nullable=True),
        sa.Column("body_height", sa.Integer(), nullable=False),
        sa.Column("body_weight", sa.Integer(), nullable=False),
        sa.Column("body_pokedex_id", sa.Integer(), nullable=False),
        sa.Column("body_families", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("creators", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("references", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("id", advanced_alchemy.types.guid.GUID(length=16), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_fusion_denormalized")),
    )

    op.create_index("index_fusion_denormalized_path", "fusion_denormalized", ["path"], unique=False)
    op.create_index("index_fusion_denormalized_vote_count", "fusion_denormalized", ["vote_count"], unique=False)

    op.create_index(
        "index_fusion_denormalized_body_families_gin",
        "fusion_denormalized",
        ["body_families"],
        unique=False,
        postgresql_using="gin",
    )
    op.create_index(
        "index_fusion_denormalized_creators_gin",
        "fusion_denormalized",
        ["creators"],
        unique=False,
        postgresql_using="gin",
    )
    op.create_index(
        "index_fusion_denormalized_head_families_gin",
        "fusion_denormalized",
        ["head_families"],
        unique=False,
        postgresql_using="gin",
    )
    op.create_index(
        "index_fusion_denormalized_references_gin",
        "fusion_denormalized",
        ["references"],
        unique=False,
        postgresql_using="gin",
    )

    op.execute(
        """
        CREATE OR REPLACE FUNCTION refresh_fusion_denormalized()
        RETURNS void AS $$
        BEGIN
            TRUNCATE fusion_denormalized;

            INSERT INTO fusion_denormalized (
                id, path, vote_count, vote_score, is_removed,
                head_name, head_name_separator_index, head_type_1, head_type_2, head_height, head_weight, head_pokedex_id, head_families,
                body_name, body_name_separator_index, body_type_1, body_type_2, body_height, body_weight, body_pokedex_id, body_families,
                creators, "references"
            )
            SELECT
                fusion.id,
                fusion.path,
                fusion.vote_count,
                fusion.vote_score,
                fusion.is_removed,
                head.name,
                head.name_separator_index,
                head.type_1,
                head.type_2,
                head.height,
                head.weight,
                head.pokedex_id,
                COALESCE(
                    json_agg(json_build_object('name', head_family.name)) FILTER (WHERE head_family.id IS NOT NULL),
                    '[]'::json
                ) AS head_families,
                body.name,
                body.name_separator_index,
                body.type_1,
                body.type_2,
                body.height,
                body.weight,
                body.pokedex_id,
                COALESCE(
                    json_agg(json_build_object('name', body_family.name)) FILTER (WHERE body_family.id IS NOT NULL),
                    '[]'::json
                ) AS body_families,
                COALESCE(
                    json_agg(json_build_object('id', creator.id, 'name', creator.name)) FILTER (WHERE creator.id IS NOT NULL),
                    '[]'::json
                ) AS creators,
                COALESCE(
                    json_agg(json_build_object(
                        'id', reference.id,
                        'name', reference.name,
                        'source', reference.source,
                        'family_name', reference_family.name
                    )) FILTER (WHERE reference.id IS NOT NULL),
                    '[]'::json
                ) AS "references"
            FROM fusion
            LEFT JOIN pokemon head ON head.id = fusion.head_id
            LEFT JOIN pokemon_family head_pokemon_family ON head.id = head_pokemon_family.pokemon_id
            LEFT JOIN family head_family ON head_family.id = head_pokemon_family.family_id
            LEFT JOIN pokemon body ON body.id = fusion.body_id
            LEFT JOIN pokemon_family body_pokemon_family ON body.id = body_pokemon_family.pokemon_id
            LEFT JOIN family body_family ON body_family.id = body_pokemon_family.family_id
            LEFT JOIN fusion_creator ON fusion.id = fusion_creator.fusion_id
            LEFT JOIN creator ON creator.id = fusion_creator.creator_id
            LEFT JOIN fusion_reference ON fusion.id = fusion_reference.fusion_id
            LEFT JOIN reference ON reference.id = fusion_reference.reference_id
            LEFT JOIN reference_family ON reference_family.id = reference.family_id
            GROUP BY
                fusion.id,
                fusion.path,
                fusion.vote_count,
                fusion.vote_score,
                fusion.is_removed,
                head.name,
                head.name_separator_index,
                head.type_1,
                head.type_2,
                head.height,
                head.weight,
                head.pokedex_id,
                body.name,
                body.name_separator_index,
                body.type_1,
                body.type_2,
                body.height,
                body.weight,
                body.pokedex_id;
        END;
        $$ LANGUAGE plpgsql;
        """
    )

    op.execute(
        """
        CREATE OR REPLACE FUNCTION update_fusion_denormalized_on_fusion_change()
        RETURNS TRIGGER AS $$
        BEGIN
            PERFORM refresh_fusion_denormalized();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """
    )

    op.execute(
        """
        CREATE TRIGGER trigger_update_fusion_denormalized_on_fusion_change
        AFTER UPDATE OF path, vote_count, vote_score, is_removed ON fusion
        FOR EACH ROW
        EXECUTE FUNCTION update_fusion_denormalized_on_fusion_change();
        """
    )

    op.execute("SELECT refresh_fusion_denormalized()")


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trigger_update_fusion_denormalized_on_fusion_change ON fusion")
    op.execute("DROP FUNCTION IF EXISTS update_fusion_denormalized_on_fusion_change()")
    op.execute("DROP FUNCTION IF EXISTS refresh_fusion_denormalized()")
    op.drop_index(
        "index_fusion_denormalized_vote_count",
        table_name="fusion_denormalized",
    )
    op.drop_index(
        "index_fusion_denormalized_references_gin",
        table_name="fusion_denormalized",
        postgresql_using="gin",
    )
    op.drop_index(
        "index_fusion_denormalized_path",
        table_name="fusion_denormalized",
    )
    op.drop_index(
        "index_fusion_denormalized_head_families_gin",
        table_name="fusion_denormalized",
        postgresql_using="gin",
    )
    op.drop_index(
        "index_fusion_denormalized_creators_gin",
        table_name="fusion_denormalized",
        postgresql_using="gin",
    )
    op.drop_index(
        "index_fusion_denormalized_body_families_gin",
        table_name="fusion_denormalized",
        postgresql_using="gin",
    )
    op.drop_table("fusion_denormalized")
