import { UserEntity, SessionEntity, UserRole } from '../entities';

export interface LoginCredentials {
  identifier: string; // e.g. phone / officer ID / email
  credential: string; // e.g. OTP / password / biometric token
  roleHint?: UserRole;
}

export interface AuthResult {
  user: UserEntity;
  session: SessionEntity;
  token: string;
  refreshToken?: string;
}

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<SessionEntity | null>;
  getCurrentUser(): Promise<UserEntity | null>;
  restoreSession(): Promise<AuthResult | null>;
}
