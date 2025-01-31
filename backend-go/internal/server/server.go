package server

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

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
		ReadTimeout: conf.Server.ReadTimeout,
	}

	cp := &Codepair{
		config:     conf,
		httpServer: s,
	}
	return cp
}

func (c *Codepair) Start() error {
	errCh := make(chan error, 1)
	go func() {
		log.Printf("Server starts running on %d\n", c.config.Server.Port)
		if err := c.httpServer.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			errCh <- fmt.Errorf("server error: %v", err)
		}
	}()
	select {
	case err := <-errCh:
		return err
	case <-time.After(100 * time.Millisecond):
		return nil
	}
}

func (c *Codepair) Shutdown(ctx context.Context) error {
	log.Println("Gracefully shutting down HTTP server...")

	if err := c.httpServer.Shutdown(ctx); err != nil {
		return fmt.Errorf("error during http server shutdown: %w", err)
	}

	log.Println("Server successfully shut down")
	return nil
}
