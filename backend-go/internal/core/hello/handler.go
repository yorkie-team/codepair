package hello

import (
	"fmt"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/transport/http"
)

// Handler handles HTTP requests for hello messages.
type Handler struct {
	service *Service
}

func (h *Handler) createHello(c echo.Context) error {
	req := &models.HelloRequest{}

	if err := http.BindAndValidateRequest(c, req); err != nil {
		return http.NewErrorResponse(c, fmt.Errorf("invalid request: %w", err))
	}
	id, err := h.service.createHello(req)
	if err != nil {
		return http.NewErrorResponse(c, err)
	}
	return http.NewOkResponse(c, models.HelloResponse{
		Message: fmt.Sprintf("Hello, id:%s, nickname: %s!", id, req.Nickname),
	})
}

func (h *Handler) readHello(c echo.Context) error {
	id := c.Param("id")
	nickname, err := h.service.readNickname(id)
	if err != nil {
		return http.NewErrorResponse(c, fmt.Errorf("failed to find hello message for visitor with ID %s: %w", id, err))
	}
	return http.NewOkResponse(c, models.HelloResponse{
		Message: fmt.Sprintf("Hello, %s!", nickname),
	})
}

func (h *Handler) updateHello(c echo.Context) error {
	id := c.Param("id")
	req := &models.HelloRequest{}
	if err := http.BindAndValidateRequest(c, req); err != nil {
		return http.NewErrorResponse(c, fmt.Errorf("invalid request: %w", err))
	}
	if err := h.service.updateHello(id, req); err != nil {
		return http.NewErrorResponse(c, err)
	}
	return http.NewOkResponse(c, models.HelloResponse{
		Message: fmt.Sprintf("Hello updated, new nickname: %s", req.Nickname),
	})
}

func (h *Handler) deleteHello(c echo.Context) error {
	id := c.Param("id")
	if err := h.service.deleteHello(id); err != nil {
		return http.NewErrorResponse(c, err)
	}
	return http.NewOkResponse(c, map[string]string{
		"message": fmt.Sprintf("Visitor with id %s deleted", id),
	})
}
