package files

import (
	"context"
	"fmt"
	"time"

	"github.com/yorkie-team/codepair/backend-go/api/codepair/v1/models"
)

// S3ClientInterface defines the methods we need from S3.
type S3ClientInterface interface {
    CreateUploadPresignedURL(ctx context.Context, key string, contentLength int64, contentType string) (string, error)
    CreateDownloadPresignedURL(ctx context.Context, key string) (string, error)
}

// Service handles file operations.
type Service struct {
    s3Client S3ClientInterface
}

// NewService creates a new files service.
func NewService(s3Client S3ClientInterface) *Service {
    return &Service{
        s3Client: s3Client,
    }
}

// createUploadPresignedURL creates presigned URL for upload.
// file key generation (e.g. workspaces/{workspaceID}/{timestamp}_{random})
func (s *Service) createUploadPresignedURL(ctx context.Context, workspaceID string, contentLength int64, contentType string) (*models.CreateUploadPresignedURLResponse, error) {
    key := fmt.Sprintf("workspaces/%s/%d_%s", workspaceID, time.Now().Unix(), generateRandomString(8))
    
    url, err := s.s3Client.CreateUploadPresignedURL(ctx, key, contentLength, contentType)
    if err != nil {
        return nil, fmt.Errorf("failed to create upload presigned URL: %w", err)
    }
    
    return &models.CreateUploadPresignedURLResponse{
        Key: key,
        URL: url,
    }, nil
}

// createDownloadPresignedURL creates presigned URL for download.
func (s *Service) createDownloadPresignedURL(ctx context.Context, fileKey string) (string, error) {
    url, err := s.s3Client.CreateDownloadPresignedURL(ctx, fileKey)
    if err != nil {
        return "", fmt.Errorf("failed to create download presigned URL: %w", err)
    }
    
    return url, nil
}

// generateRandomString generates a random string of given length. 
func generateRandomString(length int) string {
    const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
    result := make([]byte, length)
    
    for i := 0; i < length; i++ {
        result[i] = charset[time.Now().UnixNano()%int64(len(charset))]
        time.Sleep(1 * time.Nanosecond)
    }
    
    return string(result)
}
