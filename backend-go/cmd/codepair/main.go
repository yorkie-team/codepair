package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/server"
)

func main() {
	conf := config.LoadConfig()

	cp := server.New(conf)

	if err := cp.Start(); err != nil {
		log.Printf("server error: %v", err)
		os.Exit(1)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()
	<-ctx.Done()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := cp.Shutdown(ctx); err != nil {
		log.Printf("server shutdown error: %v", err)
	}
}
