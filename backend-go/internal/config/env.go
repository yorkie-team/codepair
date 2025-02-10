package config

// EnvVarMap is used for parsing environment variables into the config structure.
// The key represents the config structure, and the value represents the environment variable.
// In the key, '.' is used to indicate structure depth.
// If you want to add an environment variable to the configuration, you should add the key and value here.
var EnvVarMap = map[string]string{
	// =================== Server ===================
	// The following config values are NOT defined with default values at the code level.

	// The following config values are defined with default values at the code level.
	"server.port": "SERVER_PORT",

	// =================== OAuth ===================
	// The following config values are NOT defined with default values at the code level.
	"oauth.FrontendBaseUrl":     "OAUTH_FRONTEND_BASE_URL",
	"oauth.github.ClientId":     "OAUTH_GITHUB_CLIENT_ID",
	"oauth.github.ClientSecret": "OAUTH_GITHUB_CLIENT_SECRET",
	"oauth.github.CallbackUrl":  "OAUTH_GITHUB_CALLBACK_URL",

	// The following config values are defined with default values at the code level.
	"oauth.github.AuthorizationUrl": "OAUTH_GITHUB_AUTHORIZATION_URL",
	"oauth.github.TokenUrl":         "OAUTH_GITHUB_TOKEN_URL",
	"oauth.github.UserProfileUrl":   "OAUTH_GITHUB_USER_PROFILE_URL",

	// =================== JWT ===================
	// The following config values are NOT defined with default values at the code level.
	"jwt.AccessTokenSecret":  "JWT_ACCESS_TOKEN_SECRET",
	"jwt.RefreshTokenSecret": "JWT_REFRESH_TOKEN_SECRET",

	// The following config values are defined with default values at the code level.
	"jwt.AccessTokenExpirationTime":  "JWT_ACCESS_TOKEN_EXPIRATION_TIME",
	"jwt.RefreshTokenExpirationTime": "JWT_REFRESH_TOKEN_EXPIRATION_TIME",

	// =================== Yorkie ===================
	// The following config values are NOT defined with default values at the code level.

	// The following config values are defined with default values at the code level.
	"yorkie.ApiAddr":          "YORKIE_API_ADDR",
	"yorkie.ProjectName":      "YORKIE_PROJECT_NAME",
	"yorkie.ProjectSecretKey": "YORKIE_PROJECT_SECRET_KEY",

	// =================== Mongo ===================
	// The following config values are NOT defined with default values at the code level.
	"mongo.ConnectionURI": "MONGO_CONNECTION_URI",
	"mongo.DatabaseName":  "MONGO_DATABASE_NAME",

	// The following config values are defined with default values at the code level.
	"mongo.ConnectionTimeout": "MONGO_CONNECTION_TIMEOUT",
	"mongo.PingTimeout":       "MONGO_PING_TIMEOUT",

	// =================== Storage ===================
	// The following config values are NOT defined with default values at the code level.
	"storage.Provider": "STORAGE_PROVIDER",

	// The following config values are defined with default values at the code level.

	// =================== Minio ===================
	// The following config values are NOT defined with default values at the code level.
	"storage.minio.Bucket":    "STORAGE_MINIO_BUCKET",
	"storage.minio.Endpoint":  "STORAGE_MINIO_ENDPOINT",
	"storage.minio.AccessKey": "STORAGE_MINIO_ACCESS_KEY",
	"storage.minio.SecretKey": "STORAGE_MINIO_SECRET_KEY",

	// The following config values are defined with default values at the code level.

	// =================== S3 ===================
	// The following config values are NOT defined with default values at the code level.
	"storage.s3.Bucket":    "STORAGE_S3_BUCKET",
	"storage.s3.Region":    "STORAGE_S3_REGION",
	"storage.s3.AccessKey": "STORAGE_S3_ACCESS_KEY",
	"storage.s3.SecretKey": "STORAGE_S3_SECRET_KEY",

	// The following config values are defined with default values at the code level.

}

// TestEnvs contains environment variables for testing.
// These values are used when running tests to simulate a production-like environment
// without affecting real credentials or services.
var TestEnvs = map[string]string{
	// --- Server ---
	"SERVER_PORT": "3002",

	// --- OAuth ---
	"OAUTH_GITHUB_CLIENT_ID":         "test_value",
	"OAUTH_GITHUB_CLIENT_SECRET":     "test_value",
	"OAUTH_GITHUB_CALLBACK_URL":      "http://test_value/callback",
	"OAUTH_GITHUB_AUTHORIZATION_URL": "http://test_value/auth",
	"OAUTH_GITHUB_TOKEN_URL":         "http://test_value/token",
	"OAUTH_GITHUB_USER_PROFILE_URL":  "http://test_value/profile",
	"OAUTH_FRONTEND_BASE_URL":        "http://test_value",

	// --- JWT ---
	"JWT_ACCESS_TOKEN_SECRET":           "test_value",
	"JWT_ACCESS_TOKEN_EXPIRATION_TIME":  "48h",
	"JWT_REFRESH_TOKEN_SECRET":          "test_value",
	"JWT_REFRESH_TOKEN_EXPIRATION_TIME": "72h",

	// --- Yorkie ---
	"YORKIE_API_ADDR":           "http://test_value",
	"YORKIE_PROJECT_NAME":       "test_value",
	"YORKIE_PROJECT_SECRET_KEY": "test_value",

	// --- Mongo ---
	// ConnectionURI must be a valid URL; we use a mongodb:// URL.
	"MONGO_CONNECTION_TIMEOUT": "10s",
	"MONGO_CONNECTION_URI":     "mongodb://test_value:27017/codepair",
	"MONGO_PING_TIMEOUT":       "3s",
	"MONGO_DATABASE_NAME":      "test_value",

	// --- Storage ---
	// Provider must be "minio" or "s3".
	"STORAGE_PROVIDER": "minio",

	// --- Minio ---
	"STORAGE_MINIO_BUCKET":     "test_value",
	"STORAGE_MINIO_ENDPOINT":   "http://test_value:9000",
	"STORAGE_MINIO_ACCESS_KEY": "test_value",
	"STORAGE_MINIO_SECRET_KEY": "test_value",

	// --- S3 ---
	"STORAGE_S3_BUCKET":     "test_value",
	"STORAGE_S3_REGION":     "test_value",
	"STORAGE_S3_ACCESS_KEY": "test_value",
	"STORAGE_S3_SECRET_KEY": "test_value",
}
