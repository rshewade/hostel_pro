export interface DeviceSession {
  id: string;
  user_id: string; // auth.users.id
  device_id: string; // Unique device identifier
  user_agent: string;
  ip_address: string;
  last_seen: string;
  is_active: boolean;
  suspicious: boolean; // Flagged if new device/geo-IP mismatch
  geo_location?: string; // Optional: Country, city, etc.
  created_at: string;
  updated_at: string;
}

export interface CreateDeviceSessionDto {
  user_id: string;
  device_id: string;
  user_agent: string;
  ip_address: string;
  geo_location?: string;
}

export interface UpdateDeviceSessionDto {
  is_active?: boolean;
  suspicious?: boolean;
  last_seen?: string;
}
