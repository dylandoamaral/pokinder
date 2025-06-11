#!/usr/bin/env python3

# This script was used first to fulfill the postgres SQL database with data.
# It is now supersed by update_database script that should be adapted to populate from scratch the database.

import asyncio
import logging
import re
from uuid import uuid4

import requests
from bs4 import BeautifulSoup
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from src.component.creator.creator_table import Creator
from src.component.fusion.fusion_table import Fusion
from src.component.pokemon.pokemon_table import Pokemon
from src.component.family.family_table import Family
from src.data.pokemon_families import pokemon_families
from src.data.pokemon_name_separator_indexes import pokemon_name_separator_indexes
from src.utils.env import retrieve_postgres_connection_string


def extract_pokemon_pokedex_ids(fusion_id):
    match = re.match(r"^(\d+\.\d+)", fusion_id)
    if match:
        numbers = match.group(1).split(".")
        return int(numbers[0]), int(numbers[1])
    else:
        return None


async def main():
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

    pack_name = "2023-07.csv"
    credits_path = f"./credit/{pack_name}"

    fusion_mapping = dict()
    creator_names = set()

    with open(credits_path) as credit_file:
        credit_content = credit_file.read()
        for fusion_record in credit_content.split("\n"):
            fusion_information = fusion_record.split(",")
            fusion_id = fusion_information[0]
            creator_name = fusion_information[1] if fusion_information[1] != "" else "UNKNOWN"
            fusion_mapping[fusion_id] = creator_name
            creator_names.add(creator_name)

    engine = create_async_engine(retrieve_postgres_connection_string())

    async with AsyncSession(engine) as session:
        logging.info("Inserting families...")
        families = {family_name: Family(id=uuid4(), name=family_name) for family_name in pokemon_families.keys()}
        session.add_all(families.values())

        logging.info("Inserting pokemons...")
        pokemons = dict()
        html = requests.get("https://infinitefusion.fandom.com/wiki/Pok%C3%A9dex")
        soup = BeautifulSoup(html.content, "html.parser")

        for pokemon_row in soup.select(".IFTable.PokedexTable tbody tr"):
            columns = pokemon_row.find_all("td")
            if len(columns) > 4:
                pokemon_pokedex_id = int(columns[0].text.strip().split(" ")[0])
                pokemon_name = columns[2].text.strip()
                pokemon_type_1 = columns[3].text.strip()
                maybe_pokemon_type_2 = columns[4].text.strip()
                pokemon_type_2 = None if maybe_pokemon_type_2 not in pokemon_types else maybe_pokemon_type_2
                pokemon_id = uuid4()
                pokemon_name_separator_index = pokemon_name_separator_indexes.get(pokemon_name, "-1")
                pokemon = Pokemon(
                    id=pokemon_id,
                    pokedex_id=pokemon_pokedex_id,
                    name=pokemon_name,
                    type_1=pokemon_type_1,
                    type_2=pokemon_type_2,
                    name_separator_index=pokemon_name_separator_index,
                )
                for family_name, members in pokemon_families.items():
                    if pokemon.name in members:
                        pokemon.families.append(families[family_name])
                pokemons[pokemon_pokedex_id] = pokemon
        session.add_all(pokemons.values())

        logging.info("Inserting creators...")
        creators = dict()
        for creator_name in creator_names:
            creator_id = uuid4()
            creators[creator_name] = Creator(id=creator_id, name=creator_name)
        session.add_all(creators.values())

        logging.info("Inserting fusions...")
        fusions = []
        for fusion_id, creator_name in fusion_mapping.items():
            maybe_pokemon_ids = extract_pokemon_pokedex_ids(fusion_id)
            if maybe_pokemon_ids:
                head_pokedex_id, body_pokedex_id = maybe_pokemon_ids
                fusion = Fusion(
                    path=fusion_id,
                    is_removed=False,
                    creator_id=creators[creator_name].id,
                    head_id=pokemons[head_pokedex_id].id,
                    body_id=pokemons[body_pokedex_id].id,
                )
                fusions.append(fusion)
            else:
                continue
        session.add_all(fusions)

        await session.commit()


asyncio.run(main())
