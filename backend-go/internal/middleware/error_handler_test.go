package middleware

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
)

func TestHTTPErrorHandlerIntegration(t *testing.T) {
	e := echo.New()
	e.HTTPErrorHandler = HTTPErrorHandler

	// Normal HTTPError: A handler returns an HTTPError with 400 status.
	e.GET("/normal", func(c echo.Context) error {
		return NewError(http.StatusBadRequest, "Bad Request")
	})
	t.Run("normal HTTPError", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/normal", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusBadRequest, rec.Code)

		var resp models.HttpExceptionResponse
		assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
		assert.Equal(t, "Bad Request", resp.Message)
	})

	// Generic Error: The handler returns a non-HTTPError (plain error).
	// The middleware should default to a 500 Internal Server Error.
	e.GET("/generic", func(c echo.Context) error {
		return errors.New("generic error")
	})
	t.Run("generic error", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/generic", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusInternalServerError, rec.Code)

		var resp models.HttpExceptionResponse
		assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
		assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
		assert.Equal(t, http.StatusText(http.StatusInternalServerError), resp.Message)
	})

	// HEAD Request: For HEAD requests the middleware should return no body.
	e.HEAD("/head", func(c echo.Context) error {
		return NewError(http.StatusBadRequest, "Bad Request")
	})
	t.Run("HEAD request", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodHead, "/head", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusBadRequest, rec.Code)
		// The response body for HEAD requests should be empty.
		assert.Equal(t, 0, rec.Body.Len())
	})

	// Committed Response: Simulate a route that already commits the response
	// before returning an error. The middleware should not write any additional
	// content.
	e.GET("/committed", func(c echo.Context) error {
		// Write header to mark the response as committed.
		c.Response().WriteHeader(http.StatusOK)
		return NewError(http.StatusBadRequest, "Bad Request")
	})
	t.Run("committed response", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/committed", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		// Since the response is already committed, the error handler should not modify it.
		// Expect the status code and body to remain unchanged.
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, "", rec.Body.String())
	})
}
