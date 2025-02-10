package config

var EnvVarMap = map[string]string{
	"server.port": "SERVER_PORT",

	"oauth.github.ClientId":         "OAUTH_GITHUB_CLIENT_ID",
	"oauth.github.ClientSecret":     "OAUTH_GITHUB_CLIENT_SECRET",
	"oauth.github.CallbackUrl":      "OAUTH_GITHUB_CALLBACK_URL",
	"oauth.github.AuthorizationUrl": "OAUTH_GITHUB_AUTHORIZATION_URL",
	"oauth.github.TokenUrl":         "OAUTH_GITHUB_TOKEN_URL",
	"oauth.github.UserProfileUrl":   "OAUTH_GITHUB_USER_PROFILE_URL",
	"oauth.FrontendBaseUrl":         "OAUTH_FRONTEND_BASE_URL",

	"jwt.AccessTokenSecret":          "JWT_ACCESS_TOKEN_SECRET",
	"jwt.AccessTokenExpirationTime":  "JWT_ACCESS_TOKEN_EXPIRATION_TIME",
	"jwt.RefreshTokenSecret":         "JWT_REFRESH_TOKEN_SECRET",
	"jwt.RefreshTokenExpirationTime": "JWT_REFRESH_TOKEN_EXPIRATION_TIME",

	"yorkie.ApiAddr":          "YORKIE_API_ADDR",
	"yorkie.ProjectName":      "YORKIE_PROJECT_NAME",
	"yorkie.ProjectSecretKey": "YORKIE_PROJECT_SECRET_KEY",

	"mongo.ConnectionTimeout": "MONGO_CONNECTION_TIMEOUT",
	"mongo.ConnectionURI":     "MONGO_CONNECTION_URI",
	"mongo.PingTimeout":       "MONGO_PING_TIMEOUT",
	"mongo.DatabaseName":      "MONGO_DATABASE_NAME",

	"storage.Provider":        "STORAGE_PROVIDER",
	"storage.minio.Bucket":    "STORAGE_MINIO_BUCKET",
	"storage.minio.Endpoint":  "STORAGE_MINIO_ENDPOINT",
	"storage.minio.AccessKey": "STORAGE_MINIO_ACCESS_KEY",
	"storage.minio.SecretKey": "STORAGE_MINIO_SECRET_KEY",
	"storage.s3.Bucket":       "STORAGE_S3_BUCKET",
	"storage.s3.Region":       "STORAGE_S3_REGION",
	"storage.s3.AccessKey":    "STORAGE_S3_ACCESS_KEY",
	"storage.s3.SecretKey":    "STORAGE_S3_SECRET_KEY",
}

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
	// APIAddr must be a valid URL.
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

	// --- Minio (when provider is minio, Endpoint must be a valid URL) ---
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
