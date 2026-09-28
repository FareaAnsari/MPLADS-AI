import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_VENDORS } from '../data/mockData';
import { ArrowRight, PlusCircle, AlertCircle } from 'lucide-react';

interface VendorMarketplaceTableProps {
  onRegisterClick?: () => void;
}

export const VendorMarketplaceTable: React.FC<VendorMarketplaceTableProps> = ({ onRegisterClick }) => {
  const navigate = useNavigate();
  const displayVendors = MOCK_VENDORS.slice(0, 5);

  return (
    <div className="bg-white rounded-gov border border-gov-border shadow-gov p-4 flex flex-col justify-between h-full">
      {/* Header with Register Vendor Button */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
        <h3 className="text-sm font-bold text-slate-800">
          Vendor Marketplace
        </h3>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRegisterClick ? onRegisterClick : () => navigate('/vendors?register=true')}
            className="bg-gov-blue hover:bg-[#14437a] text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center space-x-1 shadow-xs transition"
          >
            <PlusCircle className="w-3 h-3" />
            <span>Register Vendor</span>
          </button>
          <button
            onClick={() => navigate('/vendors')}
            className="text-gov-blue hover:text-gov-navy text-xs font-semibold flex items-center"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto my-2">
        <table className="w-full text-left gov-table">
          <thead>
            <tr>
              <th className="w-8">#</th>
              <th>Vendor Name</th>
              <th>Category</th>
              <th>Products</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayVendors.map((v, idx) => {
              const isHighRisk = v.riskLevel === 'HIGH';
              return (
                <tr 
                  key={v.id} 
                  className="hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => navigate(`/vendors?id=${v.id}`)}
                >
                  <td className="font-semibold text-slate-400">{idx + 1}</td>
                  <td>
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-slate-900 line-clamp-1 hover:text-gov-blue transition">
                        {v.name}
                      </span>
                      {isHighRisk && (
                        <span title="Material price variance anomaly linked to this vendor">
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      GSTIN: {v.gst}
                    </span>
                  </td>
                  <td className="text-slate-700 text-xs font-medium">{v.category}</td>
                  <td className="text-slate-600 text-xs line-clamp-1 max-w-[150px]">
                    {v.products.slice(0, 2).join(', ')}
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                      v.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/vendors?id=${v.id}`)}
                      className="text-gov-blue hover:text-gov-navy text-xs font-semibold px-2 py-0.5 rounded hover:bg-blue-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Verified GST & GeM E-Marketplace Registered Vendors</span>
        <span className="text-gov-blue cursor-pointer font-medium" onClick={() => navigate('/vendors')}>
          Material Price Intelligence →
        </span>
      </div>
    </div>
  );
};
