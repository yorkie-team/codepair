package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/yorkie-team/codepair/backend-go/internal/api/middleware"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
	"github.com/yorkie-team/codepair/backend-go/internal/services"
)

type IntelligenceHandler struct {
	intelligenceService *services.IntelligenceService
}

func NewIntelligenceHandler(intelligenceService *services.IntelligenceService) *IntelligenceHandler {
	return &IntelligenceHandler{
		intelligenceService: intelligenceService,
	}
}

func (h *IntelligenceHandler) RunFeature(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	feature := models.Feature(vars["feature"])

	var req models.RunFeatureRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user := r.Context().Value(middleware.AuthUserContextKey).(*models.AuthorizedUser)

	// Set up streaming response
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	streamCallback := func(chunk string) {
		_, err := w.Write([]byte(chunk))
		if err != nil {
			return
		}
		flusher.Flush()
	}

	err := h.intelligenceService.RunFeature(user.ID, feature, req, streamCallback)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (h *IntelligenceHandler) RunFollowUp(w http.ResponseWriter, r *http.Request) {
	var req models.RunFollowUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user := r.Context().Value(middleware.AuthUserContextKey).(*models.AuthorizedUser)

	// Set up streaming response
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	streamCallback := func(chunk string) {
		_, err := w.Write([]byte(chunk))
		if err != nil {
			return
		}
		flusher.Flush()
	}

	err := h.intelligenceService.RunFollowUp(user.ID, req, streamCallback)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
