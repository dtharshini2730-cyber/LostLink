from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Evidence, LostItem
from app.schemas.schemas import EvidenceResponse

router = APIRouter(prefix="/evidence", tags=["Evidence Chain"])

@router.get("/{lost_id}", response_model=List[EvidenceResponse])
def get_evidence_for_item(lost_id: int, db: Session = Depends(get_db)):
    evidence_list = (
        db.query(Evidence)
        .filter(Evidence.lost_item_id == lost_id)
        .order_by(Evidence.sequence_order.asc(), Evidence.timestamp.asc())
        .all()
    )
    return evidence_list

@router.post("", response_model=EvidenceResponse)
def add_custom_evidence(
    lost_item_id: int,
    evidence_type: str,
    location: str,
    description: str,
    confidence: float = 90.0,
    latitude: float = None,
    longitude: float = None,
    db: Session = Depends(get_db)
):
    lost_item = db.query(LostItem).filter(LostItem.id == lost_item_id).first()
    if not lost_item:
        raise HTTPException(status_code=404, detail="Lost item not found")

    ev = Evidence(
        lost_item_id=lost_item_id,
        evidence_type=evidence_type,
        timestamp=datetime.utcnow(),
        location=location,
        latitude=latitude or lost_item.latitude,
        longitude=longitude or lost_item.longitude,
        description=description,
        confidence=confidence,
        sequence_order=3
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev
