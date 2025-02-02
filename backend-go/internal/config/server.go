package config

import "fmt"

const (
	DefaultServerPort = 3001
)

// Server holds your server configuration.
type Server struct {
	Port int `mapstructure:"Port"`
}

// ensureDefaultValue sets a default if Port is not provided.
func (s *Server) ensureDefaultValue() {
	if s.Port == 0 {
		s.Port = DefaultServerPort
	}
}

func (s *Server) validate() error {
	if s.Port < 1 || 65535 < s.Port {
		return fmt.Errorf("must be between 1 and 65535, given %d", s.Port)
	}
	return nil
}
