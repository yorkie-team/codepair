package config

type Config struct {
	Server *Server
}

func LoadConfig() *Config {
	return &Config{
		Server: &Server{
			Port:        3001,
			ReadTimeout: "10s",
		},
	}
}
