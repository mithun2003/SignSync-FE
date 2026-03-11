export interface IUser {
  email?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  password?: string;
  image?: string;
}

export interface IAuthResponse {
  user?: IUser;
  session?: unknown;
}
