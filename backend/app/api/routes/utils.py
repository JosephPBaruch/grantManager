from fastapi import APIRouter

router = APIRouter(prefix="/utils", tags=["utils"])

@router.get("/health-check")
async def health_check():
    """
    Check if the server is running.
    """
    return {"status": "ok"}

