import { UserRole, Permission } from './auth';

export const RolePermissions: Record<UserRole, Permission[]> = {
  CITIZEN: [
    'projects:read',
    'evidence:submit',
    'risk:read',
  ],
  DISTRICT_OFFICER: [
    'projects:read',
    'projects:write',
    'risk:read',
    'risk:audit',
    'evidence:review',
    'inspections:read',
    'inspections:update',
    'sla:read',
    'ledger:decision',
  ],
  MP_OFFICE: [
    'projects:read',
    'risk:read',
    'risk:audit',
    'sla:read',
  ],
  CONTRACTOR: [
    'projects:read',
    'projects:write',
    'evidence:submit',
  ],
  OVERVIEW: [
    'projects:read',
    'risk:read',
  ],
};

export const hasPermission = (userPermissions: Permission[], required: Permission): boolean => {
  return userPermissions.includes(required);
};
