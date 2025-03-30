package users

import "github.com/yorkie-team/codepair/backend/internal/middleware"

var NicknameConflictError = middleware.NewError(http.StatusConflict, "The nickname conflicts")
