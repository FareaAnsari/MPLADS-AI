import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Coins, 
  Handshake, 
  ArrowRight,
  CheckCircle2,
  Building2,
  Globe2
} from 'lucide-react';
import { ESAKSHI_OFFICIAL_METRICS } from '../data/mockData';

export const KPIStatCards: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 my-3">
      
      {/* 1. Total MPs */}
      <div 
        onClick={() => navigate('/mps')}
        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Total MPs</span>
            <span className="text-xl font-bold text-slate-900 leading-tight block mt-0.5">
              {ESAKSHI_OFFICIAL_METRICS.totalConstituencies}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">(Lok Sabha + Rajya Sabha)</span>
          </div>
          <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-blue-600 font-semibold text-[10.5px]">
          <span>View MPs</span>
          <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
        </div>
      </div>

      {/* 2. Works Recommended */}
      <div 
        onClick={() => navigate('/projects')}
        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Works Recommended</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-xl font-bold text-slate-900 leading-tight">
                {ESAKSHI_OFFICIAL_METRICS.worksRecommendedCount.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">₹ {ESAKSHI_OFFICIAL_METRICS.worksRecommendedCr} Cr</span>
          </div>
          <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-blue-600 font-semibold text-[10.5px]">
          <span>View Registry</span>
          <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
        </div>
      </div>

      {/* 3. Works Sanctioned */}
      <div 
        onClick={() => navigate('/funds')}
        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Works Sanctioned</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-xl font-bold text-slate-900 leading-tight">
                {ESAKSHI_OFFICIAL_METRICS.worksSanctionedCount.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">₹ {ESAKSHI_OFFICIAL_METRICS.worksSanctionedCr} Cr</span>
          </div>
          <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-blue-600 font-semibold text-[10.5px]">
          <span>View Financials</span>
          <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
        </div>
      </div>

      {/* 4. Completed Works */}
      <div 
        onClick={() => navigate('/projects?status=COMPLETED')}
        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Works Completed</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-xl font-bold text-emerald-700 leading-tight">
                {ESAKSHI_OFFICIAL_METRICS.worksCompletedCount.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">₹ {ESAKSHI_OFFICIAL_METRICS.worksCompletedCr} Cr (100% Real Dataset)</span>
          </div>
          <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-blue-600 font-semibold text-[10.5px]">
          <span>View Completed</span>
          <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
        </div>
      </div>

      {/* 5. Vendor Disbursements */}
      <div 
        onClick={() => navigate('/vendors')}
        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Vendor Disbursements</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-xl font-bold text-slate-900 leading-tight">
                ₹ {ESAKSHI_OFFICIAL_METRICS.totalExpenditureVendorCr} Cr
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">(Official Payment Records)</span>
          </div>
          <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
            <Handshake className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-blue-600 font-semibold text-[10.5px]">
          <span>View Vendors</span>
          <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
        </div>
      </div>

      {/* 6. Active Constituencies Coverage */}
      <div 
        onClick={() => navigate('/national-data')}
        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Constituency Coverage</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-xl font-bold text-slate-900 leading-tight">100%</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">543 Lok Sabha Constituencies</span>
          </div>
          <div className="w-8 h-8 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center">
            <Globe2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-blue-600 font-semibold text-[10.5px]">
          <span>View Coverage</span>
          <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
        </div>
      </div>

    </div>
  );
};
