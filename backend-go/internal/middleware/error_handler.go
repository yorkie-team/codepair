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
	// - If Internal is not nil, it is logged.
	// - If Internal is not nil and debug mode is enabled, it is also included in the response message
	//   to aid debugging on the client side.
	Internal error
}

// NewError creates a new HTTPError instance.
func NewError(code int, message string, err error) *HTTPError {
	return &HTTPError{
		Code:     code,
		Message:  message,
		Internal: err,
	}
}

// Error implements the `error` interface for HTTPError.
func (e *HTTPError) Error() string {
	if e.Internal == nil {
		return fmt.Sprintf("code=%d, message=%v", e.Code, e.Message)
	}
	return fmt.Sprintf("code=%d, message=%v, internal=%v", e.Code, e.Message, e.Internal)
}

// ErrorHandler manages application errors and generates appropriate HTTP responses.
// This is used as Echo’s custom error handler.
//
// If debug mode is enabled, internal errors are included in the response message.
type ErrorHandler struct {
	debug  bool
	logger echo.Logger
}

// NewErrorHandler creates a new ErrorHandler instance.
func NewErrorHandler(debug bool, logger echo.Logger) *ErrorHandler {
	return &ErrorHandler{
		debug:  debug,
		logger: logger,
	}
}

// HTTPErrorHandler processes errors and sends a JSON response to the client.
func (e *ErrorHandler) HTTPErrorHandler(err error, c echo.Context) {
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

	// If debug mode is enabled and an internal error exists, append it to the response message.
	if e.debug && he.Internal != nil {
		errorResponse.Message = fmt.Sprintf(
			"%s: internal: %s",
			errorResponse.Message,
			he.Internal.Error(),
		)
	}

	// Log the internal error if present.
	if he.Internal != nil {
		e.logger.Error(he.Internal)
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
		e.logger.Error(responseErr)
	}
}
