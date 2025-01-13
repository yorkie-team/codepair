package auth

import (
	"github.com/yorkie-team/codepair/backend-go/internal/domain/auth/dto"
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

func NewHandler(authService *Service) *Handler {
	return &Handler{
		service: authService,
	}
}

func (h *Handler) GithubLogin(c echo.Context) error {
	url := h.service.GetGithubAuthURL()
	return c.Redirect(http.StatusTemporaryRedirect, url)
}

func (h *Handler) GithubCallback(c echo.Context) error {
	code := c.QueryParam("code")
	if code == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "missing code parameter")
	}

	tokens, err := h.service.HandleGithubCallback(code)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, tokens)
}

func (h *Handler) RefreshToken(c echo.Context) error {
	var req dto.RefreshTokenRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	tokens, err := h.service.RefreshToken(req.RefreshToken)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	return c.JSON(http.StatusOK, tokens)
}
