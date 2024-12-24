package services

import (
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"go.mongodb.org/mongo-driver/mongo"
)

type Services struct {
	UserService         *UserService
	WorkspaceService    *WorkspaceService
	DocumentService     *DocumentService
	FileService         *FileService
	IntelligenceService *IntelligenceService
}

func NewServices(db *mongo.Database, s3Client *s3.Client, cfg *config.Config) *Services {
	return &Services{
		UserService:         NewUserService(db, cfg),
		WorkspaceService:    NewWorkspaceService(db, cfg),
		DocumentService:     NewDocumentService(db, cfg),
		FileService:         NewFileService(s3Client, cfg.BucketName),
		IntelligenceService: NewIntelligenceService(cfg.YorkieAPIAddr),
	}
}
