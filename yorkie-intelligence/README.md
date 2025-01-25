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
cd src
uvicorn main:app
```

## TODO list
- [x] env setting
- [ ] pr feature
- [ ] issue feature
- [ ] writing document feature
- [x] few shot prompting
- [ ] logging
- [ ] test code
- [ ] create endpoint docs


