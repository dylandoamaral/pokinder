#!/bin/bash

VERSION="$(git describe --tags --abbrev=0)"
export VERSION="${VERSION#v}"

# NOTE: show the last 50 lines of logs for all services defined in docker compose
sudo env VERSION="$VERSION" docker compose -f docker-compose.live.yml --env-file configuration/.env.shared --env-file configuration/.env logs --tail 50