package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/yorkie-team/codepair/backend-go/internal/api/middleware"
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

func (h *WorkspaceHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateWorkspaceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user := r.Context().Value(middleware.AuthUserContextKey).(*models.AuthorizedUser)
	workspace, err := h.workspaceService.Create(user.ID, req.Title)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workspace)
}

func (h *WorkspaceHandler) FindMany(w http.ResponseWriter, r *http.Request) {
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))
	if pageSize == 0 {
		pageSize = 10
	}
	cursor := r.URL.Query().Get("cursor")

	user := r.Context().Value(middleware.AuthUserContextKey).(*models.AuthorizedUser)
	response, err := h.workspaceService.FindMany(user.ID, pageSize, cursor)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *WorkspaceHandler) CreateInvitationToken(w http.ResponseWriter, r *http.Request) {
	var req models.CreateInvitationTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	vars := mux.Vars(r)
	workspaceID := vars["workspace_id"]
	user := r.Context().Value(middleware.AuthUserContextKey).(*models.AuthorizedUser)

	response, err := h.workspaceService.CreateInvitationToken(user.ID, workspaceID, req.ExpiredAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
