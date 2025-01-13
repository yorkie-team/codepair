package dto

type UpdateSettingsRequest struct {
	Theme    string `json:"theme"`
	Language string `json:"language"`
	KeyMap   string `json:"keyMap"`
}
