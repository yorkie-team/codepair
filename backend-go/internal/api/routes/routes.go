package routes

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/yorkie-team/codepair/backend-go/internal/domain"
)

func RegisterRoutes(e *echo.Echo, handlers *domain.Handlers) *echo.Echo {
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Auth routes
	e.POST("/auth/login/github", handlers.Github.GithubLogin)
	e.GET("/auth/callback/github", handlers.Github.GithubCallback)
	e.POST("/auth/refresh", handlers.Github.RefreshToken)

	// Protected routes group
	api := e.Group("/api")
	api.Use(middleware.JWT)

	// User routes
	api.GET("/users", handlers.User.GetProfile)
	api.PUT("/users", handlers.User.UpdateProfile)

	// Workspace routes
	api.POST("/workspaces", handlers.Workspace.Create)
	api.GET("/workspaces", handlers.Workspace.List)
	api.GET("/workspaces/:id", handlers.Workspace.Get)

	// Document routes
	api.POST("/documents", handlers.Document.Create)
	api.PUT("/documents/:id/title", handlers.Document.UpdateTitle)
	api.POST("/documents/:id/share-token", handlers.Document.CreateShareToken)
	api.GET("/documents/share", handlers.Document.FindFromSharingToken)

	// File routes
	api.POST("/files", handlers.File.CreateUploadPresignedURL)
	api.GET("/files/:file_name", handlers.File.CreateDownloadPresignedURL)
	api.POST("/files/export-markdown", handlers.File.ExportMarkdown)

	return e
}
