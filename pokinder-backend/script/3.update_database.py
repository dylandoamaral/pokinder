#!/usr/bin/env python3

# This script was used to update both the database and minio with new sprites from https://gitlab.com/pokemoninfinitefusion/customsprites.
# For technical reason, sprites are now stored using their identifier and not their path.

import asyncio
import logging
import re
import os
from uuid import uuid4

import requests
from bs4 import BeautifulSoup
from minio import Minio
from PIL import Image
import tempfile

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import exc

from src.component.creator.creator_table import Creator
from src.component.family.family_table import Family
from src.component.fusion.fusion_table import Fusion
from src.component.pokemon.pokemon_table import Pokemon
from src.utils.env import retrieve_postgres_connection_string
from src.data.pokemon_name_separator_indexes import pokemon_name_separator_indexes

from src.utils.env import load_pokinder_dotenv, get_env_named_

temp_webp_dir = tempfile.mkdtemp()

load_pokinder_dotenv()

writer_access_key = get_env_named_("MINIO_WRITER_ACCESS_KEY")
writer_secret_key = get_env_named_("MINIO_WRITER_SECRET_KEY")
host = get_env_named_("MINIO_HOST")
port = get_env_named_("MINIO_PORT")

secure = True if int(port) == 443 else False
client = Minio(f"{host}:{port}", access_key=writer_access_key, secret_key=writer_secret_key, secure=secure)

custom_sprites_path = get_env_named_("CUSTOM_SPRITE_PATH")


def is_object_exists(bucket_name, object_name):
    try:
        stat = client.stat_object(bucket_name, object_name)
        return stat is not None
    except Exception as e:
        return False


def import_sprite(path, id, bucket_name, source):
    filename = f"{path}.png"
    try:
        webp_filename = convert_extension_to_webp(filename)
        file_path = os.path.join(f"{custom_sprites_path}/{source}", filename)
        webp_path = convert_png_to_webp(file_path, webp_filename)
        output_filename = f"{id}.webp"

        if is_object_exists(bucket_name, output_filename):
            client.remove_object(bucket_name, output_filename)

        client.fput_object(
            bucket_name,
            output_filename,
            webp_path,
            content_type="image/webp",
            metadata={"Cache-Control": "max-age=2592000"},  # One month
        )
        return True
    except Exception as e:
        print(f"Failed to export {filename} because: {e}.")
        return False


def convert_png_to_webp(path, webp_filename):
    with Image.open(path) as png_image:
        webp_image = png_image.convert("RGBA")
        webp_path = os.path.join(temp_webp_dir, webp_filename)
        webp_image.save(webp_path, format="WEBP")
        return webp_path


def convert_extension_to_webp(name, append=""):
    return os.path.splitext(name)[0] + append + ".webp"


def extract_pokemon_pokedex_ids(fusion_id):
    match = re.match(r"^(\d+\.\d+)", fusion_id)
    if match:
        numbers = match.group(1).split(".")
        return int(numbers[0]), int(numbers[1])
    else:
        return None


async def get_creator_id(creator_name, session):
    result = await session.execute(select(Creator).filter_by(name=creator_name))
    maybe_creator = result.first()
    if not maybe_creator:
        return None
    return maybe_creator[0].id


async def get_pokemon_id(pokedex_id, session):
    result = await session.execute(select(Pokemon).filter_by(pokedex_id=pokedex_id))
    maybe_pokemon = result.first()
    if not maybe_pokemon:
        return None
    return maybe_pokemon[0].id


async def get_fusion_id(fusion_path, session):
    result = await session.execute(select(Fusion).filter_by(path=fusion_path))
    maybe_fusion = result.first()
    if not maybe_fusion:
        return None
    return maybe_fusion[0].id


def is_fusion(path):
    return path.count(".") == 1


async def main():
    credits_path = f"{custom_sprites_path}/Sprite Credits.csv"

    fusion_mapping = dict()
    creator_names = set()

    pokemon_types = [
        "Normal",
        "Fire",
        "Water",
        "Electric",
        "Grass",
        "Ice",
        "Fighting",
        "Poison",
        "Ground",
        "Flying",
        "Psychic",
        "Bug",
        "Rock",
        "Ghost",
        "Dragon",
        "Dark",
        "Steel",
        "Fairy",
    ]

    with open(credits_path) as credit_file:
        credit_content = credit_file.read()
        for fusion_record in credit_content.split("\n"):
            fusion_information = fusion_record.split(",")
            fusion_path = fusion_information[0]
            if not is_fusion(fusion_path):
                continue
            creator_name = fusion_information[1] if fusion_information[1] != "" else "UNKNOWN"
            fusion_mapping[fusion_path] = creator_name
            creator_names.add(creator_name)

    engine = create_async_engine(retrieve_postgres_connection_string(local=True))

    async with AsyncSession(engine) as session:
        logging.info("Inserting not inserted pokemons...")
        pokemons = dict()
        pokemons_to_add = dict()
        html = requests.get("https://infinitefusion.fandom.com/wiki/Pok%C3%A9dex")
        soup = BeautifulSoup(html.content, "html.parser")

        for pokemon_row in soup.select(".IFTable.PokedexTable tbody tr"):
            columns = pokemon_row.find_all("td")
            if len(columns) > 4:
                pokemon_pokedex_id = int(columns[0].text.strip().split(" ")[0])
                maybe_pokemon_id = await get_pokemon_id(pokemon_pokedex_id, session)

                if maybe_pokemon_id is not None:
                    pokemons[pokemon_pokedex_id] = maybe_pokemon_id
                    import_sprite(pokemon_pokedex_id, pokemon_pokedex_id, "pokemons", "Other/BaseSprites")
                else:
                    pokemon_name = columns[2].text.strip()
                    pokemon_type_1 = columns[3].text.strip()
                    maybe_pokemon_type_2 = columns[4].text.strip()
                    pokemon_type_2 = None if maybe_pokemon_type_2 not in pokemon_types else maybe_pokemon_type_2
                    pokemon_id = uuid4()
                    print(f"Importing new pokemon {pokemon_name} with id {pokemon_id}.")
                    pokemon_name_separator_index = pokemon_name_separator_indexes.get(pokemon_name, "-1")
                    pokemon = Pokemon(
                        id=pokemon_id,
                        pokedex_id=pokemon_pokedex_id,
                        name=pokemon_name,
                        type_1=pokemon_type_1,
                        type_2=pokemon_type_2,
                        name_separator_index=pokemon_name_separator_index,
                    )
                    pokemons[pokemon_pokedex_id] = pokemon_id
                    pokemons_to_add[pokemon_pokedex_id] = pokemon
                    import_sprite(pokemon_pokedex_id, pokemon_pokedex_id, "pokemons", "Other/BaseSprites")
        session.add_all(pokemons_to_add.values())

        await session.commit()

        logging.info("Inserting not inserted creators...")
        creators = dict()
        creators_to_add = dict()
        for creator_name in creator_names:
            maybe_creator_id = await get_creator_id(creator_name, session)
            if maybe_creator_id:
                creators[creator_name] = maybe_creator_id
            else:
                creator_id = uuid4()
                print(f"Importing new creator {creator_name} with id {creator_id}.")
                creators[creator_name] = creator_id
                creators_to_add[creator_name] = Creator(id=creator_id, name=creator_name)
        session.add_all(creators_to_add.values())

        await session.commit()

        logging.info("Inserting fusions...")
        for fusion_path, creator_name in fusion_mapping.items():
            if not is_fusion(fusion_path):
                print(f"Ignore path {fusion_path} because it is not a dual fusion.")
                continue
            maybe_fusion_id = await get_fusion_id(fusion_path, session)
            if maybe_fusion_id is not None:
                print(f"Importing old fusion for path {fusion_path} with id {maybe_fusion_id}.")
                import_sprite(fusion_path, maybe_fusion_id, "fusions", "CustomBattlers")
            else:
                maybe_pokemon_ids = extract_pokemon_pokedex_ids(fusion_path)
                if maybe_pokemon_ids:
                    fusion_id = uuid4()
                    head_pokedex_id, body_pokedex_id = maybe_pokemon_ids
                    try:
                        fusion = Fusion(
                            id=fusion_id,
                            path=fusion_path,
                            is_removed=False,
                            creator_id=creators[creator_name],
                            head_id=pokemons[head_pokedex_id],
                            body_id=pokemons[body_pokedex_id],
                        )
                    except KeyError as e:
                        print(f"Ignoring because a pokemon is unknown: {e}.")
                        continue
                    try:
                        print(f"Importing new fusion for path {fusion_path} with id {fusion_id}.")
                        is_sprite_imported = import_sprite(fusion_path, fusion_id, "fusions", "CustomBattlers")
                        if is_sprite_imported:
                            session.add(fusion)
                            await session.commit()
                        else:
                            print(f"Ignored because sprite doesn't exist.")
                    except Exception as e:
                        print(f"IntegrityError: {e}. Ignoring the row for fusion {fusion_path}.")
                        return
                else:
                    print(f"Can't extract pokemons from {fusion_path}.")
                    continue

        await session.commit()


asyncio.run(main())
