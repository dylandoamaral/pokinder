#!/usr/bin/env python3

# This script was used to clean fusions that don't have image linked in minio.

import os
import asyncio
from PIL import Image
import time

from src.component.vote.vote_table import Vote
from src.component.fusion_creator import FusionCreator
from src.utils.env import load_pokinder_dotenv, get_env_named_, retrieve_postgres_connection_string
from minio import Minio

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from src.component.fusion.fusion_table import Fusion
from sqlalchemy import delete, select
import tempfile

load_pokinder_dotenv()

temp_webp_dir = tempfile.mkdtemp()

writer_access_key = get_env_named_("MINIO_WRITER_ACCESS_KEY")
writer_secret_key = get_env_named_("MINIO_WRITER_SECRET_KEY")
host = get_env_named_("MINIO_HOST")
port = get_env_named_("MINIO_PORT")

secure = True if int(port) == 443 else False
client = Minio(f"{host}:{port}", access_key=writer_access_key, secret_key=writer_secret_key, secure=secure)

custom_sprites_path = get_env_named_("CUSTOM_SPRITE_PATH")
fusion_path = custom_sprites_path + "/CustomBattlers"
bucket_name = "fusions"


def is_object_exists(bucket_name, object_name):
    try:
        stat = client.stat_object(bucket_name, object_name)
        return stat is not None
    except Exception as e:
        print(e)
        return False


def import_sprite(bucket_name, file_path, webp_filename):
    start_time = time.time()
    try:
        webp_path = convert_png_to_webp(file_path, webp_filename)

        client.fput_object(
            bucket_name,
            webp_filename,
            webp_path,
            content_type="image/webp",
            metadata={"Cache-Control": "max-age=2592000"},  # One month
        )
    except Exception as e:
        print(f"Failed to export {webp_filename}.", e)

    end_time = time.time()

    elapsed_time = end_time - start_time
    print(f"Elapsed time: {elapsed_time:.4f} seconds to fill {bucket_name}")


def convert_png_to_webp(path, webp_filename):
    with Image.open(path) as png_image:
        webp_image = png_image.convert("RGBA")
        webp_path = os.path.join(temp_webp_dir, webp_filename)
        webp_image.save(webp_path, format="WEBP")
        return webp_path


def convert_extension_to_webp(name, append=""):
    return os.path.splitext(name)[0] + append + ".webp"


async def clean_postgres():
    # Remove outdated fusions
    engine = create_async_engine(retrieve_postgres_connection_string(local=True))
    async with AsyncSession(engine) as session:
        fusions = await session.execute(select(Fusion))
        fusions = fusions.fetchall()
        count = 0

        for fusion in fusions:
            fusion = fusion[0]
            local_path = f"{fusion_path}/{fusion.path}.png"
            file_name = f"{fusion.id}.webp"

            fusion_in_minio = is_object_exists("fusions", file_name)
            fusion_in_repository = os.path.exists(local_path)

            if not fusion_in_minio:
                if fusion_in_repository:
                    print(f"Adding {fusion.path} to minio from repository as {file_name}.")
                    import_sprite("fusions", local_path, file_name)
                    count += 1
                else:
                    print(f"Deleting {fusion.path} from database because not found in minio.")
                    await session.execute(delete(Vote).where(Vote.fusion_id == fusion.id))
                    await session.execute(delete(FusionCreator).where(FusionCreator.c.fusion_id == fusion.id))
                    await session.execute(delete(Fusion).where(Fusion.id == fusion.id))
                    count += 1
        print(f"{count} actions done.")

        await session.commit()


async def main():
    await clean_postgres()


asyncio.run(main())
