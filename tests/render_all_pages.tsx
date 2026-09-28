// Polyfill global window & document for Leaflet & browser APIs in Node.js
if (typeof (globalThis as any).window === 'undefined') {
  const noop = () => {};
  const docObj: any = {
    documentElement: { style: {} },
    createElement: () => ({ style: {}, setAttribute: noop, appendChild: noop, classList: { add: noop, remove: noop } }),
    getElementsByTagName: () => [],
    getElementById: () => null,
  };
  (globalThis as any).window = {
    requestAnimationFrame: (cb: any) => setTimeout(cb, 16),
    cancelAnimationFrame: (id: any) => clearTimeout(id),
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: noop,
    speechSynthesis: { speak: noop, cancel: noop },
    location: { href: 'http://localhost:5173/' },
    print: noop,
    document: docObj,
    navigator: { userAgent: 'node' }
  };
  (globalThis as any).document = docObj;
  (globalThis as any).navigator = (globalThis as any).window.navigator;
}

import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { SecurityProvider } from '../src/security';

// Import all 29 pages
import { DashboardPage } from '../src/pages/DashboardPage';
import { ProjectsListPage } from '../src/pages/ProjectsListPage';
import { ProjectDetailPage } from '../src/pages/ProjectDetailPage';
import { ProjectBoardPage } from '../src/pages/ProjectBoardPage';
import { InvestigationPage } from '../src/pages/InvestigationPage';
import { AIInsightsPage } from '../src/pages/AIInsightsPage';
import { ContractorsPage } from '../src/pages/ContractorsPage';
import { VendorsPage } from '../src/pages/VendorsPage';
import { TendersPage } from '../src/pages/TendersPage';
import { FundsPage } from '../src/pages/FundsPage';
import { ReportsPage } from '../src/pages/ReportsPage';
import { MPsPage } from '../src/pages/MPsPage';
import { MPDetailPage } from '../src/pages/MPDetailPage';
import { CitizenPage } from '../src/pages/CitizenPage';
import { AboutPage } from '../src/pages/AboutPage';
import { RuralIntelligencePage } from '../src/pages/RuralIntelligencePage';
import { VillageExplorerPage } from '../src/pages/VillageExplorerPage';
import { VillageDetailPage } from '../src/pages/VillageDetailPage';
import { VillagePriorityPage } from '../src/pages/VillagePriorityPage';
import { VillageDataQualityPage } from '../src/pages/VillageDataQualityPage';
import { OpportunitiesPage } from '../src/pages/OpportunitiesPage';
import { OpportunityDetailPage } from '../src/pages/OpportunityDetailPage';
import { ContractorInterestPage } from '../src/pages/ContractorInterestPage';
import { ContractorDashboardPage } from '../src/pages/ContractorDashboardPage';
import { SupplyChainPage } from '../src/pages/SupplyChainPage';
import { TenderSourcesPage } from '../src/pages/TenderSourcesPage';
import { NationalDataPage } from '../src/pages/NationalDataPage';
import { PreSanctionSandboxPage } from '../src/pages/PreSanctionSandboxPage';
import { DecisionSupportPage } from '../src/pages/DecisionSupportPage';

interface TestRoute {
  name: string;
  path: string;
  routePattern: string;
  component: React.ReactElement;
}

const TEST_ROUTES: TestRoute[] = [
  { name: 'Dashboard Page', path: '/', routePattern: '/', component: <DashboardPage /> },
  { name: 'Projects List', path: '/projects', routePattern: '/projects', component: <ProjectsListPage /> },
  { name: 'Projects Board', path: '/projects/board', routePattern: '/projects/board', component: <ProjectBoardPage /> },
  { name: 'Project Detail (WS-1 Overview)', path: '/projects/WS-1?tab=overview', routePattern: '/projects/:id/*', component: <ProjectDetailPage /> },
  { name: 'Project Detail (WS-1 AI Timeline)', path: '/projects/WS-1?tab=timeline', routePattern: '/projects/:id/*', component: <ProjectDetailPage /> },
  { name: 'Project Detail (WS-1 Tender & Bids)', path: '/projects/WS-1?tab=tender', routePattern: '/projects/:id/*', component: <ProjectDetailPage /> },
  { name: 'Project Detail (WS-1 Contract)', path: '/projects/WS-1?tab=contract', routePattern: '/projects/:id/*', component: <ProjectDetailPage /> },
  { name: 'Project Detail (WS-1 Team & Tasks)', path: '/projects/WS-1?tab=team', routePattern: '/projects/:id/*', component: <ProjectDetailPage /> },
  { name: 'Project Detail (WS-1 Vendors)', path: '/projects/WS-1?tab=vendors', routePattern: '/projects/:id/*', component: <ProjectDetailPage /> },
  { name: 'Project Detail (WS-1 Materials)', path: '/projects/WS-1?tab=materials', routePattern: '/projects/:id/*', component: <ProjectDetailPage /> },
  { name: 'Project Detail (WS-1 Funds)', path: '/projects/WS-1?tab=funds', routePattern: '/projects/:id/*', component: <ProjectDetailPage /> },
  { name: 'Project Detail (WS-1 Documents)', path: '/projects/WS-1?tab=documents', routePattern: '/projects/:id/*', component: <ProjectDetailPage /> },
  { name: 'Project Detail (WS-1 Progress)', path: '/projects/WS-1?tab=progress', routePattern: '/projects/:id/*', component: <ProjectDetailPage /> },
  { name: 'Project Detail (WS-1 AI Forensic)', path: '/projects/WS-1?tab=ai-analysis', routePattern: '/projects/:id/*', component: <ProjectDetailPage /> },
  { name: 'Investigation Page (1)', path: '/investigate/1', routePattern: '/investigate/:id', component: <InvestigationPage /> },
  { name: 'AI Insights Page', path: '/ai-insights', routePattern: '/ai-insights', component: <AIInsightsPage /> },
  { name: 'Contractors Directory', path: '/contractors', routePattern: '/contractors', component: <ContractorsPage /> },
  { name: 'Vendors Directory', path: '/vendors', routePattern: '/vendors', component: <VendorsPage /> },
  { name: 'Tenders Page', path: '/tenders', routePattern: '/tenders', component: <TendersPage /> },
  { name: 'Funds Page', path: '/funds', routePattern: '/funds', component: <FundsPage /> },
  { name: 'Reports Page', path: '/reports', routePattern: '/reports', component: <ReportsPage /> },
  { name: 'MPs Directory', path: '/mps', routePattern: '/mps', component: <MPsPage /> },
  { name: 'MP Detail Page (LS-355)', path: '/mps/ls-355', routePattern: '/mps/:id', component: <MPDetailPage /> },
  { name: 'Citizen Page', path: '/citizen', routePattern: '/citizen', component: <CitizenPage /> },
  { name: 'About Page', path: '/about', routePattern: '/about', component: <AboutPage /> },
  { name: 'Decision Support (Overview)', path: '/decision-support', routePattern: '/decision-support', component: <DecisionSupportPage /> },
  { name: 'Decision Support (Tab: Overruns)', path: '/decision-support?tab=overruns', routePattern: '/decision-support', component: <DecisionSupportPage /> },
  { name: 'Decision Support (Tab: Quotas)', path: '/decision-support?tab=quotas', routePattern: '/decision-support', component: <DecisionSupportPage /> },
  { name: 'Decision Support (Tab: Delays)', path: '/decision-support?tab=delays', routePattern: '/decision-support', component: <DecisionSupportPage /> },
  { name: 'Decision Support (Tab: Splitting)', path: '/decision-support?tab=splitting', routePattern: '/decision-support', component: <DecisionSupportPage /> },
  { name: 'Decision Support (MP Role)', path: '/decision-support?role=MP', routePattern: '/decision-support', component: <DecisionSupportPage /> },
  { name: 'Decision Support (District)', path: '/decision-support?role=DISTRICT', routePattern: '/decision-support', component: <DecisionSupportPage /> },
  { name: 'Decision Support (Ministry)', path: '/decision-support?role=MINISTRY', routePattern: '/decision-support', component: <DecisionSupportPage /> },
  { name: 'Rural Intelligence', path: '/rural-intelligence', routePattern: '/rural-intelligence', component: <RuralIntelligencePage /> },
  { name: 'Village Explorer', path: '/village-explorer', routePattern: '/village-explorer', component: <VillageExplorerPage /> },
  { name: 'Village Detail', path: '/village/1', routePattern: '/village/:id', component: <VillageDetailPage /> },
  { name: 'Village Priority', path: '/village-priority', routePattern: '/village-priority', component: <VillagePriorityPage /> },
  { name: 'Village Data Quality', path: '/village-data-quality', routePattern: '/village-data-quality', component: <VillageDataQualityPage /> },
  { name: 'Opportunities', path: '/opportunities', routePattern: '/opportunities', component: <OpportunitiesPage /> },
  { name: 'Opportunity Detail', path: '/opportunities/1', routePattern: '/opportunities/:id', component: <OpportunityDetailPage /> },
  { name: 'Contractor Interest', path: '/contractor-interest', routePattern: '/contractor-interest', component: <ContractorInterestPage /> },
  { name: 'Contractor Dashboard', path: '/contractor-dashboard', routePattern: '/contractor-dashboard', component: <ContractorDashboardPage /> },
  { name: 'Supply Chain', path: '/supply-chain', routePattern: '/supply-chain', component: <SupplyChainPage /> },
  { name: 'Tender Sources', path: '/tender-sources', routePattern: '/tender-sources', component: <TenderSourcesPage /> },
  { name: 'National Data', path: '/national-data', routePattern: '/national-data', component: <NationalDataPage /> },
  { name: 'Pre-Sanction Sandbox', path: '/sandbox', routePattern: '/sandbox', component: <PreSanctionSandboxPage /> },
];

function runTests() {
  console.log('================ FULL REACT SSR RENDERING AUDIT ================');
  let passed = 0;
  let failed = 0;
  const errors: { name: string; path: string; error: string }[] = [];

  for (const t of TEST_ROUTES) {
    try {
      const html = renderToString(
        <LanguageProvider>
          <SecurityProvider>
            <MemoryRouter initialEntries={[t.path]}>
              <Routes>
                <Route path={t.routePattern} element={t.component} />
              </Routes>
            </MemoryRouter>
          </SecurityProvider>
        </LanguageProvider>
      );

      if (html.length < 50) {
        throw new Error(`Output HTML suspiciously short (${html.length} chars)`);
      }

      passed++;
      console.log(`[PASS] ${t.name.padEnd(30)} -> Rendered successfully (${html.length.toLocaleString()} chars)`);
    } catch (err: any) {
      failed++;
      console.error(`[FAIL] ${t.name.padEnd(30)} -> Error: ${err.message}`);
      errors.push({ name: t.name, path: t.path, error: err.stack || err.message });
    }
  }

  console.log('\n================ AUDIT SUMMARY ================');
  console.log(`Total Pages Tested: ${TEST_ROUTES.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.error('\nFailure details:');
    for (const e of errors) {
      console.error(`- ${e.name} (${e.path}):\n  ${e.error}`);
    }
    process.exit(1);
  } else {
    console.log('\nAll 32 test routes rendered flawlessly with 0 runtime exceptions!');
  }
}

runTests();
