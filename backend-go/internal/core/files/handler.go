package files

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/lithammer/shortuuid/v4"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/core/workspace"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
	"github.com/yorkie-team/codepair/backend/internal/infra/storage"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

const (
	maxContentLength = 10_000_000
)

// Handler handles HTTP requests for files services.
type Handler struct {
	storageClient storage.Client
	workspaceRepo workspace.Repository
}

// createUploadPresignedURL handles POST /files requests.
func (h *Handler) createUploadPresignedURL(c echo.Context) error {
	req := &models.CreateUploadPresignedUrlRequest{}
	if err := c.Bind(req); err != nil {
		return middleware.NewError(http.StatusBadRequest, "invalid request body")
	}

	if err := req.Validate(); err != nil {
		return middleware.NewError(http.StatusBadRequest, "validation failed", err)
	}

	workspace, err := h.workspaceRepo.FindWorkspaceByID(req.WorkspaceId)
	if err != nil {
		if errors.Is(err, database.ErrWorkspaceNotFound) {
			return WorkspaceNotFoundError
		}

		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	if req.ContentLength > maxContentLength {
		return ContentLengthTooLongError
	}

	extension := ""
	if parts := strings.Split(req.ContentType, "/"); len(parts) > 1 {
		extension = parts[1]
	}

	fileKey := generateFileKey(workspace.Slug, extension)

	url, err := h.storageClient.CreateUploadPresignedURL(
		c.Request().Context(),
		fileKey,
		req.ContentLength,
		req.ContentType,
	)
	if err != nil {
		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	return c.JSON(http.StatusOK, &models.CreateUploadPresignedUrlResponse{
		FileKey: fileKey,
		Url:     url,
	})
}

// createDownloadPresignedURL handles GET /files/:file_name requests.
func (h *Handler) createDownloadPresignedURL(c echo.Context) error {
	fileKey := c.Param("file_name")
	if fileKey == "" {
		return middleware.NewError(http.StatusBadRequest, "file_name is required")
	}

	url, err := h.storageClient.CreateDownloadPresignedURL(c.Request().Context(), fileKey)
	if err != nil {
		return FileNotFoundError
	}

	return c.Redirect(http.StatusFound, url)
}

// generateFileKey generates a file key with slug and extension.
func generateFileKey(slug, extension string) string {
	return fmt.Sprintf("%s-%s.%s", slug, shortuuid.New(), extension)
}
