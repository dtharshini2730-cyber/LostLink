from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.models.models import LostItem, FoundItem, WitnessReport, AIMatch, Evidence

class JourneyService:
    @staticmethod
    def get_item_journey(db: Session, lost_item_id: int) -> Dict[str, Any]:
        lost_item = db.query(LostItem).filter(LostItem.id == lost_item_id).first()
        if not lost_item:
            return None

        # Fetch best AI match if available
        best_match = (
            db.query(AIMatch)
            .filter(AIMatch.lost_item_id == lost_item_id)
            .order_by(AIMatch.total_score.desc())
            .first()
        )

        matched_found = best_match.found_item if best_match else None

        # Fetch evidence records
        evidence_records = (
            db.query(Evidence)
            .filter(Evidence.lost_item_id == lost_item_id)
            .order_by(Evidence.sequence_order.asc(), Evidence.timestamp.asc())
            .all()
        )

        # Build interactive checkpoints
        checkpoints = []
        map_coords = []

        # Checkpoint 1: Lost Report Origin
        c1_lat = lost_item.latitude or 11.0168
        c1_lon = lost_item.longitude or 76.9558
        map_coords.append([c1_lat, c1_lon])
        
        checkpoints.append({
            "id": f"chk-lost-{lost_item.id}",
            "type": "ORIGIN",
            "title": f"Reported Lost at {lost_item.location_name}",
            "timestamp": lost_item.date_time,
            "location_name": lost_item.location_name,
            "latitude": c1_lat,
            "longitude": c1_lon,
            "transport_type": lost_item.transport_type,
            "vehicle_info": f"{lost_item.vehicle_number or ''} {lost_item.coach_number or ''}".strip(),
            "description": f"Passenger reported losing '{lost_item.title}' ({lost_item.category}). Description: {lost_item.description}",
            "confidence": 100.0,
            "evidence_type": "LOST_REPORT",
            "image_url": lost_item.image_path,
            "source_badge": "Owner Report"
        })

        # Checkpoint 2..N: Witness Reports & Staff intermediate checkpoints
        # Look for explicit evidence or linked witness reports
        linked_witnesses = (
            db.query(WitnessReport)
            .filter(
                (WitnessReport.linked_lost_item_id == lost_item_id) |
                ((WitnessReport.vehicle_number == lost_item.vehicle_number) & (WitnessReport.vehicle_number.isnot(None)))
            )
            .order_by(WitnessReport.date_time.asc())
            .all()
        )

        for w in linked_witnesses:
            w_lat = w.latitude or (c1_lat + 0.15)
            w_lon = w.longitude or (c1_lon + 0.25)
            map_coords.append([w_lat, w_lon])
            
            checkpoints.append({
                "id": f"chk-wit-{w.id}",
                "type": "WITNESS",
                "title": f"Witness Sighting at {w.location_name}",
                "timestamp": w.date_time,
                "location_name": w.location_name,
                "latitude": w_lat,
                "longitude": w_lon,
                "transport_type": w.transport_type,
                "vehicle_info": f"{w.vehicle_number or ''} {w.coach_number or ''}".strip(),
                "description": f"Witness observed matching item in transit. Notes: {w.description}",
                "confidence": w.confidence_hint or 88.0,
                "evidence_type": "WITNESS_OBSERVATION",
                "image_url": w.image_path,
                "source_badge": "Witness Sighting"
            })

        # Check intermediate evidence items if any (e.g. staff observations)
        for ev in evidence_records:
            if ev.evidence_type == "STAFF_OBSERVATION":
                ev_lat = ev.latitude or (c1_lat + 0.3)
                ev_lon = ev.longitude or (c1_lon + 0.45)
                map_coords.append([ev_lat, ev_lon])
                checkpoints.append({
                    "id": f"chk-ev-{ev.id}",
                    "type": "STAFF_OBSERVATION",
                    "title": f"Transit Staff Checkpoint ({ev.location})",
                    "timestamp": ev.timestamp,
                    "location_name": ev.location,
                    "latitude": ev_lat,
                    "longitude": ev_lon,
                    "transport_type": lost_item.transport_type,
                    "vehicle_info": lost_item.vehicle_number,
                    "description": ev.description,
                    "confidence": ev.confidence,
                    "evidence_type": "STAFF_OBSERVATION",
                    "image_url": ev.image_url,
                    "source_badge": "Staff Checkpoint"
                })

        # Checkpoint Final: Found Custody
        if matched_found:
            f_lat = matched_found.latitude or (c1_lat + 0.45)
            f_lon = matched_found.longitude or (c1_lon + 0.70)
            map_coords.append([f_lat, f_lon])
            checkpoints.append({
                "id": f"chk-fnd-{matched_found.id}",
                "type": "FOUND_CUSTODY",
                "title": f"Found & Secured at {matched_found.location_name}",
                "timestamp": matched_found.found_time,
                "location_name": matched_found.location_name,
                "latitude": f_lat,
                "longitude": f_lon,
                "transport_type": matched_found.transport_type,
                "vehicle_info": f"{matched_found.vehicle_number or ''} {matched_found.coach_number or ''}".strip(),
                "description": f"Secured at {matched_found.depot_station or matched_found.location_name}. Details: {matched_found.description}",
                "confidence": best_match.total_score if best_match else 94.0,
                "evidence_type": "FOUND_REPORT",
                "image_url": matched_found.image_path,
                "source_badge": "Found in Custody"
            })

        # Sort all checkpoints chronologically
        checkpoints.sort(key=lambda x: x["timestamp"])

        ai_summary = (
            best_match.explanation if best_match else
            f"Active investigation underway for '{lost_item.title}'. Searching transport corridors and correlating passenger sightings."
        )

        return {
            "lost_item": lost_item,
            "matched_found_item": matched_found,
            "match_score": best_match.total_score if best_match else None,
            "confidence_level": best_match.confidence_level if best_match else "ANALYZING",
            "ai_summary": ai_summary,
            "evidence_chain": evidence_records,
            "checkpoints": checkpoints,
            "map_route_coordinates": map_coords
        }
