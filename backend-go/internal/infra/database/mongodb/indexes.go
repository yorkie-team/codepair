package mongodb

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// ColVisitor is the name of the workspaceCollection storing visitor records.
const (
	ColVisitor             = "hello_visitors"
	ColUsers               = "users"
	ColWorkspace           = "workspaces"
	ColUserWorkspace       = "user_workspaces"
	ColWorkspaceInvitation = "workspace_invitations"
)

type collectionInfo struct {
	name    string
	indexes []mongo.IndexModel
}

var collectionInfos = []collectionInfo{
	{
		name: ColVisitor,
		indexes: []mongo.IndexModel{{
			Keys:    bson.D{{Key: "nickname", Value: 1}},
			Options: options.Index().SetUnique(true),
		}},
	},
	{
		name: ColUsers,
		indexes: []mongo.IndexModel{
			{
				Keys:    bson.D{{Key: "social_uid", Value: 1}},
				Options: options.Index().SetUnique(true),
			},
			{
				Keys:    bson.D{{Key: "nickname", Value: 1}},
				Options: options.Index().SetUnique(true),
			},
		},
	},
	{
		name: ColWorkspace,
		indexes: []mongo.IndexModel{
			{
				Keys:    bson.D{{Key: "slug", Value: 1}},
				Options: options.Index().SetUnique(true),
			},
		},
	},
	{
		name: ColUserWorkspace,
		indexes: []mongo.IndexModel{
			{
				Keys:    bson.D{{Key: "user_id", Value: 1}, {Key: "workspace_id", Value: 1}},
				Options: options.Index().SetUnique(true),
			},
		},
	},
	{
		name: ColWorkspaceInvitation,
		indexes: []mongo.IndexModel{
			{
				Keys: bson.D{{Key: "token", Value: 1}},
			},
		},
	},
}

func ensureIndexes(ctx context.Context, db *mongo.Database) error {
	for _, info := range collectionInfos {
		_, err := db.Collection(info.name).Indexes().CreateMany(ctx, info.indexes)
		if err != nil {
			return fmt.Errorf("create indexes: %w", err)
		}
	}
	return nil
}
