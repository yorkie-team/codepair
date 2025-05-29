package integration

import (
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
	codePair := helper.SetupTestServer(t)
	user, access, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())
	gen := jwt.NewGenerator(conf.JWT)
	url := codePair.ServerAddr() + "/users"

	t.Run("find user by valid id", func(t *testing.T) {
		status, body := helper.DoRequest(t, http.MethodGet, url, access, nil)
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
		assert.Equal(t, http.StatusNotFound, resData.StatusCode)
	})
}

func TestChangeUserNickName(t *testing.T) {
	helper.NewTestConfig(t.Name())
	codePair := helper.SetupTestServer(t)
	_, access, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())
	url := codePair.ServerAddr() + "/users"

	t.Run("change valid nickname", func(t *testing.T) {
		reqBody, err := json.Marshal(models.ChangeNicknameRequest{Nickname: "valid_nick"})
		assert.NoError(t, err)

		status, _ := helper.DoRequest(t, http.MethodPut, url, access, reqBody)
		assert.Equal(t, http.StatusOK, status)

		status, body := helper.DoRequest(t, http.MethodGet, url, access, nil)
		assert.Equal(t, http.StatusOK, status)

		var resData models.FindUserResponse
		assert.NoError(t, json.Unmarshal(body, &resData))
		assert.Equal(t, "valid_nick", resData.Nickname)
	})

	t.Run("change to empty nickname format", func(t *testing.T) {
		t.Skip("add this after implement nickname validation")
		reqBody, err := json.Marshal(models.ChangeNicknameRequest{Nickname: ""})
		assert.NoError(t, err)

		status, _ := helper.DoRequest(t, http.MethodPut, url, access, reqBody)
		assert.Equal(t, http.StatusOK, status)

		status, body := helper.DoRequest(t, http.MethodGet, url, access, nil)
		assert.Equal(t, http.StatusOK, status)

		var resData models.FindUserResponse
		assert.NoError(t, json.Unmarshal(body, &resData))
		assert.Equal(t, "", resData.Nickname)
	})

	t.Run("change to invalid nickname format", func(t *testing.T) {
		t.Skip("add this after implement nickname validation")
		reqBody, err := json.Marshal(models.ChangeNicknameRequest{Nickname: "!!@21!!!@#/.,.,"})
		assert.NoError(t, err)

		status, body := helper.DoRequest(t, http.MethodPut, url, access, reqBody)

		assert.Equal(t, http.StatusBadRequest, status)

		var resData models.HttpExceptionResponse
		assert.NoError(t, json.Unmarshal(body, &resData))
		assert.Contains(t, resData.Message, "invalid nickname")
	})

	t.Run("change duplicated nickname", func(t *testing.T) {
		t.Skip("add this after implement create user api")
	})
}
