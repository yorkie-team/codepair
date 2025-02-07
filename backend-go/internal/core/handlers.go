package core

import (
	"github.com/yorkie-team/codepair/backend/internal/core/hello"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/mongo"
)

type Handlers struct {
	Hello *hello.Handler
}

// NewHandlers creates a new handlers.
func NewHandlers() *Handlers {
	// Repositories
	helloRepository := mongo.NewHelloRepository()

	// Services
	helloService := hello.NewService(helloRepository)

	// Handlers
	helloHandler := hello.NewHandler(helloService)

	return &Handlers{
		Hello: helloHandler,
	}
}
