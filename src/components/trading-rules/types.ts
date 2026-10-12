export type RuleLifecycleTab = 'order' | 'dispatch' | 'operation' | 'timeout' | 'dispute';

export type RuleTagColor = 'emerald' | 'blue' | 'rose' | 'indigo' | 'slate' | 'amber';

export interface TradingRuleItem {
  id: string; // e.g. RULE-ORD-MIN
  name: string; // e.g. 单笔最小申报面值限制
  tab: RuleLifecycleTab;
  tag: string; // e.g. 强制防御
  tagColor: RuleTagColor;
  icon: string; // material-symbols icon
  desc: string;
  thresholdValue: string; // e.g. "$10.00"
  thresholdUnit: string; // e.g. "USD"
  secondaryLabel: string; // e.g. "历史阻断率"
  secondaryValue: string; // e.g. "99.94%"
  secondaryColor?: string; // e.g. "text-emerald-600"
  lastModified: string; // e.g. "2026-08-20 by 李瑞"
  modifiedBy: string;
  strategyScope: string; // e.g. "全平台普通散户"
  scopeMode: 'all' | 'large_merchant' | 'retail' | 'api';
  enabled: boolean;
  effectiveMode: '立即生效' | '定时生效' | '审批生效';
}

export interface AuditLogRow {
  id: string; // e.g. RULE-ORD-LIMIT
  prevValue: string; // e.g. "$30,000.00"
  nextValue: string; // e.g. "$50,000.00 USD"
  mode: '立即生效' | '定时生效' | '审批生效';
  timestamp: string; // e.g. "2026-08-25 14:22:09"
  operator: {
    name: string;
    title: string;
    initials: string;
    bg: string;
  };
  ticket: string; // e.g. "APPR-99201"
  reason: string;
  hash: string;
  diffSummary?: string;
  approvedBy?: string;
}

export interface SnapshotVersion {
  version: string;
  releaseDate: string;
  ruleCount: number;
  hash: string;
  description: string;
  operator: string;
  isCurrent: boolean;
  status: 'active' | 'archived';
}

export interface TradingRulesFilterState {
  tab: RuleLifecycleTab;
  search: string;
  scopeMode: 'all' | 'large_merchant' | 'retail' | 'api';
}

export interface KpiMetrics {
  activeRulesCount: number;
  matchSlaSeconds: number;
  avgResponseSeconds: number;
  circuitBreakerMinutes: number;
  fuseTriggersYesterday: number;
  versionSnapshotsCount: number;
  complianceRate: number;
  fusedMerchantsCount: number;
  unassignedSuspendedCount: number;
}
