package settings

import (
	"github.com/yorkie-team/codepair/backend-go/internal/database/models"
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

func NewSettingsHandler(settingsService *Service) *Handler {
	return &Handler{
		service: settingsService,
	}
}

func (h *Handler) GetSettings(c echo.Context) error {
	userID := c.Get("userID").(string)
	settings, err := h.service.GetSettings(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, settings)
}

func (h *Handler) UpdateSettings(c echo.Context) error {
	var req models.UpdateSettingsRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID := c.Get("userID").(string)
	settings, err := h.service.UpdateSettings(userID, &req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, settings)
}
