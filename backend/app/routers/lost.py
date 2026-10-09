import os
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import LostItem, User, FoundItem, WitnessReport, AIMatch, Evidence, Notification
from app.schemas.schemas import LostItemResponse
from app.auth.deps import get_current_user, require_current_user
from app.config import settings
from app.ai.preprocessing import AIPreprocessor
from app.ai.matching_engine import AIMatchingEngine
import json

router = APIRouter(prefix="/lost", tags=["Lost Items"])

@router.post("", response_model=LostItemResponse)
async def create_lost_item(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    brand: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    unique_features: Optional[str] = Form(None),
    date_time: str = Form(...),
    location_name: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    transport_type: str = Form(...),
    vehicle_number: Optional[str] = Form(None),
    coach_number: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If no logged in user, assign to passenger demo user
    user_id = user.id if user else 1

    image_path_str = None
    img_features = None

    if image and image.filename:
        file_ext = os.path.splitext(image.filename)[1]
        unique_filename = f"lost_{uuid.uuid4().hex[:12]}{file_ext}"
        save_path = settings.UPLOAD_PATH / unique_filename
        
        contents = await image.read()
        with open(save_path, "wb") as f:
            f.write(contents)
            
        image_path_str = f"/uploads/{unique_filename}"
        img_features = AIPreprocessor.preprocess_image(contents)

    # Parse date_time
    try:
        dt = datetime.fromisoformat(date_time.replace("Z", "+00:00"))
    except Exception:
        dt = datetime.utcnow()

    new_item = LostItem(
        user_id=user_id,
        title=title,
        description=description,
        category=category,
        brand=brand,
        color=color,
        unique_features=unique_features,
        image_path=image_path_str or "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
        date_time=dt,
        latitude=latitude or 11.0016,
        longitude=longitude or 76.9629,
        location_name=location_name,
        transport_type=transport_type,
        vehicle_number=vehicle_number,
        coach_number=coach_number,
        status="ANALYZING"
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    # Add initial Evidence record
    ev1 = Evidence(
        lost_item_id=new_item.id,
        evidence_type="LOST_REPORT",
        source_id=f"LST-{new_item.id}",
        timestamp=dt,
        location=location_name,
        latitude=new_item.latitude,
        longitude=new_item.longitude,
        description=f"Owner reported lost item '{title}' ({category}) at {location_name}. Details: {description}",
        confidence=100.0,
        image_url=new_item.image_path,
        sequence_order=1
    )
    db.add(ev1)
    db.commit()

    # Search existing witness reports and match found items
    found_items = db.query(FoundItem).all()
    witness_reports = db.query(WitnessReport).all()

    best_match_score = 0.0
    for f in found_items:
        w_linked = [w for w in witness_reports if w.linked_lost_item_id == new_item.id or (w.vehicle_number and w.vehicle_number == new_item.vehicle_number)]
        calc = AIMatchingEngine.compute_full_match(
            lost_item=new_item,
            found_item=f,
            witness_reports=w_linked
        )
        if calc["total_score"] >= 60.0:
            ai_match = AIMatch(
                lost_item_id=new_item.id,
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
            db.add(ai_match)
            if calc["total_score"] > best_match_score:
                best_match_score = calc["total_score"]

    # Update status based on score
    if best_match_score >= 85.0:
        new_item.status = "VERIFICATION_REQUIRED"
        # Notify user
        notif = Notification(
            user_id=user_id,
            title="High Confidence Match Found!",
            message=f"AI detected a {best_match_score}% probable match for your '{new_item.title}'.",
            type="MATCH_FOUND",
            link_url=f"/journey/{new_item.id}"
        )
        db.add(notif)
    elif best_match_score >= 60.0:
        new_item.status = "MATCH_FOUND"
    
    db.commit()
    db.refresh(new_item)

    return new_item

@router.get("", response_model=List[LostItemResponse])
def get_lost_items(
    category: Optional[str] = None,
    transport_type: Optional[str] = None,
    status: Optional[str] = None,
    query: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    q = db.query(LostItem)
    if user_id:
        q = q.filter(LostItem.user_id == user_id)
    if category:
        q = q.filter(LostItem.category.ilike(f"%{category}%"))
    if transport_type:
        q = q.filter(LostItem.transport_type.ilike(f"%{transport_type}%"))
    if status:
        q = q.filter(LostItem.status == status)
    if query:
        q = q.filter(
            (LostItem.title.ilike(f"%{query}%")) |
            (LostItem.description.ilike(f"%{query}%")) |
            (LostItem.location_name.ilike(f"%{query}%")) |
            (LostItem.vehicle_number.ilike(f"%{query}%"))
        )
    return q.order_by(LostItem.created_at.desc()).all()

@router.get("/{id}", response_model=LostItemResponse)
def get_lost_item(id: int, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item report not found")
    return item

@router.put("/{id}/status")
def update_lost_item_status(id: int, status_update: dict, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item report not found")
    item.status = status_update.get("status", item.status)
    db.commit()
    return {"message": "Status updated successfully", "status": item.status}
