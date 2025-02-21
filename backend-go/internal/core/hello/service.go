package hello

import (
	"fmt"
)

type Service struct {
	repository Repository
}

// createHello returns a hello message for a given CodePairVisitor
func (s *Service) createHello(codePairVisitor CodePairVisitor) error {
	if err := s.repository.CreateHelloMessage(codePairVisitor); err != nil {
		return fmt.Errorf("failed to create hello message for visitor %v: %w", codePairVisitor, err)
	}

	return nil
}

// readNickname returns a hello message for a given CodePairVisitor
func (s *Service) readNickname(id int) (string, error) {
	hello, err := s.repository.FindHelloMessage(id)
	if err != nil {
		return "", fmt.Errorf("failed to find hello message for ID %d: %w", id, err)
	}

	return hello.Nickname, nil
}
