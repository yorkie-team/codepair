package main

import (
	"flag"
	"os"

	"github.com/labstack/gommon/log"

	"github.com/yorkie-team/codepair/backend-go/internal/server"
)

func main() {
	conf, err := InitConfig(parseFlags())
	if err != nil {
		log.Fatalf("Failed to create config: %v", err)
		os.Exit(1)
	}

	codePair, err := server.New(conf)
	if err != nil {
		log.Fatalf("Failed to create server: %v", err)
		os.Exit(1)
	}

	if err := codePair.Start(); err != nil {
		log.Fatalf("Server encountered an error: %v", err)
	}
}

// parseFlags encapsulates parsing CLI flags.
func parseFlags() string {
	var configPath string
	flag.StringVar(&configPath, "config", "", "Path to the configuration file")
	flag.Parse()
	return configPath
}
