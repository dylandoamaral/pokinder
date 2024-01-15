#!/usr/bin/env python3

# This script was used to after update_database, to clean old fusions and stored fusions in minio by path.
# This script should not be used again because we don't want to delete outdated fusions now, but we want to tag them as outdated.

import os
import asyncio

from src.utils.env import load_pokinder_dotenv, get_env_named_, retrieve_postgres_connection_string
from src.utils.uuid import is_uuid
from minio import Minio
from datetime import datetime, timezone, timedelta

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from src.component.fusion.fusion_table import Fusion
from src.component.vote.vote_table import Vote
from sqlalchemy import delete, select

load_pokinder_dotenv()

writer_access_key = get_env_named_("MINIO_WRITER_ACCESS_KEY")
writer_secret_key = get_env_named_("MINIO_WRITER_SECRET_KEY")
host = get_env_named_("MINIO_HOST")
port = get_env_named_("MINIO_PORT")

secure = True if int(port) == 443 else False
client = Minio(f"{host}:{port}", access_key=writer_access_key, secret_key=writer_secret_key, secure=secure)

custom_sprites_path = get_env_named_("CUSTOM_SPRITE_PATH")
fusion_path = custom_sprites_path + "/CustomBattlers"
bucket_name = "fusions"


def clean_minio():
    # Remove useless file in minio
    objects = client.list_objects(bucket_name, recursive=True)
    for object in objects:
        filename = object.object_name
        if not is_uuid(filename.split(".")[0]):
            client.remove_object(bucket_name, filename)
            print(f"Deleting {filename} in bucket {bucket_name}...")


async def clean_postgres():
    # Remove outdated fusions
    engine = create_async_engine(retrieve_postgres_connection_string(local=True))
    async with AsyncSession(engine) as session:
        fusions = await session.execute(
            select(Fusion).filter(Fusion.created_at < datetime(2024, 1, 1).replace(tzinfo=timezone.utc))
        )
        fusions = fusions.fetchall()

        count = 0
        for fusion in fusions:
            fusion = fusion[0]
            local_path = f"{fusion_path}/{fusion.path}.png"
            if not os.path.exists(local_path):
                print(f"Deleting votes and fusion for path {fusion.path}")
                await session.execute(delete(Vote).where(Vote.fusion_id == fusion.id))
                await session.execute(delete(Fusion).where(Fusion.id == fusion.id))
                count += 1
        print(f"{count} deleted fusions.")

        await session.commit()


async def main():
    clean_minio()
    await clean_postgres()


asyncio.run(main())
