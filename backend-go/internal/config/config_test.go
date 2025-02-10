package config_test

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/yorkie-team/codepair/backend/internal/config"
)

// setEnvVars is a helper to set multiple environment variables.
func setEnvVars(t *testing.T, envs map[string]string) {
	for key, value := range envs {
		t.Setenv(key, value)
	}
}

// writeTempConfigFile writes the given content to a temporary file and returns its path.
func writeTempConfigFile(t *testing.T, filename, content string) string {
	tmpDir := t.TempDir()
	filePath := filepath.Join(tmpDir, filename)
	err := os.WriteFile(filePath, []byte(content), 0600)
	require.NoError(t, err, "Should be able to create a temporary config file")
	return filePath
}

func TestConfigWithEnvVars(t *testing.T) {
	setEnvVars(t, config.TestEnvs)

	cfg, err := config.LoadConfig("")
	require.NoError(t, err, "LoadConfig should not fail with valid environment variables")

	// --- Server ---
	assert.Equal(t, 3002, cfg.Server.Port, "Server.Port should reflect 'SERVER_PORT' env var")

	// --- Auth (GitHub) ---
	require.NotNil(t, cfg.Auth.Github, "GitHub Auth config should not be nil")
	assert.Equal(t, "test_value", cfg.Auth.Github.ClientID)
	assert.Equal(t, "test_value", cfg.Auth.Github.ClientSecret)
	// Expect the valid URL strings.
	assert.Equal(t, "http://test_value/callback", cfg.Auth.Github.CallbackURL)
	assert.Equal(t, "http://test_value/auth", cfg.Auth.Github.AuthorizationURL)
	assert.Equal(t, "http://test_value/token", cfg.Auth.Github.TokenURL)
	assert.Equal(t, "http://test_value/profile", cfg.Auth.Github.UserProfileURL)
	assert.Equal(t, "http://test_value", cfg.Auth.FrontendBaseURL)

	// --- JWT ---
	assert.Equal(t, "test_value", cfg.JWT.AccessTokenSecret)
	assert.Equal(t, 48*time.Hour, cfg.JWT.AccessTokenExpirationTime)
	assert.Equal(t, "test_value", cfg.JWT.RefreshTokenSecret)
	assert.Equal(t, 72*time.Hour, cfg.JWT.RefreshTokenExpirationTime)

	// --- Yorkie ---
	assert.Equal(t, "http://test_value", cfg.Yorkie.APIAddr)
	assert.Equal(t, "test_value", cfg.Yorkie.ProjectName)
	assert.Equal(t, "test_value", cfg.Yorkie.ProjectSecretKey)

	// --- Mongo ---
	assert.Equal(t, 10*time.Second, cfg.Mongo.ConnectionTimeout)
	assert.Equal(t, "mongodb://test_value:27017/codepair", cfg.Mongo.ConnectionURI)
	assert.Equal(t, 3*time.Second, cfg.Mongo.PingTimeout)
	assert.Equal(t, "test_value", cfg.Mongo.DatabaseName)

	// --- Storage ---
	assert.Equal(t, "minio", cfg.Storage.Provider, "Storage.Provider must be 'minio' or 's3'")

	// --- Minio ---
	require.NotNil(t, cfg.Storage.Minio, "Storage.Minio must not be nil if provider=minio")
	assert.Equal(t, "test_value", cfg.Storage.Minio.Bucket)
	assert.Equal(t, "http://test_value:9000", cfg.Storage.Minio.Endpoint)
	assert.Equal(t, "test_value", cfg.Storage.Minio.AccessKey)
	assert.Equal(t, "test_value", cfg.Storage.Minio.SecretKey)

	// --- S3 ---
	// In this test S3 values are set via environment variables.
	require.NotNil(t, cfg.Storage.S3, "Storage.S3 struct can still exist")
	assert.Equal(t, "test_value", cfg.Storage.S3.Bucket)
	assert.Equal(t, "test_value", cfg.Storage.S3.Region)
	assert.Equal(t, "test_value", cfg.Storage.S3.AccessKey)
	assert.Equal(t, "test_value", cfg.Storage.S3.SecretKey)
}

func TestLoadConfigFromFile(t *testing.T) {
	t.Run("invalid file path", func(t *testing.T) {
		_, err := config.LoadConfig("invalidPath")
		assert.Error(t, err)
	})

	t.Run("load config from file", func(t *testing.T) {
		cfg, err := config.LoadConfig("config.test.yaml")
		require.NoError(t, err, "LoadConfig should not fail with a valid config.yaml file")

		// --- Server ---
		assert.Equal(t, 3001, cfg.Server.Port, "Server.Port should be 3001")

		// --- Auth (GitHub) ---
		require.NotNil(t, cfg.Auth.Github, "Auth.Github should not be nil")
		assert.Equal(t, "config_client_id", cfg.Auth.Github.ClientID)
		assert.Equal(t, "config_client_secret", cfg.Auth.Github.ClientSecret)
		assert.Equal(t, "https://config.example.com/auth/login/github", cfg.Auth.Github.CallbackURL)
		assert.Equal(t, "https://config.example.com/login/oauth/authorize", cfg.Auth.Github.AuthorizationURL)
		assert.Equal(t, "https://config.example.com/login/oauth/access_token", cfg.Auth.Github.TokenURL)
		assert.Equal(t, "https://config.example.com/api/user", cfg.Auth.Github.UserProfileURL)
		assert.Equal(t, "http://config-frontend:5173", cfg.Auth.FrontendBaseURL)

		// --- JWT ---
		assert.Equal(t, "config_access_token_secret", cfg.JWT.AccessTokenSecret)
		assert.Equal(t, 24*time.Hour, cfg.JWT.AccessTokenExpirationTime)
		assert.Equal(t, "config_refresh_token_secret", cfg.JWT.RefreshTokenSecret)
		assert.Equal(t, 168*time.Hour, cfg.JWT.RefreshTokenExpirationTime)

		// --- Yorkie ---
		assert.Equal(t, "https://config-yorkie:8080", cfg.Yorkie.APIAddr)
		assert.Equal(t, "config_project", cfg.Yorkie.ProjectName)
		assert.Equal(t, "config_project_secret", cfg.Yorkie.ProjectSecretKey)

		// --- Mongo ---
		assert.Equal(t, 10*time.Second, cfg.Mongo.ConnectionTimeout)
		assert.Equal(t, "mongodb://config-mongo:27017/codepair", cfg.Mongo.ConnectionURI)
		assert.Equal(t, 5*time.Second, cfg.Mongo.PingTimeout)
		assert.Equal(t, "config_codepair", cfg.Mongo.DatabaseName)

		// --- Storage ---
		assert.Equal(t, "s3", cfg.Storage.Provider, "Storage.Provider should be 's3'")

		// Minio
		require.NotNil(t, cfg.Storage.Minio, "Storage.Minio should not be nil if the provider is 'minio'")
		assert.Equal(t, "config-storage", cfg.Storage.Minio.Bucket)
		assert.Equal(t, "https://config-minio:9000", cfg.Storage.Minio.Endpoint)
		assert.Equal(t, "config_minioadmin", cfg.Storage.Minio.AccessKey)
		assert.Equal(t, "config_minioadmin", cfg.Storage.Minio.SecretKey)

		// S3
		require.NotNil(t, cfg.Storage.S3, "Storage.S3 struct should not be nil")
		assert.Equal(t, "default-storage", cfg.Storage.S3.Bucket)
		assert.Equal(t, "us-east-1", cfg.Storage.S3.Region)
		assert.Equal(t, "aws_access_key", cfg.Storage.S3.AccessKey)
		assert.Equal(t, "aws_secret_key", cfg.Storage.S3.SecretKey)
	})
}

func TestConfigWithDefaultValues(t *testing.T) {
	// In the minimal YAML below, only the required fields that do not have defaults
	// are provided. For fields with URL validation and defaults, we supply valid values when needed.
	const minimalYAML = `
Auth:
  Github:
    ClientID: "is not default"
    ClientSecret: "is not default"
    TokenURL: "http://is-not-default/token"  # provided but not default; note valid URL format
  FrontendBaseURL: "http://is-not-default"


JWT:
  AccessTokenSecret: "is not default"
  RefreshTokenSecret: "is not default"

Storage:
  Minio:
    AccessKey: "is not default"
    SecretKey: "is not default"
`
	filePath := writeTempConfigFile(t, "minimal_config.yaml", minimalYAML)
	cfg, err := config.LoadConfig(filePath)
	require.NoError(t, err, "LoadConfig should succeed with a minimal config file")

	// --- Server defaults ---
	assert.Equal(t, config.DefaultServerPort, cfg.Server.Port, "Server.Port should default to DefaultServerPort")

	// --- Auth (GitHub) defaults and provided values ---
	require.NotNil(t, cfg.Auth.Github, "Auth.Github should not be nil")
	// Provided values.
	assert.Equal(t, "is not default", cfg.Auth.Github.ClientID)
	assert.Equal(t, "is not default", cfg.Auth.Github.ClientSecret)
	assert.Equal(t, "http://is-not-default/token", cfg.Auth.Github.TokenURL)
	// Default values.
	assert.Equal(t, config.DefaultGitHubCallbackURL, cfg.Auth.Github.CallbackURL)
	assert.Equal(t, config.DefaultGitHubAuthorizationURL, cfg.Auth.Github.AuthorizationURL)
	assert.Equal(t, config.DefaultGitHubUserProfileURL, cfg.Auth.Github.UserProfileURL)
	assert.Equal(t, "http://is-not-default", cfg.Auth.FrontendBaseURL)

	// --- JWT defaults ---
	assert.Equal(t, "is not default", cfg.JWT.AccessTokenSecret)
	assert.Equal(t, config.DefaultAccessTokenExpirationTime, cfg.JWT.AccessTokenExpirationTime)
	assert.Equal(t, "is not default", cfg.JWT.RefreshTokenSecret)
	assert.Equal(t, config.DefaultRefreshTokenExpirationTime, cfg.JWT.RefreshTokenExpirationTime)

	// --- Mongo defaults ---
	assert.Equal(t, config.DefaultConnectionTimeout, cfg.Mongo.ConnectionTimeout)
	assert.Equal(t, config.DefaultMongoConnectionURI, cfg.Mongo.ConnectionURI)
	assert.Equal(t, config.DefaultPingTimeout, cfg.Mongo.PingTimeout)
	assert.Equal(t, config.DefaultMongoDatabaseName, cfg.Mongo.DatabaseName)

	// --- Storage defaults ---
	assert.Equal(t, config.DefaultStorageProvider, cfg.Storage.Provider, "Default storage provider is minio")
	// When provider is minio, ensure the Minio block is set with defaults.
	require.NotNil(t, cfg.Storage.Minio, "Storage.Minio should not be nil when provider is 'minio'")
	assert.Equal(t, config.DefaultMinioBucket, cfg.Storage.Minio.Bucket)
	assert.Equal(t, config.DefaultMinioEndpoint, cfg.Storage.Minio.Endpoint)
	assert.Equal(t, "is not default", cfg.Storage.Minio.AccessKey)
	assert.Equal(t, "is not default", cfg.Storage.Minio.SecretKey)

	// S3 should be nil if not provided.
	assert.Nil(t, cfg.Storage.S3, "Storage.S3 should be nil by default")
}
