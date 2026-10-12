export interface FixedTier {
  val: string;
  valNum: number;
  tag: string;
  userRate: number;
  merchRate: number;
  marginAmount: number;
  marginPercent: number;
  limit: string;
  used: string;
  pct: number;
  popular?: boolean;
}

export interface QuoteMatrixRow {
  id: string;
  brandId?: string;
  country: string;
  name: string;
  cur: string;
  tier: string;
  faceValue?: number;
  tierTag?: string;
  speed: string;
  userRate: number;
  userRmb: string;
  merchRate: number;
  merchNote: string;
  margin: string;
  marginPercent: number;
  marginWarning?: boolean;
  marginRmb?: string;
  status: '采集中' | '利差低' | '熔断锁定';
  fused?: boolean;
  rowClass?: string;
}

export interface BrandQuoteItem {
  id: string;
  name: string;
  count: string;
  status: '开启' | '熔断中' | '关闭';
  iconText: string;
  iconSvg?: boolean;
  error?: boolean;
  disabled?: boolean;
  brandCode: string;
  uniqueCode: string;
  currency: string;
  dailyOrders: number;
  dailyPrincipalUsd: number;
  bocMid: number;
  peerRate: number;
  platformRate: number;
  avgMargin: number;
  normalRate: string;
}

export const INITIAL_BRANDS: BrandQuoteItem[] = [
  {
    id: 'APPLE',
    brandCode: 'APPLE',
    name: 'Apple 苹果充值卡',
    uniqueCode: 'APPL-US-DIRECT',
    currency: 'USD',
    count: '12 组梯度折率在收',
    status: '开启',
    iconText: '',
    iconSvg: true,
    dailyOrders: 4820,
    dailyPrincipalUsd: 482000,
    bocMid: 7.2350,
    peerRate: 6.9100,
    platformRate: 6.9500,
    avgMargin: 1.95,
    normalRate: '99.85%'
  },
  {
    id: 'STEAM',
    brandCode: 'STEAM',
    name: 'Steam 蒸汽平台卡',
    uniqueCode: 'STM-GLOBAL-POOL',
    currency: 'USD',
    count: '8 组梯度通道',
    status: '开启',
    iconText: 'STM',
    dailyOrders: 3120,
    dailyPrincipalUsd: 215000,
    bocMid: 7.2350,
    peerRate: 6.8400,
    platformRate: 6.8800,
    avgMargin: 2.15,
    normalRate: '99.90%'
  },
  {
    id: 'GOOGLE',
    brandCode: 'GOOGLE',
    name: 'Google Play 谷歌礼品卡',
    uniqueCode: 'GGL-US-DIRECT',
    currency: 'USD',
    count: '6 组梯度通道',
    status: '开启',
    iconText: 'GGL',
    dailyOrders: 1840,
    dailyPrincipalUsd: 142000,
    bocMid: 7.2350,
    peerRate: 6.7800,
    platformRate: 6.8200,
    avgMargin: 1.88,
    normalRate: '99.72%'
  },
  {
    id: 'RAZER',
    brandCode: 'RAZER',
    name: 'Razer Gold 雷蛇积分卡',
    uniqueCode: 'RZR-INTL-CARD',
    currency: 'USD',
    count: '5 组梯度通道',
    status: '开启',
    iconText: 'RZR',
    dailyOrders: 1250,
    dailyPrincipalUsd: 95000,
    bocMid: 7.2350,
    peerRate: 6.8500,
    platformRate: 6.9000,
    avgMargin: 2.05,
    normalRate: '99.60%'
  },
  {
    id: 'AMAZON',
    brandCode: 'AMAZON',
    name: 'Amazon 亚马逊礼品卡',
    uniqueCode: 'AMZ-JP-RETAIL',
    currency: 'JPY',
    count: '日区告警已熔断',
    status: '熔断中',
    iconText: 'AMZ',
    error: true,
    dailyOrders: 410,
    dailyPrincipalUsd: 32000,
    bocMid: 0.0482,
    peerRate: 6.6200,
    platformRate: 6.6000,
    avgMargin: 0.00,
    normalRate: '82.10%'
  },
  {
    id: 'VANILLA',
    brandCode: 'VANILLA',
    name: 'Vanilla 香草预付卡',
    uniqueCode: 'VAN-PREPAID-US',
    currency: 'USD',
    count: '4 组梯度通道',
    status: '开启',
    iconText: 'VAN',
    dailyOrders: 890,
    dailyPrincipalUsd: 78000,
    bocMid: 7.2350,
    peerRate: 6.7200,
    platformRate: 6.7600,
    avgMargin: 2.24,
    normalRate: '99.40%'
  },
  {
    id: 'NIKE',
    brandCode: 'NIKE',
    name: 'Nike 耐克实体卡',
    uniqueCode: 'NKE-PHYSICAL-POOL',
    currency: 'USD',
    count: '点池不足 暂停接单',
    status: '关闭',
    iconText: 'NKE',
    disabled: true,
    dailyOrders: 0,
    dailyPrincipalUsd: 0,
    bocMid: 7.2350,
    peerRate: 6.5000,
    platformRate: 6.5000,
    avgMargin: 0.00,
    normalRate: '0.00%'
  }
];

export const INITIAL_MATRIX_ROWS: QuoteMatrixRow[] = [
  // --- Apple ---
  {
    id: 'M1',
    brandId: 'APPLE',
    country: 'US',
    name: 'Apple Store (US)',
    cur: 'USD',
    tier: '$100.00',
    faceValue: 100,
    tierTag: '主力核心',
    speed: '极速销 (3-5 min)',
    userRate: 6.9500,
    userRmb: '¥502.77 / $100',
    merchRate: 6.8100,
    merchNote: '商户底线锁定',
    margin: '+2.01%',
    marginPercent: 2.01,
    marginRmb: '¥488.58/张 兑现',
    status: '采集中'
  },
  {
    id: 'M2',
    brandId: 'APPLE',
    country: 'US',
    name: 'Apple Store (US)',
    cur: 'USD',
    tier: '$50.00',
    faceValue: 50,
    tierTag: '小额散卡',
    speed: '标准速 (5-15 min)',
    userRate: 6.9200,
    userRmb: '¥250.30 / $50',
    merchRate: 6.8000,
    merchNote: '商户统一承兑',
    margin: '+1.73%',
    marginPercent: 1.73,
    marginRmb: '+¥4.34 净利',
    status: '采集中'
  },
  {
    id: 'M3',
    brandId: 'APPLE',
    country: 'US',
    name: 'Apple Store (US)',
    cur: 'USD',
    tier: '$25.00 - $500.00',
    faceValue: 150,
    tierTag: '自选面额',
    speed: '大额专通道',
    userRate: 6.8800,
    userRmb: '区间自动插值',
    merchRate: 6.7700,
    merchNote: '大宗商户池锁定',
    margin: '+1.60%',
    marginPercent: 1.60,
    marginRmb: '浮动利差充盈',
    status: '采集中'
  },
  {
    id: 'M4',
    brandId: 'APPLE',
    country: 'UK',
    name: 'Apple Store (UK)',
    cur: 'GBP',
    tier: '£50.00 - £200.00',
    faceValue: 50,
    tierTag: 'G-Series',
    speed: '快卡直审 (1 min)',
    userRate: 6.8300,
    userRmb: '汇率波动紧逼',
    merchRate: 6.7450,
    merchNote: '伦敦通道底价',
    margin: '+1.24%',
    marginPercent: 1.24,
    marginWarning: true,
    status: '利差低',
    rowClass: 'bg-red-50/20'
  },
  {
    id: 'M5',
    brandId: 'APPLE',
    country: 'DE',
    name: 'Apple Store (EU/DE)',
    cur: 'EUR',
    tier: '€100.00 / 固定',
    faceValue: 100,
    speed: '普通流速 (15 min)',
    userRate: 6.7200,
    userRmb: '平稳运行',
    merchRate: 6.5600,
    merchNote: '法兰克福承接',
    margin: '+2.38%',
    marginPercent: 2.38,
    marginRmb: '高毛利通道',
    status: '采集中'
  },
  {
    id: 'M6',
    brandId: 'APPLE',
    country: 'JP',
    name: 'Apple Store (JP)',
    cur: 'JPY',
    tier: '¥10,000 / 固定',
    faceValue: 10000,
    speed: '已熔断停摆',
    userRate: 0,
    userRmb: '停止向C端买入',
    merchRate: 0,
    merchNote: '商户头寸饱和',
    margin: '0.00%',
    marginPercent: 0,
    status: '熔断锁定',
    fused: true,
    rowClass: 'opacity-60 bg-slate-50'
  },

  // --- Steam ---
  {
    id: 'M-STM-1',
    brandId: 'STEAM',
    country: 'US',
    name: 'Steam 钱包充值卡 (US)',
    cur: 'USD',
    tier: '$100.00',
    faceValue: 100,
    tierTag: '主力秒收',
    speed: '极速直充 (30s)',
    userRate: 6.8800,
    userRmb: '¥497.71 / $100',
    merchRate: 6.7320,
    merchNote: '大宗协议锁定',
    margin: '+2.15%',
    marginPercent: 2.15,
    marginRmb: '+¥10.70/张 净利',
    status: '采集中'
  },
  {
    id: 'M-STM-2',
    brandId: 'STEAM',
    country: 'US',
    name: 'Steam 钱包充值卡 (US)',
    cur: 'USD',
    tier: '$50.00',
    faceValue: 50,
    tierTag: '热门流通',
    speed: '自动做卡 (1-3 min)',
    userRate: 6.8500,
    userRmb: '¥247.77 / $50',
    merchRate: 6.7150,
    merchNote: '标准承兑通道',
    margin: '+1.97%',
    marginPercent: 1.97,
    marginRmb: '+¥4.88/张 净利',
    status: '采集中'
  },
  {
    id: 'M-STM-3',
    brandId: 'STEAM',
    country: 'UK',
    name: 'Steam 钱包充值卡 (UK)',
    cur: 'GBP',
    tier: '£50.00',
    faceValue: 50,
    tierTag: '实体小票',
    speed: '人工核销 (5 min)',
    userRate: 6.8200,
    userRmb: '¥493.37 / £50',
    merchRate: 6.6780,
    merchNote: '英镑专线底价',
    margin: '+2.08%',
    marginPercent: 2.08,
    marginRmb: '+¥10.26/张 净利',
    status: '采集中'
  },
  {
    id: 'M-STM-4',
    brandId: 'STEAM',
    country: 'DE',
    name: 'Steam 钱包充值卡 (DE)',
    cur: 'EUR',
    tier: '€100.00',
    faceValue: 100,
    tierTag: '欧陆专享',
    speed: '直连秒验 (1 min)',
    userRate: 6.7600,
    userRmb: '¥489.02 / €100',
    merchRate: 6.6110,
    merchNote: '欧洲核心商户',
    margin: '+2.20%',
    marginPercent: 2.20,
    marginRmb: '+¥10.76/张 净利',
    status: '采集中'
  },
  {
    id: 'M-STM-5',
    brandId: 'STEAM',
    country: 'US',
    name: 'Steam 钱包充值卡 (US)',
    cur: 'USD',
    tier: '$10.00 - $500.00',
    faceValue: 200,
    tierTag: '自选动态',
    speed: '动态阶梯 (3 min)',
    userRate: 6.8000,
    userRmb: '按梯度插值',
    merchRate: 6.6770,
    merchNote: '阶梯保底协议',
    margin: '+1.81%',
    marginPercent: 1.81,
    marginRmb: '差额锁定',
    status: '采集中'
  },

  // --- Google Play ---
  {
    id: 'M-GGL-1',
    brandId: 'GOOGLE',
    country: 'US',
    name: 'Google Play 礼品卡 (US)',
    cur: 'USD',
    tier: '$100.00',
    faceValue: 100,
    tierTag: '高频直充',
    speed: '极速直连 (1 min)',
    userRate: 6.8200,
    userRmb: '¥493.37 / $100',
    merchRate: 6.6920,
    merchNote: '谷歌官方直充源',
    margin: '+1.88%',
    marginPercent: 1.88,
    marginRmb: '+¥9.26/张 净利',
    status: '采集中'
  },
  {
    id: 'M-GGL-2',
    brandId: 'GOOGLE',
    country: 'US',
    name: 'Google Play 礼品卡 (US)',
    cur: 'USD',
    tier: '$50.00',
    faceValue: 50,
    tierTag: '常规小额',
    speed: '自动派发 (2 min)',
    userRate: 6.7900,
    userRmb: '¥245.60 / $50',
    merchRate: 6.6750,
    merchNote: '商户池承兑',
    margin: '+1.69%',
    marginPercent: 1.69,
    marginRmb: '+¥4.15/张 净利',
    status: '采集中'
  },
  {
    id: 'M-GGL-3',
    brandId: 'GOOGLE',
    country: 'UK',
    name: 'Google Play 礼品卡 (UK)',
    cur: 'GBP',
    tier: '£25.00',
    faceValue: 25,
    tierTag: '实体卡小票',
    speed: '坐席做卡 (5 min)',
    userRate: 6.7500,
    userRmb: '¥244.15 / £25',
    merchRate: 6.6420,
    merchNote: '英国专线保底',
    margin: '+1.60%',
    marginPercent: 1.60,
    marginRmb: '+¥3.91/张 净利',
    status: '采集中'
  },
  {
    id: 'M-GGL-4',
    brandId: 'GOOGLE',
    country: 'JP',
    name: 'Google Play 礼品卡 (JP)',
    cur: 'JPY',
    tier: '¥5,000 / 固定',
    faceValue: 5000,
    tierTag: '日区专线',
    speed: 'API秒验 (45s)',
    userRate: 6.6800,
    userRmb: '¥241.62 / ¥5k',
    merchRate: 6.5660,
    merchNote: '日元对冲保价',
    margin: '+1.71%',
    marginPercent: 1.71,
    marginRmb: '+¥4.12/张 净利',
    status: '采集中'
  },

  // --- Razer Gold ---
  {
    id: 'M-RZR-1',
    brandId: 'RAZER',
    country: 'US',
    name: 'Razer Gold 雷蛇点卡 (Global)',
    cur: 'USD',
    tier: '$100.00',
    faceValue: 100,
    tierTag: '爆款主力',
    speed: 'API极速充 (20s)',
    userRate: 6.9000,
    userRmb: '¥499.15 / $100',
    merchRate: 6.7580,
    merchNote: '雷蛇大宗协议价',
    margin: '+2.06%',
    marginPercent: 2.06,
    marginRmb: '+¥10.27/张 净利',
    status: '采集中'
  },
  {
    id: 'M-RZR-2',
    brandId: 'RAZER',
    country: 'US',
    name: 'Razer Gold 雷蛇点卡 (Global)',
    cur: 'USD',
    tier: '$50.00',
    faceValue: 50,
    tierTag: '小额标卡',
    speed: '极速直充 (1 min)',
    userRate: 6.8600,
    userRmb: '¥248.13 / $50',
    merchRate: 6.7290,
    merchNote: '官方直属通道',
    margin: '+1.91%',
    marginPercent: 1.91,
    marginRmb: '+¥4.74/张 净利',
    status: '采集中'
  },
  {
    id: 'M-RZR-3',
    brandId: 'RAZER',
    country: 'US',
    name: 'Razer Gold 雷蛇点卡 (US)',
    cur: 'USD',
    tier: '$200.00',
    faceValue: 200,
    tierTag: '大宗高额',
    speed: '大额专席 (2 min)',
    userRate: 6.9200,
    userRmb: '¥998.30 / $200',
    merchRate: 6.7680,
    merchNote: 'TIER-S专属底价',
    margin: '+2.20%',
    marginPercent: 2.20,
    marginRmb: '+¥21.96/张 净利',
    status: '采集中'
  },

  // --- Amazon ---
  {
    id: 'M-AMZ-1',
    brandId: 'AMAZON',
    country: 'US',
    name: 'Amazon 亚马逊礼品卡 (US)',
    cur: 'USD',
    tier: '$100.00',
    faceValue: 100,
    tierTag: '纯E-Code',
    speed: '官方秒验 (1 min)',
    userRate: 6.7200,
    userRmb: '¥486.13 / $100',
    merchRate: 6.6060,
    merchNote: '北美海外购承接',
    margin: '+1.70%',
    marginPercent: 1.70,
    marginRmb: '+¥8.24/张 净利',
    status: '采集中'
  },
  {
    id: 'M-AMZ-2',
    brandId: 'AMAZON',
    country: 'UK',
    name: 'Amazon 亚马逊礼品卡 (UK)',
    cur: 'GBP',
    tier: '£50.00',
    faceValue: 50,
    tierTag: '小额实体卡',
    speed: '人工复核 (10 min)',
    userRate: 6.6800,
    userRmb: '¥483.24 / £50',
    merchRate: 6.5860,
    merchNote: '伦敦商户底价',
    margin: '+1.41%',
    marginPercent: 1.41,
    marginWarning: true,
    status: '利差低',
    marginRmb: '+¥6.80/张 净利'
  },
  {
    id: 'M-AMZ-3',
    brandId: 'AMAZON',
    country: 'JP',
    name: 'Amazon 亚马逊礼品卡 (JP)',
    cur: 'JPY',
    tier: '¥10,000 / 固定',
    faceValue: 10000,
    tierTag: '风控熔断',
    speed: '暂停接单',
    userRate: 0,
    userRmb: '风控熔断停收',
    merchRate: 0,
    merchNote: '日区批量黑卡拦截',
    margin: '0.00%',
    marginPercent: 0,
    status: '熔断锁定',
    fused: true,
    rowClass: 'opacity-60 bg-red-50/30'
  },

  // --- Vanilla ---
  {
    id: 'M-VAN-1',
    brandId: 'VANILLA',
    country: 'US',
    name: 'Vanilla 香草预付卡 (US)',
    cur: 'USD',
    tier: '$100.00',
    faceValue: 100,
    tierTag: '实体卡小票',
    speed: '坐席做卡 (5 min)',
    userRate: 6.7600,
    userRmb: '¥489.02 / $100',
    merchRate: 6.6080,
    merchNote: 'Visa预付结算',
    margin: '+2.25%',
    marginPercent: 2.25,
    marginRmb: '+¥11.00/张 净利',
    status: '采集中'
  },
  {
    id: 'M-VAN-2',
    brandId: 'VANILLA',
    country: 'US',
    name: 'Vanilla 香草预付卡 (US)',
    cur: 'USD',
    tier: '$200.00',
    faceValue: 200,
    tierTag: '中额主力',
    speed: '人工验卡 (8 min)',
    userRate: 6.7400,
    userRmb: '¥975.31 / $200',
    merchRate: 6.5890,
    merchNote: '核心商户协议',
    margin: '+2.24%',
    marginPercent: 2.24,
    marginRmb: '+¥21.84/张 净利',
    status: '采集中'
  },
  {
    id: 'M-VAN-3',
    brandId: 'VANILLA',
    country: 'US',
    name: 'Vanilla 香草预付卡 (US)',
    cur: 'USD',
    tier: '$500.00',
    faceValue: 500,
    tierTag: '大额高保',
    speed: '双人核验 (12 min)',
    userRate: 6.7000,
    userRmb: '¥2,423.42 / $500',
    merchRate: 6.5530,
    merchNote: '双人复核放行',
    margin: '+2.19%',
    marginPercent: 2.19,
    marginRmb: '+¥53.18/张 净利',
    status: '采集中'
  },

  // --- Nike ---
  {
    id: 'M-NKE-1',
    brandId: 'NIKE',
    country: 'US',
    name: 'Nike 耐克官方礼品卡 (US)',
    cur: 'USD',
    tier: '$100.00',
    faceValue: 100,
    tierTag: '点池不足',
    speed: '缺货暂停',
    userRate: 0,
    userRmb: '商户配额不足停单',
    merchRate: 0,
    merchNote: '暂无商户接单承兑',
    margin: '0.00%',
    marginPercent: 0,
    status: '熔断锁定',
    fused: true,
    rowClass: 'opacity-60 bg-slate-50'
  }
];

export const INITIAL_FIXED_TIERS: FixedTier[] = [
  { val: '$25.00', valNum: 25, tag: '小额', userRate: 6.9200, merchRate: 7.1000, marginAmount: 0.63, marginPercent: 2.53, limit: '$50,000', used: '$32,150 (64%)', pct: 64 },
  { val: '$50.00', valNum: 50, tag: '常规', userRate: 6.9400, merchRate: 7.1000, marginAmount: 1.13, marginPercent: 2.25, limit: '$100,000', used: '$82,400 (82%)', pct: 82 },
  { val: '$100.00', valNum: 100, tag: '主流通', userRate: 6.9600, merchRate: 7.1200, marginAmount: 2.25, marginPercent: 2.25, limit: '$300,000', used: '$273,000 (91%)', pct: 91, popular: true },
  { val: '$200.00', valNum: 200, tag: '大额', userRate: 6.9500, merchRate: 7.1000, marginAmount: 4.22, marginPercent: 2.11, limit: '$150,000', used: '$67,500 (45%)', pct: 45 },
  { val: '$500.00', valNum: 500, tag: '高风险额', userRate: 6.9100, merchRate: 7.0500, marginAmount: 9.90, marginPercent: 1.98, limit: '$80,000', used: '$25,600 (32%)', pct: 32 }
];

export interface AuditRecord {
  id: string;
  auditNo: string;
  operator: string;
  tierDesc: string;
  beforeRate: string;
  afterRate: string;
  changeRate: string;
  changePositive?: boolean;
  reason: string;
  reviewer: string;
  effectiveTime: string;
}

export const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  {
    id: '1',
    auditNo: '#AD-20231024-091',
    operator: '#OP-8821 (张晓林)',
    tierDesc: '$100 固定面额',
    beforeRate: '6.9300 折',
    afterRate: '6.9600 折',
    changeRate: '+0.0300',
    changePositive: true,
    reason: '黑五促销竞品折率拉升，匹配竞对吸单',
    reviewer: '#RC-0012 (高主管)',
    effectiveTime: '2023-10-24 11:20:15'
  },
  {
    id: '2',
    auditNo: '#AD-20231022-044',
    operator: '#OP-8819 (王敏)',
    tierDesc: '$500 高面额',
    beforeRate: '6.9400 折',
    afterRate: '6.9100 折',
    changeRate: '-0.0300',
    changePositive: false,
    reason: '大额卡欺诈风险上升，收紧承揽利润缓冲垫',
    reviewer: '#RC-0012 (高主管)',
    effectiveTime: '2023-10-22 16:45:00'
  },
  {
    id: '3',
    auditNo: '#AD-20231018-012',
    operator: '#SYS-AUTO (系统)',
    tierDesc: '全量档位微调',
    beforeRate: '基准 7.2100',
    afterRate: '基准 7.2350',
    changeRate: '+0.0250',
    changePositive: true,
    reason: '中行汇率波动超过 0.5% 阈值，系统自动平移',
    reviewer: '自动核准 (免审)',
    effectiveTime: '2023-10-18 09:30:00'
  }
];
