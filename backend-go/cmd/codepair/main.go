package main

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()
	e.GET("/", func(c echo.Context) error {
		err := c.String(http.StatusOK, "Hello, World!")
		return fmt.Errorf("error: %w", err)
	})
	e.Logger.Fatal(e.Start(":3001"))
}
