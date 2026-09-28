import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { NationalEmblem } from './NationalEmblem';

export const GovernmentFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#071f3d] text-slate-300 border-t-2 border-[#FF9933] text-xs">
      {/* Upper footer with disclaimers and links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

          {/* Left: Ministry Emblem and text */}
          <div className="md:col-span-4 flex items-center space-x-3">
            {/* Authentic State Emblem of India Component */}
            <div className="bg-white/95 p-1 rounded shadow-xs flex-shrink-0">
              <NationalEmblem className="w-9 h-12" />
            </div>

            <div className="border-l border-slate-600 pl-3">
              <span className="font-bold text-white text-xs block">Government of India</span>
              <span className="text-[11px] text-slate-300 block leading-tight">
                Ministry of Statistics & Programme Implementation
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Members of Parliament Local Area Development Scheme
              </span>
            </div>
          </div>


          {/* Right: National Portal of India & RTI badge */}
          <div className="md:col-span-3 flex flex-col sm:flex-row items-center md:justify-end space-y-2 sm:space-y-0 sm:space-x-3">


            {/* India.gov.in badge */}
            <a
              href="https://www.india.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-2 py-1 bg-slate-800/90 rounded border border-slate-700 hover:border-slate-500 transition text-[10px]"
            >
              <div className="leading-tight">
                <span className="font-bold text-white block">india.gov.in</span>
                <span className="text-[8px] text-slate-400 block">national portal of india</span>
              </div>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>


          </div>

        </div>
      </div>


    </footer>
  );
};
