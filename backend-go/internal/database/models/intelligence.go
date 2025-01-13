package models

type Feature string

const (
	FeatureExplain    Feature = "explain"
	FeatureRefactor   Feature = "refactor"
	FeatureTest       Feature = "test"
	FeatureOptimize   Feature = "optimize"
	FeatureDocComment Feature = "doc-comment"
)

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatHistory struct {
	WorkspaceID string    `json:"workspaceId"`
	Messages    []Message `json:"messages"`
}
