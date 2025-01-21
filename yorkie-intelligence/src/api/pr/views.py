from fastapi import APIRouter

router = APIRouter()


@router.get("/pr")
def get_pr():
    return {"message": "nothin"}
