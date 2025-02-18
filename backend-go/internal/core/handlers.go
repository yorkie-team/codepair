package core

import (
	"github.com/yorkie-team/codepair/backend/internal/core/hello"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
)

type Handlers struct {
	Hello *hello.Handler
}

// NewHandlers creates a new handlers.
func NewHandlers(repos *database.Repositories) *Handlers {
	// hello
	helloService := hello.NewService(repos.Hello)
	helloHandler := hello.NewHandler(helloService)

	return &Handlers{
		Hello: helloHandler,
	}
}
