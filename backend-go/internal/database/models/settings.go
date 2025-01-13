package models

type Settings struct {
	ID       string `json:"id" bson:"_id"`
	UserID   string `json:"userId" bson:"userId"`
	Theme    string `json:"theme" bson:"theme"`
	Language string `json:"language" bson:"language"`
	KeyMap   string `json:"keyMap" bson:"keyMap"`
}
