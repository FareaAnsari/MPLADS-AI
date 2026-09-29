import React from 'react';
import { Landmark, FileText, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <SEOHead
        title="About Scheme & Platform | MPLADS-AI"
        description="Learn about the Members of Parliament Local Area Development Scheme (MPLADS), statutory guidelines, administrative sanction workflows, and AI-driven monitoring."
        canonicalPath="/about"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About Scheme', url: '/about' }
        ]}
      />
      <div className="bg-white p-6 rounded-gov border border-gov-border shadow-gov space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
          <Landmark className="w-6 h-6 text-gov-navy" />
          <div>
            <h1 className="text-xl font-bold text-gov-navy">
              About Members of Parliament Local Area Development Scheme (MPLADS)
            </h1>
            <p className="text-xs text-slate-500">
              Ministry of Statistics & Programme Implementation, Government of India
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
          <p>
            The Members of Parliament Local Area Development Scheme (MPLADS) is a Plan Scheme fully funded by the Government of India.
            The objective of the scheme is to enable Hon'ble Members of Parliament (MPs) to recommend works of developmental nature with emphasis on the creation of durable community assets of local need in their Constituencies.
          </p>

          <h3 className="font-bold text-sm text-gov-navy pt-2">Key Principles of the Scheme</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">1. MP Recommends Works</span>
              <p className="text-[11px] text-slate-600">
                Hon'ble MPs recommend eligible developmental works based on local public demand to the respective District Authority.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">2. District Scrutiny & Sanction</span>
              <p className="text-[11px] text-slate-600">
                The District Authority examines eligibility, feasibility, accords technical sanction, and follows public tendering rules.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">3. AI-Powered Lifecycle Monitoring</span>
              <p className="text-[11px] text-slate-600">
                Continuous automated audit of fund utilization, physical milestones, material prices, and asset commissioning.
              </p>
            </div>
          </div>

          <h3 className="font-bold text-sm text-gov-navy pt-2">Priority Focus Areas</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
            <li>Drinking Water Supply & Sanitation Facilities</li>
            <li>Primary & Secondary Education Infrastructure (Classrooms, Science Labs)</li>
            <li>Public Health Care & Primary Health Centres (PHC Equipments)</li>
            <li>Rural & Peri-Urban Feeder Roads, Culverts & Bridges</li>
            <li>Community Centres, Public Libraries & Sports Complexes</li>
            <li>Renewable Solar Lighting & Rainwater Harvesting Systems</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
