package workspace

import (
	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/jwt"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
	"net/http"
)

type Handler struct {
	service *Service
}

func (h *Handler) createWorkspace(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}
	req := &models.CreateWorkspaceRequest{}
	if err = c.Bind(req); err != nil {
		return middleware.NewError(http.StatusBadRequest, err.Error())
	}

	if err = h.service.createWorkspace(payload.Subject, req.Title); err != nil {
		return err
	}

	return c.NoContent(http.StatusCreated)
}

func (h *Handler) findWorkspaces(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	cursor := c.QueryParam("cursor")
	page := c.QueryParam("page")

	response, err := h.service.findWorkspaces(payload.Subject, page, cursor)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) findWorkspaceBySlug(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	slug := c.Param("workspace_slug")

	response, err := h.service.findWorkspaceBySlug(payload.Subject, slug)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) createInviteToken(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	req := &models.CreateInvitationTokenRequest{}
	if err = c.Bind(req); err != nil {
		return middleware.NewError(http.StatusBadRequest, err.Error())
	}

	token, err := h.service.createInviteToken(payload.Subject, req.WorkspaceID)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, token)
}

func (h *Handler) joinWorkspace(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	req := &models.JoinWorkspaceRequest{}
	if err = c.Bind(req); err != nil {
		return middleware.NewError(http.StatusBadRequest, err.Error())
	}

	if err = h.service.joinWorkspace(payload.Subject, req.WorkspaceID, req.InviteToken); err != nil {
		return err
	}

	return c.NoContent(http.StatusOK)
}
