import os
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import WitnessReport, LostItem, Evidence, Notification, User
from app.schemas.schemas import WitnessReportResponse
from app.auth.deps import get_current_user
from app.config import settings
from app.ai.preprocessing import AIPreprocessor

router = APIRouter(prefix="/witness", tags=["Witness Reports"])

@router.post("", response_model=WitnessReportResponse)
async def create_witness_report(
    description: str = Form(...),
    date_time: str = Form(...),
    location_name: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    transport_type: str = Form(...),
    vehicle_number: Optional[str] = Form(None),
    coach_number: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    linked_lost_item_id: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = user.id if user else 2

    image_path_str = None
    if image and image.filename:
        file_ext = os.path.splitext(image.filename)[1]
        unique_filename = f"witness_{uuid.uuid4().hex[:12]}{file_ext}"
        save_path = settings.UPLOAD_PATH / unique_filename
        
        contents = await image.read()
        with open(save_path, "wb") as f:
            f.write(contents)
            
        image_path_str = f"/uploads/{unique_filename}"

    try:
        dt = datetime.fromisoformat(date_time.replace("Z", "+00:00"))
    except Exception:
        dt = datetime.utcnow()

    # If linked_lost_item_id is not specified, try to correlate against active lost items
    target_lost_id = linked_lost_item_id
    if not target_lost_id:
        # Match by vehicle number or description tokens
        candidates = db.query(LostItem).filter(
            LostItem.status.in_(["NEW", "ANALYZING", "MATCH_FOUND", "VERIFICATION_REQUIRED"])
        ).all()
        
        best_cand_id = None
        best_cand_score = 0.0
        w_p = AIPreprocessor.preprocess_text(description)
        
        for cand in candidates:
            score = 0.0
            if cand.vehicle_number and vehicle_number and cand.vehicle_number.lower() in vehicle_number.lower():
                score += 50.0
            c_p = AIPreprocessor.preprocess_text(f"{cand.title} {cand.description}")
            common = set(w_p["tokens"]).intersection(set(c_p["tokens"]))
            score += len(common) * 15.0
            
            if score > best_cand_score and score >= 30.0:
                best_cand_score = score
                best_cand_id = cand.id
        
        target_lost_id = best_cand_id

    witness_report = WitnessReport(
        user_id=user_id,
        image_path=image_path_str or "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
        description=description,
        date_time=dt,
        latitude=latitude or 11.1085,
        longitude=longitude or 77.3411,
        location_name=location_name,
        transport_type=transport_type,
        vehicle_number=vehicle_number,
        coach_number=coach_number,
        notes=notes,
        linked_lost_item_id=target_lost_id,
        confidence_hint=90.0 if target_lost_id else 75.0
    )
    db.add(witness_report)
    db.commit()
    db.refresh(witness_report)

    # If connected to a lost item, add evidence record & notify owner
    if target_lost_id:
        lost_item = db.query(LostItem).filter(LostItem.id == target_lost_id).first()
        if lost_item:
            ev = Evidence(
                lost_item_id=target_lost_id,
                evidence_type="WITNESS_OBSERVATION",
                source_id=f"WIT-{witness_report.id}",
                timestamp=dt,
                location=location_name,
                latitude=witness_report.latitude,
                longitude=witness_report.longitude,
                description=f"Passenger observed matching item: {description} (Vehicle: {vehicle_number or 'Transit'}, Coach: {coach_number or 'N/A'})",
                confidence=witness_report.confidence_hint,
                image_url=witness_report.image_path,
                sequence_order=2
            )
            db.add(ev)

            notif = Notification(
                user_id=lost_item.user_id,
                title="New Witness Observation Added!",
                message=f"A passenger reported sighting your item at {location_name}.",
                type="WITNESS_ADDED",
                link_url=f"/journey/{lost_item.id}"
            )
            db.add(notif)
            db.commit()

    return witness_report

@router.get("", response_model=List[WitnessReportResponse])
def get_witness_reports(
    transport_type: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(WitnessReport)
    if transport_type:
        q = q.filter(WitnessReport.transport_type.ilike(f"%{transport_type}%"))
    if query:
        q = q.filter(
            (WitnessReport.description.ilike(f"%{query}%")) |
            (WitnessReport.location_name.ilike(f"%{query}%")) |
            (WitnessReport.vehicle_number.ilike(f"%{query}%"))
        )
    return q.order_by(WitnessReport.created_at.desc()).all()

@router.get("/{id}", response_model=WitnessReportResponse)
def get_witness_report(id: int, db: Session = Depends(get_db)):
    report = db.query(WitnessReport).filter(WitnessReport.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Witness report not found")
    return report
