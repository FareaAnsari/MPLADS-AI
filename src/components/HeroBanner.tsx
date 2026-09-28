import React, { useState } from 'react';
import { UserCheck, Users, Scale, Building2 } from 'lucide-react';
import heroImg from '../assets/images/hero_parliament.jpg';
import rahulImg from '../assets/images/rahul_gandhi_square.jpg';
import { useLanguage } from '../contexts/LanguageContext';

export const HeroBanner: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(1);
  const { t } = useLanguage();

  return (
    <div className="relative w-full bg-[#f8fafc] border-b border-slate-200 overflow-hidden shadow-2xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3.5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Left Column: Hon'ble Leader of Opposition (LoP) Photo & Quote Card */}
          <div className="lg:col-span-4 flex items-center space-x-3.5 pr-2">
            
            {/* Leader of Opposition (LoP) Rahul Gandhi Portrait */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-200 shadow-sm bg-white relative">
              <img 
                src={rahulImg} 
                alt="Hon'ble Leader of Opposition Rahul Gandhi" 
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* LoP Quote in Formal Serif */}
            <div className="space-y-1">
              <blockquote className="text-xs sm:text-[13px] font-serif text-slate-800 leading-snug font-medium">
                {t('lop_quote') || t('pm_quote')}
              </blockquote>
              <div className="text-[11px] text-slate-700 font-sans pt-0.5">
                <span className="font-bold text-slate-900">— {t('lop_name') || t('pm_name')}</span>
                <span className="text-slate-500 block sm:inline sm:ml-1 text-[10.5px]">
                  {t('lop_designation') || t('pm_designation')}
                </span>
              </div>
            </div>
          </div>

          {/* Center Column: Parliament House Architecture Banner (Exact Match) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full h-32 sm:h-36 rounded-md overflow-hidden shadow-xs border border-slate-200 relative group">
              <img 
                src={heroImg} 
                alt="New Sansad Bhavan - Parliament House of India" 
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
            </div>
            
            {/* Carousel Navigation Dots */}
            <div className="flex items-center space-x-1.5 mt-2">
              <button 
                onClick={() => setActiveSlide(0)}
                className={`w-2 h-2 rounded-full transition-all ${activeSlide === 0 ? 'bg-slate-800 w-2.5' : 'bg-slate-300'}`}
                aria-label="Slide 1"
              ></button>
              <button 
                onClick={() => setActiveSlide(1)}
                className={`w-2 h-2 rounded-full transition-all ${activeSlide === 1 ? 'bg-slate-800 w-2.5' : 'bg-slate-300'}`}
                aria-label="Slide 2"
              ></button>
              <button 
                onClick={() => setActiveSlide(2)}
                className={`w-2 h-2 rounded-full transition-all ${activeSlide === 2 ? 'bg-slate-800 w-2.5' : 'bg-slate-300'}`}
                aria-label="Slide 3"
              ></button>
              <button 
                onClick={() => setActiveSlide(3)}
                className={`w-2 h-2 rounded-full transition-all ${activeSlide === 3 ? 'bg-slate-800 w-2.5' : 'bg-slate-300'}`}
                aria-label="Slide 4"
              ></button>
            </div>
          </div>

          {/* Right Column: People's Vision & 4 Pillars (Exact Match) */}
          <div className="lg:col-span-3 flex flex-col justify-center lg:items-center text-center">
            <div className="mb-2">
              <h2 className="text-lg sm:text-[20px] font-serif font-bold text-[#0b2e59] tracking-tight">
                {t('peoples_vision')}
              </h2>
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#0b2e59] tracking-tight -mt-0.5">
                {t('projects_for_progress')}
              </h3>
            </div>

            {/* 4 Pillars with Circular Outlined Icons */}
            <div className="grid grid-cols-4 gap-2 w-full pt-1">
              
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-slate-300 bg-white shadow-xs flex items-center justify-center text-slate-700 hover:border-blue-600 hover:text-blue-600 transition">
                  <Scale className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium text-slate-700 mt-1">{t('pillar_transparency')}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-slate-300 bg-white shadow-xs flex items-center justify-center text-slate-700 hover:border-emerald-600 hover:text-emerald-600 transition">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium text-slate-700 mt-1">{t('pillar_accountability')}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-slate-300 bg-white shadow-xs flex items-center justify-center text-slate-700 hover:border-blue-600 hover:text-blue-600 transition">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium text-slate-700 mt-1">{t('pillar_inclusive')}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-slate-300 bg-white shadow-xs flex items-center justify-center text-slate-700 hover:border-amber-600 hover:text-amber-600 transition">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium text-slate-700 mt-1">{t('pillar_lasting_assets')}</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


