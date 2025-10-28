"""Replace fusion denormalized table by materialized view

Revision ID: eef2d64d7067
Revises: a8d43ee9316d
Create Date: 2025-10-28 20:09:34.265931

"""

from typing import Sequence, Union

import advanced_alchemy
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "eef2d64d7067"
down_revision: Union[str, None] = "a8d43ee9316d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("DELETE FROM cron.job WHERE jobname = 'refresh_fusion_hourly';")
    op.execute("DROP FUNCTION refresh_fusion_denormalized()")

    op.drop_index(
        "index_fusion_denormalized_vote_rank",
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

    op.execute(
        """
        CREATE MATERIALIZED VIEW fusion_denormalized AS
        SELECT
            fusion.id,
            fusion.path,
            fusion.vote_count,
            CASE 
                WHEN fusion.vote_count < 5 THEN fusion.vote_score / 2
                ELSE fusion.vote_score
            END AS vote_score,
            RANK() OVER (
                ORDER BY
                    CASE 
                        WHEN fusion.vote_count < 5 THEN fusion.vote_score / 2
                        ELSE fusion.vote_score
                    END DESC,
                    fusion.vote_count DESC,
                    head.pokedex_id,
                    body.pokedex_id,
                    fusion.path,
                    fusion.id
            ) AS vote_rank,
            fusion.is_removed,
            head.name AS head_name,
            head.name_separator_index AS head_name_separator_index,
            head.type_1 AS head_type_1,
            head.type_2 AS head_type_2,
            head.height AS head_height,
            head.weight AS head_weight,
            head.pokedex_id AS head_pokedex_id,
            COALESCE(
                json_agg(json_build_object('name', head_family.name)) FILTER (WHERE head_family.id IS NOT NULL)::jsonb,
                '[]'::jsonb
            ) AS head_families,
            body.name AS body_name,
            body.name_separator_index AS body_name_separator_index,
            body.type_1 AS body_type_1,
            body.type_2 AS body_type_2,
            body.height AS body_height,
            body.weight AS body_weight,
            body.pokedex_id AS body_pokedex_id,
            COALESCE(
                json_agg(json_build_object('name', body_family.name)) FILTER (WHERE body_family.id IS NOT NULL)::jsonb,
                '[]'::jsonb
            ) AS body_families,
            COALESCE(
                json_agg(json_build_object('id', creator.id, 'name', creator.name)) FILTER (WHERE creator.id IS NOT NULL)::jsonb,
                '[]'::jsonb
            ) AS creators,
            COALESCE(
                json_agg(json_build_object(
                    'id', reference.id,
                    'name', reference.name,
                    'source', reference.source,
                    'family_name', reference_family.name
                )) FILTER (WHERE reference.id IS NOT NULL)::jsonb,
                '[]'::jsonb
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
        """
    )

    op.execute(
        """
        SELECT cron.schedule(
            'refresh_fusion_denormalized_hourly',
            '0 * * * *',
            $$REFRESH MATERIALIZED VIEW fusion_denormalized;$$
        );
        """
    )

    op.create_index("index_fusion_denormalized_path", "fusion_denormalized", ["path"], unique=False)
    op.create_index("index_fusion_denormalized_vote_rank", "fusion_denormalized", ["vote_rank"], unique=False)

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


def downgrade() -> None:
    op.drop_index(
        "index_fusion_denormalized_path",
        table_name="fusion_denormalized",
    )
    op.drop_index(
        "index_fusion_denormalized_vote_rank",
        table_name="fusion_denormalized",
    )

    op.drop_index(
        "index_fusion_denormalized_references_gin",
        table_name="fusion_denormalized",
        postgresql_using="gin",
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

    op.execute("DELETE FROM cron.job WHERE jobname = 'refresh_fusion_hourly';")
    op.execute("DROP MATERIALIZED VIEW fusion_denormalized;")

    op.create_table(
        "fusion_denormalized",
        sa.Column("path", sa.String(length=15), nullable=False),
        sa.Column("vote_count", sa.Integer(), nullable=False),
        sa.Column("vote_score", sa.Integer(), nullable=False),
        sa.Column("vote_rank", sa.Integer(), nullable=False),
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

    op.execute(
        """
        CREATE OR REPLACE FUNCTION refresh_fusion_denormalized()
        RETURNS void AS $$
        BEGIN
            TRUNCATE fusion_denormalized;

            INSERT INTO fusion_denormalized (
                id, path, vote_count, vote_score, vote_rank, is_removed,
                head_name, head_name_separator_index, head_type_1, head_type_2, head_height, head_weight, head_pokedex_id, head_families,
                body_name, body_name_separator_index, body_type_1, body_type_2, body_height, body_weight, body_pokedex_id, body_families,
                creators, "references"
            )
            SELECT
                fusion.id,
                fusion.path,
                fusion.vote_count,
                CASE 
                    WHEN fusion.vote_count < 5 THEN fusion.vote_score / 2
                    ELSE fusion.vote_score
                END DESC,
                RANK() OVER (
                    ORDER BY
                        CASE 
                            WHEN fusion.vote_count < 5 THEN fusion.vote_score / 2
                            ELSE fusion.vote_score
                        END DESC,
                        fusion.vote_count DESC,
                        head.pokedex_id,
                        body.pokedex_id,
                        fusion.path,
                        fusion.id
                ),
                fusion.is_removed,
                head.name,
                head.name_separator_index,
                head.type_1,
                head.type_2,
                head.height,
                head.weight,
                head.pokedex_id,
                COALESCE(
                    json_agg(json_build_object('name', head_family.name)) FILTER (WHERE head_family.id IS NOT NULL)::jsonb,
                    '[]'::jsonb
                ) AS head_families,
                body.name,
                body.name_separator_index,
                body.type_1,
                body.type_2,
                body.height,
                body.weight,
                body.pokedex_id,
                COALESCE(
                    json_agg(json_build_object('name', body_family.name)) FILTER (WHERE body_family.id IS NOT NULL)::jsonb,
                    '[]'::jsonb
                ) AS body_families,
                COALESCE(
                    json_agg(json_build_object('id', creator.id, 'name', creator.name)) FILTER (WHERE creator.id IS NOT NULL)::jsonb,
                    '[]'::jsonb
                ) AS creators,
                COALESCE(
                    json_agg(json_build_object(
                        'id', reference.id,
                        'name', reference.name,
                        'source', reference.source,
                        'family_name', reference_family.name
                    )) FILTER (WHERE reference.id IS NOT NULL)::jsonb,
                    '[]'::jsonb
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

    op.create_index("index_fusion_denormalized_path", "fusion_denormalized", ["path"], unique=False)
    op.create_index("index_fusion_denormalized_vote_rank", "fusion_denormalized", ["vote_rank"], unique=False)

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

    op.execute("SELECT refresh_fusion_denormalized()")
    op.execute("SELECT cron.schedule('refresh_fusion_hourly','0 * * * *',$$SELECT refresh_fusion_denormalized();$$);")
