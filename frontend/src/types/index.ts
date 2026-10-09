export type UserRole = 'PASSENGER' | 'WITNESS' | 'STAFF';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export type ItemStatus = 
  | 'NEW' 
  | 'ANALYZING' 
  | 'MATCH_FOUND' 
  | 'VERIFICATION_REQUIRED' 
  | 'VERIFIED' 
  | 'RECOVERED' 
  | 'CLOSED'
  | 'IN_CUSTODY'
  | 'MATCHED'
  | 'CLAIMED'
  | 'HANDED_OVER';

export interface LostItem {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  brand?: string;
  color?: string;
  unique_features?: string;
  image_path?: string;
  date_time: string;
  latitude?: number;
  longitude?: number;
  location_name: string;
  transport_type: string;
  vehicle_number?: string;
  coach_number?: string;
  status: ItemStatus;
  created_at: string;
  user_name?: string;
}

export interface WitnessReport {
  id: number;
  user_id?: number;
  image_path?: string;
  description: string;
  date_time: string;
  latitude?: number;
  longitude?: number;
  location_name: string;
  transport_type: string;
  vehicle_number?: string;
  coach_number?: string;
  notes?: string;
  linked_lost_item_id?: number;
  confidence_hint: number;
  created_at: string;
}

export interface FoundItem {
  id: number;
  staff_id?: number;
  title: string;
  description: string;
  category: string;
  brand?: string;
  color?: string;
  image_path?: string;
  found_time: string;
  latitude?: number;
  longitude?: number;
  location_name: string;
  transport_type: string;
  vehicle_number?: string;
  coach_number?: string;
  depot_station?: string;
  status: string;
  created_at: string;
}

export interface AIMatch {
  id: number;
  lost_item_id: number;
  found_item_id: number;
  image_score: number;
  text_score: number;
  time_score: number;
  location_score: number;
  route_score: number;
  witness_score: number;
  total_score: number;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  match_breakdown_json?: string;
  created_at: string;
  found_item?: FoundItem;
  lost_item?: LostItem;
}

export interface Evidence {
  id: number;
  lost_item_id: number;
  evidence_type: 'LOST_REPORT' | 'WITNESS_OBSERVATION' | 'STAFF_OBSERVATION' | 'ROUTE_CORRELATION' | 'FOUND_REPORT';
  source_id?: string;
  timestamp: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description: string;
  confidence: number;
  image_url?: string;
  sequence_order: number;
  created_at: string;
}

export interface JourneyCheckpoint {
  id: string;
  type: 'ORIGIN' | 'WITNESS' | 'STAFF_OBSERVATION' | 'FOUND_CUSTODY';
  title: string;
  timestamp: string;
  location_name: string;
  latitude: number;
  longitude: number;
  transport_type: string;
  vehicle_info?: string;
  description: string;
  confidence: number;
  evidence_type: string;
  image_url?: string;
  source_badge: string;
}

export interface JourneyResponse {
  lost_item: LostItem;
  matched_found_item?: FoundItem;
  match_score?: number;
  confidence_level?: string;
  ai_summary: string;
  evidence_chain: Evidence[];
  checkpoints: JourneyCheckpoint[];
  map_route_coordinates: [number, number][];
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link_url?: string;
  created_at: string;
}

export interface DashboardStats {
  total_lost_reports: number;
  active_investigations: number;
  potential_matches: number;
  recovered_items: number;
  witness_observations: number;
  recovery_rate_percent: number;
  avg_recovery_hours: number;
  reports_by_day: { day: string; lost: number; recovered: number; witnessSightings: number }[];
  transport_distribution: { name: string; count: number; color?: string }[];
  category_distribution: { name: string; count: number }[];
  recent_investigations: {
    id: number;
    title: string;
    category: string;
    location: string;
    transport: string;
    status: string;
    date: string;
    matchScore: number | null;
    confidence: string;
    evidenceCount: number;
  }[];
}
