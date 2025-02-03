package config

import (
	"fmt"
	"time"
)

const (
	DefaultMongoConnectionURI = "mongodb://localhost:27017/codepair"
	DefaultMongoDatabaseName  = "codepair"
	DefaultConnectionTimeout  = 10 * time.Second
	DefaultPingTimeout        = 5 * time.Second
)

type Mongo struct {
	ConnectionTimeout time.Duration `mapstructure:"ConnectionTimeout" validate:"gt=0"`
	ConnectionURI     string        `mapstructure:"ConnectionURI" validate:"required,url"`
	PingTimeout       time.Duration `mapstructure:"PingTimeout" validate:"gt=0"`
	DatabaseName      string        `mapstructure:"DatabaseName" validate:"required"`
}

// ensureDefaultValue applies defaults if a field is zero-valued.
func (m *Mongo) ensureDefaultValue() {
	if m.ConnectionTimeout == 0 {
		m.ConnectionTimeout = DefaultConnectionTimeout
	}
	if m.ConnectionURI == "" {
		m.ConnectionURI = DefaultMongoConnectionURI
	}
	if m.PingTimeout == 0 {
		m.PingTimeout = DefaultPingTimeout
	}
	if m.DatabaseName == "" {
		m.DatabaseName = DefaultMongoDatabaseName
	}
}

// validate uses the validator library to validate the struct fields.
func (m *Mongo) validate() error {
	if err := validate.Struct(m); err != nil {
		return fmt.Errorf("mongo config validation failed: %w", err)
	}
	return nil
}
