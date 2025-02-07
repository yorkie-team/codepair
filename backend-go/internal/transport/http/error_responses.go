package http

import (
	nethttp "net/http"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
)

func newHttpExceptionResponse(statusCode int, message string) models.HttpExceptionResponse {
	return models.HttpExceptionResponse{
		StatusCode: statusCode,
		Message:    message,
	}
}

// NewInvalidJsonErrorResponse creates a HttpExceptionResponse that represents an invalid JSON error.
func NewInvalidJsonErrorResponse() models.HttpExceptionResponse {
	return newHttpExceptionResponse(nethttp.StatusBadRequest, "Invalid JSON")
}

// NewValidationErrorResponse creates a HttpExceptionResponse that represents a validation error.
func NewValidationErrorResponse(reason string) models.HttpExceptionResponse {
	return newHttpExceptionResponse(nethttp.StatusBadRequest, reason)
}

// NewInternalServerErrorResponse creates a HttpExceptionResponse that represents a internal server error.
func NewInternalServerErrorResponse() models.HttpExceptionResponse {
	return newHttpExceptionResponse(nethttp.StatusInternalServerError, "Internal Server Error")
}
