package models

type CheckNameConflictRequest struct {

	// Name to check for conflict
	Name string `json:"name"`
}
