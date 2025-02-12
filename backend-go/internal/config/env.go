package config

// EnvVarMap is used for parsing environment variables into the config structure.
// The key represents the config structure, and the value represents the environment variable.
// In the key, '.' is used to indicate structure depth.
// If you want to add an environment variable to the configuration, you should add the key and value here.
var EnvVarMap = map[string]string{
	// =================== Server ===================
	// The following config values are NOT defined with default values at the code level.

	// The following config values are defined with default values at the code level.
	"Server.Port": "SERVER_PORT",

	// =================== OAuth ===================
	// The following config values are NOT defined with default values at the code level.
	"Oauth.FrontendBaseUrl":     "OAUTH_FRONTEND_BASE_URL",
	"Oauth.Github.ClientId":     "OAUTH_GITHUB_CLIENT_ID",
	"Oauth.Github.ClientSecret": "OAUTH_GITHUB_CLIENT_SECRET",
	"Oauth.Github.CallbackUrl":  "OAUTH_GITHUB_CALLBACK_URL",

	// The following config values are defined with default values at the code level.
	"Oauth.Github.AuthorizationUrl": "OAUTH_GITHUB_AUTHORIZATION_URL",
	"Oauth.Github.TokenUrl":         "OAUTH_GITHUB_TOKEN_URL",
	"Oauth.Github.UserProfileUrl":   "OAUTH_GITHUB_USER_PROFILE_URL",

	// =================== JWT ===================
	// The following config values are NOT defined with default values at the code level.
	"JWT.AccessTokenSecret":  "JWT_ACCESS_TOKEN_SECRET",
	"Jwt.RefreshTokenSecret": "JWT_REFRESH_TOKEN_SECRET",

	// The following config values are defined with default values at the code level.
	"JWT.AccessTokenExpirationTime":  "JWT_ACCESS_TOKEN_EXPIRATION_TIME",
	"JWT.RefreshTokenExpirationTime": "JWT_REFRESH_TOKEN_EXPIRATION_TIME",

	// =================== Yorkie ===================
	// The following config values are NOT defined with default values at the code level.

	// The following config values are defined with default values at the code level.
	"Yorkie.ApiAddr":          "YORKIE_API_ADDR",
	"Yorkie.ProjectName":      "YORKIE_PROJECT_NAME",
	"Yorkie.ProjectSecretKey": "YORKIE_PROJECT_SECRET_KEY",

	// =================== Mongo ===================
	// The following config values are NOT defined with default values at the code level.
	"Mongo.ConnectionURI": "MONGO_CONNECTION_URI",
	"Mongo.DatabaseName":  "MONGO_DATABASE_NAME",

	// The following config values are defined with default values at the code level.
	"Mongo.ConnectionTimeout": "MONGO_CONNECTION_TIMEOUT",
	"Mongo.PingTimeout":       "MONGO_PING_TIMEOUT",

	// =================== Storage ===================
	// The following config values are NOT defined with default values at the code level.
	"Storage.Provider": "STORAGE_PROVIDER",

	// The following config values are defined with default values at the code level.

	// =================== Minio ===================
	// The following config values are NOT defined with default values at the code level.
	"Storage.Minio.Bucket":    "STORAGE_MINIO_BUCKET",
	"Storage.Minio.Endpoint":  "STORAGE_MINIO_ENDPOINT",
	"Storage.Minio.AccessKey": "STORAGE_MINIO_ACCESS_KEY",
	"Storage.Minio.SecretKey": "STORAGE_MINIO_SECRET_KEY",

	// The following config values are defined with default values at the code level.

	// =================== S3 ===================
	// The following config values are NOT defined with default values at the code level.
	"Storage.S3.Bucket":    "STORAGE_S3_BUCKET",
	"Storage.S3.Region":    "STORAGE_S3_REGION",
	"Storage.S3.AccessKey": "STORAGE_S3_ACCESS_KEY",
	"Storage.S3.SecretKey": "STORAGE_S3_SECRET_KEY",

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
