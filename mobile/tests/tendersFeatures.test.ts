import { mobileTenderService } from '../src/services/tenderService';

describe('E-Procurement, Tenders & Contract Registry Mobile Service', () => {
  it('loads tenders list with valid GFR tender types and Tier-3 provenance', async () => {
    const tenders = await mobileTenderService.getTenders();
    expect(tenders.length).toBeGreaterThanOrEqual(2);
    tenders.forEach((t) => {
      expect(t.tender_id).toBeDefined();
      expect(t.work_id).toBeDefined();
      expect(t.data_provenance).toBe('TIER_3_DEMO');
      expect(t.estimated_cost).toBeGreaterThan(0);
    });
  });

  it('fetches tender detail with comparative bids and AI Bidder Scrutiny signals', async () => {
    const tender = await mobileTenderService.getTenderById('TND-2024-MH-001');
    expect(tender).not.toBeNull();
    expect(tender?.tender_id).toBe('TND-2024-MH-001');
    expect(tender?.bids.length).toBeGreaterThanOrEqual(2);

    // Verify AI scrutiny signal for abnormally low bid
    const lowBidSignal = tender?.scrutiny_signals.find(
      (s) => s.signal_type === 'ABNORMALLY_LOW_BID'
    );
    expect(lowBidSignal).toBeDefined();
    expect(lowBidSignal?.severity).toBe('HIGH');
  });

  it('fetches awarded contracts list linked to supply chain records', async () => {
    const contracts = await mobileTenderService.getContracts();
    expect(contracts.length).toBeGreaterThanOrEqual(1);
    const c1 = contracts[0];
    expect(c1.contract_id).toBeDefined();
    expect(c1.supply_chain_record_id).toBeDefined();
    expect(c1.data_provenance).toBe('TIER_3_DEMO');
  });
});
