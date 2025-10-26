"""Add rank to fusion denormalized table

Revision ID: a8d43ee9316d
Revises: 28c5ff523ffd
Create Date: 2025-10-26 20:57:25.327569

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a8d43ee9316d"
down_revision: Union[str, None] = "28c5ff523ffd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("DELETE FROM cron.job WHERE jobname = 'refresh_fusion_hourly';")
    op.execute("DROP TRIGGER IF EXISTS trigger_update_fusion_denormalized_on_fusion_change ON fusion")
    op.execute("DROP FUNCTION IF EXISTS update_fusion_denormalized_on_fusion_change()")
    op.execute("DROP FUNCTION IF EXISTS refresh_fusion_denormalized()")

    op.execute("TRUNCATE fusion_denormalized;")

    op.drop_index(
        "index_fusion_denormalized_vote_count",
        table_name="fusion_denormalized",
    )

    op.add_column("fusion_denormalized", sa.Column("vote_rank", sa.Integer(), nullable=False))
    op.alter_column(
        "fusion_denormalized",
        "vote_score",
        existing_type=sa.NUMERIC(),
        type_=sa.Integer(),
        existing_nullable=False,
    )

    op.create_index("index_fusion_denormalized_vote_rank", "fusion_denormalized", ["vote_rank"], unique=False)

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

    op.execute("SELECT refresh_fusion_denormalized()")
    op.execute("SELECT cron.schedule('refresh_fusion_hourly','0 * * * *',$$SELECT refresh_fusion_denormalized();$$);")


def downgrade() -> None:
    op.execute("DELETE FROM cron.job WHERE jobname = 'refresh_fusion_hourly';")
    op.execute("DROP FUNCTION IF EXISTS refresh_fusion_denormalized()")

    op.execute("TRUNCATE fusion_denormalized;")

    op.drop_index(
        "index_fusion_denormalized_vote_rank",
        table_name="fusion_denormalized",
    )

    op.alter_column(
        "fusion_denormalized",
        "vote_score",
        existing_type=sa.Integer(),
        type_=sa.NUMERIC(),
        existing_nullable=False,
    )
    op.drop_column("fusion_denormalized", "vote_rank")

    op.create_index("index_fusion_denormalized_vote_count", "fusion_denormalized", ["vote_count"], unique=False)

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
    op.execute("SELECT cron.schedule('refresh_fusion_hourly','0 * * * *',$$SELECT refresh_fusion_denormalized();$$);")
