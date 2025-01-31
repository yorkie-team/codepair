package server

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend/internal/config"
)

type Codepair struct {
	config *config.Config
	echo   *echo.Echo
}

func New(conf *config.Config) *Codepair {
	e := echo.New()

	RegisterRoutes(e)

	cp := &Codepair{
		config: conf,
		echo:   e,
	}
	return cp
}

func (c *Codepair) Start() {
	go func() {
		if err := c.echo.Start(fmt.Sprintf(":%d", c.config.Server.Port)); !errors.Is(err, http.ErrServerClosed) {
			c.echo.Logger.Fatal("start the server:")
		}
	}()
}

func (c *Codepair) Shutdown(ctx context.Context) {
	if err := c.echo.Shutdown(ctx); err != nil {
		c.echo.Logger.Fatal(err)
	}
}
