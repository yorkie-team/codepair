package users

import "github.com/labstack/echo/v4"

// Register creates a new handler for users endpoints and registers the routes.
func Register(e *echo.Echo, repo Repository) {
	handler := &Handler{
		userRepository: repo,
	}

	e.GET("/users", handler.findUser)
	e.PUT("/users", handler.changeNickname)
}
