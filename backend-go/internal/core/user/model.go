package user

import (
	"time"
)

type User struct {
	ID             string
	SocialProvider string
	SocialUID      string
	Nickname       *string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
