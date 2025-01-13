package workspace

import (
	"github.com/yorkie-team/codepair/backend-go/internal/domain/workspace/dto"
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	workspaceService *Service
}

func NewHandler(workspaceService *Service) *Handler {
	return &Handler{
		workspaceService: workspaceService,
	}
}

func (h *Handler) Create(c echo.Context) error {
	var req dto.CreateWorkspaceRequest
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

func (h *Handler) List(c echo.Context) error {
	userID := c.Get("userID").(string)
	workspaces, err := h.workspaceService.List(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, workspaces)
}

func (h *Handler) Get(c echo.Context) error {
	workspaceID := c.Param("id")
	userID := c.Get("userID").(string)

	workspace, err := h.workspaceService.Get(workspaceID, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, workspace)
}

func (h *Handler) CreateInvitationToken(c echo.Context) error {
	var req dto.CreateInvitationTokenRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID := c.Get("userID").(string)
	token, err := h.workspaceService.CreateInvitationToken(req.WorkspaceID, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, dto.CreateInvitationTokenResponse{
		InvitationToken: token,
	})
}
