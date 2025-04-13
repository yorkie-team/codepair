package auth

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

type Handler struct {
	service     *Service
	frontendURL string
}

func (h *Handler) githubLogin(c echo.Context) error {
	return c.Redirect(http.StatusTemporaryRedirect, h.service.githubAuthURL())
}

func (h *Handler) githubCallback(c echo.Context) error {
	code := c.QueryParam("code")

	access, refresh, err := h.service.githubCallback(c, code)
	if err != nil {
		return err
	}

	return c.Redirect(http.StatusPermanentRedirect, fmt.Sprintf("%s?accessToken=%s&refreshToken=%s", h.frontendURL, access, refresh))
}

func (h *Handler) refreshToken(c echo.Context) error {
	req := &models.RefreshTokenRequest{}
	if err := c.Bind(req); err != nil {
		return middleware.NewError(http.StatusBadRequest, err.Error())
	}

	access, err := h.service.generateAccessToken(req.RefreshToken)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, models.RefreshTokenResponse{
		NewAccessToken: access,
	})
}
