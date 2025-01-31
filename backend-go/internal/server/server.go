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

func (c *Codepair) Start() error {
	addr := fmt.Sprintf(":%d", c.config.Server.Port)
	if err := c.echo.Start(addr); !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("failed to start server: %w", err)
	}
	return nil
}

func (c *Codepair) Shutdown(ctx context.Context) error {
	if err := c.echo.Shutdown(ctx); err != nil {
		return fmt.Errorf("shutdown failed: %w", err)
	}

	return nil
}
