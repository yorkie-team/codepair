package config

import (
	"errors"
	"fmt"
	"github.com/labstack/echo/v4"

	"github.com/spf13/viper"
)

// Config holds the application configuration.
type Config struct {
	Server  Server  `yaml:"Server"`
	OAuth   OAuth   `yaml:"OAuth"`
	JWT     JWT     `yaml:"JWT"`
	Yorkie  Yorkie  `yaml:"Yorkie"`
	Mongo   Mongo   `yaml:"Mongo"`
	Storage Storage `yaml:"Storage"`
}

// LoadConfig loads configuration settings from a file (if provided) and from environment variables.
// It returns the populated Config, a status message describing which sources were used, and an error if any.
func LoadConfig(filePath string, logger echo.Logger) (*Config, error) {
	if err := bindEnvironmentVariables(logger); err != nil {
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
func bindEnvironmentVariables(logger echo.Logger) error {
	for key, env := range EnvVarMap {
		if err := viper.BindEnv(key, env); err != nil {
			return fmt.Errorf("failed to bind environment variable %s to key %s: %w", env, key, err)
		}
	}

	isSet := false
	for key, _ := range EnvVarMap {
		if ok := viper.IsSet(key); ok {
			isSet = true
		}
	}
	if !isSet {
		logger.Info("no env vars are used")
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
		if filePath != "" && errors.As(err, &nf) {
			return fmt.Errorf("file path given but not found: %w", err)
		} else {
			return fmt.Errorf("failed to read config file: %w", err)
		}
	}

	return nil
}

func (c *Config) ensureDefaultValue() {
	c.Server.ensureDefaultValue()
	c.OAuth.ensureDefaultValue()
	c.JWT.ensureDefaultValue()
	c.Yorkie.ensureDefaultValue()
	c.Mongo.ensureDefaultValue()
	c.Storage.ensureDefaultValue()
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
