package hello

import (
	"fmt"
	"strconv"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/transport/http"
)

type Handler struct {
	service *Service
}

// createHello returns a hello message for a given CodePairVisitor.
func (h *Handler) createHello(c echo.Context) error {
	req := new(models.HelloRequest)

	if err := http.BindAndValidateRequest(c, req); err != nil {
		return http.NewErrorResponse(c, fmt.Errorf("invalid request: %w", err))
	}

	if err := h.service.createHello(CodePairVisitor{Nickname: req.Nickname}); err != nil {
		return http.NewErrorResponse(c, fmt.Errorf("failed to create hello message for visitor %s: %w", req.Nickname, err))
	}

	return http.NewOkResponse(c, models.HelloResponse{
		Message: fmt.Sprintf("Hello, %s!", req.Nickname),
	})
}

// readHello returns a hello message for a given CodePairVisitor.
func (h *Handler) readHello(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return http.NewErrorResponse(c, fmt.Errorf("invalid ID format: %s", idStr))
	}

	nickname, err := h.service.readNickname(id)
	if err != nil {
		return http.NewErrorResponse(c, fmt.Errorf("failed to find hello message for visitor with ID %d: %w", id, err))
	}

	return http.NewOkResponse(c, models.HelloResponse{
		Message: fmt.Sprintf("Hello, %s!", nickname),
	})
}
