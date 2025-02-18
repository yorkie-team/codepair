package hello

import "context"

type Repository interface {
	// CreateHelloMessage ReadHelloMessageFor creates a hello message with id
	CreateHelloMessage(ctx context.Context, codePairVisitor CodePairVisitor) (CodePairVisitor, error)
}
