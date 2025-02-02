package config

import (
	"fmt"
)

const (
	DefaultGitHubAuthorizationURL = "https://github.com/login/oauth/authorize"
	DefaultGitHubTokenURL         = "https://github.com/login/oauth/access_token"
	DefaultGitHubUserProfileURL   = "https://api.github.com/user"
	DefaultGitHubCallbackURL      = "http://localhost:3000/auth/login/github"
)

type OAuth struct {
	Github *GitHubOAuth `yaml:"Github"`
}

type GitHubOAuth struct {
	ClientID         string `yaml:"ClientID"`
	ClientSecret     string `yaml:"ClientSecret"`
	CallbackURL      string
	AuthorizationURL string `yaml:"AuthorizationURL"`
	TokenURL         string
	UserProfileURL   string `yaml:"UserProfileURL"`
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
	if g.TokenURL == "" {
		g.TokenURL = DefaultGitHubTokenURL
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
