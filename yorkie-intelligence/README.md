# Yorkie Intelligence(WIP)

## Setting
install python 3.10.* version(recommend using [pyenv](https://github.com/pyenv/pyenv))<br/>
install [poetry](https://python-poetry.org/docs/#installing-with-the-official-installer)<br/>

### dev

```sh
poetry install --no-root 
```

### prod

```sh
poetry install --without dev
```

## How To Start

```sh
git clone https://github.com/yorkie-team/codepair.git
cd yorkie-intalligence
poetry run uvicorn src.main:app --reload
```

you can see openapi in http://localhost:8000/docs

