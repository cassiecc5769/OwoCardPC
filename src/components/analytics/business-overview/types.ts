import { NavPath } from '../../../types';

export type TimeRangeKey = 'today' | 'yesterday' | '7d' | 'month' | 'custom';

export interface BusinessOverviewFilters {
  timeRange: TimeRangeKey;
  customDateRange?: { start: string; end: string };
  brand: string;
  region: string;
  channel: string;
  merchant: string;
}

export interface MetricPillarData {
  gmv: {
    total: number;
    momPercent: string;
    yoyPercent: string;
    currency: string;
    successOrders: number;
    successRate: string;
    marketAdvantage: string;
    aov: number;
  };
  users: {
    totalActive: number;
    momPercent: string;
    activityIndex: number;
    newUsers: number;
    newUsersPercent: string;
    repurchaseRate30d: string;
    highValueShare: string;
  };
  merchants: {
    onlineCount: number;
    loadRatio: string;
    healthRate: string;
    avgFulfillmentSec: number;
    speedupSec: number;
    availableCapacity: number;
    stabilizationIndex: string;
  };
  margin: {
    netProfit: number;
    netMarginRatio: string;
    profitRate: string;
    spreadAmount: number;
    escrowSafetyRate: string;
    riskExposure: string;
  };
}

export interface AnomalyItem {
  id: string;
  category: '成功率预警' | '供给缺口' | '时效超时' | '成本波动';
  title: string;
  description: string;
  deltaMetric: string;
  targetPath: NavPath;
  targetActionText: string;
  targetModuleText: string;
  severity: 'high' | 'medium' | 'warning';
  timestamp: string;
  impactValue: string;
  recommendedAction: string;
  isResolved?: boolean;
}

export interface HourlyDataPoint {
  hour: string;
  gmv: number;
  prevGmv: number;
  buyers: number;
  margin: number;
  conversionRate: number;
  isPeak?: boolean;
  notes?: string;
}
