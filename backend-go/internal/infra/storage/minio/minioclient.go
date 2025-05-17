package minio

import (
	"context"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"log"
)

// Client represents a wrapper around the minio.
type Client struct {
	endpoint string
	client   *minio.Client
	bucket   string
}

// ClientInterface defines methods we need from minio client.
type ClientInterface interface {
	CreateUploadPresignedURL(ctx context.Context, key string, contentLength int64, contentType string) (string, error)
	CreateDownloadPresignedURL(ctx context.Context, key string) (string, error)
}

// NewClient initializes a new Client instance to interact with a specified bucket on the given endpoint.
func NewClient(bucket string, endpoint string, accessKey string, secretKey string) (*Client, error) {
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: false,
	})
	if err != nil {
		log.Fatalln(err)
	}

	location := "us-east-1"

	err = client.MakeBucket(context.Background(), bucket, minio.MakeBucketOptions{Region: location})
	if err != nil {
		if errExists := minio.ToErrorResponse(err); errExists.Code == "BucketAlreadyOwnedByYou" {
			log.Println("We already own this bucket")
		} else {
			log.Fatalln(err)
		}
	} else {
		log.Printf("Successfully created %s\n", bucket)
	}

	return &Client{
		client: client,
		bucket: bucket,
	}, nil
}
