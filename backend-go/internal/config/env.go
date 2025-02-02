package config

var EnvVarMap = map[string]string{
	"server.port": "SERVER_PORT",

	"oauth.github.ClientId":         "OAUTH_GITHUB_CLIENT_ID",
	"oauth.github.ClientSecret":     "OAUTH_GITHUB_CLIENT_SECRET",
	"oauth.github.CallbackUrl":      "OAUTH_GITHUB_CALLBACK_URL",
	"oauth.github.AuthorizationUrl": "OAUTH_GITHUB_AUTHORIZATION_URL",
	"oauth.github.TokenUrl":         "OAUTH_GITHUB_TOKEN_URL",
	"oauth.github.UserProfileUrl":   "OAUTH_GITHUB_USER_PROFILE_URL",
	"auth.FrontendBaseUrl":          "AUTH_FRONTEND_BASE_URL",

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
