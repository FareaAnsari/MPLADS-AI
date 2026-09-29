import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FolderGit2, FileBarChart2, Award, ArrowLeft, Search } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <SEOHead
        title="404 — Page Not Found"
        description="The requested page could not be found on the MPLADS-AI National Governance Platform."
        canonicalPath="/404"
        noindex={true}
      />
      <div className="max-w-xl w-full bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-600 font-bold text-2xl font-mono">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gov-navy tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The parliamentary record, project identifier, or administrative page you requested does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-4 py-2.5 bg-gov-navy hover:bg-[#071f3d] text-white text-xs font-bold rounded-md flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
          <Link
            to="/projects"
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition"
          >
            <FolderGit2 className="w-4 h-4 text-slate-600" />
            <span>Browse National Works</span>
          </Link>
        </div>

        <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-4 flex-wrap">
          <Link to="/mps" className="hover:text-blue-600 transition flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>MPs Directory</span>
          </Link>
          <span>•</span>
          <Link to="/reports" className="hover:text-blue-600 transition flex items-center gap-1">
            <FileBarChart2 className="w-3.5 h-3.5" />
            <span>Statutory Reports</span>
          </Link>
          <span>•</span>
          <Link to="/about" className="hover:text-blue-600 transition">
            <span>About MPLADS Scheme</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
