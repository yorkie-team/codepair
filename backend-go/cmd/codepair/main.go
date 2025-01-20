package main

import (
	"flag"
	"os"

	"github.com/labstack/gommon/log"

	"github.com/yorkie-team/codepair/backend-go/internal/server"
)

var conf *server.Config

func main() {
	codePair, err := server.New(conf)
	if err != nil {
		log.Fatalf("Failed to create server: %v", err)
	}

	log.Infof("Starting server on port %s...", conf.Port)
	if err := codePair.Start(); err != nil {
		log.Fatalf("Server encountered an error: %v", err)
	}
}

func init() {
	configPath := parseFlags()
	var err error
	if conf, err = server.NewConfig(configPath, map[string]string{
		"port": "PORT",

		"auth.github.ClientId":         "AUTH_GITHUB_CLIENT_ID",
		"auth.github.ClientSecret":     "AUTH_GITHUB_CLIENT_SECRET",
		"auth.github.CallbackUrl":      "AUTH_GITHUB_CALLBACK_URL",
		"auth.github.AuthorizationUrl": "AUTH_GITHUB_AUTHORIZATION_URL",
		"auth.github.TokenUrl":         "AUTH_GITHUB_TOKEN_URL",
		"auth.github.UserProfileUrl":   "AUTH_GITHUB_USER_PROFILE_URL",
		"auth.FrontendBaseUrl":         "AUTH_FRONTEND_BASE_URL",

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
	}); err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
		os.Exit(1)
	}
}

// parseFlags encapsulates parsing CLI flags.
func parseFlags() string {
	var configPath string
	flag.StringVar(&configPath, "config", "", "Path to the configuration file")
	flag.Parse()
	return configPath
}
