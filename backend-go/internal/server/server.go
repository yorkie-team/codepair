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
	"github.com/yorkie-team/codepair/backend/internal/infra/storage"
	"github.com/yorkie-team/codepair/backend/internal/infra/storage/minio"
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
		return nil, fmt.Errorf("dial mongo: %w", err)
	}

	var storageClient storage.Client
	storageClient, err = newStorageClient(conf.Storage)
	if err != nil {
		return nil, fmt.Errorf("storage client: %w", err)
	}

	hello.Register(e, mongodb.NewHelloRepository(db))
	auth.Register(e, mongodb.NewUserRepository(db))
	users.Register(e, mongodb.NewUserRepository(db))
	files.Register(e, storageClient, mongodb.NewWorkspaceRepository(db))

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
		return fmt.Errorf("start server: %w", err)
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

func newStorageClient(conf *config.Storage) (storage.Client, error) {
	switch conf.Provider {
	case "s3":
		client, err := s3.NewClient(conf.S3)
		if err != nil {
			return nil, fmt.Errorf("S3 client: %w", err)
		}
		return client, nil
	case "minio":
		client, err := minio.NewClient(conf.Minio)
		if err != nil {
			return nil, fmt.Errorf("minio client: %w", err)
		}
		return client, nil
	default:
		return nil, fmt.Errorf("unsupported storage provider: %s", conf.Provider)
	}
}
