# Yorkie Intelligence(WIP)

## Setting

### dev

- pyenv
- poetry

```sh
poetry install --no-root 
poetry shell
```

### prod

```sh
poetry install --without dev
```

## How To Start

```sh
uvicorn src.main:app
```