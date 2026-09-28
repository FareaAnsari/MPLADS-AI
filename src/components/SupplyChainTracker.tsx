import React, { useState } from 'react';
import { 
  Truck, 
  PackageCheck, 
  FileText, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Camera, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  ArrowRight, 
  TrendingDown, 
  ExternalLink,
  Plus,
  Scale
} from 'lucide-react';

export interface SupplyChainMaterial {
  id: string;
  materialType: string;
  category: 'Cement' | 'Steel' | 'Pipes & Sanitation' | 'Electrical & Solar' | 'Aggregates';
  orderedQty: number;
  unit: string;
  unitRate: number;
  benchmarkRate: number;
  vendorId: string;
  vendorName: string;
  vendorGstin: string;
  poRef: string;
  poDate: string;
  dispatchDate?: string;
  ewayBill?: string;
  dispatchedQty: number;
  deliveryDate?: string;
  deliveredQty: number;
  deliveryGps?: { lat: number; lng: number };
  deliveryPhotoUrl?: string;
  deliveryPhash?: string;
  isDuplicatePhoto?: boolean;
  duplicateMatchProjectId?: string;
  installedQty: number;
  installationDate?: string;
  mbRef?: string;
  reconciliationStatus: 'MATCHED' | 'UNDER_DELIVERY_FLAGGED' | 'OVER_BILLING_FLAGGED' | 'PENDING_VERIFICATION';
  variancePct: number;
  riskPoints: number;
  timeline: {
    stage: string;
    timestamp: string;
    actor: string;
    note: string;
  }[];
}

interface SupplyChainTrackerProps {
  projectId: string;
  projectName?: string;
  initialMaterials?: SupplyChainMaterial[];
  isOfficer?: boolean;
  isContractor?: boolean;
}

export const SAMPLE_SUPPLY_CHAIN_DATA: Record<string, SupplyChainMaterial[]> = {
  'default': [
    {
      id: 'SC-MAT-001',
      materialType: 'OPC 43 Grade Cement (50kg Bags)',
      category: 'Cement',
      orderedQty: 500,
      unit: 'Bags',
      unitRate: 370,
      benchmarkRate: 365,
      vendorId: 'v-01',
      vendorName: 'Patna Building Materials Co',
      vendorGstin: '10AABCP1234F1Z5',
      poRef: 'PO/MPLADS/2024/089',
      poDate: '2024-03-01',
      dispatchDate: '2024-03-05',
      ewayBill: 'EWB-102938475612',
      dispatchedQty: 500,
      deliveryDate: '2024-03-08',
      deliveredQty: 500,
      deliveryGps: { lat: 26.1528, lng: 87.4947 },
      deliveryPhotoUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
      deliveryPhash: 'a1b2c3d4e5f60718',
      isDuplicatePhoto: false,
      installedQty: 380,
      installationDate: '2024-04-12',
      mbRef: 'MB-442/Page-18',
      reconciliationStatus: 'UNDER_DELIVERY_FLAGGED',
      variancePct: -24.0,
      riskPoints: 22,
      timeline: [
        { stage: 'PROCUREMENT', timestamp: '2024-03-01', actor: 'District Nodal Officer', note: 'Sanctioned under BOQ Item 4.1' },
        { stage: 'MATERIAL DISPATCH', timestamp: '2024-03-05', actor: 'Patna Building Materials Co', note: 'Dispatched 500 bags via Truck BR-01-GB-4022' },
        { stage: 'SITE DELIVERY', timestamp: '2024-03-08', actor: 'Site Engineer (Civil)', note: 'Stack count 500 bags verified on-site' },
        { stage: 'INSTALLATION / USE', timestamp: '2024-04-12', actor: 'Junior Engineer (MB Record)', note: 'Physical foundation cast; consumed 380 bags' },
        { stage: 'RECONCILIATION', timestamp: '2024-04-15', actor: 'Automated Audit Engine', note: 'Discrepancy: -120 bags (-24.0% variance) flagged' }
      ]
    },
    {
      id: 'SC-MAT-002',
      materialType: 'Fe 500D TMT Reinforcement Steel',
      category: 'Steel',
      orderedQty: 14.5,
      unit: 'MT',
      unitRate: 63000,
      benchmarkRate: 62500,
      vendorId: 'v-01',
      vendorName: 'Patna Building Materials Co',
      vendorGstin: '10AABCP1234F1Z5',
      poRef: 'PO/MPLADS/2024/090',
      poDate: '2024-03-02',
      dispatchDate: '2024-03-07',
      ewayBill: 'EWB-102938475990',
      dispatchedQty: 14.5,
      deliveryDate: '2024-03-10',
      deliveredQty: 14.5,
      deliveryGps: { lat: 26.1529, lng: 87.4949 },
      deliveryPhotoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
      deliveryPhash: 'b2c3d4e5f6071829',
      isDuplicatePhoto: false,
      installedQty: 14.2,
      installationDate: '2024-04-18',
      mbRef: 'MB-442/Page-22',
      reconciliationStatus: 'MATCHED',
      variancePct: -2.07,
      riskPoints: 0,
      timeline: [
        { stage: 'PROCUREMENT', timestamp: '2024-03-02', actor: 'District Nodal Officer', note: 'Sanctioned under BOQ Item 4.2' },
        { stage: 'MATERIAL DISPATCH', timestamp: '2024-03-07', actor: 'Patna Building Materials Co', note: 'Dispatched 14.5 MT' },
        { stage: 'SITE DELIVERY', timestamp: '2024-03-10', actor: 'Site Engineer (Civil)', note: 'Weighbridge slip verified' },
        { stage: 'INSTALLATION / USE', timestamp: '2024-04-18', actor: 'Junior Engineer', note: 'Lintel & pillar beam reinforcement' },
        { stage: 'RECONCILIATION', timestamp: '2024-04-20', actor: 'Automated Audit Engine', note: 'Matched within 2.1% allowable tolerance' }
      ]
    },
    {
      id: 'SC-MAT-003',
      materialType: '110mm 6kg/cm2 HDPE Pressure Pipes',
      category: 'Pipes & Sanitation',
      orderedQty: 600,
      unit: 'Meters',
      unitRate: 315,
      benchmarkRate: 310,
      vendorId: 'v-02',
      vendorName: 'Pune Solar & Water Grid Corp',
      vendorGstin: '27AAGCP9876E1ZT',
      poRef: 'PO/MPLADS/2024/091',
      poDate: '2024-03-04',
      dispatchDate: '2024-03-09',
      ewayBill: 'EWB-273948501928',
      dispatchedQty: 600,
      deliveryDate: '2024-03-12',
      deliveredQty: 600,
      deliveryGps: { lat: 26.1530, lng: 87.4950 },
      deliveryPhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80',
      deliveryPhash: 'c3d4e5f60718293a',
      isDuplicatePhoto: false,
      installedQty: 590,
      installationDate: '2024-04-22',
      mbRef: 'MB-442/Page-28',
      reconciliationStatus: 'MATCHED',
      variancePct: -1.67,
      riskPoints: 0,
      timeline: [
        { stage: 'PROCUREMENT', timestamp: '2024-03-04', actor: 'District Nodal Officer', note: 'Sanctioned under BOQ Item 4.3' },
        { stage: 'MATERIAL DISPATCH', timestamp: '2024-03-09', actor: 'Pune Solar & Water Grid Corp', note: 'Dispatched 600m' },
        { stage: 'SITE DELIVERY', timestamp: '2024-03-12', actor: 'Site Engineer', note: 'Received & inspected' },
        { stage: 'INSTALLATION / USE', timestamp: '2024-04-22', actor: 'Junior Engineer', note: 'Underground conduit laid' },
        { stage: 'RECONCILIATION', timestamp: '2024-04-25', actor: 'Automated Audit Engine', note: 'Cleared within statutory tolerance' }
      ]
    }
  ]
};

const STAGES = [
  { id: 'PROCUREMENT', label: '1. Procurement', sub: 'PO / GeM Rate', icon: FileText },
  { id: 'DISPATCH', label: '2. Material Dispatch', sub: 'e-Way Bill & Gate Pass', icon: Truck },
  { id: 'DELIVERY', label: '3. Site Delivery', sub: 'GPS + pHash Photo', icon: PackageCheck },
  { id: 'INSTALLATION', label: '4. Installation / Use', sub: 'MB Measurement Record', icon: Wrench },
  { id: 'RECONCILIATION', label: '5. Reconciliation', sub: 'Billed vs Verified Qty', icon: Scale },
];

export const SupplyChainTracker: React.FC<SupplyChainTrackerProps> = ({
  projectId,
  projectName = 'MPLADS Community Works Infrastructure',
  initialMaterials,
  isOfficer = true,
  isContractor = false
}) => {
  const [materials, setMaterials] = useState<SupplyChainMaterial[]>(
    initialMaterials || SAMPLE_SUPPLY_CHAIN_DATA[projectId] || SAMPLE_SUPPLY_CHAIN_DATA['default']
  );
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(materials[0]?.id || '');
  const [showPhotoModal, setShowPhotoModal] = useState<SupplyChainMaterial | null>(null);

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId) || materials[0];

  const totalOrderedCost = materials.reduce((sum, m) => sum + (m.orderedQty * m.unitRate), 0);
  const totalVerifiedCost = materials.reduce((sum, m) => sum + (m.installedQty * m.unitRate), 0);
  const leakageCost = Math.max(0, totalOrderedCost - totalVerifiedCost);
  const flaggedCount = materials.filter(m => m.reconciliationStatus !== 'MATCHED').length;

  return (
    <div className="bg-white rounded-gov border border-slate-300 shadow-xs overflow-hidden font-sans">
      {/* Header Banner */}
      <div className="bg-slate-50 text-slate-800 p-5 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                Anti-Fraud Material Custody
              </span>
              <span className="text-slate-500 text-xs font-medium">Project Ref: <strong className="text-slate-900">{projectId}</strong></span>
            </div>
            <h2 className="text-lg font-bold text-[#0b2e59] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#0b2e59]" />
              Supply Chain & Quantity Reconciliation Engine
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Traceable chain of custody tracking raw materials from procurement order to physical measurement book installation.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-right shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Materials Tracked</div>
              <div className="text-base font-bold font-mono text-[#0b2e59]">{materials.length} Line Items</div>
            </div>
            <div className={`border rounded-lg px-3.5 py-2 text-right shadow-2xs ${
              flaggedCount > 0 
                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <div className="text-[10px] font-bold uppercase">Reconciliation Status</div>
              <div className="text-base font-bold font-mono">
                {flaggedCount > 0 ? `${flaggedCount} Discrepancy Flagged` : '100% Reconciled'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Stage Stepped Horizontal Timeline for Selected Material */}
      <div className="p-6 bg-slate-50/50 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Traceable Custody Chain</span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">{selectedMaterial?.materialType}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">Select Material:</span>
            <select 
              value={selectedMaterialId} 
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-sm text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.materialType} ({m.orderedQty} {m.unit})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stepped Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {STAGES.map((stg, idx) => {
            const Icon = stg.icon;
            const isMatched = selectedMaterial?.reconciliationStatus === 'MATCHED';
            const isFlaggedStage = idx === 4 && selectedMaterial?.reconciliationStatus !== 'MATCHED';

            let borderClass = 'border-slate-200 bg-white';
            let iconClass = 'bg-slate-100 text-slate-600';
            let badgeClass = 'bg-slate-100 text-slate-600';

            if (idx === 0) {
              borderClass = 'border-blue-200 bg-blue-50/30';
              iconClass = 'bg-blue-600 text-white';
              badgeClass = 'bg-blue-100 text-blue-800';
            } else if (idx === 1) {
              borderClass = 'border-indigo-200 bg-indigo-50/30';
              iconClass = 'bg-indigo-600 text-white';
              badgeClass = 'bg-indigo-100 text-indigo-800';
            } else if (idx === 2) {
              borderClass = 'border-cyan-200 bg-cyan-50/30';
              iconClass = 'bg-cyan-600 text-white';
              badgeClass = 'bg-cyan-100 text-cyan-800';
            } else if (idx === 3) {
              borderClass = 'border-amber-200 bg-amber-50/30';
              iconClass = 'bg-amber-600 text-white';
              badgeClass = 'bg-amber-100 text-amber-800';
            } else if (idx === 4) {
              if (isFlaggedStage) {
                borderClass = 'border-rose-300 bg-rose-50/60 ring-2 ring-rose-400';
                iconClass = 'bg-rose-600 text-white animate-pulse';
                badgeClass = 'bg-rose-100 text-rose-800 font-bold';
              } else {
                borderClass = 'border-emerald-300 bg-emerald-50/60 ring-1 ring-emerald-400';
                iconClass = 'bg-emerald-600 text-white';
                badgeClass = 'bg-emerald-100 text-emerald-800 font-bold';
              }
            }

            return (
              <div key={stg.id} className={`p-3.5 rounded-xl border ${borderClass} transition-all duration-200 shadow-sm relative`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${badgeClass}`}>
                    {idx === 0 && 'Ordered'}
                    {idx === 1 && 'Dispatched'}
                    {idx === 2 && 'At Site'}
                    {idx === 3 && 'Installed'}
                    {idx === 4 && (isFlaggedStage ? 'Flagged' : 'Cleared')}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900">{stg.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{stg.sub}</div>

                {/* Stage Details */}
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] space-y-1">
                  {idx === 0 && (
                    <>
                      <div className="text-slate-600">PO: <strong className="text-slate-800">{selectedMaterial.poRef}</strong></div>
                      <div className="text-slate-600">Rate: <strong>₹{selectedMaterial.unitRate}</strong> / {selectedMaterial.unit}</div>
                      <div className="text-slate-400 text-[10px]">GeM Benchmark: ₹{selectedMaterial.benchmarkRate}</div>
                    </>
                  )}
                  {idx === 1 && (
                    <>
                      <div className="text-slate-600">e-Way: <strong className="text-slate-800">{selectedMaterial.ewayBill || 'EWB-Pending'}</strong></div>
                      <div className="text-slate-600">Qty: <strong>{selectedMaterial.dispatchedQty} {selectedMaterial.unit}</strong></div>
                      <div className="text-slate-400 text-[10px]">Vendor: {selectedMaterial.vendorName.slice(0, 16)}...</div>
                    </>
                  )}
                  {idx === 2 && (
                    <>
                      <div className="text-slate-600">Received: <strong>{selectedMaterial.deliveredQty} {selectedMaterial.unit}</strong></div>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                        <MapPin className="w-3 h-3" /> GPS Verified
                      </div>
                      {selectedMaterial.deliveryPhotoUrl && (
                        <button 
                          onClick={() => setShowPhotoModal(selectedMaterial)}
                          className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1 mt-1"
                        >
                          <Camera className="w-3 h-3" /> View Site Photo (pHash)
                        </button>
                      )}
                    </>
                  )}
                  {idx === 3 && (
                    <>
                      <div className="text-slate-600">Installed: <strong>{selectedMaterial.installedQty} {selectedMaterial.unit}</strong></div>
                      <div className="text-slate-600">MB Ref: <strong className="text-slate-800">{selectedMaterial.mbRef}</strong></div>
                      <div className="text-slate-400 text-[10px]">Date: {selectedMaterial.installationDate}</div>
                    </>
                  )}
                  {idx === 4 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Variance:</span>
                        <strong className={selectedMaterial.variancePct < -10 ? 'text-rose-600' : 'text-emerald-700'}>
                          {selectedMaterial.variancePct > 0 ? `+${selectedMaterial.variancePct}%` : `${selectedMaterial.variancePct}%`}
                        </strong>
                      </div>
                      {selectedMaterial.reconciliationStatus === 'UNDER_DELIVERY_FLAGGED' ? (
                        <div className="text-[10px] font-bold text-rose-700 flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" /> Leakage: {selectedMaterial.orderedQty - selectedMaterial.installedQty} {selectedMaterial.unit}
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> 100% Audit Verified
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reconciliation Line Items Table */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">Material Bill of Quantities & Reconciliation Table</h4>
          </div>
          <span className="text-xs text-slate-500">Statutory threshold: variance &gt;10% auto-flags non-compliance</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Material & Category</th>
                <th className="py-2.5 px-3">Vendor / GSTIN</th>
                <th className="py-2.5 px-3 text-right">Ordered Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Rate</th>
                <th className="py-2.5 px-3 text-right">Delivered Qty</th>
                <th className="py-2.5 px-3 text-right">Verified Used Qty</th>
                <th className="py-2.5 px-3 text-right">Variance %</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Site Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {materials.map((m) => {
                const isUnder = m.reconciliationStatus === 'UNDER_DELIVERY_FLAGGED';
                const isOver = m.reconciliationStatus === 'OVER_BILLING_FLAGGED';
                const isMatched = m.reconciliationStatus === 'MATCHED';

                return (
                  <tr 
                    key={m.id} 
                    onClick={() => setSelectedMaterialId(m.id)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      selectedMaterialId === m.id ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{m.materialType}</div>
                      <div className="text-[10px] text-slate-500">{m.category} • {m.poRef}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{m.vendorName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{m.vendorGstin}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {m.orderedQty.toLocaleString('en-IN')} {m.unit}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-800">
                      ₹{m.unitRate.toLocaleString('en-IN')}
                      {m.unitRate > m.benchmarkRate * 1.15 && (
                        <span className="block text-[9px] text-amber-600 font-bold">Above GeM</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-800">
                      {m.deliveredQty.toLocaleString('en-IN')} {m.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {m.installedQty.toLocaleString('en-IN')} {m.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-bold">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] ${
                        isUnder ? 'bg-rose-100 text-rose-800 font-bold' :
                        isOver ? 'bg-amber-100 text-amber-800 font-bold' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {m.variancePct > 0 ? `+${m.variancePct}%` : `${m.variancePct}%`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isUnder && (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" /> Under-Delivery Flagged
                        </span>
                      )}
                      {isOver && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <AlertCircle className="w-3 h-3" /> Over-Billing Flagged
                        </span>
                      )}
                      {isMatched && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Matched & Audited
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {m.deliveryPhotoUrl ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPhotoModal(m);
                          }}
                          className="inline-flex items-center gap-1 bg-white border border-slate-300 hover:border-blue-400 text-blue-600 px-2 py-1 rounded text-[11px] font-medium shadow-sm transition"
                        >
                          <Camera className="w-3 h-3" /> pHash
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No Photo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automated Compliance Rule Banner */}
      <div className="bg-slate-50 text-slate-800 p-3.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0b2e59]" />
          <span>
            <strong className="text-[#0b2e59]">Rule SC-01 (Statutory Compliance Engine):</strong> Material Quantity Reconciliation Variance &gt;10%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-medium">GFR 2017 Rule 144 & MPLADS Guidelines 2023 Para 4.6</span>
          <span className={`px-2.5 py-0.5 rounded border font-bold uppercase text-[10px] ${
            flaggedCount > 0 ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}>
            {flaggedCount > 0 ? 'VIOLATION FLAGGED' : 'CLEARED'}
          </span>
        </div>
      </div>

      {/* Delivery Photo pHash Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-gov max-w-lg w-full overflow-hidden shadow-xl border border-slate-300">
            <div className="bg-[#0b2e59] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-300" />
                <h4 className="text-sm font-bold">On-Site Delivery Evidence & Perceptual Hash</h4>
              </div>
              <button 
                onClick={() => setShowPhotoModal(null)}
                className="text-white/70 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-md overflow-hidden border border-slate-200 aspect-video bg-slate-100 relative">
                <img 
                  src={showPhotoModal.deliveryPhotoUrl} 
                  alt="Delivery site stack" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-[#0b2e59]/90 text-white text-[10px] px-2 py-1 rounded font-mono">
                  GPS: {showPhotoModal.deliveryGps?.lat.toFixed(4)}°N, {showPhotoModal.deliveryGps?.lng.toFixed(4)}°E
                </div>
              </div>

              <div className="bg-slate-50 rounded-md p-3.5 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Material Type:</span>
                  <strong className="text-slate-900">{showPhotoModal.materialType}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">64-bit pHash Value:</span>
                  <span className="font-mono bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px] text-slate-800">
                    {showPhotoModal.deliveryPhash || 'a1b2c3d4e5f60718'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Duplicate Photo Detection:</span>
                  {showPhotoModal.isDuplicatePhoto ? (
                    <span className="inline-flex items-center gap-1 text-rose-800 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      <ShieldAlert className="w-3 h-3 text-rose-600" /> Duplicate Reused Photo Detected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Unique Genuine Site Photo
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <button 
                  onClick={() => setShowPhotoModal(null)}
                  className="bg-[#0b2e59] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#082242] transition"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
