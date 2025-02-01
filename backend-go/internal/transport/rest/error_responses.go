package rest

import (
	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"net/http"
)

func newHttpExceptionResponse(statusCode int32, message string) models.HttpExceptionResponse {
	return models.HttpExceptionResponse{
		StatusCode: statusCode,
		Message:    message,
	}
}

// NewInvalidJsonErrorResponse creates a HttpExceptionResponse that represents an invalid JSON error.
func NewInvalidJsonErrorResponse() models.HttpExceptionResponse {
	return newHttpExceptionResponse(http.StatusBadRequest, "Invalid JSON")
}

// NewValidationErrorResponse creates a HttpExceptionResponse that represents a validation error.
func NewValidationErrorResponse(reason string) models.HttpExceptionResponse {
	return newHttpExceptionResponse(http.StatusBadRequest, reason)
}

// NewInternalServerErrorResponse creates a HttpExceptionResponse that represents a internal server error.
func NewInternalServerErrorResponse() models.HttpExceptionResponse {
	return newHttpExceptionResponse(http.StatusInternalServerError, "Internal Server Error")
}
