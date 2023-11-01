#!/bin/bash

# build new images for pokinder applications
sudo docker compose --env-file configuration/.env --env-file configuration/.env.shared build

# deploy the different pokinder services
sudo docker compose --env-file configuration/.env --env-file configuration/.env.shared up -d