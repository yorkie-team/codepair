package mongo

import "github.com/yorkie-team/codepair/backend/internal/core/hello"

type HelloRepository struct{}

// NewHelloRepository creates a new HelloRepository.
func NewHelloRepository() HelloRepository {
	return HelloRepository{}
}

func (h HelloRepository) ReadHelloMessageFor(codePairVisitor hello.CodePairVisitor) (string, error) {
	return "Hello, " + codePairVisitor.Nickname + "!", nil
}
