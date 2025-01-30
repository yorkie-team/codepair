# CodePair Service Backend

This project is the backend part of the CodePair service developed using Go.
It is being migrated from the NestJS framework to Go. (Related Issue: [#430](https://github.com/yorkie-team/codepair/issues/430))

## Setting Developing Environment

### Requirements

Below are needed for developing and building CodePair.

- [Go](https://golang.org) (version 1.18+)

### Building & Testing

You can build the CodePair project by running the following command.

```sh
make tools
make build		# executable: ./bin/codepair
```

You can automatically check the programmatic and stylistic errors of your code.

```sh
make lint
```
