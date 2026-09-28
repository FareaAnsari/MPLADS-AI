// Canonical User, Role, and Permission Domain Entities

export type UserRole = 'CITIZEN' | 'DISTRICT_OFFICER' | 'MP_OFFICE' | 'CONTRACTOR' | 'OVERVIEW';

export type Permission =
  | 'projects:read'
  | 'projects:write'
  | 'risk:read'
  | 'risk:audit'
  | 'evidence:submit'
  | 'evidence:review'
  | 'inspections:read'
  | 'inspections:update'
  | 'sla:read'
  | 'ledger:decision';

export interface UserEntity {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role: UserRole;
  permissions: Permission[];
  jurisdictionState?: string | null;
  jurisdictionDistrict?: string | null;
  constituency?: string | null;
  inspectorId?: string | null;
}

export interface SessionEntity {
  sessionId: string;
  userId: string;
  role: UserRole;
  expiresAt: string;
  issuedAt: string;
}

export type AuthStateStatus =
  | 'IDLE'
  | 'RESTORING_SESSION'
  | 'AUTHENTICATED'
  | 'UNAUTHENTICATED'
  | 'LOCKED'
  | 'SESSION_EXPIRED';
