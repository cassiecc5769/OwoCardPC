import {
  StandardSKU,
  SKUQuoteOverview,
  SKUMerchantQuoteDetail,
  MerchantQuoteOverview,
  MerchantSKUQuoteMatrixItem,
  PriceChangeRecordItem,
  QuoteItem,
  MarketRawSourceItem,
  QuoteAnomalyTicket,
  MarketTrendSKUData,
  PriceAdjustRecord,
  PricingEngineParams,
  AnomalyRuleConfig
} from './quoteTypes';

// 1. 统一标准 SKU 数据集 (Brand × Country × Currency × Denomination × Card Form × Speed)
export const STANDARD_SKUS: StandardSKU[] = [
  {
    id: 'SKU-APPL-US-USD-ECODE-FAST-100',
    brand: 'Apple',
    country: 'US',
    currency: 'USD',
    denomination: 100,
    cardForm: 'E-Code',
    speed: 'Fast',
    formattedSKU: 'Apple / US / USD / $100 / E-Code / Fast'
  },
  {
    id: 'SKU-APPL-US-USD-PHYS-STD-100',
    brand: 'Apple',
    country: 'US',
    currency: 'USD',
    denomination: 100,
    cardForm: 'Physical',
    speed: 'Standard',
    formattedSKU: 'Apple / US / USD / $100 / Physical / Standard'
  },
  {
    id: 'SKU-APPL-US-USD-ECODE-FAST-50',
    brand: 'Apple',
    country: 'US',
    currency: 'USD',
    denomination: 50,
    cardForm: 'E-Code',
    speed: 'Fast',
    formattedSKU: 'Apple / US / USD / $50 / E-Code / Fast'
  },
  {
    id: 'SKU-STM-GLB-USD-ECODE-FAST-100',
    brand: 'Steam',
    country: 'Global',
    currency: 'USD',
    denomination: 100,
    cardForm: 'E-Code',
    speed: 'Fast',
    formattedSKU: 'Steam / Global / USD / $100 / E-Code / Fast'
  },
  {
    id: 'SKU-STM-GLB-USD-ECODE-STD-50',
    brand: 'Steam',
    country: 'Global',
    currency: 'USD',
    denomination: 50,
    cardForm: 'E-Code',
    speed: 'Standard',
    formattedSKU: 'Steam / Global / USD / $50 / E-Code / Standard'
  },
  {
    id: 'SKU-GGL-US-USD-ECODE-FAST-100',
    brand: 'Google Play',
    country: 'US',
    currency: 'USD',
    denomination: 100,
    cardForm: 'E-Code',
    speed: 'Fast',
    formattedSKU: 'Google Play / US / USD / $100 / E-Code / Fast'
  },
  {
    id: 'SKU-RAZR-GLB-USD-PIN-FAST-100',
    brand: 'Razer Gold',
    country: 'Global',
    currency: 'USD',
    denomination: 100,
    cardForm: 'Direct-PIN',
    speed: 'Fast',
    formattedSKU: 'Razer Gold / Global / USD / $100 / Direct-PIN / Fast'
  },
  {
    id: 'SKU-SEPH-US-USD-PHYS-STD-200',
    brand: 'Sephora',
    country: 'US',
    currency: 'USD',
    denomination: 200,
    cardForm: 'Physical',
    speed: 'Standard',
    formattedSKU: 'Sephora / US / USD / $200 / Physical / Standard'
  },
  {
    id: 'SKU-VANL-US-USD-PHYS-STD-400',
    brand: 'Vanilla Visa',
    country: 'US',
    currency: 'USD',
    denomination: 400,
    cardForm: 'Physical',
    speed: 'Standard',
    formattedSKU: 'Vanilla Visa / US / USD / $400 / Physical / Standard'
  }
];

// 2. 按SKU【Tab】使用的 SKU 概览数据集
export const MOCK_SKU_QUOTE_OVERVIEWS: SKUQuoteOverview[] = [
  {
    sku: STANDARD_SKUS[0], // Apple / US / USD / $100 / E-Code / Fast
    activeMerchantCount: 6,
    highestQuote: 85.30,
    lowestQuote: 83.10,
    platformTargetPrice: 82.50,
    marketReferencePrice: 84.80,
    bestMarketDiff: 0.50,
    competitiveness: '优势',
    bestMerchant: { id: 'M-1001', name: '招财进宝数卡科技' },
    status: '生效',
    updatedAt: '14:38:12'
  },
  {
    sku: STANDARD_SKUS[1], // Apple / US / USD / $100 / Physical / Standard
    activeMerchantCount: 4,
    highestQuote: 83.20,
    lowestQuote: 80.50,
    platformTargetPrice: 81.00,
    marketReferencePrice: 82.50,
    bestMarketDiff: 0.70,
    competitiveness: '优势',
    bestMerchant: { id: 'M-1002', name: '极客卡业 (美区专线)' },
    status: '生效',
    updatedAt: '14:35:00'
  },
  {
    sku: STANDARD_SKUS[2], // Apple / US / USD / $50 / E-Code / Fast
    activeMerchantCount: 5,
    highestQuote: 84.95,
    lowestQuote: 82.00,
    platformTargetPrice: 82.00,
    marketReferencePrice: 84.50,
    bestMarketDiff: 0.45,
    competitiveness: '正常',
    bestMerchant: { id: 'M-1001', name: '招财进宝数卡科技' },
    status: '生效',
    updatedAt: '14:30:18'
  },
  {
    sku: STANDARD_SKUS[3], // Steam / Global / USD / $100 / E-Code / Fast
    activeMerchantCount: 5,
    highestQuote: 74.50,
    lowestQuote: 70.00,
    platformTargetPrice: 76.00,
    marketReferencePrice: 77.20,
    bestMarketDiff: -2.70,
    competitiveness: '异常',
    bestMerchant: { id: 'M-1004', name: '极速易换点卡商行' },
    status: '生效',
    updatedAt: '14:25:00'
  },
  {
    sku: STANDARD_SKUS[4], // Steam / Global / USD / $50 / E-Code / Standard
    activeMerchantCount: 3,
    highestQuote: 75.80,
    lowestQuote: 73.20,
    platformTargetPrice: 75.00,
    marketReferencePrice: null, // 暂无市场参考！
    bestMarketDiff: null,
    competitiveness: '正常',
    bestMerchant: { id: 'M-1003', name: '顺达环球卡券' },
    status: '生效',
    updatedAt: '14:15:22'
  },
  {
    sku: STANDARD_SKUS[5], // Google Play / US / USD / $100 / E-Code / Fast
    activeMerchantCount: 4,
    highestQuote: 88.50,
    lowestQuote: 85.00,
    platformTargetPrice: 86.00,
    marketReferencePrice: 88.00,
    bestMarketDiff: 0.50,
    competitiveness: '优势',
    bestMerchant: { id: 'M-1005', name: '欧美直通车科技' },
    status: '生效',
    updatedAt: '14:10:05'
  },
  {
    sku: STANDARD_SKUS[6], // Razer Gold / Global / USD / $100 / Direct-PIN / Fast
    activeMerchantCount: 2,
    highestQuote: 90.20,
    lowestQuote: 88.00,
    platformTargetPrice: 89.00,
    marketReferencePrice: null, // 暂无市场参考！
    bestMarketDiff: null,
    competitiveness: '关注',
    bestMerchant: { id: 'M-1001', name: '招财进宝数卡科技' },
    status: '生效',
    updatedAt: '13:58:10'
  },
  {
    sku: STANDARD_SKUS[7], // Sephora / US / USD / $200 / Physical / Standard
    activeMerchantCount: 3,
    highestQuote: 78.75,
    lowestQuote: 75.00,
    platformTargetPrice: 80.00,
    marketReferencePrice: 81.00,
    bestMarketDiff: -2.25,
    competitiveness: '关注',
    bestMerchant: { id: 'M-1002', name: '极客卡业 (美区专线)' },
    status: '生效',
    updatedAt: '13:45:00'
  },
  {
    sku: STANDARD_SKUS[8], // Vanilla Visa / US / USD / $400 / Physical / Standard
    activeMerchantCount: 2,
    highestQuote: 81.00,
    lowestQuote: 79.50,
    platformTargetPrice: 82.00,
    marketReferencePrice: 83.00,
    bestMarketDiff: -2.00,
    competitiveness: '关注',
    bestMerchant: { id: 'M-1004', name: '极速易换点卡商行' },
    status: '生效',
    updatedAt: '13:20:10'
  }
];

// 3. 根据 SKU ID 查询商户报价细节
export const getMerchantQuotesForSKU = (skuId: string): SKUMerchantQuoteDetail[] => {
  if (skuId === 'SKU-APPL-US-USD-ECODE-FAST-100') {
    return [
      {
        merchantId: 'M-1001',
        merchantName: '招财进宝数卡科技 (MID-1001)',
        merchantTier: 'Tier-S',
        currentQuote: 85.30,
        rank: 1,
        bestPriceDiff: 0.00,
        marketPriceDiff: 0.50,
        quoteStatus: '生效',
        acceptanceStatus: '在线',
        acceptanceRate: 98.5,
        successRate: 99.2,
        updatedAt: '14:38:12'
      },
      {
        merchantId: 'M-1002',
        merchantName: '极客卡业 (MID-1002)',
        merchantTier: 'Tier-S',
        currentQuote: 85.10,
        rank: 2,
        bestPriceDiff: -0.20,
        marketPriceDiff: 0.30,
        quoteStatus: '生效',
        acceptanceStatus: '在线',
        acceptanceRate: 97.2,
        successRate: 98.8,
        updatedAt: '14:30:00'
      },
      {
        merchantId: 'M-1003',
        merchantName: '顺达环球卡券 (MID-1003)',
        merchantTier: 'Tier-A',
        currentQuote: 84.80,
        rank: 3,
        bestPriceDiff: -0.50,
        marketPriceDiff: 0.00,
        quoteStatus: '生效',
        acceptanceStatus: '在线',
        acceptanceRate: 95.0,
        successRate: 97.5,
        updatedAt: '14:20:11'
      },
      {
        merchantId: 'M-1005',
        merchantName: '欧美直通车科技 (MID-1005)',
        merchantTier: 'Tier-A',
        currentQuote: 84.20,
        rank: 4,
        bestPriceDiff: -1.10,
        marketPriceDiff: -0.60,
        quoteStatus: '生效',
        acceptanceStatus: '在线',
        acceptanceRate: 94.1,
        successRate: 96.8,
        updatedAt: '14:05:44'
      },
      {
        merchantId: 'M-1004',
        merchantName: '极速易换点卡商行 (MID-1004)',
        merchantTier: 'Tier-B',
        currentQuote: 83.10,
        rank: 5,
        bestPriceDiff: -2.20,
        marketPriceDiff: -1.70,
        quoteStatus: '生效',
        acceptanceStatus: '限额预警',
        acceptanceRate: 88.0,
        successRate: 92.1,
        updatedAt: '13:50:00'
      }
    ];
  }

  // 默认通用数据
  return [
    {
      merchantId: 'M-1001',
      merchantName: '招财进宝数卡科技 (MID-1001)',
      merchantTier: 'Tier-S',
      currentQuote: 75.80,
      rank: 1,
      bestPriceDiff: 0.00,
      marketPriceDiff: -1.40,
      quoteStatus: '生效',
      acceptanceStatus: '在线',
      acceptanceRate: 96.0,
      successRate: 98.0,
      updatedAt: '14:15:00'
    },
    {
      merchantId: 'M-1004',
      merchantName: '极速易换点卡商行 (MID-1004)',
      merchantTier: 'Tier-B',
      currentQuote: 72.00,
      rank: 2,
      bestPriceDiff: -3.80,
      marketPriceDiff: -5.20,
      quoteStatus: '生效',
      acceptanceStatus: '暂停',
      acceptanceRate: 70.0,
      successRate: 85.0,
      updatedAt: '13:30:00'
    }
  ];
};

// 4. 按商户【Tab】商户列表概览
export const MOCK_MERCHANT_QUOTE_OVERVIEWS: MerchantQuoteOverview[] = [
  {
    merchantId: 'M-1001',
    merchantName: '招财进宝数卡科技',
    merchantTier: 'Tier-S',
    totalSKUs: 8,
    activeQuotes: 8,
    advantageSKUs: 5,
    normalSKUs: 2,
    attentionSKUs: 1,
    abnormalSKUs: 0,
    avgMarketDiff: 0.45,
    lastAdjustTime: '14:38:12',
    status: '正常'
  },
  {
    merchantId: 'M-1002',
    merchantName: '极客卡业 (美区专线)',
    merchantTier: 'Tier-S',
    totalSKUs: 7,
    activeQuotes: 7,
    advantageSKUs: 4,
    normalSKUs: 2,
    attentionSKUs: 1,
    abnormalSKUs: 0,
    avgMarketDiff: 0.30,
    lastAdjustTime: '14:35:00',
    status: '正常'
  },
  {
    merchantId: 'M-1003',
    merchantName: '顺达环球卡券',
    merchantTier: 'Tier-A',
    totalSKUs: 6,
    activeQuotes: 6,
    advantageSKUs: 2,
    normalSKUs: 3,
    attentionSKUs: 1,
    abnormalSKUs: 0,
    avgMarketDiff: 0.10,
    lastAdjustTime: '14:20:11',
    status: '正常'
  },
  {
    merchantId: 'M-1004',
    merchantName: '极速易换点卡商行',
    merchantTier: 'Tier-B',
    totalSKUs: 6,
    activeQuotes: 5,
    advantageSKUs: 1,
    normalSKUs: 1,
    attentionSKUs: 1,
    abnormalSKUs: 3, // 异常 SKU 较多！
    avgMarketDiff: -2.15,
    lastAdjustTime: '14:25:00',
    status: '授信预警'
  },
  {
    merchantId: 'M-1005',
    merchantName: '欧美直通车科技',
    merchantTier: 'Tier-A',
    totalSKUs: 5,
    activeQuotes: 5,
    advantageSKUs: 3,
    normalSKUs: 1,
    attentionSKUs: 1,
    abnormalSKUs: 0,
    avgMarketDiff: 0.25,
    lastAdjustTime: '14:10:05',
    status: '正常'
  }
];

// 5. 根据商户 ID 查询其全量 SKU 矩阵
export const getSKUMatrixForMerchant = (merchantId: string): MerchantSKUQuoteMatrixItem[] => {
  if (merchantId === 'M-1004') {
    return [
      {
        sku: STANDARD_SKUS[0], // Apple US $100
        currentQuote: 83.10,
        competitiveness: '关注',
        marketReferencePrice: 84.80,
        diffToMarket: -1.70,
        status: '生效',
        updatedAt: '13:50:00'
      },
      {
        sku: STANDARD_SKUS[3], // Steam Global $100
        currentQuote: 70.00,
        competitiveness: '异常',
        marketReferencePrice: 77.20,
        diffToMarket: -7.20,
        status: '生效',
        updatedAt: '14:25:00'
      },
      {
        sku: STANDARD_SKUS[7], // Sephora US $200
        currentQuote: 75.00,
        competitiveness: '异常',
        marketReferencePrice: 81.00,
        diffToMarket: -6.00,
        status: '生效',
        updatedAt: '13:45:00'
      },
      {
        sku: STANDARD_SKUS[8], // Vanilla Visa US $400
        currentQuote: 79.50,
        competitiveness: '异常',
        marketReferencePrice: 83.00,
        diffToMarket: -3.50,
        status: '生效',
        updatedAt: '13:20:10'
      },
      {
        sku: STANDARD_SKUS[2], // Apple US $50
        currentQuote: 82.00,
        competitiveness: '正常',
        marketReferencePrice: 84.50,
        diffToMarket: -2.50,
        status: '生效',
        updatedAt: '12:10:00'
      }
    ];
  }

  // 默认 M-1001 招财进宝
  return [
    {
      sku: STANDARD_SKUS[0], // Apple US $100 ECode Fast
      currentQuote: 85.30,
      competitiveness: '优势',
      marketReferencePrice: 84.80,
      diffToMarket: 0.50,
      status: '生效',
      updatedAt: '14:38:12'
    },
    {
      sku: STANDARD_SKUS[2], // Apple US $50 ECode Fast
      currentQuote: 84.95,
      competitiveness: '正常',
      marketReferencePrice: 84.50,
      diffToMarket: 0.45,
      status: '生效',
      updatedAt: '14:30:18'
    },
    {
      sku: STANDARD_SKUS[5], // Google Play US $100
      currentQuote: 88.00,
      competitiveness: '优势',
      marketReferencePrice: 88.00,
      diffToMarket: 0.00,
      status: '生效',
      updatedAt: '14:10:00'
    },
    {
      sku: STANDARD_SKUS[6], // Razer Gold Global $100
      currentQuote: 90.20,
      competitiveness: '关注',
      marketReferencePrice: null, // 暂无市场参考
      diffToMarket: null,
      status: '生效',
      updatedAt: '13:58:10'
    }
  ];
};

// 6. 11.3.5 调价记录数据集 (PriceChangeRecordItem)
export const MOCK_PRICE_CHANGE_RECORDS: PriceChangeRecordItem[] = [
  {
    changeId: 'CHG-20261005-081',
    merchantId: 'M-1001',
    merchantName: '招财进宝数卡科技',
    sku: STANDARD_SKUS[0], // Apple US $100 ECode Fast
    oldQuote: 85.10,
    newQuote: 85.30,
    diff: 0.20,
    adjustSource: '商户自发',
    operator: '商户操作员 (MID-1001-OP)',
    adjustedAt: '14:38:12',
    effectiveStatus: '已生效'
  },
  {
    changeId: 'CHG-20261005-078',
    merchantId: 'M-1004',
    merchantName: '极速易换点卡商行',
    sku: STANDARD_SKUS[3], // Steam Global $100
    oldQuote: 72.50,
    newQuote: 70.00,
    diff: -2.50,
    adjustSource: '系统策略',
    operator: '报价风控巡检机器人',
    adjustedAt: '14:25:00',
    effectiveStatus: '已生效'
  },
  {
    changeId: 'CHG-20261005-065',
    merchantId: 'M-1002',
    merchantName: '极客卡业 (美区专线)',
    sku: STANDARD_SKUS[1], // Apple US $100 Physical
    oldQuote: 82.50,
    newQuote: 83.20,
    diff: 0.70,
    adjustSource: '运营应急干预',
    operator: '平台运营 (OP-8812)',
    adjustedAt: '14:18:30',
    effectiveStatus: '已生效'
  },
  {
    changeId: 'CHG-20261005-052',
    merchantId: 'M-1005',
    merchantName: '欧美直通车科技',
    sku: STANDARD_SKUS[5], // Google Play US $100
    oldQuote: 87.80,
    newQuote: 88.50,
    diff: 0.70,
    adjustSource: '机器人推导',
    operator: 'AI 报价撮合引擎',
    adjustedAt: '14:10:05',
    effectiveStatus: '已生效'
  },
  {
    changeId: 'CHG-20261005-041',
    merchantId: 'M-1003',
    merchantName: '顺达环球卡券',
    sku: STANDARD_SKUS[4], // Steam Global $50
    oldQuote: 75.00,
    newQuote: 75.80,
    diff: 0.80,
    adjustSource: '商户自发',
    operator: '商户主管 (MID-1003-ADMIN)',
    adjustedAt: '13:55:00',
    effectiveStatus: '已生效'
  }
];

// 报价管理数据集 (包含 8 必选字段)
export const INITIAL_QUOTES: QuoteItem[] = [
  {
    id: 'QT-001',
    sku: STANDARD_SKUS[0], // Apple / US / USD / E-Code / $100
    merchantId: 'M-101',
    merchantName: '招财进宝数卡',
    merchantTier: 'Tier-S',
    marketReferencePrice: 92.5,
    operatingStandard: 91.8,
    merchantQuote: 92.2,
    priceDiffPp: 0.4,
    availablePoints: 480000,
    acceptanceStatus: '正常接单',
    competitivenessStatus: '强竞争力',
    lastUpdatedAt: '14:35:12',
    isProblematic: false
  },
  {
    id: 'QT-002',
    sku: STANDARD_SKUS[0], // Apple / US / USD / E-Code / $100
    merchantId: 'M-102',
    merchantName: '鼎盛数字科技',
    merchantTier: 'Tier-A',
    marketReferencePrice: 92.5,
    operatingStandard: 91.8,
    merchantQuote: 90.8,
    priceDiffPp: -1.0,
    availablePoints: 120000,
    acceptanceStatus: '限额预警',
    competitivenessStatus: '严重倒挂',
    lastUpdatedAt: '14:10:02',
    isProblematic: true
  },
  {
    id: 'QT-003',
    sku: STANDARD_SKUS[0], // Apple / US / USD / E-Code / $100
    merchantId: 'M-103',
    merchantName: '万丰国际卡行',
    merchantTier: 'Tier-S',
    marketReferencePrice: 92.5,
    operatingStandard: 91.8,
    merchantQuote: 91.9,
    priceDiffPp: 0.1,
    availablePoints: 310000,
    acceptanceStatus: '正常接单',
    competitivenessStatus: '达标基准',
    lastUpdatedAt: '14:28:40',
    isProblematic: false
  },
  {
    id: 'QT-004',
    sku: STANDARD_SKUS[0], // Apple / US / USD / E-Code / $100
    merchantId: 'M-104',
    merchantName: '极速易换点卡',
    merchantTier: 'Tier-B',
    marketReferencePrice: 92.5,
    operatingStandard: 91.8,
    merchantQuote: 90.5,
    priceDiffPp: -1.3,
    availablePoints: 45000,
    acceptanceStatus: '限额预警',
    competitivenessStatus: '严重倒挂',
    lastUpdatedAt: '13:50:18',
    isProblematic: true
  },
  {
    id: 'QT-005',
    sku: STANDARD_SKUS[0], // Apple / US / USD / E-Code / $100
    merchantId: 'M-105',
    merchantName: '环球数卡直通',
    merchantTier: 'Tier-A',
    marketReferencePrice: 92.5,
    operatingStandard: 91.8,
    merchantQuote: 91.4,
    priceDiffPp: -0.4,
    availablePoints: 185000,
    acceptanceStatus: '正常接单',
    competitivenessStatus: '边缘偏弱',
    lastUpdatedAt: '14:20:00',
    isProblematic: false
  },
  // Steam / Global / USD / E-Code / $100
  {
    id: 'QT-006',
    sku: STANDARD_SKUS[3],
    merchantId: 'M-101',
    merchantName: '招财进宝数卡',
    merchantTier: 'Tier-S',
    marketReferencePrice: 89.0,
    operatingStandard: 88.2,
    merchantQuote: 88.5,
    priceDiffPp: 0.3,
    availablePoints: 480000,
    acceptanceStatus: '正常接单',
    competitivenessStatus: '强竞争力',
    lastUpdatedAt: '14:32:05',
    isProblematic: false
  },
  {
    id: 'QT-007',
    sku: STANDARD_SKUS[3],
    merchantId: 'M-102',
    merchantName: '鼎盛数字科技',
    merchantTier: 'Tier-A',
    marketReferencePrice: 89.0,
    operatingStandard: 88.2,
    merchantQuote: 86.8,
    priceDiffPp: -1.4,
    availablePoints: 85000,
    acceptanceStatus: '暂停承接',
    competitivenessStatus: '严重倒挂',
    lastUpdatedAt: '13:42:10',
    isProblematic: true
  },
  {
    id: 'QT-008',
    sku: STANDARD_SKUS[3],
    merchantId: 'M-103',
    merchantName: '万丰国际卡行',
    merchantTier: 'Tier-S',
    marketReferencePrice: 89.0,
    operatingStandard: 88.2,
    merchantQuote: 88.3,
    priceDiffPp: 0.1,
    availablePoints: 310000,
    acceptanceStatus: '正常接单',
    competitivenessStatus: '达标基准',
    lastUpdatedAt: '14:22:15',
    isProblematic: false
  },
  // Google Play / US / USD / E-Code / $100
  {
    id: 'QT-009',
    sku: STANDARD_SKUS[5],
    merchantId: 'M-104',
    merchantName: '极速易换点卡',
    merchantTier: 'Tier-B',
    marketReferencePrice: 88.2,
    operatingStandard: 87.5,
    merchantQuote: 86.6,
    priceDiffPp: -0.9,
    availablePoints: 45000,
    acceptanceStatus: '限额预警',
    competitivenessStatus: '严重倒挂',
    lastUpdatedAt: '14:15:30',
    isProblematic: true
  },
  {
    id: 'QT-010',
    sku: STANDARD_SKUS[5],
    merchantId: 'M-101',
    merchantName: '招财进宝数卡',
    merchantTier: 'Tier-S',
    marketReferencePrice: 88.2,
    operatingStandard: 87.5,
    merchantQuote: 87.8,
    priceDiffPp: 0.3,
    availablePoints: 480000,
    acceptanceStatus: '正常接单',
    competitivenessStatus: '强竞争力',
    lastUpdatedAt: '14:36:00',
    isProblematic: false
  },
  // Razer Gold / Global / USD / Direct-PIN / $100
  {
    id: 'QT-011',
    sku: STANDARD_SKUS[6],
    merchantId: 'M-105',
    merchantName: '环球数卡直通',
    merchantTier: 'Tier-A',
    marketReferencePrice: 85.5,
    operatingStandard: 84.8,
    merchantQuote: 85.0,
    priceDiffPp: 0.2,
    availablePoints: 185000,
    acceptanceStatus: '正常接单',
    competitivenessStatus: '达标基准',
    lastUpdatedAt: '14:18:22',
    isProblematic: false
  },
  {
    id: 'QT-012',
    sku: STANDARD_SKUS[6],
    merchantId: 'M-102',
    merchantName: '鼎盛数字科技',
    merchantTier: 'Tier-A',
    marketReferencePrice: 85.5,
    operatingStandard: 84.8,
    merchantQuote: 83.8,
    priceDiffPp: -1.0,
    availablePoints: 32000,
    acceptanceStatus: '限额预警',
    competitivenessStatus: '严重倒挂',
    lastUpdatedAt: '13:55:00',
    isProblematic: true
  },
  // Vanilla Visa / US / USD / Physical / $400
  {
    id: 'QT-013',
    sku: STANDARD_SKUS[7],
    merchantId: 'M-103',
    merchantName: '万丰国际卡行',
    merchantTier: 'Tier-S',
    marketReferencePrice: 91.0,
    operatingStandard: 90.2,
    merchantQuote: 90.6,
    priceDiffPp: 0.4,
    availablePoints: 310000,
    acceptanceStatus: '正常接单',
    competitivenessStatus: '强竞争力',
    lastUpdatedAt: '14:30:10',
    isProblematic: false
  },
  {
    id: 'QT-014',
    sku: STANDARD_SKUS[7],
    merchantId: 'M-104',
    merchantName: '极速易换点卡',
    merchantTier: 'Tier-B',
    marketReferencePrice: 91.0,
    operatingStandard: 90.2,
    merchantQuote: 89.2,
    priceDiffPp: -1.0,
    availablePoints: 21000,
    acceptanceStatus: '暂停承接',
    competitivenessStatus: '严重倒挂',
    lastUpdatedAt: '13:30:45',
    isProblematic: true
  }
];

// 报价监控 22.1 数据来源采集记录
export const INITIAL_RAW_SOURCES: MarketRawSourceItem[] = [
  {
    id: 'RAW-001',
    source: 'Paxful Official API',
    rawProduct: 'Apple Store & iTunes Gift Card USD (Digital / Code)',
    rawQuote: 92.8,
    standardSkuCode: 'Apple / US / USD / E-Code / $100',
    isMapped: true,
    collectedAt: '14:38:15',
    validUntil: '14:43:15',
    validitySeconds: 280,
    confidenceScore: 98,
    status: '有效',
    reliabilityWeight: 0.95,
    isOutlier: false
  },
  {
    id: 'RAW-002',
    source: 'Noones B2B Gateway',
    rawProduct: 'Apple Gift Cards US E-code 100USD Instant Settlement',
    rawQuote: 92.4,
    standardSkuCode: 'Apple / US / USD / E-Code / $100',
    isMapped: true,
    collectedAt: '14:37:50',
    validUntil: '14:42:50',
    validitySeconds: 255,
    confidenceScore: 96,
    status: '有效',
    reliabilityWeight: 0.9,
    isOutlier: false
  },
  {
    id: 'RAW-003',
    source: 'Cardtonic OTC Partner',
    rawProduct: 'USA Apple eCode $100 fast pay',
    rawQuote: 92.6,
    standardSkuCode: 'Apple / US / USD / E-Code / $100',
    isMapped: true,
    collectedAt: '14:36:20',
    validUntil: '14:41:20',
    validitySeconds: 165,
    confidenceScore: 94,
    status: '有效',
    reliabilityWeight: 0.85,
    isOutlier: false
  },
  {
    id: 'RAW-004',
    source: 'CoinCola Global OTC',
    rawProduct: 'Apple Gift Card US $100 Code [High Risk Inverted]',
    rawQuote: 96.5, // 离群异常值，模拟被 3-Sigma/IQR 过滤
    standardSkuCode: 'Apple / US / USD / E-Code / $100',
    isMapped: true,
    collectedAt: '14:38:00',
    validUntil: '14:43:00',
    validitySeconds: 265,
    confidenceScore: 42,
    status: '异常剔除',
    reliabilityWeight: 0.3,
    isOutlier: true
  },
  {
    id: 'RAW-005',
    source: 'Tbay Merchant Pro',
    rawProduct: 'Steam Wallet Global USD Digital $100',
    rawQuote: 89.2,
    standardSkuCode: 'Steam / Global / USD / E-Code / $100',
    isMapped: true,
    collectedAt: '14:37:10',
    validUntil: '14:42:10',
    validitySeconds: 215,
    confidenceScore: 97,
    status: '有效',
    reliabilityWeight: 0.92,
    isOutlier: false
  },
  {
    id: 'RAW-006',
    source: 'Paxful Official API',
    rawProduct: 'Steam USD Worldwide Online Key $100',
    rawQuote: 88.8,
    standardSkuCode: 'Steam / Global / USD / E-Code / $100',
    isMapped: true,
    collectedAt: '14:36:45',
    validUntil: '14:41:45',
    validitySeconds: 190,
    confidenceScore: 95,
    status: '有效',
    reliabilityWeight: 0.95,
    isOutlier: false
  },
  {
    id: 'RAW-007',
    source: 'Noones B2B Gateway',
    rawProduct: 'Google Play Gift Card USA Digital 100 USD',
    rawQuote: 88.4,
    standardSkuCode: 'Google Play / US / USD / E-Code / $100',
    isMapped: true,
    collectedAt: '14:37:30',
    validUntil: '14:42:30',
    validitySeconds: 235,
    confidenceScore: 95,
    status: '有效',
    reliabilityWeight: 0.9,
    isOutlier: false
  },
  {
    id: 'RAW-008',
    source: 'GiftcardGranny Feed',
    rawProduct: 'Razer Gold Global PIN 100 USD (Authorized)',
    rawQuote: 85.6,
    standardSkuCode: 'Razer Gold / Global / USD / Direct-PIN / $100',
    isMapped: true,
    collectedAt: '14:35:10',
    validUntil: '14:40:10',
    validitySeconds: 95,
    confidenceScore: 92,
    status: '有效',
    reliabilityWeight: 0.88,
    isOutlier: false
  },
  {
    id: 'RAW-009',
    source: 'CardPool Partner Feed',
    rawProduct: 'Vanilla Visa Prepaid 4943 Debit USD $400',
    rawQuote: 91.2,
    standardSkuCode: 'Vanilla Visa / US / USD / Physical / $400',
    isMapped: true,
    collectedAt: '14:38:05',
    validUntil: '14:43:05',
    validitySeconds: 270,
    confidenceScore: 93,
    status: '有效',
    reliabilityWeight: 0.85,
    isOutlier: false
  },
  {
    id: 'RAW-010',
    source: 'Unmapped Partner Stream',
    rawProduct: 'Amazon US Gift Card Promo E-Voucher $250 (New Format)',
    rawQuote: 90.0,
    standardSkuCode: '未映射',
    isMapped: false,
    collectedAt: '14:38:20',
    validUntil: '14:43:20',
    validitySeconds: 285,
    confidenceScore: 78,
    status: '即将失效',
    reliabilityWeight: 0.7,
    isOutlier: false
  }
];

// 报价竞争力计算推导核心参数示例
export const DEFAULT_PRICING_ENGINE: PricingEngineParams = {
  marketReferencePrice: 92.5, // 市场参考价 (经过多源加权与异常值过滤)
  targetUserQuote: 88.0, // 用户目标报价 (让利吸引出卡人)
  platformMarginRate: 3.2, // 平台毛利要求 (净收益标准)
  exchangeRateRiskCost: 0.5, // 汇率及过桥波动准备金
  riskCostBadCardRate: 0.4, // 坏卡拦截与售后兜底风险成本
  derivedMerchantStandard: 91.8 // 商户运营标准底线 = 92.5 - 0.7 (综合成本与竞争区间)
};

// 报价异常规则配置参数
export const DEFAULT_ANOMALY_RULES: AnomalyRuleConfig = {
  diffThresholdPp: 0.8, // 价差阈值 > 0.8 pp 视为偏弱异常
  minAnomalyMerchants: 2, // 异常商户数 ≥ 2 家视为聚合异常
  anomalyRatioThreshold: 30, // 异常比例 > 30% 升级为平台级
  durationThresholdMinutes: 15, // 持续超过 15 分钟触发催办
  marketValiditySeconds: 300 // 行情有效期 300 秒
};

// 报价异常工单列表 (含 平台级异常 与 商户级异常, 以及 6 步流转状态)
export const INITIAL_ANOMALIES: QuoteAnomalyTicket[] = [
  {
    id: 'ANO-20261005-001',
    severity: '平台级异常', // 优先级更高！多个商户同时无优势，存在平台整体丢单风险
    standardSku: STANDARD_SKUS[0], // Apple / US / USD / E-Code / $100
    marketReferencePrice: 92.5,
    operatingStandard: 91.8,
    problematicMerchants: [
      {
        merchantId: 'M-102',
        merchantName: '鼎盛数字科技',
        currentQuote: 90.8,
        diffPp: -1.0,
        points: 120000,
        remindedAt: '14:12:00'
      },
      {
        merchantId: 'M-104',
        merchantName: '极速易换点卡',
        currentQuote: 90.5,
        diffPp: -1.3,
        points: 45000,
        remindedAt: '14:15:00'
      }
    ],
    totalMerchantsCount: 5,
    anomalyRatio: 40.0, // 40% 商户处于倒挂
    durationMinutes: 28,
    status: '待调整', // 待处理 → 已提醒 → 待调整 → 已调整 → 待复核 → 已恢复
    createdAt: '14:10:00',
    updatedAt: '14:25:30',
    auditLogs: [
      { time: '14:10:00', operator: '机器人重新比价引擎', action: '发现异常', remark: '检出 2 家商户价差超过 -0.8pp 阈值，异常比例 40%，自动触发【平台级异常】工单' },
      { time: '14:12:30', operator: '系统自动圈出问题商户', action: '圈出商户', remark: '圈出【鼎盛数字科技】与【极速易换点卡】' },
      { time: '14:15:00', operator: '运营主管 (张伟)', action: '联系商户/催价', remark: '已下发企微工单提醒并电话督办商户在收卡业务端提价' }
    ]
  },
  {
    id: 'ANO-20261005-002',
    severity: '平台级异常',
    standardSku: STANDARD_SKUS[3], // Steam / Global / USD / E-Code / $100
    marketReferencePrice: 89.0,
    operatingStandard: 88.2,
    problematicMerchants: [
      {
        merchantId: 'M-102',
        merchantName: '鼎盛数字科技',
        currentQuote: 86.8,
        diffPp: -1.4,
        points: 85000,
        remindedAt: '13:50:00'
      }
    ],
    totalMerchantsCount: 3,
    anomalyRatio: 33.3,
    durationMinutes: 48,
    status: '已提醒',
    createdAt: '13:48:00',
    updatedAt: '14:00:15',
    auditLogs: [
      { time: '13:48:00', operator: '机器人重新比价引擎', action: '发现异常', remark: '鼎盛数字科技挂牌价 86.8% 严重低于底线 88.2%' },
      { time: '13:50:00', operator: '客服专员 (王晨)', action: '已提醒', remark: '已向商户下发收卡端强提醒' }
    ]
  },
  {
    id: 'ANO-20261005-003',
    severity: '商户级异常', // 个别商户价格弱
    standardSku: STANDARD_SKUS[5], // Google Play / US / USD / E-Code / $100
    marketReferencePrice: 88.2,
    operatingStandard: 87.5,
    problematicMerchants: [
      {
        merchantId: 'M-104',
        merchantName: '极速易换点卡',
        currentQuote: 86.6,
        diffPp: -0.9,
        points: 45000
      }
    ],
    totalMerchantsCount: 4,
    anomalyRatio: 25.0,
    durationMinutes: 12,
    status: '待处理',
    createdAt: '14:26:00',
    updatedAt: '14:26:00',
    auditLogs: [
      { time: '14:26:00', operator: '机器人重新比价引擎', action: '发现异常', remark: '极速易换点卡该卡种承接点差落后其他签约商户 0.9pp' }
    ]
  },
  {
    id: 'ANO-20261005-004',
    severity: '商户级异常',
    standardSku: STANDARD_SKUS[7], // Vanilla Visa / US / USD / Physical / $400
    marketReferencePrice: 91.0,
    operatingStandard: 90.2,
    problematicMerchants: [
      {
        merchantId: 'M-104',
        merchantName: '极速易换点卡',
        currentQuote: 89.2,
        diffPp: -1.0,
        points: 21000,
        adjustedQuote: 90.4
      }
    ],
    totalMerchantsCount: 3,
    anomalyRatio: 33.3,
    durationMinutes: 35,
    status: '待复核', // 已在收卡端调价，机器人等待重新比价核销
    createdAt: '14:02:00',
    updatedAt: '14:32:00',
    auditLogs: [
      { time: '14:02:00', operator: '机器人重新比价引擎', action: '发现异常', remark: '商户价格偏弱触发异常' },
      { time: '14:10:00', operator: '客服 (赵倩)', action: '已提醒', remark: '督促商户及时补单调价' },
      { time: '14:30:00', operator: '商户端对接回执', action: '已调整', remark: '商户已在收卡业务端调整为 90.4%' }
    ]
  },
  {
    id: 'ANO-20261005-005',
    severity: '商户级异常',
    standardSku: STANDARD_SKUS[6], // Razer Gold / Global / USD / Direct-PIN / $100
    marketReferencePrice: 85.5,
    operatingStandard: 84.8,
    problematicMerchants: [
      {
        merchantId: 'M-102',
        merchantName: '鼎盛数字科技',
        currentQuote: 83.8,
        diffPp: -1.0,
        points: 32000,
        adjustedQuote: 85.0
      }
    ],
    totalMerchantsCount: 3,
    anomalyRatio: 33.3,
    durationMinutes: 52,
    status: '已恢复', // 已完成闭环
    createdAt: '13:30:00',
    updatedAt: '14:22:00',
    closedAt: '14:22:00',
    auditLogs: [
      { time: '13:30:00', operator: '机器人重新比价引擎', action: '发现异常', remark: '报价低于标准' },
      { time: '13:40:00', operator: '运营 (李强)', action: '已提醒', remark: '下发催单' },
      { time: '14:15:00', operator: '商户收卡业务端', action: '已调整', remark: '提价至 85.0%' },
      { time: '14:20:00', operator: '机器人重新比价引擎', action: '复核达标', remark: '最新比价显示价差达标 +0.2pp' },
      { time: '14:22:00', operator: '系统自动闭环', action: '已恢复', remark: '异常自动解除并关闭' }
    ]
  }
];

// 市场行情数据 (按卡种 / 国家 / SKU 支持当前行情、历史行情、来源对比、趋势)
export const INITIAL_MARKET_TRENDS: Record<string, MarketTrendSKUData> = {
  'SKU-APPL-US-USD-ECODE-100': {
    sku: STANDARD_SKUS[0],
    currentReferencePrice: 92.5,
    highestSource: { source: 'Paxful Official API', rate: 92.8 },
    lowestSource: { source: 'Noones B2B Gateway', rate: 92.4 },
    averageRate: 92.6,
    volatility24h: 0.42,
    sourcesBreakdown: [
      { sourceName: 'Paxful Official API', rate: 92.8, confidence: 98, latencyMs: 140, updatedAt: '14:38:15' },
      { sourceName: 'Noones B2B Gateway', rate: 92.4, confidence: 96, latencyMs: 185, updatedAt: '14:37:50' },
      { sourceName: 'Cardtonic OTC Partner', rate: 92.6, confidence: 94, latencyMs: 230, updatedAt: '14:36:20' },
      { sourceName: 'Tbay Merchant Feed', rate: 92.5, confidence: 91, latencyMs: 310, updatedAt: '14:35:40' }
    ],
    historyTimeline: [
      { timeStr: '10:00', referencePrice: 92.1, marketHigh: 92.4, marketLow: 91.9, platformStandard: 91.4 },
      { timeStr: '11:00', referencePrice: 92.2, marketHigh: 92.5, marketLow: 92.0, platformStandard: 91.5 },
      { timeStr: '12:00', referencePrice: 92.3, marketHigh: 92.7, marketLow: 92.1, platformStandard: 91.6 },
      { timeStr: '13:00', referencePrice: 92.4, marketHigh: 92.8, marketLow: 92.2, platformStandard: 91.7 },
      { timeStr: '14:00', referencePrice: 92.5, marketHigh: 92.8, marketLow: 92.4, platformStandard: 91.8 }
    ]
  },
  'SKU-STM-GLB-USD-ECODE-100': {
    sku: STANDARD_SKUS[3],
    currentReferencePrice: 89.0,
    highestSource: { source: 'Tbay Merchant Pro', rate: 89.2 },
    lowestSource: { source: 'Paxful Official API', rate: 88.8 },
    averageRate: 89.0,
    volatility24h: 0.65,
    sourcesBreakdown: [
      { sourceName: 'Tbay Merchant Pro', rate: 89.2, confidence: 97, latencyMs: 120, updatedAt: '14:37:10' },
      { sourceName: 'Paxful Official API', rate: 88.8, confidence: 95, latencyMs: 155, updatedAt: '14:36:45' },
      { sourceName: 'CoinCola B2B API', rate: 89.1, confidence: 93, latencyMs: 210, updatedAt: '14:36:00' }
    ],
    historyTimeline: [
      { timeStr: '10:00', referencePrice: 88.4, marketHigh: 88.7, marketLow: 88.1, platformStandard: 87.6 },
      { timeStr: '11:00', referencePrice: 88.6, marketHigh: 88.9, marketLow: 88.3, platformStandard: 87.8 },
      { timeStr: '12:00', referencePrice: 88.8, marketHigh: 89.0, marketLow: 88.5, platformStandard: 88.0 },
      { timeStr: '13:00', referencePrice: 88.9, marketHigh: 89.1, marketLow: 88.6, platformStandard: 88.1 },
      { timeStr: '14:00', referencePrice: 89.0, marketHigh: 89.2, marketLow: 88.8, platformStandard: 88.2 }
    ]
  },
  'SKU-GGL-US-USD-ECODE-100': {
    sku: STANDARD_SKUS[5],
    currentReferencePrice: 88.2,
    highestSource: { source: 'Noones B2B Gateway', rate: 88.4 },
    lowestSource: { source: 'Paxful Official API', rate: 88.0 },
    averageRate: 88.2,
    volatility24h: 0.38,
    sourcesBreakdown: [
      { sourceName: 'Noones B2B Gateway', rate: 88.4, confidence: 95, latencyMs: 160, updatedAt: '14:37:30' },
      { sourceName: 'Paxful Official API', rate: 88.0, confidence: 94, latencyMs: 180, updatedAt: '14:35:10' }
    ],
    historyTimeline: [
      { timeStr: '10:00', referencePrice: 88.0, marketHigh: 88.2, marketLow: 87.7, platformStandard: 87.3 },
      { timeStr: '11:00', referencePrice: 88.1, marketHigh: 88.3, marketLow: 87.9, platformStandard: 87.4 },
      { timeStr: '12:00', referencePrice: 88.1, marketHigh: 88.3, marketLow: 87.9, platformStandard: 87.4 },
      { timeStr: '13:00', referencePrice: 88.2, marketHigh: 88.4, marketLow: 88.0, platformStandard: 87.5 },
      { timeStr: '14:00', referencePrice: 88.2, marketHigh: 88.4, marketLow: 88.0, platformStandard: 87.5 }
    ]
  }
};

// 调价记录数据集 (包含 8 必选字段，并用于判断哪些商户长期需要人工催价)
export const INITIAL_ADJUST_RECORDS: PriceAdjustRecord[] = [
  {
    id: 'ADJ-REC-001',
    recordNo: 'QADJ-88910',
    merchantId: 'M-102',
    merchantName: '鼎盛数字科技',
    merchantTier: 'Tier-A',
    sku: STANDARD_SKUS[0], // Apple / US / USD / E-Code / $100
    oldQuote: 90.8,
    newQuote: 92.0,
    diffPp: 1.2,
    adjustedAt: '2026-10-05 14:18:20',
    associatedAnomalyId: 'ANO-20261005-001',
    postAdjustmentCompetitiveness: '达标基准',
    recoveredAt: '14:20:10',
    responseTimeMinutes: 38,
    isManualReminded: true, // 长期需人工催价商户！
    reminderCount: 3
  },
  {
    id: 'ADJ-REC-002',
    recordNo: 'QADJ-88909',
    merchantId: 'M-104',
    merchantName: '极速易换点卡',
    merchantTier: 'Tier-B',
    sku: STANDARD_SKUS[7], // Vanilla Visa / US / USD / Physical / $400
    oldQuote: 89.2,
    newQuote: 90.4,
    diffPp: 1.2,
    adjustedAt: '2026-10-05 14:12:00',
    associatedAnomalyId: 'ANO-20261005-004',
    postAdjustmentCompetitiveness: '强竞争力',
    recoveredAt: '14:14:00',
    responseTimeMinutes: 45,
    isManualReminded: true, // 长期需人工催价商户！
    reminderCount: 4
  },
  {
    id: 'ADJ-REC-003',
    recordNo: 'QADJ-88908',
    merchantId: 'M-101',
    merchantName: '招财进宝数卡',
    merchantTier: 'Tier-S',
    sku: STANDARD_SKUS[0], // Apple / US / USD / E-Code / $100
    oldQuote: 91.8,
    newQuote: 92.2,
    diffPp: 0.4,
    adjustedAt: '2026-10-05 13:55:00',
    associatedAnomalyId: 'ANO-20261005-001',
    postAdjustmentCompetitiveness: '强竞争力',
    recoveredAt: '13:55:40',
    responseTimeMinutes: 4,
    isManualReminded: false, // 自主响应快，无需催促
    reminderCount: 0
  },
  {
    id: 'ADJ-REC-004',
    recordNo: 'QADJ-88907',
    merchantId: 'M-102',
    merchantName: '鼎盛数字科技',
    merchantTier: 'Tier-A',
    sku: STANDARD_SKUS[6], // Razer Gold / Global / USD / Direct-PIN / $100
    oldQuote: 83.8,
    newQuote: 85.0,
    diffPp: 1.2,
    adjustedAt: '2026-10-05 14:15:00',
    associatedAnomalyId: 'ANO-20261005-005',
    postAdjustmentCompetitiveness: '达标基准',
    recoveredAt: '14:22:00',
    responseTimeMinutes: 35,
    isManualReminded: true, // 长期需人工催价
    reminderCount: 2
  },
  {
    id: 'ADJ-REC-005',
    recordNo: 'QADJ-88906',
    merchantId: 'M-103',
    merchantName: '万丰国际卡行',
    merchantTier: 'Tier-S',
    sku: STANDARD_SKUS[3], // Steam / Global / USD / E-Code / $100
    oldQuote: 88.0,
    newQuote: 88.5,
    diffPp: 0.5,
    adjustedAt: '2026-10-05 12:40:00',
    associatedAnomalyId: '无 (自主跟价)',
    postAdjustmentCompetitiveness: '强竞争力',
    recoveredAt: '12:40:25',
    responseTimeMinutes: 2,
    isManualReminded: false,
    reminderCount: 0
  },
  {
    id: 'ADJ-REC-006',
    recordNo: 'QADJ-88905',
    merchantId: 'M-104',
    merchantName: '极速易换点卡',
    merchantTier: 'Tier-B',
    sku: STANDARD_SKUS[5], // Google Play / US / USD / E-Code / $100
    oldQuote: 86.6,
    newQuote: 87.6,
    diffPp: 1.0,
    adjustedAt: '2026-10-05 11:30:00',
    associatedAnomalyId: 'ANO-20261005-003',
    postAdjustmentCompetitiveness: '达标基准',
    recoveredAt: '11:32:00',
    responseTimeMinutes: 50,
    isManualReminded: true, // 长期需人工催价
    reminderCount: 3
  },
  {
    id: 'ADJ-REC-007',
    recordNo: 'QADJ-88904',
    merchantId: 'M-105',
    merchantName: '环球数卡直通',
    merchantTier: 'Tier-A',
    sku: STANDARD_SKUS[0], // Apple / US / USD / E-Code / $100
    oldQuote: 91.0,
    newQuote: 91.6,
    diffPp: 0.6,
    adjustedAt: '2026-10-05 10:15:00',
    associatedAnomalyId: '无 (响应大盘)',
    postAdjustmentCompetitiveness: '达标基准',
    recoveredAt: '10:15:30',
    responseTimeMinutes: 10,
    isManualReminded: false,
    reminderCount: 0
  }
];

// 11.4.4 数据来源 Feed 状态集合 (PRD 11.4.4)
export interface MarketSourceFeed {
  id: string;
  sourceName: string; // 来源名称
  status: '正常' | '持续抓取' | '重试中' | '源端异常' | '暂停'; // 抓取状态
  coveredBrands: string[]; // 覆盖卡种
  coveredCountries: string[]; // 覆盖国家
  fetchFrequency: string; // 抓取频率
  lastSuccessTime: string; // 最近成功时间
  lastFailureTime: string; // 最近失败时间
  successRate: number; // 成功率 (%)
  latencyMs: number; // 数据延迟 (ms)
}

export const MOCK_MARKET_FEEDS: MarketSourceFeed[] = [
  {
    id: 'SRC-001',
    sourceName: 'Paxful Official Orderbook API',
    status: '持续抓取',
    coveredBrands: ['Apple', 'Steam', 'Google Play', 'Razer Gold'],
    coveredCountries: ['US', 'Global', 'UK'],
    fetchFrequency: '3秒/次',
    lastSuccessTime: '14:38:15',
    lastFailureTime: '无',
    successRate: 99.8,
    latencyMs: 42
  },
  {
    id: 'SRC-002',
    sourceName: 'Noones B2B Gateway Engine',
    status: '持续抓取',
    coveredBrands: ['Apple', 'Steam', 'Sephora', 'Vanilla Visa'],
    coveredCountries: ['US', 'Global', 'CA'],
    fetchFrequency: '5秒/次',
    lastSuccessTime: '14:38:10',
    lastFailureTime: '无',
    successRate: 99.5,
    latencyMs: 85
  },
  {
    id: 'SRC-003',
    sourceName: 'Cardtonic OTC Partner Stream',
    status: '重试中',
    coveredBrands: ['Apple', 'Google Play', 'Amazon'],
    coveredCountries: ['US', 'NG', 'GH'],
    fetchFrequency: '10秒/次',
    lastSuccessTime: '14:37:45',
    lastFailureTime: '14:38:00 (503 Service Unavailable, Auto Retrying...)',
    successRate: 96.2,
    latencyMs: 240
  },
  {
    id: 'SRC-004',
    sourceName: 'Tbay Pro Liquidity Network',
    status: '持续抓取',
    coveredBrands: ['Apple', 'Steam', 'Razer Gold', 'Sephora'],
    coveredCountries: ['US', 'Global', 'JP'],
    fetchFrequency: '5秒/次',
    lastSuccessTime: '14:38:12',
    lastFailureTime: '无',
    successRate: 99.1,
    latencyMs: 110
  },
  {
    id: 'SRC-005',
    sourceName: 'CoinCola OTC Market Feed',
    status: '源端异常',
    coveredBrands: ['Steam', 'Vanilla Visa'],
    coveredCountries: ['Global', 'US'],
    fetchFrequency: '15秒/次',
    lastSuccessTime: '13:45:00',
    lastFailureTime: '14:35:12 (Connection Timeout, Triggered Alert)',
    successRate: 88.5,
    latencyMs: 850
  }
];

// 11.5 报价监控核心 Quote Problem 数据集 (PRD 11.5)
export const MOCK_QUOTE_PROBLEMS: import('./quoteTypes').QuoteProblemItem[] = [
  {
    id: 'PRB-20261006-001',
    sku: STANDARD_SKUS[0], // Apple / US / USD / $100 / E-Code / Fast
    problemType: '平台级',
    marketPrice: 84.80, // 84.80% / $84.80
    targetPrice: 84.50,
    bestMerchantPrice: 83.10, // 所有商户最高才 83.10
    gap: -1.40, // 比目标低 1.40pp
    affectedMerchantCount: 3,
    totalMerchantCount: 3,
    anomalyRatio: 100, // 3/3 均不具备竞争力
    affectedMerchantNames: ['招财进宝数卡科技', '极客卡业', '鼎盛数字科技'],
    affectedGmv: 45200, // $45,200/日
    severity: '平台级异常',
    startTime: '12:15:00',
    durationMinutes: 145, // 2.4小时
    owner: '运营专员-张伟',
    status: '异常待处理',
    competitiveness: '异常',
    systemVerdict: '当前 3 家有效承接商户最高报价均为 83.10%，较平台目标价 84.50% 倒挂 -1.40pp，且 3/3 商户均低于门槛阈值，系统判定为平台级 SKU 报价异常！',
    merchantQuotesList: [
      {
        merchantId: 'M-1001',
        merchantName: '招财进宝数卡科技',
        merchantTier: 'Tier-S',
        currentQuote: 83.10,
        rank: 1,
        bestPriceDiff: 0,
        marketPriceDiff: -1.70,
        quoteStatus: '生效',
        acceptanceStatus: '在线',
        acceptanceRate: 98.5,
        successRate: 99.2,
        updatedAt: '14:20:00'
      },
      {
        merchantId: 'M-1002',
        merchantName: '极客卡业 (美区专线)',
        merchantTier: 'Tier-A',
        currentQuote: 82.50,
        rank: 2,
        bestPriceDiff: -0.60,
        marketPriceDiff: -2.30,
        quoteStatus: '生效',
        acceptanceStatus: '限额预警',
        acceptanceRate: 94.0,
        successRate: 97.5,
        updatedAt: '14:10:00'
      },
      {
        merchantId: 'M-1004',
        merchantName: '鼎盛数字科技',
        merchantTier: 'Tier-B',
        currentQuote: 81.80,
        rank: 3,
        bestPriceDiff: -1.30,
        marketPriceDiff: -3.00,
        quoteStatus: '生效',
        acceptanceStatus: '在线',
        acceptanceRate: 91.2,
        successRate: 95.8,
        updatedAt: '13:50:00'
      }
    ],
    trendData: [
      { time: '10:00', marketPrice: 85.00, targetPrice: 84.50, bestMerchantPrice: 84.80 },
      { time: '11:00', marketPrice: 84.90, targetPrice: 84.50, bestMerchantPrice: 84.20 },
      { time: '12:00', marketPrice: 84.80, targetPrice: 84.50, bestMerchantPrice: 83.50 },
      { time: '13:00', marketPrice: 84.80, targetPrice: 84.50, bestMerchantPrice: 83.10 },
      { time: '14:00', marketPrice: 84.80, targetPrice: 84.50, bestMerchantPrice: 83.10 }
    ],
    auditLogs: [
      { time: '12:15:00', operator: '机器人比价巡检引擎', action: '发现异常', remark: '检测到全网最高商户报价 83.10% 低于目标阈值 84.50%，产生 -1.40pp 缺口' },
      { time: '12:20:00', operator: '系统规则判定', action: '分类判定', remark: '受影响商户数 3/3 (100%)，升级为【平台级SKU报价异常】' },
      { time: '12:30:00', operator: '运营专员-张伟', action: '分配分配', remark: '已接管工单，准备联系【招财进宝数卡科技】与【极客卡业】督办调价' }
    ]
  },
  {
    id: 'PRB-20261006-002',
    sku: STANDARD_SKUS[3], // Steam / Global / USD / $100 / E-Code / Fast
    problemType: '平台级',
    marketPrice: 77.20,
    targetPrice: 76.00,
    bestMerchantPrice: 74.50,
    gap: -1.50,
    affectedMerchantCount: 3,
    totalMerchantCount: 5,
    anomalyRatio: 60.0,
    affectedMerchantNames: ['极速易换点卡', '鼎盛数字科技', '顺达环球卡券'],
    affectedGmv: 38000,
    severity: '平台级异常',
    startTime: '13:00:00',
    durationMinutes: 100,
    owner: '客服主管-王晨',
    status: '处理中',
    competitiveness: '异常',
    systemVerdict: '当前 5 家可承接商户中 3 家 (60%) 报价严重低于平台门槛，且最高报价 74.50% 与目标 76.00% 存在 -1.50pp 严重差距。',
    merchantQuotesList: [
      {
        merchantId: 'M-1004',
        merchantName: '极速易换点卡商行',
        merchantTier: 'Tier-S',
        currentQuote: 74.50,
        rank: 1,
        bestPriceDiff: 0,
        marketPriceDiff: -2.70,
        quoteStatus: '生效',
        acceptanceStatus: '在线',
        acceptanceRate: 99.0,
        successRate: 98.8,
        updatedAt: '14:25:00'
      },
      {
        merchantId: 'M-1002',
        merchantName: '鼎盛数字科技',
        merchantTier: 'Tier-A',
        currentQuote: 72.80,
        rank: 2,
        bestPriceDiff: -1.70,
        marketPriceDiff: -4.40,
        quoteStatus: '生效',
        acceptanceStatus: '暂停',
        acceptanceRate: 85.0,
        successRate: 92.1,
        updatedAt: '13:40:00'
      }
    ],
    trendData: [
      { time: '10:00', marketPrice: 77.50, targetPrice: 76.00, bestMerchantPrice: 76.20 },
      { time: '12:00', marketPrice: 77.30, targetPrice: 76.00, bestMerchantPrice: 75.00 },
      { time: '14:00', marketPrice: 77.20, targetPrice: 76.00, bestMerchantPrice: 74.50 }
    ],
    auditLogs: [
      { time: '13:00:00', operator: '机器人比价巡检引擎', action: '发现异常', remark: '检测到 Steam 100 存在 -1.50pp 价差' },
      { time: '13:10:00', operator: '客服主管-王晨', action: '下发催办', remark: '已联系极速易换点卡责任人，商户答复正在申请补存积点并提价' }
    ]
  },
  {
    id: 'PRB-20261006-003',
    sku: STANDARD_SKUS[5], // Google Play / US / USD / $100 / E-Code / Fast
    problemType: '商户级',
    marketPrice: 88.00,
    targetPrice: 86.00,
    bestMerchantPrice: 88.50, // 平台最高 88.50% 仍然高于目标 86.00%，整体有竞争力！
    gap: 2.50, // 整体优于目标 +2.50pp
    affectedMerchantCount: 1,
    totalMerchantCount: 4,
    anomalyRatio: 25.0, // 仅 1/4 商户报价偏低，平台整体依然强劲！
    affectedMerchantNames: ['极速易换点卡'],
    affectedGmv: 12000,
    severity: '商户级异常',
    startTime: '13:30:00',
    durationMinutes: 70,
    owner: '运营专员-李明',
    status: '异常待处理',
    competitiveness: '优势',
    systemVerdict: '平台最高商户报价 88.50% 显著高于目标价 86.00%（+2.50pp），平台整体具有极强竞争力！仅单个商户【极速易换点卡】(85.00%) 报价偏弱，判定为商户级异常。',
    merchantQuotesList: [
      {
        merchantId: 'M-1005',
        merchantName: '欧美直通车科技',
        merchantTier: 'Tier-S',
        currentQuote: 88.50,
        rank: 1,
        bestPriceDiff: 0,
        marketPriceDiff: 0.50,
        quoteStatus: '生效',
        acceptanceStatus: '在线',
        acceptanceRate: 99.5,
        successRate: 99.1,
        updatedAt: '14:10:05'
      },
      {
        merchantId: 'M-1004',
        merchantName: '极速易换点卡',
        merchantTier: 'Tier-B',
        currentQuote: 85.00,
        rank: 4,
        bestPriceDiff: -3.50,
        marketPriceDiff: -3.00,
        quoteStatus: '生效',
        acceptanceStatus: '限额预警',
        acceptanceRate: 90.0,
        successRate: 94.0,
        updatedAt: '13:20:00'
      }
    ],
    trendData: [
      { time: '11:00', marketPrice: 88.00, targetPrice: 86.00, bestMerchantPrice: 88.00 },
      { time: '14:00', marketPrice: 88.00, targetPrice: 86.00, bestMerchantPrice: 88.50 }
    ],
    auditLogs: [
      { time: '13:30:00', operator: '机器人比价巡检引擎', action: '单商户预警', remark: '平台整体正常，单商户【极速易换点卡】报价偏低' }
    ]
  },
  {
    id: 'PRB-20261006-004',
    sku: STANDARD_SKUS[6], // Razer Gold / Global / USD / $100 / Direct-PIN / Fast
    problemType: '商户级',
    marketPrice: 90.50,
    targetPrice: 89.00,
    bestMerchantPrice: 90.20,
    gap: 1.20,
    affectedMerchantCount: 1,
    totalMerchantCount: 2,
    anomalyRatio: 50.0,
    affectedMerchantNames: ['鼎盛数字科技'],
    affectedGmv: 8500,
    severity: '关注',
    startTime: '13:50:00',
    durationMinutes: 50,
    owner: '运营专员-张伟',
    status: '关注',
    competitiveness: '关注',
    systemVerdict: '最高报价 90.20% 达标，但可承接商户仅 2 家且 1 家离线，处于关注预警状态。',
    merchantQuotesList: [
      {
        merchantId: 'M-1001',
        merchantName: '招财进宝数卡科技',
        merchantTier: 'Tier-S',
        currentQuote: 90.20,
        rank: 1,
        bestPriceDiff: 0,
        marketPriceDiff: -0.30,
        quoteStatus: '生效',
        acceptanceStatus: '在线',
        acceptanceRate: 97.0,
        successRate: 98.5,
        updatedAt: '14:00:00'
      }
    ],
    trendData: [
      { time: '12:00', marketPrice: 90.50, targetPrice: 89.00, bestMerchantPrice: 90.20 }
    ],
    auditLogs: [
      { time: '13:50:00', operator: '机器人比价巡检引擎', action: '存量监控', remark: '提示可承接商户偏少，需扩充商户' }
    ]
  },
  {
    id: 'PRB-20261006-005',
    sku: STANDARD_SKUS[2], // Apple / US / USD / $50 / E-Code / Fast
    problemType: '无问题',
    marketPrice: 84.50,
    targetPrice: 82.00,
    bestMerchantPrice: 84.95,
    gap: 2.95,
    affectedMerchantCount: 0,
    totalMerchantCount: 5,
    anomalyRatio: 0,
    affectedMerchantNames: [],
    affectedGmv: 28000,
    severity: '正常',
    startTime: '08:00:00',
    durationMinutes: 380,
    owner: '机器人自动比价',
    status: '正常',
    competitiveness: '正常',
    systemVerdict: '最高商户报价 84.95% 优于目标价 82.00%，全网 5 家商户覆盖充裕，价格健康度良好。',
    merchantQuotesList: [
      {
        merchantId: 'M-1001',
        merchantName: '招财进宝数卡科技',
        merchantTier: 'Tier-S',
        currentQuote: 84.95,
        rank: 1,
        bestPriceDiff: 0,
        marketPriceDiff: 0.45,
        quoteStatus: '生效',
        acceptanceStatus: '在线',
        acceptanceRate: 99.0,
        successRate: 99.5,
        updatedAt: '14:30:18'
      }
    ],
    trendData: [
      { time: '10:00', marketPrice: 84.50, targetPrice: 82.00, bestMerchantPrice: 84.95 }
    ],
    auditLogs: [
      { time: '08:00:00', operator: '机器人巡检', action: '定时巡检', remark: '报价处于最佳竞争区间' }
    ]
  },
  {
    id: 'PRB-20261006-006',
    sku: STANDARD_SKUS[4], // Steam / Global / USD / $50 / E-Code / Standard
    problemType: '无问题',
    marketPrice: 75.80,
    targetPrice: 75.00,
    bestMerchantPrice: 75.80,
    gap: 0.80,
    affectedMerchantCount: 0,
    totalMerchantCount: 3,
    anomalyRatio: 0,
    affectedMerchantNames: [],
    affectedGmv: 15000,
    severity: '正常',
    startTime: '10:00:00',
    durationMinutes: 260,
    owner: '机器人自动比价',
    status: '已恢复',
    recoveryTime: '13:55:00',
    competitiveness: '正常',
    systemVerdict: '商户顺达环球卡券调价后 (+0.80pp)，全网最高报价已升至 75.80%，超过平台目标价，已自动恢复健康状态。',
    merchantQuotesList: [
      {
        merchantId: 'M-1003',
        merchantName: '顺达环球卡券',
        merchantTier: 'Tier-A',
        currentQuote: 75.80,
        rank: 1,
        bestPriceDiff: 0,
        marketPriceDiff: 0.80,
        quoteStatus: '生效',
        acceptanceStatus: '在线',
        acceptanceRate: 98.0,
        successRate: 99.0,
        updatedAt: '13:55:00'
      }
    ],
    trendData: [
      { time: '10:00', marketPrice: 75.80, targetPrice: 75.00, bestMerchantPrice: 75.00 },
      { time: '13:55', marketPrice: 75.80, targetPrice: 75.00, bestMerchantPrice: 75.80 }
    ],
    auditLogs: [
      { time: '13:50:00', operator: '商户调价回流', action: '调价回流', remark: '顺达环球卡券更新报价 75.80%' },
      { time: '13:55:00', operator: '机器人重新计算', action: '自动复核', remark: '重新计算后达标，系统自动切换为【已恢复】' }
    ]
  }
];

