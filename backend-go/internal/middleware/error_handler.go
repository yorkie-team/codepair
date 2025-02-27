package middleware

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
)

// HTTPError represents an application-specific error structure.
type HTTPError struct {
	Code     int
	Message  string
	Internal error
}

// NewError creates a new instance of HTTPError.
func NewError(code int, message string, err error) *HTTPError {
	return &HTTPError{
		Code:     code,
		Message:  message,
		Internal: err,
	}
}

// Error implements the `error` interface.
func (e *HTTPError) Error() string {
	if e.Internal == nil {
		return fmt.Sprintf("code=%d, message=%v", e.Code, e.Message)
	}
	return fmt.Sprintf("code=%d, message=%v, internal=%v", e.Code, e.Message, e.Internal)
}

// ErrorHandler handles application errors.
type ErrorHandler struct {
	debug  bool
	logger echo.Logger
}

func NewErrorHandler(debug bool, logger echo.Logger) *ErrorHandler {
	return &ErrorHandler{
		debug:  debug,
		logger: logger,
	}
}

// HTTPErrorHandler processes errors and sends a JSON response.
func (e *ErrorHandler) HTTPErrorHandler(err error, c echo.Context) {
	if c.Response().Committed {
		return // Avoid handling errors after response has been sent.
	}

	var he *HTTPError

	if errors.As(err, &he) {
		if internalErr, ok := he.Internal.(*HTTPError); ok {
			he = internalErr
		}
	} else {
		he = &HTTPError{
			Code:    http.StatusInternalServerError,
			Message: http.StatusText(http.StatusInternalServerError),
		}
	}

	errorResponse := models.HttpExceptionResponse{
		StatusCode: he.Code,
		Message:    he.Message,
	}

	// If debug mode is enabled, include internal error details
	if e.debug && he.Internal != nil {
		errorResponse.Message = fmt.Sprintf(
			"message:%s, internal:%s",
			errorResponse.Message,
			he.Internal.Error(),
		)
	}

	if he.Internal != nil {
		e.logger.Error(he.Internal)
	}

	// Respond based on request type
	var responseErr error
	if c.Request().Method == http.MethodHead {
		responseErr = c.NoContent(he.Code)
	} else {
		responseErr = c.JSON(he.Code, errorResponse)
	}

	// Log the error if response failed
	if responseErr != nil {
		e.logger.Error(responseErr)
	}
}
