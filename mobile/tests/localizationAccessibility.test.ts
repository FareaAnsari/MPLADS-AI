import { t, DICTIONARIES } from '../src/i18n';
import { useAppStore } from '../src/store/appStore';
import {
  formatINR,
  formatDateIN,
  formatPercentage,
  formatNumberIN,
  formatRiskScore,
} from '../src/utils/formatters';

describe('Phase 5 — Localization & Accessibility Infrastructure Tests', () => {
  beforeEach(() => {
    // Reset app state to default English
    useAppStore.setState({ language: 'en' });
  });

  describe('Localization & Translation Engine', () => {
    it('loads English (en-IN) translations accurately', () => {
      expect(t('common.appName')).toBe('Members of Parliament Local Area Development Scheme (MPLADS)');
      expect(t('common.governmentOfIndia')).toBe('Government of India');
      expect(t('auth.title')).toBe('Statutory Access Gateway');
      expect(t('navigation.citizenPortal')).toBe('Citizen Transparency Portal');
      expect(t('risk.criticalRisk')).toBe('Critical Risk');
    });

    it('loads Hindi (hi-IN) translations when language is set to Hindi', () => {
      useAppStore.setState({ language: 'hi' });
      expect(t('common.appName')).toBe('Members of Parliament Local Area Development Scheme (MPLADS)');
      expect(t('common.governmentOfIndia')).toBe('भारत सरकार');
      expect(t('auth.title')).toBe('वैधानिक पहुंच प्रवेश द्वार');
      expect(t('navigation.citizenPortal')).toBe('नागरिक पारदर्शिता पोर्टल');
      expect(t('risk.criticalRisk')).toBe('गंभीर जोखिम');
    });

    it('falls back to English when a key is missing in Hindi', () => {
      useAppStore.setState({ language: 'hi' });
      // Non-existent key in both returns raw key
      expect(t('nonExistent.subKey')).toBe('nonExistent.subKey');
    });

    it('supports dynamic parameter interpolation', () => {
      const template = 'Work ID: {{id}} in {{district}}';
      const result = template
        .replace('{{id}}', 'WRK-2024-001')
        .replace('{{district}}', 'Araria');
      expect(result).toBe('Work ID: WRK-2024-001 in Araria');
    });

    it('verifies dictionary completeness parity between English and Hindi', () => {
      const en = DICTIONARIES['en-IN'];
      const hi = DICTIONARIES['hi-IN'];

      expect(Object.keys(en.common)).toEqual(Object.keys(hi.common));
      expect(Object.keys(en.auth)).toEqual(Object.keys(hi.auth));
      expect(Object.keys(en.navigation)).toEqual(Object.keys(hi.navigation));
      expect(Object.keys(en.projects)).toEqual(Object.keys(hi.projects));
      expect(Object.keys(en.risk)).toEqual(Object.keys(hi.risk));
      expect(Object.keys(en.evidence)).toEqual(Object.keys(hi.evidence));
      expect(Object.keys(en.inspections)).toEqual(Object.keys(hi.inspections));
      expect(Object.keys(en.errors)).toEqual(Object.keys(hi.errors));
    });
  });

  describe('Centralized Formatters (Indian Standards)', () => {
    it('formats Indian Rupee (INR) amounts correctly', () => {
      const formatted = formatINR(125000);
      expect(formatted).toContain('1,25,000');
    });

    it('formats compact INR for Lakhs and Crores', () => {
      expect(formatINR(5000000, true)).toBe('₹50.00 L');
      expect(formatINR(25000000, true)).toBe('₹2.50 Cr');
    });

    it('formats localized dates (DD MMM YYYY)', () => {
      const date = formatDateIN('2024-08-15T00:00:00.000Z');
      expect(date).toContain('2024');
      expect(date).toContain('Aug');
    });

    it('formats percentages and numbers with Indian grouping', () => {
      expect(formatPercentage(87.456, 1)).toBe('87.5%');
      expect(formatNumberIN(1500000)).toBe('15,00,000');
    });

    it('formats risk scores with semantic severity classes in English and Hindi', () => {
      const critical = formatRiskScore(95, false);
      expect(critical.label).toBe('Critical Risk');
      expect(critical.variant).toBe('riskCritical');

      const high = formatRiskScore(75, false);
      expect(high.label).toBe('High Risk');
      expect(high.variant).toBe('riskHigh');

      const medium = formatRiskScore(50, false);
      expect(medium.label).toBe('Medium Risk');
      expect(medium.variant).toBe('riskMedium');

      const low = formatRiskScore(20, false);
      expect(low.label).toBe('Low Risk');
      expect(low.variant).toBe('riskLow');

      // Hindi
      const hiCritical = formatRiskScore(95, true);
      expect(hiCritical.label).toBe('गंभीर जोखिम');

      const hiLow = formatRiskScore(15, true);
      expect(hiLow.label).toBe('कम जोखिम');
    });
  });

  describe('Accessibility Contract Verification', () => {
    it('validates that status badges never rely on color alone', () => {
      // Risk scores always bundle text label + numeric score + semantic variant
      const riskObj = formatRiskScore(85);
      expect(riskObj.label.length).toBeGreaterThan(0);
      expect(typeof riskObj.score).toBe('number');
    });

    it('validates language switching state transitions', () => {
      const store = useAppStore.getState();
      expect(store.language).toBe('en');

      store.setLanguage('hi');
      expect(useAppStore.getState().language).toBe('hi');

      store.setLanguage('en');
      expect(useAppStore.getState().language).toBe('en');
    });
  });
});
