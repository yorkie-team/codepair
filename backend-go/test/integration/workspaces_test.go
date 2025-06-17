package integration

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/internal/infra/database/mongodb"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/test/helper"
)

// TestFindAndCreateWorkspace tests the functionality of finding and creating workspaces.
func TestFindAndCreateWorkspace(t *testing.T) {
	conf := helper.NewTestConfig(t.Name())
	codePair := helper.SetupTestServer(t)
	baseURL := codePair.ServerAddr()
	mongo, _ := mongodb.Dial()
	db := mongo.Database(conf.Mongo.DatabaseName)
	defer func() {
		err := mongo.Disconnect(context.Background())
		assert.NoError(t, err)
	}()

	t.Run("create workspace with valid data", func(t *testing.T) {
		defer helper.ClearCollections(t, db)
		_, accessToken, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())

		u := baseURL + "/workspaces"
		reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: "test"})
		assert.NoError(t, err)

		status, _ := helper.DoRequest(t, http.MethodPost, u, accessToken, reqBody)
		assert.Equal(t, http.StatusCreated, status)
	})

	t.Run("create workspace with same title", func(t *testing.T) {
		defer helper.ClearCollections(t, db)
		_, accessToken, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())

		u := baseURL + "/workspaces"
		reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: "test"})
		assert.NoError(t, err)

		status, _ := helper.DoRequest(t, http.MethodPost, u, accessToken, reqBody)
		assert.Equal(t, http.StatusCreated, status)

		status, _ = helper.DoRequest(t, http.MethodPost, u, accessToken, reqBody)
		assert.Equal(t, http.StatusConflict, status)
	})

	t.Run("create workspace with user nickname conflict", func(t *testing.T) {
		defer helper.ClearCollections(t, db)
		user, accessToken, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())

		u := baseURL + "/workspaces"
		reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: user.Nickname})
		assert.NoError(t, err)

		status, _ := helper.DoRequest(t, http.MethodPost, u, accessToken, reqBody)
		assert.Equal(t, http.StatusConflict, status)
	})

	t.Run("find workspace by slug", func(t *testing.T) {
		defer helper.ClearCollections(t, db)
		_, accessToken, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())

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
		defer helper.ClearCollections(t, db)
		_, accessToken, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())

		u := baseURL + "/workspaces/nonexist"
		status, _ := helper.DoRequest(t, http.MethodGet, u, accessToken, nil)
		assert.Equal(t, http.StatusNotFound, status)
	})

	t.Run("find workspaces", func(t *testing.T) {
		defer helper.ClearCollections(t, db)
		_, accessToken, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())

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
	conf := helper.NewTestConfig(t.Name())
	codePair := helper.SetupTestServer(t)
	baseURL := codePair.ServerAddr()
	mongo, _ := mongodb.Dial()
	db := mongo.Database(conf.Mongo.DatabaseName)
	defer func() {
		err := mongo.Disconnect(context.Background())
		assert.NoError(t, err)
	}()

	t.Run("create invite token and join with valid workspace", func(t *testing.T) {
		defer helper.ClearCollections(t, db)

		// 01. Create two users: owner and joiner
		_, ownerToken, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())
		_, joinerToken, _ := helper.LoginUserTestGithub(t, t.Name()+"-joiner", codePair.ServerAddr())

		// 02. Create a workspace with the owner
		const workspaceTitle = "test"
		reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: workspaceTitle})
		assert.NoError(t, err)

		u := baseURL + "/workspaces"
		status, _ := helper.DoRequest(t, http.MethodPost, u, ownerToken, reqBody)
		assert.Equal(t, http.StatusCreated, status)

		// 03. Owner find workspace
		u = baseURL + "/workspaces"
		status, body := helper.DoRequest(t, http.MethodGet, u, ownerToken, nil)
		assert.Equal(t, http.StatusOK, status)
		var workspace models.FindWorkspacesResponse
		assert.NoError(t, json.Unmarshal(body, &workspace))
		assert.Len(t, workspace.Workspaces, 1)
		assert.Equal(t, workspaceTitle, workspace.Workspaces[0].Title)
		slug := workspace.Workspaces[0].Slug
		wid := workspace.Workspaces[0].Id

		// 04. Joiner find workspace by slug but not joined yet
		u = baseURL + "/workspaces"
		status, body = helper.DoRequest(t, http.MethodGet, u, joinerToken, nil)
		assert.Equal(t, http.StatusOK, status)
		assert.NoError(t, json.Unmarshal(body, &workspace))
		assert.Len(t, workspace.Workspaces, 0)

		u = fmt.Sprintf("%s/workspaces/%s", baseURL, slug)
		status, _ = helper.DoRequest(t, http.MethodGet, u, joinerToken, nil)
		assert.Equal(t, http.StatusNotFound, status)

		// 05. Create an invitation token for the workspace
		u = fmt.Sprintf("%s/workspaces/%s/invite-token", baseURL, wid)
		status, body = helper.DoRequest(t, http.MethodPost, u, ownerToken, nil)
		assert.Equal(t, http.StatusOK, status)

		var inviteToken models.CreateInvitationTokenResponse
		assert.NoError(t, json.Unmarshal(body, &inviteToken))
		assert.NotEmpty(t, inviteToken.InvitationToken)

		// 06. Joiner joins the workspace with the invitation token
		u = baseURL + "/workspaces/join"
		reqBody, err = json.Marshal(models.JoinWorkspaceRequest{InvitationToken: inviteToken.InvitationToken})
		assert.NoError(t, err)
		status, _ = helper.DoRequest(t, http.MethodPost, u, joinerToken, reqBody)
		assert.Equal(t, http.StatusOK, status)

		// 07. Joiner finds the workspace by slug
		u = fmt.Sprintf("%s/workspaces/%s", baseURL, slug)
		status, body = helper.DoRequest(t, http.MethodGet, u, joinerToken, nil)
		assert.Equal(t, http.StatusOK, status)
		var joinedWorkspace models.WorkspaceDomain
		assert.NoError(t, json.Unmarshal(body, &joinedWorkspace))
		assert.Equal(t, workspaceTitle, joinedWorkspace.Title)
		assert.Equal(t, slug, joinedWorkspace.Slug)

		u = fmt.Sprintf("%s/workspaces/%s", baseURL, slug)
		status, body = helper.DoRequest(t, http.MethodGet, u, joinerToken, nil)
		assert.Equal(t, http.StatusOK, status)
		var joinedWorkspaces models.WorkspaceDomain
		assert.NoError(t, json.Unmarshal(body, &joinedWorkspaces))
		assert.Equal(t, workspaceTitle, joinedWorkspaces.Title)
		assert.Equal(t, slug, joinedWorkspaces.Slug)
	})
}
