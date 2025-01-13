package dto

type AuthorizedUser struct {
	ID       string `json:"id"`
	Username string `json:"username"`
}

type GithubUser struct {
	ID        int64  `json:"id"`
	Login     string `json:"login"`
	AvatarURL string `json:"avatar_url"`
	Email     string `json:"email"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken"`
}
