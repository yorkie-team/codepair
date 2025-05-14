package files

import (
	"github.com/labstack/echo/v4"
)

// Server represents the files server
type Server struct {
    handler *Handler
}

// NewServer creates a new files server
func NewServer(handler *Handler) *Server {
    return &Server{
        handler: handler,
    }
}

// RegisterRoutes registers routes for files
func (s *Server) RegisterRoutes(e *echo.Group) {
    filesGroup := e.Group("/files")
    
    // 업로드용 Presigned URL 생성
    filesGroup.POST("", s.handler.CreateUploadPresignedURL)
    
    // 다운로드용 Presigned URL 생성
    filesGroup.GET("/:file_name", s.handler.CreateDownloadPresignedURL)
}