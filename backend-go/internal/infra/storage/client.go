package storage

import (
	"context"
	"time"
)

const (
	UrlExpirationTime = 15 * time.Minute
)

type Client interface {
	CreateUploadPresignedURL(ctx context.Context, key string, contentLength int64, contentType string) (string, error)
	CreateDownloadPresignedURL(ctx context.Context, key string) (string, error)
}
