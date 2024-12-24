package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
	"github.com/yorkie-team/codepair/backend-go/internal/services"
)

type DocumentHandler struct {
	documentService *services.DocumentService
}

func NewDocumentHandler(documentService *services.DocumentService) *DocumentHandler {
	return &DocumentHandler{
		documentService: documentService,
	}
}

func (h *DocumentHandler) Create(c echo.Context) error {
	var req models.CreateDocumentRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID := c.Get("userID").(string)
	document, err := h.documentService.Create(userID, req.WorkspaceID, req.Title)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, document)
}

func (h *DocumentHandler) UpdateTitle(c echo.Context) error {
	documentID := c.Param("id")
	var req models.UpdateDocumentTitleRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID := c.Get("userID").(string)
	if err := h.documentService.UpdateTitle(documentID, userID, req.Title); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusOK)
}

func (h *DocumentHandler) CreateShareToken(c echo.Context) error {
	documentID := c.Param("id")
	userID := c.Get("userID").(string)

	token, err := h.documentService.CreateShareToken(documentID, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, models.CreateShareTokenResponse{
		SharingToken: token,
	})
}

func (h *DocumentHandler) FindFromSharingToken(c echo.Context) error {
	token := c.QueryParam("token")
	if token == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "missing token parameter")
	}

	document, err := h.documentService.FindFromSharingToken(token)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	return c.JSON(http.StatusOK, document)
}
