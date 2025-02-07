package http

import (
	"errors"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
)

// ConvertErrorToResponse converts an error to a response.
func ConvertErrorToResponse(err error) models.HttpExceptionResponse {
	switch {
	case errors.Is(err, ErrInternalServerError):
		return NewInternalServerErrorResponse()
	default:
		return NewInvalidJSONErrorResponse()
	}
}
