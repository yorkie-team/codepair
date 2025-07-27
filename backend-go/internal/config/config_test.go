package config_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/yorkie-team/codepair/backend/internal/config"
)

func TestConfigWithEnvVars(t *testing.T) {
	for key, value := range config.TestEnvs {
		t.Setenv(key, value)
	}

	err := config.LoadConfig("")
	require.NoError(t, err, "LoadConfig should not fail with valid environment variables")
	cfg := config.GetConfig()

	// --- Server ---
	assert.Equal(t, 3002, cfg.Server.Port, "Server.Port should reflect 'SERVER_PORT' env var")

	// --- OAuth (GitHub) ---
	require.NotNil(t, cfg.OAuth.Github, "GitHub OAuth config should not be nil")
	assert.Equal(t, "test_value", cfg.OAuth.Github.ClientID)
	assert.Equal(t, "test_value", cfg.OAuth.Github.ClientSecret)
	assert.Equal(t, "http://test_value/callback", cfg.OAuth.Github.CallbackURL)
	assert.Equal(t, "http://test_value/auth", cfg.OAuth.Github.AuthorizationURL)
	assert.Equal(t, "http://test_value/token", cfg.OAuth.Github.TokenURL)
	assert.Equal(t, "http://test_value/profile", cfg.OAuth.Github.UserProfileURL)
	assert.Equal(t, "http://test_value", cfg.OAuth.FrontendBaseURL)

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
		err := config.LoadConfig("invalidPath")
		assert.Error(t, err)
	})

	t.Run("load config from file", func(t *testing.T) {
		err := config.LoadConfig("config-full.test.yaml")
		cfg := config.GetConfig()
		require.NoError(t, err, "LoadConfig should not fail with a valid config.yaml file")

		// --- Server ---
		assert.Equal(t, 3003, cfg.Server.Port, "Server.Port should be 3003")

		// --- OAuth (GitHub) ---
		require.NotNil(t, cfg.OAuth.Github, "OAuth.Github should not be nil")
		assert.Equal(t, "config_client_id", cfg.OAuth.Github.ClientID)
		assert.Equal(t, "config_client_secret", cfg.OAuth.Github.ClientSecret)
		assert.Equal(t, "https://config.example.com/auth/login/github", cfg.OAuth.Github.CallbackURL)
		assert.Equal(t, "https://config.example.com/login/oauth/authorize", cfg.OAuth.Github.AuthorizationURL)
		assert.Equal(t, "https://config.example.com/login/oauth/access_token", cfg.OAuth.Github.TokenURL)
		assert.Equal(t, "https://config.example.com/api/user", cfg.OAuth.Github.UserProfileURL)
		assert.Equal(t, "http://config-frontend:5173", cfg.OAuth.FrontendBaseURL)

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
	err := config.LoadConfig("config-minimal.test.yaml")
	cfg := config.GetConfig()
	require.NoError(t, err, "LoadConfig should succeed with a minimal config file")

	// --- Server defaults ---
	assert.Equal(t, config.DefaultServerPort, cfg.Server.Port, "Server.Port should default to DefaultServerPort")

	// --- OAuth (GitHub) defaults and provided values ---
	require.NotNil(t, cfg.OAuth.Github, "OAuth.Github should not be nil")
	assert.Equal(t, "config-minimal-yaml", cfg.OAuth.Github.ClientID)
	assert.Equal(t, "config-minimal-yaml", cfg.OAuth.Github.ClientSecret)
	assert.Equal(t, "http://config-minimal-yaml/auth/login/github", cfg.OAuth.Github.CallbackURL)
	assert.Equal(t, config.DefaultGitHubTokenURL, cfg.OAuth.Github.TokenURL)
	assert.Equal(t, config.DefaultGitHubAuthorizationURL, cfg.OAuth.Github.AuthorizationURL)
	assert.Equal(t, config.DefaultGitHubUserProfileURL, cfg.OAuth.Github.UserProfileURL)
	assert.Equal(t, "http://config-minimal-yaml", cfg.OAuth.FrontendBaseURL)

	// --- JWT defaults ---
	assert.Equal(t, "config-minimal-yaml", cfg.JWT.AccessTokenSecret)
	assert.Equal(t, config.DefaultAccessTokenExpirationTime, cfg.JWT.AccessTokenExpirationTime)
	assert.Equal(t, "config-minimal-yaml", cfg.JWT.RefreshTokenSecret)
	assert.Equal(t, config.DefaultRefreshTokenExpirationTime, cfg.JWT.RefreshTokenExpirationTime)

	// --- Mongo defaults ---
	assert.Equal(t, config.DefaultConnectionTimeout, cfg.Mongo.ConnectionTimeout)
	assert.Equal(t, "mongodb://config-minimal-yaml-mongo:27017/codepair", cfg.Mongo.ConnectionURI)
	assert.Equal(t, config.DefaultPingTimeout, cfg.Mongo.PingTimeout)
	assert.Equal(t, "config-minimal-yaml-codepair", cfg.Mongo.DatabaseName)
}
