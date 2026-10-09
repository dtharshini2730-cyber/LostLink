import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import LostItem, FoundItem, WitnessReport, AIMatch, Evidence
from app.schemas.schemas import AIMatchResponse
from app.ai.preprocessing import AIPreprocessor
from app.ai.matching_engine import AIMatchingEngine

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/preprocess")
async def preprocess_data(
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    result = {}
    if text:
        result["text_analysis"] = AIPreprocessor.preprocess_text(text)
    if image and image.filename:
        contents = await image.read()
        result["image_analysis"] = AIPreprocessor.preprocess_image(contents)
    return {
        "status": "SUCCESS",
        "pipeline": "LostLink Multimodal Preprocessor (Perceptual Hashing + TF-IDF Vectorizer)",
        "features": result
    }

@router.post("/match/{lost_id}")
def trigger_matching(lost_id: int, db: Session = Depends(get_db)):
    lost_item = db.query(LostItem).filter(LostItem.id == lost_id).first()
    if not lost_item:
        raise HTTPException(status_code=404, detail="Lost item not found")

    found_items = db.query(FoundItem).all()
    witness_reports = db.query(WitnessReport).all()

    # Clear old matches
    db.query(AIMatch).filter(AIMatch.lost_item_id == lost_id).delete()
    
    matches_created = []
    for f in found_items:
        w_linked = [w for w in witness_reports if w.linked_lost_item_id == lost_id or (w.vehicle_number and w.vehicle_number == lost_item.vehicle_number)]
        calc = AIMatchingEngine.compute_full_match(
            lost_item=lost_item,
            found_item=f,
            witness_reports=w_linked
        )
        if calc["total_score"] >= 45.0:
            m = AIMatch(
                lost_item_id=lost_id,
                found_item_id=f.id,
                image_score=calc["image_score"],
                text_score=calc["text_score"],
                time_score=calc["time_score"],
                location_score=calc["location_score"],
                route_score=calc["route_score"],
                witness_score=calc["witness_score"],
                total_score=calc["total_score"],
                confidence_level=calc["confidence_level"],
                explanation=calc["explanation"],
                match_breakdown_json=json.dumps(calc["breakdown"])
            )
            db.add(m)
            matches_created.append(m)

    db.commit()
    return {
        "message": f"Matching completed. {len(matches_created)} candidate matches generated.",
        "matches_count": len(matches_created)
    }

@router.get("/matches/{lost_id}", response_model=List[AIMatchResponse])
def get_matches_for_lost_item(lost_id: int, db: Session = Depends(get_db)):
    matches = (
        db.query(AIMatch)
        .filter(AIMatch.lost_item_id == lost_id)
        .order_by(AIMatch.total_score.desc())
        .all()
    )
    return matches

@router.get("/all-matches", response_model=List[AIMatchResponse])
def get_all_matches(db: Session = Depends(get_db)):
    matches = db.query(AIMatch).order_by(AIMatch.total_score.desc()).all()
    return matches
