import { DataMappers } from '../src/data/remote/mappers';
import { ProjectDTO, RiskAssessmentDTO } from '../src/data/remote/dto';
import { formatINR, formatRiskScore } from '../src/utils/formatters';

describe('DataMappers & Domain Converters (Unit Tests)', () => {
  it('correctly maps a ProjectDTO to a Domain ProjectEntity', () => {
    const rawDto: ProjectDTO = {
      work_id: 'WORK-TEST-001',
      work_title: 'Solar High Mast Lighting at Village Panchayat',
      work_category: 'Renewable Energy',
      sanctioned_amount_inr: 2500000,
      disbursed_amount_inr: 2000000,
      state: 'Bihar',
      ida_office: 'Araria IDA',
      mp_name: 'Hon. MP',
      current_stage: 'WORK_EXECUTION',
      has_official_images: true,
      provenance: {
        source: 'eSAKSHI Public Release',
        source_type: 'OFFICIAL_PUBLIC',
      },
    };

    const entity = DataMappers.mapProjectDTOToEntity(rawDto);

    expect(entity.workId).toBe('WORK-TEST-001');
    expect(entity.workTitle).toBe('Solar High Mast Lighting at Village Panchayat');
    expect(entity.sanctionedAmountInr).toBe(2500000);
    expect(entity.disbursedAmountInr).toBe(2000000);
    expect(entity.state).toBe('Bihar');
    expect(entity.hasOfficialImages).toBe(true);
    expect(entity.source).toBe('eSAKSHI Public Release');
  });

  it('correctly maps a RiskAssessmentDTO with component score breakdown', () => {
    const rawRiskDto: RiskAssessmentDTO = {
      work_id: 'WORK-TEST-001',
      risk_score: 78.4,
      anomaly_flag: 'POTENTIAL_ANOMALY',
      component_breakdown: {
        cost_anomaly: 40,
        delay_anomaly: 25,
        payment_pattern: 13.4,
        spatial_signal: 0,
      },
      explanation: {
        primary_reason: 'Disbursal rate diverged from peer benchmark by 2.4 sigma.',
      },
    };

    const entity = DataMappers.mapRiskAssessmentDTOToEntity(rawRiskDto);

    expect(entity.workId).toBe('WORK-TEST-001');
    expect(entity.riskScore).toBe(78);
    expect(entity.anomalyFlag).toBe('POTENTIAL_ANOMALY');
    expect(entity.scoreBreakdown.costAnomalyScore).toBe(40);
    expect(entity.scoreBreakdown.timeDelayScore).toBe(25);
    expect(entity.primaryRiskReason).toContain('2.4 sigma');
  });

  it('formats Indian currency and risk score badges accurately', () => {
    expect(formatINR(500000)).toBe('₹5,00,000');
    expect(formatINR(25000000, true)).toBe('₹2.50 Cr');
    expect(formatINR(450000, true)).toBe('₹4.50 L');

    const highRisk = formatRiskScore(75);
    expect(highRisk.label).toBe('High Risk');
    expect(highRisk.variant).toBe('riskHigh');

    const lowRisk = formatRiskScore(22);
    expect(lowRisk.label).toBe('Low Risk');
    expect(lowRisk.variant).toBe('riskLow');
  });
});
