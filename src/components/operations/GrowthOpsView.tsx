import React, { useState, useMemo } from 'react';
import { NavPath } from '../../types';
import {
  FunnelStageData,
  GrowthHealthAlert,
  ChannelGrowthComparisonItem,
  GrowthCohortItem,
  GrowthProblemItem,
  GrowthStrategyItem,
  GrowthProblemStatus,
  GrowthProblemType
} from './growthTypes';
import {
  INITIAL_GROWTH_FUNNEL,
  INITIAL_GROWTH_HEALTH_ALERTS,
  INITIAL_CHANNEL_GROWTH_LIST,
  INITIAL_GROWTH_COHORTS,
  INITIAL_GROWTH_PROBLEMS,
  INITIAL_GROWTH_STRATEGIES
} from './mockGrowthData';

interface GrowthOpsViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
  showToast: (msg: string) => void;
}

type MainTab = 'overview' | 'analysis' | 'problems' | 'strategies';
type AnalysisSubView = 'funnel' | 'channels' | 'cohorts';

export const GrowthOpsView: React.FC<GrowthOpsViewProps> = ({ currentPath, onNavigate, showToast }) => {
  // 4 大主 Tab: 增长总览 / 增长分析 / 增长问题 / 增长策略
  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    if (currentPath === 'growth-funnel' || currentPath === 'growth-cohort') return 'analysis';
    if (currentPath === 'growth-conversion-issues') return 'problems';
    if (currentPath === 'growth-strategy') return 'strategies';
    return 'overview';
  });

  // 增长分析下的 3 个视角: 转化漏斗 / 渠道对比 / 人群分析
  const [analysisView, setAnalysisView] = useState<AnalysisSubView>(() => {
    if (currentPath === 'growth-cohort') return 'cohorts';
    return 'funnel';
  });

  // 同步外部路由
  React.useEffect(() => {
    if (currentPath === 'growth-funnel') {
      setActiveTab('analysis');
      setAnalysisView('funnel');
    } else if (currentPath === 'growth-cohort') {
      setActiveTab('analysis');
      setAnalysisView('cohorts');
    } else if (currentPath === 'growth-conversion-issues') {
      setActiveTab('problems');
    } else if (currentPath === 'growth-strategy') {
      setActiveTab('strategies');
    } else if (currentPath === 'growth-overview' || currentPath === 'growth-operations') {
      setActiveTab('overview');
    }
  }, [currentPath]);

  // 数据集状态
  const [funnelData] = useState<FunnelStageData[]>(INITIAL_GROWTH_FUNNEL);
  const [healthAlerts] = useState<GrowthHealthAlert[]>(INITIAL_GROWTH_HEALTH_ALERTS);
  const [channelList] = useState<ChannelGrowthComparisonItem[]>(INITIAL_CHANNEL_GROWTH_LIST);
  const [cohortList] = useState<GrowthCohortItem[]>(INITIAL_GROWTH_COHORTS);
  const [problemList, setProblemList] = useState<GrowthProblemItem[]>(INITIAL_GROWTH_PROBLEMS);
  const [strategyList, setStrategyList] = useState<GrowthStrategyItem[]>(INITIAL_GROWTH_STRATEGIES);

  // 转化漏斗下钻维度 (渠道 / 国家 / Brand / 时间 / 用户类型)
  const [funnelDrillDim, setFunnelDrillDim] = useState<'ALL' | 'CHANNEL' | 'COUNTRY' | 'BRAND' | 'TIME' | 'USER_TYPE'>('ALL');
  const [funnelDrillValue, setFunnelDrillValue] = useState('ALL');

  // 增长问题筛选器
  const [probSearch, setProbSearch] = useState('');
  const [probTypeFilter, setProbTypeFilter] = useState<string>('ALL');
  const [probStatusFilter, setProbStatusFilter] = useState<string>('ALL');

  // 选中的问题详情/分析弹窗
  const [selectedProblem, setSelectedProblem] = useState<GrowthProblemItem | null>(null);
  // 新建/编辑策略弹窗
  const [editingStrategy, setEditingStrategy] = useState<Partial<GrowthStrategyItem> | null>(null);
  // 选中的人群包深入查看
  const [selectedCohort, setSelectedCohort] = useState<GrowthCohortItem | null>(null);

  // ---------------------------------------------------------------------------
  // 过滤：增长问题
  // ---------------------------------------------------------------------------
  const filteredProblems = useMemo(() => {
    return problemList.filter((p) => {
      if (probTypeFilter !== 'ALL' && p.type !== probTypeFilter) return false;
      if (probStatusFilter !== 'ALL' && p.status !== probStatusFilter) return false;
      if (probSearch.trim()) {
        const kw = probSearch.toLowerCase().trim();
        const match =
          p.id.toLowerCase().includes(kw) ||
          p.typeName.toLowerCase().includes(kw) ||
          p.targetObject.toLowerCase().includes(kw) ||
          p.metricName.toLowerCase().includes(kw) ||
          p.owner.toLowerCase().includes(kw) ||
          p.systemAnalysis.toLowerCase().includes(kw);
        if (!match) return false;
      }
      return true;
    });
  }, [problemList, probTypeFilter, probStatusFilter, probSearch]);

  // 状态流转操作：从问题生成增长策略
  const handleCreateStrategyFromProblem = (prob: GrowthProblemItem) => {
    const newStrat: GrowthStrategyItem = {
      id: `STRAT-202610-0${strategyList.length + 1}`,
      name: `针对【${prob.targetObject}】${prob.typeName}的改善策略`,
      sourceProblemId: prob.id,
      sourceProblemTitle: `${prob.typeName}: ${prob.metricName} ${prob.changeMagnitude}`,
      targetCohortName: prob.targetObject,
      targetMetricName: prob.metricName,
      currentValue: prob.currentValue,
      targetValue: `回升至基准 ${prob.baselineValue}`,
      strategyDesc: `针对系统分析（${prob.systemAnalysis}），实施定向价格激励与新手教程流程优化，提升关键节点转化率。`,
      incentiveOffer: '首单/复购加价 +1.5% 补贴券 + 专属 $3 体验现金红包',
      executionMethod: 'CHANNEL_PROMOTION_SYSTEM',
      executionPeriod: '2026-10-07 ~ 2026-10-21 (14天)',
      owner: prob.owner,
      status: 'SYNCED_TO_CHANNEL',
      syncedTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setStrategyList([newStrat, ...strategyList]);
    setProblemList((prev) =>
      prev.map((p) =>
        p.id === prob.id
          ? {
              ...p,
              status: 'EXECUTING',
              strategyId: newStrat.id,
              planId: `PLAN-202610-Q4-0${strategyList.length + 1}`
            }
          : p
      )
    );
    setSelectedProblem(null);
    setActiveTab('strategies');
    showToast(`✅ 策略【${newStrat.id}】已制定并自动同步发送至【渠道推广系统】！推广执行结果将自动回流。`);
  };

  // 状态流转操作：确认问题候选
  const handleConfirmProblem = (probId: string) => {
    setProblemList((prev) =>
      prev.map((p) => (p.id === probId ? { ...p, status: 'ANALYZING' } : p))
    );
    showToast(`已将问题候选 ${probId} 确认为正式增长问题，进入「分析中」`);
  };

  // 状态流转操作：从人群直接发起策略
  const handleCreateStrategyFromCohort = (cohort: GrowthCohortItem) => {
    setEditingStrategy({
      id: `STRAT-202610-0${strategyList.length + 1}`,
      name: `针对【${cohort.name}】的定向促活策略`,
      targetCohortName: cohort.name,
      targetMetricName: cohort.type === 'REG_NO_FIRST_ORDER' ? '首单转化率' : '30天复购率',
      currentValue: cohort.type === 'REG_NO_FIRST_ORDER' ? '0%' : `${cohort.percentage}%`,
      targetValue: '提升 15pp',
      strategyDesc: cohort.suggestedAction,
      incentiveOffer: '专属限时加价 1.2% + VIP审核绿色通道',
      executionMethod: 'CHANNEL_PROMOTION_SYSTEM',
      executionPeriod: '2026-10-07 ~ 2026-10-25 (18天)',
      owner: '增长运营团队',
      status: 'DRAFT'
    });
    setSelectedCohort(null);
  };

  // 状态徽标渲染
  const renderProblemStatusBadge = (status: GrowthProblemStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            待处理 (候选)
          </span>
        );
      case 'ANALYZING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="material-symbols-outlined text-[12px]">analytics</span>
            分析中
          </span>
        );
      case 'EXECUTING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="material-symbols-outlined text-[12px]">rocket_launch</span>
            执行中 (已联动)
          </span>
        );
      case 'VERIFYING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="material-symbols-outlined text-[12px]">fact_check</span>
            待验证 (回流中)
          </span>
        );
      case 'RECOVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="material-symbols-outlined text-[12px]">check_circle</span>
            已恢复正常
          </span>
        );
      case 'IGNORED':
        return <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-500">无需处理</span>;
      case 'CLOSED':
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">已关闭</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* 顶部 Header 说明 Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-xl">trending_up</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">增长运营</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                用户增长质量中枢
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              围绕“用户从哪里来、有没有注册、有没有首单、有没有复购”持续提升用户增长质量。
              平台重点管理增长结果、增长问题、目标用户和增长策略；具体推广链接、AI推广与佣金触达由渠道推广系统负责。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => {
              setActiveTab('problems');
              setProbStatusFilter('PENDING');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">troubleshoot</span>
            待处理问题 ({problemList.filter((p) => p.status === 'PENDING').length})
          </button>
          <button
            onClick={() => {
              setEditingStrategy({
                id: `STRAT-202610-0${strategyList.length + 1}`,
                name: '',
                targetCohortName: '注册 7 天未首单出卡新人 (COHORT-01)',
                targetMetricName: '首单转化率',
                currentValue: '22.0%',
                targetValue: '30.0%',
                strategyDesc: '',
                incentiveOffer: '首单加价 +1.5% 专属补贴',
                executionMethod: 'CHANNEL_PROMOTION_SYSTEM',
                executionPeriod: '7天',
                owner: '增长运营组',
                status: 'DRAFT'
              });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            新建增长策略
          </button>
        </div>
      </div>

      {/* 四大主 Tab 导航栏 (统一标准风格) */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          {
            id: 'overview',
            label: '增长总览 (Overview)',
            icon: 'dashboard'
          },
          {
            id: 'analysis',
            label: '增长分析 (Analysis)',
            icon: 'insights'
          },
          {
            id: 'problems',
            label: '增长问题 (Problems)',
            icon: 'report_problem',
            badge: problemList.filter((p) => p.status !== 'RECOVERED' && p.status !== 'CLOSED').length,
            badgeClass: 'bg-rose-100 text-rose-700'
          },
          {
            id: 'strategies',
            label: '增长策略 (Strategies)',
            icon: 'psychology',
            badge: strategyList.length,
            badgeClass: 'bg-blue-100 text-blue-800'
          }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3.5 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                isActive
                  ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-blue-100 text-blue-800' : tab.badgeClass
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </section>

      {/* ======================================================================= */}
      {/* TAB 1: 增长总览 (.2 核心指标 + 漏斗 + 健康度自动诊断)           */}
      {/* ======================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* 顶部核心指标：重点突出「新增用户 ➔ 首单 ➔ 复购 ➔ GMV」 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 1. 新增用户 */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-medium">新注册用户 (拉新)</span>
                <span className="material-symbols-outlined text-blue-600 text-base">person_add</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">30,000</div>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-slate-500">访问 ➔ 注册率: <strong className="text-blue-700">30.0%</strong></span>
                <span className="text-emerald-600 font-semibold font-mono">环比 +12.4%</span>
              </div>
            </div>

            {/* 2. 首单用户 */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-medium">首单用户 (转化)</span>
                <span className="material-symbols-outlined text-emerald-600 text-base">shopping_cart_checkout</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">9,000</div>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-slate-500">首单率: <strong className="text-emerald-700">30.0%</strong> (均周期 1.8天)</span>
                <span className="text-rose-600 font-semibold font-mono">-4.2% 预警</span>
              </div>
            </div>

            {/* 3. 复购用户 */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-medium">复购用户 (留存)</span>
                <span className="material-symbols-outlined text-indigo-600 text-base">repeat</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">4,500</div>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-slate-500">复购率: <strong className="text-indigo-700">50.0%</strong> (均周期 8.4天)</span>
                <span className="text-emerald-600 font-semibold font-mono">环比 +3.1%</span>
              </div>
            </div>

            {/* 4. 增长 GMV */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-medium">新用户 GMV / 人均贡献</span>
                <span className="material-symbols-outlined text-amber-600 text-base">paid</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">$1,420,000</div>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-slate-500">人均 GMV: <strong className="text-amber-700 font-mono">$157.8</strong></span>
                <span className="text-emerald-600 font-semibold font-mono">贡献占比 38%</span>
              </div>
            </div>
          </div>

          {/* 6 大核心维度微缩指标矩阵 (获客、注册、首单、复购、活跃、价值) */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-sm">tune</span>
                增长 6 大核心维度基线监控矩阵
              </span>
              <span className="text-[11px] font-normal text-slate-400">口径严格按照 .2 规范计算</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block">1. 获客阶段</span>
                <div className="font-bold text-slate-900 mt-0.5">100,000 线索</div>
                <div className="text-[11px] text-slate-500 mt-0.5">活跃渠道: 24 个</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block">2. 注册阶段</span>
                <div className="font-bold text-slate-900 mt-0.5">30,000 用户</div>
                <div className="text-[11px] text-blue-600 font-semibold mt-0.5">注册率 30.0%</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block">3. 首单阶段</span>
                <div className="font-bold text-slate-900 mt-0.5">9,000 首单</div>
                <div className="text-[11px] text-slate-600 mt-0.5">首单转化率 30.0%</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block">4. 复购阶段</span>
                <div className="font-bold text-slate-900 mt-0.5">4,500 复购</div>
                <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">二单复购率 50.0%</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block">5. 活跃状态</span>
                <div className="font-bold text-slate-900 mt-0.5">3,200 持续活跃</div>
                <div className="text-[11px] text-slate-500 mt-0.5">沉默 5,600 / 流失 8,200</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block">6. 价值沉淀</span>
                <div className="font-bold text-slate-900 mt-0.5">$1.42M GMV</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">客单价 $157.8</div>
              </div>
            </div>
          </div>

          {/* 全生命周期核心漏斗图 (访问/线索 ➔ 注册 ➔ 首单 ➔ 复购 ➔ 持续活跃) */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-base">filter_alt</span>
                <span className="font-bold text-sm text-white">平台用户增长核心漏斗推进链</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                访问/线索 ➔ 注册 ➔ 首单 ➔ 复购 ➔ 持续活跃
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-center font-mono">
              {funnelData.map((stage, idx) => (
                <div
                  key={stage.stageKey}
                  className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans mb-1">
                    <span>{idx + 1}. {stage.stageName}</span>
                    <span className="text-emerald-400">{stage.growthMoM}</span>
                  </div>

                  <div className="text-lg font-black text-white my-1">
                    {stage.count.toLocaleString()}
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300 bg-black/30 p-1.5 rounded">
                    <div className="flex justify-between">
                      <span className="text-slate-400">环节转化率:</span>
                      <span className="font-bold text-blue-300">{stage.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">流失用户:</span>
                      <span className="text-rose-400">{stage.churnCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 增长健康度自动诊断卡片 (系统自动标记异常，点击直达问题与分析) */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-base">health_and_safety</span>
                <h3 className="font-bold text-slate-900 text-sm">增长健康度智能诊断 (系统自动识别波动)</h3>
              </div>
              <span className="text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-semibold border border-rose-200">
                检出 {healthAlerts.length} 项需关注异常
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {healthAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          alert.severity === 'HIGH' ? 'bg-rose-500 animate-ping' : 'bg-amber-500'
                        }`}
                      ></span>
                      <strong className="text-xs text-slate-900">{alert.title}</strong>
                    </div>
                    <span className="font-mono text-rose-600 font-bold text-xs">{alert.changeRate}</span>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed bg-white p-2 rounded border border-slate-100">
                    <div><strong>指标表现:</strong> {alert.metric}</div>
                    <div className="mt-0.5 text-slate-500"><strong>受影响范围:</strong> {alert.affectedScope}</div>
                    <div className="mt-1 text-emerald-700 font-medium">💡 建议操作: {alert.suggestedAction}</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400 font-mono">侦测时间: {alert.detectedAt}</span>
                    <button
                      onClick={() => {
                        if (alert.targetTab === 'problems') {
                          setActiveTab('problems');
                          if (alert.drilldownParam) setProbSearch(alert.drilldownParam);
                        } else {
                          setActiveTab('analysis');
                          setAnalysisView('channels');
                        }
                        showToast(`已直接穿透至【${alert.targetTab === 'problems' ? '增长问题' : '增长分析'}】`);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                    >
                      <span>深入排查与制定策略</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 2: 增长分析 (.3 转化漏斗 / 渠道对比 / 人群分析)             */}
      {/* ======================================================================= */}
      {activeTab === 'analysis' && (
        <div className="space-y-4">
          {/* 子视角切换 */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setAnalysisView('funnel')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                analysisView === 'funnel'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">filter_alt</span>
              <span>A. 转化漏斗 (用户到底掉在哪一步)</span>
            </button>

            <button
              onClick={() => setAnalysisView('channels')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                analysisView === 'channels'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">compare_arrows</span>
              <span>B. 渠道对比 (识别假象大流量渠道)</span>
            </button>

            <button
              onClick={() => setAnalysisView('cohorts')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                analysisView === 'cohorts'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">groups</span>
              <span>C. 人群分析 (8大用户经营统一人群)</span>
            </button>
          </div>

          {/* 视角 A: 转化漏斗下钻分析 */}
          {analysisView === 'funnel' && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">转化漏斗逐层流失剖析</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    明确每一层的数量、转化率、流失量与流失率，回答“用户到底掉在哪一步”
                  </p>
                </div>

                {/* 下钻维度选择器 */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-500 font-medium">下钻维度:</span>
                  <select
                    value={funnelDrillDim}
                    onChange={(e) => {
                      setFunnelDrillDim(e.target.value as any);
                      setFunnelDrillValue('ALL');
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                  >
                    <option value="ALL">全部范围 (整体大盘)</option>
                    <option value="CHANNEL">按渠道下钻 (Channel)</option>
                    <option value="COUNTRY">按国家下钻 (Country)</option>
                    <option value="BRAND">按卡种下钻 (Brand)</option>
                    <option value="TIME">按时间周期下钻 (Time)</option>
                    <option value="USER_TYPE">按用户类型 (新客/老客)</option>
                  </select>

                  {funnelDrillDim === 'CHANNEL' && (
                    <select
                      value={funnelDrillValue}
                      onChange={(e) => setFunnelDrillValue(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                    >
                      <option value="ALL">全部渠道</option>
                      <option value="CH-KOL-01">YouTube KOL 渠道</option>
                      <option value="CH-MEDIA-04">TikTok 短视频信息流</option>
                      <option value="CH-COMM-02">Discord 跨境公会</option>
                    </select>
                  )}
                  {funnelDrillDim === 'COUNTRY' && (
                    <select
                      value={funnelDrillValue}
                      onChange={(e) => setFunnelDrillValue(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                    >
                      <option value="ALL">全部国家</option>
                      <option value="US">🇺🇸 美国 (US)</option>
                      <option value="CA">🇨🇦 加拿大 (CA)</option>
                      <option value="UK">🇬🇧 英国 (UK)</option>
                    </select>
                  )}
                  {funnelDrillDim === 'BRAND' && (
                    <select
                      value={funnelDrillValue}
                      onChange={(e) => setFunnelDrillValue(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                    >
                      <option value="ALL">全部卡种</option>
                      <option value="Apple">Apple Gift Card</option>
                      <option value="Steam">Steam Global</option>
                      <option value="Sephora">Sephora</option>
                    </select>
                  )}
                </div>
              </div>

              {/* 漏斗层级表格 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-3 px-3">漏斗环节 (Stage)</th>
                      <th className="py-3 px-3 font-mono">用户规模 (Count)</th>
                      <th className="py-3 px-3">环节转化率 (Step Rate)</th>
                      <th className="py-3 px-3 font-mono text-rose-600">流失用户数 (Churned)</th>
                      <th className="py-3 px-3 text-rose-600">环节流失率</th>
                      <th className="py-3 px-3">趋势环比</th>
                      <th className="py-3 px-3 text-right">针对性动作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {funnelData.map((layer, idx) => (
                      <tr key={layer.stageKey} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 inline-flex items-center justify-center text-xs mr-2">
                            {idx + 1}
                          </span>
                          {layer.stageName}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800 text-sm">
                          {layer.count.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-bold text-blue-700 font-mono">
                          {layer.conversionRate}%
                        </td>
                        <td className="py-3 px-3 font-mono text-rose-600 font-semibold">
                          {layer.churnCount > 0 ? layer.churnCount.toLocaleString() : '-'}
                        </td>
                        <td className="py-3 px-3 font-mono text-rose-600">
                          {layer.churnRate > 0 ? `${layer.churnRate}%` : '-'}
                        </td>
                        <td className="py-3 px-3 font-semibold text-emerald-600">{layer.growthMoM}</td>
                        <td className="py-3 px-3 text-right">
                          {layer.churnCount > 0 && (
                            <button
                              onClick={() => {
                                setActiveTab('problems');
                                setProbSearch(layer.stageName);
                                showToast(`已检索【${layer.stageName}】相关增长问题`);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              查验流失问题
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 视角 B: 渠道对比分析 (强调识别假象优质渠道) */}
          {analysisView === 'channels' && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start gap-3 bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-xs text-blue-900">
                <span className="material-symbols-outlined text-blue-600 text-lg mt-0.5">info</span>
                <div className="leading-relaxed">
                  <span className="font-bold">渠道对比定位说明：</span>
                  渠道仅作为平台增长分析的一个维度，不独立建设冗余的“渠道运营”。
                  通过线索、注册率、首单率、客单价、复购率、GMV、售后率与风险率综合比较，
                  可以精准识别“渠道带来很多注册，但首单和复购极差”的假象大流量渠道。具体推广执行仍然回到渠道推广系统。
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-3 px-3">渠道名称 / 类型</th>
                      <th className="py-3 px-2 font-mono">线索数</th>
                      <th className="py-3 px-2 font-mono">注册率</th>
                      <th className="py-3 px-2 font-mono text-emerald-700">首单率</th>
                      <th className="py-3 px-2 font-mono">客单价 (ARPU)</th>
                      <th className="py-3 px-2 font-mono text-indigo-700">复购率</th>
                      <th className="py-3 px-2 font-mono font-bold text-slate-900">GMV</th>
                      <th className="py-3 px-2 font-mono text-rose-600">售后率</th>
                      <th className="py-3 px-2 font-mono text-rose-600">风险率</th>
                      <th className="py-3 px-3">质量诊断判定</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {channelList.map((ch) => (
                      <tr key={ch.channelId} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{ch.channelName}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {ch.channelId} · {ch.channelType}
                          </div>
                        </td>
                        <td className="py-3 px-2 font-mono">{ch.leadsCount.toLocaleString()}</td>
                        <td className="py-3 px-2 font-mono font-medium">{ch.regRate}%</td>
                        <td className="py-3 px-2 font-mono font-bold text-emerald-700">{ch.firstOrderRate}%</td>
                        <td className="py-3 px-2 font-mono">${ch.arpu.toFixed(1)}</td>
                        <td className="py-3 px-2 font-mono font-bold text-indigo-700">{ch.repurchaseRate}%</td>
                        <td className="py-3 px-2 font-mono font-black text-slate-900">
                          ${ch.gmv.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 font-mono text-rose-600 font-semibold">{ch.aftersaleRate}%</td>
                        <td className="py-3 px-2 font-mono text-rose-600 font-semibold">{ch.riskRate}%</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              ch.qualityTag === '优质高转化'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ch.qualityTag === '假象大流量'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {ch.qualityTag}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-1 max-w-xs leading-tight">
                            {ch.qualityReason}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 视角 C: 8 大用户经营统一人群分析 */}
          {analysisView === 'cohorts' && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">8 大用户经营统一人群包</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    围绕用户经营状态划分，展示人数、占比、GMV、客单价与卡种来源，支持一键形成增长策略
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  覆盖全部 {cohortList.reduce((s, c) => s + c.userCount, 0).toLocaleString()} 活跃/沉睡用户
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-3 px-3">人群名称 (Cohort)</th>
                      <th className="py-3 px-2 font-mono">人数规模</th>
                      <th className="py-3 px-2 font-mono">占比</th>
                      <th className="py-3 px-2 font-mono">贡献 GMV</th>
                      <th className="py-3 px-2 font-mono">客单价</th>
                      <th className="py-3 px-3">最近交易周期</th>
                      <th className="py-3 px-3">主要卡种 / 来源</th>
                      <th className="py-3 px-3 text-right">生成增长策略</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cohortList.map((cohort) => (
                      <tr key={cohort.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{cohort.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{cohort.definition}</div>
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-blue-700">
                          {cohort.userCount.toLocaleString()} 人
                        </td>
                        <td className="py-3 px-2 font-mono font-semibold">{cohort.percentage}%</td>
                        <td className="py-3 px-2 font-mono font-bold text-slate-900">
                          ${cohort.totalGmv.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 font-mono">${cohort.arpu.toFixed(1)}</td>
                        <td className="py-3 px-3 text-[11px] text-slate-600">{cohort.lastTransPeriod}</td>
                        <td className="py-3 px-3 text-[11px]">
                          <div className="text-slate-800 font-medium">{cohort.primaryBrands.join(', ')}</div>
                          <div className="text-slate-400 mt-0.5">{cohort.primarySources.join(' / ')}</div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleCreateStrategyFromCohort(cohort)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                          >
                            制定策略
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 3: 增长问题 (.4 闭环全流程与状态机)                         */}
      {/* ======================================================================= */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          {/* 流程说明条 */}
          <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-amber-400 text-base">alt_route</span>
              <span>增长问题闭环全链路：</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-300 flex-wrap">
              <span>指标异常</span>
              <span>➔</span>
              <span>系统识别</span>
              <span>➔</span>
              <span className="text-amber-300 font-bold">形成问题候选</span>
              <span>➔</span>
              <span className="text-blue-300 font-bold">运营确认</span>
              <span>➔</span>
              <span>正式增长问题</span>
              <span>➔</span>
              <span>分析原因</span>
              <span>➔</span>
              <span className="text-emerald-300 font-bold">制定策略</span>
              <span>➔</span>
              <span>创建运营计划</span>
            </div>
          </div>

          {/* 筛选过滤工具条 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative flex-1 min-w-[240px]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="搜索 Problem ID / 问题类型 / 对象 / 责任人 / 原因..."
                value={probSearch}
                onChange={(e) => setProbSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>

            {/* 问题类型 */}
            <select
              value={probTypeFilter}
              onChange={(e) => setProbTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="ALL">全部问题类型 (Type)</option>
              <option value="FIRST_ORDER_ANOMALY">首单异常</option>
              <option value="REPURCHASE_ANOMALY">复购异常</option>
              <option value="USER_QUALITY_ANOMALY">用户质量异常</option>
              <option value="GMV_ANOMALY">GMV异常</option>
              <option value="REGISTRATION_ANOMALY">注册异常</option>
              <option value="ACQUISITION_ANOMALY">拉新异常</option>
              <option value="AFTERSALE_ANOMALY">售后异常</option>
              <option value="RISK_ANOMALY">风险异常</option>
            </select>

            {/* 状态 */}
            <select
              value={probStatusFilter}
              onChange={(e) => setProbStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="ALL">全部流转状态</option>
              <option value="PENDING">待处理 (问题候选)</option>
              <option value="ANALYZING">分析中</option>
              <option value="EXECUTING">执行中</option>
              <option value="VERIFYING">待验证</option>
              <option value="RECOVERED">已恢复</option>
              <option value="CLOSED">已关闭</option>
            </select>

            <button
              onClick={() => {
                setProbSearch('');
                setProbTypeFilter('ALL');
                setProbStatusFilter('ALL');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              重置
            </button>
          </div>

          {/* 增长问题列表表格 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-3">Problem ID / 类型</th>
                    <th className="py-3 px-3">问题对象 (Target Object)</th>
                    <th className="py-3 px-3">指标 / 基线 / 当前表现</th>
                    <th className="py-3 px-2 font-mono text-rose-600">变化幅度</th>
                    <th className="py-3 px-2 font-mono">影响用户 / 影响GMV</th>
                    <th className="py-3 px-3">负责人 (Owner)</th>
                    <th className="py-3 px-3">状态 (Status)</th>
                    <th className="py-3 px-3">关联策略 / 计划</th>
                    <th className="py-3 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProblems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">
                          task_alt
                        </span>
                        暂无符合条件的增长问题
                      </td>
                    </tr>
                  ) : (
                    filteredProblems.map((prob) => (
                      <tr key={prob.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-900">{prob.id}</div>
                          <span className="inline-block px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold mt-0.5">
                            {prob.typeName}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-medium text-slate-800">{prob.targetObject}</div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5" title={prob.systemAnalysis}>
                            {prob.systemAnalysis}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{prob.metricName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            基线 {prob.baselineValue} ➔ 当前 <strong className="text-slate-900">{prob.currentValue}</strong>
                          </div>
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-rose-600 text-xs">
                          {prob.changeMagnitude}
                        </td>
                        <td className="py-3 px-2 font-mono">
                          <div>{prob.affectedUsers.toLocaleString()} 人</div>
                          <div className="text-rose-600 font-semibold text-[11px]">
                            ${(prob.affectedGmv / 1000).toFixed(1)}k GMV
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">{prob.owner}</td>
                        <td className="py-3 px-3">{renderProblemStatusBadge(prob.status)}</td>
                        <td className="py-3 px-3 font-mono text-[11px]">
                          {prob.strategyId ? (
                            <div className="text-blue-600 font-semibold">{prob.strategyId}</div>
                          ) : (
                            <span className="text-slate-400">未关联策略</span>
                          )}
                          {prob.planId && <div className="text-slate-500 text-[10px]">{prob.planId}</div>}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {prob.status === 'PENDING' && (
                              <button
                                onClick={() => handleConfirmProblem(prob.id)}
                                className="px-2 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                              >
                                确认候选
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedProblem(prob)}
                              className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              分析详情
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 4: 增长策略 (.5 对接渠道推广系统与执行边界)                 */}
      {/* ======================================================================= */}
      {activeTab === 'strategies' && (
        <div className="space-y-4">
          {/* 策略执行边界清晰说明卡片 */}
          <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-4 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-base">hub</span>
                <span className="font-bold text-sm">增长策略执行与协同边界架构 (Strategy Execution Boundary)</span>
              </div>
              <span className="text-[11px] text-slate-300 font-mono">平台作业端专注策略制定与指标验证</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-center text-[11px] font-mono">
              <div className="p-2 bg-white/10 rounded-lg">
                <span className="text-blue-300 block font-sans font-bold">1. 平台运营</span>
                <span className="text-white mt-0.5 block">制定增长策略</span>
              </div>
              <div className="p-2 bg-white/10 rounded-lg">
                <span className="text-blue-300 block font-sans font-bold">2. 人群圈选</span>
                <span className="text-white mt-0.5 block">确定目标人群</span>
              </div>
              <div className="p-2 bg-white/10 rounded-lg">
                <span className="text-blue-300 block font-sans font-bold">3. 权益配置</span>
                <span className="text-white mt-0.5 block">加价券/补贴包</span>
              </div>
              <div className="p-2 bg-indigo-500/30 rounded-lg border border-indigo-400/40">
                <span className="text-indigo-300 block font-sans font-bold">4. 跨系统推送</span>
                <span className="text-white mt-0.5 block font-bold">发给渠道推广系统</span>
              </div>
              <div className="p-2 bg-indigo-500/30 rounded-lg border border-indigo-400/40">
                <span className="text-indigo-300 block font-sans font-bold">5. 外部触达</span>
                <span className="text-white mt-0.5 block">推广员/AI/Push</span>
              </div>
              <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                <span className="text-emerald-300 block font-sans font-bold">6. 结果回流</span>
                <span className="text-white mt-0.5 block">交易/转化回流</span>
              </div>
              <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                <span className="text-emerald-300 block font-sans font-bold">7. 效果闭环</span>
                <span className="text-emerald-300 mt-0.5 block font-bold">平台验证指标</span>
              </div>
            </div>
          </div>

          {/* 策略列表 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs">当前活跃与执行中的增长策略 ({strategyList.length})</h3>
              <button
                onClick={() => {
                  showToast('已向所有对接的【渠道推广系统】批量重新同步最新加价权益与触达策略！');
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">sync</span>
                批量同步渠道推广系统
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-3">Strategy ID / 策略名称</th>
                    <th className="py-3 px-3">来源问题 (Problem)</th>
                    <th className="py-3 px-3">目标人群 (Target Cohort)</th>
                    <th className="py-3 px-3 font-mono">目标指标 / 目标值</th>
                    <th className="py-3 px-3">活动/权益 (Incentive)</th>
                    <th className="py-3 px-2 text-center">执行方式</th>
                    <th className="py-3 px-2 font-mono">执行周期</th>
                    <th className="py-3 px-3">流转状态 / 回流达标</th>
                    <th className="py-3 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {strategyList.map((strat) => (
                    <tr key={strat.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{strat.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{strat.id}</div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-mono text-blue-600 font-medium">{strat.sourceProblemId}</div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {strat.sourceProblemTitle}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px]">
                          {strat.targetCohortName}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <div className="text-slate-500 text-[11px]">指标: {strat.targetMetricName}</div>
                        <div className="font-bold text-emerald-700 text-xs">
                          {strat.currentValue} ➔ {strat.targetValue}
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="text-slate-800 font-medium text-[11px]">{strat.incentiveOffer}</div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{strat.strategyDesc}</div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold">
                          {strat.executionMethod === 'CHANNEL_PROMOTION_SYSTEM'
                            ? '渠道推广系统'
                            : strat.executionMethod === 'IN_APP_PRICE_BOOST'
                            ? '站内加价券'
                            : strat.executionMethod === 'VIP_CS_PHONE_CALL'
                            ? 'VIP 1对1'
                            : '自动化Push'}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-[11px] text-slate-600">{strat.executionPeriod}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            strat.status === 'CONVERGED_SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : strat.status === 'EXECUTING'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {strat.status === 'CONVERGED_SUCCESS'
                            ? '回流已达标'
                            : strat.status === 'EXECUTING'
                            ? '推广执行中'
                            : '已同步推广系统'}
                        </span>
                        {strat.verificationResult && (
                          <div className="text-[11px] font-mono text-emerald-700 font-semibold mt-1">
                            {strat.verificationResult}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            showToast(`已重新将策略【${strat.id}】与目标人群名单推送给渠道推广系统`);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          同步推送
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 弹窗 1: 增长问题深度分析与立项弹窗                                      */}
      {/* ======================================================================= */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600">troubleshoot</span>
                <h3 className="text-base font-bold text-slate-900">增长问题深度分析与策略立项</h3>
                <span className="px-2 py-0.5 rounded font-mono text-xs bg-slate-100 text-slate-700">
                  {selectedProblem.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedProblem(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">问题类型 / 对象</span>
                <span className="font-bold text-slate-900 text-sm block">{selectedProblem.typeName}</span>
                <span className="text-slate-600 text-[11px] mt-0.5">{selectedProblem.targetObject}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">指标波动幅度</span>
                <span className="font-mono font-bold text-rose-600 text-sm block">
                  {selectedProblem.changeMagnitude}
                </span>
                <span className="text-slate-500 text-[11px]">
                  基线 {selectedProblem.baselineValue} ➔ 当前 {selectedProblem.currentValue}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">影响范围估算</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedProblem.affectedUsers.toLocaleString()} 用户 / ${(selectedProblem.affectedGmv / 1000).toFixed(1)}k GMV
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">问题流转状态 / 负责人</span>
                <div className="flex items-center gap-2 mt-0.5">
                  {renderProblemStatusBadge(selectedProblem.status)}
                  <span className="font-semibold text-slate-800">{selectedProblem.owner}</span>
                </div>
              </div>
            </div>

            {/* 系统分析与初步原因 */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-950 block mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-blue-600 text-sm">smart_toy</span>
                  系统自动发现的主要变化 (System Analysis)
                </span>
                <p className="text-blue-900 leading-relaxed">{selectedProblem.systemAnalysis}</p>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-950 block mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-amber-600 text-sm">verified</span>
                  运营确认初步原因 (Preliminary Cause)
                </span>
                <p className="text-amber-900 leading-relaxed">{selectedProblem.preliminaryCause}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-400 font-mono">最近更新: {selectedProblem.updatedAt}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProblem(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  暂不处理
                </button>
                <button
                  onClick={() => handleCreateStrategyFromProblem(selectedProblem)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">send</span>
                  <span>立项并生成增长策略</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 弹窗 2: 新建/编辑增长策略弹窗                                          */}
      {/* ======================================================================= */}
      {editingStrategy && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">psychology</span>
                <h3 className="text-base font-bold text-slate-900">定义增长策略 (对谁 ➔ 为什么 ➔ 做什么)</h3>
              </div>
              <button
                onClick={() => setEditingStrategy(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">策略名称</label>
                <input
                  type="text"
                  value={editingStrategy.name || ''}
                  onChange={(e) => setEditingStrategy({ ...editingStrategy, name: e.target.value })}
                  placeholder="例如：注册未首单用户定向首单加价转化策略"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">目标人群</label>
                  <input
                    type="text"
                    value={editingStrategy.targetCohortName || ''}
                    onChange={(e) => setEditingStrategy({ ...editingStrategy, targetCohortName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">目标指标 / 目标值</label>
                  <input
                    type="text"
                    value={editingStrategy.targetValue || ''}
                    onChange={(e) => setEditingStrategy({ ...editingStrategy, targetValue: e.target.value })}
                    placeholder="例如：首单率提升至 30%"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">活动/权益补贴 (首单加价/红包/积分)</label>
                <input
                  type="text"
                  value={editingStrategy.incentiveOffer || ''}
                  onChange={(e) => setEditingStrategy({ ...editingStrategy, incentiveOffer: e.target.value })}
                  placeholder="例如：首单立享 +1.5% 增值补贴 + 专属 $3 体验红包"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">策略具体内容</label>
                <textarea
                  rows={3}
                  value={editingStrategy.strategyDesc || ''}
                  onChange={(e) => setEditingStrategy({ ...editingStrategy, strategyDesc: e.target.value })}
                  placeholder="详细描述准备采取什么运营动作..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">执行方式</label>
                  <select
                    value={editingStrategy.executionMethod || 'CHANNEL_PROMOTION_SYSTEM'}
                    onChange={(e) =>
                      setEditingStrategy({
                        ...editingStrategy,
                        executionMethod: e.target.value as any
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="CHANNEL_PROMOTION_SYSTEM">发送至渠道推广系统 (外部触达)</option>
                    <option value="IN_APP_PRICE_BOOST">站内定向加价/保价券</option>
                    <option value="PUSH_AND_EMAIL_AUTOMATION">自动化 Push / 邮件触达</option>
                    <option value="VIP_CS_PHONE_CALL">VIP 专属客服 1 对 1 电联</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">执行周期</label>
                  <input
                    type="text"
                    value={editingStrategy.executionPeriod || '7天'}
                    onChange={(e) => setEditingStrategy({ ...editingStrategy, executionPeriod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingStrategy(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const newS: GrowthStrategyItem = {
                    id: editingStrategy.id || `STRAT-202610-0${strategyList.length + 1}`,
                    name: editingStrategy.name || '未命名增长策略',
                    sourceProblemId: editingStrategy.sourceProblemId || 'PROB-AUTO',
                    sourceProblemTitle: editingStrategy.sourceProblemTitle || '运营手动立项',
                    targetCohortName: editingStrategy.targetCohortName || '全量出卡用户',
                    targetMetricName: editingStrategy.targetMetricName || '首单转化率',
                    currentValue: editingStrategy.currentValue || '22%',
                    targetValue: editingStrategy.targetValue || '30%',
                    strategyDesc: editingStrategy.strategyDesc || '',
                    incentiveOffer: editingStrategy.incentiveOffer || '首单加价补贴',
                    executionMethod: editingStrategy.executionMethod || 'CHANNEL_PROMOTION_SYSTEM',
                    executionPeriod: editingStrategy.executionPeriod || '14天',
                    owner: editingStrategy.owner || '增长运营团队',
                    status: 'SYNCED_TO_CHANNEL',
                    syncedTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
                  };
                  setStrategyList([newS, ...strategyList]);
                  setEditingStrategy(null);
                  setActiveTab('strategies');
                  showToast(`✅ 增长策略【${newS.id}】已保存并同步推送至【渠道推广系统】！`);
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                保存并同步推广系统
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
