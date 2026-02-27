export interface IPredictResponse {
  label: string;
  confidence: number;
}

export interface IUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  country: string;
  email: string;
  profile_image_url?: string | null;
  tier_id?: number | null;
  two_factor_enabled: boolean;
}

export interface IUserUpdate {
  username?: string;
  email?: string;
  profile_image_url?: string;
}

export interface IUserResponse {
  data: IUser;
}