package entity

import "time"

// Workspace represents the schema of a workspace saved in the database.
type Workspace struct {
    ID        ID        `bson:"_id"`
    Title     string    `bson:"title"`
    Slug      string    `bson:"slug"`
    CreatedAt time.Time `bson:"created_at"`
    UpdatedAt time.Time `bson:"updated_at"`
}