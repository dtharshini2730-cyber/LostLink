from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Verification, AIMatch, LostItem, FoundItem, Notification, User
from app.schemas.schemas import VerificationCreate, VerificationResponse
from app.auth.deps import require_staff_user, get_current_user

router = APIRouter(prefix="/verification", tags=["Staff Verification"])

@router.post("", response_model=VerificationResponse)
def submit_staff_verification(
    payload: VerificationCreate,
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    staff_id = user.id if user else 3

    match = db.query(AIMatch).filter(AIMatch.id == payload.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="AI Match record not found")

    lost_item = match.lost_item
    found_item = match.found_item

    verification = Verification(
        match_id=payload.match_id,
        staff_id=staff_id,
        decision=payload.decision.upper(),
        remarks=payload.remarks,
        verified_at=datetime.utcnow()
    )
    db.add(verification)

    if payload.decision.upper() == "VERIFIED":
        lost_item.status = "VERIFIED"
        found_item.status = "MATCHED"

        # Notify Owner
        notif = Notification(
            user_id=lost_item.user_id,
            title="Official Verification Approved!",
            message=f"Transit staff verified the match for '{lost_item.title}'. Your item is confirmed at {found_item.depot_station or found_item.location_name} and ready for recovery.",
            type="VERIFIED",
            link_url=f"/journey/{lost_item.id}"
        )
        db.add(notif)

    elif payload.decision.upper() == "REJECTED":
        lost_item.status = "ANALYZING"
        notif = Notification(
            user_id=lost_item.user_id,
            title="Match Investigation Update",
            message=f"A candidate match for '{lost_item.title}' was reviewed and determined to be non-matching. Active search continues.",
            type="STATUS_CHANGE",
            link_url=f"/journey/{lost_item.id}"
        )
        db.add(notif)

    elif payload.decision.upper() == "REQUEST_INFO":
        notif = Notification(
            user_id=lost_item.user_id,
            title="Additional Details Requested by Transit Staff",
            message=f"Staff reviewing '{lost_item.title}' has requested additional identification details: {payload.remarks or 'Please provide unique identifiers.'}",
            type="INFO",
            link_url=f"/journey/{lost_item.id}"
        )
        db.add(notif)

    db.commit()
    db.refresh(verification)
    return verification

@router.get("", response_model=List[VerificationResponse])
def get_verifications(db: Session = Depends(get_db)):
    return db.query(Verification).order_by(Verification.verified_at.desc()).all()
