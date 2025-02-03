package config

import (
	"fmt"
)

const (
	DefaultGitHubAuthorizationURL = "https://github.com/login/oauth/authorize"
	DefaultGitHubUserProfileURL   = "https://api.github.com/user"
	DefaultGitHubCallbackURL      = "https://localhost:3000/auth/login/github"
)

type OAuth struct {
	Github *GitHubOAuth `mapstructure:"Github"`
}

type GitHubOAuth struct {
	ClientID         string `mapstructure:"ClientID"`
	ClientSecret     string `mapstructure:"ClientSecret"`
	CallbackURL      string `mapstructure:"CallbackURL"`
	AuthorizationURL string `mapstructure:"AuthorizationURL"`
	TokenURL         string `mapstructure:"TokenURL"`
	UserProfileURL   string `mapstructure:"UserProfileURL"`
}

func (o *OAuth) ensureDefaultValue() {
	if o.Github == nil {
		o.Github = &GitHubOAuth{}
	}
	o.Github.ensureDefaultValue()
}

func (o *OAuth) validate() error {
	if err := o.Github.validate(); err != nil {
		return err
	}
	return nil
}

func (g *GitHubOAuth) ensureDefaultValue() {
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

func (g *GitHubOAuth) validate() error {
	if g.ClientID == "" {
		return fmt.Errorf("github client_id cannot be empty")
	}
	if g.ClientSecret == "" {
		return fmt.Errorf("github client_secret cannot be empty")
	}

	return nil
}
