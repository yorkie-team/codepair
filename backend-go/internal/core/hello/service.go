package hello

import (
	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend/internal/transport/rest"
)

type Service struct {
	helloRepository Repository
}

// NewService creates a new service for hello.
func NewService(repository Repository) Service {
	return Service{
		helloRepository: repository,
	}
}

// HelloCodePair returns a hello message for a given CodePairVisitor
func (s Service) HelloCodePair(e echo.Context, codePairVisitor CodePairVisitor) (string, error) {
	helloMessage, err := s.helloRepository.ReadHelloMessageFor(codePairVisitor)
	if err != nil {
		e.Logger().Fatal(err)
		return "", rest.InternalServerError
	}
	return helloMessage, nil
}
