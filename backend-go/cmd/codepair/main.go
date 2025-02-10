package main

import (
	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/server"
)

func main() {
	e := echo.New()
	conf := config.LoadConfig()
	cp := server.New(e, conf)

	if err := cp.Start(); err != nil {
		e.Logger.Fatal(err)
	}
}
