package integration

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/config"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/mongodb"
	"github.com/yorkie-team/codepair/backend/test/helper"
)

func TestGetSettings(t *testing.T) {
	conf := helper.NewTestConfig(t.Name())
	codePair := helper.SetupTestServer(t)
	_, access, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())
	mongo, _ := mongodb.Dial()
	db := mongo.Database(conf.Mongo.DatabaseName)
	defer func() {
		err := mongo.Disconnect(context.Background())
		assert.NoError(t, err)
	}()

	url := codePair.ServerAddr() + "/settings"

	t.Run("get settings without file upload and yorkie intelligence", func(t *testing.T) {
		defer helper.ClearCollections(t, db)

		conf.Storage.Provider = ""
		conf.Yorkie.Intelligence = config.DefaultYorkieIntelligence

		status, body := helper.DoRequest(t, http.MethodGet, url, access, nil)

		var resData models.FindSettingsResponse
		assert.NoError(t, json.Unmarshal(body, &resData))
		assert.Equal(t, http.StatusOK, status)
		assert.Equal(t, false, resData.FileUpload.Enable)
		assert.Equal(t, false, resData.YorkieIntelligence.Enable)
	})

	t.Run("get settings with file upload and yorkie intelligence", func(t *testing.T) {
		defer helper.ClearCollections(t, db)

		conf.Storage.Provider = "s3"
		conf.Yorkie.Intelligence = "ollama:gemma2:2b"

		status, body := helper.DoRequest(t, http.MethodGet, url, access, nil)

		var resData models.FindSettingsResponse
		assert.NoError(t, json.Unmarshal(body, &resData))
		assert.Equal(t, http.StatusOK, status)
		assert.Equal(t, true, resData.FileUpload.Enable)
		assert.Equal(t, true, resData.YorkieIntelligence.Enable)
	})

	t.Run("get settings with file upload", func(t *testing.T) {
		defer helper.ClearCollections(t, db)

		conf.Storage.Provider = "minio"
		conf.Yorkie.Intelligence = config.DefaultYorkieIntelligence

		status, body := helper.DoRequest(t, http.MethodGet, url, access, nil)

		var resData models.FindSettingsResponse
		assert.NoError(t, json.Unmarshal(body, &resData))
		assert.Equal(t, http.StatusOK, status)
		assert.Equal(t, true, resData.FileUpload.Enable)
		assert.Equal(t, false, resData.YorkieIntelligence.Enable)
	})

	t.Run("get settings with yorkie intelligence", func(t *testing.T) {
		defer helper.ClearCollections(t, db)

		conf.Storage.Provider = ""
		conf.Yorkie.Intelligence = "ollama:gemma2:2b"

		status, body := helper.DoRequest(t, http.MethodGet, url, access, nil)

		var resData models.FindSettingsResponse
		assert.NoError(t, json.Unmarshal(body, &resData))
		assert.Equal(t, http.StatusOK, status)
		assert.Equal(t, false, resData.FileUpload.Enable)
		assert.Equal(t, true, resData.YorkieIntelligence.Enable)
	})
}
