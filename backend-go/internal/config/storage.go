package config

import (
	"fmt"
)

const (
	DefaultStorageProvider = "minio"

	DefaultMinioBucket    = "default-minio-bucket"
	DefaultMinioEndpoint  = "localhost:9000"
	DefaultMinioAccessKey = "minioadmin"
	DefaultMinioSecretKey = "minioadmin"
)

type Storage struct {
	Provider string `mapstructure:"provider"`
	S3       *S3    `mapstructure:"s3"`
	Minio    *Minio `mapstructure:"minio"`
}

type S3 struct {
	Bucket    string `mapstructure:"bucket"`
	Region    string `mapstructure:"region"`
	AccessKey string `mapstructure:"accessKey"`
	SecretKey string `mapstructure:"secretKey"`
}

type Minio struct {
	Bucket    string `mapstructure:"bucket"`
	Endpoint  string `mapstructure:"endpoint"`
	AccessKey string `mapstructure:"accessKey"`
	SecretKey string `mapstructure:"secretKey"`
}

func (s *Storage) ensureDefaultValue() {
	if s.Provider == "" {
		s.Provider = DefaultStorageProvider
	}
	if s.Minio == nil {
		s.Minio = &Minio{}
	}
	s.Minio.EnsureDefaultValue()
}

func (s *Storage) validate() error {
	if s.Provider != "minio" && s.Provider != "s3" {
		return fmt.Errorf("invalid storage provider: %s (only 'minio' or 's3' are supported)", s.Provider)
	}

	switch s.Provider {
	case "minio":
		if s.Minio == nil {
			return fmt.Errorf("storage provider is minio but Minio config is nil")
		}
		return s.Minio.validate()
	case "s3":
		if s.S3 == nil {
			return fmt.Errorf("storage provider is s3 but S3 config is nil")
		}
		return s.S3.validate()
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
	if m.AccessKey == "" {
		m.AccessKey = DefaultMinioAccessKey
	}
	if m.SecretKey == "" {
		m.SecretKey = DefaultMinioSecretKey
	}
}

func (m *Minio) validate() error {
	if m.Bucket == "" || m.Endpoint == "" {
		return fmt.Errorf("minio requires Bucket and Endpoint to be set")
	}
	return nil
}

func (s3 *S3) validate() error {
	if s3.Bucket == "" || s3.Region == "" || s3.AccessKey == "" || s3.SecretKey == "" {
		return fmt.Errorf("s3 requires Bucket and Region to be set")
	}
	return nil
}
