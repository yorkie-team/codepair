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

func TestConfigWithEnvVars(t *testing.T) {
	t.Setenv("SERVER_PORT", "3002")

	t.Setenv("OAUTH_GITHUB_CLIENT_ID", "test_value")
	t.Setenv("OAUTH_GITHUB_CLIENT_SECRET", "test_value")
	t.Setenv("OAUTH_GITHUB_CALLBACK_URL", "test_value")
	t.Setenv("OAUTH_GITHUB_AUTHORIZATION_URL", "test_value")
	t.Setenv("OAUTH_GITHUB_TOKEN_URL", "test_value")
	t.Setenv("OAUTH_GITHUB_USER_PROFILE_URL", "test_value")

	t.Setenv("AUTH_FRONTEND_BASE_URL", "test_value")

	t.Setenv("JWT_ACCESS_TOKEN_SECRET", "test_value")
	t.Setenv("JWT_ACCESS_TOKEN_EXPIRATION_TIME", "48h")
	t.Setenv("JWT_REFRESH_TOKEN_SECRET", "test_value")
	t.Setenv("JWT_REFRESH_TOKEN_EXPIRATION_TIME", "72h")

	t.Setenv("YORKIE_API_ADDR", "test_value")
	t.Setenv("YORKIE_PROJECT_NAME", "test_value")
	t.Setenv("YORKIE_PROJECT_SECRET_KEY", "test_value")

	t.Setenv("MONGO_CONNECTION_TIMEOUT", "10s")
	t.Setenv("MONGO_CONNECTION_URI", "test_value")
	t.Setenv("MONGO_PING_TIMEOUT", "3s")
	t.Setenv("MONGO_DATABASE_NAME", "test_value")

	t.Setenv("STORAGE_PROVIDER", "minio")
	t.Setenv("STORAGE_MINIO_BUCKET", "test_value")
	t.Setenv("STORAGE_MINIO_ENDPOINT", "test_value")
	t.Setenv("STORAGE_MINIO_ACCESS_KEY", "test_value")
	t.Setenv("STORAGE_MINIO_SECRET_KEY", "test_value")

	t.Setenv("STORAGE_S3_BUCKET", "test_value")
	t.Setenv("STORAGE_S3_REGION", "test_value")
	t.Setenv("STORAGE_S3_ACCESS_KEY", "test_value")
	t.Setenv("STORAGE_S3_SECRET_KEY", "test_value")

	cfg, err := config.LoadConfig("")
	require.NoError(t, err, "LoadConfig should not fail with valid environment variables")

	assert.Equal(t, 3002, cfg.Server.Port, "server.port should reflect 'PORT' env var")

	require.NotNil(t, cfg.OAuth.Github, "GitHub OAuth config should not be nil")
	assert.Equal(t, "test_value", cfg.OAuth.Github.ClientID)
	assert.Equal(t, "test_value", cfg.OAuth.Github.ClientSecret)
	assert.Equal(t, "test_value", cfg.OAuth.Github.CallbackURL)
	assert.Equal(t, "test_value", cfg.OAuth.Github.AuthorizationURL)
	assert.Equal(t, "test_value", cfg.OAuth.Github.TokenURL)
	assert.Equal(t, "test_value", cfg.OAuth.Github.UserProfileURL)

	assert.Equal(t, "test_value", cfg.JWT.AccessTokenSecret)
	assert.Equal(t, 48*time.Hour, cfg.JWT.AccessTokenExpirationTime)
	assert.Equal(t, "test_value", cfg.JWT.RefreshTokenSecret)
	assert.Equal(t, 72*time.Hour, cfg.JWT.RefreshTokenExpirationTime)

	assert.Equal(t, "test_value", cfg.Yorkie.APIAddr)
	assert.Equal(t, "test_value", cfg.Yorkie.ProjectName)
	assert.Equal(t, "test_value", cfg.Yorkie.ProjectSecretKey)

	assert.Equal(t, 10*time.Second, cfg.Mongo.ConnectionTimeout)
	assert.Equal(t, "test_value", cfg.Mongo.ConnectionURI)
	assert.Equal(t, 3*time.Second, cfg.Mongo.PingTimeout)
	assert.Equal(t, "test_value", cfg.Mongo.DatabaseName)

	assert.Equal(t, "minio", cfg.Storage.Provider, "storage.provider must be 'minio' or 's3'")

	require.NotNil(t, cfg.Storage.Minio, "Storage.Minio must not be nil if provider=minio")
	assert.Equal(t, "test_value", cfg.Storage.Minio.Bucket)
	assert.Equal(t, "test_value", cfg.Storage.Minio.Endpoint)
	assert.Equal(t, "test_value", cfg.Storage.Minio.AccessKey)
	assert.Equal(t, "test_value", cfg.Storage.Minio.SecretKey)

	require.NotNil(t, cfg.Storage.S3, "Storage.S3 struct can still exist")
	assert.Equal(t, "test_value", cfg.Storage.S3.Bucket)
	assert.Equal(t, "test_value", cfg.Storage.S3.Region)
	assert.Equal(t, "test_value", cfg.Storage.S3.AccessKey)
	assert.Equal(t, "test_value", cfg.Storage.S3.SecretKey)
}

func TestLoadConfigFromFile(t *testing.T) {
	t.Run("invalid file path test", func(t *testing.T) {
		_, err := config.LoadConfig("invalidPath")
		assert.Error(t, err)
	})

	t.Run("load config from file test", func(t *testing.T) {
		const sampleYAML = `
Server:
  Port: 3001

OAuth:
  Github:
    ClientID: "config_client_id"
    ClientSecret: "config_client_secret"
    CallbackURL: "http://config.example.com/auth/login/github"
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

		tmpDir := t.TempDir()
		filePath := filepath.Join(tmpDir, "config.yaml")

		err := os.WriteFile(filePath, []byte(sampleYAML), 0644)
		require.NoError(t, err, "Should be able to create a temporary config.yaml file")

		// 2) Call LoadConfig with the file path
		cfg, err := config.LoadConfig(filePath)
		require.NoError(t, err, "LoadConfig should not fail with a valid config.yaml file")

		// --- Server ---
		assert.Equal(t, 3001, cfg.Server.Port, "Server.Port should be 3001")

		// --- OAuth (GitHub) ---
		require.NotNil(t, cfg.OAuth.Github, "OAuth.Github should not be nil")
		assert.Equal(t, "config_client_id", cfg.OAuth.Github.ClientID, "OAuth.Github.ClientID should match")
		assert.Equal(t, "config_client_secret", cfg.OAuth.Github.ClientSecret, "OAuth.Github.ClientSecret should match")
		assert.Equal(t, "http://config.example.com/auth/login/github", cfg.OAuth.Github.CallbackURL, "OAuth.Github.CallbackURL should match")
		assert.Equal(t, "https://config.example.com/login/oauth/authorize", cfg.OAuth.Github.AuthorizationURL, "OAuth.Github.AuthorizationURL should match")
		assert.Equal(t, "https://config.example.com/login/oauth/access_token", cfg.OAuth.Github.TokenURL, "OAuth.Github.TokenURL should match")
		assert.Equal(t, "https://config.example.com/api/user", cfg.OAuth.Github.UserProfileURL, "OAuth.Github.UserProfileURL should match")

		// --- JWT ---
		assert.Equal(t, "config_access_token_secret", cfg.JWT.AccessTokenSecret, "JWT.AccessTokenSecret should match")
		assert.Equal(t, 24*time.Hour, cfg.JWT.AccessTokenExpirationTime, "JWT.AccessTokenExpirationTime should be 24h")
		assert.Equal(t, "config_refresh_token_secret", cfg.JWT.RefreshTokenSecret, "JWT.RefreshTokenSecret should match")
		assert.Equal(t, 168*time.Hour, cfg.JWT.RefreshTokenExpirationTime, "JWT.RefreshTokenExpirationTime should be 168h")

		// --- Yorkie ---
		// The YAML key is APIAddr, but it maps to ApiAddr in the Config struct based on the mapstructure tag.
		assert.Equal(t, "http://config-yorkie:8080", cfg.Yorkie.APIAddr, "Yorkie.ApiAddr should match")
		assert.Equal(t, "config_project", cfg.Yorkie.ProjectName, "Yorkie.ProjectName should match")
		assert.Equal(t, "config_project_secret", cfg.Yorkie.ProjectSecretKey, "Yorkie.ProjectSecretKey should match")

		// --- Mongo ---
		assert.Equal(t, 10*time.Second, cfg.Mongo.ConnectionTimeout, "Mongo.ConnectionTimeout should be 10s")
		assert.Equal(t, "mongodb://config-mongo:27017/codepair", cfg.Mongo.ConnectionURI, "Mongo.ConnectionURI should match")
		assert.Equal(t, 5*time.Second, cfg.Mongo.PingTimeout, "Mongo.PingTimeout should be 5s")
		assert.Equal(t, "config_codepair", cfg.Mongo.DatabaseName, "Mongo.DatabaseName should match")

		// --- Storage ---
		assert.Equal(t, "s3", cfg.Storage.Provider, "Storage.Provider should be 's3'")

		// Minio
		require.NotNil(t, cfg.Storage.Minio, "Storage.Minio should not be nil if the provider is 'minio'")
		assert.Equal(t, "config-storage", cfg.Storage.Minio.Bucket, "Storage.Minio.Bucket should match")
		assert.Equal(t, "http://config-minio:9000", cfg.Storage.Minio.Endpoint, "Storage.Minio.Endpoint should match")
		assert.Equal(t, "config_minioadmin", cfg.Storage.Minio.AccessKey, "Storage.Minio.AccessKey should match")
		assert.Equal(t, "config_minioadmin", cfg.Storage.Minio.SecretKey, "Storage.Minio.SecretKey should match")

		// S3 (Values should be applied as defined in YAML)
		require.NotNil(t, cfg.Storage.S3, "Storage.S3 struct should not be nil")
		assert.Equal(t, "default-storage", cfg.Storage.S3.Bucket, "Storage.S3.Bucket should match")
		assert.Equal(t, "us-east-1", cfg.Storage.S3.Region, "Storage.S3.Region should match")
		assert.Equal(t, "aws_access_key", cfg.Storage.S3.AccessKey, "Storage.S3.AccessKey should match")
		assert.Equal(t, "aws_secret_key", cfg.Storage.S3.SecretKey, "Storage.S3.SecretKey should match")
	})
}

func TestConfigWithDefaultValues(t *testing.T) {
	// minimalYAML contains only the required values; all other fields should be set to their defaults.
	const minimalYAML = `
OAuth:
  Github:
    ClientID: "provided_client_id"
    ClientSecret: "provided_client_secret"
`

	// Write the minimal YAML content to a temporary file.
	tmpDir := t.TempDir()
	filePath := filepath.Join(tmpDir, "minimal_config.yaml")
	err := os.WriteFile(filePath, []byte(minimalYAML), 0644)
	require.NoError(t, err, "Should be able to create a temporary minimal config file")

	// Call LoadConfig with the minimal config file.
	cfg, err := config.LoadConfig(filePath)
	require.NoError(t, err, "LoadConfig should succeed with a minimal config file")

	// --- Server ---
	// Since no Server section was provided, ensureDefaultValue should set the default port.
	assert.Equal(t, config.DefaultServerPort, cfg.Server.Port, "Server.Port should default to DefaultServerPort")

	// --- OAuth (GitHub) ---
	require.NotNil(t, cfg.OAuth.Github, "OAuth.Github should not be nil")
	// Provided values.
	assert.Equal(t, "provided_client_id", cfg.OAuth.Github.ClientID, "OAuth.Github.ClientID should match provided value")
	assert.Equal(t, "provided_client_secret", cfg.OAuth.Github.ClientSecret, "OAuth.Github.ClientSecret should match provided value")
	// Default values should be applied for these fields.
	assert.Equal(t, config.DefaultGitHubCallbackURL, cfg.OAuth.Github.CallbackURL, "OAuth.Github.CallbackURL should default")
	assert.Equal(t, config.DefaultGitHubAuthorizationURL, cfg.OAuth.Github.AuthorizationURL, "OAuth.Github.AuthorizationURL should default")
	assert.Equal(t, config.DefaultGitHubTokenURL, cfg.OAuth.Github.TokenURL, "OAuth.Github.TokenURL should default")
	assert.Equal(t, config.DefaultGitHubUserProfileURL, cfg.OAuth.Github.UserProfileURL, "OAuth.Github.UserProfileURL should default")

	// --- JWT ---
	// Since no JWT section was provided, defaults should be applied.
	assert.Equal(t, config.DefaultAccessTokenSecret, cfg.JWT.AccessTokenSecret, "JWT.AccessTokenSecret should default")
	assert.Equal(t, config.DefaultAccessTokenExpirationTime, cfg.JWT.AccessTokenExpirationTime, "JWT.AccessTokenExpirationTime should default")
	assert.Equal(t, config.DefaultRefreshTokenSecret, cfg.JWT.RefreshTokenSecret, "JWT.RefreshTokenSecret should default")
	assert.Equal(t, config.DefaultRefreshTokenExpirationTime, cfg.JWT.RefreshTokenExpirationTime, "JWT.RefreshTokenExpirationTime should default")

	// --- Mongo ---
	// With no Mongo section provided, the defaults should be used.
	assert.Equal(t, config.DefaultConnectionTimeout, cfg.Mongo.ConnectionTimeout, "Mongo.ConnectionTimeout should default")
	assert.Equal(t, config.DefaultMongoConnectionURI, cfg.Mongo.ConnectionURI, "Mongo.ConnectionURI should default")
	assert.Equal(t, config.DefaultPingTimeout, cfg.Mongo.PingTimeout, "Mongo.PingTimeout should default")
	assert.Equal(t, config.DefaultMongoDatabaseName, cfg.Mongo.DatabaseName, "Mongo.DatabaseName should default")

	// --- Storage ---
	// Because no Storage.Provider was provided, ensureDefaultValue should set it to the default provider.
	assert.Equal(t, config.DefaultStorageProvider, cfg.Storage.Provider, "Storage.Provider should default to DefaultStorageProvider")
	// For provider "minio", an empty block was provided so that Minio is not nil.
	require.NotNil(t, cfg.Storage.Minio, "Storage.Minio should not be nil when provider is 'minio'")
	assert.Equal(t, config.DefaultMinioBucket, cfg.Storage.Minio.Bucket, "Storage.Minio.Bucket should default")
	assert.Equal(t, config.DefaultMinioEndpoint, cfg.Storage.Minio.Endpoint, "Storage.Minio.Endpoint should default")
	assert.Equal(t, config.DefaultMinioAccessKey, cfg.Storage.Minio.AccessKey, "Storage.Minio.AccessKey should default")
	assert.Equal(t, config.DefaultMinioSecretKey, cfg.Storage.Minio.SecretKey, "Storage.Minio.SecretKey should default")
	// S3 should remain nil if not provided.
	assert.Nil(t, cfg.Storage.S3, "Storage.S3 should be nil by default")
}
