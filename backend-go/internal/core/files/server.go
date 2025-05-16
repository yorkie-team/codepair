package files

import (
	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/internal/infra/storage/s3"
)

// Register creates a new handler for files endpoints and registers the routes.
func Register(e *echo.Echo, s3Client s3.ClientInterface, workspaceRepo Repository) {
	svc := &Service{
		s3Client:      s3Client,
		workspaceRepo: workspaceRepo,
	}
	handler := &Handler{
		service: svc,
	}

	e.POST("/files", handler.createUploadPresignedURL)
	e.GET("/files/:file_name", handler.createDownloadPresignedURL)
	// TODO: e.POST("/files/export-markdown", handler.exportMarkdown)
}
