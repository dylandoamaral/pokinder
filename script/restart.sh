#!/bin/bash

VERSION="$(git describe --tags --abbrev=0)"
export VERSION="${VERSION#v}"

# NOTE:  restart a specific service defined in docker compose by name
sudo env VERSION="$VERSION" docker compose -f docker-compose.live.yml --env-file configuration/.env.shared --env-file configuration/.env restart "$1"