import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InvestigationModal } from '../components/InvestigationModal';
import { SHOWCASE_PROJECT_ID } from '../data/mockData';

export const InvestigationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <InvestigationModal
        projectId={id || SHOWCASE_PROJECT_ID}
        isOpen={true}
        onClose={() => navigate(-1)}
      />
    </div>
  );
};
