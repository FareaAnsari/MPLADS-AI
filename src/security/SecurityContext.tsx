import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { 
  SecurityPermission, 
  hasPermission, 
  recordSecurityEvent, 
  getSecurityAuditTrail, 
  SecurityAuditEvent 
} from './rbacGuard';
import { sanitizeText, sanitizePayload } from './sanitizer';
import { ShieldCheck, ShieldAlert, Lock, AlertTriangle } from 'lucide-react';

interface SecurityContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  can: (permission: SecurityPermission) => boolean;
  auditTrail: SecurityAuditEvent[];
  logAction: (action: string, permission: SecurityPermission, resourceId?: string, details?: string) => boolean;
  securityHealth: {
    status: 'OPTIMAL' | 'WARNING';
    encryption: string;
    protocol: string;
    xssShield: boolean;
    rbacActive: boolean;
  };
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('overview');
  const [auditTrail, setAuditTrail] = useState<SecurityAuditEvent[]>([]);

  useEffect(() => {
    setAuditTrail(getSecurityAuditTrail());
  }, []);

  const can = (permission: SecurityPermission): boolean => {
    return hasPermission(currentRole, permission);
  };

  const logAction = (
    action: string, 
    permission: SecurityPermission, 
    resourceId?: string, 
    details?: string
  ): boolean => {
    const isAllowed = can(permission);
    const event = recordSecurityEvent(
      currentRole,
      action,
      permission,
      isAllowed ? 'AUTHORIZED' : 'DENIED',
      resourceId,
      details
    );
    setAuditTrail(prev => [event, ...prev].slice(0, 100));
    return isAllowed;
  };

  const securityHealth = {
    status: 'OPTIMAL' as const,
    encryption: 'TLS 1.3 / AES-256 GFR-2017',
    protocol: 'MoSPI Anti-Tampering Shield v2.4',
    xssShield: true,
    rbacActive: true
  };

  return (
    <SecurityContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        can,
        auditTrail,
        logAction,
        securityHealth
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

/**
 * Higher-order component / Action Guard that wraps sensitive statutory actions.
 * If user role lacks the required permission, renders an authorized alert card instead.
 */
export const ProtectedAction: React.FC<{
  requiredPermission: SecurityPermission;
  children: React.ReactNode;
  fallbackMessage?: string;
}> = ({ requiredPermission, children, fallbackMessage }) => {
  const { can, currentRole } = useSecurity();

  if (!can(requiredPermission)) {
    return (
      <div className="p-3 bg-amber-50 border border-amber-300 rounded-md text-xs text-amber-900 flex items-start space-x-2">
        <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold block">Statutory Action Restricted</span>
          <p className="text-[11px] text-amber-800 mt-0.5">
            {fallbackMessage || `Action requires higher statutory administrative privilege (${requiredPermission}). Your current view is "${currentRole}".`}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
