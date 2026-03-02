import { TokenType } from '@models/localStorage';

// export interface ILoginResponse {
//   success: boolean;
//   data?: LoginSuccessData;
//   status_code: number;
//   message: string;
// }

export interface ILoginResponse {
  access_token: string;
  user_role: TokenType;
}

export interface HttpErrorResponse {
  error?: FastAPIErrorResponse;
  status?: number;
}

export interface FastAPIErrorResponse {
  detail?: string | ValidationError[];
  message?: string;
}

export interface ValidationError {
  msg?: string;
}