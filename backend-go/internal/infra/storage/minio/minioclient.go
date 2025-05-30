package minio

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/storage"
)

// Client represents a wrapper around the minio.
type Client struct {
	client *minio.Client
	bucket string
}

// NewClient initializes a new Client instance to interact with a specified bucket on the given endpoint.
func NewClient(cfg *config.Minio) (*Client, error) {
	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: false,
	})
	if err != nil {
		return nil, fmt.Errorf("minio client: %w", err)
	}

	location := "us-east-1"

	exists, err := client.BucketExists(context.Background(), cfg.Bucket)
	if err != nil {
		return nil, fmt.Errorf("check bucket existence: %w", err)
	}

	if !exists {
		err = client.MakeBucket(context.Background(), cfg.Bucket, minio.MakeBucketOptions{Region: location})
		if err != nil {
			return nil, fmt.Errorf("make bucket: %w", err)
		}
		log.Printf("Successfully created bucket '%s'\n", cfg.Bucket)
	}

	return &Client{
		client: client,
		bucket: cfg.Bucket,
	}, nil
}

// CreateUploadPresignedURL creates a presigned URL for uploading a file.
func (c *Client) CreateUploadPresignedURL(
	ctx context.Context,
	key string,
	_ int64,
	_ string,
) (string, error) {
	presignedReq, err := c.client.PresignedPutObject(ctx, c.bucket, key, storage.URLExpirationTime)
	if err != nil {
		return "", fmt.Errorf("upload presigned URL: %w", err)
	}

	return presignedReq.String(), nil
}

// CreateDownloadPresignedURL creates a presigned URL for downloading a file.
func (c *Client) CreateDownloadPresignedURL(ctx context.Context, key string) (string, error) {
	preSignedReq, err := c.client.PresignedGetObject(
		ctx, c.bucket, key, time.Duration(15)*time.Minute, url.Values{})
	if err != nil {
		return "", fmt.Errorf("download presigned URL: %w", err)
	}

	return preSignedReq.String(), nil
}
