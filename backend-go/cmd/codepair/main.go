package main

import (
	"log"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/server"
)

func main() {
	conf := config.LoadConfig()
	cp := server.New(conf)

	if err := cp.Start(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

}
