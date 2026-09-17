import React, { useState } from 'react';
import { X, CheckCircle, Upload, Building2, Store } from 'lucide-react';

interface VendorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: (newVendor: any) => void;
}

export const VendorRegistrationModal: React.FC<VendorRegistrationModalProps> = ({ isOpen, onClose, onRegistered }) => {
  const [formData, setFormData] = useState({
    name: '',
    orgType: 'Private Limited',
    registrationNo: '',
    gst: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    category: 'Cement',
    products: '',
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      if (onRegistered) {
        onRegistered({
          ...formData,
          id: `VEND-00${Math.floor(Math.random() * 90) + 10}`,
          products: formData.products.split(',').map(p => p.trim()),
          status: 'Active',
          riskLevel: 'LOW',
          projectsCount: 1,
          totalOrders: 1,
          totalInvoicesValue: 500000,
          totalPaid: 450000,
        });
      }
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-gov border border-slate-300 shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0b2e59] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm tracking-wide">
              E-Marketplace Vendor Registration Form
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {submitted ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-slate-800">Vendor Registered Successfully</h4>
              <p className="text-xs text-slate-600">
                GSTIN verification confirmed. The vendor profile is now active on the MPLADS supplier index.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Vendor Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apex Stone & Sand Suppliers"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Organization Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.orgType}
                    onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
                  >
                    <option value="Private Limited">Private Limited</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Proprietorship">Proprietorship</option>
                    <option value="LLP">LLP</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    GSTIN (15 Digits) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={15}
                    value={formData.gst}
                    onChange={(e) => setFormData({ ...formData, gst: e.target.value.toUpperCase() })}
                    placeholder="27AABCS1429B1ZX"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase focus:ring-1 focus:ring-gov-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Registration / Udyam No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.registrationNo}
                    onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                    placeholder="UDYAM-MH-12-00412"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Primary Product Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
                  >
                    <option value="Cement">Cement & Ready Mix</option>
                    <option value="Electrical">Electrical & Cables</option>
                    <option value="Pipes & Sanitation">Pipes & Sanitation</option>
                    <option value="Construction Materials">Construction Materials (Sand, Bricks, Steel)</option>
                    <option value="Solar & Energy">Solar & Energy Systems</option>
                    <option value="Steel & Hardware">Steel & Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Contact Person Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Full Name"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98220 00000"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sales@vendor.com"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Product Line / Catalogue Items (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.products}
                  onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                  placeholder="e.g. Portland Cement 53G, M25 Ready Mix, Fine River Sand"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Registered Business Address <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, Industrial Area, Taluk, District, PIN"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
                />
              </div>

              {/* Upload Document */}
              <div className="p-3 border border-dashed border-slate-300 rounded bg-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600 text-[11px]">Attach GST Registration Certificate & PAN (PDF &lt; 5MB)</span>
                </div>
                <span className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-100">
                  Browse File
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gov-navy hover:bg-[#071f3d] text-white font-bold rounded shadow-xs"
                >
                  Submit & Register Vendor
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
