package server

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/core/auth"
	"github.com/yorkie-team/codepair/backend/internal/core/files"
	"github.com/yorkie-team/codepair/backend/internal/core/hello"
	"github.com/yorkie-team/codepair/backend/internal/core/users"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/mongodb"
	"github.com/yorkie-team/codepair/backend/internal/infra/storage/s3"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

type CodePair struct {
	echo *echo.Echo
}

// New creates a new CodePair server.
func New(e *echo.Echo) (*CodePair, error) {
	conf := config.GetConfig()
	e.HTTPErrorHandler = middleware.HTTPErrorHandler

	db, err := mongodb.Dial(e.Logger)
	if err != nil {
		return nil, fmt.Errorf("failed to dial mongo: %w", err)
	}

	var objectStorageClient
	if conf.Storage.Provider == "s3"  {
		s3Client, err := s3.NewClient(conf.Storage.S3.Bucket)
		if err != nil {
			return nil, fmt.Errorf("failed to create s3 client: %w", err)
		}
	} else if conf.Storage.Provider == "minio" {
		s3Client, err := s3.NewClient(conf.Storage.S3.Bucket)
		if err != nil {
			return nil, fmt.Errorf("failed to create s3 client: %w", err)
		}
	}
	

	hello.Register(e, mongodb.NewHelloRepository(db))
	auth.Register(e, mongodb.NewUserRepository(db))
	users.Register(e, mongodb.NewUserRepository(db))
	files.Register(e, s3Client, mongodb.NewWorkspaceRepository(conf.Mongo, db))

	e.Pre(middleware.JWT(conf.JWT.AccessTokenSecret))

	cp := &CodePair{
		echo: e,
	}
	return cp, nil
}

// Start starts the server.
func (c *CodePair) Start() error {
	port := config.GetConfig().Server.Port
	addr := fmt.Sprintf(":%d", port)
	if err := c.echo.Start(addr); !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("failed to start server: %w", err)
	}
	return nil
}

func (c *CodePair) Shutdown(ctx context.Context) error {
	return c.echo.Shutdown(ctx)
}

func (c *CodePair) ServerAddr() string {
	port := c.echo.ListenerAddr().(*net.TCPAddr).Port
	return fmt.Sprintf("http://localhost:%d", port)
}
