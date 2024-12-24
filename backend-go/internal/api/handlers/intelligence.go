package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
	"github.com/yorkie-team/codepair/backend-go/internal/services"
)

type IntelligenceHandler struct {
	intelligenceService *services.IntelligenceService
}

func NewIntelligenceHandler(intelligenceService *services.IntelligenceService) *IntelligenceHandler {
	return &IntelligenceHandler{
		intelligenceService: intelligenceService,
	}
}

func (h *IntelligenceHandler) RunFeature(c echo.Context) error {
	var req models.RunFeatureRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID := c.Get("userID").(string)
	feature := c.Param("feature")
	req.Feature = models.Feature(feature)

	response := c.Response()
	response.Header().Set(echo.HeaderContentType, "text/event-stream")
	response.Header().Set("Cache-Control", "no-cache")
	response.Header().Set("Connection", "keep-alive")

	c.Response().Writer.WriteHeader(http.StatusOK)

	return h.intelligenceService.RunFeature(c.Request().Context(), userID, &req, func(chunk string) error {
		_, err := c.Response().Write([]byte(chunk))
		if err != nil {
			return err
		}
		c.Response().Flush()
		return nil
	})
}

func (h *IntelligenceHandler) RunFollowUp(c echo.Context) error {
	var req models.RunFollowUpRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID := c.Get("userID").(string)

	response := c.Response()
	response.Header().Set(echo.HeaderContentType, "text/event-stream")
	response.Header().Set("Cache-Control", "no-cache")
	response.Header().Set("Connection", "keep-alive")

	c.Response().Writer.WriteHeader(http.StatusOK)

	return h.intelligenceService.RunFollowUp(c.Request().Context(), userID, &req, func(chunk string) error {
		_, err := c.Response().Write([]byte(chunk))
		if err != nil {
			return err
		}
		c.Response().Flush()
		return nil
	})
}
