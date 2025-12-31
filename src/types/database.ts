export type AccidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AccidentStatus = 'pending' | 'acknowledged' | 'resolved';

export interface Station {
  id: string;
  user_id: string;
  name: string;
  location_lat: number;
  location_lng: number;
  created_at: string;
  updated_at: string;
}

export interface Accident {
  id: string;
  title: string;
  description: string | null;
  severity: AccidentSeverity;
  status: AccidentStatus;
  location_lat: number;
  location_lng: number;
  location_address: string | null;
  reported_at: string;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  station?: Station;
}
