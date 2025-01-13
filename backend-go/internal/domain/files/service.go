package files

import (
	"fmt"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/files/dto"
	"github.com/yorkie-team/codepair/backend-go/internal/storage"
	"math/rand"
)

type Service struct {
	storage    storage.Provider
	bucketName string
}

func NewService(storage storage.Provider, bucketName string) *Service {
	return &Service{
		storage:    storage,
		bucketName: bucketName,
	}
}

func (s *Service) CreateUploadPresignedURL(req dto.CreateUploadPresignedUrlRequest) (*dto.CreateUploadPresignedUrlResponse, error) {

	return &dto.CreateUploadPresignedUrlResponse{}, nil
}

func (s *Service) CreateDownloadPresignedURL(fileKey string) (string, error) {

	return "", nil
}

func (s *Service) ExportMarkdown(req dto.ExportFileRequest) (*dto.ExportFileResponse, error) {
	switch req.ExportType {
	case "markdown":
		return &dto.ExportFileResponse{}, nil
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
