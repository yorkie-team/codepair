package logging

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
)

type LogLevel int8

const logKey = "log-level-key"

const (
	Debug LogLevel = iota
	Info
	Warn
	Err
	Fatal
)

// SetInfo sets the log level to Info in the echo context
func SetInfo(c echo.Context) {
	c.Set(logKey, log.INFO)
}

// SetDebug sets the log level to Debug in the echo context
func SetDebug(c echo.Context) {
	c.Set(logKey, log.DEBUG)
}

// SetWarn sets the log level to Warn in the echo context
func SetWarn(c echo.Context) {
	c.Set(logKey, log.WARN)
}

// SetErr sets the log level to Err in the echo context
func SetErr(c echo.Context) {
	c.Set(logKey, log.ERROR)
}

// SetFatal sets the log level to Fatal in the echo context
func SetFatal(c echo.Context) {
	c.Set(logKey, log.OFF)
}

// SetLogLevel sets a specified log level in the echo context
func SetLogLevel(c echo.Context, level log.Lvl) {
	c.Set(logKey, level)
}

// GetLogLevel retrieves the log level from the echo context
func GetLogLevel(c echo.Context) log.Lvl {
	if value, ok := c.Get(logKey).(log.Lvl); ok {
		return value
	}
	return log.INFO // Default log level
}

// LogByLevel logs a message based on the log level in the context
func LogByLevel(c echo.Context, logger echo.Logger, err error) {
	switch GetLogLevel(c) {
	case log.DEBUG:
		logger.Debug(err)
	case log.INFO:
		logger.Info(err)
	case log.WARN:
		logger.Warn(err)
	case log.ERROR:
		logger.Error(err)
	case log.OFF:
		// Do nothing for OFF level
	default:
		logger.Error(err)
	}
}
