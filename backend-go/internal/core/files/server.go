package files

import (
	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend/internal/infra/storage/s3"
)

//
func Register(e *echo.Echo, s3Client s3.S3ClientInterface, workspaceRepo Repository) {
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
