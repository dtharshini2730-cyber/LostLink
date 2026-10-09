import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="PASSENGER", nullable=False)  # PASSENGER, WITNESS, STAFF
    phone = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lost_items = relationship("LostItem", back_populates="user")
    witness_reports = relationship("WitnessReport", back_populates="user")
    found_items = relationship("FoundItem", back_populates="staff")
    notifications = relationship("Notification", back_populates="user")
    verifications = relationship("Verification", back_populates="staff")


class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)  # Electronics, Bags, Wallets, Documents, Accessories, Clothing, Others
    brand = Column(String(100), nullable=True)
    color = Column(String(50), nullable=True)
    unique_features = Column(Text, nullable=True)
    image_path = Column(String(255), nullable=True)
    
    # Journey & Location Context
    date_time = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(150), nullable=False)
    transport_type = Column(String(50), nullable=False)  # Train, Metro, Bus, Flight
    vehicle_number = Column(String(100), nullable=True)  # e.g., Train 12675 Kovai Express, Bus KA-01-F-2024
    coach_number = Column(String(50), nullable=True)    # e.g., S3 / Coach B2 / Seat 42
    
    status = Column(String(30), default="NEW", nullable=False)  
    # NEW, ANALYZING, MATCH_FOUND, VERIFICATION_REQUIRED, VERIFIED, RECOVERED, CLOSED

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="lost_items")
    ai_matches = relationship("AIMatch", back_populates="lost_item", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="lost_item", cascade="all, delete-orphan")
    witness_links = relationship("WitnessReport", back_populates="linked_lost_item")


class WitnessReport(Base):
    __tablename__ = "witness_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    image_path = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    date_time = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(150), nullable=False)
    transport_type = Column(String(50), nullable=False)
    vehicle_number = Column(String(100), nullable=True)
    coach_number = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    
    linked_lost_item_id = Column(Integer, ForeignKey("lost_items.id"), nullable=True)
    confidence_hint = Column(Float, default=85.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="witness_reports")
    linked_lost_item = relationship("LostItem", back_populates="witness_links")


class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    brand = Column(String(100), nullable=True)
    color = Column(String(50), nullable=True)
    image_path = Column(String(255), nullable=True)
    
    found_time = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(150), nullable=False)
    transport_type = Column(String(50), nullable=False)
    vehicle_number = Column(String(100), nullable=True)
    coach_number = Column(String(50), nullable=True)
    depot_station = Column(String(150), nullable=True)  # Lost & Found Depot / Station Office
    
    status = Column(String(30), default="IN_CUSTODY", nullable=False)  # IN_CUSTODY, MATCHED, CLAIMED, HANDED_OVER
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    staff = relationship("User", back_populates="found_items")
    ai_matches = relationship("AIMatch", back_populates="found_item", cascade="all, delete-orphan")


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String(150), nullable=False)
    transport_type = Column(String(50), nullable=False)
    vehicle_number = Column(String(100), nullable=False)
    stops_json = Column(Text, nullable=False)  # JSON array of stops with lat, lng, time, seq
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AIMatch(Base):
    __tablename__ = "ai_matches"

    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"), nullable=False)
    found_item_id = Column(Integer, ForeignKey("found_items.id"), nullable=False)
    
    image_score = Column(Float, default=0.0)      # 30% weight
    text_score = Column(Float, default=0.0)       # 20% weight
    time_score = Column(Float, default=0.0)       # 15% weight
    location_score = Column(Float, default=0.0)   # 15% weight
    route_score = Column(Float, default=0.0)      # 10% weight
    witness_score = Column(Float, default=0.0)    # 10% weight
    total_score = Column(Float, default=0.0)      # Computed overall weighted match %
    
    confidence_level = Column(String(20), default="MEDIUM")  # HIGH, MEDIUM, LOW
    explanation = Column(Text, nullable=False)
    match_breakdown_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lost_item = relationship("LostItem", back_populates="ai_matches")
    found_item = relationship("FoundItem", back_populates="ai_matches")
    verifications = relationship("Verification", back_populates="match", cascade="all, delete-orphan")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"), nullable=False)
    evidence_type = Column(String(50), nullable=False)  # LOST_REPORT, WITNESS_OBSERVATION, STAFF_OBSERVATION, ROUTE_CORRELATION, FOUND_REPORT
    source_id = Column(String(50), nullable=True)       # e.g., WIT-102, FND-405, RT-99
    timestamp = Column(DateTime, nullable=False)
    location = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    description = Column(Text, nullable=False)
    confidence = Column(Float, default=90.0)
    image_url = Column(String(255), nullable=True)
    sequence_order = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lost_item = relationship("LostItem", back_populates="evidence_items")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="INFO")  # MATCH_FOUND, WITNESS_ADDED, VERIFIED, RECOVERY_READY, STATUS_CHANGE
    read = Column(Boolean, default=False)
    link_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class Verification(Base):
    __tablename__ = "verifications"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("ai_matches.id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision = Column(String(30), nullable=False)  # VERIFIED, REJECTED, REQUEST_INFO
    remarks = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=datetime.datetime.utcnow)

    match = relationship("AIMatch", back_populates="verifications")
    staff = relationship("User", back_populates="verifications")
