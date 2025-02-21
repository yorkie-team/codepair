package models

type HelloRequest struct {
	// New nickname to say hello
	Nickname string `json:"nickname"`
}
