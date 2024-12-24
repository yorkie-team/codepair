package services

import (
	"context"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
)

type FileService struct {
	s3Client   *s3.Client
	bucketName string
}

func NewFileService(s3Client *s3.Client, bucketName string) *FileService {
	return &FileService{
		s3Client:   s3Client,
		bucketName: bucketName,
	}
}

func (s *FileService) CreateUploadPresignedURL(req models.CreateUploadPresignedUrlRequest) (*models.CreateUploadPresignedUrlResponse, error) {
	if req.ContentLength > 10_000_000 {
		return nil, fmt.Errorf("content length too long")
	}

	fileExt := strings.Split(req.ContentType, "/")[1]
	fileKey := fmt.Sprintf("%s-%s.%s", req.WorkspaceID, generateRandomKey(), fileExt)

	presignClient := s3.NewPresignClient(s.s3Client)
	presignedURL, err := presignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:        aws.String(s.bucketName),
		Key:           aws.String(fileKey),
		ContentType:   aws.String(req.ContentType),
		ContentLength: aws.Int64(req.ContentLength),
	}, s3.WithPresignExpires(time.Minute*5))

	if err != nil {
		return nil, fmt.Errorf("failed to create presigned URL: %w", err)
	}

	return &models.CreateUploadPresignedUrlResponse{
		URL:     presignedURL.URL,
		FileKey: fileKey,
	}, nil
}

func (s *FileService) CreateDownloadPresignedURL(fileKey string) (string, error) {
	presignClient := s3.NewPresignClient(s.s3Client)
	presignedURL, err := presignClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(fileKey),
	}, s3.WithPresignExpires(time.Hour))

	if err != nil {
		return "", fmt.Errorf("failed to create presigned URL: %w", err)
	}

	return presignedURL.URL, nil
}

func (s *FileService) ExportMarkdown(req models.ExportFileRequest) (*models.ExportFileResponse, error) {
	switch req.ExportType {
	case "markdown":
		return &models.ExportFileResponse{
			FileContent: []byte(req.Content),
			MimeType:    "text/markdown",
			FileName:    fmt.Sprintf("%s.md", req.FileName),
		}, nil
	case "html":
		// TODO: Implement HTML conversion
		return nil, fmt.Errorf("HTML export not implemented")
	case "pdf":
		// TODO: Implement PDF conversion
		return nil, fmt.Errorf("PDF export not implemented")
	default:
		return nil, fmt.Errorf("invalid export type")
	}
}

func generateRandomKey() string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	result := make([]byte, 8)
	for i := range result {
		result[i] = charset[rand.Intn(len(charset))]
	}
	return string(result)
}
