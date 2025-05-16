package files

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

// Handler handles HTTP requests for files services.
type Handler struct {
    service *Service
}

// createUploadPresignedURL handles POST /files requests.
func (h *Handler) createUploadPresignedURL(c echo.Context) error {
    var req models.CreateUploadPresignedUrlRequest
    if err := c.Bind(&req); err != nil {
        return middleware.NewError(http.StatusBadRequest, "invalid request body")
    }
    
    if req.WorkspaceId == "" {
        return middleware.NewError(http.StatusBadRequest, "workspace_id is required")
    }
    if req.ContentLength <= 0 {
        return middleware.NewError(http.StatusBadRequest, "content_length must be positive")
    }
    if req.ContentType == "" {
        return middleware.NewError(http.StatusBadRequest, "content_type is required")
    }
    
    resp, err := h.service.createUploadPresignedURL(c.Request().Context(), req.WorkspaceId, req.ContentLength, req.ContentType)
    if err != nil {
        return err
    }
    
    return c.JSON(http.StatusOK, resp)
}

// createDownloadPresignedURL handles GET /files/:file_name requests.
func (h *Handler) createDownloadPresignedURL(c echo.Context) error {
    fileKey := c.Param("file_name")
    if fileKey == "" {
        return middleware.NewError(http.StatusBadRequest, "file_name is required")
    }
    
    url, err := h.service.createDownloadPresignedURL(c.Request().Context(), fileKey)
    if err != nil {
        return err 
    }
    
    return c.Redirect(http.StatusFound, url)
}
