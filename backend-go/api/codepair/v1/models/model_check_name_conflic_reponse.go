package models

type CheckNameConflicReponse struct {

	// Indicates if the name is already in use
	Conflict bool `json:"conflict"`
}
