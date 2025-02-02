package config

import "fmt"

const (
	DefaultYorkieAPIAddr       = "http://localhost:8080"
	DefaultYorkieProjectName   = "default"
	DefaultYorkieProjectSecret = ""
)

type Yorkie struct {
	APIAddr          string `mapstructure:"APIAddr"`
	ProjectName      string `mapstructure:"ProjectName"`
	ProjectSecretKey string `mapstructure:"ProjectSecretKey"`
}

func (y *Yorkie) ensureDefaultValue() {
	if y.APIAddr == "" {
		y.APIAddr = DefaultYorkieAPIAddr
	}
	if y.ProjectName == "" {
		y.ProjectName = DefaultYorkieProjectName
	}
	if y.ProjectSecretKey == "" {
		y.ProjectSecretKey = DefaultYorkieProjectSecret
	}
}

func (y *Yorkie) validate() error {
	if y.APIAddr == "" {
		return fmt.Errorf("yorkie APIAddr cannot be empty")
	}
	return nil
}
