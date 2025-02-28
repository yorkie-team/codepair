package hello

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/logging"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

// Handler handles HTTP requests for hello messages.
type Handler struct {
	service *Service
}

func (h *Handler) createHello(c echo.Context) error {
	req := &models.HelloRequest{}
	if err := c.Bind(req); err != nil {
		logging.SetWarn(c)
		return middleware.NewError(http.StatusBadRequest, "Invalid JSON format", err)
	}

	if err := req.Validate(); err != nil {
		logging.SetWarn(c)
		return middleware.NewError(http.StatusBadRequest, "Invalid JSON", err)
	}

	id, err := h.service.createHello(c, req)
	if err != nil {
		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	return c.JSON(http.StatusOK, models.HelloResponse{
		Message: fmt.Sprintf("Hello, id:%s, nickname: %s!", id, req.Nickname),
	})
}

func (h *Handler) readHello(c echo.Context) error {
	id := c.Param("id")
	nickname, err := h.service.readNickname(c, id)
	if err != nil {
		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	return c.JSON(http.StatusOK, models.HelloResponse{
		Message: fmt.Sprintf("Hello, %s!", nickname),
	})
}

func (h *Handler) updateHello(c echo.Context) error {
	id := c.Param("id")
	req := &models.HelloRequest{}
	if err := c.Bind(req); err != nil {
		logging.SetWarn(c)
		return middleware.NewError(http.StatusBadRequest, "Invalid JSON format", err)
	}
	if err := req.Validate(); err != nil {
		logging.SetWarn(c)
		return middleware.NewError(http.StatusBadRequest, "Validation failed", err)
	}

	if err := h.service.updateHello(c, id, req); err != nil {
		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	return c.JSON(http.StatusOK, models.HelloResponse{
		Message: fmt.Sprintf("Hello updated, new nickname: %s", req.Nickname),
	})
}

func (h *Handler) deleteHello(c echo.Context) error {
	id := c.Param("id")
	if err := h.service.deleteHello(c, id); err != nil {
		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	return c.JSON(http.StatusOK, models.HelloResponse{
		Message: fmt.Sprintf("Repository with id %s deleted", id),
	})
}
