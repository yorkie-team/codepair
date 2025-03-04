package middleware

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
)

// HTTPError represents a structured error response for the application.
type HTTPError struct {
	// Code is the HTTP status code returned in the response.
	Code int
	// Message is the error message returned in the response body.
	Message string
	// Internal contains the underlying error.
	// If Internal is not nil, it is logged.
	Internal error
}

// NewError creates a new HTTPError instance.
func NewError(code int, message string, err ...error) *HTTPError {
	if len(err) > 0 {
		return &HTTPError{
			Code:     code,
			Message:  message,
			Internal: err[0],
		}
	}

	return &HTTPError{
		Code:    code,
		Message: message,
	}
}

// Error implements the `error` interface for HTTPError.
func (e *HTTPError) Error() string {
	if e.Internal == nil {
		return fmt.Sprintf("code=%d, message=%v", e.Code, e.Message)
	}
	return fmt.Sprintf("code=%d, message=%v, internal=%v", e.Code, e.Message, e.Internal)
}

// HTTPErrorHandler processes errors and sends a JSON response to the client.
func HTTPErrorHandler(err error, c echo.Context) {
	// Avoid handling errors if the response has already been committed.
	if c.Response().Committed {
		return
	}

	var he *HTTPError

	// Check if the error is an HTTPError instance.
	if errors.As(err, &he) {
		// If the internal error is also an HTTPError, use it instead.
		if internalErr, ok := he.Internal.(*HTTPError); ok {
			he = internalErr
		}
	} else {
		// If the error is not an HTTPError, return a generic 500 Internal Server Error.
		he = &HTTPError{
			Code:    http.StatusInternalServerError,
			Message: http.StatusText(http.StatusInternalServerError),
		}
	}

	// Construct the error response.
	errorResponse := models.HttpExceptionResponse{
		StatusCode: he.Code,
		Message:    he.Message,
	}

	if he.Internal != nil {
		c.Logger().Error(he.Internal)
	}

	// Send the appropriate response based on the request method.
	var responseErr error
	if c.Request().Method == http.MethodHead {
		// For HEAD requests, send an empty response with the error status code.
		responseErr = c.NoContent(he.Code)
	} else {
		// For other request methods, send a JSON response with the error details.
		responseErr = c.JSON(he.Code, errorResponse)
	}

	// Log the response error if sending the response failed.
	if responseErr != nil {
		c.Logger().Error(responseErr)
	}
}
