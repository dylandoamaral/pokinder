"""Fix reference doublons in fusion denormalized

Revision ID: b44f2d6a3b27
Revises: 09e8d2eb51ae
Create Date: 2025-11-12 12:41:26.660569

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b44f2d6a3b27"
down_revision: Union[str, None] = "09e8d2eb51ae"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("DELETE FROM cron.job WHERE jobname = 'refresh_fusion_hourly';")

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

    op.execute("DROP MATERIALIZED VIEW fusion_denormalized")

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
                json_agg(DISTINCT jsonb_build_object('name', head_family.name)) FILTER (WHERE head_family.id IS NOT NULL),
                '[]'
            )::jsonb AS head_families,
            body.name AS body_name,
            body.name_separator_index AS body_name_separator_index,
            body.type_1 AS body_type_1,
            body.type_2 AS body_type_2,
            body.height AS body_height,
            body.weight AS body_weight,
            body.pokedex_id AS body_pokedex_id,
            COALESCE(
                json_agg(DISTINCT jsonb_build_object('name', body_family.name)) FILTER (WHERE body_family.id IS NOT NULL),
                '[]'
            )::jsonb AS body_families,
            COALESCE(
                json_agg(DISTINCT jsonb_build_object('id', creator.id, 'name', creator.name)) FILTER (WHERE creator.id IS NOT NULL),
                '[]'
            )::jsonb AS creators,
            COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                    'id', reference.id,
                    'name', reference.name,
                    'source', reference.source,
                    'family_name', reference_family.name
                )) FILTER (WHERE reference.id IS NOT NULL),
                '[]'
            )::jsonb AS "references"
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
        WHERE fusion.is_hidden IS FALSE
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


def downgrade() -> None:
    op.execute("DELETE FROM cron.job WHERE jobname = 'refresh_fusion_hourly';")

    op.drop_index(
        "index_fusion_denormalized_vote_count",
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

    op.execute("DROP MATERIALIZED VIEW fusion_denormalized")

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
        WHERE fusion.is_hidden IS FALSE
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
