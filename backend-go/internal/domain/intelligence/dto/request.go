package dto

type Feature string

const (
	FeatureExplain    Feature = "explain"
	FeatureRefactor   Feature = "refactor"
	FeatureTest       Feature = "test"
	FeatureOptimize   Feature = "optimize"
	FeatureDocComment Feature = "doc-comment"
)

type RunFeatureRequest struct {
	Content     string   `json:"content" validate:"required"`
	Language    string   `json:"language" validate:"required"`
	Feature     Feature  `json:"feature" validate:"required"`
	Context     []string `json:"context,omitempty"`
	WorkspaceID string   `json:"workspaceId" validate:"required"`
}

type RunFollowUpRequest struct {
	Content     string   `json:"content" validate:"required"`
	Context     []string `json:"context,omitempty"`
	WorkspaceID string   `json:"workspaceId" validate:"required"`
}
