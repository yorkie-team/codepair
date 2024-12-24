package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/yorkie-team/codepair/backend-go/internal/api/middleware"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
	"github.com/yorkie-team/codepair/backend-go/internal/services"
)

type DocumentHandler struct {
	documentService *services.DocumentService
}

func NewDocumentHandler(documentService *services.DocumentService) *DocumentHandler {
	return &DocumentHandler{
		documentService: documentService,
	}
}

func (h *DocumentHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateDocumentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user := r.Context().Value(middleware.AuthUserContextKey).(*models.AuthorizedUser)
	document, err := h.documentService.Create(user.ID, req.WorkspaceID, req.Title)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(document)
}

func (h *DocumentHandler) UpdateTitle(w http.ResponseWriter, r *http.Request) {
	var req models.UpdateDocumentTitleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	vars := mux.Vars(r)
	documentID := vars["document_id"]
	user := r.Context().Value(middleware.AuthUserContextKey).(*models.AuthorizedUser)

	if err := h.documentService.UpdateTitle(user.ID, documentID, req.Title); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *DocumentHandler) CreateShareToken(w http.ResponseWriter, r *http.Request) {
	var req models.CreateDocumentShareTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	vars := mux.Vars(r)
	documentID := vars["document_id"]
	user := r.Context().Value(middleware.AuthUserContextKey).(*models.AuthorizedUser)

	response, err := h.documentService.CreateShareToken(user.ID, documentID, req.ExpiredAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *DocumentHandler) FindFromSharingToken(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "Missing token parameter", http.StatusBadRequest)
		return
	}

	response, err := h.documentService.FindFromSharingToken(token)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
