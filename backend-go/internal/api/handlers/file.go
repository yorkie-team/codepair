package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/yorkie-team/codepair/backend-go/internal/models"
	"github.com/yorkie-team/codepair/backend-go/internal/services"
)

type FileHandler struct {
	fileService *services.FileService
}

func NewFileHandler(fileService *services.FileService) *FileHandler {
	return &FileHandler{
		fileService: fileService,
	}
}

func (h *FileHandler) CreateUploadPresignedUrl(w http.ResponseWriter, r *http.Request) {
	var req models.CreateUploadPresignedUrlRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	response, err := h.fileService.CreateUploadPresignedUrl(
		req.WorkspaceID,
		req.ContentLength,
		req.ContentType,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *FileHandler) CreateDownloadPresignedUrl(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fileKey := vars["file_name"]

	url, err := h.fileService.CreateDownloadPresignedUrl(fileKey)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, url, http.StatusFound)
}

func (h *FileHandler) ExportMarkdown(w http.ResponseWriter, r *http.Request) {
	var req models.ExportFileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	response, err := h.fileService.ExportMarkdown(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", response.MimeType)
	w.Header().Set("Content-Disposition", "attachment; filename="+response.FileName)
	w.Write(response.FileContent)
}
