import { IUserRead } from "@models/global.model";

export interface IPredictResponse {
  label: string;
  confidence: number;
}

// export interface IUser {
//   id: number;
//   username: string;
//   first_name: string;
//   last_name: string;
//   bio: string;
//   country: string;
//   email: string;
//   profile_image_url?: string | null;
//   tier_id?: number | null;
//   two_factor_enabled: boolean;
// }


export interface IUserUpdate {
  username?: string;        
  email?: string;           
  first_name?: string;    
  last_name?: string;     
  bio?: string;           
  country?: string;       
  language?: string;      
  two_factor_enabled?: boolean;
  profile_image_url?: string;  
}

export interface IUserResponse {
  data: IUserRead;
  message?: string;
}

export interface IDashboardResponse {
  stats: IDashboardStats;
  frequent_signs: IFrequentSign[];
  daily_activity: IDailyActivity[];
  accuracy_distribution: IAccuracyDistribution;
  mastered_letters: number;
  recent_activities: IRecentActivity[];
  recommended_letters: IRecommendedLetter[];
}

export interface IDashboardStats {
  total_signs_detected: number;
  today_signs_count: number;
  total_practice_hours: number;
  today_minutes: number;
  average_accuracy: number;
  accuracy_change: number;
  current_streak: number;
}

export interface IFrequentSign {
  sign: string;
  count: number;
}

export interface IDailyActivity {
  date: string;
  count: number;
}

export interface IAccuracyDistribution {
  high: number;
  medium: number;
  low: number;
}

export interface IRecentActivity {
  id: number;
  emoji: string;
  description: string;
  time_ago: string;
  badge?: 'success' | 'practice' | 'streak';
  badge_text?: string;
}

export interface IRecommendedLetter {
  char: string;
  count: number;
  accuracy: number;
}