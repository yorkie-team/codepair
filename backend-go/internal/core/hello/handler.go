package hello

import (
	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/transport/http"
)

type Handler struct {
	helloService *Service
}

// NewHandler creates a new handler for hello.
func NewHandler(service *Service) *Handler {
	return &Handler{
		helloService: service,
	}
}

// HelloCodePair returns a hello message for a given CodePairVisitor.
func (h *Handler) HelloCodePair(e echo.Context) error {
	req := new(models.HelloRequest)

	if err := http.BindAndValidateRequest(e, req); err != nil {
		return err
	}

	helloMessage, err := h.helloService.HelloCodePair(e, CodePairVisitor{
		Nickname: req.Nickname,
	})
	if err != nil {
		return http.NewErrorResponse(e, err)
	}

	return http.NewOkResponse(e, models.HelloResponse{
		Message: helloMessage,
	})
}
