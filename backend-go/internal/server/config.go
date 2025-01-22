package server

import (
	"github.com/yorkie-team/codepair/backend-go/internal/database/mongo"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/auth"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/auth/github"
	"github.com/yorkie-team/codepair/backend-go/internal/storage"
	"github.com/yorkie-team/codepair/backend-go/internal/storage/minio"
	"github.com/yorkie-team/codepair/backend-go/internal/storage/s3"
	"github.com/yorkie-team/codepair/backend-go/internal/token"
	"github.com/yorkie-team/codepair/backend-go/internal/yorkie"
)

const DefaultPort = 8080

// Config holds the overall application configuration.
type Config struct {
	Auth    *auth.Config    `yaml:"Auth"`
	JWT     *token.Config   `yaml:"JWT"`
	Storage *storage.Config `yaml:"Storage"`
	Mongo   *mongo.Config   `yaml:"Mongo"`
	Yorkie  *yorkie.Config  `yaml:"Yorkie"`
	Port    int             `yaml:"Port"`
}

// NewConfig returns a fully initialized configuration
// with placeholders so that no fields are nil.
func NewConfig() *Config {
	return &Config{
		Auth: &auth.Config{
			Github: &github.Config{},
		},
		JWT: &token.Config{},
		Storage: &storage.Config{
			S3:    &s3.Config{},
			Minio: &minio.Config{},
		},
		Mongo:  &mongo.Config{},
		Yorkie: &yorkie.Config{},
	}
}

// EnsureDefaultValue applies default values if any field remains empty or nil.
func (c *Config) EnsureDefaultValue() {
	c.Auth.EnsureDefaultValue()
	c.JWT.EnsureDefaultConfig()
	c.Storage.EnsureDefaultValue()
	c.Mongo.EnsureDefaultValue()
	c.Yorkie.EnsureDefaultValue()
	if c.Port == 0 {
		c.Port = DefaultPort
	}
}
