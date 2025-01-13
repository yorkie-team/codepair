package domain

import (
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/auth"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/document"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/files"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/intelligence"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/user"
	"github.com/yorkie-team/codepair/backend-go/internal/domain/workspace"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type Services struct {
	Github       *auth.Service
	User         *user.Service
	Workspace    *workspace.Service
	Document     *document.Service
	File         *files.Service
	Intelligence *intelligence.Service
}

func NewServices(db *mongo.Database, storage s3.StorageClassAnalysis, cfg *config.Config) *Services {
	return &Services{
		Github:       auth.NewService(cfg),
		User:         user.NewService(db),
		Workspace:    workspace.NewService(db, cfg),
		Document:     document.NewService(db, cfg),
		File:         files.NewService(storage, cfg.BucketName),
		Intelligence: intelligence.NewService(),
	}
}
