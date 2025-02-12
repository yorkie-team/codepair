package config

import (
	"fmt"
	"time"
)

const (
	DefaultConnectionTimeout = 10 * time.Second
	DefaultPingTimeout       = 5 * time.Second
)

type Mongo struct {
	ConnectionTimeout time.Duration `validate:"gt=0"`
	ConnectionURI     string        `validate:"required,url"`
	PingTimeout       time.Duration `validate:"gt=0"`
	DatabaseName      string        `validate:"required"`
}

// ensureDefaultValue applies defaults if a field is zero-valued.
func (m *Mongo) ensureDefaultValue() {
	if m.ConnectionTimeout == 0 {
		m.ConnectionTimeout = DefaultConnectionTimeout
	}
	if m.PingTimeout == 0 {
		m.PingTimeout = DefaultPingTimeout
	}
}

// validate uses the validator library to validate the struct fields.
func (m *Mongo) validate() error {
	if err := validate.Struct(m); err != nil {
		return fmt.Errorf("mongo config validation failed: %w", err)
	}
	return nil
}
