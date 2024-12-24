package routes

import (
	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend-go/internal/api/handlers"
	"github.com/yorkie-team/codepair/backend-go/internal/api/middleware"
	"github.com/yorkie-team/codepair/backend-go/internal/services"
)

func NewRouter() *echo.Echo {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Auth routes
	auth := handlers.NewAuthHandler(services.AuthService)
	e.POST("/auth/login/github", auth.GithubLogin)
	e.GET("/auth/callback/github", auth.GithubCallback)
	e.POST("/auth/refresh", auth.RefreshToken)

	// Protected routes group
	api := e.Group("/api")
	api.Use(middleware.JWT())

	// User routes
	user := handlers.NewUserHandler(services.UserService)
	api.GET("/users", user.GetProfile)
	api.PUT("/users", user.UpdateProfile)

	// Workspace routes
	workspace := handlers.NewWorkspaceHandler(services.WorkspaceService)
	api.POST("/workspaces", workspace.Create)
	api.GET("/workspaces", workspace.List)
	api.GET("/workspaces/:id", workspace.Get)
	api.PUT("/workspaces/:id", workspace.Update)
	api.DELETE("/workspaces/:id", workspace.Delete)

	// Document routes
	document := handlers.NewDocumentHandler(services.DocumentService)
	api.POST("/documents", document.Create)
	api.PUT("/documents/:id/title", document.UpdateTitle)
	api.POST("/documents/:id/share-token", document.CreateShareToken)
	api.GET("/documents/share", document.FindFromSharingToken)

	// File routes
	file := handlers.NewFileHandler(services.FileService)
	api.POST("/files", file.CreateUploadPresignedURL)
	api.GET("/files/:file_name", file.CreateDownloadPresignedURL)
	api.POST("/files/export-markdown", file.ExportMarkdown)

	return e
}
