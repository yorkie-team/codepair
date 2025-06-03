package models

type YorkieIntelligenceConfig struct {

	// Whether Yorkie Intelligence features are enabled
	Enable bool `json:"enable"`

	Config YorkieIntelligenceConfigConfig `json:"config"`
}
