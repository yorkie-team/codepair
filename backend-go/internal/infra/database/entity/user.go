package entity

import "time"

type User struct {
	ID             ID        `bson:"_id"`
	SocialProvider string    `bson:"social_provider"`
	SocialUID      string    `bson:"social_uid"`
	Nickname       string    `bson:"nickname"`
	CreatedAt      time.Time `bson:"created_at"` // Timestamp when the record was created.
	UpdatedAt      time.Time `bson:"updated_at"` // Timestamp when the record was last updated.
}
