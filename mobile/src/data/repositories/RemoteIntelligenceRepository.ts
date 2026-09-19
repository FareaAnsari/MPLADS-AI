import { IIntelligenceRepository } from '../../domain/interfaces';
import {
  RiskAssessmentEntity,
  SLABottleneckEntity,
  InspectorScheduleEntity,
  RiskOverviewSummaryEntity,
  ProjectRiskIntelligenceDetailEntity,
  VerificationConfidenceEntity,
  AuditLedgerHistoryEntity,
} from '../../domain/entities';
import { apiClient } from '../remote/apiClient';
import { ApiEndpoints } from '../../config/api';
import {
  RiskAssessmentDTO,
  SLABottleneckDTO,
  InspectorScheduleItemDTO,
  ProjectDTO,
} from '../remote/dto';
import { DataMappers } from '../remote/mappers';

export class RemoteIntelligenceRepository implements IIntelligenceRepository {
  async getSystemRiskOverview(): Promise<RiskOverviewSummaryEntity> {
    const data = await apiClient.get<{
      total_projects_monitored: number;
      risk_distribution: {
        high_risk_count: number;
        review_required_count: number;
        normal_count: number;
      };
      hero_project_id: string;
      provenance_summary: {
        data_sources: string[];
        total_records_indexed: number;
        retrieved_at?: string;
      };
    }>(ApiEndpoints.risk.overview);

    return {
      totalProjectsMonitored: data.total_projects_monitored || 0,
      riskDistribution: {
        highRiskCount: data.risk_distribution?.high_risk_count || 0,
        reviewRequiredCount: data.risk_distribution?.review_required_count || 0,
        normalCount: data.risk_distribution?.normal_count || 0,
      },
      heroProjectId: data.hero_project_id || 'HERO-MPLADS-2024-001',
      provenanceSummary: {
        dataSources: data.provenance_summary?.data_sources || [],
        totalRecordsIndexed: data.provenance_summary?.total_records_indexed || 0,
        retrievedAt: data.provenance_summary?.retrieved_at,
      },
    };
  }

  async getRiskProjects(params?: {
    state?: string;
    anomalyFlag?: string;
    minRiskScore?: number;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ totalRecords: number; projects: RiskAssessmentEntity[] }> {
    const data = await apiClient.get<{ total_records: number; projects: RiskAssessmentDTO[] }>(
      ApiEndpoints.risk.list,
      {
        params: {
          state: params?.state,
          anomaly_flag: params?.anomalyFlag,
          min_risk_score: params?.minRiskScore,
          sort_by: params?.sortBy,
          sort_order: params?.sortOrder,
          limit: params?.limit,
          offset: params?.offset,
        },
      }
    );

    return {
      totalRecords: data.total_records || 0,
      projects: (data.projects || []).map(DataMappers.mapRiskAssessmentDTOToEntity),
    };
  }

  async getProjectRisk(workId: string): Promise<RiskAssessmentEntity> {
    const data = await apiClient.get<{ risk_assessment: RiskAssessmentDTO }>(
      ApiEndpoints.risk.detail(workId)
    );

    return DataMappers.mapRiskAssessmentDTOToEntity(data.risk_assessment);
  }

  async getProjectRiskIntelligenceDetail(
    workId: string
  ): Promise<ProjectRiskIntelligenceDetailEntity> {
    const data = await apiClient.get<{
      project: ProjectDTO;
      risk_assessment: RiskAssessmentDTO;
      peer_group_summary: {
        project_id?: string;
        amount_inr?: number;
        peer_stats: {
          peer_group_id: string;
          peer_status: string;
          count: number;
          mean: number;
          median: number;
          std: number;
          iqr: number;
          q25: number;
          q75: number;
          note?: string;
        };
        deviation: {
          z_score: number;
          deviation_from_mean_pct: number;
          deviation_from_median_pct: number;
        };
      };
      latest_ledger_entry_id?: string | null;
    }>(ApiEndpoints.risk.detail(workId));

    const mappedRisk = DataMappers.mapRiskAssessmentDTOToEntity(data.risk_assessment);
    mappedRisk.topContributingFactor = (data.risk_assessment as any).top_contributing_factor;
    mappedRisk.missingEvidenceFields = (data.risk_assessment as any).missing_evidence_fields;

    return {
      project: DataMappers.mapProjectDTOToEntity(data.project),
      riskAssessment: mappedRisk,
      peerGroupSummary: {
        projectId: data.peer_group_summary?.project_id || workId,
        amountInr: Number(data.peer_group_summary?.amount_inr) || 0,
        peerStats: {
          peerGroupId: data.peer_group_summary?.peer_stats?.peer_group_id || 'GENERAL::NATIONAL',
          peerStatus: data.peer_group_summary?.peer_stats?.peer_status || 'SUFFICIENT_PEER_DATA',
          count: Number(data.peer_group_summary?.peer_stats?.count) || 0,
          mean: Number(data.peer_group_summary?.peer_stats?.mean) || 0,
          median: Number(data.peer_group_summary?.peer_stats?.median) || 0,
          std: Number(data.peer_group_summary?.peer_stats?.std) || 0,
          iqr: Number(data.peer_group_summary?.peer_stats?.iqr) || 0,
          q25: Number(data.peer_group_summary?.peer_stats?.q25) || 0,
          q75: Number(data.peer_group_summary?.peer_stats?.q75) || 0,
          note: data.peer_group_summary?.peer_stats?.note,
        },
        deviation: {
          zScore: Number(data.peer_group_summary?.deviation?.z_score) || 0,
          deviationFromMeanPct: Number(data.peer_group_summary?.deviation?.deviation_from_mean_pct) || 0,
          deviationFromMedianPct: Number(data.peer_group_summary?.deviation?.deviation_from_median_pct) || 0,
        },
      },
      latestLedgerEntryId: data.latest_ledger_entry_id || null,
    };
  }

  async getVerificationConfidence(workId: string): Promise<VerificationConfidenceEntity> {
    const data = await apiClient.get<{
      project_id: string;
      verification_confidence: number;
      independent_evidence_status: string;
      triangulation_summary: Record<string, number>;
      evaluated_at: string;
    }>(ApiEndpoints.risk.verificationConfidence(workId));

    return {
      projectId: data.project_id || workId,
      verificationConfidence: Number(data.verification_confidence) || 0,
      independentEvidenceStatus: data.independent_evidence_status || 'INDEPENDENT_EVIDENCE_UNAVAILABLE',
      triangulationSummary: data.triangulation_summary || {},
      evaluatedAt: data.evaluated_at || new Date().toISOString(),
    };
  }

  async getProjectLedgerHistory(workId: string): Promise<AuditLedgerHistoryEntity> {
    const data = await apiClient.get<{
      project_id: string;
      total_ledger_entries: number;
      ledger_history: any[];
    }>(ApiEndpoints.risk.ledger(workId));

    return {
      projectId: data.project_id || workId,
      totalLedgerEntries: data.total_ledger_entries || 0,
      ledgerHistory: data.ledger_history || [],
    };
  }

  async getSLABottleneck(workId: string): Promise<SLABottleneckEntity> {
    const data = await apiClient.get<SLABottleneckDTO>(
      ApiEndpoints.risk.slaBottleneck(workId)
    );

    return DataMappers.mapSLABottleneckDTOToEntity(data);
  }

  async getOptimizedInspections(): Promise<{
    totalInspectors: number;
    totalPlannedInspections: number;
    routes: InspectorScheduleEntity[];
  }> {
    const data = await apiClient.get<{
      total_inspectors: number;
      total_planned_inspections: number;
      inspector_routes: { route_stops: InspectorScheduleItemDTO[] }[];
    }>(ApiEndpoints.risk.inspections);

    const allStops: InspectorScheduleEntity[] = [];
    (data.inspector_routes || []).forEach((r) => {
      (r.route_stops || []).forEach((stop) => {
        allStops.push(DataMappers.mapInspectorScheduleItemDTOToEntity(stop));
      });
    });

    return {
      totalInspectors: data.total_inspectors || 0,
      totalPlannedInspections: data.total_planned_inspections || 0,
      routes: allStops,
    };
  }
}
