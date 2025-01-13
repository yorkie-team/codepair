package user

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

func NewHandler(userService *Service) *Handler {
	return &Handler{
		service: userService,
	}
}

func (h *Handler) GetProfile(c echo.Context) error {
	userID := c.Get("userID").(string)
	user, err := h.service.FindByID(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "user not found")
	}

	return c.JSON(http.StatusOK, user)
}

func (h *Handler) UpdateProfile(c echo.Context) error {
	var req dto.ChangeNicknameRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID := c.Get("userID").(string)
	if err := h.service.ChangeNickname(userID, req.Nickname); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusOK)
}
