import { DataMappers } from '../src/data/remote/mappers';
import { RemoteContractorRepository } from '../src/data/repositories/RemoteContractorRepository';
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

describe('Phase 13 — Contractor Application & Work Package Management', () => {
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
    it('should map ContractorDashboardDTO to ContractorDashboardEntity correctly', () => {
      const dto = {
        contractor: {
          id: 'usr-con-001',
          full_name: 'Anil Sharma',
          company_name: 'Apex Infrastructure Ltd',
          role: 'CONTRACTOR',
          jurisdiction_state: 'Bihar',
          contractor_id: 'CON-BIHAR-001',
        },
        metrics: {
          assigned_projects_count: 5,
          active_works_count: 3,
          completed_works_count: 2,
          pending_submissions_count: 1,
          reported_issues_count: 2,
          total_contract_value_inr: 25000000,
        },
        assigned_projects: [
          {
            id: 'proj-1',
            work_id: 'WRK-2024-BR01-001',
            work_title: 'Community Health Centre Construction',
            work_category: 'Health & Family Welfare',
            work_description: 'Health facility',
            state: 'Bihar',
            constituency: 'Araria',
            sanctioned_amount_inr: 5000000,
            disbursed_amount_inr: 3500000,
            current_stage: 'IMPLEMENTATION_IN_PROGRESS',
            has_official_images: false,
            source: 'SYSTEM',
            source_type: 'PORTAL',
          },
        ],
        recent_submissions: [
          {
            submission_id: 'sub-001',
            work_id: 'WRK-2024-BR01-001',
            contractor_id: 'CON-BIHAR-001',
            reported_progress_percent: 65.0,
            milestone_stage: 'Superstructure',
            remarks: 'Roof slab completed',
            field_observations: 'Good progress',
            status: 'SUBMITTED',
            submitted_at: '2024-09-15T10:00:00Z',
            audit_ref: 'AUD-CON-001',
          },
        ],
      };

      const entity = DataMappers.mapContractorDashboardDTOToEntity(dto);

      expect(entity.contractor.contractorId).toBe('CON-BIHAR-001');
      expect(entity.contractor.companyName).toBe('Apex Infrastructure Ltd');
      expect(entity.metrics.assignedProjectsCount).toBe(5);
      expect(entity.metrics.activeWorksCount).toBe(3);
      expect(entity.metrics.totalContractValueInr).toBe(25000000);
      expect(entity.assignedProjects).toHaveLength(1);
      expect(entity.assignedProjects[0].workId).toBe('WRK-2024-BR01-001');
      expect(entity.recentSubmissions).toHaveLength(1);
    });

    it('should map ContractorProjectDetailDTO to ContractorProjectDetailEntity correctly', () => {
      const dto = {
        project: {
          id: 'proj-1',
          work_id: 'WRK-2024-BR01-001',
          work_title: 'Community Health Centre Construction',
          work_category: 'Health & Family Welfare',
          work_description: 'Health facility',
          state: 'Bihar',
          constituency: 'Araria',
          sanctioned_amount_inr: 5000000,
          disbursed_amount_inr: 3500000,
          current_stage: 'IMPLEMENTATION_IN_PROGRESS',
          has_official_images: false,
          source: 'SYSTEM',
          source_type: 'PORTAL',
        },
        contract_value_inr: 4800000,
        reported_progress_percent: 65.0,
        verified_progress_percent: 50.0,
        milestones: [
          {
            stage_id: 'm1',
            stage_name: 'Foundation & Plinth',
            target_percent: 30,
            is_completed: true,
          },
          {
            stage_id: 'm2',
            stage_name: 'Superstructure Framework',
            target_percent: 70,
            is_completed: false,
          },
        ],
        progress_history: [
          {
            submission_id: 'upd-101',
            work_id: 'WRK-2024-BR01-001',
            contractor_id: 'CON-BIHAR-001',
            reported_progress_percent: 65.0,
            milestone_stage: 'Superstructure',
            remarks: 'Roof slab casting complete',
            field_observations: 'Site clean',
            status: 'SUBMITTED',
            submitted_at: '2024-09-15T10:00:00Z',
            audit_ref: 'AUD-CON-001',
          },
        ],
        issues: [
          {
            issue_id: 'iss-201',
            work_id: 'WRK-2024-BR01-001',
            contractor_id: 'CON-BIHAR-001',
            category: 'MATERIAL_DELAY',
            title: 'Cement delivery delayed by heavy rain',
            description: 'Road blockages delaying supply trucks by 4 days',
            severity: 'MEDIUM',
            status: 'REPORTED',
            reported_at: '2024-09-16T14:00:00Z',
          },
        ],
      };

      const entity = DataMappers.mapContractorProjectDetailDTOToEntity(dto);

      expect(entity.project.workId).toBe('WRK-2024-BR01-001');
      expect(entity.contractValueInr).toBe(4800000);
      expect(entity.reportedProgressPercent).toBe(65.0);
      expect(entity.verifiedProgressPercent).toBe(50.0);
      expect(entity.milestones).toHaveLength(2);
      expect(entity.progressHistory).toHaveLength(1);
      expect(entity.issues).toHaveLength(1);
      expect(entity.issues[0].category).toBe('MATERIAL_DELAY');
    });
  });

  describe('2. RemoteContractorRepository', () => {
    const repo = new RemoteContractorRepository();

    it('should fetch contractor dashboard', async () => {
      const mockRaw = {
        contractor: {
          id: 'usr-con-001',
          full_name: 'Anil',
          company_name: 'Apex Infra',
          role: 'CONTRACTOR',
          contractor_id: 'CON-001',
        },
        metrics: {
          assigned_projects_count: 3,
          active_works_count: 2,
          completed_works_count: 1,
          pending_submissions_count: 0,
          reported_issues_count: 1,
          total_contract_value_inr: 10000000,
        },
        assigned_projects: [],
        recent_submissions: [],
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockRaw);

      const res = await repo.getDashboard();

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/contractor/dashboard')
      );
      expect(res.contractor.companyName).toBe('Apex Infra');
      expect(res.metrics.assignedProjectsCount).toBe(3);
    });

    it('should fetch assigned projects with query parameters', async () => {
      const mockRaw = {
        total: 1,
        limit: 50,
        offset: 0,
        contractor_id: 'CON-001',
        projects: [
          {
            id: 'p-1',
            work_id: 'WRK-101',
            work_title: 'Araria School Building',
            work_category: 'Education',
            sanctioned_amount_inr: 2000000,
            disbursed_amount_inr: 1000000,
            current_stage: 'FOUNDATION',
            state: 'Bihar',
          },
        ],
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockRaw);

      const res = await repo.getProjects({ search: 'School', workCategory: 'Education' });

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/contractor/projects'),
        { params: { search: 'School', work_category: 'Education' } }
      );
      expect(res.projects).toHaveLength(1);
      expect(res.contractorId).toBe('CON-001');
    });

    it('should submit progress update', async () => {
      const mockRaw = {
        submission_id: 'upd-001',
        work_id: 'WRK-101',
        contractor_id: 'CON-001',
        reported_progress_percent: 75.0,
        milestone_stage: 'Superstructure',
        remarks: 'Brickwork 90% done',
        status: 'SUBMITTED',
        submitted_at: '2024-09-18T10:00:00Z',
        audit_ref: 'AUD-CON-001',
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockRaw);

      const res = await repo.submitProgressUpdate('WRK-101', {
        progressPercentage: 75.0,
        milestoneStage: 'Superstructure',
        remarks: 'Brickwork 90% done',
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/contractor/projects/WRK-101/progress'),
        {
          progress_percentage: 75.0,
          milestone_stage: 'Superstructure',
          remarks: 'Brickwork 90% done',
          field_observations: undefined,
          photos: undefined,
          latitude: undefined,
          longitude: undefined,
        }
      );
      expect(res.submissionId).toBe('upd-001');
      expect(res.reportedProgressPercent).toBe(75.0);
    });

    it('should report site issue', async () => {
      const mockRaw = {
        issue_id: 'iss-001',
        work_id: 'WRK-101',
        contractor_id: 'CON-001',
        category: 'MATERIAL_DELAY',
        title: 'Steel reinforcement shortage',
        description: 'Supplier facing supply chain disruption',
        severity: 'HIGH',
        status: 'REPORTED',
        reported_at: '2024-09-18T12:00:00Z',
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockRaw);

      const res = await repo.reportIssue('WRK-101', {
        category: 'MATERIAL_DELAY',
        title: 'Steel reinforcement shortage',
        description: 'Supplier facing supply chain disruption',
        severity: 'HIGH',
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/contractor/projects/WRK-101/issues'),
        {
          category: 'MATERIAL_DELAY',
          title: 'Steel reinforcement shortage',
          description: 'Supplier facing supply chain disruption',
          severity: 'HIGH',
        }
      );
      expect(res.issueId).toBe('iss-001');
      expect(res.severity).toBe('HIGH');
    });
  });

  describe('3. Contractor Role & Deep-Link Security Guards', () => {
    it('should allow CONTRACTOR user to navigate to contractor projects deep link', () => {
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'usr-con-001',
          name: 'Apex Infra Rep',
          role: 'CONTRACTOR',
          permissions: [],
        },
      });

      const handled = NotificationService.handleNotificationNavigation({
        deepLink: 'mplads://contractor/projects/WRK-2024-BR01-001',
      });

      expect(handled).toBe(true);
      expect(router.push).toHaveBeenCalledWith(
        '/(contractor)/projects/WRK-2024-BR01-001'
      );
    });

    it('should BLOCK Citizen from accessing contractor deep links', () => {
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
        deepLink: 'mplads://contractor/projects/WRK-2024-BR01-001',
      });

      expect(handled).toBe(false);
      expect(router.push).toHaveBeenCalledWith('/notifications');
      expect(router.push).not.toHaveBeenCalledWith(
        '/(contractor)/projects/WRK-2024-BR01-001'
      );
    });

    it('should BLOCK CONTRACTOR from accessing privileged Officer risk audit deep links', () => {
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'usr-con-001',
          name: 'Contractor Anil',
          role: 'CONTRACTOR',
          permissions: [],
        },
      });

      const handled = NotificationService.handleNotificationNavigation({
        deepLink: 'mplads://officer/risk/WRK-2024-BR01-001',
      });

      expect(handled).toBe(false);
      expect(router.push).toHaveBeenCalledWith('/notifications');
      expect(router.push).not.toHaveBeenCalledWith(
        '/(officer)/risk/WRK-2024-BR01-001'
      );
    });

    it('should BLOCK CONTRACTOR from accessing MP oversight deep links', () => {
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'usr-con-001',
          name: 'Contractor Anil',
          role: 'CONTRACTOR',
          permissions: [],
        },
      });

      const handled = NotificationService.handleNotificationNavigation({
        deepLink: 'mplads://mp/projects/WRK-2024-BR01-001',
      });

      expect(handled).toBe(false);
      expect(router.push).toHaveBeenCalledWith('/notifications');
      expect(router.push).not.toHaveBeenCalledWith(
        '/(mp)/projects/WRK-2024-BR01-001'
      );
    });
  });

  describe('4. Localization Coverage', () => {
    it('should contain all contractor.* translation keys in en-IN and hi-IN', () => {
      expect(enIN.contractor.dashboard.portalBadge).toBe('Operational Contractor Portal');
      expect(hiIN.contractor.dashboard.portalBadge).toBe('परिचालन ठेकेदार पोर्टल');

      expect(enIN.contractor.projects.title).toBe('Assigned Projects');
      expect(hiIN.contractor.projects.title).toBe('आवंटित परियोजनाएं');

      expect(enIN.contractor.progress.reportedBadge).toBe('Reported by Contractor');
      expect(hiIN.contractor.progress.reportedBadge).toBe('ठेकेदार द्वारा रिपोर्ट किया गया');

      expect(enIN.contractor.progress.verifiedBadge).toBe('Verified by District Officer');
      expect(hiIN.contractor.progress.verifiedBadge).toBe('जिला अधिकारी द्वारा सत्यापित');

      expect(enIN.contractor.issues.reportTitle).toBe('Report Site Issue / Blocker');
      expect(hiIN.contractor.issues.reportTitle).toBe('साइट समस्या / बाधा की रिपोर्ट करें');

      expect(enIN.contractor.errors.unauthorizedProject).toBe('Access Denied: You are not assigned to this project.');
      expect(hiIN.contractor.errors.unauthorizedProject).toBe('पहुंच अस्वीकृत: आप इस परियोजना के लिए आवंटित नहीं हैं।');
    });
  });
});
