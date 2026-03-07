// admin.model.ts
export interface IAdminStats {
  total_users: number;
  active_users_today: number;
  total_detections: number;
  system_health: number;
  user_growth_percent: number;
  detection_growth_percent: number;
}

export interface IRecentActivity {
  id: number;
  type: 'user' | 'detection' | 'system' | 'security';
  emoji: string;
  title: string;
  description: string;
  time_ago: string;
}

export interface ISystemService {
  name: string;
  status: 'online' | 'offline' | 'warning';
  uptime_percent?: number;
}

export interface ITopUser {
  username: string;
  detections: number;
  accuracy: number;
}

export interface IAdminDashboard {
  stats: IAdminStats;
  recent_activities: IRecentActivity[];
  system_services: ISystemService[];
  top_users: ITopUser[];
}




export interface ASLSign {
  id: number;
  character: string;
  image_filename: string;
  image_path: string;
  cdn_url: string;
  file_size: number;
  mime_type: string;
  upload_method: string;
  version: number;
  updated_at: string;
  created_at: string;
  updated_by?: number;
}

export interface SignStats {
  total_signs: number;
  missing_signs: number;
  completion_percentage: number;
  total_size_mb: number;
}

export interface VersionHistory {
  version: number;
  cdn_url: string;
  updated_at: string;
  upload_method: string;
}