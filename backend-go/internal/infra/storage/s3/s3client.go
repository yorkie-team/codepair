package s3

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	codepairConfig "github.com/yorkie-team/codepair/backend/internal/config"
)

const (
	urlExpirationTime = 15 * time.Minute
)

// Client handles interactions with AWS S3
type Client struct {
	client *s3.Client
	bucket string
}

// NewClient creates a new S3 client
func NewClient(cfg *codepairConfig.S3) (*Client, error) {
	s3Config, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		return nil, fmt.Errorf("AWS config: %w", err)
	}

	client := s3.NewFromConfig(s3Config)

	return &Client{
		client: client,
		bucket: cfg.Bucket,
	}, nil
}

// CreateUploadPresignedURL creates a presigned URL for uploading a file.
func (s *Client) CreateUploadPresignedURL(
	ctx context.Context,
	key string,
	contentLength int64,
	contentType string,
) (string, error) {
	presignClient := s3.NewPresignClient(s.client)

	presignedReq, err := presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(key),
		ContentLength: aws.Int64(contentLength),
		ContentType:   aws.String(contentType),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = urlExpirationTime
	})

	if err != nil {
		return "", fmt.Errorf("upload presigned URL: %w", err)
	}

	return presignedReq.URL, nil
}

// CreateDownloadPresignedURL creates a presigned URL for downloading a file.
func (s *Client) CreateDownloadPresignedURL(ctx context.Context, key string) (string, error) {
	presignClient := s3.NewPresignClient(s.client)

	presignedReq, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = time.Duration(15 * time.Minute)
	})

	if err != nil {
		return "", fmt.Errorf("download presigned URL: %w", err)
	}

	return presignedReq.URL, nil
}
