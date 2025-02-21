package mongo

import (
	"time"

	"github.com/yorkie-team/codepair/backend/internal/core/hello"
)

type CodePairVisitor struct {
	ID        int
	Nickname  string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (c *CodePairVisitor) ToDomain() hello.CodePairVisitor {
	return hello.CodePairVisitor{
		ID:       c.ID,
		Nickname: c.Nickname,
	}
}

type HelloRepository struct{}

// NewHelloRepository creates a new HelloRepository.
func NewHelloRepository() *HelloRepository {
	return &HelloRepository{}
}

func (h *HelloRepository) FindHelloMessage(id int) (hello.CodePairVisitor, error) {
	he := &CodePairVisitor{
		ID:       id,
		Nickname: "find",
	}
	return he.ToDomain(), nil
}

func (h *HelloRepository) CreateHelloMessage(_ hello.CodePairVisitor) error {

	return nil
}
