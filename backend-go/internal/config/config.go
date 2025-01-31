package config

type Config struct {
	Server *Server
}

func LoadConfig() *Config {
	return &Config{
		Server: &Server{
			Port:        DefaultServerPort,
			ReadTimeout: DefaultReadTimeout,
		},
	}
}
