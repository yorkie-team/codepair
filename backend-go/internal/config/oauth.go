package config

import "fmt"

const (
	DefaultGitHubAuthorizationURL = "https://github.com/login/oauth/authorize"
	DefaultGitHubUserProfileURL   = "https://api.github.com/user"
	DefaultGitHubCallbackURL      = "https://localhost:3000/auth/login/github"
)

type OAuth struct {
	Github *Github `mapstructure:"Github" validate:"required"`
}

type Github struct {
	ClientID         string `mapstructure:"ClientID" validate:"required"`
	ClientSecret     string `mapstructure:"ClientSecret" validate:"required"`
	CallbackURL      string `mapstructure:"CallbackURL" validate:"required,url"`
	AuthorizationURL string `mapstructure:"AuthorizationURL" validate:"required,url"`
	TokenURL         string `mapstructure:"TokenURL" validate:"required,url"`
	UserProfileURL   string `mapstructure:"UserProfileURL" validate:"required,url"`
}

// ensureDefaultValue applies defaults for GitHub URLs if they are not provided.
func (o *OAuth) ensureDefaultValue() {
	if o.Github == nil {
		o.Github = &Github{}
	}
	o.Github.ensureDefaultValue()
}

// validate uses the validator library to validate the struct fields.
func (o *OAuth) validate() error {
	if err := validate.Struct(o); err != nil {
		return fmt.Errorf("OAuth config validation failed: %w", err)
	}
	return nil
}

func (g *Github) ensureDefaultValue() {
	if g.CallbackURL == "" {
		g.CallbackURL = DefaultGitHubCallbackURL
	}
	if g.AuthorizationURL == "" {
		g.AuthorizationURL = DefaultGitHubAuthorizationURL
	}
	if g.UserProfileURL == "" {
		g.UserProfileURL = DefaultGitHubUserProfileURL
	}
}
