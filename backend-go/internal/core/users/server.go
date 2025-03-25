package users

import "github.com/labstack/echo/v4"

// Register creates a new handler for hello endpoints and registers the routes.
func Register(e *echo.Echo, repo Repository) {
	svc := &Service{
		userRepository: repo,
	}
	handler := &Handler{
		service: svc,
	}

	e.GET("/hello/:id", handler.FindUser)
	e.PUT("/hello/:id", handler.ChangeNickname)
}
