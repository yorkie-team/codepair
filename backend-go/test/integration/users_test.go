package integration

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/jwt"
	"github.com/yorkie-team/codepair/backend/internal/server"
	"github.com/yorkie-team/codepair/backend/test/helper"
)

func TestUserService(t *testing.T) {
	conf := helper.NewTestConfig()
	conf.Mongo.DatabaseName = t.Name()
	conf.Mongo.ConnectionURI = "mongo://localhost:27017"

	e, err := helper.NewTestEcho()
	assert.NoError(t, err)

	svr, err := server.New(e, conf)
	assert.NoError(t, err)

	defer func() {
		assert.NoError(t, svr.Shutdown(context.Background()))
	}()

	user, err := helper.EnsureDefaultUser(conf.Mongo, e.Logger)
	assert.NoError(t, err)

	go func() {
		assert.NoError(t, svr.Start())
	}()

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

		body, err := io.ReadAll(res.Body)
		assert.NoError(t, err)
		resData := &models.FindUserResponse{}
		assert.NoError(t, json.Unmarshal(body, resData))
		assert.Equal(t, string(user.ID), resData.Id)
		assert.Equal(t, user.Nickname, resData.Nickname)
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
		resData := &models.HttpExceptionResponse{}
		assert.NoError(t, json.Unmarshal(body, resData))
		assert.Equal(t, http.StatusInternalServerError, resData.StatusCode)
	})
}

func TestChangeUserNickName(t *testing.T) {
	conf := helper.NewTestConfig()
	conf.Mongo.DatabaseName = t.Name()

	e, err := helper.NewTestEcho()
	assert.NoError(t, err)

	svr, err := server.New(e, conf)
	assert.NoError(t, err)

	defer func() {
		assert.NoError(t, svr.Shutdown(context.Background()))
	}()

	user, err := helper.EnsureDefaultUser(conf.Mongo, e.Logger)
	assert.NoError(t, err)

	go func() {
		assert.NoError(t, svr.Start())
	}()

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

		res, err := client.Do(req)
		assert.NoError(t, err)
		defer func() { assert.NoError(t, res.Body.Close()) }()

		assert.Equal(t, http.StatusOK, res.StatusCode)
	})

	t.Run("change duplicated nickname", func(t *testing.T) {
		token, err := gen.GenerateAccessToken(string(user.ID))
		assert.NoError(t, err)

		reqBody, err := json.Marshal(models.ChangeNicknameRequest{Nickname: "valid_nick"})
		assert.NoError(t, err)
		req, err := http.NewRequest(http.MethodPut, svr.RPCAddr()+"/users", bytes.NewReader(reqBody))
		assert.NoError(t, err)
		req.Header.Set("Authorization", "Bearer "+token)

		res, err := client.Do(req)
		assert.NoError(t, err)
		defer func() { assert.NoError(t, res.Body.Close()) }()

		assert.Equal(t, 409, res.StatusCode)
	})
}
