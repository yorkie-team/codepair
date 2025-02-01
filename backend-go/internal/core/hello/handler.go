package hello

import (
	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/transport/rest"
)

type Handler struct {
	helloService Service
}

// NewHandler creates a new handler for hello.
func NewHandler(service Service) Handler {
	return Handler{
		helloService: service,
	}
}

// HelloCodePair returns a hello message for a given CodePairVisitor.
func (h Handler) HelloCodePair(e echo.Context) error {
	data := new(models.HelloRequest)

	if err := rest.BindAndValidateRequest(e, data); err != nil {
		return err
	}

	helloMessage, err := h.helloService.HelloCodePair(e, CodePairVisitor{
		Nickname: data.Nickname,
	})

	if err != nil {
		return rest.NewErrorResponse(e, err)
	}

	return rest.NewOkResponse(e, models.HelloResponse{
		Message: helloMessage,
	})
}
