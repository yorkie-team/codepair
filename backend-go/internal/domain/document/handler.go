package document

import (
	"github.com/yorkie-team/codepair/backend-go/internal/database/models"
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

func NewHandler(documentService *Service) *Handler {
	return &Handler{
		service: documentService,
	}
}

func (h *Handler) Create(c echo.Context) error {
	var req models.CreateDocumentRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID := c.Get("userID").(string)
	document, err := h.service.Create(userID, req.WorkspaceID, req.Title)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, document)
}

func (h *Handler) UpdateTitle(c echo.Context) error {
	documentID := c.Param("id")
	var req models.UpdateDocumentTitleRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID := c.Get("userID").(string)
	if err := h.service.UpdateTitle(documentID, userID, req.Title); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusOK)
}

func (h *Handler) CreateShareToken(c echo.Context) error {
	documentID := c.Param("id")
	userID := c.Get("userID").(string)

	token, err := h.service.CreateShareToken(documentID, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, models.CreateShareTokenResponse{
		SharingToken: token,
	})
}

func (h *Handler) FindFromSharingToken(c echo.Context) error {
	token := c.QueryParam("token")
	if token == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "missing token parameter")
	}

	document, err := h.service.FindFromSharingToken(token)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	return c.JSON(http.StatusOK, document)
}
