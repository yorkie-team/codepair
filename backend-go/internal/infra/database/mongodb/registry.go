package mongodb

import (
	"reflect"

	"github.com/yorkie-team/codepair/backend/internal/infra/database"

	"go.mongodb.org/mongo-driver/v2/bson"
)

var tID = reflect.TypeOf(database.ID(""))

func iDEncoder(_ bson.EncodeContext, vw bson.ValueWriter, val reflect.Value) error {
	if val.Type() != tID {
		return bson.ValueEncoderError{Name: "iDEncoder", Types: []reflect.Type{tID}, Received: val}
	}

	oid, err := bson.ObjectIDFromHex(val.String())
	if err != nil {
		return err
	}

	return vw.WriteObjectID(oid)
}

func iDDecoder(_ bson.DecodeContext, vr bson.ValueReader, val reflect.Value) error {
	if val.Type() != tID {
		return bson.ValueDecoderError{Name: "iDDecoder", Types: []reflect.Type{tID}, Received: val}
	}

	oid, err := vr.ReadObjectID()
	if err != nil {
		return err
	}

	val.SetString(oid.Hex())
	return nil
}

func NewRegistry() *bson.Registry {
	rb := bson.NewRegistry()

	rb.RegisterTypeEncoder(tID, bson.ValueEncoderFunc(iDEncoder))
	rb.RegisterTypeDecoder(tID, bson.ValueDecoderFunc(iDDecoder))

	return rb
}
