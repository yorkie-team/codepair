package settings

import "github.com/labstack/echo/v4"

func Register(e *echo.Echo) {
	handler := &Handler{}

	e.GET("/settings", handler.getSettings)
}
