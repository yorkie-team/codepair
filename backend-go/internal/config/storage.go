package config

import (
	"fmt"
)

type Storage struct {
	Provider string `validate:"omitempty,oneof=minio s3"`
	S3       *S3    `validate:"omitempty"`
	Minio    *Minio `validate:"omitempty"`
}

type S3 struct {
	Bucket    string `validate:"required"`
	Region    string `validate:"required"`
	AccessKey string `validate:"required"`
	SecretKey string `validate:"required"`
}

type Minio struct {
	Bucket    string `validate:"required"`
	Endpoint  string `validate:"required,url"`
	AccessKey string `validate:"required"`
	SecretKey string `validate:"required"`
}

// validate uses the validator library to validate the struct fields.
// We also check that the nested config for the chosen provider is not nil.
func (s *Storage) validate() error {
	switch s.Provider {
	case "":
		return nil
	case "minio":
		if err := validate.Struct(s.Minio); err != nil {
			return fmt.Errorf("minio config validation failed: %w", err)
		}
	case "s3":
		if err := validate.Struct(s.S3); err != nil {
			return fmt.Errorf("s3 config validation failed: %w", err)
		}
	default:
		return fmt.Errorf("invalid storage provider: %s", s.Provider)
	}
	return nil
}
