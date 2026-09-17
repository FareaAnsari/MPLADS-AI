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

          {/* Center: Legal Policies matching screenshot */}
          <div className="md:col-span-5 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2.5 gap-y-1 text-[11px] text-slate-300">
              <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
              <span className="text-slate-600">|</span>
              <Link to="/terms" className="hover:text-white transition">Terms of Use</Link>
              <span className="text-slate-600">|</span>
              <Link to="/hyperlinking-policy" className="hover:text-white transition">Hyperlinking Policy</Link>
              <span className="text-slate-600">|</span>
              <Link to="/accessibility" className="hover:text-white transition">Accessibility Statement</Link>
              <span className="text-slate-600">|</span>
              <Link to="/copyright" className="hover:text-white transition">Copyright Policy</Link>
              <span className="text-slate-600">|</span>
              <Link to="/help" className="hover:text-white transition">Help</Link>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Website designed, developed and hosted by National Informatics Centre (NIC) / MoSPI.
            </p>
          </div>

          {/* Right: National Portal of India & RTI badge */}
          <div className="md:col-span-3 flex flex-col sm:flex-row items-center md:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            {/* Social Icons */}
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="p-1 rounded bg-slate-800 hover:text-white cursor-pointer font-bold text-xs" title="X (Twitter)">𝕏</span>
              <span className="p-1 rounded bg-slate-800 hover:text-white cursor-pointer font-bold text-xs" title="Facebook">f</span>
              <span className="p-1 rounded bg-slate-800 hover:text-white cursor-pointer font-bold text-xs" title="YouTube">▶</span>
              <span className="p-1 rounded bg-slate-800 hover:text-white cursor-pointer font-bold text-xs" title="Instagram">📷</span>
            </div>

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

            {/* RTI emblem placeholder */}
            <div className="flex items-center space-x-1 px-1.5 py-1 bg-white/10 rounded border border-white/20 text-[9px] text-white font-medium" title="Right to Information">
              <span className="text-amber-400 font-bold">RTI</span>
              <span className="text-[7.5px] leading-none text-slate-300">सूचना का<br/>अधिकार</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="bg-[#05162b] py-2 px-4 text-center text-[10px] text-slate-400 border-t border-slate-800">
        <span>© 2026 Ministry of Statistics and Programme Implementation, Government of India. All Rights Reserved.</span>
        <span className="ml-2 text-slate-400">Content Last Updated: 14 September 2026 | Version 2.6.4</span>
      </div>
    </footer>
  );
};
