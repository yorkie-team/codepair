package hello

type Repository interface {
	// FindHelloMessage find a hello message for a given CodePairVisitor
	FindHelloMessage(id int) (CodePairVisitor, error)

	// CreateHelloMessage creates a hello message for given CodePairVisitor
	CreateHelloMessage(codePairVisitor CodePairVisitor) error
}
