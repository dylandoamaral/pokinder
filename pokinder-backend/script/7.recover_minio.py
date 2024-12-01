#!/usr/bin/env python3

# This script is used to recover Minio backup.
# NOTE: You should run the following commands after:
# - mc anonymous set public pokinder-local/pokemons
# - mc anonymous set public pokinder-local/fusions

import os
import zipfile
import json

from minio import Minio

from src.utils.env import get_env_named_

pokemons_path = "/Users/dylandoamaral/Downloads/2024-12-01-pokemons.zip"
pokemons_bucket = "pokemons"
fusions_path = "/Users/dylandoamaral/Downloads/2024-12-01-fusions.zip"
fusions_bucket = "fusions"

writer_access_key = get_env_named_("MINIO_WRITER_ACCESS_KEY")
writer_secret_key = get_env_named_("MINIO_WRITER_SECRET_KEY")
host = get_env_named_("MINIO_HOST")
port = get_env_named_("MINIO_PORT")

secure = True if int(port) == 443 else False
client = Minio(f"{host}:{port}", access_key=writer_access_key, secret_key=writer_secret_key, secure=secure)


def recreate_bucket(client: Minio, bucket_name: str):
    # Check if the bucket exists
    if client.bucket_exists(bucket_name):
        print(f"Bucket '{bucket_name}' exists. Deleting...")
        # Delete all objects inside the bucket (if versioning is not enabled)
        objects = client.list_objects(bucket_name, recursive=True)
        for obj in objects:
            client.remove_object(bucket_name, obj.object_name)
        # Delete the bucket
        client.remove_bucket(bucket_name)
        print(f"Bucket '{bucket_name}' deleted successfully.")

    # Create the bucket
    print(f"Creating bucket '{bucket_name}'...")
    client.make_bucket(bucket_name)

    print(f"Bucket '{bucket_name}' created successfully.")


def upload_webp_images_from_zip(client: Minio, bucket_name: str, zip_path: str):
    """
    Recreates a bucket and uploads all WebP images from a zip file.

    :param client: Minio client object
    :param bucket_name: Name of the bucket to recreate and upload images to
    :param zip_path: Path to the zip file containing WebP images
    """
    # Recreate the bucket
    recreate_bucket(client, bucket_name)

    # Open the zip file
    with zipfile.ZipFile(zip_path, "r") as zip_file:
        # Extract all files to a temporary folder
        temp_dir = "temp_webp_images"
        os.makedirs(temp_dir, exist_ok=True)
        zip_file.extractall(temp_dir)

        # Upload each WebP file to the bucket
        for root, _, files in os.walk(temp_dir):
            for file in files:
                if file.endswith(".webp"):
                    webp_path = os.path.join(root, file)
                    webp_filename = file
                    print(f"Uploading {webp_filename} to bucket '{bucket_name}'...")
                    client.fput_object(
                        bucket_name,
                        webp_filename,
                        webp_path,
                        content_type="image/webp",
                        metadata={"Cache-Control": "max-age=2592000"},  # One month
                    )
                    print(f"Uploaded {webp_filename} successfully.")

        # Clean up the temporary directory
        for root, _, files in os.walk(temp_dir, topdown=False):
            for file in files:
                os.remove(os.path.join(root, file))
            os.rmdir(root)


upload_webp_images_from_zip(client, pokemons_bucket, pokemons_path)
upload_webp_images_from_zip(client, fusions_bucket, fusions_path)
