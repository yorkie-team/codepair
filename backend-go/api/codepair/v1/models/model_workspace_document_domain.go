package models

import (
	"time"
)

type WorkspaceDocumentDomain struct {

	// Document ID
	Id string `json:"id"`

	// Yorkie Document ID associated with the document
	YorkieDocumentId string `json:"yorkieDocumentId"`

	// Document title
	Title string `json:"title"`

	// Document content
	Content string `json:"content,omitempty"`

	// Timestamp of document creation
	CreatedAt time.Time `json:"createdAt"`

	// Timestamp of last document update
	UpdatedAt time.Time `json:"updatedAt"`

	// ID of the workspace containing this document
	WorkspaceId string `json:"workspaceId"`
}
