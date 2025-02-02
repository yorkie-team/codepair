package models

type HttpExceptionResponse struct {

	// HTTP status code
	StatusCode int `json:"statusCode"`

	// Description of the error
	Message string `json:"message"`
}
