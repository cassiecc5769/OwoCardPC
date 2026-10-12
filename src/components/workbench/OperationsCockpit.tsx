import React, { useState, useEffect, useMemo } from 'react';
import { NavPath } from '../../types';
import { ProductRequirementsPoolModal, ProductRequirement } from '../ProductRequirementsPoolModal';

interface OperationsCockpitProps {
  onNavigate: (path: NavPath) => void;
}

// 6.3 核心指标定义
type TimeRange = 'today' | 'yesterday' | '7d' | '30d';

interface CoreMetricItem {
  id: string;
  name: string;
  definition: string;
  value: string;
  unit: string;
  mom: number; // 环比 (%)
  yoy: number; // 同比 (%)
  trend: 'up' | 'down' | 'flat';
  trendPoints: number[]; // 趋势微图点
  status: 'normal' | 'warning' | 'abnormal';
  statusText: string;
  subNote: string;
}

// 6.4 经营健康度 7 个经营域定义
type HealthDomainId = 'growth' | 'user' | 'channel' | 'merchant' | 'quote' | 'service' | 'capital';
type HealthStatus = 'normal' | 'attention' | 'abnormal';

interface BusinessDomainHealth {
  id: HealthDomainId;
  name: string;
  icon: string;
  status: HealthStatus;
  statusLabel: string;
  primaryMetric: string;
  metricValue: string;
  metricComparison: string;
  ruleDescription: string;
  targetPath: NavPath;
  targetModuleName: string;
  alertSummary?: string;
}

// 6.5 重点经营问题定义
type ProblemLevel = 'high' | 'medium' | 'low';
type ProblemType = '报价' | '增长' | '商户' | '渠道' | '作业' | '资金' | '用户';
type ProblemStatus = 'pending' | 'processing' | 'recovered';

interface KeyBusinessProblem {
  id: string;
  title: string;
  type: ProblemType;
  impactLevel: ProblemLevel; // 高/中/低
  impactWeight: number; // 业务影响分 1~100 (40%)
  urgencyWeight: number; // 紧急程度分 1~100 (35%)
  durationMinutes: number; // 持续时间分钟数 (25%)
  impactMetrics: string; // GMV/转化/毛利等
  impactScope: string; // 用户/SKU/商户
  firstSeenTime: string; // 首次出现
  status: ProblemStatus;
  suggestedAction: string;
  owner: string;
  ownerTeam: string;
  diagnosticDetail: string;
  actionType: 'adjust_quote' | 'credit_boost' | 'send_coupon' | 'assign_cs' | 'channel_audit';
  compositeScore?: number;
}

export const OperationsCockpit: React.FC<OperationsCockpitProps> = ({ onNavigate }) => {
  // PRD 规定标准 Tab: 经营概览 / 重点问题 / 我的计划
  const [subTab, setSubTab] = useState<'overview' | 'problems' | 'plans'>('overview');
  // 6.3 时间周期切换：今日 / 昨日 / 7日 / 30日
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [clockStr, setClockStr] = useState('14:32:08');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 6.5 重点问题筛选与交互
  const [statusFilter, setStatusFilter] = useState<'all' | ProblemStatus>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | ProblemLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<KeyBusinessProblem | null>(null);

  // 处置动作模态框
  const [actionModalProblem, setActionModalProblem] = useState<KeyBusinessProblem | null>(null);
  const [actionFormValue, setActionFormValue] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // 需求池弹窗
  const [isRequirementsPoolOpen, setIsRequirementsPoolOpen] = useState(false);
  const [prefillRequirement, setPrefillRequirement] = useState<{
    title?: string;
    source?: '经营问题' | '运营计划' | '人工发现' | '客服反馈' | '财务风控';
    problem?: string;
    priority?: 'P0' | 'P1' | 'P2';
  } | undefined>(undefined);

  // 动态时钟
  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setClockStr(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // -------------------------------------------------------------
  // 6.3 核心指标数据表（今日 / 昨日 / 7日 / 30日）
  // -------------------------------------------------------------
  const CORE_METRICS_DATA: Record<TimeRange, CoreMetricItem[]> = {
    today: [
      {
        id: 'gmv',
        name: 'GMV',
        definition: '成交订单交易金额',
        value: '1,268,500',
        unit: '¥',
        mom: 12.6,
        yoy: 18.4,
        trend: 'up',
        trendPoints: [32, 45, 54, 48, 62, 78, 88, 95],
        status: 'normal',
        statusText: '稳健增长',
        subNote: '环比昨日同时段 +12.6%',
      },
      {
        id: 'order_count',
        name: '成交订单量',
        definition: '已成交订单数量',
        value: '6,842',
        unit: '笔',
        mom: 8.9,
        yoy: 14.2,
        trend: 'up',
        trendPoints: [40, 52, 60, 58, 69, 75, 82, 89],
        status: 'normal',
        statusText: '达标',
        subNote: '日峰值撮合 420笔/h',
      },
      {
        id: 'conversion_rate',
        name: '成交率',
        definition: '成交订单 / 有效提交订单',
        value: '71.4',
        unit: '%',
        mom: -3.2,
        yoy: -2.8,
        trend: 'down',
        trendPoints: [78, 77, 76, 75, 74, 73, 72, 71.4],
        status: 'abnormal',
        statusText: '低于警戒线-3.2%',
        subNote: 'Apple US 美区差价扩大导致转单',
      },
      {
        id: 'gross_profit',
        name: '毛利',
        definition: '平台收入 - 相关交易成本',
        value: '48,203',
        unit: '¥',
        mom: 14.1,
        yoy: 22.0,
        trend: 'up',
        trendPoints: [30, 38, 44, 42, 55, 64, 72, 80],
        status: 'normal',
        statusText: '毛利率 3.80%',
        subNote: '扣除通道与大客返点后净收入',
      },
      {
        id: 'repurchase_rate',
        name: '复购率',
        definition: '统计周期内产生复购的用户占比',
        value: '38.6',
        unit: '%',
        mom: 1.4,
        yoy: 3.2,
        trend: 'up',
        trendPoints: [35, 36, 36.5, 37, 37.5, 38, 38.3, 38.6],
        status: 'normal',
        statusText: '良性态势',
        subNote: '核心VIP客户回访稳定',
      },
      {
        id: 'fulfillment_rate',
        name: '履约成功率',
        definition: '成功完成卡单 / 进入履约卡单',
        value: '99.1',
        unit: '%',
        mom: 0.3,
        yoy: 0.5,
        trend: 'up',
        trendPoints: [98.2, 98.4, 98.7, 98.8, 98.9, 99.0, 99.1, 99.1],
        status: 'normal',
        statusText: '平均耗时 38s',
        subNote: '自动化验卡核销率 94.2%',
      },
    ],
    yesterday: [
      {
        id: 'gmv',
        name: 'GMV',
        definition: '成交订单交易金额',
        value: '1,126,400',
        unit: '¥',
        mom: 3.2,
        yoy: 8.1,
        trend: 'up',
        trendPoints: [28, 40, 48, 52, 60, 68, 75, 82],
        status: 'normal',
        statusText: '平稳终局',
        subNote: '全天总成交 ¥112.6万',
      },
      {
        id: 'order_count',
        name: '成交订单量',
        definition: '已成交订单数量',
        value: '6,280',
        unit: '笔',
        mom: 2.1,
        yoy: 6.5,
        trend: 'flat',
        trendPoints: [38, 48, 55, 54, 62, 68, 70, 72],
        status: 'normal',
        statusText: '符合预期',
        subNote: '有效提交 8,509 笔',
      },
      {
        id: 'conversion_rate',
        name: '成交率',
        definition: '成交订单 / 有效提交订单',
        value: '73.8',
        unit: '%',
        mom: -1.1,
        yoy: -0.9,
        trend: 'down',
        trendPoints: [76, 75.5, 75, 74.8, 74.2, 74.0, 73.9, 73.8],
        status: 'warning',
        statusText: '轻微关注',
        subNote: '晚间 21:00 出现短时商户拒单',
      },
      {
        id: 'gross_profit',
        name: '毛利',
        definition: '平台收入 - 相关交易成本',
        value: '42,240',
        unit: '¥',
        mom: 1.8,
        yoy: 9.4,
        trend: 'up',
        trendPoints: [26, 32, 38, 40, 45, 50, 54, 58],
        status: 'normal',
        statusText: '毛利率 3.75%',
        subNote: '达成单日预算目标 103%',
      },
      {
        id: 'repurchase_rate',
        name: '复购率',
        definition: '统计周期内产生复购的用户占比',
        value: '37.9',
        unit: '%',
        mom: 0.5,
        yoy: 2.1,
        trend: 'flat',
        trendPoints: [36, 36.5, 37, 37.2, 37.5, 37.7, 37.8, 37.9],
        status: 'normal',
        statusText: '平稳',
        subNote: '散户复购 31.4%，大客 82.0%',
      },
      {
        id: 'fulfillment_rate',
        name: '履约成功率',
        definition: '成功完成卡单 / 进入履约卡单',
        value: '98.9',
        unit: '%',
        mom: 0.1,
        yoy: 0.2,
        trend: 'up',
        trendPoints: [98.0, 98.2, 98.4, 98.5, 98.7, 98.8, 98.9, 98.9],
        status: 'normal',
        statusText: '平均耗时 41s',
        subNote: '异常拦截率 1.1%',
      },
    ],
    '7d': [
      {
        id: 'gmv',
        name: 'GMV',
        definition: '成交订单交易金额',
        value: '8,452,100',
        unit: '¥',
        mom: 15.2,
        yoy: 24.8,
        trend: 'up',
        trendPoints: [60, 65, 72, 70, 85, 92, 98, 105],
        status: 'normal',
        statusText: '快速爬坡',
        subNote: '近7天日均 ¥120.7万',
      },
      {
        id: 'order_count',
        name: '成交订单量',
        definition: '已成交订单数量',
        value: '45,920',
        unit: '笔',
        mom: 9.7,
        yoy: 16.0,
        trend: 'up',
        trendPoints: [50, 54, 58, 62, 68, 74, 80, 85],
        status: 'normal',
        statusText: '放量增长',
        subNote: '总提交卡数 61,308 笔',
      },
      {
        id: 'conversion_rate',
        name: '成交率',
        definition: '成交订单 / 有效提交订单',
        value: '74.9',
        unit: '%',
        mom: -1.6,
        yoy: -0.5,
        trend: 'down',
        trendPoints: [77, 76.5, 76, 75.8, 75.2, 75.0, 74.9, 74.9],
        status: 'warning',
        statusText: '需调优商户供给',
        subNote: '近7日基线 76.5%',
      },
      {
        id: 'gross_profit',
        name: '毛利',
        definition: '平台收入 - 相关交易成本',
        value: '321,180',
        unit: '¥',
        mom: 13.5,
        yoy: 25.1,
        trend: 'up',
        trendPoints: [45, 50, 58, 64, 70, 78, 85, 92],
        status: 'normal',
        statusText: '毛利率 3.80%',
        subNote: '净利润表现优良',
      },
      {
        id: 'repurchase_rate',
        name: '复购率',
        definition: '统计周期内产生复购的用户占比',
        value: '41.2',
        unit: '%',
        mom: 2.6,
        yoy: 4.8,
        trend: 'up',
        trendPoints: [37, 38, 38.5, 39, 39.8, 40.4, 40.9, 41.2],
        status: 'normal',
        statusText: '粘性持续提升',
        subNote: '老客贡献 GMV 64.2%',
      },
      {
        id: 'fulfillment_rate',
        name: '履约成功率',
        definition: '成功完成卡单 / 进入履约卡单',
        value: '98.8',
        unit: '%',
        mom: 0.2,
        yoy: 0.4,
        trend: 'up',
        trendPoints: [98.1, 98.3, 98.5, 98.6, 98.7, 98.8, 98.8, 98.8],
        status: 'normal',
        statusText: '履约稳定',
        subNote: '商户违约罚扣共 4 笔',
      },
    ],
    '30d': [
      {
        id: 'gmv',
        name: 'GMV',
        definition: '成交订单交易金额',
        value: '34,890,200',
        unit: '¥',
        mom: 11.8,
        yoy: 29.5,
        trend: 'up',
        trendPoints: [70, 75, 80, 82, 88, 94, 102, 110],
        status: 'normal',
        statusText: '月度超额达成',
        subNote: '月度目标完成度 108.4%',
      },
      {
        id: 'order_count',
        name: '成交订单量',
        definition: '已成交订单数量',
        value: '189,450',
        unit: '笔',
        mom: 10.3,
        yoy: 21.4,
        trend: 'up',
        trendPoints: [60, 65, 70, 74, 80, 88, 95, 102],
        status: 'normal',
        statusText: '规模扩张',
        subNote: '活跃出卡散户突破 2.4万人',
      },
      {
        id: 'conversion_rate',
        name: '成交率',
        definition: '成交订单 / 有效提交订单',
        value: '76.2',
        unit: '%',
        mom: 0.4,
        yoy: 1.2,
        trend: 'up',
        trendPoints: [74.5, 75.0, 75.4, 75.8, 76.0, 76.1, 76.2, 76.2],
        status: 'normal',
        statusText: '处于健康区间',
        subNote: '月均成交率基线 75.0%',
      },
      {
        id: 'gross_profit',
        name: '毛利',
        definition: '平台收入 - 相关交易成本',
        value: '1,325,800',
        unit: '¥',
        mom: 12.4,
        yoy: 27.6,
        trend: 'up',
        trendPoints: [50, 58, 65, 72, 80, 90, 98, 108],
        status: 'normal',
        statusText: '毛利率 3.80%',
        subNote: '月度毛利创年内新高',
      },
      {
        id: 'repurchase_rate',
        name: '复购率',
        definition: '统计周期内产生复购的用户占比',
        value: '46.8',
        unit: '%',
        mom: 3.1,
        yoy: 6.0,
        trend: 'up',
        trendPoints: [40, 41, 42, 43, 44.5, 45.6, 46.2, 46.8],
        status: 'normal',
        statusText: '私域沉淀见效',
        subNote: '月复购用户 11,280 人',
      },
      {
        id: 'fulfillment_rate',
        name: '履约成功率',
        definition: '成功完成卡单 / 进入履约卡单',
        value: '98.7',
        unit: '%',
        mom: 0.3,
        yoy: 0.6,
        trend: 'up',
        trendPoints: [98.0, 98.2, 98.4, 98.5, 98.6, 98.7, 98.7, 98.7],
        status: 'normal',
        statusText: '履约稳健',
        subNote: '争议仲裁胜诉率 91.2%',
      },
    ],
  };

  const currentMetrics = CORE_METRICS_DATA[timeRange];

  // -------------------------------------------------------------
  // 6.4 经营健康度（7个经营域）
  // -------------------------------------------------------------
  const BUSINESS_HEALTH_DOMAINS: BusinessDomainHealth[] = [
    {
      id: 'growth',
      name: '增长',
      icon: 'trending_up',
      status: 'attention',
      statusLabel: '关注',
      primaryMetric: '新客首单转化率',
      metricValue: '31.2%',
      metricComparison: '较基准 35% 偏低 3.8pp',
      ruleDescription: '当新客首单转化率 < 35% 或周环比跌幅 > 5pp 时自动判定为关注',
      targetPath: 'growth-overview',
      targetModuleName: '增长运营 · 增长总览',
      alertSummary: '推广B组进线质量波动，注册未购率达 68.8%',
    },
    {
      id: 'user',
      name: '用户',
      icon: 'person',
      status: 'normal',
      statusLabel: '正常',
      primaryMetric: 'VIP高净值留存率',
      metricValue: '88.4%',
      metricComparison: '月活出卡用户 14,280 人',
      ruleDescription: '当 VIP 留存率 ≥ 85% 且大客无规模流失时判定为正常',
      targetPath: 'user-management',
      targetModuleName: '用户管理 · 用户列表',
    },
    {
      id: 'channel',
      name: '渠道',
      icon: 'hub',
      status: 'attention',
      statusLabel: '关注',
      primaryMetric: '合伙人B组质量分',
      metricValue: '62分',
      metricComparison: '虚假流量疑似率 18.2%',
      ruleDescription: '核心渠道单日有效出卡转化率 < 30% 触发质量预警',
      targetPath: 'channel-overview',
      targetModuleName: '渠道运营 · 渠道总览',
      alertSummary: '存在刷单羊毛嫌疑流量，已触发风控重点防刷',
    },
    {
      id: 'merchant',
      name: '商户',
      icon: 'storefront',
      status: 'abnormal',
      statusLabel: '异常',
      primaryMetric: '美区商户额度消耗',
      metricValue: '96.2%',
      metricComparison: '3家核心商户额度触顶',
      ruleDescription: '商户质押可用额度 < 15% 或单日拒单率 > 5% 判定为异常',
      targetPath: 'merchant-ops-overview',
      targetModuleName: '商户运营 · 经营总览',
      alertSummary: '极客卡业等美区承接力告急，已产生 86 笔卡单积压',
    },
    {
      id: 'quote',
      name: '报价',
      icon: 'price_change',
      status: 'abnormal',
      statusLabel: '异常',
      primaryMetric: 'Apple US 市场剪刀差',
      metricValue: '-1.5pp',
      metricComparison: '低于市场TOP3均价',
      ruleDescription: '重点卡种报价持续低于外部行情 ≥ 1.0pp 超过 60min 触发异常',
      targetPath: 'quote-anomalies',
      targetModuleName: '报价运营 · 报价异常',
      alertSummary: '导致今日预估少成交 ¥8.2万，急需协调商户上调折率',
    },
    {
      id: 'service',
      name: '作业',
      icon: 'support_agent',
      status: 'normal',
      statusLabel: '正常',
      primaryMetric: '人工卡单超时率',
      metricValue: '0.8%',
      metricComparison: '平均客服处理 26s',
      ruleDescription: '卡单作业待办堆积 < 30 笔且 SLA 超时率 < 3.0% 判定为正常',
      targetPath: 'workbench-cs-orders',
      targetModuleName: '客服工作台 · 卡单作业',
    },
    {
      id: 'capital',
      name: '资金',
      icon: 'account_balance_wallet',
      status: 'normal',
      statusLabel: '正常',
      primaryMetric: '商户质押覆盖倍数',
      metricValue: '142%',
      metricComparison: '无透支挂账或差错单',
      ruleDescription: '质押池 / 在途未结卡款 > 120% 且对账零差异判定为正常',
      targetPath: 'points-account',
      targetModuleName: '财务结算 · 账户管理',
    },
  ];

  // -------------------------------------------------------------
  // 6.5 重点经营问题数据集 (排序算法：业务影响40% × 紧急程度35% × 持续时间25%)
  // -------------------------------------------------------------
  const [problems, setProblems] = useState<KeyBusinessProblem[]>([
    {
      id: 'PROB-01',
      title: 'Apple US 美区礼品卡报价竞争力下滑',
      type: '报价',
      impactLevel: 'high',
      impactWeight: 96,
      urgencyWeight: 94,
      durationMinutes: 135,
      impactMetrics: 'GMV (日预计损失 -¥8.2万) / 成交率 (跌至 68.5%)',
      impactScope: 'SKU: Apple Gift Card US (全额度) / 影响 380+ 潜在出卡散户',
      firstSeenTime: '2小时前 (12:20)',
      status: 'pending',
      suggestedAction: '一键向3家头部商户发起加权催调价，临时对美区补贴 0.5pp 平台让利',
      owner: '王建国',
      ownerTeam: '报价运营组',
      diagnosticDetail: '竞对主流平台今日折率 84.5%，我司商户出价仅 83.0%，差价达 1.5pp，用户挂卡后撤单流失严重。',
      actionType: 'adjust_quote',
    },
    {
      id: 'PROB-02',
      title: '核心承接商户「极客卡业」质押额度打满断档',
      type: '商户',
      impactLevel: 'high',
      impactWeight: 92,
      urgencyWeight: 90,
      durationMinutes: 68,
      impactMetrics: '履约成功率 / 峰值排队时效 (86笔卡单排队延误)',
      impactScope: '商户: 极客卡业 (M-1002) / 影响 Steam & Apple 大额卡',
      firstSeenTime: '1小时前 (13:24)',
      status: 'pending',
      suggestedAction: '开启信用质押临时增额 50,000 USDT，或触发撮合路由紧急重平衡分流',
      owner: '李四',
      ownerTeam: '商户运营组',
      diagnosticDetail: '商户今日接单金额达 32 万 USDT，质押预警线已打满至 98.4%，若不增额将无法继续自动核销。',
      actionType: 'credit_boost',
    },
    {
      id: 'PROB-03',
      title: '渠道合伙人B组新用户首单转化率异常暴跌',
      type: '增长',
      impactLevel: 'high',
      impactWeight: 88,
      urgencyWeight: 84,
      durationMinutes: 240,
      impactMetrics: '转化率 (首单转化 31.2%，↓6.3pp) / 获客ROI',
      impactScope: '用户群: 推广团队B导流新客 / 注册未购率 68.8%',
      firstSeenTime: '4小时前 (10:30)',
      status: 'processing',
      suggestedAction: '协同推广团队排查机刷嫌疑，对真实实名新客定向推送首单 1.5% 加息召回券',
      owner: '张三',
      ownerTeam: '增长运营组',
      diagnosticDetail: '新增注册 420 人仅 131 人发起出卡，深度分析发现其导流页面缺少针对新人的首单教程指引。',
      actionType: 'send_coupon',
    },
    {
      id: 'PROB-04',
      title: 'Steam 充值卡夜间核销SLA超时堆积预警',
      type: '作业',
      impactLevel: 'medium',
      impactWeight: 75,
      urgencyWeight: 72,
      durationMinutes: 380,
      impactMetrics: '履约耗时 (平均 4.2min，超标3.1pp) / 客服退单率',
      impactScope: 'SKU: Steam Global / 晚间 20:00-24:00 高峰时段',
      firstSeenTime: '昨日 21:00 (夜间复现)',
      status: 'processing',
      suggestedAction: '协调商户增加 2 名夜间验卡坐席，开启平台端智能 OCR 预核验辅助',
      owner: '赵六',
      ownerTeam: '客服作业组',
      diagnosticDetail: '夜间人工密卡核验商户人员就位不足，产生 42 笔订单卡在人工确认节点超过 5 分钟。',
      actionType: 'assign_cs',
    },
    {
      id: 'PROB-05',
      title: '大客户（月均出卡>¥5万）7日未出卡沉默流失',
      type: '用户',
      impactLevel: 'low',
      impactWeight: 62,
      urgencyWeight: 58,
      durationMinutes: 1440,
      impactMetrics: '复购率 / 大客户活跃度 (42位VIP客户面临沉默)',
      impactScope: '用户群: VIP4~VIP5 重点大客',
      firstSeenTime: '1天前 (10-04)',
      status: 'pending',
      suggestedAction: '触发 VIP 大客户 1v1 运营召回，发放 0.8% 高额返佣阶梯激励方案',
      owner: '孙梅',
      ownerTeam: '用户运营组',
      diagnosticDetail: '受外部部分线下换汇群竞争抢客，老客二次出卡周期从 2.4 天拉长至 6.8 天。',
      actionType: 'send_coupon',
    },
  ]);

  // 综合排序计算：业务影响(40%) × 紧急程度(35%) × 持续时间(25%)
  const sortedAndFilteredProblems = useMemo(() => {
    return problems
      .map(p => {
        // 持续时间归一化到 0~100 (以 480 分钟 = 100 为满分基准)
        const durationScore = Math.min(100, (p.durationMinutes / 480) * 100);
        const compositeScore =
          p.impactWeight * 0.4 + p.urgencyWeight * 0.35 + durationScore * 0.25;
        return {
          ...p,
          compositeScore: Number(compositeScore.toFixed(1)),
        };
      })
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .filter(p => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (typeFilter !== 'all' && p.type !== typeFilter) return false;
        if (levelFilter !== 'all' && p.impactLevel !== levelFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            p.title.toLowerCase().includes(q) ||
            p.impactMetrics.toLowerCase().includes(q) ||
            p.impactScope.toLowerCase().includes(q) ||
            p.owner.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [problems, statusFilter, typeFilter, levelFilter, searchQuery]);

  // 状态变更交互
  const handleUpdateProblemStatus = (problemId: string, nextStatus: ProblemStatus) => {
    setProblems(prev =>
      prev.map(item => (item.id === problemId ? { ...item, status: nextStatus } : item))
    );
    showToast(
      `经营问题已更新为【${
        nextStatus === 'pending'
          ? '待处理'
          : nextStatus === 'processing'
          ? '处理中'
          : '已恢复'
      }】`
    );
  };

  // 立即处置操作
  const handleOpenActionModal = (p: KeyBusinessProblem) => {
    setActionModalProblem(p);
    setActionFormValue('');
  };

  const handleExecuteAction = () => {
    if (!actionModalProblem) return;
    setActionSubmitting(true);
    setTimeout(() => {
      handleUpdateProblemStatus(actionModalProblem.id, 'processing');
      setActionSubmitting(false);
      setActionModalProblem(null);
      showToast(`已成功执行处置动作: ${actionModalProblem.suggestedAction}`);
    }, 700);
  };

  // 录入产品优化需求
  const handleLogRequirement = (prob: KeyBusinessProblem) => {
    setPrefillRequirement({
      title: `【系统优化】针对 ${prob.title} 的自动化治理能力`,
      source: '经营问题',
      problem: `发现问题: ${prob.title}\n影响指标: ${prob.impactMetrics}\n影响范围: ${prob.impactScope}\n归因诊断: ${prob.diagnosticDetail}`,
      priority: prob.impactLevel === 'high' ? 'P0' : prob.impactLevel === 'medium' ? 'P1' : 'P2',
    });
    setIsRequirementsPoolOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 flex-1 w-full max-w-[1600px] mx-auto antialiased text-slate-800 pb-16">
      {/* Toast 提示浮层 */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6.1 & 6.2 顶栏：使用角色 (平台运营/负责人) 与 30秒核心问题导引 */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">运营工作台</h1>
              <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">badge</span>
                角色: 平台运营 / 运营负责人
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                OWO OPERATIONAL ENGINE V9.0
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              定位：回答「今天经营怎么样？」、「哪里出现异常？」与「哪些事情最值得先处理？」
            </p>
          </div>

          {/* 右侧：周期控制器、刷新与产品优化入口 */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 6.3 支持：今日 / 昨日 / 7日 / 30日 */}
            <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
              <button
                onClick={() => {
                  setTimeRange('today');
                  showToast('已切换至【今日】大盘指标');
                }}
                className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer font-medium ${
                  timeRange === 'today'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                今日
              </button>
              <button
                onClick={() => {
                  setTimeRange('yesterday');
                  showToast('已切换至【昨日】终局指标');
                }}
                className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer font-medium ${
                  timeRange === 'yesterday'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                昨日
              </button>
              <button
                onClick={() => {
                  setTimeRange('7d');
                  showToast('已切换至【近7日】趋势指标');
                }}
                className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer font-medium ${
                  timeRange === '7d'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                7日
              </button>
              <button
                onClick={() => {
                  setTimeRange('30d');
                  showToast('已切换至【近30日】大盘指标');
                }}
                className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer font-medium ${
                  timeRange === '30d'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                30日
              </button>
            </div>

            {/* 数据刷新时标 */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-xs text-slate-500">更新: {clockStr}</span>
              <button
                onClick={() => showToast('已从各交易撮合节点同步最新大盘与风控快照')}
                className="text-slate-400 hover:text-blue-600 transition-colors flex items-center cursor-pointer"
                title="立即刷新数据"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
              </button>
            </div>

            {/* 产品优化需求池快捷入口 */}
            <button
              onClick={() => {
                setPrefillRequirement(undefined);
                setIsRequirementsPoolOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              <span>产品优化需求池</span>
            </button>
          </div>
        </div>

        {/* 6.2 页面目标：30秒态势感知条 (明确回答三大问题) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gradient-to-r from-blue-50/80 via-white to-slate-50 border border-blue-100 rounded-xl p-3.5 shadow-2xs">
          {/* 问题 1 */}
          <div className="flex items-start gap-2.5 pr-2 border-b md:border-b-0 md:border-r border-slate-200/80 pb-2 md:pb-0">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                今天经营怎么样？
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">总体偏好</span>
              </span>
              <p className="text-[11.5px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                GMV 达 ¥126.8万 (+12.6%)，毛利达 ¥4.82万 (+14.1%) 创新高；受Apple报价扰动，撮合成交率微降至 71.4%。
              </p>
            </div>
          </div>

          {/* 问题 2 */}
          <div className="flex items-start gap-2.5 pr-2 border-b md:border-b-0 md:border-r border-slate-200/80 pb-2 md:pb-0">
            <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                哪里出现异常？
                <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-1 rounded">2 域异常 · 2 域关注</span>
              </span>
              <p className="text-[11.5px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                【报价域】Apple US剪刀差扩大；【商户域】极客卡业等质押额度打满；【增长/渠道】新客转化率出现走缓。
              </p>
            </div>
          </div>

          {/* 问题 3 */}
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                哪些事情最值得先处理？
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1 rounded">P0 级急办 2 项</span>
              </span>
              <p className="text-[11.5px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                综合权值置顶：优先处理【Apple US 商户调价询价】与【核心商户授信额度补充】，避免高峰期大量转单流失。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PRD 规定标准 Tab 栏: 经营概览 / 重点问题 / 我的计划 */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-1.5 shadow-2xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1">
          {[
            { id: 'overview', label: '经营概览', icon: 'analytics', badge: '大盘健康' },
            { id: 'problems', label: '重点问题', icon: 'warning', badge: '7项待办', badgeColor: 'bg-amber-100 text-amber-800' },
            { id: 'plans', label: '我的计划', icon: 'assignment', badge: '3项推进中', badgeColor: 'bg-blue-100 text-blue-800' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setSubTab(tab.id as any);
                showToast(`已切换至【${tab.label}】`);
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                subTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                subTab === tab.id ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-slate-100 text-slate-600'
              }`}>
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        <div className="text-slate-400 text-xs flex items-center gap-1 font-mono pr-2">
          <span className="material-symbols-outlined text-[15px] text-blue-500">sync_alt</span>
          <span>联动: 运营计划 ⇄ 重点问题闭环</span>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 1. 经营概览: 核心指标区 + 经营健康度诊断 */}
      {/* ========================================================= */}
      {subTab === 'overview' && (
        <>
          <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
            <h2 className="text-sm font-bold text-slate-900">核心指标监控区</h2>
            <span className="text-xs text-slate-400">
              周期：{timeRange === 'today' ? '今日实时' : timeRange === 'yesterday' ? '昨日终局' : timeRange === '7d' ? '近7日累计' : '近30日全量'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">固定监控指标 · 鼠标悬停可查看精准计算口径</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          {currentMetrics.map(metric => {
            const isAbnormal = metric.status === 'abnormal';
            const isWarning = metric.status === 'warning';
            return (
              <div
                key={metric.id}
                className={`bg-white rounded-xl p-4 border transition-all hover:shadow-md flex flex-col justify-between ${
                  isAbnormal
                    ? 'border-rose-200 bg-rose-50/20 shadow-xs ring-1 ring-rose-200'
                    : isWarning
                    ? 'border-amber-200 bg-amber-50/15'
                    : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div>
                  {/* 指标标题与异常标签 */}
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="text-xs font-bold text-slate-700 tracking-tight"
                      title={metric.definition}
                    >
                      {metric.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold font-mono ${
                        isAbnormal
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {metric.statusText}
                    </span>
                  </div>

                  {/* 核心数值展示 */}
                  <div className="mt-2.5 mb-1.5 flex items-baseline gap-1">
                    {metric.unit === '¥' && (
                      <span className="text-xs font-bold text-slate-500 font-mono">¥</span>
                    )}
                    <span className="font-mono text-2xl font-black text-slate-900 tracking-tight">
                      {metric.value}
                    </span>
                    {metric.unit !== '¥' && (
                      <span className="text-xs font-semibold text-slate-500 font-mono">
                        {metric.unit}
                      </span>
                    )}
                  </div>

                  {/* 趋势迷你柱状/走势点 */}
                  <div className="flex items-end gap-1 h-5 my-2 pt-1 border-t border-slate-100">
                    {metric.trendPoints.map((pt, pIdx) => {
                      const maxVal = Math.max(...metric.trendPoints);
                      const minVal = Math.min(...metric.trendPoints);
                      const heightPct = Math.max(20, Math.round(((pt - minVal) / (maxVal - minVal || 1)) * 100));
                      return (
                        <div
                          key={pIdx}
                          style={{ height: `${heightPct}%` }}
                          className={`flex-1 rounded-t-xs transition-all ${
                            isAbnormal
                              ? 'bg-rose-400'
                              : isWarning
                              ? 'bg-amber-400'
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                          title={`节点: ${pt}`}
                        ></div>
                      );
                    })}
                  </div>
                </div>

                {/* 底部环比与同比 */}
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">环比:</span>
                    <span
                      className={`font-mono font-semibold flex items-center gap-0.5 ${
                        metric.mom > 0
                          ? 'text-emerald-600'
                          : metric.mom < 0
                          ? 'text-rose-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {metric.mom > 0 ? '↑' : metric.mom < 0 ? '↓' : ''}
                      {Math.abs(metric.mom)}%
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-400">同比:</span>
                    <span
                      className={`font-mono font-semibold flex items-center gap-0.5 ${
                        metric.yoy > 0
                          ? 'text-emerald-600'
                          : metric.yoy < 0
                          ? 'text-rose-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {metric.yoy > 0 ? '↑' : metric.yoy < 0 ? '↓' : ''}
                      {Math.abs(metric.yoy)}%
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 truncate" title={metric.definition}>
                    {metric.subNote}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6.4 经营健康度 (7个经营域：增长｜用户｜渠道｜商户｜报价｜作业｜资金) */}
      {/* ========================================================= */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
            <h2 className="text-sm font-bold text-slate-900">经营健康度诊断</h2>
            <span className="text-xs text-slate-400">
              覆盖七大核心经营域 · 系统指标规则实时研判 · 点击卡片直达对应模块
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 正常: 3
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> 关注: 2
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> 异常: 2
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {BUSINESS_HEALTH_DOMAINS.map(domain => {
            const isAbnormal = domain.status === 'abnormal';
            const isAttention = domain.status === 'attention';

            return (
              <div
                key={domain.id}
                onClick={() => {
                  onNavigate(domain.targetPath);
                  showToast(`已直接进入【${domain.targetModuleName}】模块`);
                }}
                className={`bg-white rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md hover:-translate-y-0.5 ${
                  isAbnormal
                    ? 'border-rose-300 bg-rose-50/30 ring-1 ring-rose-200'
                    : isAttention
                    ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-200'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <div>
                  {/* 域名称与状态徽标 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          isAbnormal
                            ? 'text-rose-600'
                            : isAttention
                            ? 'text-amber-600'
                            : 'text-slate-500 group-hover:text-blue-600'
                        }`}
                      >
                        {domain.icon}
                      </span>
                      <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                        {domain.name}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isAbnormal
                          ? 'bg-rose-500 text-white'
                          : isAttention
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {domain.statusLabel}
                    </span>
                  </div>

                  {/* 核心指标值 */}
                  <div className="mt-3">
                    <span className="text-[10px] text-slate-400 block truncate">
                      {domain.primaryMetric}
                    </span>
                    <span className="font-mono text-base font-bold text-slate-900 block mt-0.5">
                      {domain.metricValue}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                      {domain.metricComparison}
                    </span>
                  </div>

                  {/* 异常摘要或判定规则 */}
                  <div
                    className={`mt-2 p-1.5 rounded text-[10px] leading-tight ${
                      isAbnormal
                        ? 'bg-rose-100/70 text-rose-800'
                        : isAttention
                        ? 'bg-amber-100/70 text-amber-800'
                        : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    {domain.alertSummary || domain.ruleDescription}
                  </div>
                </div>

                {/* 底部跳转指引 */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-blue-600">
                  <span className="truncate">{domain.targetModuleName.split('·')[0]}</span>
                  <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
        </>
      )}

      {/* ========================================================= */}
      {/* 2. 重点问题: 重点经营问题 (排序：业务影响 × 紧急程度 × 持续时间) */}
      {/* ========================================================= */}
      {subTab === 'problems' && (
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col gap-4">
        {/* 标题栏与算法规则提示 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <h2 className="text-sm font-bold text-slate-900">重点经营问题列表</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold">
              {sortedAndFilteredProblems.length} 项需重点处置
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg text-slate-600 font-mono">
            <span className="material-symbols-outlined text-[15px] text-blue-600">functions</span>
            <span>系统排序公式：业务影响(40%) × 紧急程度(35%) × 持续时间(25%)</span>
          </div>
        </div>

        {/* 筛选与搜索工具条 */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* 状态筛选 */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
              {(['all', 'pending', 'processing', 'recovered'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'all'
                    ? '全部状态'
                    : st === 'pending'
                    ? '待处理'
                    : st === 'processing'
                    ? '处理中'
                    : '已恢复'}
                </button>
              ))}
            </div>

            {/* 类型筛选 */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
              {(['all', '报价', '增长', '商户', '作业', '用户'] as const).map(tp => (
                <button
                  key={tp}
                  onClick={() => setTypeFilter(tp)}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    typeFilter === tp
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tp === 'all' ? '全部类型' : tp}
                </button>
              ))}
            </div>

            {/* 影响程度 */}
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value as any)}
              className="bg-white border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">全部影响程度</option>
              <option value="high">高影响 (优先处置)</option>
              <option value="medium">中影响</option>
              <option value="low">低影响</option>
            </select>
          </div>

          {/* 关键字搜索 */}
          <div className="relative w-64">
            <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-2">
              search
            </span>
            <input
              type="text"
              placeholder="搜索问题、SKU、商户或指标..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 6.5 核心表格：完整展示规定字段 */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3 w-16 text-center">优先级</th>
                <th className="py-2.5 px-3 min-w-[200px]">问题</th>
                <th className="py-2.5 px-3 w-20">类型</th>
                <th className="py-2.5 px-3 w-20">影响程度</th>
                <th className="py-2.5 px-3 min-w-[160px]">影响指标</th>
                <th className="py-2.5 px-3 min-w-[160px]">影响范围</th>
                <th className="py-2.5 px-3 w-28">开始时间</th>
                <th className="py-2.5 px-3 w-24">当前状态</th>
                <th className="py-2.5 px-3 min-w-[220px]">建议动作</th>
                <th className="py-2.5 px-3 w-24">负责人</th>
                <th className="py-2.5 px-3 w-28 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAndFilteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    未检索到符合条件的重点经营问题
                  </td>
                </tr>
              ) : (
                sortedAndFilteredProblems.map((prob, idx) => {
                  const isHigh = prob.impactLevel === 'high';
                  const isMedium = prob.impactLevel === 'medium';

                  return (
                    <tr
                      key={prob.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        prob.status === 'recovered' ? 'opacity-60 bg-slate-50/40' : ''
                      }`}
                    >
                      {/* 优先级权重打分 */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center ${
                              idx === 0
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : idx === 1
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <span className="text-[9.5px] font-mono text-slate-400 mt-0.5">
                            {prob.compositeScore}分
                          </span>
                        </div>
                      </td>

                      {/* 问题标题与说明 */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span
                            onClick={() => setSelectedProblem(prob)}
                            className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                          >
                            {prob.title}
                          </span>
                          <span className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {prob.diagnosticDetail}
                          </span>
                        </div>
                      </td>

                      {/* 类型 */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {prob.type}
                        </span>
                      </td>

                      {/* 影响程度 */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            isHigh
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isMedium
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isHigh ? '高' : isMedium ? '中' : '低'}
                        </span>
                      </td>

                      {/* 影响指标 */}
                      <td className="py-3 px-3">
                        <span className="text-slate-800 font-medium">{prob.impactMetrics}</span>
                      </td>

                      {/* 影响范围 */}
                      <td className="py-3 px-3">
                        <span className="text-slate-600">{prob.impactScope}</span>
                      </td>

                      {/* 开始时间 */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col font-mono text-[11px] text-slate-600">
                          <span>{prob.firstSeenTime}</span>
                          <span className="text-[10px] text-slate-400">持续 {prob.durationMinutes}min</span>
                        </div>
                      </td>

                      {/* 当前状态 */}
                      <td className="py-3 px-3">
                        <select
                          value={prob.status}
                          onChange={e =>
                            handleUpdateProblemStatus(prob.id, e.target.value as ProblemStatus)
                          }
                          className={`text-xs font-semibold rounded px-2 py-1 border focus:outline-none cursor-pointer ${
                            prob.status === 'pending'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : prob.status === 'processing'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <option value="pending">待处理</option>
                          <option value="processing">处理中</option>
                          <option value="recovered">恢复</option>
                        </select>
                      </td>

                      {/* 建议动作 */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-blue-600 text-[16px] shrink-0">
                            lightbulb
                          </span>
                          <span className="text-slate-700 font-medium leading-tight">
                            {prob.suggestedAction}
                          </span>
                        </div>
                      </td>

                      {/* 负责人 */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center">
                            {prob.owner.slice(0, 1)}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{prob.owner}</span>
                            <span className="text-[10px] text-slate-400">{prob.ownerTeam}</span>
                          </div>
                        </div>
                      </td>

                      {/* 操作 */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenActionModal(prob)}
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-2xs transition-colors cursor-pointer"
                            type="button"
                          >
                            处置
                          </button>
                          <button
                            onClick={() => handleLogRequirement(prob)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="录入产品优化需求"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">add_box</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {/* ========================================================= */}
      {/* 3. 我的计划: 运营计划推进看板与当前行动项 */}
      {/* ========================================================= */}
      {subTab === 'plans' && (
        <section className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h2 className="text-sm font-bold text-slate-900">我负责的运营计划推进看板</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                  3 个进行中 · 联动运营计划中心
                </span>
              </div>
              <button
                onClick={() => onNavigate('operation-plans')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>前往运营计划中心完整配置</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                {
                  code: 'OP-2026-Q4-01',
                  issue: '新客 24h 首单转化率走缓 (由 64.2% 降至 52.8%)',
                  baseline: '首单率 52.8%',
                  target: '首单率 >= 65.0%',
                  current: '当前监测 59.4%',
                  progress: 67,
                  status: '推进中',
                  statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
                  actions: [
                    { title: '下发未出卡新客 $3.0 现金红包与首单教程', done: true },
                    { title: '优化注册首屏引导与合规背书', done: true },
                    { title: '针对东南亚渠道开启查验优化', done: false }
                  ]
                },
                {
                  code: 'OP-2026-Q4-02',
                  issue: 'Apple US 出现负毛利倒挂 (-1.2pp)，撮合流失',
                  baseline: '价差 -1.2pp',
                  target: '恢复平台正毛利 >= 1.5pp',
                  current: '当前监测 -0.3pp (持续收窄)',
                  progress: 80,
                  status: '推进中',
                  statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
                  actions: [
                    { title: '下发商户调价询价建议', done: true },
                    { title: '核心商户极客卡业授信临时扩容', done: true },
                    { title: '系统自动化复核生效', done: false }
                  ]
                },
                {
                  code: 'OP-2026-Q4-03',
                  issue: 'Steam 礼品卡高价值大客 30 天复购率环比下滑',
                  baseline: '复购率 41.2%',
                  target: '复购率回升至 55.0%',
                  current: '当前监测 46.8%',
                  progress: 50,
                  status: '推进中',
                  statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                  actions: [
                    { title: '站内「出卡即赠 $5 加息券」', done: true },
                    { title: '大客专属 WhatsApp 经理 1V1 召回', done: false }
                  ]
                }
              ].map(plan => (
                <div key={plan.code} className="bg-slate-50/60 rounded-xl p-4 border border-slate-200 flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-blue-700">{plan.code}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${plan.statusColor}`}>{plan.status}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs leading-snug">{plan.issue}</h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100 font-mono">
                      <span>基线: {plan.baseline}</span>
                      <span className="text-blue-600 font-bold">目标: {plan.target}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded border border-emerald-200">
                      {plan.current}
                    </div>

                    <div className="mt-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>行动项完成度</span>
                        <span className="font-mono font-bold">{plan.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${plan.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-400">专项拆解行动项:</span>
                      {plan.actions.map((act, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                          <span className={`material-symbols-outlined text-[15px] ${act.done ? 'text-emerald-600' : 'text-slate-300'}`}>
                            {act.done ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span className={act.done ? 'line-through text-slate-400' : ''}>{act.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">责任人: 当前运营席位</span>
                    <button
                      onClick={() => onNavigate('operation-plans')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>详情与验证</span>
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 模态框 1: 问题处置模态框 (商户调价、质押增额、发券召回) */}
      {/* ========================================================= */}
      {actionModalProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">
                  task_alt
                </span>
                <span className="font-bold text-sm text-slate-900">
                  执行处置动作 · {actionModalProblem.type}类问题
                </span>
              </div>
              <button
                onClick={() => setActionModalProblem(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-xs">
              <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-xl flex flex-col gap-1.5">
                <span className="font-bold text-slate-900 text-sm">
                  {actionModalProblem.title}
                </span>
                <div className="text-slate-600">
                  影响指标：<strong className="text-rose-600">{actionModalProblem.impactMetrics}</strong>
                </div>
                <div className="text-slate-500">
                  影响范围：{actionModalProblem.impactScope}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">系统推荐动作：</span>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                  {actionModalProblem.suggestedAction}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  协同备注 / 参数调整补充说明 (可选)：
                </label>
                <textarea
                  rows={3}
                  value={actionFormValue}
                  onChange={e => setActionFormValue(e.target.value)}
                  placeholder="请输入对商户、客服或推广团队的处置要求说明..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-slate-500">
                <span>处置责任人: <strong>{actionModalProblem.owner}</strong> ({actionModalProblem.ownerTeam})</span>
                <span className="text-[11px] font-mono">首次出现: {actionModalProblem.firstSeenTime}</span>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActionModalProblem(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={actionSubmitting}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[15px] animate-spin">refresh</span>
                    <span>正在调度执行...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px]">send</span>
                    <span>确认下发处置指令</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 模态框 2: 问题下钻详情 */}
      {/* ========================================================= */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">问题下钻分析与归因</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {selectedProblem.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedProblem(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">问题名称</span>
                <span className="text-sm font-bold text-slate-900">{selectedProblem.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">类型</span>
                  <span className="font-semibold text-slate-800">{selectedProblem.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">影响程度</span>
                  <span className="font-semibold text-rose-600">
                    {selectedProblem.impactLevel.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">综合算法评分</span>
                  <span className="font-mono font-bold text-blue-600">
                    {selectedProblem.compositeScore} 分 (Top Priority)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">持续时长</span>
                  <span className="font-mono text-slate-700">{selectedProblem.durationMinutes} 分钟</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">归因诊断</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1 leading-relaxed">
                  {selectedProblem.diagnosticDetail}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">建议协同动作</span>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg font-medium mt-1">
                  {selectedProblem.suggestedAction}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleLogRequirement(selectedProblem);
                  setSelectedProblem(null);
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                <span>将此问题沉淀为产品优化需求</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleOpenActionModal(selectedProblem);
                  setSelectedProblem(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-xs hover:bg-blue-700"
              >
                立即处置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 模态框 3: 产品优化需求池 */}
      {/* ========================================================= */}
      <ProductRequirementsPoolModal
        isOpen={isRequirementsPoolOpen}
        onClose={() => setIsRequirementsPoolOpen(false)}
        initialTitle={prefillRequirement?.title}
        initialSource={prefillRequirement?.source}
        initialProblem={prefillRequirement?.problem}
        initialPriority={prefillRequirement?.priority}
      />
    </div>
  );
};
