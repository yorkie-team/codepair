package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
	"github.com/yorkie-team/codepair/backend-go/internal/services"
)

type WorkspaceHandler struct {
	workspaceService *services.WorkspaceService
}

func NewWorkspaceHandler(workspaceService *services.WorkspaceService) *WorkspaceHandler {
	return &WorkspaceHandler{
		workspaceService: workspaceService,
	}
}

func (h *WorkspaceHandler) Create(c echo.Context) error {
	var req models.CreateWorkspaceRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID := c.Get("userID").(string)
	workspace, err := h.workspaceService.Create(userID, req.Title)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, workspace)
}

func (h *WorkspaceHandler) List(c echo.Context) error {
	userID := c.Get("userID").(string)
	workspaces, err := h.workspaceService.List(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, workspaces)
}

func (h *WorkspaceHandler) Get(c echo.Context) error {
	workspaceID := c.Param("id")
	userID := c.Get("userID").(string)

	workspace, err := h.workspaceService.Get(workspaceID, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, workspace)
}

func (h *WorkspaceHandler) CreateInvitationToken(c echo.Context) error {
	var req models.CreateInvitationTokenRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID := c.Get("userID").(string)
	token, err := h.workspaceService.CreateInvitationToken(req.WorkspaceID, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, models.CreateInvitationTokenResponse{
		InvitationToken: token,
	})
}
