from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Notification, User
from app.schemas.schemas import NotificationResponse
from app.auth.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_user_notifications(
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = user.id if user else 1
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )
    return notifications

@router.put("/{id}/read")
def mark_notification_read(id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == id).first()
    if notif:
        notif.read = True
        db.commit()
    return {"status": "SUCCESS"}

@router.put("/read-all/all")
def mark_all_notifications_read(
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = user.id if user else 1
    db.query(Notification).filter(Notification.user_id == user_id).update({"read": True})
    db.commit()
    return {"status": "SUCCESS"}
