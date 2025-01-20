package server

import (
	"errors"
	"fmt"
	"github.com/spf13/viper"

	"github.com/yorkie-team/codepair/backend-go/internal/database/mongo"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/auth"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/auth/github"
	"github.com/yorkie-team/codepair/backend-go/internal/storage"
	"github.com/yorkie-team/codepair/backend-go/internal/storage/minio"
	"github.com/yorkie-team/codepair/backend-go/internal/storage/s3"
	"github.com/yorkie-team/codepair/backend-go/internal/token"
	"github.com/yorkie-team/codepair/backend-go/internal/yorkie"
)

const DefaultPort = "8080"

// Config holds the overall application configuration.
type Config struct {
	Auth    *auth.Config    `yaml:"Auth"`
	JWT     *token.Config   `yaml:"JWT"`
	Storage *storage.Config `yaml:"Storage"`
	Mongo   *mongo.Config   `yaml:"Mongo"`
	Yorkie  *yorkie.Config  `yaml:"Yorkie"`
	Port    string          `yaml:"Port"`
}

// NewConfig loads application configuration by:
//
// 1. Creating a new viper instance and binding environment variables.
// 2. Reading and parsing the config file (if provided).
// 3. Unmarshalling into a default Config struct and applying defaults.
//
// If no config file is found, we simply continue with environment variables + defaults.
func NewConfig(configFilePath string, envBindings map[string]string) (*Config, error) {
	v := viper.New()
	v.AutomaticEnv()

	// Step 1) Bind environment variables to viper keys
	for key, env := range envBindings {
		if err := v.BindEnv(key, env); err != nil {
			return nil, fmt.Errorf("failed to bind environment variable %s to key %s: %w", env, key, err)
		}
	}

	// Step 2) Read and parse the config file (if provided)
	if configFilePath != "" {
		v.SetConfigFile(configFilePath)
	} else {
		v.SetConfigName("config")
		v.SetConfigType("yaml")
		v.AddConfigPath(".")
	}

	// It's not an error if the file is missing, but handle other read failures.
	if err := v.ReadInConfig(); err != nil {
		var nf viper.ConfigFileNotFoundError
		if errors.As(err, &nf) {
			// Not found; continue with environment + defaults
			fmt.Println("Warning: No config file found. Using env vars + defaults.")
		} else {
			return nil, fmt.Errorf("failed to read config file: %w", err)
		}
	}

	// Step 3) Unmarshal into a default config, then set defaults
	config := defaultConfig()
	if err := v.Unmarshal(config); err != nil {
		return nil, fmt.Errorf("unable to decode into Config struct: %w", err)
	}

	config.EnsureDefaultValue()
	return config, nil
}

// EnsureDefaultValue applies default values if any field remains empty or nil.
func (c *Config) EnsureDefaultValue() {
	if c.Auth == nil {
		c.Auth = &auth.Config{}
	}
	c.Auth.EnsureDefaultValue()

	if c.JWT == nil {
		c.JWT = &token.Config{}
	}
	c.JWT.EnsureDefaultConfig()

	if c.Storage == nil {
		c.Storage = &storage.Config{}
	}
	c.Storage.EnsureDefaultValue()

	if c.Mongo == nil {
		c.Mongo = &mongo.Config{}
	}
	c.Mongo.EnsureDefaultValue()

	if c.Yorkie == nil {
		c.Yorkie = &yorkie.Config{}
	}
	c.Yorkie.EnsureDefaultValue()

	if c.Port == "" {
		c.Port = DefaultPort
	}
}

// defaultConfig returns a fully initialized configuration
// with placeholders so that no fields are nil.
func defaultConfig() *Config {
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
		Port:   "",
	}
}
