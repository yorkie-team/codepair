package workspace

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/api/codepair/v1/models"
	"github.com/yorkie-team/codepair/backend/internal/jwt"
	"github.com/yorkie-team/codepair/backend/internal/middleware"
)

const (
	defaultPageSize = "10"
)

type Handler struct {
	workspaceRepository Repository
}

func (h *Handler) createWorkspace(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	var req models.CreateWorkspaceRequest
	if err = c.Bind(&req); err != nil {
		return middleware.NewError(http.StatusBadRequest, err.Error())
	}

	_, err = h.workspaceRepository.CreateWorkspace(payload.Subject, req.Title)
	if err != nil {
		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	return c.NoContent(http.StatusCreated)
}

func (h *Handler) findWorkspaceBySlug(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	slug := c.Param("workspace_slug")

	workspace, err := h.workspaceRepository.FindWorkspaceBySlug(payload.Subject, slug)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, models.WorkspaceDomain{
		Id:        string(workspace.ID),
		Title:     workspace.Title,
		Slug:      workspace.Slug,
		CreatedAt: workspace.CreatedAt,
		UpdatedAt: workspace.UpdatedAt,
	})
}

func (h *Handler) findWorkspaces(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	if c.QueryParam("page_size") == "" {
		c.QueryParams().Set("page_size", defaultPageSize)
	}
	pageSize, err := strconv.Atoi(c.QueryParam("page_size"))
	if err != nil {
		return middleware.NewError(http.StatusBadRequest, "invalid page_size parameter")
	}
	cursor := c.QueryParam("cursor")

	workspaces, err := h.workspaceRepository.FindWorkspacesOfUser(payload.Subject, cursor, pageSize+1)
	if err != nil {
		return err
	}

	domainWorkspaces := make([]models.WorkspaceDomain, len(workspaces))
	for i, workspace := range workspaces {
		domainWorkspaces[i] = models.WorkspaceDomain{
			Id:        string(workspace.ID),
			Title:     workspace.Title,
			Slug:      workspace.Slug,
			CreatedAt: workspace.CreatedAt,
			UpdatedAt: workspace.UpdatedAt,
		}
	}

	var returnCursor string
	if pageSize > len(domainWorkspaces) {
		returnCursor = ""
	} else {
		returnCursor = workspaces[len(workspaces)-1].ID.String()
	}

	return c.JSON(http.StatusOK, &models.FindWorkspacesResponse{
		Workspaces: domainWorkspaces,
		Cursor:     returnCursor,
	})
}

func (h *Handler) createInviteToken(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	workspaceID := c.Param("workspace_id")

	var req models.CreateInvitationTokenRequest
	if err = c.Bind(&req); err != nil {
		return middleware.NewError(http.StatusBadRequest, err.Error())
	}

	token, err := h.workspaceRepository.CreateInvitationToken(payload.Subject, workspaceID, req.ExpiredAt)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, models.CreateInvitationTokenResponse{
		InvitationToken: token.Token,
	})
}

func (h *Handler) joinWorkspace(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	var req models.JoinWorkspaceRequest
	if err = c.Bind(&req); err != nil {
		return middleware.NewError(http.StatusBadRequest, err.Error())
	}

	if err = h.workspaceRepository.JoinWorkspace(payload.Subject, req.InvitationToken); err != nil {
		return err
	}

	return c.NoContent(http.StatusOK)
}
