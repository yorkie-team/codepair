package yorkie

const (
	DefaultApiAddr          = "localhost:8080"
	DefaultProjectName      = "default"
	DefaultProjectSecretKey = ""
)

type Config struct {
	ApiAddr          string `yaml:"ApiAddr"`
	ProjectName      string `yaml:"ProjectName"`
	ProjectSecretKey string `yaml:"ProjectSecretKey"`
}

func (c *Config) EnsureDefaultValue() {
	if c.ApiAddr == "" {
		c.ApiAddr = DefaultApiAddr
	}
	if c.ProjectName == "" {
		c.ProjectName = DefaultProjectName
	}
	if c.ProjectSecretKey == "" {
		c.ProjectSecretKey = DefaultProjectSecretKey
	}
}
