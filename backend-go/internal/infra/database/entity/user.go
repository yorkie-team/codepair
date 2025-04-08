package entity

import "time"

// User represents the schema of a user saved in the database.
type User struct {
	ID             ID        `bson:"_id"`
	SocialProvider string    `bson:"social_provider"`
	SocialUID      string    `bson:"social_uid"`
	Nickname       string    `bson:"nickname"`
	CreatedAt      time.Time `bson:"created_at"`
	UpdatedAt      time.Time `bson:"updated_at"`
}
