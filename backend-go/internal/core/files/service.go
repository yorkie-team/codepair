package files

import (
	"context"
	"errors"
	"fmt"
	"github.com/yorkie-team/codepair/backend/internal/infra/storage"
	"net/http"
	"strings"
	"time"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

// Service handles file operations.
type Service struct {
	s3Client      storage.Client
	workspaceRepo Repository
}

// createUploadPresignedURL creates presigned URL for upload.
func (s *Service) createUploadPresignedURL(
	ctx context.Context,
	workspaceID string,
	contentLength int64,
	contentType string,
) (*models.CreateUploadPresignedUrlResponse, error) {
	workspace, err := s.workspaceRepo.FindWorkspaceByID(entity.ID(workspaceID))
	if err != nil {
		if errors.Is(err, database.ErrWorkspaceNotFound) {
			return nil, WorkspaceNotFoundError
		}

		return nil, middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	if contentLength > MaxContentLength {
		return nil, ContentLengthTooLongError
	}

	extension := ""
	if parts := strings.Split(contentType, "/"); len(parts) > 1 {
		extension = parts[1]
	}

	fileKey := generateFileKey(workspace.Slug, extension)

	url, err := s.s3Client.CreateUploadPresignedURL(ctx, fileKey, contentLength, contentType)
	if err != nil {
		return nil, middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	return &models.CreateUploadPresignedUrlResponse{
		FileKey: fileKey,
		Url:     url,
	}, nil
}

// createDownloadPresignedURL creates presigned URL for download.
func (s *Service) createDownloadPresignedURL(ctx context.Context, fileKey string) (string, error) {
	url, err := s.s3Client.CreateDownloadPresignedURL(ctx, fileKey)
	if err != nil {
		return "", FileNotFoundError
	}

	return url, nil
}

// generateFileKey generates a file key with slug and extension.
func generateFileKey(slug, extension string) string {
	return fmt.Sprintf("%s-%s.%s", slug, generateRandomString(8), extension)
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
