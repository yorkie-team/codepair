package config

import "fmt"

const (
	DefaultGitHubAuthorizationURL = "https://github.com/login/oauth/authorize"
	DefaultGitHubUserProfileURL   = "https://api.github.com/user"
	DefaultGitHubCallbackURL      = "https://localhost:3000/auth/login/github"
)

type Auth struct {
	Github          *Github `mapstructure:"Github" validate:"required"`
	FrontendBaseURL string  `mapstructure:"FrontendBaseURL" validate:"required,url"`
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
func (a *Auth) ensureDefaultValue() {
	if a.Github == nil {
		a.Github = &Github{}
	}
	a.Github.ensureDefaultValue()
}

// validate uses the validator library to validate the struct fields.
func (a *Auth) validate() error {
	if err := validate.Struct(a); err != nil {
		return fmt.Errorf("auth config validation failed: %w", err)
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
