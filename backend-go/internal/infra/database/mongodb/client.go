package mongodb

import (
	"context"

	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"

	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/database"
)

// Dial creates an instance of Mongo and dials the given MongoDB.
func Dial(conf *config.Mongo, logger echo.Logger) (*mongo.Client, error) {
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

	if err := ensureIndexes(context.Background(), client.Database(conf.DatabaseName)); err != nil {
		return nil, err
	}

	logger.Infof("MongoDB connected, URI: %s, DB: %s", conf.ConnectionURI, conf.DatabaseName)

	return client, nil
}
