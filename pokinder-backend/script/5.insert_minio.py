#!/usr/bin/env python3

# This script was used first to fullfill the minio object system with data.
# It is now supersed by update_database script that should be adapted to populate from scratch the object system.

import os
import time

from minio import Minio
from PIL import Image
import tempfile

from src.utils.env import load_pokinder_dotenv, get_env_named_

temp_webp_dir = tempfile.mkdtemp()

load_pokinder_dotenv()

writer_access_key = get_env_named_("MINIO_WRITER_ACCESS_KEY")
writer_secret_key = get_env_named_("MINIO_WRITER_SECRET_KEY")
host = get_env_named_("MINIO_HOST")
port = get_env_named_("MINIO_PORT")

secure = True if int(port) == 443 else False
client = Minio(f"{host}:{port}", access_key=writer_access_key, secret_key=writer_secret_key, secure=secure)


def is_object_exists(bucket_name, object_name):
    try:
        stat = client.stat_object(bucket_name, object_name)
        return stat is not None
    except Exception as e:
        return False


def import_sprites(bucket_name, source_path):
    start_time = time.time()

    fusion_path = source_path
    for filename in os.listdir(fusion_path):
        pokedex_id = filename.split(".")[0]
        if filename.endswith(".png") and pokedex_id.isnumeric() and pokedex_id in ["468", "469"]:
            try:
                webp_filename = convert_extension_to_webp(filename)
                file_path = os.path.join(fusion_path, filename)
                webp_path = convert_png_to_webp(file_path, webp_filename)

                if is_object_exists(bucket_name, webp_filename):
                    print("wtf")
                    return
                    # client.remove_object(bucket_name, webp_filename)

                client.fput_object(
                    bucket_name,
                    webp_filename,
                    webp_path,
                    content_type="image/webp",
                    metadata={"Cache-Control": "max-age=2592000"},  # One month
                )
            except Exception:
                print(f"Failed to export {filename}.")

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


import_sprites(
    "pokemons",
    "./script"
)