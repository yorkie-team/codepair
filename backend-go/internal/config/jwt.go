package config

import (
	"fmt"
	"time"
)

const (
	DefaultAccessTokenExpirationTime  = 24 * time.Hour
	DefaultRefreshTokenExpirationTime = 168 * time.Hour
)

type JWT struct {
	AccessTokenSecret          string        `mapstructure:"AccessTokenSecret"`
	AccessTokenExpirationTime  time.Duration `mapstructure:"AccessTokenExpirationTime"`
	RefreshTokenSecret         string        `mapstructure:"RefreshTokenSecret"`
	RefreshTokenExpirationTime time.Duration `mapstructure:"RefreshTokenExpirationTime"`
}

func (j *JWT) ensureDefaultValue() {
	if j.AccessTokenExpirationTime == 0 {
		j.AccessTokenExpirationTime = DefaultAccessTokenExpirationTime
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
	if j.AccessTokenExpirationTime <= 0 {
		return fmt.Errorf("access token expiration time must be positive")
	}
	if j.RefreshTokenExpirationTime <= j.AccessTokenExpirationTime {
		return fmt.Errorf("refresh token expiration time must be greater than access token expiration time")
	}
	return nil
}
