package entity

import "time"

type Role string

const (
	RoleOwner  Role = "owner"
	RoleMember Role = "member"
)

type UserWorkspace struct {
	ID          ID        `bson:"_id"`
	UserID      ID        `bson:"user_id"`
	Role        Role      `bson:"role"`
	WorkspaceID ID        `bson:"workspace_id"`
	CreatedAt   time.Time `bson:"created_at"`
	UpdatedAt   time.Time `bson:"updated_at"`
}
