package models

type Settings struct {
	ID                string `json:"id" bson:"_id,omitempty"`
	GithubClientID    string `json:"githubClientId" bson:"githubClientId"`
	GithubCallbackURL string `json:"githubCallbackUrl" bson:"githubCallbackUrl"`
}

type SettingsResponse struct {
	Settings Settings `json:"settings"`
}
