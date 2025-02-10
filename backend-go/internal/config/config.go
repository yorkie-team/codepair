package config

import (
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/spf13/viper"
)

var validate = validator.New()

type Config struct {
	Server  Server
	OAuth   OAuth
	JWT     JWT
	Yorkie  Yorkie
	Mongo   Mongo
	Storage Storage
}

// LoadConfig loads configuration settings from a file (if provided) and from environment variables.
// It returns the populated Config, a status message describing which sources were used, and an error if any.
func LoadConfig(filePath string) (*Config, error) {
	if err := bindEnvironmentVariables(); err != nil {
		return nil, err
	}

	if err := readConfigFile(filePath); err != nil {
		return nil, err
	}

	cfg := &Config{}
	if err := viper.Unmarshal(cfg); err != nil {
		return nil, fmt.Errorf("unable to decode configuration into struct: %w", err)
	}

	cfg.ensureDefaultValue()

	if err := cfg.validate(); err != nil {
		return nil, fmt.Errorf("failed to validate config: %w", err)
	}

	return cfg, nil
}

// bindEnvironmentVariables binds each configuration key to its corresponding environment variable.
func bindEnvironmentVariables() error {
	for key, env := range EnvVarMap {
		if err := viper.BindEnv(key, env); err != nil {
			return fmt.Errorf("failed to bind environment variable %s to key %s: %w", env, key, err)
		}
	}

	return nil
}

func readConfigFile(filePath string) error {
	if filePath != "" {
		viper.SetConfigFile(filePath)
	} else {
		viper.SetConfigName("config")
		viper.SetConfigType("yaml")
		viper.AddConfigPath(".")
	}

	if err := viper.ReadInConfig(); err != nil {
		var nf viper.ConfigFileNotFoundError
		if errors.As(err, &nf) {
			if filePath != "" {
				return fmt.Errorf("file path given but not found: %w", err)
			}
			return nil
		}
		return fmt.Errorf("failed to read config file: %w", err)
	}

	return nil
}

func (c *Config) ensureDefaultValue() {
	c.Server.ensureDefaultValue()
	c.OAuth.ensureDefaultValue()
	c.JWT.ensureDefaultValue()
	c.Yorkie.ensureDefaultValue()
	c.Mongo.ensureDefaultValue()
}

func (c *Config) validate() error {
	if err := c.Server.validate(); err != nil {
		return fmt.Errorf("server config invalid: %w", err)
	}
	if err := c.OAuth.validate(); err != nil {
		return fmt.Errorf("oauth config invalid: %w", err)
	}
	if err := c.JWT.validate(); err != nil {
		return fmt.Errorf("jwt config invalid: %w", err)
	}
	if err := c.Yorkie.validate(); err != nil {
		return fmt.Errorf("yorkie config invalid: %w", err)
	}
	if err := c.Mongo.validate(); err != nil {
		return fmt.Errorf("mongo config invalid: %w", err)
	}
	if err := c.Storage.validate(); err != nil {
		return fmt.Errorf("storage config invalid: %w", err)
	}

	return nil
}
