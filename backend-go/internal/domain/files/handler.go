package files

import (
	"github.com/yorkie-team/codepair/backend-go/internal/domain/files/dto"
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

func NewHandler(fileService *Service) *Handler {
	return &Handler{
		service: fileService,
	}
}

func (h *Handler) CreateUploadPresignedURL(c echo.Context) error {
	var req dto.CreateUploadPresignedUrlRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	resp, err := h.service.CreateUploadPresignedURL(req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, resp)
}

func (h *Handler) CreateDownloadPresignedURL(c echo.Context) error {
	fileKey := c.Param("file_name")
	url, err := h.service.CreateDownloadPresignedURL(fileKey)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.Redirect(http.StatusFound, url)
}

func (h *Handler) ExportMarkdown(c echo.Context) error {
	var req dto.ExportFileRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	resp, err := h.service.ExportMarkdown(req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.Blob(http.StatusOK, resp.MimeType, resp.FileContent)
}
