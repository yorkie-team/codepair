package integration

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/infra/database/mongodb"
	"github.com/yorkie-team/codepair/backend/test/helper"
)

func TestFindWorkspaceUsers(t *testing.T) {
	conf := helper.NewTestConfig(t.Name())
	codePair := helper.SetupTestServer(t)
	//gen := jwt.NewGenerator(conf.JWT)
	baseURL := codePair.ServerAddr()
	mongo, _ := mongodb.Dial()
	db := mongo.Database(conf.Mongo.DatabaseName)
	defer func() {
		err := mongo.Disconnect(context.Background())
		assert.NoError(t, err)
	}()

	// Setup: Create users and a workspace
	owner, ownerToken, _ := helper.LoginUserTestGithub(t, "owner", baseURL)
	member1, member1Token, _ := helper.LoginUserTestGithub(t, "member1", baseURL)
	member2, member2Token, _ := helper.LoginUserTestGithub(t, "member2", baseURL)
	_, nonMemberToken, _ := helper.LoginUserTestGithub(t, "nonMember", baseURL)

	// Owner creates a workspace
	const workspaceTitle = "test-workspace"
	reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: workspaceTitle})
	assert.NoError(t, err)

	status, _ := helper.DoRequest(t, http.MethodPost, baseURL+"/workspaces", ownerToken, reqBody)
	assert.Equal(t, http.StatusCreated, status)

	status, workspaceBody := helper.DoRequest(t, http.MethodGet, baseURL+"/workspaces", ownerToken, nil)
	assert.Equal(t, http.StatusOK, status)

	var workspace models.FindWorkspacesResponse
	assert.NoError(t, json.Unmarshal(workspaceBody, &workspace))
	assert.Len(t, workspace.Workspaces, 1)
	assert.Equal(t, workspaceTitle, workspace.Workspaces[0].Title)
	wid := workspace.Workspaces[0].Id

	// Owner creates an invitation token
	inviteURL := fmt.Sprintf("%s/workspaces/%s/invite-token", baseURL, wid)
	status, tokenBody := helper.DoRequest(t, http.MethodPost, inviteURL, ownerToken, nil)
	assert.Equal(t, http.StatusOK, status)

	var inviteToken models.CreateInvitationTokenResponse
	assert.NoError(t, json.Unmarshal(tokenBody, &inviteToken))

	// Members join the workspace
	joinURL := baseURL + "/workspaces" + "/join"
	reqBody, err = json.Marshal(models.JoinWorkspaceRequest{InvitationToken: inviteToken.InvitationToken})
	assert.NoError(t, err)
	status, _ = helper.DoRequest(t, http.MethodPost, joinURL, member1Token, reqBody)
	assert.Equal(t, http.StatusOK, status)
	status, _ = helper.DoRequest(t, http.MethodPost, joinURL, member2Token, reqBody)
	assert.Equal(t, http.StatusOK, status)

	// Endpoint to test
	findUsersURL := fmt.Sprintf("%s/workspaces/%s/users", baseURL, wid)

	t.Run("find workspace users successfully", func(t *testing.T) {
		defer helper.ClearCollections(t, db)
		status, body := helper.DoRequest(t, http.MethodGet, findUsersURL, ownerToken, nil)
		assert.Equal(t, http.StatusOK, status)

		var resp models.FindWorkspaceUsersResponse
		assert.NoError(t, json.Unmarshal(body, &resp))

		assert.Len(t, resp.WorkspaceUsers, 3)
		userNicknames := make(map[string]bool)
		for _, u := range resp.WorkspaceUsers {
			userNicknames[u.Nickname] = true
		}
		assert.True(t, userNicknames[owner.Nickname])
		assert.True(t, userNicknames[member1.Nickname])
		assert.True(t, userNicknames[member2.Nickname])

		// Find workspace users with pagination
		paginatedURL := findUsersURL + "?page_size=2"
		status, body = helper.DoRequest(t, http.MethodGet, paginatedURL, ownerToken, nil)
		assert.Equal(t, http.StatusOK, status)

		var resp1 models.FindWorkspaceUsersResponse
		assert.NoError(t, json.Unmarshal(body, &resp1))
		assert.Len(t, resp1.WorkspaceUsers, 2)
		assert.NotEmpty(t, resp1.Cursor)

		// Second page Request
		paginatedURLWithCursor := fmt.Sprintf("%s?page_size=2&cursor=%s", findUsersURL, resp1.Cursor)
		status, body = helper.DoRequest(t, http.MethodGet, paginatedURLWithCursor, ownerToken, nil)
		assert.Equal(t, http.StatusOK, status)

		var resp2 models.FindWorkspaceUsersResponse
		assert.NoError(t, json.Unmarshal(body, &resp2))
		assert.Len(t, resp2.WorkspaceUsers, 1)
		assert.Empty(t, resp2.Cursor)
	})

	t.Run("fail to find users for a non-existent workspace", func(t *testing.T) {
		defer helper.ClearCollections(t, db)

		nonExistentURL := fmt.Sprintf("%s/workspaces/%s/users", baseURL, "nonexistentworkspaceid")
		status, _ := helper.DoRequest(t, http.MethodGet, nonExistentURL, ownerToken, nil)
		assert.Equal(t, http.StatusNotFound, status)
	})

	t.Run("fail to find users by a non-member", func(t *testing.T) {
		defer helper.ClearCollections(t, db)

		status, _ := helper.DoRequest(t, http.MethodGet, findUsersURL, nonMemberToken, nil)
		assert.Equal(t, http.StatusNotFound, status)
	})
}
