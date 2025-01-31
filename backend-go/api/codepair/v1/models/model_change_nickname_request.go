package models

type ChangeNicknameRequest struct {

	// New nickname to update
	Nickname string `json:"nickname"`
}
