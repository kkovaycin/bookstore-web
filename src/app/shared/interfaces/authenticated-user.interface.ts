export interface AuthenticatedUser {
  email: string;
  role: 'ADMIN' | 'USER';
}
