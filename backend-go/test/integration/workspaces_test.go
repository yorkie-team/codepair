package integration

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/mongodb"
	"go.mongodb.org/mongo-driver/v2/bson"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/test/helper"
)

// TestFindAndCreateWorkspace tests the functionality of finding and creating workspaces.
func TestFindAndCreateWorkspace(t *testing.T) {
	conf := helper.NewTestConfig(t.Name())
	codePair := helper.SetupTestServer(t)
	user, accessToken, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())
	baseURL := codePair.ServerAddr()
	mongo, _ := mongodb.Dial()
	db := mongo.Database(conf.Mongo.DatabaseName)
	defer func() {
		mongo.Disconnect(context.Background())
	}()

	teardown := func() {
		ctx := context.Background()
		db.Collection(mongodb.ColWorkspace).DeleteMany(ctx, bson.M{})
		db.Collection(mongodb.ColUserWorkspace).DeleteMany(ctx, bson.M{})
	}

	t.Run("create workspace with valid data", func(t *testing.T) {
		defer teardown()
		u := baseURL + "/workspaces"
		reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: "test"})
		assert.NoError(t, err)

		status, _ := helper.DoRequest(t, http.MethodPost, u, accessToken, reqBody)
		assert.Equal(t, http.StatusCreated, status)
	})

	t.Run("create workspace with same title", func(t *testing.T) {
		defer teardown()
		u := baseURL + "/workspaces"
		reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: "test"})
		assert.NoError(t, err)

		status, _ := helper.DoRequest(t, http.MethodPost, u, accessToken, reqBody)
		assert.Equal(t, http.StatusCreated, status)

		status, _ = helper.DoRequest(t, http.MethodPost, u, accessToken, reqBody)
		assert.Equal(t, http.StatusInternalServerError, status)
	})

	t.Run("create workspace with user nickname conflict", func(t *testing.T) {
		defer teardown()
		u := baseURL + "/workspaces"
		reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: user.Nickname})
		assert.NoError(t, err)

		status, _ := helper.DoRequest(t, http.MethodPost, u, accessToken, reqBody)
		assert.Equal(t, http.StatusInternalServerError, status)
	})

	t.Run("find workspace by slug", func(t *testing.T) {
		defer teardown()

		u := baseURL + "/workspaces"
		reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: "test"})
		assert.NoError(t, err)

		status, _ := helper.DoRequest(t, http.MethodPost, u, accessToken, reqBody)
		assert.Equal(t, http.StatusCreated, status)

		u = baseURL + "/workspaces/test"
		status, body := helper.DoRequest(t, http.MethodGet, u, accessToken, nil)
		assert.Equal(t, http.StatusOK, status)

		var workspace models.WorkspaceDomain
		err = json.Unmarshal(body, &workspace)
		assert.NoError(t, err)
		assert.Equal(t, "test", workspace.Title)
	})

	t.Run("find non-exist workspace", func(t *testing.T) {
		defer teardown()

		u := baseURL + "/workspaces/nonexist"
		status, _ := helper.DoRequest(t, http.MethodGet, u, accessToken, nil)
		assert.Equal(t, http.StatusNotFound, status)
	})

	t.Run("find workspaces", func(t *testing.T) {
		defer teardown()

		const cursorSize = 5
		const cursorMultiple = 4
		const margin = 2
		const totalWorkspaces = cursorSize*cursorMultiple + margin

		testTitle := func(i int) string {
			return "test" + strconv.Itoa(i)
		}

		for i := range totalWorkspaces {
			u := baseURL + "/workspaces"
			reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: testTitle(i)})
			assert.NoError(t, err)

			status, _ := helper.DoRequest(t, http.MethodPost, u, accessToken, reqBody)
			assert.Equal(t, http.StatusCreated, status)
		}

		prevCursor := ""
		for range cursorMultiple {
			v := url.Values{}
			v.Set("page_size", strconv.Itoa(cursorSize))
			v.Set("cursor", prevCursor)
			u := baseURL + "/workspaces?" + v.Encode()

			status, body := helper.DoRequest(t, http.MethodGet, u, accessToken, nil)
			assert.Equal(t, http.StatusOK, status)

			var res models.FindWorkspacesResponse
			err := json.Unmarshal(body, &res)
			assert.NoError(t, err)
			assert.Len(t, res.Workspaces, cursorSize)
			if len(res.Workspaces) > 0 {
				assert.Equal(t, res.Cursor, res.Workspaces[len(res.Workspaces)-1].Id)
			}
			prevCursor = res.Cursor
		}
	})
}

// TestInviteWorkspace tests the invitation functionality for workspaces.
func TestInviteWorkspace(t *testing.T) {
	t.Run("create invite token with valid workspace", func(t *testing.T) {
		// Implement test logic here
	})

	t.Run("create invite token with invalid workspace", func(t *testing.T) {
		// Implement test logic here
	})

	t.Run("join workspace with valid invite token", func(t *testing.T) {
		// Implement test logic here
	})

	t.Run("join workspace with invalid invite token", func(t *testing.T) {
		// Implement test logic here
	})
}
