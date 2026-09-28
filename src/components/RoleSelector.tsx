import React from 'react';
import { UserRole } from '../types';
import { 
  User, 
  Award, 
  Briefcase, 
  Store, 
  Landmark, 
  Users2, 
  Calendar,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ currentRole, onRoleChange }) => {
  const { t } = useLanguage();

  const roles: { id: UserRole; labelKey: string; icon: React.ReactNode }[] = [
    { id: 'overview', labelKey: 'role_overview', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'mp', labelKey: 'role_mp', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'district', labelKey: 'role_district', icon: <Landmark className="w-3.5 h-3.5" /> },
    { id: 'contractor', labelKey: 'role_contractor', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'vendor', labelKey: 'role_vendor', icon: <Store className="w-3.5 h-3.5" /> },
    { id: 'ministry', labelKey: 'role_ministry', icon: <BuildingIcon className="w-3.5 h-3.5" /> },
    { id: 'citizen', labelKey: 'role_citizen', icon: <Users2 className="w-3.5 h-3.5" /> },
  ];

  function BuildingIcon(props: any) {
    return (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      </svg>
    );
  }

  return (
    <div className="bg-[#edf4fb] border-b border-slate-200 px-4 sm:px-6 py-2 shadow-2xs">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Role Navigation Pills (Matching Image 1) */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {roles.map((role) => {
            const isSelected = currentRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => onRoleChange(role.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#1a6cd3] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{role.icon}</span>
                <span>{t(role.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Security Status, Date & User Profile */}
        <div className="flex items-center space-x-3 self-end md:self-auto text-xs text-slate-600">
          
          {/* Cyber Security Assurance Pill */}
          <div 
            title="MoSPI Cyber Security Layer Active: GFR-2017 RBAC, Anti-Tamper Request Signing & XSS Shield Active"
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 font-medium text-[11px] shadow-2xs cursor-default"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-500 hidden xl:inline">Security:</span>
            <span className="font-semibold text-emerald-900">GFR-2017 & Anti-Tamper Active</span>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-700 hidden md:flex font-medium text-xs">
            <span>{new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span>
            <div className="w-5 h-5 rounded bg-[#1a6cd3] text-white flex items-center justify-center">
              <Calendar className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>


        </div>

      </div>
    </div>
  );
};

