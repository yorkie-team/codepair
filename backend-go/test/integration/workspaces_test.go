package integration

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/test/helper"
)

// TestFindAndCreateWorkspace tests the functionality of finding and creating workspaces.
func TestFindAndCreateWorkspace(t *testing.T) {
	_ = helper.NewTestConfig(t.Name())
	codePair := helper.SetupTestServer(t)
	user, accessToken, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())
	baseURL := codePair.ServerAddr()

	t.Run("create workspace with valid data", func(t *testing.T) {
		u := url.URL{}
		u.Host = baseURL
		u.Path = "/workspaces"
		reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: "test"})
		assert.NoError(t, err)

		status, _ := helper.DoRequest(t, http.MethodPost, u.String(), accessToken, reqBody)
		assert.Equal(t, http.StatusCreated, status)
	})

	t.Run("create workspace with same title", func(t *testing.T) {
		u := url.URL{}
		u.Host = baseURL
		u.Path = "/workspaces"
		reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: "test"})
		assert.NoError(t, err)

		status, _ := helper.DoRequest(t, http.MethodPost, u.String(), accessToken, reqBody)
		assert.Equal(t, http.StatusInternalServerError, status)
	})

	t.Run("create workspace with user nickname conflict", func(t *testing.T) {
		u := url.URL{}
		u.Host = baseURL
		u.Path = "/workspaces"
		reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: user.Nickname})
		assert.NoError(t, err)

		status, _ := helper.DoRequest(t, http.MethodPost, u.String(), accessToken, reqBody)
		assert.Equal(t, http.StatusInternalServerError, status)
	})

	t.Run("find workspace by slug", func(t *testing.T) {
		u := url.URL{}
		u.Host = baseURL
		u.Path = "/workspaces/test"

		status, body := helper.DoRequest(t, http.MethodGet, u.String(), accessToken, nil)
		assert.Equal(t, http.StatusOK, status)

		var workspace models.WorkspaceDomain
		err := json.Unmarshal(body, &workspace)
		assert.NoError(t, err)
		assert.Equal(t, "test", workspace.Title)
	})

	t.Run("find non-exist workspace", func(t *testing.T) {
		u := url.URL{}
		u.Host = baseURL
		u.Path = "/workspaces"
		u.Path = "/workspaces/nonexist"

		status, _ := helper.DoRequest(t, http.MethodGet, u.String(), accessToken, nil)
		assert.Equal(t, http.StatusNotFound, status)
	})

	t.Run("find workspaces", func(t *testing.T) {
		const cursorSize = 5
		const cursorMultiple = 4
		const margin = 2
		const totalWorkspaces = cursorSize*cursorMultiple + margin

		testTitle := func(i int) string {
			return "test" + strconv.Itoa(i)
		}

		for i := range totalWorkspaces {
			u := url.URL{}
			u.Host = baseURL
			u.Path = "/workspaces"
			reqBody, err := json.Marshal(models.CreateWorkspaceRequest{Title: testTitle(i)})
			assert.NoError(t, err)

			status, _ := helper.DoRequest(t, http.MethodPost, u.String(), accessToken, reqBody)
			assert.Equal(t, http.StatusCreated, status)
		}

		prevCursor := ""
		for i := range cursorMultiple {
			u := url.URL{}
			u.Host = baseURL
			u.Path = "/workspaces"
			u.Query().Set("page_size", strconv.Itoa(cursorSize))
			u.Query().Set("cursor", prevCursor)

			status, body := helper.DoRequest(t, http.MethodGet, u.String(), accessToken, nil)
			assert.Equal(t, http.StatusOK, status)

			var res models.FindWorkspacesResponse
			err := json.Unmarshal(body, &res)
			assert.NoError(t, err)
			assert.Len(t, res.Workspaces, cursorSize)
			assert.Equal(t, res.Cursor, strconv.Itoa((i+1)*cursorSize))
			prevCursor = res.Cursor
		}

		u := url.URL{}
		u.Host = baseURL
		u.Path = "/workspaces"
		u.Query().Set("page_size", strconv.Itoa(cursorSize))
		u.Query().Set("cursor", strconv.Itoa(cursorMultiple*cursorSize))

	})
}

// TestInviteWorkspace tests the invitation functionality for workspaces.
func TestInviteWorkspace(t *testing.T) {
	//conf := helper.NewTestConfig(t.Name())
	//codePair := helper.SetupTestServer(t)
	//user, access, _ := helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())
	//gen := jwt.NewGenerator(conf.JWT)
	//url := codePair.ServerAddr() + "/workspaces"
	//
	//t.Run("create invite token with valid workspace", func(t *testing.T) {
	//	// Implement test logic here
	//})
	//
	//t.Run("create invite token with invalid workspace", func(t *testing.T) {
	//	// Implement test logic here
	//})
	//
	//t.Run("join workspace with valid invite token", func(t *testing.T) {
	//	// Implement test logic here
	//})
	//
	//t.Run("join workspace with invalid invite token", func(t *testing.T) {
	//	// Implement test logic here
	//})
}
