package config

import (
	"log"
	"time"
)

type Server struct {
	Port        int
	ReadTimeout string
}

func (s *Server) Validate() {
}

func (s *Server) ParseReadTimeout() time.Duration {
	result, err := time.ParseDuration(s.ReadTimeout)
	if err != nil {
		log.Fatalf("parse server read timeout duration: %s", err.Error())
	}

	return result
}

func (s *Server) ensureDefaultValue() {
}
