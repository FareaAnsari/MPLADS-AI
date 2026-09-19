import { DataMappers } from '../src/data/remote/mappers';
import { RemoteMPRepository } from '../src/data/repositories/RemoteMPRepository';
import { apiClient } from '../src/data/remote/apiClient';
import { useAuthStore } from '../src/store/authStore';
import { NotificationService } from '../src/services/notificationService';
import { router } from 'expo-router';
import { enIN, hiIN } from '../src/i18n';

jest.mock('../src/data/remote/apiClient');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

describe('Phase 12 — MP Office Application & Constituency Oversight', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      status: 'UNAUTHENTICATED',
      user: null,
      session: null,
      lastActiveTimestamp: Date.now(),
    });
  });

  describe('1. Data Mappers', () => {
    it('should map MPDashboardDTO to MPDashboardEntity correctly', () => {
      const dto = {
        mp: {
          id: 'usr-mp-001',
          full_name: 'Hon. MP Araria Cell',
          role: 'MP_OFFICE',
          constituency: 'Araria',
          state: 'Bihar',
        },
        metrics: {
          total_constituency_projects: 42,
          active_count: 18,
          completed_count: 20,
          delayed_count: 4,
          total_sanctioned_inr: 50000000,
          total_disbursed_inr: 36000000,
          high_risk_attention_count: 3,
          public_evidence_count: 12,
          utilization_percentage: 72.0,
        },
        risk_distribution: {
          low: 28,
          medium: 11,
          high: 2,
          critical: 1,
        },
        recent_projects: [
          {
            work_id: 'WRK-2024-BR01-001',
            work_title: 'Solar Streetlights in Araria Bazar',
            work_category: 'Other Public Facilities',
            state: 'Bihar',
            constituency: 'Araria',
            sanctioned_amount_inr: 2500000,
            disbursed_amount_inr: 1800000,
            current_stage: 'IMPLEMENTATION_IN_PROGRESS',
          },
        ],
      };

      const entity = DataMappers.mapMPDashboardDTOToEntity(dto);

      expect(entity.mp.id).toBe('usr-mp-001');
      expect(entity.mp.constituency).toBe('Araria');
      expect(entity.metrics.totalConstituencyProjects).toBe(42);
      expect(entity.metrics.activeCount).toBe(18);
      expect(entity.metrics.highRiskAttentionCount).toBe(3);
      expect(entity.metrics.utilizationPercentage).toBe(72.0);
      expect(entity.riskDistribution.high).toBe(2);
      expect(entity.recentProjects).toHaveLength(1);
      expect(entity.recentProjects[0].workId).toBe('WRK-2024-BR01-001');
    });

    it('should map MPProjectDetailDTO to MPProjectDetailEntity correctly', () => {
      const dto = {
        project: {
          work_id: 'WRK-2024-BR01-002',
          work_title: 'Primary Health Sub-centre Construction',
          work_category: 'Health & Family Welfare',
          state: 'Bihar',
          constituency: 'Araria',
          sanctioned_amount_inr: 4500000,
          disbursed_amount_inr: 4500000,
          current_stage: 'PHYSICAL_COMPLETION',
        },
        financials: {
          sanctioned_amount_inr: 4500000,
          disbursed_amount_inr: 4500000,
          expenditure_inr: 4200000,
          remaining_balance_inr: 300000,
          utilization_percentage: 93.3,
        },
        milestones: [
          {
            stage_id: 'PROPOSAL_SUBMITTED',
            stage_name: 'Proposal Submitted',
            is_completed: true,
            is_current: false,
            benchmark_days: 30,
            status: 'COMPLETED',
          },
          {
            stage_id: 'PHYSICAL_COMPLETION',
            stage_name: 'Completion & Handover',
            is_completed: true,
            is_current: false,
            benchmark_days: 30,
            status: 'COMPLETED',
          },
        ],
        risk_oversight: {
          risk_score: 22.0,
          risk_level: 'LOW',
          attention_required: false,
          primary_risk_signal: 'Normal progress',
        },
        public_evidence: [
          {
            evidence_id: 'ev-001',
            verification_status: 'VERIFIED',
          },
        ],
      };

      const entity = DataMappers.mapMPProjectDetailDTOToEntity(dto);

      expect(entity.project.workId).toBe('WRK-2024-BR01-002');
      expect(entity.financials.remainingBalanceInr).toBe(300000);
      expect(entity.financials.utilizationPercentage).toBe(93.3);
      expect(entity.milestones).toHaveLength(2);
      expect(entity.riskOversight.riskLevel).toBe('LOW');
      expect(entity.riskOversight.attentionRequired).toBe(false);
      expect(entity.publicEvidence).toHaveLength(1);
    });
  });

  describe('2. RemoteMPRepository', () => {
    const repo = new RemoteMPRepository();

    it('should fetch MP constituency dashboard', async () => {
      const mockRaw = {
        mp: { id: 'usr-mp-001', full_name: 'MP Cell', role: 'MP_OFFICE', constituency: 'Araria', state: 'Bihar' },
        metrics: { total_constituency_projects: 10, active_count: 5, completed_count: 5, delayed_count: 0, total_sanctioned_inr: 1000, total_disbursed_inr: 500, high_risk_attention_count: 0, public_evidence_count: 2, utilization_percentage: 50 },
        risk_distribution: { low: 10, medium: 0, high: 0, critical: 0 },
        recent_projects: [],
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockRaw);

      const res = await repo.getDashboard();

      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('/api/v1/mp/dashboard'));
      expect(res.mp.constituency).toBe('Araria');
      expect(res.metrics.totalConstituencyProjects).toBe(10);
    });

    it('should fetch MP constituency projects with search and filters', async () => {
      const mockRaw = {
        total: 1,
        limit: 50,
        offset: 0,
        constituency: 'Araria',
        state: 'Bihar',
        projects: [
          {
            work_id: 'WRK-101',
            work_title: 'Araria Water Pipeline',
            work_category: 'Drinking Water',
            state: 'Bihar',
            sanctioned_amount_inr: 1000000,
            disbursed_amount_inr: 800000,
          },
        ],
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockRaw);

      const res = await repo.getProjects({ search: 'Water', workCategory: 'Drinking Water' });

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/mp/projects'),
        { params: { search: 'Water', work_category: 'Drinking Water' } }
      );
      expect(res.projects).toHaveLength(1);
      expect(res.constituency).toBe('Araria');
    });

    it('should fetch MP project oversight detail', async () => {
      const mockRaw = {
        project: { work_id: 'WRK-101', work_title: 'Araria Water Pipeline', work_category: 'Drinking Water', state: 'Bihar', sanctioned_amount_inr: 1000000, disbursed_amount_inr: 800000 },
        financials: { sanctioned_amount_inr: 1000000, disbursed_amount_inr: 800000, expenditure_inr: 800000, remaining_balance_inr: 200000, utilization_percentage: 80 },
        milestones: [],
        risk_oversight: { risk_score: 15, risk_level: 'LOW', attention_required: false },
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockRaw);

      const res = await repo.getProjectDetail('WRK-101');

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/mp/projects/WRK-101')
      );
      expect(res.project.workId).toBe('WRK-101');
      expect(res.financials.utilizationPercentage).toBe(80);
    });
  });

  describe('3. MP Role & Deep-Link Security Guards', () => {
    it('should allow MP_OFFICE user to navigate to MP projects deep link', () => {
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'usr-mp-001',
          name: 'Hon. MP Office',
          role: 'MP_OFFICE',
          permissions: [],
        },
      });

      const handled = NotificationService.handleNotificationNavigation({
        deepLink: 'mplads://mp/projects/WRK-2024-001',
      });

      expect(handled).toBe(true);
      expect(router.push).toHaveBeenCalledWith('/(mp)/projects/WRK-2024-001');
    });

    it('should BLOCK Citizen from accessing MP deep links', () => {
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'usr-cit-001',
          name: 'Citizen Ramesh',
          role: 'CITIZEN',
          permissions: [],
        },
      });

      const handled = NotificationService.handleNotificationNavigation({
        deepLink: 'mplads://mp/projects/WRK-2024-001',
      });

      expect(handled).toBe(false);
      expect(router.push).toHaveBeenCalledWith('/notifications');
      expect(router.push).not.toHaveBeenCalledWith('/(mp)/projects/WRK-2024-001');
    });

    it('should BLOCK MP_OFFICE from accessing confidential Officer inspection deep link', () => {
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'usr-mp-001',
          name: 'Hon. MP Office',
          role: 'MP_OFFICE',
          permissions: [],
        },
      });

      const handled = NotificationService.handleNotificationNavigation({
        deepLink: 'mplads://officer/risk/WRK-2024-001',
      });

      expect(handled).toBe(false);
      expect(router.push).toHaveBeenCalledWith('/notifications');
      expect(router.push).not.toHaveBeenCalledWith('/(officer)/risk/WRK-2024-001');
    });
  });

  describe('4. Localization Coverage', () => {
    it('should contain all mp.* translation keys in en-IN and hi-IN', () => {
      expect(enIN.mp.dashboard.oversightBadge).toBe('Constituency Oversight Cell');
      expect(hiIN.mp.dashboard.oversightBadge).toBe('संसदीय क्षेत्र निगरानी प्रकोष्ठ');
      expect(enIN.mp.projects.title).toBe('Constituency Works');
      expect(hiIN.mp.projects.title).toBe('संसदीय क्षेत्र के कार्य');
      expect(enIN.mp.financial.sanctioned).toBe('Sanctioned Amount');
      expect(hiIN.mp.financial.sanctioned).toBe('स्वीकृत राशि');
      expect(enIN.mp.risk.title).toBe('Risk Intelligence Oversight');
      expect(hiIN.mp.risk.title).toBe('जोखिम इंटेलिजेंस निगरानी');
    });
  });
});
