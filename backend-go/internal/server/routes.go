package server

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Echo) {
	e.GET("/", func(c echo.Context) error {
		err := c.String(http.StatusOK, "Hello, World!")
		return fmt.Errorf("error: %w", err)
	})
}
