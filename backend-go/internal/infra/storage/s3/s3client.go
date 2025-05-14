package storage

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// S3Client handles interactions with AWS S3
type S3Client struct {
    client *s3.Client
    bucket string
}

// NewS3Client creates a new S3 client
func NewS3Client(bucket string) (*S3Client, error) {
    // AWS 설정 로드
    cfg, err := config.LoadDefaultConfig(context.Background())
    if err != nil {
        return nil, fmt.Errorf("failed to load AWS config: %w", err)
    }
    
    // S3 클라이언트 생성
    client := s3.NewFromConfig(cfg)
    
    return &S3Client{
        client: client,
        bucket: bucket,
    }, nil
}

// CreateUploadPresignedURL creates a presigned URL for uploading a file
func (s *S3Client) CreateUploadPresignedURL(ctx context.Context, key string, contentLength int64, contentType string) (string, error) {
    presignClient := s3.NewPresignClient(s.client)
    
    // Presigned URL 생성 설정
    presignedReq, err := presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
        Bucket:        aws.String(s.bucket),
        Key:           aws.String(key),
        ContentLength: aws.Int64(contentLength),
        ContentType:   aws.String(contentType),
    }, func(opts *s3.PresignOptions) {
        opts.Expires = time.Duration(15 * time.Minute)
    })
    
    if err != nil {
        return "", fmt.Errorf("failed to create presigned URL: %w", err)
    }
    
    return presignedReq.URL, nil
}

// CreateDownloadPresignedURL creates a presigned URL for downloading a file
func (s *S3Client) CreateDownloadPresignedURL(ctx context.Context, key string) (string, error) {
    presignClient := s3.NewPresignClient(s.client)
    
    // Presigned URL 생성 설정
    presignedReq, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
        Bucket: aws.String(s.bucket),
        Key:    aws.String(key),
    }, func(opts *s3.PresignOptions) {
        opts.Expires = time.Duration(15 * time.Minute)
    })
    
    if err != nil {
        return "", fmt.Errorf("failed to create presigned URL: %w", err)
    }
    
    return presignedReq.URL, nil
}