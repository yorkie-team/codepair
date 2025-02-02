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
	ConnectionTimeout time.Duration `mapstructure:"ConnectionTimeout"`
	ConnectionURI     string        `mapstructure:"ConnectionURI"`
	PingTimeout       time.Duration `mapstructure:"PingTimeout"`
	DatabaseName      string        `mapstructure:"DatabaseName"`
}

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

func (m *Mongo) validate() error {
	if m.ConnectionURI == "" {
		return fmt.Errorf("mongo connection URI cannot be empty")
	}
	if m.DatabaseName == "" {
		return fmt.Errorf("mongo database name cannot be empty")
	}

	return nil
}
