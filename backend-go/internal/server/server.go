package server

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/internal/config"
)

type CodePair struct {
	config *config.Config
	echo   *echo.Echo
}

func New(e *echo.Echo, conf *config.Config) *CodePair {
	RegisterRoutes(e)

	cp := &CodePair{
		config: conf,
		echo:   e,
	}
	return cp
}

func (c *CodePair) Start() error {
	addr := fmt.Sprintf(":%d", c.config.Server.Port)
	if err := c.echo.Start(addr); !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("failed to start server: %w", err)
	}
	return nil
}
