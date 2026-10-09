from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Dict, Any, List
from app.database import get_db
from app.models.models import LostItem, FoundItem, WitnessReport

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("")
def global_search(q: str = Query("", min_length=1), db: Session = Depends(get_db)):
    term = f"%{q.strip()}%"
    
    lost_results = db.query(LostItem).filter(
        or_(
            LostItem.title.ilike(term),
            LostItem.description.ilike(term),
            LostItem.location_name.ilike(term),
            LostItem.vehicle_number.ilike(term),
            LostItem.category.ilike(term),
            LostItem.brand.ilike(term)
        )
    ).limit(8).all()

    found_results = db.query(FoundItem).filter(
        or_(
            FoundItem.title.ilike(term),
            FoundItem.description.ilike(term),
            FoundItem.location_name.ilike(term),
            FoundItem.vehicle_number.ilike(term),
            FoundItem.category.ilike(term),
            FoundItem.brand.ilike(term)
        )
    ).limit(8).all()

    witness_results = db.query(WitnessReport).filter(
        or_(
            WitnessReport.description.ilike(term),
            WitnessReport.location_name.ilike(term),
            WitnessReport.vehicle_number.ilike(term)
        )
    ).limit(8).all()

    return {
        "query": q,
        "total_results": len(lost_results) + len(found_results) + len(witness_results),
        "lost_items": [
            {
                "id": l.id,
                "title": l.title,
                "category": l.category,
                "location": l.location_name,
                "date_time": l.date_time.isoformat(),
                "status": l.status,
                "image_path": l.image_path,
                "type": "LOST_ITEM"
            }
            for l in lost_results
        ],
        "found_items": [
            {
                "id": f.id,
                "title": f.title,
                "category": f.category,
                "location": f.location_name,
                "found_time": f.found_time.isoformat(),
                "status": f.status,
                "image_path": f.image_path,
                "type": "FOUND_ITEM"
            }
            for f in found_results
        ],
        "witness_reports": [
            {
                "id": w.id,
                "description": w.description,
                "location": w.location_name,
                "date_time": w.date_time.isoformat(),
                "transport_type": w.transport_type,
                "vehicle_number": w.vehicle_number,
                "type": "WITNESS_REPORT"
            }
            for w in witness_results
        ]
    }
