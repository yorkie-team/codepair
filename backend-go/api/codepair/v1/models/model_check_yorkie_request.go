package models

type CheckYorkieRequest struct {

	// Authorization token provided by the client
	Token string `json:"token"`

	// Yorkie method to be invoked
	Method string `json:"method"`

	// Additional attributes for authorization
	Attributes []string `json:"attributes"`
}
