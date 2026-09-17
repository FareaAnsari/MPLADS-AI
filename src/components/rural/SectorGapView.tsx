import React from 'react';
import { LGDVillage } from '../../types/rural';
import { Layers, Info, CheckCircle2 } from 'lucide-react';

interface Props {
  village?: LGDVillage;
  villages?: LGDVillage[];
}

export const SectorGapView: React.FC<Props> = ({ village, villages }) => {
  // Aggregate sectors either for a single village or collection
  const targetVillages = village ? [village] : villages || [];

  const sectorCounts: Record<string, { count: number; expenditure: number }> = {};

  targetVillages.forEach(v => {
    v.projects.forEach(p => {
      if (!sectorCounts[p.sector]) {
        sectorCounts[p.sector] = { count: 0, expenditure: 0 };
      }
      sectorCounts[p.sector].count += 1;
      sectorCounts[p.sector].expenditure += p.expenditure;
    });
  });

  const totalWorks = Object.values(sectorCounts).reduce((acc, curr) => acc + curr.count, 0);

  const sortedSectors = Object.entries(sectorCounts).sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="bg-white rounded-gov border border-gov-border shadow-gov p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-gov-border pb-2.5">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-gov-navy" />
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
            Recorded Works by Sector
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          {sortedSectors.length} Active Sectors Mapped
        </span>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-[11px] text-blue-900 leading-relaxed flex items-start space-x-2">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong>Methodology Note:</strong> This view displays recorded MPLADS works categorized by sector.
          <strong> A missing sector does not indicate that the village lacks that facility.</strong> Rural infrastructure is delivered through diverse Central and State programmes (such as PMGSY for roads, Jal Jeevan Mission for drinking water, Samagra Shiksha for schools, and Ayushman Bharat for health sub-centres).
        </div>
      </div>

      {/* Sector Breakdown Bars */}
      {sortedSectors.length > 0 ? (
        <div className="space-y-3">
          {sortedSectors.map(([sectorName, data]) => {
            const percent = totalWorks > 0 ? Math.round((data.count / totalWorks) * 100) : 0;
            return (
              <div key={sectorName} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">{sectorName}</span>
                  <div className="text-[11px] text-slate-500 space-x-2">
                    <span className="font-bold text-gov-navy">{data.count} {data.count === 1 ? 'work' : 'works'}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-700 font-medium">₹{(data.expenditure / 100000).toFixed(2)} Lakhs</span>
                    <span className="text-slate-400">({percent}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gov-navy h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(percent, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-slate-400 text-xs italic">
          No recorded sector works found in the current selection.
        </div>
      )}
    </div>
  );
};
