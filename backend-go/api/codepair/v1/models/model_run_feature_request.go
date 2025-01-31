package models

type RunFeatureRequest struct {

	// Document ID on which the feature will be applied
	DocumentId string `json:"documentId"`

	// Content or query for the intelligence feature
	Content string `json:"content"`
}
