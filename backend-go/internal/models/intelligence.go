package models

type Feature string

const (
	FeatureExplain  Feature = "explain"
	FeatureRefactor Feature = "refactor"
	FeatureOptimize Feature = "optimize"
	FeatureTest     Feature = "test"
	FeatureDocument Feature = "document"
	FeatureDebug    Feature = "debug"
	FeatureComplete Feature = "complete"
)

type RunFeatureRequest struct {
	Content   string `json:"content"`
	Language  string `json:"language"`
	Selection string `json:"selection"`
	Cursor    int    `json:"cursor"`
}

type RunFollowUpRequest struct {
	Content  string `json:"content"`
	Question string `json:"question"`
}

type StreamCallback func(chunk string)
