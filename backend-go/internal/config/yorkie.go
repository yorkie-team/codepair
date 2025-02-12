package config

import "fmt"

const (
	DefaultYorkieAPIAddr       = "http://localhost:8080"
	DefaultYorkieProjectName   = "default"
	DefaultYorkieProjectSecret = ""
)

type Yorkie struct {
	APIAddr          string `validate:"required,url"`
	ProjectName      string `validate:"required"`
	ProjectSecretKey string
}

// ensureDefaultValue applies defaults for Yorkie.
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

// validate uses the validator library to validate the struct fields.
func (y *Yorkie) validate() error {
	if err := validate.Struct(y); err != nil {
		return fmt.Errorf("yorkie config validation failed: %w", err)
	}

	return nil
}
