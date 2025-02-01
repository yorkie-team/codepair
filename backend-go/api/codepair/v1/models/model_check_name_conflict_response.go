package models

type CheckNameConflictResponse struct {

	// Indicates if the name is already in use
	Conflict bool `json:"conflict"`
}
