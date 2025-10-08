#!/usr/bin/env python3

# Generate all the updates between two sprite packs.

# NOTE: I do migration in two steps to have history modifications and to avoid doing these calculations on the real server.
# NOTE: Defining name_separator_index is done manually.
# NOTE: The file pokemon_families.json is done manually.

from pathlib import Path
from PIL import Image, ImageFile
import numpy as np
import re
from collections import defaultdict
import json
from uuid import uuid4
from src.component.creator.creator_table import Creator
from src.component.pokemon.pokemon_table import Pokemon
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from src.utils.env import retrieve_postgres_connection_string
import requests
from bs4 import BeautifulSoup
from src.data.pokemon_name_separator_indexes import pokemon_name_separator_indexes
import asyncio

before_sprites_path = Path(r"C:\Users\Dylan\Temporaire\Fusion\before")
after_sprites_path = Path(r"C:\Users\Dylan\Temporaire\Fusion\after")
credits_path = Path(r"C:\Users\Dylan\Temporaire\Fusion\Sprite Credits.csv")

POKEMON_SIZE = 559
MIGRATION_PATH = "./migration/1-0_1-112"


# CREATOR FUNCTIONS


def is_fusion(path):
    return path.count(".") == 1


async def get_existing_creators(session):
    result = await session.scalars(select(Creator))
    return result.all()


async def generate_creator_actions() -> None:
    engine = create_async_engine(retrieve_postgres_connection_string(local=True))

    async with AsyncSession(engine) as session:
        existing_creators = await get_existing_creators(session)
        existing_creator_names = [creator.name for creator in existing_creators]

        creator_names = []

        creator_actions = []

        with open(credits_path, encoding="utf-8") as credit_file:
            credit_content = credit_file.read()
            for fusion_record in credit_content.split("\n"):
                fusion_information = fusion_record.split(",")
                fusion_path = fusion_information[0]
                if not is_fusion(fusion_path):
                    continue
                creator_name = fusion_information[1] if fusion_information[1] != "" else "UNKNOWN"

                if " & " in creator_name:
                    for name in creator_name.split(" & "):
                        creator_names.append(name)
                else:
                    creator_names.append(creator_name)

        for creator_name in creator_names:
            if creator_name not in existing_creator_names:
                creator_id = str(uuid4())
                creator_actions.append({"id": creator_id, "name": creator_name})
                existing_creator_names.append(creator_name)

        output_file = Path(f"{MIGRATION_PATH}/creators.json")
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_file, "w") as f:
            json.dump(creator_actions, f, indent=4)


# POKEMON FUNCTIONS


async def generate_pokemon_actions() -> None:
    engine = create_async_engine(retrieve_postgres_connection_string(local=True))

    async with AsyncSession(engine) as session:
        result = await session.scalars(select(Pokemon))
        existing_pokemons = {pokemon.pokedex_id: pokemon for pokemon in result.all()}

        pokemon_actions = []

        html = requests.get("https://infinitefusion.fandom.com/wiki/Pok%C3%A9dex")
        soup = BeautifulSoup(html.content, "html.parser")

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

        for pokemon_row in soup.select(".IFTable.PokedexTable tbody tr"):
            columns = pokemon_row.find_all("td")
            if len(columns) > 4:
                pokemon_pokedex_id = int(columns[0].text.strip().split(" ")[0])

                # NOTE: Pokemon above this number don't have fusions yet.
                if pokemon_pokedex_id > 559:
                    break

                maybe_pokemon_id = existing_pokemons.get(pokemon_pokedex_id)

                if maybe_pokemon_id is not None:
                    continue

                pokemon_name = columns[2].text.strip()
                pokemon_type_1 = columns[3].text.strip()
                maybe_pokemon_type_2 = columns[4].text.strip()
                pokemon_type_2 = None if maybe_pokemon_type_2 not in pokemon_types else maybe_pokemon_type_2
                pokemon_id = str(uuid4())
                pokemon_name_separator_index = pokemon_name_separator_indexes.get(pokemon_name, "-1")

                api_pokemon_name = (
                    pokemon_name.lower()
                    .replace(" ", "-")
                    .replace(".", "")
                    .replace("'", "")
                    .replace("♀", "-f")
                    .replace("♂", "-m")
                    .replace("-style", "")
                    .replace("-form", "")
                )

                if api_pokemon_name == "aegislash":
                    api_pokemon_name = "aegislash-shield"
                if api_pokemon_name == "giratina":
                    api_pokemon_name = "giratina-altered"
                if api_pokemon_name == "mimikyu":
                    api_pokemon_name = "mimikyu-disguised"
                if api_pokemon_name == "deoxys":
                    api_pokemon_name = "deoxys-normal"

                response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{api_pokemon_name}")

                FALLBACK_POKEMON = {
                    "Pumpkaboo": {"weight": 50, "height": 4},
                    "Gourgeist": {"weight": 125, "height": 9},
                    "Minior Meteor Form": {"weight": 400, "height": 3},
                    "Minior Core Form": {"weight": 3, "height": 3},
                }

                if response.status_code == 200:
                    pokemon_data = response.json()

                    weight = pokemon_data.get("weight")
                    height = pokemon_data.get("height")
                else:
                    if pokemon_name in FALLBACK_POKEMON:
                        fallback = FALLBACK_POKEMON[pokemon_name]
                        weight = fallback["weight"]
                        height = fallback["height"]
                    else:
                        print(f"Failed to retrieve data for Pokémon '{pokemon_name}'")
                        weight = -1
                        height = -1

                pokemon_actions.append(
                    {
                        "id": pokemon_id,
                        "pokedex_id": pokemon_pokedex_id,
                        "name": pokemon_name,
                        "type_1": pokemon_type_1,
                        "type_2": pokemon_type_2,
                        "name_separator_index": pokemon_name_separator_index,
                        "weight": weight,
                        "height": height,
                    }
                )

        output_file = Path(f"{MIGRATION_PATH}/pokemons.json")
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_file, "w") as f:
            json.dump(pokemon_actions, f, indent=4)

    # FUSION FUNCTIONS


def build_sprite_dictionary(base_path: Path) -> dict[str, list[str]]:
    files = [f.name for f in base_path.iterdir() if f.is_file() and f.suffix == ".png"]
    sprite_dict = defaultdict(list)

    pattern = re.compile(r"^(\d+\.\d+)([a-z]?)\.png$")

    for name in files:
        match = pattern.match(name)
        if match:
            base_key = match.group(1)
            sprite_dict[base_key].append(name)

    return dict(sprite_dict)


def load_image(path: Path) -> Image:
    ImageFile.LOAD_TRUNCATED_IMAGES = True
    return Image.open(path, formats=["PNG"]).convert("RGBA")


def compute_image_similarity(img1_path: Path, img2_path: Path) -> float:
    img1 = load_image(img1_path)
    img2 = load_image(img2_path)

    bbox1 = img1.getchannel("A").getbbox()
    bbox2 = img2.getchannel("A").getbbox()

    if not bbox1 or not bbox2:
        return 0.0

    img1_cropped = img1.crop(bbox1)
    img2_cropped = img2.crop(bbox2)

    if img1_cropped.size != img2_cropped.size:
        img2_cropped = img2_cropped.resize(img1_cropped.size, resample=Image.BICUBIC)

    arr1 = np.array(img1_cropped, dtype=np.int16)
    arr2 = np.array(img2_cropped, dtype=np.int16)

    mask1 = arr1[..., 3] > 0
    mask2 = arr2[..., 3] > 0
    mask = mask1 | mask2

    if not np.any(mask):
        return 0.0

    rgb1 = arr1[..., :3][mask]
    rgb2 = arr2[..., :3][mask]

    diff = np.abs(rgb1 - rgb2)
    total_diff = diff.sum()

    max_diff = rgb1.size * 255
    score = 100 - (total_diff / max_diff * 100)

    return max(0.0, float(score))


def compute_shape_similarity(img1_path: Path, img2_path: Path) -> bool:
    img1 = load_image(img1_path)
    img2 = load_image(img2_path)

    bbox1 = img1.getchannel("A").getbbox()
    bbox2 = img2.getchannel("A").getbbox()

    if not bbox1 and not bbox2:
        return True

    img1_cropped = img1.crop(bbox1)
    img2_cropped = img2.crop(bbox2)

    alpha1 = np.array(img1_cropped.getchannel("A")) > 0
    alpha2 = np.array(img2_cropped.getchannel("A")) > 0

    if alpha1.shape != alpha2.shape:
        try:
            width1, height1 = bbox1[2] - bbox1[0], bbox1[3] - bbox1[1]

        except Exception:
            width1, height1 = 0, 0
        try:
            width2, height2 = bbox2[2] - bbox2[0], bbox2[3] - bbox2[1]
        except Exception:
            width2, height2 = 0, 0

        # NOTE: Some fusions change slightly in shape between versions and we should be able to detect them.
        if abs(width1 - width2) < 10 and abs(height1 - height2) < 10:
            return compute_image_similarity(img1_path, img2_path) > 0.75
        else:
            return False

    diff_count = np.sum(alpha1 != alpha2)
    total_pixels = alpha1.size
    diff_ratio = diff_count / total_pixels

    return diff_ratio <= 0.025


def generate_fusion_actions() -> None:
    fusion_actions = {}

    before_paths_dictionary = build_sprite_dictionary(before_sprites_path)
    after_paths_dictionary = build_sprite_dictionary(after_sprites_path)

    for head_id in range(0, POKEMON_SIZE + 1):
        for body_id in range(0, POKEMON_SIZE + 1):
            path = f"{head_id}.{body_id}"
            before_paths = sorted(before_paths_dictionary.get(path, []))
            after_paths = sorted(after_paths_dictionary.get(path, []))

            actions = {"ADD": [], "REMOVE": [], "MOVE": []}

            if len(before_paths) == 0 and len(after_paths) == 0:
                continue
            elif len(before_paths) == 0 and len(after_paths) > 0:
                for after_path in after_paths:
                    actions["ADD"].append(f"{after_path.removesuffix(".png")} {uuid4()}")
            elif len(before_paths) > 0 and len(after_paths) == 0:
                for before_path in before_paths:
                    actions["REMOVE"].append(before_path.removesuffix(".png"))
            else:
                for after_path in after_paths:
                    after_file = after_sprites_path / after_path
                    before_path_matched = None
                    best_image_similarity = 0

                    for before_path in before_paths:
                        before_file = before_sprites_path / before_path

                        is_shape_similar = compute_shape_similarity(after_file, before_file)

                        if is_shape_similar:
                            image_similarity = compute_image_similarity(after_file, before_file)

                            if image_similarity < 75:
                                continue

                            if before_path_matched is None or image_similarity > best_image_similarity:
                                before_path_matched = before_path
                                best_image_similarity = image_similarity

                    if after_path == before_path_matched:
                        before_paths.remove(before_path_matched)
                        continue

                    if before_path_matched is not None and after_path != before_path_matched:
                        before_paths.remove(before_path_matched)
                        actions["MOVE"].append(
                            f"{before_path_matched.removesuffix('.png')} {after_path.removesuffix('.png')}"
                        )
                        continue

                    if before_path_matched is None:
                        actions["ADD"].append(f"{after_path.removesuffix(".png")} {uuid4()}")

                for before_path in before_paths:
                    actions["REMOVE"].append(before_path.removesuffix(".png"))

            actions = {k: v for k, v in actions.items() if v}

            if actions:
                fusion_actions[path] = actions

    output_file = Path(f"{MIGRATION_PATH}/fusions.json")
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, "w") as f:
        json.dump(fusion_actions, f, indent=4)


async def main():
    # await generate_pokemon_actions()
    # await generate_creator_actions()
    generate_fusion_actions()
    # print(compute_shape_similarity(before_sprites_path / "235.354a.png", after_sprites_path / "235.354a.png"))


asyncio.run(main())
