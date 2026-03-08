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

// ─── Users ───────────────────────────────────────────────────────────────────
export interface IAdminUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  joined_at: string;
  last_seen: string;
  total_signs: number;
}

export interface IUserSummary {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
}

export interface IAdminUsersData {
  data: IAdminUser[];
  total_count: number;
  page: number;
  items_per_page: number;
  has_more: boolean;
  summary: IUserSummary;
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface IDailyCount {
  date: string;
  count: number;
}

export interface ICountryCount {
  country: string;
  count: number;
}

export interface IUserAnalyticsData {
  period_days: number;
  total_users: number;
  new_users_in_period: number;
  active_users_in_period: number;
  inactive_users: number;
  growth_percent: number;
  daily_registrations: IDailyCount[];
  top_countries: ICountryCount[];
}

// ─── System Health & Backup ───────────────────────────────────────────────────
export interface IServiceHealth {
  name: string;
  status: string; // "online" | "offline" | "warning"
  latency_ms: number | null;
}

export interface ISystemHealth {
  status: string;
  timestamp: string;
  services: IServiceHealth[];
}

export interface IBackupRecord {
  backup_id: string;
  created_at: string;
  size_bytes: number;
  record_counts: Record<string, number>;
  file_path: string;
}

export interface IBackupInfo {
  last_backup: IBackupRecord | null;
  message: string;
}

export interface ICacheClearResult {
  message: string;
  cleared_at: string;
}

export interface IActiveUser {
  username: string;
  email: string;
  last_login_at: string | null;
  created_at: string;
}

export interface IActiveUsersData {
  data: IActiveUser[];
  total: number;
  period_hours: number;
}

export interface INotificationSettings {
  notifications_enabled: boolean;
  email_alerts_enabled: boolean;
  backup_alerts_enabled: boolean;
}

// ─── ASL Signs ───────────────────────────────────────────────────────────────
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
// ─── Settings ─────────────────────────────────────────────────────────────────

export interface IGeneralSettings {
  app_name: string;
  app_description: string;
  timezone: string;
  language: string;
}

export interface ISecuritySettings {
  min_password_length: number;
  require_uppercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  session_timeout: number;
  enable_2fa: boolean;
}

export interface IEmailNotifications {
  new_users: boolean;
  system_alerts: boolean;
  backup_completion: boolean;
}

export interface IInAppNotifications {
  show_badges: boolean;
  auto_dismiss: boolean;
}

export interface INotificationsSettings {
  email: IEmailNotifications;
  in_app: IInAppNotifications;
}

export interface ISystemSettings {
  cache_duration: number;
  debug_mode: boolean;
  maintenance_mode: boolean;
  auto_backup: boolean;
}

export interface IAdminSettings {
  general: IGeneralSettings;
  security: ISecuritySettings;
  notifications: INotificationsSettings;
  system: ISystemSettings;
}
