package workspace

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/yorkie-team/codepair/backend/internal/infra/database"

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
	ctx := c.Request().Context()
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	var req models.CreateWorkspaceRequest
	if err = c.Bind(&req); err != nil {
		return middleware.NewError(http.StatusBadRequest, err.Error())
	}

	_, err = h.workspaceRepository.CreateWorkspace(ctx, payload.Subject, req.Title)
	if err != nil {
		if errors.Is(err, database.ErrDuplicatedKey) || errors.Is(err, database.ErrWorkspaceNameConflict) {
			return middleware.NewError(http.StatusConflict, "workspace already exists")
		}
		return middleware.NewError(http.StatusInternalServerError, "server internal error", err)
	}

	return c.NoContent(http.StatusCreated)
}

func (h *Handler) findWorkspaceBySlug(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	ctx := c.Request().Context()
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	slug := c.Param("workspace_slug")

	workspace, err := h.workspaceRepository.FindWorkspaceBySlug(ctx, payload.Subject, slug)
	if err != nil {
		if errors.Is(err, database.ErrWorkspaceNotFound) || errors.Is(err, database.ErrUserWorkspaceNotFound) {
			return c.NoContent(http.StatusNotFound)
		}
		return middleware.NewError(http.StatusInternalServerError, "find workspace by slug", err)
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
	ctx := c.Request().Context()
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	pageSizeParam := c.QueryParam("page_size")
	if pageSizeParam == "" {
		pageSizeParam = defaultPageSize
	}
	pageSize, err := strconv.Atoi(pageSizeParam)
	if pageSize <= 0 {
		return middleware.NewError(http.StatusBadRequest, "page_size must be a positive integer")
	}
	if err != nil {
		return middleware.NewError(http.StatusBadRequest, "invalid page_size parameter")
	}
	cursor := c.QueryParam("cursor")

	workspaces, err := h.workspaceRepository.FindWorkspacesOfUser(ctx, payload.Subject, cursor, pageSize)
	if err != nil {
		return middleware.NewError(http.StatusInternalServerError, "find workspaces of user", err)
	}

	domainWorkspaces := make([]models.WorkspaceDomain, len(workspaces))
	for i, workspace := range workspaces {
		domainWorkspaces[i] = models.WorkspaceDomain{
			Id:        workspace.ID.String(),
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
	ctx := c.Request().Context()
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	workspaceID := c.Param("workspace_id")

	var req models.CreateInvitationTokenRequest
	if err = c.Bind(&req); err != nil {
		return middleware.NewError(http.StatusBadRequest, err.Error())
	}

	if req.ExpiredAt.IsZero() {
		req.ExpiredAt = time.Now().Add(100 * 365 * 24 * time.Hour)
	}

	token, err := h.workspaceRepository.CreateInvitationToken(ctx, payload.Subject, workspaceID, req.ExpiredAt)
	if err != nil {
		return middleware.NewError(http.StatusInternalServerError, "create invitation token", err)
	}

	return c.JSON(http.StatusOK, models.CreateInvitationTokenResponse{
		InvitationToken: token.Token,
	})
}

func (h *Handler) joinWorkspace(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	ctx := c.Request().Context()
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	var req models.JoinWorkspaceRequest
	if err = c.Bind(&req); err != nil {
		return middleware.NewError(http.StatusBadRequest, err.Error())
	}

	if err = h.workspaceRepository.JoinWorkspace(ctx, payload.Subject, req.InvitationToken); err != nil {
		if errors.Is(err, database.ErrWorkspaceInvitationNotFound) {
			return c.NoContent(http.StatusNotFound)
		} else if errors.Is(err, database.ErrWorkspaceInvitationExpired) {
			return middleware.NewError(http.StatusGone, "invitation expired")
		} else if errors.Is(err, database.ErrDuplicatedKey) {
			return middleware.NewError(http.StatusConflict, "already a member")
		}
		return middleware.NewError(http.StatusInternalServerError, "join workspace", err)
	}

	return c.NoContent(http.StatusOK)
}
