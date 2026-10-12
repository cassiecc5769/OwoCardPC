export type CurrencyMode = 'USD' | 'NGN';

export const USD_TO_NGN_RATE = 1595.40;

export interface FinancialFilterState {
  timeRange: 'today' | 'yesterday' | '7d' | 'month' | 'custom';
  customStartDate: string;
  customEndDate: string;
  cardBrand: string;
  region: string;
  channel: string;
  currency: CurrencyMode;
}

export interface ExecutivePnLStats {
  gmv: number;
  gmvGrowthPercent: number;
  dailyAvgGmv: number;
  spreadRevenue: number;
  spreadPercent: number;
  spreadRevenueContributionPercent: number;
  operatingCosts: number;
  operatingCostPercent: number;
  commissionCost: number;
  couponSubsidyCost: number;
  badDebtCost: number;
  netMargin: number;
  netMarginPercent: number;
  targetAchievementPercent: number;
}

export interface WaterfallStep {
  stepNumber: string;
  stepName: string;
  unitAmount: number; // per $1.00 GMV
  displayUnit: string;
  label: string;
  subLabel: string;
  progressPercent: number;
  totalAmount: number;
  type: 'base' | 'revenue' | 'cost' | 'net';
}

export interface CardSkuProfitabilityRow {
  id: string;
  skuName: string;
  skuCode: string;
  category: string;
  region: string;
  cardTypeDesc: string;
  iconName: string;
  gmv: number;
  officialRatePercent: number;
  merchantRatePercent: number;
  spreadPercent: number;
  grossRevenue: number;
  costsTotal: number;
  netProfit: number;
  netMarginPercent: number;
  healthTier: 'healthy' | 'moderate' | 'high-risk'; // healthy >4%, moderate 3-4%, high-risk <3%
  strategyTag: string;
  strategyTagStyle: string;
  actionType: 'rate_control' | 'risk_restrict';
  actionLabel: string;
  commissionDeduction: number;
  couponDeduction: number;
  badDebtDeduction: number;
}

export interface MarginEvolutionPoint {
  month: string;
  netMarginPercent: number;
  gmv: number;
  netProfit: number;
  spreadRate: number;
}

export interface SensitivitySimulationConfig {
  commissionAdjustmentPercent: number; // e.g. -0.20%
  couponAdjustmentPercent: number;     // e.g. -0.10%
  spreadMarkupPercent: number;          // e.g. +0.30%
  badDebtRecoveryPercent: number;       // e.g. +10%
}
