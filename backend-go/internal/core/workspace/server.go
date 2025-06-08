package workspace

import "github.com/labstack/echo/v4"

// Register creates a new handler for users endpoints and registers the routes.
func Register(e *echo.Echo, repo Repository) {
	handler := &Handler{
		workspaceRepository: repo,
	}

	e.POST("/workspaces", handler.createWorkspace)
	e.GET("/workspaces", handler.findWorkspaces)
	e.GET("/workspaces/:workspace_slug", handler.findWorkspaceBySlug)
	e.POST("/workspaces/:workspace_id/invite-token", handler.createInviteToken)
	e.POST("/workspaces/join", handler.joinWorkspace)
}
