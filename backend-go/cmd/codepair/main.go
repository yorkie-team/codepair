package main

import (
	"flag"
	"fmt"

	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/server"
)

func main() {
	configPath, loglevel := parseFlag()

	e := echo.New()
	if err := setLogger(e, loglevel); err != nil {
		e.Logger.Fatal(err)
	}

	conf, err := config.LoadConfig(configPath)
	if err != nil {
		e.Logger.Fatal(err)
	}

	cp, err := server.New(e, conf)
	if err != nil {
		e.Logger.Fatal(err)
	}

	if err := cp.Start(); err != nil {
		e.Logger.Fatal(err)
	}
}

func parseFlag() (string, string) {
	var configPath string
	var loglevel string
	flag.StringVar(&configPath, "config", "", "Path to the configuration file")
	flag.StringVar(&loglevel, "loglevel", "error", "Log level")
	flag.Parse()

	return configPath, loglevel
}

func setLogger(e *echo.Echo, level string) error {
	e.Logger.SetHeader("${level} ${time_rfc3339}")

	switch level {
	case "debug":
		e.Debug = true
		e.Logger.SetLevel(log.DEBUG)
	case "info":
		e.Logger.SetLevel(log.INFO)
	case "warn":
		e.Logger.SetLevel(log.WARN)
	case "error":
		e.Logger.SetLevel(log.ERROR)
	case "off":
		e.Logger.SetLevel(log.OFF)
	default:
		return fmt.Errorf("invalid log level %s", level)
	}
	return nil
}
