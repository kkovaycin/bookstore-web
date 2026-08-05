export interface AuthenticatedUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
}
