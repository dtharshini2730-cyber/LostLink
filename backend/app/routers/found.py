import os
import uuid
import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import FoundItem, LostItem, WitnessReport, AIMatch, User, Evidence, Notification
from app.schemas.schemas import FoundItemResponse
from app.auth.deps import get_current_user
from app.config import settings
from app.ai.preprocessing import AIPreprocessor
from app.ai.matching_engine import AIMatchingEngine

router = APIRouter(prefix="/found", tags=["Found Items"])

@router.post("", response_model=FoundItemResponse)
async def create_found_item(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    brand: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    found_time: str = Form(...),
    location_name: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    transport_type: str = Form(...),
    vehicle_number: Optional[str] = Form(None),
    coach_number: Optional[str] = Form(None),
    depot_station: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    staff_id = user.id if user else 3

    image_path_str = None
    img_features = None

    if image and image.filename:
        file_ext = os.path.splitext(image.filename)[1]
        unique_filename = f"found_{uuid.uuid4().hex[:12]}{file_ext}"
        save_path = settings.UPLOAD_PATH / unique_filename
        
        contents = await image.read()
        with open(save_path, "wb") as f:
            f.write(contents)
            
        image_path_str = f"/uploads/{unique_filename}"
        img_features = AIPreprocessor.preprocess_image(contents)

    try:
        dt = datetime.fromisoformat(found_time.replace("Z", "+00:00"))
    except Exception:
        dt = datetime.utcnow()

    found_item = FoundItem(
        staff_id=staff_id,
        title=title,
        description=description,
        category=category,
        brand=brand,
        color=color,
        image_path=image_path_str or "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
        found_time=dt,
        latitude=latitude or 11.3410,
        longitude=longitude or 77.7172,
        location_name=location_name,
        transport_type=transport_type,
        vehicle_number=vehicle_number,
        coach_number=coach_number,
        depot_station=depot_station or location_name,
        status="IN_CUSTODY"
    )
    db.add(found_item)
    db.commit()
    db.refresh(found_item)

    # Search existing lost items to compute candidate matches
    lost_items = db.query(LostItem).filter(
        LostItem.status.in_(["NEW", "ANALYZING", "MATCH_FOUND", "VERIFICATION_REQUIRED"])
    ).all()
    witness_reports = db.query(WitnessReport).all()

    for lost in lost_items:
        w_linked = [w for w in witness_reports if w.linked_lost_item_id == lost.id or (w.vehicle_number and w.vehicle_number == lost.vehicle_number)]
        calc = AIMatchingEngine.compute_full_match(
            lost_item=lost,
            found_item=found_item,
            witness_reports=w_linked,
            found_img_features=img_features
        )
        if calc["total_score"] >= 60.0:
            ai_match = AIMatch(
                lost_item_id=lost.id,
                found_item_id=found_item.id,
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
            if calc["total_score"] >= 85.0:
                lost.status = "VERIFICATION_REQUIRED"
                # Add found checkpoint to evidence chain
                ev = Evidence(
                    lost_item_id=lost.id,
                    evidence_type="FOUND_REPORT",
                    source_id=f"FND-{found_item.id}",
                    timestamp=dt,
                    location=location_name,
                    latitude=found_item.latitude,
                    longitude=found_item.longitude,
                    description=f"Secured in custody at {depot_station or location_name}. Found details: {description}",
                    confidence=calc["total_score"],
                    image_url=found_item.image_path,
                    sequence_order=4
                )
                db.add(ev)

                # Send owner notification
                notif = Notification(
                    user_id=lost.user_id,
                    title="Potential Item Found & Secured!",
                    message=f"Staff reported an item matching '{lost.title}' at {location_name}. Match score: {calc['total_score']}%.",
                    type="MATCH_FOUND",
                    link_url=f"/journey/{lost.id}"
                )
                db.add(notif)
            else:
                lost.status = "MATCH_FOUND"

    db.commit()
    return found_item

@router.get("", response_model=List[FoundItemResponse])
def get_found_items(
    category: Optional[str] = None,
    transport_type: Optional[str] = None,
    status: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(FoundItem)
    if category:
        q = q.filter(FoundItem.category.ilike(f"%{category}%"))
    if transport_type:
        q = q.filter(FoundItem.transport_type.ilike(f"%{transport_type}%"))
    if status:
        q = q.filter(FoundItem.status == status)
    if query:
        q = q.filter(
            (FoundItem.title.ilike(f"%{query}%")) |
            (FoundItem.description.ilike(f"%{query}%")) |
            (FoundItem.location_name.ilike(f"%{query}%")) |
            (FoundItem.depot_station.ilike(f"%{query}%"))
        )
    return q.order_by(FoundItem.created_at.desc()).all()

@router.get("/{id}", response_model=FoundItemResponse)
def get_found_item(id: int, db: Session = Depends(get_db)):
    item = db.query(FoundItem).filter(FoundItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Found item report not found")
    return item
