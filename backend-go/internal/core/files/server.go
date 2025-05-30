package files

import (
	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/internal/infra/storage"
)

// Register creates a new handler for files endpoints and registers the routes.
func Register(e *echo.Echo, storageClient storage.Client, workspaceRepo Repository) {
	svc := &Service{
		storageClient: storageClient,
		workspaceRepo: workspaceRepo,
	}
	handler := &Handler{
		service: svc,
	}

	e.POST("/files", handler.createUploadPresignedURL)
	e.GET("/files/:file_name", handler.createDownloadPresignedURL)
}
