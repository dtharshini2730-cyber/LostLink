from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "PASSENGER"
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Lost Item Schemas ---
class LostItemCreate(BaseModel):
    title: str
    description: str
    category: str
    brand: Optional[str] = None
    color: Optional[str] = None
    unique_features: Optional[str] = None
    date_time: datetime
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    transport_type: str
    vehicle_number: Optional[str] = None
    coach_number: Optional[str] = None

class LostItemResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    category: str
    brand: Optional[str] = None
    color: Optional[str] = None
    unique_features: Optional[str] = None
    image_path: Optional[str] = None
    date_time: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: str
    transport_type: str
    vehicle_number: Optional[str] = None
    coach_number: Optional[str] = None
    status: str
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- Witness Report Schemas ---
class WitnessReportCreate(BaseModel):
    description: str
    date_time: datetime
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    transport_type: str
    vehicle_number: Optional[str] = None
    coach_number: Optional[str] = None
    notes: Optional[str] = None
    linked_lost_item_id: Optional[int] = None

class WitnessReportResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    image_path: Optional[str] = None
    description: str
    date_time: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: str
    transport_type: str
    vehicle_number: Optional[str] = None
    coach_number: Optional[str] = None
    notes: Optional[str] = None
    linked_lost_item_id: Optional[int] = None
    confidence_hint: float
    created_at: datetime

    class Config:
        from_attributes = True


# --- Found Item Schemas ---
class FoundItemCreate(BaseModel):
    title: str
    description: str
    category: str
    brand: Optional[str] = None
    color: Optional[str] = None
    found_time: datetime
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    transport_type: str
    vehicle_number: Optional[str] = None
    coach_number: Optional[str] = None
    depot_station: Optional[str] = None

class FoundItemResponse(BaseModel):
    id: int
    staff_id: Optional[int] = None
    title: str
    description: str
    category: str
    brand: Optional[str] = None
    color: Optional[str] = None
    image_path: Optional[str] = None
    found_time: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: str
    transport_type: str
    vehicle_number: Optional[str] = None
    coach_number: Optional[str] = None
    depot_station: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Route Schemas ---
class RouteResponse(BaseModel):
    id: int
    route_name: str
    transport_type: str
    vehicle_number: str
    stops_json: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- AI Match & Journey Schemas ---
class AIMatchResponse(BaseModel):
    id: int
    lost_item_id: int
    found_item_id: int
    image_score: float
    text_score: float
    time_score: float
    location_score: float
    route_score: float
    witness_score: float
    total_score: float
    confidence_level: str
    explanation: str
    match_breakdown_json: Optional[str] = None
    created_at: datetime
    found_item: Optional[FoundItemResponse] = None
    lost_item: Optional[LostItemResponse] = None

    class Config:
        from_attributes = True


class EvidenceResponse(BaseModel):
    id: int
    lost_item_id: int
    evidence_type: str
    source_id: Optional[str] = None
    timestamp: datetime
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str
    confidence: float
    image_url: Optional[str] = None
    sequence_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class JourneyCheckpoint(BaseModel):
    id: str
    type: str  # 'ORIGIN', 'WITNESS', 'STAFF_OBSERVATION', 'FOUND_CUSTODY'
    title: str
    timestamp: datetime
    location_name: str
    latitude: float
    longitude: float
    transport_type: str
    vehicle_info: Optional[str] = None
    description: str
    confidence: float
    evidence_type: str
    image_url: Optional[str] = None
    source_badge: str

class JourneyResponse(BaseModel):
    lost_item: LostItemResponse
    matched_found_item: Optional[FoundItemResponse] = None
    match_score: Optional[float] = None
    confidence_level: Optional[str] = None
    ai_summary: str
    evidence_chain: List[EvidenceResponse]
    checkpoints: List[JourneyCheckpoint]
    map_route_coordinates: List[List[float]]


# --- Verification Schemas ---
class VerificationCreate(BaseModel):
    match_id: int
    decision: str  # VERIFIED, REJECTED, REQUEST_INFO
    remarks: Optional[str] = None

class VerificationResponse(BaseModel):
    id: int
    match_id: int
    staff_id: int
    decision: str
    remarks: Optional[str] = None
    verified_at: datetime
    staff_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    read: bool
    link_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Dashboard Stats Schemas ---
class DashboardStats(BaseModel):
    total_lost_reports: int
    active_investigations: int
    potential_matches: int
    recovered_items: int
    witness_observations: int
    recovery_rate_percent: float
    avg_recovery_hours: float
    reports_by_day: List[Dict[str, Any]]
    transport_distribution: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    recent_investigations: List[Dict[str, Any]]
