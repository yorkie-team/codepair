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
		return s3.NewClient(conf.S3.Bucket)
	case "minio":
		return minio.NewClient(
			conf.Minio.Bucket,
			conf.Minio.Endpoint,
			conf.Minio.AccessKey,
			conf.Minio.SecretKey,
		)
	default:
		return nil, fmt.Errorf("unsupported storage provider: %s", conf.Provider)
	}
}
