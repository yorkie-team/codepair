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
    
    filesGroup.POST("", s.handler.createUploadPresignedURL)
    
    filesGroup.GET("/:file_name", s.handler.createDownloadPresignedURL)
}
