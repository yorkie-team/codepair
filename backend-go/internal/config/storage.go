package config

import (
	"fmt"
)

const (
	DefaultStorageProvider = "minio"
	DefaultMinioBucket     = "default-storage"
	DefaultMinioEndpoint   = "http://localhost:9000"
)

type Storage struct {
	Provider string `validate:"required,oneof=minio s3"`
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

// ensureDefaultValue applies default values for provider and Minio.
func (s *Storage) ensureDefaultValue() {
	if s.Provider == "" {
		s.Provider = DefaultStorageProvider
	}
	if s.Minio == nil {
		s.Minio = &Minio{}
	}
	s.Minio.EnsureDefaultValue()
}

// validate uses the validator library to validate the struct fields.
// We also check that the nested config for the chosen provider is not nil.
func (s *Storage) validate() error {
	switch s.Provider {
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

func (m *Minio) EnsureDefaultValue() {
	if m.Bucket == "" {
		m.Bucket = DefaultMinioBucket
	}
	if m.Endpoint == "" {
		m.Endpoint = DefaultMinioEndpoint
	}
}
