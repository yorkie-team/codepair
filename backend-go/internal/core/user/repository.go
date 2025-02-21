package user

import (
	"context"
	"errors"
)

var (
	ErrUserNotFound = errors.New("user not found")
)

type Repository interface {
	FindUserByID(ctx context.Context, userID string) (*User, error)
	FindUserBySocialUID(ctx context.Context, provider, uid string) (*User, error)
	CreateUserWithSocial(ctx context.Context, provider, uid string) (*User, error)
}
