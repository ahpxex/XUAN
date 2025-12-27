from fastapi import APIRouter

from app.models.requests import AstrolabeSubmitRequest
from app.models.responses import AstrolabeResponse

router = APIRouter(prefix="/ziwei", tags=["Ziwei"])


@router.post("/astrolabe", response_model=AstrolabeResponse)
async def submit_astrolabe(request: AstrolabeSubmitRequest):
    return AstrolabeResponse(astrolabe=request.astrolabe, report=None)
