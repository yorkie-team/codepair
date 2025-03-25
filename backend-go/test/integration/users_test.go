package integration

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/jwt"
	"github.com/yorkie-team/codepair/backend/test/helper"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestFindUser(t *testing.T) {
	conf := helper.NewTestConfig(t.Name())
	e := helper.NewTestEcho(t)
	svr := helper.SetupTestServer(t, conf, e)
	user := helper.SetupDefaultUser(t, conf, e.Logger)
	gen := jwt.NewGenerator(conf.JWT)
	client := &http.Client{}

	t.Run("find user by valid id", func(t *testing.T) {
		token, err := gen.GenerateAccessToken(string(user.ID))
		assert.NoError(t, err)

		req, err := http.NewRequest(http.MethodGet, svr.RPCAddr()+"/users", nil)
		assert.NoError(t, err)
		req.Header.Set("Authorization", "Bearer "+token)

		res, err := client.Do(req)
		assert.NoError(t, err)
		defer func() { assert.NoError(t, res.Body.Close()) }()
		assert.Equal(t, http.StatusOK, res.StatusCode)

		body, err := io.ReadAll(res.Body)
		assert.NoError(t, err)

		var resData models.FindUserResponse
		assert.NoError(t, json.Unmarshal(body, &resData))
		assert.Equal(t, string(user.ID), resData.Id)
		assert.Equal(t, user.Nickname, resData.Nickname)
		assert.Equal(t, user.CreatedAt, resData.CreatedAt)
		assert.Equal(t, user.UpdatedAt, resData.UpdatedAt)
	})

	t.Run("find user by invalid id", func(t *testing.T) {
		token, err := gen.GenerateAccessToken(string(user.ID) + "invalid")
		assert.NoError(t, err)

		req, err := http.NewRequest(http.MethodGet, svr.RPCAddr()+"/users", nil)
		assert.NoError(t, err)
		req.Header.Set("Authorization", "Bearer "+token)

		res, err := client.Do(req)
		assert.NoError(t, err)
		defer func() { assert.NoError(t, res.Body.Close()) }()

		body, err := io.ReadAll(res.Body)
		assert.NoError(t, err)
		var resData models.HttpExceptionResponse
		assert.NoError(t, json.Unmarshal(body, &resData))
		assert.Equal(t, http.StatusInternalServerError, resData.StatusCode)
	})

	t.Run("find user by non-exists id", func(t *testing.T) {
		token, err := gen.GenerateAccessToken(bson.NewObjectID().String())
		assert.NoError(t, err)

		req, err := http.NewRequest(http.MethodGet, svr.RPCAddr()+"/users", nil)
		assert.NoError(t, err)
		req.Header.Set("Authorization", "Bearer "+token)

		res, err := client.Do(req)
		assert.NoError(t, err)
		defer func() { assert.NoError(t, res.Body.Close()) }()

		body, err := io.ReadAll(res.Body)
		assert.NoError(t, err)
		var resData models.HttpExceptionResponse
		assert.NoError(t, json.Unmarshal(body, &resData))
		assert.Equal(t, http.StatusInternalServerError, resData.StatusCode)
	})
}

func TestChangeUserNickName(t *testing.T) {
	conf := helper.NewTestConfig(t.Name())
	e := helper.NewTestEcho(t)
	svr := helper.SetupTestServer(t, conf, e)
	user := helper.SetupDefaultUser(t, conf, e.Logger)
	gen := jwt.NewGenerator(conf.JWT)
	client := &http.Client{}

	t.Run("change valid nickname", func(t *testing.T) {
		token, err := gen.GenerateAccessToken(string(user.ID))
		assert.NoError(t, err)

		reqBody, err := json.Marshal(models.ChangeNicknameRequest{Nickname: "valid_nick"})
		assert.NoError(t, err)
		req, err := http.NewRequest(http.MethodPut, svr.RPCAddr()+"/users", bytes.NewReader(reqBody))
		assert.NoError(t, err)
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")

		res, err := client.Do(req)
		assert.NoError(t, err)
		defer func() { assert.NoError(t, res.Body.Close()) }()
		assert.Equal(t, http.StatusOK, res.StatusCode)
	})

	t.Run("change duplicated nickname", func(t *testing.T) {
		t.Skip("add this after implement create user api")
	})
}
