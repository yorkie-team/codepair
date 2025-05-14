package files

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend-go/api/codepair/v1/models"
)

// Handler handles HTTP requests for files.
type Handler struct {
    service *Service
}

// NewHandler creates a new files handler.
func NewHandler(service *Service) *Handler {
    return &Handler{
        service: service,
    }
}

// CreateUploadPresignedURL handles POST /files requests.
func (h *Handler) CreateUploadPresignedURL(c echo.Context) error {
    ctx := c.Request().Context()
    
    var req models.CreateUploadPresignedURLRequest
    if err := c.Bind(&req); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
    }
    
    if req.WorkspaceID == "" {
        return echo.NewHTTPError(http.StatusBadRequest, "workspace_id is required")
    }
    if req.ContentLength <= 0 {
        return echo.NewHTTPError(http.StatusBadRequest, "content_length must be positive")
    }
    if req.ContentType == "" {
        return echo.NewHTTPError(http.StatusBadRequest, "content_type is required")
    }
    
    resp, err := h.service.createUploadPresignedURL(ctx, req.WorkspaceID, req.ContentLength, req.ContentType)
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
    }
    
    return c.JSON(http.StatusOK, resp)
}

// CreateDownloadPresignedURL handles GET /files/:file_name requests.
func (h *Handler) CreateDownloadPresignedURL(c echo.Context) error {
    ctx := c.Request().Context()
    
    fileKey := c.Param("file_name")
    if fileKey == "" {
        return echo.NewHTTPError(http.StatusBadRequest, "file_name is required")
    }
    
    url, err := h.service.createDownloadPresignedURL(ctx, fileKey)
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
    }
    
    return c.Redirect(http.StatusFound, url)
}
