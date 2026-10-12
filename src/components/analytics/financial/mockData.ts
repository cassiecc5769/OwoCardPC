import {
  CurrencyMode,
  USD_TO_NGN_RATE,
  ExecutivePnLStats,
  WaterfallStep,
  CardSkuProfitabilityRow,
  MarginEvolutionPoint,
} from './types';

export const BASE_EXECUTIVE_PNL: ExecutivePnLStats = {
  gmv: 1428500.0,
  gmvGrowthPercent: 12.6,
  dailyAvgGmv: 46080.64,
  spreadRevenue: 85710.0,
  spreadPercent: 6.0,
  spreadRevenueContributionPercent: 96.8,
  operatingCosts: -27290.0,
  operatingCostPercent: 1.91,
  commissionCost: -21420.0,
  couponSubsidyCost: -4280.0,
  badDebtCost: -1590.0,
  netMargin: 58420.0,
  netMarginPercent: 4.09,
  targetAchievementPercent: 114.5,
};

export const BASE_WATERFALL_STEPS: WaterfallStep[] = [
  {
    stepNumber: '01',
    stepName: '承揽基准流水',
    unitAmount: 1.0,
    displayUnit: '$1.000 GMV',
    label: '面额基准承接',
    subLabel: '基数: 100.00%',
    progressPercent: 100,
    totalAmount: 1428500,
    type: 'base',
  },
  {
    stepNumber: '02',
    stepName: '官方与商户利差',
    unitAmount: 0.06,
    displayUnit: '+$0.0600',
    label: '综合利差 6.00%',
    subLabel: '毛留存 $85,710.00',
    progressPercent: 85,
    totalAmount: 85710,
    type: 'revenue',
  },
  {
    stepNumber: '03',
    stepName: '推广裂变佣金',
    unitAmount: -0.015,
    displayUnit: '-$0.0150',
    label: '返佣比 1.50%',
    subLabel: '成本 -$21,420.00',
    progressPercent: 75,
    totalAmount: -21420,
    type: 'cost',
  },
  {
    stepNumber: '04',
    stepName: '加价券与补贴',
    unitAmount: -0.003,
    displayUnit: '-$0.0030',
    label: '让利比 0.30%',
    subLabel: '成本 -$4,280.00',
    progressPercent: 33,
    totalAmount: -4280,
    type: 'cost',
  },
  {
    stepNumber: '05',
    stepName: '售后争议与坏账',
    unitAmount: -0.0011,
    displayUnit: '-$0.0011',
    label: '风控损耗 0.11%',
    subLabel: '坏账 -$1,590.00',
    progressPercent: 17,
    totalAmount: -1590,
    type: 'cost',
  },
  {
    stepNumber: '06',
    stepName: '单元净留存毛利',
    unitAmount: 0.0409,
    displayUnit: '+$0.0409',
    label: '净毛利率 4.09%',
    subLabel: '净毛利 $58,420.00',
    progressPercent: 100,
    totalAmount: 58420,
    type: 'net',
  },
];

export const MOCK_CARD_PROFITABILITY_ROWS: CardSkuProfitabilityRow[] = [
  {
    id: 'sku-apl-usa',
    skuName: 'Apple Gift Card (US)',
    skuCode: 'SKU-APL-USA',
    category: 'Apple App Store / iTunes',
    region: 'United States (US)',
    cardTypeDesc: '物理/电子码',
    iconName: 'phone_iphone',
    gmv: 620000.0,
    officialRatePercent: 88.5,
    merchantRatePercent: 82.5,
    spreadPercent: 6.0,
    grossRevenue: 37200.0,
    costsTotal: -12400.0,
    netProfit: 24800.0,
    netMarginPercent: 4.0,
    healthTier: 'healthy',
    strategyTag: '现金牛 · 核心基石',
    strategyTagStyle: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    actionType: 'rate_control',
    actionLabel: '调控汇率',
    commissionDeduction: -9300.0,
    couponDeduction: -2480.0,
    badDebtDeduction: -620.0,
  },
  {
    id: 'sku-stm-glb',
    skuName: 'Steam Wallet (Global)',
    skuCode: 'SKU-STM-GLB',
    category: 'Steam Wallet (USD/EUR)',
    region: 'Global Unrestricted',
    cardTypeDesc: '全币种自动转汇',
    iconName: 'sports_esports',
    gmv: 380000.0,
    officialRatePercent: 82.0,
    merchantRatePercent: 75.0,
    spreadPercent: 7.0,
    grossRevenue: 26600.0,
    costsTotal: -6840.0,
    netProfit: 19760.0,
    netMarginPercent: 5.2,
    healthTier: 'healthy',
    strategyTag: '高毛利 · 主推品类',
    strategyTagStyle: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    actionType: 'rate_control',
    actionLabel: '调控汇率',
    commissionDeduction: -5700.0,
    couponDeduction: -760.0,
    badDebtDeduction: -380.0,
  },
  {
    id: 'sku-ggl-usde',
    skuName: 'Google Play (US/DE)',
    skuCode: 'SKU-GGL-USDE',
    category: 'Google Play Console',
    region: 'European Union (DE/FR)',
    cardTypeDesc: '强验证锁区卡',
    iconName: 'play_arrow',
    gmv: 220000.0,
    officialRatePercent: 86.0,
    merchantRatePercent: 81.0,
    spreadPercent: 5.0,
    grossRevenue: 11000.0,
    costsTotal: -4400.0,
    netProfit: 6600.0,
    netMarginPercent: 3.0,
    healthTier: 'moderate',
    strategyTag: '防御品 · 走量维系',
    strategyTagStyle: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    actionType: 'rate_control',
    actionLabel: '调控汇率',
    commissionDeduction: -3300.0,
    couponDeduction: -880.0,
    badDebtDeduction: -220.0,
  },
  {
    id: 'sku-rzr-pin',
    skuName: 'Razer Gold (Global)',
    skuCode: 'SKU-RZR-PIN',
    category: 'Razer Gold Global',
    region: 'Global Unrestricted',
    cardTypeDesc: '直冲PIN码',
    iconName: 'videogame_asset',
    gmv: 120000.0,
    officialRatePercent: 90.0,
    merchantRatePercent: 84.0,
    spreadPercent: 6.0,
    grossRevenue: 7200.0,
    costsTotal: -2160.0,
    netProfit: 5040.0,
    netMarginPercent: 4.2,
    healthTier: 'healthy',
    strategyTag: '稳定增量',
    strategyTagStyle: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    actionType: 'rate_control',
    actionLabel: '调控汇率',
    commissionDeduction: -1800.0,
    couponDeduction: -240.0,
    badDebtDeduction: -120.0,
  },
  {
    id: 'sku-van-pre',
    skuName: 'Vanilla / Nike (US)',
    skuCode: 'SKU-VAN-PRE',
    category: 'Vanilla Visa / Mastercard',
    region: 'United States (US)',
    cardTypeDesc: '预付费慢卡盘口',
    iconName: 'credit_card',
    gmv: 88500.0,
    officialRatePercent: 74.0,
    merchantRatePercent: 69.8,
    spreadPercent: 4.2,
    grossRevenue: 3710.0,
    costsTotal: -1520.0,
    netProfit: 2190.0,
    netMarginPercent: 2.47,
    healthTier: 'high-risk',
    strategyTag: '慢卡高危 · 收紧风控',
    strategyTagStyle: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    actionType: 'risk_restrict',
    actionLabel: '限额降权',
    commissionDeduction: -1320.0,
    couponDeduction: -100.0,
    badDebtDeduction: -100.0,
  },
];

export const MOCK_MARGIN_EVOLUTION_TREND: MarginEvolutionPoint[] = [
  { month: '03月', netMarginPercent: 3.52, gmv: 1020000, netProfit: 35900, spreadRate: 5.30 },
  { month: '04月', netMarginPercent: 3.64, gmv: 1110000, netProfit: 40400, spreadRate: 5.45 },
  { month: '05月', netMarginPercent: 3.75, gmv: 1180000, netProfit: 44250, spreadRate: 5.60 },
  { month: '06月', netMarginPercent: 3.88, gmv: 1260000, netProfit: 48880, spreadRate: 5.80 },
  { month: '07月', netMarginPercent: 3.99, gmv: 1340000, netProfit: 53460, spreadRate: 5.92 },
  { month: '08月(本期)', netMarginPercent: 4.09, gmv: 1428500, netProfit: 58420, spreadRate: 6.00 },
];

/**
 * 格式化货币展示，支持 USD 和 NGN 折算
 */
export function formatCurrencyValue(
  amountUsd: number,
  currency: CurrencyMode,
  showSign: boolean = false,
  compact: boolean = false
): string {
  const isNegative = amountUsd < 0;
  const absUsd = Math.abs(amountUsd);

  if (currency === 'NGN') {
    const ngnAmount = absUsd * USD_TO_NGN_RATE;
    const prefix = isNegative ? '-₦' : (showSign ? '+₦' : '₦');
    if (compact) {
      if (ngnAmount >= 1_000_000_000) {
        return `${prefix}${(ngnAmount / 1_000_000_000).toFixed(2)}B`;
      }
      if (ngnAmount >= 1_000_000) {
        return `${prefix}${(ngnAmount / 1_000_000).toFixed(2)}M`;
      }
      return `${prefix}${Math.round(ngnAmount).toLocaleString()}`;
    }
    return `${prefix}${ngnAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // USD
  const prefix = isNegative ? '-$' : (showSign ? '+$' : '$');
  if (compact) {
    if (absUsd >= 1_000_000) {
      return `${prefix}${(absUsd / 1_000_000).toFixed(2)}M`;
    }
    if (absUsd >= 1_000) {
      return `${prefix}${(absUsd / 1_000).toFixed(1)}k`;
    }
    return `${prefix}${absUsd.toLocaleString()}`;
  }

  return `${prefix}${absUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
