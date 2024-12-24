package config

import (
	"os"
)

type Config struct {
	MongoURI           string
	GithubClientID     string
	GithubClientSecret string
	GithubCallbackURL  string
	JWTAccessSecret    string
	JWTRefreshSecret   string
	FrontendBaseURL    string
	YorkieAPIAddr      string
	BucketName         string
	MinioEndpoint      string
	MinioAccessKey     string
	MinioSecretKey     string
}

func New() *Config {
	return &Config{
		MongoURI:           getEnv("DATABASE_URL", "mongodb://localhost:27017/codepair"),
		GithubClientID:     os.Getenv("GITHUB_CLIENT_ID"),
		GithubClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
		GithubCallbackURL:  os.Getenv("GITHUB_CALLBACK_URL"),
		JWTAccessSecret:    os.Getenv("JWT_ACCESS_TOKEN_SECRET"),
		JWTRefreshSecret:   os.Getenv("JWT_REFRESH_TOKEN_SECRET"),
		FrontendBaseURL:    os.Getenv("FRONTEND_BASE_URL"),
		YorkieAPIAddr:      os.Getenv("YORKIE_API_ADDR"),
		BucketName:         os.Getenv("BUCKET_NAME"),
		MinioEndpoint:      os.Getenv("MINIO_ENDPOINT"),
		MinioAccessKey:     os.Getenv("MINIO_ACCESS_KEY"),
		MinioSecretKey:     os.Getenv("MINIO_SECRET_KEY"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
