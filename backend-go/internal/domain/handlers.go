package domain

import (
	"github.com/yorkie-team/codepair/backend-go/internal/domain/auth"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/document"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/files"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/intelligence"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/user"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/workspace"
)

type Handlers struct {
	Github       *auth.Handler
	User         *user.Handler
	Workspace    *workspace.Handler
	Document     *document.Handler
	File         *files.Handler
	Intelligence *intelligence.Handler
}

func NewHandlers(services *Services) *Handlers {
	return &Handlers{
		Github:       auth.NewHandler(services.Github),
		User:         user.NewHandler(services.User),
		Workspace:    workspace.NewHandler(services.Workspace),
		Document:     document.NewHandler(services.Document),
		File:         files.NewHandler(services.File),
		Intelligence: intelligence.NewHandler(services.Intelligence),
	}
}
