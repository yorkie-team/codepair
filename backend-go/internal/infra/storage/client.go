package storage

import (
	"context"
	"fmt"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/storage/minio"
	"github.com/yorkie-team/codepair/backend/internal/infra/storage/s3"
)

type Client interface {
	CreateUploadPresignedURL(ctx context.Context, key string, contentLength int64, contentType string) (string, error)
	CreateDownloadPresignedURL(ctx context.Context, key string) (string, error)
}

func NewClient(conf *config.Storage) (Client, error) {
	switch conf.Provider {
	case "s3":
		client, err := s3.NewClient(conf.S3)
		if err != nil {
			return nil, fmt.Errorf("S3 client: %w", err)
		}
		return client, nil
	case "minio":
		client, err := minio.NewClient(conf.Minio)
		if err != nil {
			return nil, fmt.Errorf("minio client: %w", err)
		}
		return client, nil
	default:
		return nil, fmt.Errorf("unsupported storage provider: %s", conf.Provider)
	}
}
