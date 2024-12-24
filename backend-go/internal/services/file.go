package services

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gomarkdown/markdown"
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

func (s *FileService) CreateUploadPresignedUrl(workspaceID string, contentLength int64, contentType string) (*models.CreateUploadPresignedUrlResponse, error) {
	fileKey := fmt.Sprintf("%s/%d", workspaceID, time.Now().UnixNano())

	presignClient := s3.NewPresignClient(s3Client)
	presignedUrl, err := presignClient.PresignPutObject(context.Background(), &s3.PutObjectInput{
		Bucket:        aws.String(s.bucketName),
		Key:           aws.String(fileKey),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(contentLength),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = time.Hour
	})

	if err != nil {
		return nil, fmt.Errorf("failed to create presigned URL: %w", err)
	}

	return &models.CreateUploadPresignedUrlResponse{
		URL:     presignedUrl.URL,
		FileKey: fileKey,
	}, nil
}

func (s *FileService) CreateDownloadPresignedUrl(fileKey string) (string, error) {
	presignClient := s3.NewPresignClient(s3Client)
	presignedUrl, err := presignClient.PresignGetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(fileKey),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = time.Hour
	})

	if err != nil {
		return "", fmt.Errorf("failed to create presigned URL: %w", err)
	}

	return presignedUrl.URL, nil
}

func (s *FileService) ExportMarkdown(req models.ExportFileRequest) (*models.ExportFileResponse, error) {
	switch req.ExportType {
	case "markdown":
		return s.exportToMarkdown(req.Content, req.FileName)
	case "html":
		return s.exportToHtml(req.Content, req.FileName)
	case "pdf":
		return s.exportToPdf(req.Content, req.FileName)
	default:
		return nil, fmt.Errorf("unsupported export type: %s", req.ExportType)
	}
}

func (s *FileService) exportToMarkdown(content, fileName string) (*models.ExportFileResponse, error) {
	return &models.ExportFileResponse{
		FileContent: []byte(content),
		MimeType:    "text/markdown",
		FileName:    fmt.Sprintf("%s.md", fileName),
	}, nil
}

func (s *FileService) exportToHtml(content, fileName string) (*models.ExportFileResponse, error) {
	md := []byte(content)
	html := markdown.ToHTML(md, nil, nil)

	return &models.ExportFileResponse{
		FileContent: html,
		MimeType:    "text/html",
		FileName:    fmt.Sprintf("%s.html", fileName),
	}, nil
}

func (s *FileService) exportToPdf(content, fileName string) (*models.ExportFileResponse, error) {
	// Note: PDF conversion would typically use a library like wkhtmltopdf
	// For this example, we'll return an error
	return nil, fmt.Errorf("PDF export not implemented")
}
