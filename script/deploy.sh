#!/bin/bash

# build new images for pokinder applications
sudo docker compose -f docker-compose.live.yml --env-file configuration/.env.shared --env-file configuration/.env build

# deploy the different pokinder services
sudo docker compose -f docker-compose.live.yml --env-file configuration/.env.shared --env-file configuration/.env up -d