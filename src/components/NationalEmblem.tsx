import React from 'react';
import emblemImg from '../assets/images/national_emblem.png';

interface NationalEmblemProps {
  className?: string;
}

export const NationalEmblem: React.FC<NationalEmblemProps> = ({ className = "w-12 h-16 sm:w-14 sm:h-18" }) => {
  return (
    <div className={`flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      <img
        src={emblemImg}
        alt="State Emblem of India - Lion Capital of Ashoka with Satyameva Jayate"
        className="w-full h-full object-contain object-center drop-shadow-sm"
        loading="eager"
      />
    </div>
  );
};


