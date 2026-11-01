#!/bin/bash

VERSION="$(git describe --tags --abbrev=0)"
export VERSION="${VERSION#v}"

# NOTE: build new images for pokinder applications
sudo env VERSION="$VERSION" docker compose -f docker-compose.live.yml --env-file configuration/.env.shared --env-file configuration/.env build

# deploy the different pokinder services
sudo env VERSION="$VERSION" docker compose -f docker-compose.live.yml --env-file configuration/.env.shared --env-file configuration/.env up -d