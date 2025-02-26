package hello

import (
	"github.com/labstack/echo/v4"
)

// Register creates a new handler for hello endpoints and registers the routes.
func Register(e *echo.Echo, repo Repository) {
	svc := &Service{
		helloRepository: repo,
	}
	handler := &Handler{
		service: svc,
	}

	e.POST("/hello", handler.createHello)
	e.GET("/hello/:id", handler.readHello)
	e.PUT("/hello/:id", handler.updateHello)
	e.DELETE("/hello/:id", handler.deleteHello)
}
