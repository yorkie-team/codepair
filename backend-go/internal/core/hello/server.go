package hello

import "github.com/labstack/echo/v4"

// New creates a new handler for hello.
func New(e *echo.Echo, repo Repository) {
	svc := &Service{
		repository: repo,
	}
	handler := &Handler{
		service: svc,
	}
	e.GET("/hello", handler.readHello)
	e.POST("/hello", handler.createHello)
}
