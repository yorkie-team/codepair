package models

type YorkieIntelligenceConfig struct {

	// Whether Yorkie Intelligence features are enabled
	Enable bool `json:"enable"`

	// Additional Yorkie Intelligence configuration
	Config map[string]interface{} `json:"config"`
}
