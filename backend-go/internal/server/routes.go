package server

import (
	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend/internal/core"
)

// RegisterRoutes registers routes for the server.
func RegisterRoutes(e *echo.Echo, handlers *core.Handlers) {
	e.POST("/hello", handlers.Hello.HelloCodePair)
}
