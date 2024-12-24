package models

import (
	"time"
)

type User struct {
	ID             string    `json:"id" bson:"_id,omitempty"`
	Nickname       string    `json:"nickname" bson:"nickname"`
	SocialProvider string    `json:"socialProvider" bson:"socialProvider"`
	SocialUid      string    `json:"socialUid" bson:"socialUid"`
	CreatedAt      time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt" bson:"updatedAt"`
}

type AuthorizedUser struct {
	ID       string `json:"id"`
	Nickname string `json:"nickname"`
}

type GithubUser struct {
	ID    string `json:"id"`
	Login string `json:"login"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type RefreshTokenResponse struct {
	AccessToken string `json:"accessToken"`
}
