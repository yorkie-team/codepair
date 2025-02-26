package entity

// ID is a string type used as an identifier in the database.
// It is designed for encoding and decoding MongoDB Object IDs.
// This allows us to use the database type directly with MongoDB encoders and decoders.
type ID string
