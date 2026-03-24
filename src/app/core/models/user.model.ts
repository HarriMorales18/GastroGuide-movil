export type UserRole = 'student' | 'creator' | 'admin';

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
}