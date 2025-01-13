package config

import (
	"github.com/joho/godotenv"
	"github.com/spf13/viper"
	"log"
	"strings"
)

type Config struct {
	GitHub          GithubConfig
	JWT             JWTConfig
	FrontendBaseURL string
	Yorkie          YorkieConfig
	Intelligence    IntelligenceConfig
	Storage         StorageConfig
}

func New() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found or unable to load it (this can be normal in production).")
	}

	viper.SetConfigFile("config.yaml")

	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file: %v\n", err)
	}

	viper.AutomaticEnv()

	replacer := strings.NewReplacer(".", "_")
	viper.SetEnvKeyReplacer(replacer)

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		log.Fatalf("Error unmarshaling config into struct: %v\n", err)
	}

	return &cfg
}
