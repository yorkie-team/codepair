package models

type HttpExceptionResponse struct {

	// HTTP status code
	StatusCode float32 `json:"statusCode"`

	// Description of the error
	Message string `json:"message"`
}
