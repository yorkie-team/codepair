package integration

import (
	"testing"

	"github.com/yorkie-team/codepair/backend/test/helper"
)

func TestGithubAuth(t *testing.T) {
	conf := helper.NewTestConfig(t.Name())
	codePair := helper.SetupTestServer(t, conf)

	t.Run("login with github", func(t *testing.T) {
		helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())
	})

	t.Run("login with github with multiple time", func(t *testing.T) {
		helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())
		helper.LoginUserTestGithub(t, t.Name(), codePair.ServerAddr())
	})
}
