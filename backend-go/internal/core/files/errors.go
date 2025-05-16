package files

import (
	"net/http"

	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

var (
    WorkspaceNotFoundError = middleware.NewError(http.StatusUnauthorized, "client unauthorized")
    ContentLengthTooLongError = middleware.NewError(http.StatusUnprocessableEntity, "content length too long")
    FileNotFoundError = middleware.NewError(http.StatusNotFound, "file not found")
)

const (
    MaxContentLength = 10_000_000 
)
