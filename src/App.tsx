import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { GovernmentHeader } from './components/GovernmentHeader';
import { GovernmentFooter } from './components/GovernmentFooter';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { ContractorsPage } from './pages/ContractorsPage';
import { VendorsPage } from './pages/VendorsPage';
import { TendersPage } from './pages/TendersPage';
import { FundsPage } from './pages/FundsPage';
import { ReportsPage } from './pages/ReportsPage';
import { MPsPage } from './pages/MPsPage';
import { MPDetailPage } from './pages/MPDetailPage';
import { CitizenPage } from './pages/CitizenPage';
import { AboutPage } from './pages/AboutPage';
import { RuralIntelligencePage } from './pages/RuralIntelligencePage';
import { VillageExplorerPage } from './pages/VillageExplorerPage';
import { VillageDetailPage } from './pages/VillageDetailPage';
import { VillagePriorityPage } from './pages/VillagePriorityPage';
import { VillageDataQualityPage } from './pages/VillageDataQualityPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { ContractorInterestPage } from './pages/ContractorInterestPage';
import { ContractorDashboardPage } from './pages/ContractorDashboardPage';
import { TenderSourcesPage } from './pages/TenderSourcesPage';
import { NationalDataPage } from './pages/NationalDataPage';
import { ProjectBoardPage } from './pages/ProjectBoardPage';
import { PreSanctionSandboxPage } from './pages/PreSanctionSandboxPage';
import { SupplyChainPage } from './pages/SupplyChainPage';
import { DecisionSupportPage } from './pages/DecisionSupportPage';
import { RoleSelector } from './components/RoleSelector';
import { UserRole } from './types';
import { SecurityProvider, useSecurity } from './security';

const RoleSelectorNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentRole: secRole, setCurrentRole } = useSecurity();

  const currentRole = React.useMemo<UserRole>(() => {

    const path = location.pathname;
    const search = location.search;

    if (path === '/citizen') return 'citizen';
    if (path === '/vendors') return 'vendor';
    if (path.startsWith('/contractor') || path === '/opportunities' || path === '/supply-chain' || path === '/tenders') return 'contractor';
    if (search.includes('role=MP') || path.startsWith('/mps')) return 'mp';
    if (search.includes('role=MINISTRY')) return 'ministry';
    if (search.includes('role=DISTRICT') || path === '/sandbox') return 'district';
    if (path === '/') return 'overview';
    return 'overview';
  }, [location.pathname, location.search]);

  React.useEffect(() => {
    if (secRole !== currentRole) {
      setCurrentRole(currentRole);
    }
  }, [currentRole, secRole, setCurrentRole]);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    switch (role) {

      case 'overview':
        navigate('/');
        break;
      case 'mp':
        navigate('/decision-support?role=MP');
        break;
      case 'district':
        navigate('/decision-support?role=DISTRICT');
        break;
      case 'contractor':
        navigate('/contractor-dashboard');
        break;
      case 'vendor':
        navigate('/vendors');
        break;
      case 'ministry':
        navigate('/decision-support?role=MINISTRY');
        break;
      case 'citizen':
        navigate('/citizen');
        break;
    }
  };

  return <RoleSelector currentRole={currentRole} onRoleChange={handleRoleChange} />;
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <SecurityProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#f4f6f9] text-slate-800 antialiased font-sans">
            {/* Top Government Portal Header */}
            <GovernmentHeader />

            {/* Role Navigation Bar & User Profile */}
            <RoleSelectorNav />

            {/* Main Content Area */}
            <main id="main-content" className="flex-1 pb-8">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsListPage />} />
                <Route path="/projects/board" element={<ProjectBoardPage />} />
                <Route path="/projects/:id/*" element={<ProjectDetailPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/projects/*" element={<ProjectDetailPage />} />
                <Route path="/sandbox" element={<PreSanctionSandboxPage />} />
                <Route path="/investigate/:id" element={<InvestigationPage />} />
                <Route path="/ai-insights" element={<AIInsightsPage />} />
                <Route path="/contractors" element={<ContractorsPage />} />
                <Route path="/contractors/:id" element={<ContractorsPage />} />
                <Route path="/vendors" element={<VendorsPage />} />
                <Route path="/tenders" element={<TendersPage />} />
                <Route path="/contracts" element={<TendersPage />} />
                <Route path="/funds" element={<FundsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/mps" element={<MPsPage />} />
                <Route path="/mps/:id" element={<MPDetailPage />} />
                <Route path="/citizen" element={<CitizenPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Administrative Decision Support & Statutory Governance Routes */}
                <Route path="/decision-support" element={<DecisionSupportPage />} />
                <Route path="/project-splitting" element={<Navigate to="/decision-support?tab=splitting" replace />} />
                <Route path="/digital-twin" element={<Navigate to="/projects/board" replace />} />
                <Route path="/compliance" element={<Navigate to="/decision-support?tab=quotas" replace />} />

                {/* Rural Village Development Intelligence Routes */}
                <Route path="/rural-intelligence" element={<RuralIntelligencePage />} />
                <Route path="/village-explorer" element={<VillageExplorerPage />} />
                <Route path="/village/:id" element={<VillageDetailPage />} />
                <Route path="/village-priority" element={<VillagePriorityPage />} />
                <Route path="/village-data-quality" element={<VillageDataQualityPage />} />

                {/* Upcoming Projects & Contractor Opportunities Routes */}
                <Route path="/opportunities" element={<OpportunitiesPage />} />
                <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
                <Route path="/contractor-interest" element={<ContractorInterestPage />} />
                <Route path="/contractor-dashboard" element={<ContractorDashboardPage />} />
                <Route path="/contractor-portal" element={<ContractorDashboardPage />} />
                <Route path="/supply-chain" element={<SupplyChainPage />} />
                <Route path="/tender-sources" element={<TenderSourcesPage />} />

                {/* National Data Ingestion & Verification Pipeline */}
                <Route path="/national-data" element={<NationalDataPage />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Official Government Footer */}
            <GovernmentFooter />
          </div>
        </BrowserRouter>
      </SecurityProvider>
    </LanguageProvider>
  );
};

export default App;

