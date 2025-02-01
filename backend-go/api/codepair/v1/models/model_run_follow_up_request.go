package models

type RunFollowUpRequest struct {

	// Document ID to apply the follow-up
	DocumentId string `json:"documentId"`

	// Key representing the relevant chat history
	MemoryKey string `json:"memoryKey"`

	// Content or query to run the follow-up feature on
	Content string `json:"content"`
}
