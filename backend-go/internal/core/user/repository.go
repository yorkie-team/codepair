package user

import (
	"context"
)

type Repository interface {
	FindUserByID(ctx context.Context, userID string) (*User, error)
	FindUserBySocialUID(ctx context.Context, provider, uid string, createIfNotExist bool) (*User, error)
}
