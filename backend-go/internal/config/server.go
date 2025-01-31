package config

import "time"

const (
	DefaultServerPort  = 3001
	DefaultReadTimeout = 10 * time.Second
)

type Server struct {
	Port        int
	ReadTimeout time.Duration
}
