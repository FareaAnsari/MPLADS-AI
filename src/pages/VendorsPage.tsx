import React, { useState } from 'react';
import { MOCK_VENDORS, MOCK_PROJECTS } from '../data/mockData';
import { VendorRegistrationModal } from '../components/VendorRegistrationModal';
import { Store, PlusCircle, AlertCircle, CheckCircle, Search, ExternalLink } from 'lucide-react';

export const VendorsPage: React.FC = () => {
  const [vendorList, setVendorList] = useState(MOCK_VENDORS);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Cement', 'Electrical', 'Pipes & Sanitation', 'Construction Materials', 'Solar & Energy'];

  const filtered = vendorList.filter(v => {
    if (selectedCategory !== 'All' && v.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.gst.toLowerCase().includes(q) || v.contactPerson.toLowerCase().includes(q);
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
            placeholder="Search vendor name, GSTIN..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
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
                    {v.address ? `State: ${v.address}` : 'State: Data Not Available'} • Contact: {v.contactPerson && v.contactPerson !== 'Data Not Available' ? v.contactPerson : 'Data Not Available'}
                  </span>
                </td>
                <td className="text-xs font-mono">
                  <span className="font-semibold text-slate-700 block">{v.gst && v.gst !== 'Data Not Available' ? v.gst : 'Data Not Available'}</span>
                  <span className="text-[10px] text-slate-400">{v.registrationNo && v.registrationNo !== 'Data Not Available' ? v.registrationNo : 'Reg: Data Not Available'}</span>
                </td>
                <td className="text-xs font-medium text-slate-800">{v.category || 'Official Vendor'}</td>
                <td className="text-xs text-slate-600 max-w-xs">
                  {v.products && v.products.length > 0 ? v.products.join(', ') : 'Data Not Available'}
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
                    onClick={() => alert(`Opening vendor profile for ${v.name}`)}
                    className="text-gov-blue hover:text-gov-navy text-xs font-semibold px-2 py-1 rounded hover:bg-blue-50"
                  >
                    View Orders
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <VendorRegistrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onRegistered={(newV) => setVendorList([newV, ...vendorList])}
      />
    </div>
  );
};
