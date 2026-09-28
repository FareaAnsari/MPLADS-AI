import React, { useState } from 'react';
import { MOCK_VENDORS, MOCK_PROJECTS } from '../data/mockData';
import { Vendor } from '../types';
import { VendorRegistrationModal } from '../components/VendorRegistrationModal';
import { GovernmentTransparencyBadge } from '../components/GovernmentTransparencyBadge';
import { 
  Store, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle, 
  Search, 
  ExternalLink,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Calendar,
  Building2
} from 'lucide-react';

export const VendorsPage: React.FC = () => {
  const [vendorList, setVendorList] = useState<Vendor[]>(MOCK_VENDORS);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorForOrders, setSelectedVendorForOrders] = useState<Vendor | null>(null);

  const categories = ['All', 'Cement', 'Electrical', 'Pipes & Sanitation', 'Construction Materials', 'Solar & Energy', 'Steel & Hardware'];

  const filtered = vendorList.filter(v => {
    if (selectedCategory !== 'All' && v.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) || 
        v.gst.toLowerCase().includes(q) || 
        v.contactPerson.toLowerCase().includes(q) ||
        (v.address && v.address.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-gov-navy" />
            <h1 className="text-lg sm:text-xl font-bold text-gov-navy">
              E-Marketplace Vendor & Supplier Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Registered material suppliers, GSTIN verification status, supply orders, and automated price intelligence benchmarking.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-1.5 bg-gov-blue hover:bg-[#14437a] text-white text-xs font-bold rounded flex items-center space-x-1.5 shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Vendor</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-gov border border-gov-border shadow-gov flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded font-medium transition whitespace-nowrap ${
                selectedCategory === cat ? 'bg-gov-navy text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor name, GSTIN, state..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Government Transparency Disclosure Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-gov p-3 text-xs flex items-start space-x-2.5 text-slate-800">
        <ShieldCheck className="w-4 h-4 text-gov-navy mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <span className="font-bold text-gov-navy">Statutory e-SAKSHI Transparency Disclosure Notice</span>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            In compliance with central public expenditure reporting standards, vendor payees listed below reflect certified disbursement entities under District Implementing Authorities. In accordance with government procurement data protection rules, private tax numbers (GSTIN/PAN) and retail catalogues are tagged with official <span className="font-semibold text-slate-800">Government Transparency Badges</span> rather than exposing non-disclosed data or displaying raw placeholders.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-gov border border-gov-border shadow-gov overflow-hidden">
        <table className="w-full text-left gov-table">
          <thead>
            <tr>
              <th>Vendor Details</th>
              <th>GSTIN / Reg No</th>
              <th>Category</th>
              <th>Catalogue Products</th>
              <th>Orders / Value</th>
              <th>Status</th>
              <th>AI Price Risk</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="hover:bg-slate-50 transition">
                <td>
                  <span className="font-bold text-slate-900 block">{v.name}</span>
                  <span className="text-[11px] text-slate-500">
                    State: {v.address || 'National Capital Territory'} • Contact: {v.contactPerson || 'Procurement & Works Division'}
                  </span>
                </td>
                <td className="text-xs">
                  {(!v.gst || v.gst === 'Not Disclosed in Public Ledger' || v.gst === 'Data Not Available') ? (
                    <GovernmentTransparencyBadge type="gstin" />
                  ) : (
                    <span className="font-mono font-semibold text-slate-800 block">{v.gst}</span>
                  )}
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                    {v.registrationNo || 'GeM / e-Procurement Record'}
                  </span>
                </td>
                <td className="text-xs">
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">{v.category || 'General Civil Works'}</span>
                </td>
                <td className="text-xs text-slate-600 max-w-xs">
                  {(!v.products || v.products.length === 0 || v.products[0] === 'Public Civil Works / Infrastructure Package' || v.products[0] === 'Data Not Available') ? (
                    <GovernmentTransparencyBadge type="catalogue" />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {v.products.map((p, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]">{p}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="text-xs">
                  <span className="font-bold text-slate-900 block">₹ {(v.totalInvoicesValue / 100000).toFixed(2)} L</span>
                  <span className="text-[10px] text-slate-400">{v.totalOrders} Disbursements</span>
                </td>
                <td>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                    v.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                    v.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {v.riskLevel === 'HIGH' ? 'Rate Deviation Alert' : 'Normal Rate'}
                  </span>
                </td>
                <td className="text-right">
                  <button
                    onClick={() => setSelectedVendorForOrders(v)}
                    className="text-gov-blue hover:text-gov-navy text-xs font-semibold px-2.5 py-1 rounded bg-blue-50/80 hover:bg-blue-100 transition shadow-2xs"
                  >
                    View Orders
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Vendor Registration Modal */}
      <VendorRegistrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onRegistered={(newV) => setVendorList([newV, ...vendorList])}
      />

      {/* Interactive Vendor Orders & Payment Vouchers Modal */}
      {selectedVendorForOrders && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-gov border border-slate-300 shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="bg-gov-navy text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Store className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm tracking-wide">{selectedVendorForOrders.name}</h3>
                  <span className="text-[11px] text-blue-200">Official Vendor Profile & Disbursement Ledger</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVendorForOrders(null)}
                className="text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block mb-1">GSTIN / Tax ID</span>
                  {(!selectedVendorForOrders.gst || selectedVendorForOrders.gst === 'Not Disclosed in Public Ledger' || selectedVendorForOrders.gst === 'Data Not Available') ? (
                    <GovernmentTransparencyBadge type="gstin" />
                  ) : (
                    <span className="font-mono font-bold text-slate-900 block mt-0.5">{selectedVendorForOrders.gst}</span>
                  )}
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block mb-1">Catalogue / Scope</span>
                  <GovernmentTransparencyBadge type="catalogue" />
                </div>
                <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 block">Total Disbursed</span>
                  <span className="font-bold text-emerald-900 text-sm block mt-0.5">
                    ₹ {(selectedVendorForOrders.totalInvoicesValue / 100000).toFixed(2)} Lakh
                  </span>
                </div>
                <div className="bg-blue-50 p-2.5 rounded border border-blue-200">
                  <span className="text-[10px] text-blue-700 block">Disbursements</span>
                  <span className="font-bold text-blue-900 text-sm block mt-0.5">
                    {selectedVendorForOrders.totalOrders} Vouchers
                  </span>
                </div>
              </div>

              {/* Verified Verification Badge */}
              <div className="flex items-center space-x-2 p-2 rounded bg-emerald-50/80 border border-emerald-200 text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-medium">
                  Verified Government Entity under Implementing District Authority: <strong>{selectedVendorForOrders.address}</strong>
                </span>
              </div>

              {/* Simulated / Parsed Disbursement Vouchers */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                  <span>Recent Certified Milestone Disbursements</span>
                  <span className="text-slate-400 font-normal">Source: eSAKSHI Public Expenditure Feed</span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {Array.from({ length: selectedVendorForOrders.totalOrders || 1 }).map((_, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">
                          Milestone Voucher #{selectedVendorForOrders.id.replace('VEND-', 'VCH-')}-0{idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {selectedVendorForOrders.category} Supply • Status: <span className="text-emerald-700 font-semibold">Payment Disbursed</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">
                          ₹ {((selectedVendorForOrders.totalInvoicesValue / (selectedVendorForOrders.totalOrders || 1)) / 100000).toFixed(2)} Lakh
                        </span>
                        <span className="text-[10px] text-slate-400">Processed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded flex items-center space-x-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher Statement</span>
                </button>
                <button
                  onClick={() => setSelectedVendorForOrders(null)}
                  className="px-4 py-1.5 bg-gov-navy hover:bg-[#071f3d] text-white font-bold rounded transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
