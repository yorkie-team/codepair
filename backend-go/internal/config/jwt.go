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
	AccessTokenSecret          string        `validate:"required"`
	AccessTokenExpirationTime  time.Duration `validate:"gt=0"`
	RefreshTokenSecret         string        `validate:"required"`
	RefreshTokenExpirationTime time.Duration `validate:"gt=0"`
}

// ensureDefaultValue applies default expiration times when not provided.
func (j *JWT) ensureDefaultValue() {
	if j.AccessTokenExpirationTime == 0 {
		j.AccessTokenExpirationTime = DefaultAccessTokenExpirationTime
	}
	if j.RefreshTokenExpirationTime == 0 {
		j.RefreshTokenExpirationTime = DefaultRefreshTokenExpirationTime
	}
}

// validate uses the validator library to validate the struct fields.
func (j *JWT) validate() error {
	if err := validate.Struct(j); err != nil {
		return fmt.Errorf("JWT config validation failed: %w", err)
	}
	return nil
}
