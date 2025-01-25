from fastapi import APIRouter

from src.api.pr.views import router as pr_router

api_router = APIRouter()
api_router.include_router(pr_router, prefix="/pr")
