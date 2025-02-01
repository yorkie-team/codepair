package main

import (
	"log"
	"os"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/server"
)

func main() {
	conf := config.LoadConfig()
	cp := server.New(conf)

	if err := cp.Start(); err != nil {
		log.Println(err)
		os.Exit(1)
	}
}
