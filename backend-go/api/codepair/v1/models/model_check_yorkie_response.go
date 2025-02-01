package models

type CheckYorkieResponse struct {

	// Whether the token is authorized for the specified method
	Allowed bool `json:"allowed"`

	// Reason or message explaining the authorization outcome
	Reason string `json:"reason"`
}
