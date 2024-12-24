package config

import "os"

type Config struct {
	MongoURI           string
	GithubClientID     string
	GithubClientSecret string
	JWTSecret          string
	BucketName         string
	AWSRegion          string
}

func New() *Config {
	return &Config{
		MongoURI:           getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		GithubClientID:     os.Getenv("GITHUB_CLIENT_ID"),
		GithubClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
		JWTSecret:          os.Getenv("JWT_SECRET"),
		BucketName:         os.Getenv("BUCKET_NAME"),
		AWSRegion:          os.Getenv("AWS_REGION"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
