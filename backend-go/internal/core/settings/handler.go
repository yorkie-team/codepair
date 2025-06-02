package settings

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/config"
)

type Handler struct {
}

func (h *Handler) getSettings(c echo.Context) error {
	cfg := config.GetConfig()
	return c.JSON(http.StatusOK, models.FindSettingsResponse{
		YorkieIntelligence: models.YorkieIntelligenceConfig{
			Enable: cfg.Yorkie.Intelligence != "",
			Config: models.YorkieIntelligenceConfigConfig{
				Features: generateFeatureList(cfg),
			},
		},
		FileUpload: models.FileUploadConfig{
			Enable: cfg.Storage.Provider != "",
		},
	})
}

func generateIconUrl(baseURL, icon string) string {
	return fmt.Sprintf("%s/yorkie_intelligence/%s", baseURL, icon)
}

func generateFeatureList(cfg *config.Config) []models.YorkieIntelligenceConfigConfigFeaturesInner {
	return []models.YorkieIntelligenceConfigConfigFeaturesInner{
		{
			Title:   "Write GitHub Issue",
			Icon:    generateIconUrl(cfg.OAuth.FrontendBaseURL, "github.svg"),
			Feature: "github-issue",
		},
		{
			Title:   "Write GitHub Pull Request",
			Icon:    generateIconUrl(cfg.OAuth.FrontendBaseURL, "github.svg"),
			Feature: "github-pr",
		},
		{
			Title:   "Write Document",
			Icon:    generateIconUrl(cfg.OAuth.FrontendBaseURL, "document.svg"),
			Feature: "document-writing",
		},
		{
			Title:   "Summarize",
			Icon:    generateIconUrl(cfg.OAuth.FrontendBaseURL, "document.svg"),
			Feature: "summarize",
		},
	}
}
