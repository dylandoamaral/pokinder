# syntax=docker/dockerfile:1.4

FROM python:3.11-slim AS deps

COPY pyproject.toml /tmp

# NOTE: We remove version number from package.json to enable caching.
RUN awk -v new_version="0.0.1" '/version = "[^"]*"/ && !found {sub(/version = "[^"]*"/, "version = \"" new_version "\""); found=1} 1' /tmp/pyproject.toml > tmpfile && mv tmpfile /tmp/pyproject.toml

FROM python:3.11-slim

ENV POETRY_HOME="/opt/poetry"
ENV PATH="$POETRY_HOME/bin:$PATH"
ENV POETRY_VERSION=1.4.0

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl git build-essential python3-setuptools \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://install.python-poetry.org | python3 - \
    && poetry config virtualenvs.create false \
    && poetry config cache-dir /root/.cache/pypoetry

WORKDIR /app

COPY --from=deps /tmp/pyproject.toml .
COPY poetry.lock .

RUN --mount=type=cache,target=/root/.cache/pypoetry poetry install --no-root --only main

COPY . .

RUN --mount=type=cache,target=/root/.cache/pypoetry poetry install --only-root

RUN addgroup --system pokinder && adduser --system pokinder
USER pokinder

ENTRYPOINT ["/bin/sh", "-c"]
CMD ["./script/entry"]