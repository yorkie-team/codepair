package server

import (
	"github.com/labstack/echo/v4"
	"github.com/yorkie-team/codepair/backend-go/internal/api/routes"
	"github.com/yorkie-team/codepair/backend-go/internal/config"
	"github.com/yorkie-team/codepair/backend-go/internal/database/mongodb"
	"github.com/yorkie-team/codepair/backend-go/internal/domain"
)

type CodePair struct {
	config     *config.Config
	httpServer *echo.Echo
}

func New(c *config.Config) *CodePair {
	db, err := mongodb.New()
	if err != nil {
		panic(err)
	}
	storage,err:=

	services := domain.NewServices(db, c)
	handlers := domain.NewHandlers(services)
	e := echo.New()
	routes.RegisterRoutes(e, handlers)
	return &CodePair{
		config: c,
	}
}

func (c *CodePair) Start() {

}
