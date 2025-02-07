package http

import (
	"fmt"
	nethttp "net/http"

	"github.com/labstack/echo/v4"
)

type request interface {
	Validate() error
}

// BindAndValidateRequest binds and validates the request.
// If the request is invalid, it returns an error response.
func BindAndValidateRequest(e echo.Context, req request) error {
	if err := e.Bind(req); err != nil {
		return fmt.Errorf("failed to bind request: %w", e.JSON(nethttp.StatusBadRequest, NewInvalidJSONErrorResponse()))
	}
	if err := req.Validate(); err != nil {
		return fmt.Errorf("validation failed: %w", e.JSON(nethttp.StatusBadRequest, NewValidationErrorResponse(err.Error())))
	}
	return nil
}

// NewErrorResponse handles the creation and response of an error.
// It converts the provided error into a response structure and sends it as a JSON response.
// The response status code is determined by the error's associated status.
func NewErrorResponse(e echo.Context, err error) error {
	resp := ConvertErrorToResponse(err)
	return fmt.Errorf("returning error response as JSON: %w", e.JSON(resp.StatusCode, ConvertErrorToResponse(err)))
}

// NewOkResponse sends a JSON response with a status code of 200.
func NewOkResponse(e echo.Context, resp interface{}) error {
	return fmt.Errorf("returning success response as JSON: %w", e.JSON(nethttp.StatusOK, resp))
}
