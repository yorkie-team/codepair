package config

import (
	"fmt"
	"time"
)

const (
	DefaultAccessTokenSecret          = "your_access_token_secret"
	DefaultAccessTokenExpirationTime  = 24 * time.Hour
	DefaultRefreshTokenSecret         = "your_refresh_token_secret"
	DefaultRefreshTokenExpirationTime = 168 * time.Hour
)

type JWT struct {
	AccessTokenSecret          string
	AccessTokenExpirationTime  time.Duration `yaml:"AccessTokenExpirationTime"`
	RefreshTokenSecret         string        `yaml:"RefreshTokenSecret"`
	RefreshTokenExpirationTime time.Duration `yaml:"RefreshTokenExpirationTime" `
}

func (j *JWT) ensureDefaultValue() {
	if j.AccessTokenSecret == "" {
		j.AccessTokenSecret = DefaultAccessTokenSecret
	}
	if j.AccessTokenExpirationTime == 0 {
		j.AccessTokenExpirationTime = DefaultAccessTokenExpirationTime
	}
	if j.RefreshTokenSecret == "" {
		j.RefreshTokenSecret = DefaultRefreshTokenSecret
	}
	if j.RefreshTokenExpirationTime == 0 {
		j.RefreshTokenExpirationTime = DefaultRefreshTokenExpirationTime
	}
}

func (j *JWT) validate() error {
	if j.AccessTokenSecret == "" {
		return fmt.Errorf("access token secret cannot be empty")
	}
	if j.RefreshTokenSecret == "" {
		return fmt.Errorf("refresh token secret cannot be empty")
	}

	return nil
}
