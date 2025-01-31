package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/server"
)

const gracefulWaitingTime = 30 * time.Second

func main() {
	conf := config.LoadConfig()
	cp := server.New(conf)

	go func() {
		if err := cp.Start(); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	<-ctx.Done()
	log.Printf("Server will shut down in %v", gracefulWaitingTime)

	ctx, cancel := context.WithTimeout(context.Background(), gracefulWaitingTime)
	defer cancel()

	if err := cp.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}

	log.Println("Server exited gracefully.")
}
