package config

type JWTConfig struct {
	AccessTokenSecret          string
	AccessTokenExpirationTime  int
	RefreshTokenSecret         string
	RefreshTokenExpirationTime int
}
