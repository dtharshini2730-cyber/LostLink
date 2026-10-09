from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import JourneyResponse
from app.services.journey_service import JourneyService

router = APIRouter(prefix="/journey", tags=["Journey Reconstruction"])

@router.get("/{lost_id}", response_model=JourneyResponse)
def get_journey_reconstruction(lost_id: int, db: Session = Depends(get_db)):
    journey_data = JourneyService.get_item_journey(db, lost_id)
    if not journey_data:
        raise HTTPException(status_code=404, detail="Journey not found for the specified lost item")
    return journey_data
