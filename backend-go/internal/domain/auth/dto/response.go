package dto

type GithubAccessTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	Scope       string `json:"scope"`
}

type RefreshTokenResponse struct {
	AccessToken string `json:"accessToken"`
}
