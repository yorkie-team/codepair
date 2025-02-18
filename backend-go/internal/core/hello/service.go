package hello

import (
	"context"
	"fmt"
)

type Service struct {
	helloRepository Repository
}

// NewService creates a new service for hello.
func NewService(repository Repository) *Service {
	return &Service{
		helloRepository: repository,
	}
}

// HelloCodePair returns a hello message for a given CodePairVisitor
func (s *Service) HelloCodePair(codePairVisitor CodePairVisitor) (string, error) {
	helloMessage, err := s.helloRepository.CreateHelloMessage(context.Background(), codePairVisitor)
	if err != nil {
		return "", fmt.Errorf("create message: %w", err)
	}

	return helloMessage.ID, nil
}
