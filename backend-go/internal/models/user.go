package models

import "time"

type User struct {
	ID             string    `json:"id" bson:"_id"`
	SocialProvider string    `json:"socialProvider" bson:"socialProvider"`
	SocialUID      string    `json:"socialUid" bson:"socialUid"`
	Nickname       string    `json:"nickname" bson:"nickname"`
	CreatedAt      time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt" bson:"updatedAt"`
}

type GithubUser struct {
	ID       string `json:"id"`
	Username string `json:"login"`
}

type ChangeNicknameRequest struct {
	Nickname string `json:"nickname" validate:"required"`
}

type TokenResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}
