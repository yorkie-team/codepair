package main

import (
	"context"
	"os"
	"os/signal"
	"time"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/server"
)

func main() {
	conf := config.LoadConfig()

	cp := server.New(conf)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	cp.Start()

	// Wait for interrupt signal to gracefully shut down the server with a timeout of 10 seconds.
	<-ctx.Done()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	cp.Shutdown(ctx)
}
