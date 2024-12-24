package services

import (
	"fmt"
	"strings"

	"github.com/yorkie-team/codepair/backend-go/internal/models"
)

type IntelligenceService struct {
	ollamaBaseURL string
}

func NewIntelligenceService(ollamaBaseURL string) *IntelligenceService {
	return &IntelligenceService{
		ollamaBaseURL: ollamaBaseURL,
	}
}

func (s *IntelligenceService) RunFeature(userID string, feature models.Feature, req models.RunFeatureRequest, callback models.StreamCallback) error {
	var prompt string
	switch feature {
	case models.FeatureExplain:
		prompt = s.buildExplainPrompt(req)
	case models.FeatureRefactor:
		prompt = s.buildRefactorPrompt(req)
	case models.FeatureOptimize:
		prompt = s.buildOptimizePrompt(req)
	case models.FeatureTest:
		prompt = s.buildTestPrompt(req)
	case models.FeatureDocument:
		prompt = s.buildDocumentPrompt(req)
	case models.FeatureDebug:
		prompt = s.buildDebugPrompt(req)
	case models.FeatureComplete:
		prompt = s.buildCompletePrompt(req)
	default:
		return fmt.Errorf("unsupported feature: %s", feature)
	}

	return s.streamResponse(prompt, callback)
}

func (s *IntelligenceService) RunFollowUp(userID string, req models.RunFollowUpRequest, callback models.StreamCallback) error {
	prompt := fmt.Sprintf("Based on this code:\n\n```\n%s\n```\n\nAnswer this question: %s",
		req.Content,
		req.Question,
	)
	return s.streamResponse(prompt, callback)
}

func (s *IntelligenceService) buildExplainPrompt(req models.RunFeatureRequest) string {
	return fmt.Sprintf(
		"Explain this %s code in detail:\n\n```%s\n%s\n```",
		req.Language,
		req.Language,
		s.getRelevantContent(req),
	)
}

func (s *IntelligenceService) buildRefactorPrompt(req models.RunFeatureRequest) string {
	return fmt.Sprintf(
		"Refactor this %s code to improve its structure and readability:\n\n```%s\n%s\n```",
		req.Language,
		req.Language,
		s.getRelevantContent(req),
	)
}

func (s *IntelligenceService) buildOptimizePrompt(req models.RunFeatureRequest) string {
	return fmt.Sprintf(
		"Optimize this %s code for better performance:\n\n```%s\n%s\n```",
		req.Language,
		req.Language,
		s.getRelevantContent(req),
	)
}

func (s *IntelligenceService) buildTestPrompt(req models.RunFeatureRequest) string {
	return fmt.Sprintf(
		"Generate unit tests for this %s code:\n\n```%s\n%s\n```",
		req.Language,
		req.Language,
		s.getRelevantContent(req),
	)
}

func (s *IntelligenceService) buildDocumentPrompt(req models.RunFeatureRequest) string {
	return fmt.Sprintf(
		"Add comprehensive documentation to this %s code:\n\n```%s\n%s\n```",
		req.Language,
		req.Language,
		s.getRelevantContent(req),
	)
}

func (s *IntelligenceService) buildDebugPrompt(req models.RunFeatureRequest) string {
	return fmt.Sprintf(
		"Help debug this %s code and identify potential issues:\n\n```%s\n%s\n```",
		req.Language,
		req.Language,
		s.getRelevantContent(req),
	)
}

func (s *IntelligenceService) buildCompletePrompt(req models.RunFeatureRequest) string {
	return fmt.Sprintf(
		"Complete this %s code snippet:\n\n```%s\n%s\n```",
		req.Language,
		req.Language,
		s.getRelevantContent(req),
	)
}

func (s *IntelligenceService) getRelevantContent(req models.RunFeatureRequest) string {
	if req.Selection != "" {
		return req.Selection
	}
	return req.Content
}

func (s *IntelligenceService) streamResponse(prompt string, callback models.StreamCallback) error {
	// This is a simplified implementation. In a real application, you would:
	// 1. Make API calls to Ollama or another AI service
	// 2. Stream the responses back to the client
	// 3. Handle errors appropriately

	// For demonstration, we'll just split the prompt and stream it back
	words := strings.Split(prompt, " ")
	for _, word := range words {
		callback(word + " ")
	}

	return nil
}
