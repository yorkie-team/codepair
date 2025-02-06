from fastapi import APIRouter

from src.api.pr import router as pr_router
from src.api.issue import router as issue_router

router = APIRouter()

router.include_router(pr_router, prefix="/pr")
router.include_router(issue_router, prefix="/issue")
