package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/v2/bson"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/jwt"
	"github.com/yorkie-team/codepair/backend/test/helper"
)

func TestFindUser(t *testing.T) {
	conf := helper.NewTestConfig(t.Name())
	e := helper.NewTestEcho(t)
	svr := helper.SetupTestServer(t, conf, e)
	user := helper.SetupDefaultUser(t, conf, e.Logger)
	gen := jwt.NewGenerator(conf.JWT)
	url := svr.ServerAddr() + "/users"

	t.Run("find user by valid id", func(t *testing.T) {
		token, err := gen.GenerateAccessToken(string(user.ID))
		assert.NoError(t, err)

		status, body := helper.DoRequest(t, http.MethodGet, url, token, nil)
		assert.Equal(t, http.StatusOK, status)

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

		_, body := helper.DoRequest(t, http.MethodGet, url, token, nil)
		var resData models.HttpExceptionResponse
		assert.NoError(t, json.Unmarshal(body, &resData))
		assert.Equal(t, http.StatusInternalServerError, resData.StatusCode)
	})

	t.Run("find user by non-exists id", func(t *testing.T) {
		token, err := gen.GenerateAccessToken(bson.NewObjectID().Hex())
		assert.NoError(t, err)

		_, body := helper.DoRequest(t, http.MethodGet, url, token, nil)
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
	url := svr.ServerAddr() + "/users"

	t.Run("change valid nickname", func(t *testing.T) {
		token, err := gen.GenerateAccessToken(string(user.ID))
		assert.NoError(t, err)

		reqBody, err := json.Marshal(models.ChangeNicknameRequest{Nickname: "valid_nick"})
		assert.NoError(t, err)

		status, _ := helper.DoRequest(t, http.MethodPut, url, token, bytes.NewReader(reqBody))
		assert.Equal(t, http.StatusOK, status)
	})

	t.Run("change duplicated nickname", func(t *testing.T) {
		t.Skip("add this after implement create user api")
	})
}
