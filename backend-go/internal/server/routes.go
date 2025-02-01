package server

import (
	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend/internal/core/hello"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/mongo"
)

func RegisterRoutes(e *echo.Echo) {
	// Repositories
	helloRepository := mongo.NewHelloRepository()

	// Services
	helloService := hello.NewService(helloRepository)

	// Handlers
	helloHandler := hello.NewHandler(helloService)

	e.POST("/hello", helloHandler.HelloCodePair)
}
