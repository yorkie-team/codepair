package server

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/core/hello"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/mongodb"
)

type CodePair struct {
	config *config.Config
	echo   *echo.Echo
}

// New creates a new CodePair server.
func New(e *echo.Echo, conf *config.Config) (*CodePair, error) {
	db, err := mongodb.Dial(conf.Mongo)
	if err != nil {
		return nil, fmt.Errorf("failed to dial mongo: %w", err)
	}

	hello.New(e, mongodb.NewHelloRepo(conf.Mongo, db))

	cp := &CodePair{
		config: conf,
		echo:   e,
	}
	return cp, nil
}

// Start starts the server.
func (c *CodePair) Start() error {
	addr := fmt.Sprintf(":%d", c.config.Server.Port)
	if err := c.echo.Start(addr); !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("failed to start server: %w", err)
	}
	return nil
}
