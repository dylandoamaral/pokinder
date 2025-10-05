#!/usr/bin/env python3

# Apply all the updates between two sprite packs

import re
import json
import os
import asyncio
import tempfile
from pathlib import Path
from uuid import UUID, uuid4

from PIL import Image, ImageFile
from minio import Minio
from sqlalchemy import select, insert, update, and_
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from src.utils.env import retrieve_postgres_connection_string, get_env_named_

from src.component.pokemon.pokemon_table import Pokemon
from src.component.fusion.fusion_table import Fusion
from src.component.pokemon_family.pokemon_family_table import PokemonFamily
from src.component.family.family_table import Family
from src.component.creator.creator_table import Creator
from src.component.fusion_creator import FusionCreator

# SETUP FUNCTIONS


def get_minio_client():
    writer_access_key = get_env_named_("MINIO_USER")
    writer_secret_key = get_env_named_("MINIO_PASSWORD")
    host = get_env_named_("MINIO_HOST")
    port = get_env_named_("MINIO_PORT")

    secure = True if int(port) == 443 else False
    return Minio(f"{host}:{port}", access_key=writer_access_key, secret_key=writer_secret_key, secure=secure)


def save_state(state: dict) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)

    with STATE_PATH.open("w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def load_state() -> dict:
    default_state = {"pokemon": 0, "pokemon_family": False, "creator": False, "fusion": "1.0", "fusion_creator": False}

    if STATE_PATH.exists():
        try:
            with STATE_PATH.open("r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            return default_state
    return default_state


# GLOBAL VARIABLES

TEMP_DIR = tempfile.mkdtemp()

POKEMON_SIZE = 559

MIGRATION_PATH = Path(r"./migration/1-0_1-112")
STATE_PATH = Path(r"./tmp/state.json")
POKEMON_PATH = Path(r"C:\Users\Dylan\Temporaire\Fusion\pokemon")
FUSION_PATH = Path(r"C:\Users\Dylan\Temporaire\Fusion\after")
CREDITS_PATH = Path(r"C:\Users\Dylan\Temporaire\Fusion\Sprite Credits.csv")

MINIO_CLIENT = get_minio_client()

STATE = load_state()


# HELPER FUNCTIONS


def is_object_exists(bucket_name, object_name):
    try:
        stat = MINIO_CLIENT.stat_object(bucket_name, object_name)
        return stat is not None
    except Exception as e:
        return False


def convert_png_to_webp(path, webp_filename):
    ImageFile.LOAD_TRUNCATED_IMAGES = True
    with Image.open(path, formats=["PNG"]) as png_image:
        webp_image = png_image.convert("RGBA")
        webp_path = os.path.join(TEMP_DIR, webp_filename)
        webp_image.save(webp_path, format="WEBP")
        return webp_path


def convert_extension_to_webp(name: str) -> str:
    path = Path(name)
    return str(path.with_stem(path.stem).with_suffix(".webp"))


def import_sprite(bucket_name: str, path: str, rename_to: str | None = None):
    filename = Path(path).name

    base_name = rename_to if rename_to else Path(filename).stem
    webp_filename = convert_extension_to_webp(base_name)
    webp_path = convert_png_to_webp(path, webp_filename)

    if is_object_exists(bucket_name, webp_filename):
        MINIO_CLIENT.remove_object(bucket_name, webp_filename)

    MINIO_CLIENT.fput_object(
        bucket_name,
        webp_filename,
        webp_path,
        content_type="image/webp",
        metadata={"Cache-Control": "max-age=2592000"},
    )

    return webp_filename


# POKEMON FUNCTIONS


async def get_existing_pokemons(session) -> list[Pokemon]:
    result = await session.scalars(select(Pokemon))
    return result.all()


def get_new_pokemons(pokemon_pokedex_id_to_id: dict[int, UUID]) -> None:
    path = MIGRATION_PATH / "pokemons.json"
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    pokemons = []
    for entry in data:
        pokedex_id = entry["pokedex_id"]

        if pokedex_id <= STATE.get("pokemon", 0):
            continue

        if pokemon_pokedex_id_to_id.get(pokedex_id) is not None:
            continue

        pokemon = Pokemon(
            id=entry["id"],
            name=entry["name"],
            type_1=entry["type_1"],
            type_2=entry.get("type_2"),
            height=entry["height"],
            weight=entry["weight"],
            name_separator_index=entry["name_separator_index"],
            pokedex_id=pokedex_id,
        )
        pokemons.append(pokemon)

    return pokemons


async def add_new_pokemons(session: AsyncSession, new_pokemons: list[Pokemon]) -> None:
    for pokemon in new_pokemons:
        pokemon_name = pokemon.name
        pokemon_id = pokemon.pokedex_id

        sprite_path = POKEMON_PATH / f"{pokemon_id}.png"

        import_sprite("pokemons", sprite_path)

        session.add(pokemon)
        await session.commit()

        STATE["pokemon"] = pokemon_id
        save_state(STATE)

        print(f"Added {pokemon_name} (ID: {pokemon_id}) to database and uploaded sprite.")


# POKEMON_FAMILY FUNCTIONS


async def get_families(session) -> list[Family]:
    result = await session.scalars(select(Family))
    return result.all()


def get_new_pokemon_families(pokemon_pokedex_id_to_id: dict[int, UUID], family_name_id: dict[str, UUID]) -> list:
    if STATE.get("pokemon_family", False):
        return []

    path = MIGRATION_PATH / "pokemon_families.json"
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    pokemon_families = []
    for key, value in data.items():
        pokemon_family = {
            "pokemon_id": pokemon_pokedex_id_to_id[int(key)],
            "family_id": family_name_id[value],
        }
        pokemon_families.append(pokemon_family)

    return pokemon_families


async def add_new_pokemon_familes(session: AsyncSession, new_pokemon_families: list) -> None:
    if not new_pokemon_families:
        return

    await session.execute(insert(PokemonFamily), new_pokemon_families)
    await session.commit()

    print(f"Added {len(new_pokemon_families)} pokemon families to database.")
    STATE["pokemon_family"] = True
    save_state(STATE)


# CREATOR FUNCTIONS


async def get_existing_creators(session: AsyncSession) -> list[Creator]:
    result = await session.scalars(select(Creator))
    return result.all()


def get_new_creators(existing_creator_name_to_id: dict[str, int]) -> list[Creator]:
    if STATE.get("creator", False):
        return []

    path = MIGRATION_PATH / "creators.json"
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    creators = []
    for entry in data:
        creator_name = entry["name"]

        if existing_creator_name_to_id.get(creator_name) is not None:
            continue

        creator = Creator(
            id=entry["id"],
            name=creator_name,
        )
        creators.append(creator)

    return creators


async def add_new_creators(session: AsyncSession, new_creators: list[Creator]) -> None:
    if not new_creators:
        return

    session.add_all(new_creators)
    await session.commit()

    print(f"Added {len(new_creators)} creators to database.")
    STATE["creator"] = True
    save_state(STATE)


# FUSION FUNCTIONS


def load_fusion_actions():
    path = MIGRATION_PATH / "fusions.json"
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return data


def extract_pokemon_pokedex_ids(fusion_id):
    match = re.match(r"^(\d+\.\d+)", fusion_id)
    numbers = match.group(1).split(".")
    return int(numbers[0]), int(numbers[1])


async def remove_fusion(session: AsyncSession, old_path: str, global_path: str) -> None:
    query = (
        update(Fusion)
        .values(
            is_removed=True,
            path=f"{global_path}$",
        )
        .where(and_(Fusion.path == old_path, Fusion.is_removed.is_(False)))
    )

    await session.execute(query)


async def move_fusions(session: AsyncSession, moves: list[str]) -> None:
    temp_suffix = "_tmp$"

    for move in moves:
        old_path, _ = move.split()
        temp_path = old_path + temp_suffix
        await session.execute(
            update(Fusion).values(path=temp_path).where(and_(Fusion.path == old_path, Fusion.is_removed.is_(False)))
        )

    for move in moves:
        old_path, new_path = move.split()
        temp_path = old_path + temp_suffix
        await session.execute(
            update(Fusion).values(path=new_path).where(and_(Fusion.path == temp_path, Fusion.is_removed.is_(False)))
        )

    # NOTE: Sometimes moved sprites are a bit different so I prefere to update the sprite just in case.

    new_paths = [move.split()[1] for move in moves]
    query = select(Fusion).where(Fusion.path.in_(new_paths))
    result = await session.execute(query)
    fusions = result.scalars().all()

    for fusion in fusions:
        sprite_path = FUSION_PATH / f"{fusion.path}.png"
        import_sprite("fusions", sprite_path, str(fusion.id))


# NOTE: We should use add new fusions after remove and move old ones.
async def add_fusion(
    session: AsyncSession,
    pokemon_pokedex_id_to_id: dict[int, UUID],
    fusion_id: UUID,
    path: str,
) -> None:
    head_pokedex_id, body_pokedex_id = extract_pokemon_pokedex_ids(path)

    sprite_path = FUSION_PATH / f"{path}.png"

    import_sprite("fusions", sprite_path, str(fusion_id))

    fusion = Fusion(
        id=fusion_id,
        path=path,
        head_id=pokemon_pokedex_id_to_id[head_pokedex_id],
        body_id=pokemon_pokedex_id_to_id[body_pokedex_id],
        is_removed=False,
    )
    session.add(fusion)


async def update_fusion(
    session: AsyncSession,
    pokemon_pokedex_id_to_id: dict[int, UUID],
    global_path: str,
    actions: dict,
) -> None:
    if actions.get("REMOVE"):
        for path in actions["REMOVE"]:
            await remove_fusion(session, path, global_path)

    if actions.get("MOVE"):
        await move_fusions(session, actions["MOVE"])

    if actions.get("ADD"):
        for move in actions["ADD"]:
            path, uuid = move.split()
            fusion_id = UUID(uuid)
            await add_fusion(session, pokemon_pokedex_id_to_id, fusion_id, path)

    await session.commit()

    STATE["fusion"] = global_path
    save_state(STATE)

    print(f"Updated {global_path} to database and uploaded sprite(s).")


async def update_fusions(
    session: AsyncSession,
    pokemon_pokedex_id_to_id: dict[int, UUID],
    fusion_actions: dict,
) -> None:
    if not fusion_actions:
        return

    head_pokedex_id_state, body_pokedex_id_state = map(int, STATE["fusion"].split("."))

    for head_pokedex_id in range(head_pokedex_id_state, POKEMON_SIZE + 1):
        for body_pokedex_id in range(1, POKEMON_SIZE + 1):
            global_path = f"{head_pokedex_id}.{body_pokedex_id}"

            if head_pokedex_id == head_pokedex_id_state and body_pokedex_id <= body_pokedex_id_state:
                continue

            if not fusion_actions.get(global_path):
                continue

            await update_fusion(
                session=session,
                pokemon_pokedex_id_to_id=pokemon_pokedex_id_to_id,
                global_path=global_path,
                actions=fusion_actions[global_path],
            )


async def get_fusion_path_to_id(session: AsyncSession) -> dict[str, UUID]:
    query = (
        select(Fusion.path, Fusion.id)
        .outerjoin(FusionCreator, Fusion.id == FusionCreator.c.fusion_id)
        .where(and_(FusionCreator.c.creator_id.is_(None), Fusion.is_removed.is_(False)))
    )

    result = await session.execute(query)
    return {path: fusion_id for path, fusion_id in result.all()}


# FUSION_CREATOR FUNCTIONS


async def add_new_fusion_creators(
    session: AsyncSession,
    creator_name_to_id: dict[str, UUID],
    fusion_path_to_id: dict[str, UUID],
) -> None:
    if STATE.get("fusion_creator", False):
        return

    new_fusion_creators = []

    with open(CREDITS_PATH, encoding="utf-8") as credit_file:
        credit_content = credit_file.read()
        for fusion_record in credit_content.split("\n"):
            fusion_information = fusion_record.split(",")
            fusion_path = fusion_information[0]

            if not fusion_path_to_id.get(fusion_path):
                continue

            creator_names = fusion_information[1] if fusion_information[1] != "" else "UNKNOWN"

            for creator_name in creator_names.split(" & "):
                new_fusion_creators.append(
                    {
                        "fusion_id": fusion_path_to_id[fusion_path],
                        "creator_id": creator_name_to_id[creator_name],
                    }
                )

    if not new_fusion_creators:
        return

    await session.execute(insert(FusionCreator), new_fusion_creators)
    await session.commit()

    print(f"Added {len(new_fusion_creators)} fusion creators to database.")
    STATE["fusion_creator"] = True
    save_state(STATE)


async def main():
    engine = create_async_engine(retrieve_postgres_connection_string(local=True))

    async with AsyncSession(engine) as session:
        # NOTE: Retrieve existing pokemons
        existing_pokemons = await get_existing_pokemons(session)
        pokemon_pokedex_id_to_id = {p.pokedex_id: p.id for p in existing_pokemons}

        # NOTE: Add new pokemons
        new_pokemons = get_new_pokemons(pokemon_pokedex_id_to_id)
        new_pokemon_pokedex_id_to_id = {p.pokedex_id: p.id for p in new_pokemons}
        await add_new_pokemons(session, new_pokemons)

        # NOTE: Build a mapping between pokemon pokedex_id and id
        pokemon_pokedex_id_to_id.update(new_pokemon_pokedex_id_to_id)

        # NOTE: Retrieve families
        families = await get_families(session)
        family_name_id = {f.name: f.id for f in families}

        # NOTE: Add new pokemon families
        new_pokemon_families = get_new_pokemon_families(pokemon_pokedex_id_to_id, family_name_id)
        await add_new_pokemon_familes(session, new_pokemon_families)

        # NOTE: Retrieve existing creators
        existing_creators = await get_existing_creators(session)
        creator_name_to_id = {c.name: c.id for c in existing_creators}

        # NOTE: Add new creators
        new_creators = get_new_creators(creator_name_to_id)
        new_creator_name_to_id = {c.name: c.id for c in new_creators}
        await add_new_creators(session, new_creators)

        # NOTE: Build a mapping between creator name and id
        creator_name_to_id.update(new_creator_name_to_id)

        # NOTE: Update fusions
        fusion_actions = load_fusion_actions()
        await update_fusions(session, pokemon_pokedex_id_to_id, fusion_actions)

        # NOTE: Build a mapping between fusion path and id
        fusion_path_to_id = await get_fusion_path_to_id(session)
        await add_new_fusion_creators(session, creator_name_to_id, fusion_path_to_id)


asyncio.run(main())
