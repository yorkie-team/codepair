package hello

import (
	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/internal/infra/database"
)

// New creates a new handler for hello endpoints and registers the routes.
func New(e *echo.Echo, repo database.Hello) {
	svc := &Service{
		repo: repo,
	}
	handler := &Handler{
		service: svc,
	}

	e.POST("/hello", handler.createHello)
	e.GET("/hello/:id", handler.readHello)
	e.PUT("/hello/:id", handler.updateHello)
	e.DELETE("/hello/:id", handler.deleteHello)
}
