package hello

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

// Handler handles HTTP requests for hello messages.
type Handler struct {
	service *Service
}

func (h *Handler) createHello(c echo.Context) error {
	req := &models.HelloRequest{}
	if err := c.Bind(req); err != nil {
		return middleware.NewError(http.StatusBadRequest, "Invalid JSON format", err)
	}

	if err := req.Validate(); err != nil {
		return middleware.NewError(http.StatusBadRequest, "Invalid JSON", err)
	}

	id, err := h.service.createHello(req)
	if err != nil {
		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	if err := c.JSON(http.StatusOK, models.HelloResponse{
		Message: fmt.Sprintf("Hello, id:%s, nickname: %s!", id, req.Nickname),
	}); err != nil {
		return fmt.Errorf("failed to send JSON response: %w", err)
	}

	return nil
}

func (h *Handler) readHello(c echo.Context) error {
	id := c.Param("id")
	nickname, err := h.service.readNickname(id)
	if err != nil {
		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	if err := c.JSON(http.StatusOK, models.HelloResponse{
		Message: fmt.Sprintf("Hello, %s!", nickname),
	}); err != nil {
		return fmt.Errorf("failed to send JSON response: %w", err)
	}

	return nil
}

func (h *Handler) updateHello(c echo.Context) error {
	id := c.Param("id")
	req := &models.HelloRequest{}
	if err := c.Bind(req); err != nil {
		return middleware.NewError(http.StatusBadRequest, "Invalid JSON format", err)
	}
	if err := req.Validate(); err != nil {
		return middleware.NewError(http.StatusBadRequest, "Validation failed", err)
	}

	if err := h.service.updateHello(id, req); err != nil {
		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	if err := c.JSON(http.StatusOK, models.HelloResponse{
		Message: fmt.Sprintf("Hello updated, new nickname: %s", req.Nickname),
	}); err != nil {
		return fmt.Errorf("failed to send JSON response: %w", err)
	}

	return nil
}

func (h *Handler) deleteHello(c echo.Context) error {
	id := c.Param("id")
	if err := h.service.deleteHello(id); err != nil {
		return middleware.NewError(http.StatusInternalServerError,
			fmt.Sprintf("failed to delete repository with id %s", id), err)
	}

	if err := c.JSON(http.StatusOK, models.HelloResponse{
		Message: fmt.Sprintf("Repository with id %s deleted", id),
	}); err != nil {
		return fmt.Errorf("failed to send JSON response: %w", err)
	}

	return nil
}
