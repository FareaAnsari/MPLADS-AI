import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Coins, 
  Handshake, 
  ArrowRight,
  Clock,
  CheckCircle2,
  HardHat
} from 'lucide-react';

export const KPIStatCards: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 my-3">
      
      {/* 1. Total MPs */}
      <div 
        onClick={() => navigate('/mps')}
        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Total MPs</span>
            <span className="text-xl font-bold text-slate-900 leading-tight block mt-0.5">543</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">(All India)</span>
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

      {/* 2. Total Projects */}
      <div 
        onClick={() => navigate('/projects')}
        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Total Projects</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-xl font-bold text-slate-900 leading-tight">28,416</span>
              <span className="text-[10px] font-bold text-emerald-600">↑ 12%</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">(All Years)</span>
          </div>
          <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-blue-600 font-semibold text-[10.5px]">
          <span>View Projects</span>
          <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
        </div>
      </div>

      {/* 3. Sanctioned Amount */}
      <div 
        onClick={() => navigate('/funds')}
        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Sanctioned Amount</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-xl font-bold text-slate-900 leading-tight">₹ 56,820 Cr</span>
              <span className="text-[10px] font-bold text-emerald-600">↑ 8%</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">(All Years)</span>
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

      {/* 4. Contracts Awarded */}
      <div 
        onClick={() => navigate('/contracts')}
        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Contracts Awarded</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-xl font-bold text-slate-900 leading-tight">21,304</span>
              <span className="text-[10px] font-bold text-emerald-600">↑ 15%</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
            <Handshake className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-blue-600 font-semibold text-[10.5px]">
          <span>View Contracts</span>
          <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
        </div>
      </div>

      {/* 5. In Progress */}
      <div 
        onClick={() => navigate('/projects?status=IN%20PROGRESS')}
        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">In Progress</span>
            <span className="text-xl font-bold text-slate-900 leading-tight block mt-0.5">6,832</span>
            <div className="flex items-center space-x-1.5 mt-1.5">
              <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '24%' }}></div>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">24%</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
            <HardHat className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-blue-600 font-semibold text-[10.5px]">
          <span>View Details</span>
          <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
        </div>
      </div>

      {/* 6. Completed */}
      <div 
        onClick={() => navigate('/projects?status=COMPLETED')}
        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Completed</span>
            <span className="text-xl font-bold text-slate-900 leading-tight block mt-0.5">19,402</span>
            <div className="flex items-center space-x-1.5 mt-1.5">
              <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '68%' }}></div>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">68%</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-blue-600 font-semibold text-[10.5px]">
          <span>View Assets</span>
          <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
        </div>
      </div>

      {/* 7. Delayed */}
      <div 
        onClick={() => navigate('/projects?status=DELAYED')}
        className="bg-white rounded-md border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Delayed</span>
            <span className="text-xl font-bold text-slate-900 leading-tight block mt-0.5">2,212</span>
            <div className="flex items-center space-x-1.5 mt-1.5">
              <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '8%' }}></div>
              </div>
              <span className="text-[10px] font-semibold text-rose-500">8%</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-blue-600 font-semibold text-[10.5px]">
          <span>View Delayed</span>
          <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
        </div>
      </div>

    </div>
  );
};
