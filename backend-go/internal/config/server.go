package config

import "fmt"

const (
	DefaultServerPort = 3001
)

type Server struct {
	Port int `validate:"required,min=1,max=65535"`
}

// ensureDefaultValue sets a default port if none is provided.
func (s *Server) ensureDefaultValue() {
	if s.Port == 0 {
		s.Port = DefaultServerPort
	}
}

// validate uses the validator library to validate the struct fields.
func (s *Server) validate() error {
	if err := validate.Struct(s); err != nil {
		return fmt.Errorf("server config validation failed: %w", err)
	}

	return nil
}
