package server

import (
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend-go/internal/database"
	"github.com/yorkie-team/codepair/backend-go/internal/database/mongo"
	"github.com/yorkie-team/codepair/backend-go/internal/domain"
	"github.com/yorkie-team/codepair/backend-go/internal/storage"
	"github.com/yorkie-team/codepair/backend-go/internal/storage/minio"
	"github.com/yorkie-team/codepair/backend-go/internal/storage/s3"
	"github.com/yorkie-team/codepair/backend-go/internal/token"
	"github.com/yorkie-team/codepair/backend-go/internal/transport/routes"
	"github.com/yorkie-team/codepair/backend-go/internal/yorkie"
)

// CodePair is the main server struct
type CodePair struct {
	config     *Config
	httpServer *echo.Echo

	db       database.Database
	stg      storage.Provider
	tokenMgr *token.Manager
	yorkie   *yorkie.Yorkie
}

// New creates a new instance of CodePair.
// It sets up the database, storage, token manager, domain services, and Echo server.
func New(config *Config) (*CodePair, error) {
	cp := &CodePair{
		config: config,
	}

	// 1. Initialize dependencies
	if err := cp.initDependencies(); err != nil {
		return nil, fmt.Errorf("failed to initialize dependencies: %w", err)
	}

	// 2. Initialize the HTTP server
	cp.initServer()

	return cp, nil
}

// Start runs the HTTP server on the configured port.
func (c *CodePair) Start() error {
	addr := ":" + c.config.Port
	return c.httpServer.Start(addr)
}

func (c *CodePair) initDependencies() error {
	db, err := mongo.Dial(c.config.Mongo)
	if err != nil {
		return err
	}
	c.db = db

	if c.config.Storage.Provider == "s3" {
		c.stg = s3.New(c.config.Storage.S3)
	} else {
		c.stg = minio.New(c.config.Storage.Minio)
	}

	c.tokenMgr = token.New(c.config.JWT)
	c.yorkie = yorkie.New(c.config.Yorkie)

	return nil
}

// initServer initializes the HTTP server
func (c *CodePair) initServer() {
	services := domain.NewServices(
		c.config.Auth,
		c.db,
		c.stg,
		c.tokenMgr,
		c.yorkie,
	)
	handlers := domain.NewHandlers(services)
	c.httpServer = echo.New()
	routes.RegisterRoutes(c.httpServer, handlers, c.tokenMgr)
}
