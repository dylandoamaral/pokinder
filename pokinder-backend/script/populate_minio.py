#!/usr/bin/env python3

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

client = Minio(f"{host}:9000", access_key=writer_access_key, secret_key=writer_secret_key, secure=False)


def import_sprites(bucket_name, source_path, condition):
    start_time = time.time()

    fusion_path = source_path
    for filename in os.listdir(fusion_path):
        if condition(filename):
            webp_filename = convert_extendion_to_webp(filename)
            file_path = os.path.join(fusion_path, filename)
            webp_path = convert_png_to_webp(file_path, webp_filename)
            client.fput_object(bucket_name, webp_filename, webp_path)
            client.fput_object(
                bucket_name,
                convert_extendion_to_webp(webp_filename, "-144px"),
                convert_extendion_to_webp(webp_path, "-144px"),
            )

    end_time = time.time()

    elapsed_time = end_time - start_time
    print(f"Elapsed time: {elapsed_time:.4f} seconds to fill {bucket_name}")


def convert_png_to_webp(path, webp_filename):
    with Image.open(path) as png_image:
        webp_image = png_image.convert("RGBA")
        webp_path = os.path.join(temp_webp_dir, webp_filename)
        webp_path_144 = convert_extendion_to_webp(webp_path, "-144px")
        webp_image.save(webp_path, format="WEBP")
        webp_image.resize((144, 144)).save(webp_path_144, format="WEBP")
        return webp_path


def convert_extendion_to_webp(name, append=""):
    return os.path.splitext(name)[0] + append + ".webp"


import_sprites(
    "fusions",
    "../pokinder-frontend/public/packs/2023-07/fusions",
    lambda filename: filename.endswith(".png"),
)
# import_sprites(
#    "pokemons",
#    "../pokinder-frontend/public/packs/2023-07/pokemons",
#    lambda filename: filename.endswith(".png") and filename.split(".")[0].isnumeric(),
# )
