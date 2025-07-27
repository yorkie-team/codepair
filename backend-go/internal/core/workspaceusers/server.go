package workspaceusers

import "github.com/labstack/echo/v4"

func Register(e *echo.Echo, repo Repository) {
	handler := &Handler{
		userWorkspaceRepository: repo,
	}

	e.GET("/workspaces/:workspace_id/users", handler.findWorkspaceUsers)
}
