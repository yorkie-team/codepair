package server

import (
	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"github.com/yorkie-team/codepair/backend-go/internal/server"
)

func main() {

	cfg := config.New()
	// start server
	codePair := server.New(cfg)

	codePair.Start()
}
