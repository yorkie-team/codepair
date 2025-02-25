package mongodb

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
)

// Dial creates an instance of Mongo and dials the given MongoDB.
func Dial(conf *config.Mongo) (*mongo.Client, error) {
	client, err := mongo.Connect(
		options.Client().
			ApplyURI(conf.ConnectionURI).
			SetConnectTimeout(conf.ConnectionTimeout).
			SetRegistry(NewRegistry()),
	)
	if err != nil {
		return nil, database.ErrDisconnected
	}

	ctxPing, cancel := context.WithTimeout(context.Background(), conf.PingTimeout)
	defer cancel()

	if err := client.Ping(ctxPing, readpref.Primary()); err != nil {
		return nil, database.ErrNetwork
	}

	return client, nil
}
