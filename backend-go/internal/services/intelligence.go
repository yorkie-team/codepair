package services

import (
	"context"
	"fmt"
	"strings"

	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
)

type IntelligenceService struct {
	cfg          *config.Config
	workspaceSvc *WorkspaceService
	chatHistory  map[string][]models.Message
}

func NewIntelligenceService(cfg *config.Config, workspaceSvc *WorkspaceService) *IntelligenceService {
	return &IntelligenceService{
		cfg:          cfg,
		workspaceSvc: workspaceSvc,
		chatHistory:  make(map[string][]models.Message),
	}
}

func (s *IntelligenceService) RunFeature(ctx context.Context, userID string, req *models.RunFeatureRequest, streamCallback func(string) error) error {
	// Verify workspace access
	_, err := s.workspaceSvc.Get(req.WorkspaceID, userID)
	if err != nil {
		return err
	}

	// Generate prompt based on feature
	prompt := s.generatePrompt(req.Feature, req.Content, req.Language)

	// Initialize or get chat history
	messages := s.getOrInitializeChatHistory(req.WorkspaceID)

	// Add user message
	messages = append(messages, models.Message{
		Role:    "user",
		Content: prompt,
	})

	// Call AI service (implementation depends on your AI provider)
	err = s.streamAIResponse(ctx, messages, streamCallback)
	if err != nil {
		return err
	}

	// Update chat history
	s.chatHistory[req.WorkspaceID] = messages

	return nil
}

func (s *IntelligenceService) RunFollowUp(ctx context.Context, userID string, req *models.RunFollowUpRequest, streamCallback func(string) error) error {
	// Verify workspace access
	_, err := s.workspaceSvc.Get(req.WorkspaceID, userID)
	if err != nil {
		return err
	}

	// Get existing chat history
	messages := s.getOrInitializeChatHistory(req.WorkspaceID)

	// Add user message
	messages = append(messages, models.Message{
		Role:    "user",
		Content: req.Content,
	})

	// Call AI service
	err = s.streamAIResponse(ctx, messages, streamCallback)
	if err != nil {
		return err
	}

	// Update chat history
	s.chatHistory[req.WorkspaceID] = messages

	return nil
}

func (s *IntelligenceService) generatePrompt(feature models.Feature, content, language string) string {
	var prompt strings.Builder

	switch feature {
	case models.FeatureExplain:
		prompt.WriteString(fmt.Sprintf("Explain the following %s code:\n\n%s", language, content))
	case models.FeatureRefactor:
		prompt.WriteString(fmt.Sprintf("Refactor the following %s code to improve its quality:\n\n%s", language, content))
	case models.FeatureTest:
		prompt.WriteString(fmt.Sprintf("Generate unit tests for the following %s code:\n\n%s", language, content))
	case models.FeatureOptimize:
		prompt.WriteString(fmt.Sprintf("Optimize the following %s code for better performance:\n\n%s", language, content))
	case models.FeatureDocComment:
		prompt.WriteString(fmt.Sprintf("Add documentation comments to the following %s code:\n\n%s", language, content))
	}

	return prompt.String()
}

func (s *IntelligenceService) getOrInitializeChatHistory(workspaceID string) []models.Message {
	if messages, exists := s.chatHistory[workspaceID]; exists {
		return messages
	}
	return []models.Message{}
}

func (s *IntelligenceService) streamAIResponse(ctx context.Context, messages []models.Message, streamCallback func(string) error) error {
	// Implementation depends on your AI provider (e.g., OpenAI, Anthropic, etc.)
	// This is a placeholder that should be replaced with actual implementation
	return fmt.Errorf("AI streaming not implemented")
}
