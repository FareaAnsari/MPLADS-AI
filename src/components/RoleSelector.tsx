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
  ChevronDown 
} from 'lucide-react';
import fareaImg from '../assets/images/farea_avatar.jpg';
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

        {/* Right: Date & User Profile with Real Avatar Photo (Matching Image 1) */}
        <div className="flex items-center space-x-4 self-end md:self-auto text-xs text-slate-600">
          
          <div className="flex items-center space-x-1.5 text-slate-700 hidden sm:flex font-medium text-xs">
            <span>Sunday, 14 September 2026</span>
            <div className="w-5 h-5 rounded bg-[#1a6cd3] text-white flex items-center justify-center">
              <Calendar className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>

          {/* User Profile matching Image 1 */}
          <div className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition">
            <img 
              src={fareaImg} 
              alt="Farea Ansari" 
              className="w-8 h-8 rounded-full object-cover border border-slate-300 shadow-xs"
            />
            <div className="leading-tight text-left">
              <div className="font-bold text-slate-900 text-xs flex items-center">
                <span>{t('district_auth_name')}</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center">
                <span>{t('district_auth_loc')}</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

