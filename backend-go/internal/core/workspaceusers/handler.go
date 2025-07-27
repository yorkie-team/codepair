package workspaceusers

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
	userWorkspaceRepository Repository
}

func (h *Handler) findWorkspaceUsers(c echo.Context) error {
	payload, err := jwt.GetPayload(c)
	if err != nil {
		return middleware.NewError(http.StatusUnauthorized, err.Error())
	}

	workspaceID := c.Param("workspace_id")
	ctx := c.Request().Context()

	_, err = h.userWorkspaceRepository.FindUserWorkspaceByUserID(ctx, payload.Subject, workspaceID)
	if err != nil {
		return middleware.NewError(
			http.StatusNotFound,
			"The workspace does not exist, or the user lacks the appropriate permissions.",
		)
	}

	totalLength, err := h.userWorkspaceRepository.CountUsersByWorkspaceID(ctx, workspaceID)
	if err != nil {
		return middleware.NewError(http.StatusInternalServerError, "count workspace users")
	}

	pageSizeParam := c.QueryParam("page_size")
	if pageSizeParam == "" {
		pageSizeParam = defaultPageSize
	}
	pageSize, err := strconv.Atoi(pageSizeParam)
	if err != nil {
		return middleware.NewError(http.StatusBadRequest, "invalid page_size parameter")
	}
	if pageSize <= 0 {
		return middleware.NewError(http.StatusBadRequest, "page_size must be a positive integer")
	}

	cursor := c.QueryParam("cursor")

	users, err := h.userWorkspaceRepository.FindUsersByWorkspaceID(ctx, workspaceID, cursor, pageSize)
	if err != nil {
		return middleware.NewError(http.StatusInternalServerError, "paginate workspace users")
	}

	domainWorkspaceUsers := make([]models.WorkspaceUserDomain, len(users))
	for i, user := range users {
		domainWorkspaceUsers[i] = models.WorkspaceUserDomain{
			Id:        user.ID.String(),
			Nickname:  user.Nickname,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		}
	}

	if pageSize > len(domainWorkspaceUsers) {
		cursor = ""
	} else {
		cursor = users[len(users)-1].ID.String()
	}

	return c.JSON(http.StatusOK, &models.FindWorkspaceUsersResponse{
		WorkspaceUsers: domainWorkspaceUsers,
		Cursor:         cursor,
		TotalLength:    totalLength,
	})
}
