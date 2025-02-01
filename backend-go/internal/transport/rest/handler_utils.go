package rest

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

type request interface {
	Validate() error
}

// BindAndValidateRequest binds and validates the request.
// If the request is invalid, it returns an error response.
func BindAndValidateRequest(e echo.Context, req request) error {
	if err := e.Bind(req); err != nil {
		return e.JSON(http.StatusBadRequest, NewInvalidJsonErrorResponse())
	}
	if err := req.Validate(); err != nil {
		return e.JSON(http.StatusBadRequest, NewValidationErrorResponse(err.Error()))
	}
	return nil
}

// NewErrorResponse handles the creation and response of an error.
// It converts the provided error into a response structure and sends it as a JSON response.
// The response status code is determined by the error's associated status.
func NewErrorResponse(e echo.Context, err error) error {
	resp := ConvertErrorToResponse(err)
	return e.JSON(int(resp.StatusCode), ConvertErrorToResponse(err))
}

// NewOkResponse sends a JSON response with a status code of 200.
func NewOkResponse(e echo.Context, resp interface{}) error {
	return e.JSON(http.StatusOK, resp)
}
