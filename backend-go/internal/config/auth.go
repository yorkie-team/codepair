package config

import "fmt"

const (
	DefaultGitHubAuthorizationURL = "https://github.com/login/oauth/authorize"
	DefaultGitHubUserProfileURL   = "https://api.github.com/user"
)

type OAuth struct {
	Github          *Github `validate:"required"`
	FrontendBaseURL string  `validate:"required,url"`
}

type Github struct {
	ClientID         string `validate:"required"`
	ClientSecret     string `validate:"required"`
	CallbackURL      string `validate:"required,url"`
	AuthorizationURL string `validate:"required,url"`
	TokenURL         string `validate:"required,url"`
	UserProfileURL   string `validate:"required,url"`
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
		return fmt.Errorf("auth config validation failed: %w", err)
	}
	return nil
}

func (g *Github) ensureDefaultValue() {
	if g.AuthorizationURL == "" {
		g.AuthorizationURL = DefaultGitHubAuthorizationURL
	}
	if g.UserProfileURL == "" {
		g.UserProfileURL = DefaultGitHubUserProfileURL
	}
}
