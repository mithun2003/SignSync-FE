export interface IUserData {
  username: string;
  email: string;
  phone: number;
  profile_photo: string | null;
  name?: string;
}


export interface IApiRes<TData = unknown> {
  status_code: number;
  success: boolean;
  message: string;
  data: TData;
}