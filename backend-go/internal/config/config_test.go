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
	// Define environment variables in a map.
	envs := map[string]string{
		"SERVER_PORT": "3002",

		"OAUTH_GITHUB_CLIENT_ID":         "test_value",
		"OAUTH_GITHUB_CLIENT_SECRET":     "test_value",
		"OAUTH_GITHUB_CALLBACK_URL":      "test_value",
		"OAUTH_GITHUB_AUTHORIZATION_URL": "test_value",
		"OAUTH_GITHUB_TOKEN_URL":         "test_value",
		"OAUTH_GITHUB_USER_PROFILE_URL":  "test_value",

		"AUTH_FRONTEND_BASE_URL": "test_value",

		"JWT_ACCESS_TOKEN_SECRET":           "test_value",
		"JWT_ACCESS_TOKEN_EXPIRATION_TIME":  "48h",
		"JWT_REFRESH_TOKEN_SECRET":          "test_value",
		"JWT_REFRESH_TOKEN_EXPIRATION_TIME": "72h",

		"YORKIE_API_ADDR":           "test_value",
		"YORKIE_PROJECT_NAME":       "test_value",
		"YORKIE_PROJECT_SECRET_KEY": "test_value",

		"MONGO_CONNECTION_TIMEOUT": "10s",
		"MONGO_CONNECTION_URI":     "test_value",
		"MONGO_PING_TIMEOUT":       "3s",
		"MONGO_DATABASE_NAME":      "test_value",

		"STORAGE_PROVIDER":         "minio",
		"STORAGE_MINIO_BUCKET":     "test_value",
		"STORAGE_MINIO_ENDPOINT":   "test_value",
		"STORAGE_MINIO_ACCESS_KEY": "test_value",
		"STORAGE_MINIO_SECRET_KEY": "test_value",

		"STORAGE_S3_BUCKET":     "test_value",
		"STORAGE_S3_REGION":     "test_value",
		"STORAGE_S3_ACCESS_KEY": "test_value",
		"STORAGE_S3_SECRET_KEY": "test_value",
	}
	setEnvVars(t, envs)

	cfg, err := config.LoadConfig("")
	require.NoError(t, err, "LoadConfig should not fail with valid environment variables")

	// --- Server ---
	assert.Equal(t, 3002, cfg.Server.Port, "Server.Port should reflect 'SERVER_PORT' env var")

	// --- OAuth (GitHub) ---
	require.NotNil(t, cfg.OAuth.Github, "GitHub OAuth config should not be nil")
	assert.Equal(t, "test_value", cfg.OAuth.Github.ClientID)
	assert.Equal(t, "test_value", cfg.OAuth.Github.ClientSecret)
	assert.Equal(t, "test_value", cfg.OAuth.Github.CallbackURL)
	assert.Equal(t, "test_value", cfg.OAuth.Github.AuthorizationURL)
	assert.Equal(t, "test_value", cfg.OAuth.Github.TokenURL)
	assert.Equal(t, "test_value", cfg.OAuth.Github.UserProfileURL)

	// --- JWT ---
	assert.Equal(t, "test_value", cfg.JWT.AccessTokenSecret)
	assert.Equal(t, 48*time.Hour, cfg.JWT.AccessTokenExpirationTime)
	assert.Equal(t, "test_value", cfg.JWT.RefreshTokenSecret)
	assert.Equal(t, 72*time.Hour, cfg.JWT.RefreshTokenExpirationTime)

	// --- Yorkie ---
	assert.Equal(t, "test_value", cfg.Yorkie.APIAddr)
	assert.Equal(t, "test_value", cfg.Yorkie.ProjectName)
	assert.Equal(t, "test_value", cfg.Yorkie.ProjectSecretKey)

	// --- Mongo ---
	assert.Equal(t, 10*time.Second, cfg.Mongo.ConnectionTimeout)
	assert.Equal(t, "test_value", cfg.Mongo.ConnectionURI)
	assert.Equal(t, 3*time.Second, cfg.Mongo.PingTimeout)
	assert.Equal(t, "test_value", cfg.Mongo.DatabaseName)

	// --- Storage ---
	assert.Equal(t, "minio", cfg.Storage.Provider, "Storage.Provider must be 'minio' or 's3'")

	// --- Minio ---
	// For Minio: ensure the block is not nil and values match.
	require.NotNil(t, cfg.Storage.Minio, "Storage.Minio must not be nil if provider=minio")
	assert.Equal(t, "test_value", cfg.Storage.Minio.Bucket)
	assert.Equal(t, "test_value", cfg.Storage.Minio.Endpoint)
	assert.Equal(t, "test_value", cfg.Storage.Minio.AccessKey)
	assert.Equal(t, "test_value", cfg.Storage.Minio.SecretKey)

	// --- S3 ---
	// For S3: the struct exists though values may be default or provided.
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
		const sampleYAML = `
Server:
  Port: 3001

OAuth:
  Github:
    ClientID: "config_client_id"
    ClientSecret: "config_client_secret"
    CallbackURL: "https://config.example.com/auth/login/github"
    AuthorizationURL: "https://config.example.com/login/oauth/authorize"
    TokenURL: "https://config.example.com/login/oauth/access_token"
    UserProfileURL: "https://config.example.com/api/user"

FrontendBaseURL: "http://config-frontend:5173"

JWT:
  AccessTokenSecret: "config_access_token_secret"
  AccessTokenExpirationTime: "24h"
  RefreshTokenSecret: "config_refresh_token_secret"
  RefreshTokenExpirationTime: "168h"

Yorkie:
  APIAddr: "http://config-yorkie:8080"
  ProjectName: "config_project"
  ProjectSecretKey: "config_project_secret"

Mongo:
  ConnectionTimeout: "10s"
  ConnectionURI: "mongodb://config-mongo:27017/codepair"
  PingTimeout: "5s"
  DatabaseName: "config_codepair"

Storage:
  Provider: "s3"

  Minio:
    Bucket: "config-storage"
    Endpoint: "http://config-minio:9000"
    AccessKey: "config_minioadmin"
    SecretKey: "config_minioadmin"

  S3:
    Bucket: "default-storage"
    Region: "us-east-1"
    AccessKey: "aws_access_key"
    SecretKey: "aws_secret_key"
`
		filePath := writeTempConfigFile(t, "config.yaml", sampleYAML)
		cfg, err := config.LoadConfig(filePath)
		require.NoError(t, err, "LoadConfig should not fail with a valid config.yaml file")

		// --- Server ---
		assert.Equal(t, 3001, cfg.Server.Port, "Server.Port should be 3001")

		// --- OAuth (GitHub) ---
		require.NotNil(t, cfg.OAuth.Github, "OAuth.Github should not be nil")
		assert.Equal(t, "config_client_id", cfg.OAuth.Github.ClientID)
		assert.Equal(t, "config_client_secret", cfg.OAuth.Github.ClientSecret)
		assert.Equal(t, "https://config.example.com/auth/login/github", cfg.OAuth.Github.CallbackURL)
		assert.Equal(t, "https://config.example.com/login/oauth/authorize", cfg.OAuth.Github.AuthorizationURL)
		assert.Equal(t, "https://config.example.com/login/oauth/access_token", cfg.OAuth.Github.TokenURL)
		assert.Equal(t, "https://config.example.com/api/user", cfg.OAuth.Github.UserProfileURL)

		// --- JWT ---
		assert.Equal(t, "config_access_token_secret", cfg.JWT.AccessTokenSecret)
		assert.Equal(t, 24*time.Hour, cfg.JWT.AccessTokenExpirationTime)
		assert.Equal(t, "config_refresh_token_secret", cfg.JWT.RefreshTokenSecret)
		assert.Equal(t, 168*time.Hour, cfg.JWT.RefreshTokenExpirationTime)

		// --- Yorkie ---
		assert.Equal(t, "http://config-yorkie:8080", cfg.Yorkie.APIAddr)
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
		assert.Equal(t, "http://config-minio:9000", cfg.Storage.Minio.Endpoint)
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
	const minimalYAML = `
OAuth:
  Github:
    ClientID: "is not default"
    ClientSecret: "is not default"
    TokenURL: "is not default"

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

	// --- OAuth (GitHub) defaults and provided values ---
	require.NotNil(t, cfg.OAuth.Github, "OAuth.Github should not be nil")
	// Provided values.
	assert.Equal(t, "is not default", cfg.OAuth.Github.ClientID)
	assert.Equal(t, "is not default", cfg.OAuth.Github.ClientSecret)
	// Default values.
	assert.Equal(t, config.DefaultGitHubCallbackURL, cfg.OAuth.Github.CallbackURL)
	assert.Equal(t, config.DefaultGitHubAuthorizationURL, cfg.OAuth.Github.AuthorizationURL)
	assert.Equal(t, config.DefaultGitHubUserProfileURL, cfg.OAuth.Github.UserProfileURL)
	assert.Equal(t, "is not default", cfg.OAuth.Github.TokenURL)

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
