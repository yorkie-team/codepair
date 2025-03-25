package users

import "github.com/labstack/echo/v4"

// Register creates a new handler for users endpoints and registers the routes.
func Register(e *echo.Echo, repo Repository) {
	svc := &Service{
		userRepository: repo,
	}
	handler := &Handler{
		service: svc,
	}

	e.GET("/hello", handler.findUser)
	e.PUT("/hello", handler.changeNickname)
}
