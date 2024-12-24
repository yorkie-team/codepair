package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/yorkie-team/codepair/backend-go/internal/models"
	"github.com/yorkie-team/codepair/backend-go/internal/services"
)

type CheckHandler struct {
	checkService *services.CheckService
}

func NewCheckHandler(checkService *services.CheckService) *CheckHandler {
	return &CheckHandler{
		checkService: checkService,
	}
}

func (h *CheckHandler) CheckNameConflict(w http.ResponseWriter, r *http.Request) {
	var req models.CheckNameConflictRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	exists, err := h.checkService.CheckNameConflict(req.Name, req.WorkspaceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.CheckNameConflictResponse{
		Exists: exists,
	})
}

func (h *CheckHandler) CheckYorkie(w http.ResponseWriter, r *http.Request) {
	var req models.CheckYorkieRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	status, err := h.checkService.CheckYorkie(req.DocumentKey)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.CheckYorkieResponse{
		Status: status,
	})
}
