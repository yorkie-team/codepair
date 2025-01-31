package server

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend/internal/config"
)

type Codepair struct {
	config     *config.Config
	httpServer *http.Server
}

func New(conf *config.Config) *Codepair {
	e := echo.New()

	RegisterRoutes(e)

	s := &http.Server{
		Addr:        fmt.Sprintf(":%d", conf.Server.Port),
		Handler:     e,
		ReadTimeout: conf.Server.ParseReadTimeout(),
	}

	cp := &Codepair{
		config:     conf,
		httpServer: s,
	}
	return cp
}

func (c *Codepair) Start() error {
	if err := c.httpServer.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("failed to start HTTP server: %w", err)
	}
	return nil
}
