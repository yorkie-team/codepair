package database

import "errors"

var (
	// ErrDocumentNotFound No matching document found
	ErrDocumentNotFound = errors.New("document not found")

	// ErrUserNotFound No matching user found
	ErrUserNotFound = errors.New("user not found")

	// ErrWorkspaceNameConflict workspace name already exists user nickname or workspace title
	ErrWorkspaceNameConflict = errors.New("workspace name conflicts")

	// ErrUserAlreadyExists user already exists
	ErrUserAlreadyExists = errors.New("user already exists")

	// ErrNicknameConflict user nickname already exists
	ErrNicknameConflict = errors.New("user nickname conflicts")

	// ErrDuplicatedKey Duplicate key error (e.g., unique constraint violation)
	ErrDuplicatedKey = errors.New("duplicate key error")

	// ErrNetwork Network connectivity issue
	ErrNetwork = errors.New("network error")

	// ErrDisconnected Database connection lost
	ErrDisconnected = errors.New("database disconnected")

	// ErrWorkspaceNotFound No matching workspace found
	ErrWorkspaceNotFound = errors.New("workspace not found")
)
