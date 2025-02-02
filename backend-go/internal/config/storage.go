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

	DefaultS3Bucket    = "default-s3-bucket"
	DefaultS3Region    = "us-west-2"
	DefaultS3AccessKey = ""
	DefaultS3SecretKey = ""
)

type Storage struct {
	Provider string `yaml:"provider"`
	S3       *S3    `yaml:"s3"`
	Minio    *Minio `yaml:"minio"`
}

type S3 struct {
	Bucket    string `yaml:"bucket"`
	Region    string `yaml:"region"`
	AccessKey string `yaml:"access_key"`
	SecretKey string `yaml:"secret_key"`
}

type Minio struct {
	Bucket    string `yaml:"bucket"`
	Endpoint  string `yaml:"endpoint"`
	AccessKey string `yaml:"access_key"`
	SecretKey string `yaml:"secret_key"`
}

func (s *Storage) ensureDefaultValue() {
	if s.Provider == "" {
		s.Provider = DefaultStorageProvider
	}
	if s.Minio != nil {
		s.Minio.EnsureDefaultValue()
	}
	if s.S3 != nil {
		s.S3.EnsureDefaultValue()
	}
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

func (s3 *S3) EnsureDefaultValue() {
	if s3.Bucket == "" {
		s3.Bucket = DefaultS3Bucket
	}
	if s3.Region == "" {
		s3.Region = DefaultS3Region
	}
	if s3.AccessKey == "" {
		s3.AccessKey = DefaultS3AccessKey
	}
	if s3.SecretKey == "" {
		s3.SecretKey = DefaultS3SecretKey
	}
}

func (s3 *S3) validate() error {
	if s3.Bucket == "" || s3.Region == "" {
		return fmt.Errorf("s3 requires Bucket and Region to be set")
	}
	return nil
}
