package intelligence

import (
	"github.com/yorkie-team/codepair/backend-go/internal/database/models"
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

func NewHandler(intelligenceService *Service) *Handler {
	return &Handler{
		service: intelligenceService,
	}
}

func (h *Handler) RunFeature(c echo.Context) error {
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

	return h.service.RunFeature(c.Request().Context(), userID, &req, func(chunk string) error {
		_, err := c.Response().Write([]byte(chunk))
		if err != nil {
			return err
		}
		c.Response().Flush()
		return nil
	})
}

func (h *Handler) RunFollowUp(c echo.Context) error {
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

	return h.service.RunFollowUp(c.Request().Context(), userID, &req, func(chunk string) error {
		_, err := c.Response().Write([]byte(chunk))
		if err != nil {
			return err
		}
		c.Response().Flush()
		return nil
	})
}
