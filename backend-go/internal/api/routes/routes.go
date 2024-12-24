package routes

import (
	"github.com/gorilla/mux"
	"github.com/yorkie-team/codepair/backend-go/internal/api/handlers"
	"github.com/yorkie-team/codepair/backend-go/internal/api/middleware"
	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"github.com/yorkie-team/codepair/backend-go/internal/services"
)

func NewRouter(cfg *config.Config, services *services.Services) *mux.Router {
	r := mux.NewRouter()

	// Apply global middleware
	r.Use(middleware.JWTAuth(cfg.JWTAccessSecret))

	// Auth routes
	auth := handlers.NewAuthHandler(services.UserService, cfg)
	r.HandleFunc("/auth/login/github", auth.GithubLogin).Methods("GET")
	r.HandleFunc("/auth/callback/github", auth.GithubCallback).Methods("GET")
	r.HandleFunc("/auth/refresh", auth.RefreshToken).Methods("POST")

	// Workspace routes
	workspace := handlers.NewWorkspaceHandler(services.WorkspaceService)
	r.HandleFunc("/workspaces", workspace.Create).Methods("POST")
	r.HandleFunc("/workspaces", workspace.FindMany).Methods("GET")
	r.HandleFunc("/workspaces/{workspace_id}/invite-token", workspace.CreateInvitationToken).Methods("POST")

	// Document routes
	document := handlers.NewDocumentHandler(services.DocumentService)
	r.HandleFunc("/documents", document.Create).Methods("POST")
	r.HandleFunc("/documents/{document_id}/title", document.UpdateTitle).Methods("PUT")
	r.HandleFunc("/documents/{document_id}/share-token", document.CreateShareToken).Methods("POST")
	r.HandleFunc("/documents/share", document.FindFromSharingToken).Methods("GET")

	// File routes
	file := handlers.NewFileHandler(services.FileService)
	r.HandleFunc("/files", file.CreateUploadPresignedUrl).Methods("POST")
	r.HandleFunc("/files/{file_name}", file.CreateDownloadPresignedUrl).Methods("GET")
	r.HandleFunc("/files/export-markdown", file.ExportMarkdown).Methods("POST")

	// Intelligence routes
	intelligence := handlers.NewIntelligenceHandler(services.IntelligenceService)
	r.HandleFunc("/intelligence/{feature}", intelligence.RunFeature).Methods("POST")
	r.HandleFunc("/intelligence", intelligence.RunFollowUp).Methods("POST")

	// Settings routes
	settings := handlers.NewSettingsHandler(services.SettingsService)
	r.HandleFunc("/settings", settings.GetSettings).Methods("GET")

	// Check routes
	check := handlers.NewCheckHandler(services.CheckService)
	r.HandleFunc("/check/name-conflict", check.CheckNameConflict).Methods("POST")
	r.HandleFunc("/check/yorkie", check.CheckYorkie).Methods("POST")

	return r
}
