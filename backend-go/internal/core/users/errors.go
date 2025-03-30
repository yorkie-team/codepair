package users

import (
	"net/http"

	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

var (
	NicknameConflictError = middleware.NewError(http.StatusConflict, "The nickname conflicts")

	UserNotFoundError = middleware.NewError(http.StatusNotFound, "User not found")
)
