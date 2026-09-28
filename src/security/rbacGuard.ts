/**
 * Government of India MoSPI — MPLADS AI Role-Based Access Control (RBAC) & Audit Layer
 * Defines statutory permissions for all 7 portal user roles.
 */

import { UserRole } from '../types';

export type SecurityPermission = 
  | 'VIEW_PUBLIC_PROJECTS'
  | 'VIEW_FINANCIAL_PFMS'
  | 'VIEW_DETAILED_RISK_FACTORS'
  | 'SUBMIT_WORK_RECOMMENDATION'
  | 'ACCORD_ADMINISTRATIVE_SANCTION'
  | 'APPROVE_CONTRACTOR_PROGRESS'
  | 'DISBURSE_TREASURY_FUNDS'
  | 'REGISTER_VENDOR'
  | 'SUBMIT_TENDER_BID'
  | 'SUBMIT_CITIZEN_OBSERVATION'
  | 'TRIGGER_STATUTORY_AUDIT'
  | 'EXPORT_LEGAL_COMPENDIUM';

/**
 * Statutory RBAC Matrix mapping roles to authorized actions
 */
const ROLE_PERMISSIONS: Record<UserRole, SecurityPermission[]> = {
  overview: [
    'VIEW_PUBLIC_PROJECTS',
    'VIEW_FINANCIAL_PFMS',
    'VIEW_DETAILED_RISK_FACTORS',
    'SUBMIT_CITIZEN_OBSERVATION'
  ],
  mp: [
    'VIEW_PUBLIC_PROJECTS',
    'VIEW_FINANCIAL_PFMS',
    'VIEW_DETAILED_RISK_FACTORS',
    'SUBMIT_WORK_RECOMMENDATION',
    'EXPORT_LEGAL_COMPENDIUM'
  ],
  district: [
    'VIEW_PUBLIC_PROJECTS',
    'VIEW_FINANCIAL_PFMS',
    'VIEW_DETAILED_RISK_FACTORS',
    'ACCORD_ADMINISTRATIVE_SANCTION',
    'APPROVE_CONTRACTOR_PROGRESS',
    'DISBURSE_TREASURY_FUNDS',
    'REGISTER_VENDOR',
    'TRIGGER_STATUTORY_AUDIT',
    'EXPORT_LEGAL_COMPENDIUM'
  ],
  contractor: [
    'VIEW_PUBLIC_PROJECTS',
    'SUBMIT_TENDER_BID',
    'APPROVE_CONTRACTOR_PROGRESS'
  ],
  vendor: [
    'VIEW_PUBLIC_PROJECTS',
    'REGISTER_VENDOR'
  ],
  ministry: [
    'VIEW_PUBLIC_PROJECTS',
    'VIEW_FINANCIAL_PFMS',
    'VIEW_DETAILED_RISK_FACTORS',
    'ACCORD_ADMINISTRATIVE_SANCTION',
    'DISBURSE_TREASURY_FUNDS',
    'TRIGGER_STATUTORY_AUDIT',
    'EXPORT_LEGAL_COMPENDIUM'
  ],
  citizen: [
    'VIEW_PUBLIC_PROJECTS',
    'VIEW_FINANCIAL_PFMS',
    'SUBMIT_CITIZEN_OBSERVATION'
  ]
};

export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  role: UserRole;
  action: string;
  permissionRequired?: SecurityPermission;
  resourceId?: string;
  status: 'AUTHORIZED' | 'DENIED' | 'TAMPER_DETECTED';
  details?: string;
}

const AUDIT_LOG_KEY = 'mplads_security_audit_trail';

/**
 * Validates if the current role holds the designated statutory permission.
 */
export function hasPermission(role: UserRole, permission: SecurityPermission): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

/**
 * Records an immutable security audit event into client audit storage.
 */
export function recordSecurityEvent(
  role: UserRole,
  action: string,
  permission: SecurityPermission,
  status: 'AUTHORIZED' | 'DENIED' | 'TAMPER_DETECTED',
  resourceId?: string,
  details?: string
): SecurityAuditEvent {
  const event: SecurityAuditEvent = {
    id: `SEC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    role,
    action,
    permissionRequired: permission,
    resourceId,
    status,
    details
  };

  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    const trail: SecurityAuditEvent[] = raw ? JSON.parse(raw) : [];
    // Keep most recent 100 security events
    const updated = [event, ...trail].slice(0, 100);
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[RBAC Audit] Failed to record security event:', err);
  }

  return event;
}

/**
 * Retrieves the security audit trail.
 */
export function getSecurityAuditTrail(): SecurityAuditEvent[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
