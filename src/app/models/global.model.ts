export interface IUserData {
  username: string;
  email: string;
  phone: number;
  profile_photo: string | null;
  name?: string;
  role?: string;
}

export interface IUserRead {
  id: number;
  first_name: string | null;
  last_name: string | null;
  username: string;
  email: string;
  profile_image_url: string | null;
  bio: string | null;
  country: string | null;
  language: string;
  two_factor_enabled: boolean;
  tier_id: number | null;
  created_at?: string;  
  updated_at?: string;
}


export interface IApiRes<TData = unknown> {
  status_code: number;
  success: boolean;
  message: string;
  data: TData;
}