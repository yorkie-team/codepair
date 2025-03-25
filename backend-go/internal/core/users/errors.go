package users

import "github.com/yorkie-team/codepair/backend/internal/middleware"

var NicknameConflictError = middleware.NewError(409, "The nickname conflicts")
