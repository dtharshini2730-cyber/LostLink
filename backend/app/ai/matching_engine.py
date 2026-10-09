import math
import re
import json
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from app.ai.preprocessing import AIPreprocessor
import numpy as np

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth in kilometers.
    """
    if None in (lat1, lon1, lat2, lon2):
        return 50.0  # default moderate distance
    
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class AIMatchingEngine:
    """
    Multi-factor AI Evidence & Similarity Engine.
    Combines Visual, Textual, Temporal, Geospatial, Route, and Witness signals.
    """

    @classmethod
    def calculate_image_score(
        cls, 
        lost_img_features: Optional[Dict[str, Any]], 
        found_img_features: Optional[Dict[str, Any]],
        lost_cat: str,
        found_cat: str,
        lost_color: Optional[str] = None,
        found_color: Optional[str] = None
    ) -> float:
        """
        Calculates image similarity using dHash Hamming distance and color histogram correlation.
        """
        if not lost_img_features or not found_img_features:
            # Fallback based on category and color matching
            base = 60.0 if lost_cat.lower() == found_cat.lower() else 20.0
            if lost_color and found_color and lost_color.lower() in found_color.lower():
                base += 25.0
            return min(round(base, 1), 90.0)

        dhash1 = lost_img_features.get("dhash", "")
        dhash2 = found_img_features.get("dhash", "")
        
        # 1. Hamming distance on dHash (64 bits)
        if len(dhash1) == 64 and len(dhash2) == 64:
            hamming_dist = sum(c1 != c2 for c1, c2 in zip(dhash1, dhash2))
            # 0 dist => 100%, 32+ dist => 0%
            hash_similarity = max(0.0, (1.0 - (hamming_dist / 32.0))) * 100.0
        else:
            hash_similarity = 70.0

        # 2. Color histogram intersection
        hist1 = lost_img_features.get("color_hist", [])
        hist2 = found_img_features.get("color_hist", [])
        if hist1 and hist2 and len(hist1) == len(hist2):
            h1 = np.array(hist1)
            h2 = np.array(hist2)
            # Cosine similarity between normalized histograms
            dot = np.dot(h1, h2)
            color_similarity = max(0.0, float(dot)) * 100.0
        else:
            color_similarity = 70.0

        # Weighted combination
        image_score = (0.6 * hash_similarity) + (0.4 * color_similarity)
        
        # Category bonus/penalty
        if lost_cat.lower() == found_cat.lower():
            image_score = min(100.0, image_score + 5.0)
        else:
            image_score = max(0.0, image_score - 20.0)

        return round(float(image_score), 1)

    @classmethod
    def calculate_text_score(
        cls,
        lost_title: str,
        lost_desc: str,
        lost_brand: Optional[str],
        lost_color: Optional[str],
        lost_features: Optional[str],
        found_title: str,
        found_desc: str,
        found_brand: Optional[str],
        found_color: Optional[str]
    ) -> float:
        """
        Calculates text and NLP semantic similarity using TF-IDF token overlap,
        brand match, and feature alignment.
        """
        full_lost_text = f"{lost_title} {lost_desc} {lost_brand or ''} {lost_color or ''} {lost_features or ''}"
        full_found_text = f"{found_title} {found_desc} {found_brand or ''} {found_color or ''}"

        p_lost = AIPreprocessor.preprocess_text(full_lost_text)
        p_found = AIPreprocessor.preprocess_text(full_found_text)

        tokens_lost = set(p_lost["tokens"])
        tokens_found = set(p_found["tokens"])

        if not tokens_lost or not tokens_found:
            return 30.0

        # Jaccard Token Overlap
        intersection = tokens_lost.intersection(tokens_found)
        union = tokens_lost.union(tokens_found)
        jaccard = (len(intersection) / len(union)) if union else 0.0
        
        # TF-IDF Cosine vector approximation
        all_vocab = list(union)
        vec_lost = [p_lost["tf"].get(word, 0) for word in all_vocab]
        vec_found = [p_found["tf"].get(word, 0) for word in all_vocab]

        norm_l = math.sqrt(sum(x*x for x in vec_lost))
        norm_f = math.sqrt(sum(x*x for x in vec_found))
        
        cosine_sim = 0.0
        if norm_l > 0 and norm_f > 0:
            cosine_sim = sum(l * f for l, f in zip(vec_lost, vec_found)) / (norm_l * norm_f)

        score = (0.5 * jaccard * 100.0) + (0.5 * cosine_sim * 100.0)

        # Brand match bonus
        if lost_brand and found_brand:
            if lost_brand.lower().strip() == found_brand.lower().strip():
                score += 15.0
            elif lost_brand.lower() in found_brand.lower() or found_brand.lower() in lost_brand.lower():
                score += 10.0

        # Color match bonus
        if lost_color and found_color:
            if lost_color.lower().strip() == found_color.lower().strip():
                score += 10.0

        return min(round(score, 1), 100.0)

    @classmethod
    def calculate_time_score(cls, lost_time: datetime, found_time: datetime) -> float:
        """
        Calculates temporal plausibility: found_time must occur after or close to lost_time.
        """
        delta_seconds = (found_time - lost_time).total_seconds()
        delta_hours = delta_seconds / 3600.0

        if delta_hours < -1.0:
            # Found significantly BEFORE reported lost time -> highly improbable
            return max(0.0, 15.0 + delta_hours * 2.0)
        elif -1.0 <= delta_hours <= 0:
            # Slight reporting delay window
            return 80.0
        elif 0 < delta_hours <= 2.0:
            # Optimal transit discovery window (15m to 2h)
            return 96.0
        elif 2.0 < delta_hours <= 8.0:
            # Same shift/trip discovery
            return 90.0
        elif 8.0 < delta_hours <= 24.0:
            # Next day/end of line sweep
            return 82.0
        elif 24.0 < delta_hours <= 72.0:
            # Depot intake within 3 days
            return 72.0
        else:
            # Long delay
            return max(30.0, 70.0 - (delta_hours / 24.0) * 5.0)

    @classmethod
    def calculate_location_score(
        cls,
        lat1: Optional[float],
        lon1: Optional[float],
        loc1_name: str,
        lat2: Optional[float],
        lon2: Optional[float],
        loc2_name: str
    ) -> float:
        """
        Calculates geospatial proximity and station corridor correlation.
        """
        if lat1 is not None and lon1 is not None and lat2 is not None and lon2 is not None:
            dist_km = haversine_distance(lat1, lon1, lat2, lon2)
            if dist_km <= 1.0:
                return 98.0
            elif dist_km <= 10.0:
                return 92.0
            elif dist_km <= 50.0:
                return 88.0
            elif dist_km <= 150.0:
                return 80.0
            elif dist_km <= 300.0:
                return 72.0
            else:
                return max(20.0, 70.0 - (dist_km / 50.0))
        
        # Fallback to string matching
        l1, l2 = loc1_name.lower(), loc2_name.lower()
        if l1 == l2:
            return 95.0
        elif any(part in l2 for part in l1.split() if len(part) > 3):
            return 85.0
        return 65.0

    @classmethod
    def calculate_route_score(
        cls,
        lost_transport: str,
        lost_vehicle: Optional[str],
        lost_coach: Optional[str],
        found_transport: str,
        found_vehicle: Optional[str],
        found_coach: Optional[str]
    ) -> float:
        """
        Calculates route, vehicle number, and coach alignment score.
        """
        score = 40.0
        # Transport mode check
        if lost_transport.lower() == found_transport.lower():
            score += 25.0
        else:
            return 20.0  # Mismatched transport mode

        # Vehicle / Train number check
        if lost_vehicle and found_vehicle:
            v1 = re.sub(r'[^a-z0-9]', '', lost_vehicle.lower())
            v2 = re.sub(r'[^a-z0-9]', '', found_vehicle.lower())
            if v1 == v2 or v1 in v2 or v2 in v1:
                score += 25.0
            else:
                score += 10.0

        # Coach check
        if lost_coach and found_coach:
            c1 = re.sub(r'[^a-z0-9]', '', lost_coach.lower())
            c2 = re.sub(r'[^a-z0-9]', '', found_coach.lower())
            if c1 == c2:
                score += 10.0
            elif any(x in c2 for x in c1):
                score += 5.0

        return min(round(score, 1), 100.0)

    @classmethod
    def calculate_witness_score(
        cls,
        witness_reports: List[Dict[str, Any]],
        lost_title: str,
        lost_time: datetime,
        found_time: datetime
    ) -> float:
        """
        Evaluates witness observations matching the corridor, timestamp, and item type.
        """
        if not witness_reports:
            return 70.0  # Neutral base score if no witness report yet

        max_w_score = 70.0
        for w in witness_reports:
            desc = w.get("description", "")
            w_time = w.get("date_time")
            
            # Text relevance
            p_lost = AIPreprocessor.preprocess_text(lost_title)
            p_w = AIPreprocessor.preprocess_text(desc)
            overlap = set(p_lost["tokens"]).intersection(set(p_w["tokens"]))
            
            w_val = 75.0 + min(len(overlap) * 8.0, 20.0)
            
            # Timestamp sanity (witness sighting should be between lost and found)
            if w_time and isinstance(w_time, datetime):
                if lost_time <= w_time <= found_time:
                    w_val += 5.0
            
            if w_val > max_w_score:
                max_w_score = w_val

        return min(round(max_w_score, 1), 100.0)

    @classmethod
    def compute_full_match(
        cls,
        lost_item: Any,
        found_item: Any,
        witness_reports: List[Any],
        lost_img_features: Optional[Dict[str, Any]] = None,
        found_img_features: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes full multi-factor score calculation and generates AI explanation.
        """
        image_score = cls.calculate_image_score(
            lost_img_features=lost_img_features,
            found_img_features=found_img_features,
            lost_cat=lost_item.category,
            found_cat=found_item.category,
            lost_color=lost_item.color,
            found_color=found_item.color
        )

        text_score = cls.calculate_text_score(
            lost_title=lost_item.title,
            lost_desc=lost_item.description,
            lost_brand=lost_item.brand,
            lost_color=lost_item.color,
            lost_features=lost_item.unique_features,
            found_title=found_item.title,
            found_desc=found_item.description,
            found_brand=found_item.brand,
            found_color=found_item.color
        )

        time_score = cls.calculate_time_score(
            lost_time=lost_item.date_time,
            found_time=found_item.found_time
        )

        location_score = cls.calculate_location_score(
            lat1=lost_item.latitude,
            lon1=lost_item.longitude,
            loc1_name=lost_item.location_name,
            lat2=found_item.latitude,
            lon2=found_item.longitude,
            loc2_name=found_item.location_name
        )

        route_score = cls.calculate_route_score(
            lost_transport=lost_item.transport_type,
            lost_vehicle=lost_item.vehicle_number,
            lost_coach=lost_item.coach_number,
            found_transport=found_item.transport_type,
            found_vehicle=found_item.vehicle_number,
            found_coach=found_item.coach_number
        )

        witness_dicts = [
            {
                "description": w.description,
                "date_time": w.date_time,
                "location_name": w.location_name,
                "vehicle_number": w.vehicle_number
            }
            for w in witness_reports
        ]
        witness_score = cls.calculate_witness_score(
            witness_reports=witness_dicts,
            lost_title=lost_item.title,
            lost_time=lost_item.date_time,
            found_time=found_item.found_time
        )

        # Weighted calculation: 30% image, 20% text, 15% time, 15% location, 10% route, 10% witness
        total_score = (
            (0.30 * image_score) +
            (0.20 * text_score) +
            (0.15 * time_score) +
            (0.15 * location_score) +
            (0.10 * route_score) +
            (0.10 * witness_score)
        )
        total_score = round(total_score, 1)

        if total_score >= 85.0:
            confidence = "HIGH"
        elif total_score >= 65.0:
            confidence = "MEDIUM"
        else:
            confidence = "LOW"

        # Generate intelligent AI reasoning
        explanation = cls.generate_ai_explanation(
            lost_item=lost_item,
            found_item=found_item,
            image_score=image_score,
            text_score=text_score,
            time_score=time_score,
            location_score=location_score,
            route_score=route_score,
            witness_score=witness_score,
            total_score=total_score,
            witness_count=len(witness_reports)
        )

        return {
            "image_score": image_score,
            "text_score": text_score,
            "time_score": time_score,
            "location_score": location_score,
            "route_score": route_score,
            "witness_score": witness_score,
            "total_score": total_score,
            "confidence_level": confidence,
            "explanation": explanation,
            "breakdown": {
                "weights": {
                    "image": "30%",
                    "text": "20%",
                    "time": "15%",
                    "location": "15%",
                    "route": "10%",
                    "witness": "10%"
                },
                "engine": "LostLink AI Multi-Factor Evidence Correlator v1.0",
                "calculated_at": datetime.utcnow().isoformat()
            }
        }

    @staticmethod
    def generate_ai_explanation(
        lost_item: Any,
        found_item: Any,
        image_score: float,
        text_score: float,
        time_score: float,
        location_score: float,
        route_score: float,
        witness_score: float,
        total_score: float,
        witness_count: int
    ) -> str:
        points = []
        
        if image_score >= 85:
            points.append(f"High visual similarity detected ({image_score}%)")
        elif image_score >= 65:
            points.append(f"Moderate visual alignment ({image_score}%)")
            
        if text_score >= 80:
            points.append("item metadata and physical attributes match strongly")
            
        if time_score >= 85:
            points.append("found timestamp is within the expected transit travel window")
            
        if route_score >= 85:
            points.append(f"identical transport corridor ({lost_item.transport_type} {lost_item.vehicle_number or ''})")
        elif route_score >= 60:
            points.append("connected transit route confirmed")
            
        if witness_count > 0 and witness_score >= 80:
            points.append(f"{witness_count} verified witness observation(s) corroborate intermediate sighting along the route")

        summary = f"Overall confidence is {total_score}%. "
        if points:
            summary += f"Key evidence: {'; '.join(points)}. "
        summary += f"The item moved from {lost_item.location_name} to custody at {found_item.location_name}."
        
        return summary
