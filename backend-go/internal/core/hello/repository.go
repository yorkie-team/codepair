package hello

type Repository interface {
	// ReadHelloMessageFor reads a hello message for a given CodePairVisitor
	ReadHelloMessageFor(codePairVisitor CodePairVisitor) (string, error)
}
