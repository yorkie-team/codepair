package files

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/lithammer/shortuuid/v4"
	"github.com/yorkie-team/codepair/backend/internal/infra/storage"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/entity"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

// Service handles file operations.
type Service struct {
	storageClient storage.Client
	workspaceRepo Repository
}

const (
	MaxContentLength = 10_000_000
)

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

	url, err := s.storageClient.CreateUploadPresignedURL(ctx, fileKey, contentLength, contentType)
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
	url, err := s.storageClient.CreateDownloadPresignedURL(ctx, fileKey)
	if err != nil {
		return "", FileNotFoundError
	}

	return url, nil
}

// generateFileKey generates a file key with slug and extension.
func generateFileKey(slug, extension string) string {
	return fmt.Sprintf("%s-%s.%s", slug, shortuuid.New(), extension)
}
