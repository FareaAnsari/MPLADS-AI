import {
  ProjectDTO,
  MPDTO,
  RiskAssessmentDTO,
  SLABottleneckDTO,
  InspectorScheduleItemDTO,
  EvidenceVerificationResultDTO,
  NotificationDTO,
  NotificationPreferencesResponseDTO,
  MPDashboardDTO,
  MPProjectDetailDTO,
  ContractorDashboardDTO,
  ContractorProjectDetailDTO,
  ContractorProgressUpdateDTO,
  ContractorIssueDTO,
} from '../dto';
import {
  ProjectEntity,
  MPEntity,
  RiskAssessmentEntity,
  SLABottleneckEntity,
  InspectorScheduleEntity,
  EvidenceVerificationResultEntity,
  NotificationEntity,
  NotificationPreferencesEntity,
  NotificationType,
  NotificationCategory,
  MPDashboardEntity,
  MPProjectDetailEntity,
  ContractorDashboardEntity,
  ContractorProjectDetailEntity,
  ContractorProgressUpdateEntity,
  ContractorIssueEntity,
} from '../../../domain/entities';

export class DataMappers {
  static mapProjectDTOToEntity(dto: ProjectDTO): ProjectEntity {
    return {
      id: dto.id || dto.work_id,
      workId: dto.work_id,
      workTitle: dto.work_title || 'Untitled Work',
      workCategory: dto.work_category || 'General Infrastructure',
      workDescription: dto.work_description || null,
      mpName: dto.mp_name || null,
      idaOffice: dto.ida_office || null,
      state: dto.state || 'Unknown State',
      constituency: dto.constituency || null,
      sanctionedAmountInr: Number(dto.sanctioned_amount_inr) || 0,
      disbursedAmountInr: Number(dto.disbursed_amount_inr) || 0,
      currentStage: dto.current_stage || 'PROPOSAL_SUBMITTED',
      hasOfficialImages: Boolean(dto.has_official_images),
      source: dto.provenance?.source || 'data.gov.in / eSAKSHI',
      sourceType: dto.provenance?.source_type || 'OFFICIAL_PUBLIC',
    };
  }

  static mapMPDTOToEntity(dto: MPDTO): MPEntity {
    return {
      id: dto.id || `${dto.state}-${dto.mp_name}`,
      mpName: dto.mp_name,
      house: dto.house,
      category: dto.category,
      state: dto.state,
      constituency: dto.constituency || null,
      allocatedLimitInr: Number(dto.allocated_limit_inr) || 0,
    };
  }

  static mapRiskAssessmentDTOToEntity(dto: RiskAssessmentDTO): RiskAssessmentEntity {
    const rawBreakdown = dto.score_breakdown || dto.component_breakdown || {};
    return {
      projectId: dto.project_id || dto.work_id,
      workId: dto.work_id,
      riskScore: Math.round(Number(dto.risk_score) || 0),
      anomalyFlag: dto.anomaly_flag || 'NORMAL',
      scoreBreakdown: {
        costAnomalyScore: Number(rawBreakdown.cost_anomaly_score ?? rawBreakdown.cost_anomaly ?? 0),
        timeDelayScore: Number(rawBreakdown.time_delay_score ?? rawBreakdown.delay_anomaly ?? 0),
        duplicateRiskScore: Number(rawBreakdown.duplicate_risk_score ?? rawBreakdown.evidence_issue ?? 0),
        clusterDensityScore: Number(rawBreakdown.cluster_density_score ?? rawBreakdown.spatial_signal ?? 0),
      },
      evaluatedAt: dto.evaluated_at || new Date().toISOString(),
      primaryRiskReason: dto.explanation?.primary_reason || undefined,
    };
  }

  static mapSLABottleneckDTOToEntity(dto: SLABottleneckDTO): SLABottleneckEntity {
    return {
      projectId: dto.project_id,
      currentStage: dto.current_stage,
      daysInCurrentStage: Number(dto.days_in_current_stage) || 0,
      expectedBenchmarkDays: Number(dto.expected_benchmark_days) || 0,
      delayRatio: Number(dto.delay_ratio) || 1.0,
      responsibleRole: dto.responsible_role || 'District Authority',
      isBottleneck: Boolean(dto.is_bottleneck),
    };
  }

  static mapInspectorScheduleItemDTOToEntity(dto: InspectorScheduleItemDTO): InspectorScheduleEntity {
    return {
      inspectionPriorityRank: dto.inspection_priority_rank,
      projectId: dto.project_id,
      workId: dto.work_id,
      priorityScore: Number(dto.priority_score) || 0,
      riskScore: Number(dto.risk_score) || 0,
      disbursedAmountInr: Number(dto.disbursed_amount_inr) || 0,
      distanceFromBaseKm: Number(dto.distance_from_base_km) || 0,
      recommendedAction: dto.recommended_action || 'Site Inspection Required',
    };
  }

  static mapEvidenceVerificationDTOToEntity(dto: EvidenceVerificationResultDTO): EvidenceVerificationResultEntity {
    return {
      evidenceId: dto.evidence_id,
      projectId: dto.project_id,
      distanceToProjectMeters: Number(dto.distance_to_project_meters) || 0,
      locationVerified: Boolean(dto.location_verified),
      duplicateDetected: Boolean(dto.duplicate_detected),
      verificationStatus: dto.verification_status || 'REQUIRES_VERIFICATION',
    };
  }

  static mapNotificationDTOToEntity(dto: NotificationDTO): NotificationEntity {
    return {
      id: dto.id,
      userId: dto.user_id,
      role: dto.role,
      type: dto.type as NotificationType,
      category: dto.category as NotificationCategory,
      title: dto.title,
      body: dto.body,
      entityType: dto.entity_type || undefined,
      entityId: dto.entity_id || undefined,
      deepLink: dto.deep_link || undefined,
      readAt: dto.read_at || null,
      createdAt: dto.created_at,
    };
  }

  static mapNotificationPreferencesDTOToEntity(dto: NotificationPreferencesResponseDTO): NotificationPreferencesEntity {
    return {
      pushEnabled: Boolean(dto.push_enabled),
      evidenceUpdates: Boolean(dto.evidence_updates),
      riskAlerts: Boolean(dto.risk_alerts),
      slaAlerts: Boolean(dto.sla_alerts),
      inspectionUpdates: Boolean(dto.inspection_updates),
      projectMilestones: Boolean(dto.project_milestones),
      updatedAt: dto.updated_at,
    };
  }

  static mapMPDashboardDTOToEntity(dto: MPDashboardDTO): MPDashboardEntity {
    return {
      mp: {
        id: dto.mp.id,
        fullName: dto.mp.full_name,
        role: dto.mp.role,
        constituency: dto.mp.constituency || 'General Constituency',
        state: dto.mp.state || 'National',
      },
      metrics: {
        totalConstituencyProjects: dto.metrics.total_constituency_projects || 0,
        activeCount: dto.metrics.active_count || 0,
        completedCount: dto.metrics.completed_count || 0,
        delayedCount: dto.metrics.delayed_count || 0,
        totalSanctionedInr: Number(dto.metrics.total_sanctioned_inr) || 0,
        totalDisbursedInr: Number(dto.metrics.total_disbursed_inr) || 0,
        highRiskAttentionCount: dto.metrics.high_risk_attention_count || 0,
        publicEvidenceCount: dto.metrics.public_evidence_count || 0,
        utilizationPercentage: Number(dto.metrics.utilization_percentage) || 0,
      },
      riskDistribution: {
        low: dto.risk_distribution.low || 0,
        medium: dto.risk_distribution.medium || 0,
        high: dto.risk_distribution.high || 0,
        critical: dto.risk_distribution.critical || 0,
      },
      recentProjects: (dto.recent_projects || []).map(DataMappers.mapProjectDTOToEntity),
    };
  }

  static mapMPProjectDetailDTOToEntity(dto: MPProjectDetailDTO): MPProjectDetailEntity {
    return {
      project: DataMappers.mapProjectDTOToEntity(dto.project),
      financials: {
        sanctionedAmountInr: Number(dto.financials.sanctioned_amount_inr) || 0,
        disbursedAmountInr: Number(dto.financials.disbursed_amount_inr) || 0,
        expenditureInr: Number(dto.financials.expenditure_inr) || 0,
        remainingBalanceInr: Number(dto.financials.remaining_balance_inr) || 0,
        utilizationPercentage: Number(dto.financials.utilization_percentage) || 0,
      },
      milestones: (dto.milestones || []).map((m) => ({
        stageId: m.stage_id,
        stageName: m.stage_name,
        isCompleted: Boolean(m.is_completed),
        isCurrent: Boolean(m.is_current),
        benchmarkDays: Number(m.benchmark_days) || 0,
        daysInStage: m.days_in_stage != null ? Number(m.days_in_stage) : null,
        status: m.status,
      })),
      riskOversight: {
        riskScore: Number(dto.risk_oversight.risk_score) || 0,
        riskLevel: dto.risk_oversight.risk_level,
        attentionRequired: Boolean(dto.risk_oversight.attention_required),
        primaryRiskSignal: dto.risk_oversight.primary_risk_signal || null,
        topContributingFactor: dto.risk_oversight.top_contributing_factor || null,
      },
      publicEvidence: dto.public_evidence || [],
      expenditures: dto.expenditures || [],
    };
  }

  static mapContractorProgressUpdateDTOToEntity(dto: ContractorProgressUpdateDTO): ContractorProgressUpdateEntity {
    return {
      submissionId: dto.submission_id,
      workId: dto.work_id,
      contractorId: dto.contractor_id,
      reportedProgressPercent: Number(dto.reported_progress_percent) || 0,
      milestoneStage: dto.milestone_stage || 'IMPLEMENTATION_IN_PROGRESS',
      remarks: dto.remarks || '',
      fieldObservations: dto.field_observations || null,
      status: dto.status || 'SUBMITTED',
      submittedAt: dto.submitted_at,
      auditRef: dto.audit_ref || 'AUD-CTR-REF',
    };
  }

  static mapContractorIssueDTOToEntity(dto: ContractorIssueDTO): ContractorIssueEntity {
    return {
      issueId: dto.issue_id,
      workId: dto.work_id,
      contractorId: dto.contractor_id,
      category: dto.category,
      title: dto.title,
      description: dto.description,
      severity: dto.severity,
      status: dto.status || 'REPORTED',
      reportedAt: dto.reported_at,
      acknowledgedAt: dto.acknowledged_at || null,
    };
  }

  static mapContractorDashboardDTOToEntity(dto: ContractorDashboardDTO): ContractorDashboardEntity {
    return {
      contractor: {
        id: dto.contractor.id,
        fullName: dto.contractor.full_name,
        companyName: dto.contractor.company_name,
        role: dto.contractor.role,
        jurisdictionState: dto.contractor.jurisdiction_state || undefined,
        contractorId: dto.contractor.contractor_id,
      },
      metrics: {
        assignedProjectsCount: dto.metrics.assigned_projects_count || 0,
        activeWorksCount: dto.metrics.active_works_count || 0,
        completedWorksCount: dto.metrics.completed_works_count || 0,
        pendingSubmissionsCount: dto.metrics.pending_submissions_count || 0,
        reportedIssuesCount: dto.metrics.reported_issues_count || 0,
        totalContractValueInr: Number(dto.metrics.total_contract_value_inr) || 0,
      },
      assignedProjects: (dto.assigned_projects || []).map(DataMappers.mapProjectDTOToEntity),
      recentSubmissions: (dto.recent_submissions || []).map(DataMappers.mapContractorProgressUpdateDTOToEntity),
    };
  }

  static mapContractorProjectDetailDTOToEntity(dto: ContractorProjectDetailDTO): ContractorProjectDetailEntity {
    return {
      project: DataMappers.mapProjectDTOToEntity(dto.project),
      contractValueInr: Number(dto.contract_value_inr) || 0,
      reportedProgressPercent: Number(dto.reported_progress_percent) || 0,
      verifiedProgressPercent: Number(dto.verified_progress_percent) || 0,
      milestones: (dto.milestones || []).map((m) => ({
        stageId: m.stage_id,
        stageName: m.stage_name,
        targetPercent: Number(m.target_percent) || 0,
        isCompleted: Boolean(m.is_completed),
      })),
      progressHistory: (dto.progress_history || []).map(DataMappers.mapContractorProgressUpdateDTOToEntity),
      issues: (dto.issues || []).map(DataMappers.mapContractorIssueDTOToEntity),
    };
  }
}



