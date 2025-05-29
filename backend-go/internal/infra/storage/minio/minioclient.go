package minio

import (
	"context"
	"log"
	"net/url"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/yorkie-team/codepair/backend/internal/config"
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
		log.Fatalln(err)
	}

	location := "us-east-1"

	err = client.MakeBucket(context.Background(), cfg.Bucket, minio.MakeBucketOptions{Region: location})
	if err != nil {
		if errExists := minio.ToErrorResponse(err); errExists.Code == "BucketAlreadyOwnedByYou" {
			log.Println("We already own this bucket")
		} else {
			log.Fatalln(err)
		}
	} else {
		log.Printf("Successfully created %s\n", cfg.Bucket)
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
	presignedReq, err := c.client.PresignedPutObject(ctx, c.bucket, key, time.Duration(15)*time.Minute)
	if err != nil {
		log.Fatalln(err)
	}

	return presignedReq.String(), nil
}

// CreateDownloadPresignedURL creates a presigned URL for downloading a file.
func (c *Client) CreateDownloadPresignedURL(ctx context.Context, key string) (string, error) {
	params := make(url.Values)
	preSignedReq, err := c.client.PresignedGetObject(
		ctx, c.bucket, key, time.Duration(15)*time.Minute, params)
	if err != nil {
		log.Fatalln(err)
	}

	return preSignedReq.String(), nil
}
