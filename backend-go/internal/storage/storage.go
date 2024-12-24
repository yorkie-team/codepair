package storage

import (
	"context"
	"io"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type StorageProvider interface {
	CreateUploadURL(ctx context.Context, key string, contentType string, contentLength int64) (string, error)
	CreateDownloadURL(ctx context.Context, key string) (string, error)
	Upload(ctx context.Context, key string, content io.Reader, contentType string) error
	Download(ctx context.Context, key string) (io.ReadCloser, error)
	Delete(ctx context.Context, key string) error
}

type S3Storage struct {
	client     *s3.Client
	bucketName string
}

func NewS3Storage(client *s3.Client, bucketName string) *S3Storage {
	return &S3Storage{
		client:     client,
		bucketName: bucketName,
	}
}

func (s *S3Storage) CreateUploadURL(ctx context.Context, key string, contentType string, contentLength int64) (string, error) {
	presignClient := s3.NewPresignClient(s.client)

	request, err := presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        &s.bucketName,
		Key:           &key,
		ContentType:   &contentType,
		ContentLength: &contentLength,
	}, func(opts *s3.PresignOptions) {
		opts.Expires = time.Duration(5 * time.Minute)
	})

	if err != nil {
		return "", err
	}

	return request.URL, nil
}

func (s *S3Storage) CreateDownloadURL(ctx context.Context, key string) (string, error) {
	presignClient := s3.NewPresignClient(s.client)

	request, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: &s.bucketName,
		Key:    &key,
	}, func(opts *s3.PresignOptions) {
		opts.Expires = time.Duration(1 * time.Hour)
	})

	if err != nil {
		return "", err
	}

	return request.URL, nil
}

// Implement other interface methods...
