import { AuthenticatedUser } from './authenticated-user.interface';

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: AuthenticatedUser;
}
