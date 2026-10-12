import React, { useState, useMemo } from 'react';
import { NavPath } from '../types';
import {
  OperationPlanItem,
  PlanStatus,
  PlanActionItem,
  VerificationResult
} from './operations/planTypes';
import { INITIAL_OPERATION_PLANS } from './operations/mockPlanData';

interface OperationPlansViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
  showToast?: (msg: string) => void;
}

type TabType = 'IN_PROGRESS' | 'VERIFYING' | 'COMPLETED' | 'ALL';

export const OperationPlansView: React.FC<OperationPlansViewProps> = ({
  currentPath,
  onNavigate,
  showToast
}) => {
  // 4 大 Tab: 进行中 / 待验证 / 已完成 / 全部计划
  const [activeTab, setActiveTab] = useState<TabType>('IN_PROGRESS');

  // 路由同步
  React.useEffect(() => {
    if (currentPath === 'plan-verification') {
      setActiveTab('VERIFYING');
    } else if (currentPath === 'operation-plans' || currentPath === 'plan-management') {
      setActiveTab('IN_PROGRESS');
    }
  }, [currentPath]);

  // 数据集状态
  const [planList, setPlanList] = useState<OperationPlanItem[]>(INITIAL_OPERATION_PLANS);
  // 当前选中的计划详情 (展现 6 大区域)
  const [selectedPlan, setSelectedPlan] = useState<OperationPlanItem>(INITIAL_OPERATION_PLANS[0]);
  // 筛选搜索
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  // 新建/编辑计划弹窗
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState<Partial<OperationPlanItem>>({
    id: `PLAN-202610-0${planList.length + 1}`,
    name: '',
    owner: '增长运营专家 (李明)',
    participants: ['运营专员', '技术支持'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-10-30',
    status: 'IN_PROGRESS',
    priority: 'P1_HIGH',
    sourceCategory: 'GROWTH_PROBLEM',
    sourceCategoryName: '增长问题',
    sourceProblemTitle: '',
    affectedObject: '',
    currentProblemMetric: '',
    normalBaselineMetric: '',
    problemCause: '',
    expectedBusinessImpact: '',
    targetMetricName: '',
    baselineValue: 20.0,
    targetValue: 30.0,
    currentValue: 20.0,
    unit: '%',
    actionItems: [
      {
        id: 'ACT-NEW-1',
        actionTitle: '优化目标人群权益配置与定向补贴',
        owner: '李明',
        executorParty: '平台运营中枢',
        startDate: '2026-10-07',
        dueDate: '2026-10-10',
        status: 'IN_PROGRESS'
      }
    ],
    metricTrend: [],
    verificationCycle: '计划结束后持续观测 7 天'
  });

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
  };

  // ---------------------------------------------------------------------------
  // 过滤：计划列表
  // ---------------------------------------------------------------------------
  const filteredPlans = useMemo(() => {
    return planList.filter((p) => {
      // Tab 过滤
      if (activeTab === 'IN_PROGRESS' && p.status !== 'IN_PROGRESS' && p.status !== 'ADJUSTING') return false;
      if (activeTab === 'VERIFYING' && p.status !== 'VERIFYING') return false;
      if (activeTab === 'COMPLETED' && p.status !== 'COMPLETED') return false;

      // 来源分类过滤
      if (sourceFilter !== 'ALL' && p.sourceCategory !== sourceFilter) return false;

      // 关键词搜索
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase().trim();
        const match =
          p.id.toLowerCase().includes(kw) ||
          p.name.toLowerCase().includes(kw) ||
          p.owner.toLowerCase().includes(kw) ||
          p.affectedObject.toLowerCase().includes(kw) ||
          p.targetMetricName.toLowerCase().includes(kw);
        if (!match) return false;
      }
      return true;
    });
  }, [planList, activeTab, sourceFilter, searchKeyword]);

  // 状态机流转：推进到待验证
  const handleMoveToVerifying = (planId: string) => {
    setPlanList((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              status: 'VERIFYING'
            }
          : p
      )
    );
    if (selectedPlan && selectedPlan.id === planId) {
      setSelectedPlan({ ...selectedPlan, status: 'VERIFYING' });
    }
    notify(`计划【${planId}】行动项已基本完成，正式转入【待验证】阶段！`);
  };

  // 状态机流转：效果验证判定
  const handleVerifyResult = (planId: string, result: VerificationResult) => {
    const isSuccess = result === 'ACHIEVED';
    const newStatus: PlanStatus = isSuccess ? 'COMPLETED' : 'ADJUSTING';

    const updated = planList.map((p) =>
      p.id === planId
        ? {
            ...p,
            status: newStatus,
            verificationResult: result,
            verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            verificationSummary: isSuccess
              ? `指标已由 ${p.baselineValue}${p.unit} 恢复提升至 ${p.currentValue}${p.unit} (达标 ${p.targetValue}${p.unit})，正式归档闭环！`
              : `指标当前为 ${p.currentValue}${p.unit}，未达到目标 ${p.targetValue}${p.unit}，转入【调整中】继续追加经营策略！`
          }
        : p
    );

    setPlanList(updated);
    const curr = updated.find((p) => p.id === planId);
    if (curr) setSelectedPlan(curr);

    notify(
      isSuccess
        ? `🎉 计划【${planId}】经系统指标复核判定：【达标已完成】！`
        : `⚠️ 计划【${planId}】经复核【未达标】，已转入【调整中】，请追加新行动项！`
    );
  };

  // 切换行动项完成状态
  const handleToggleActionStatus = (actionId: string) => {
    if (!selectedPlan) return;
    const updatedActions = selectedPlan.actionItems.map((act) =>
      act.id === actionId
        ? {
            ...act,
            status: (act.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED') as any
          }
        : act
    );

    const updatedPlan = { ...selectedPlan, actionItems: updatedActions };
    setSelectedPlan(updatedPlan);
    setPlanList((prev) => prev.map((p) => (p.id === selectedPlan.id ? updatedPlan : p)));
    notify(`已更新行动项状态`);
  };

  // 渲染计划状态徽标
  const renderStatusBadge = (status: PlanStatus) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            进行中 (In Progress)
          </span>
        );
      case 'VERIFYING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="material-symbols-outlined text-[13px]">hourglass_top</span>
            待验证 (Verifying)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            已完成 (达标闭环)
          </span>
        );
      case 'ADJUSTING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="material-symbols-outlined text-[13px]">tune</span>
            调整中 (未达标优化)
          </span>
        );
      case 'CANCELLED':
      case 'CLOSED':
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-4 text-xs antialiased text-slate-800">
      {/* 顶部 Header 说明 Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-xl">assignment</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">运营计划</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                经营改善推进中枢
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              把“发现问题”真正推进到“经营结果得到改善”。
              <strong>它不是项目管理工具/Jira，只管理经营问题有没有真正解决</strong>。
              行动项完成不等于计划完成，必须经「待验证」阶段读取真实经营指标达标后方可关闭闭环。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => setIsCreatingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            创建运营计划
          </button>
        </div>
      </div>

      {/* 4 大 Tab 导航栏 (统一标准风格) */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          {
            id: 'IN_PROGRESS',
            label: '进行中 (In Progress)',
            icon: 'play_circle',
            badge: planList.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'ADJUSTING').length,
            badgeClass: 'bg-blue-100 text-blue-800'
          },
          {
            id: 'VERIFYING',
            label: '待验证 (Verifying)',
            icon: 'hourglass_top',
            badge: planList.filter((p) => p.status === 'VERIFYING').length,
            badgeClass: 'bg-amber-100 text-amber-800'
          },
          {
            id: 'COMPLETED',
            label: '已完成 (Completed)',
            icon: 'task_alt',
            badge: planList.filter((p) => p.status === 'COMPLETED').length,
            badgeClass: 'bg-emerald-100 text-emerald-800'
          },
          {
            id: 'ALL',
            label: '全部计划 (All)',
            icon: 'apps',
            badge: planList.length,
            badgeClass: 'bg-slate-100 text-slate-700'
          }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-5 py-3.5 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                isActive
                  ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-blue-100 text-blue-800' : tab.badgeClass
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </section>

      {/* 主体分栏：左侧计划列表，右侧固定 6 大区域详情 (A~F) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 左侧：计划列表 (占 4/12) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                search
              </span>
              <input
                type="text"
                placeholder="搜索计划名称 / 负责人 / 标的..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700"
            >
              <option value="ALL">全部来源</option>
              <option value="GROWTH_PROBLEM">增长问题</option>
              <option value="MERCHANT_PROBLEM">商户问题</option>
              <option value="MEMBER_PROBLEM">会员问题</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {filteredPlans.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                暂无符合条件的运营计划
              </div>
            ) : (
              filteredPlans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                const completedActions = plan.actionItems.filter((a) => a.status === 'COMPLETED').length;
                const progressPct = plan.actionItems.length > 0 ? (completedActions / plan.actionItems.length) * 100 : 0;
                const gap = plan.targetValue - plan.baselineValue;
                const achieved = plan.currentValue - plan.baselineValue;
                const metricProgress = gap !== 0 ? Math.min(100, Math.max(0, (achieved / gap) * 100)) : 100;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-indigo-50/50 border-indigo-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-slate-500">{plan.id}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {plan.sourceCategoryName}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs mt-1 leading-snug">{plan.name}</h4>
                      </div>
                      <div className="shrink-0">{renderStatusBadge(plan.status)}</div>
                    </div>

                    {/* 目标指标进度 */}
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono text-[11px] space-y-1">
                      <div className="flex justify-between text-slate-600 font-sans">
                        <span>{plan.targetMetricName}:</span>
                        <span className="font-bold text-slate-900">
                          {plan.baselineValue}{plan.unit} ➔ <strong className="text-emerald-700">{plan.targetValue}{plan.unit}</strong>
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>当前进度: <strong className="text-blue-700">{plan.currentValue}{plan.unit}</strong></span>
                        <span className="text-emerald-600 font-bold">{metricProgress.toFixed(0)}% 达标率</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${metricProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>行动项: {completedActions}/{plan.actionItems.length} 完成</span>
                      <span>负责人: {plan.owner.split(' ')[0]}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 右侧：固定六大区域计划详情 (A~F) (占 8/12) */}
        {selectedPlan && (
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
            {/* =============================================================== */}
            {/* A. 计划概览                                                      */}
            {/* =============================================================== */}
            <div className="border-b border-slate-100 pb-4 space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {selectedPlan.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {selectedPlan.priority === 'P0_CRITICAL' ? 'P0 紧急核心' : 'P1 重点计划'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-xs">
                      来源: {selectedPlan.sourceCategoryName}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1.5">{selectedPlan.name}</h2>
                </div>

                <div className="flex items-center gap-2">
                  {renderStatusBadge(selectedPlan.status)}
                  {selectedPlan.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleMoveToVerifying(selectedPlan.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">hourglass_top</span>
                      <span>转入待验证</span>
                    </button>
                  )}
                  {selectedPlan.status === 'VERIFYING' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleVerifyResult(selectedPlan.id, 'ACHIEVED')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      >
                        判定达标闭环
                      </button>
                      <button
                        onClick={() => handleVerifyResult(selectedPlan.id, 'NOT_ACHIEVED')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                      >
                        判定未达标调整
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block font-sans">负责人 (Owner)</span>
                  <span className="font-bold text-slate-900 font-sans">{selectedPlan.owner}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-sans">周期时间跨度</span>
                  <span className="text-slate-700">{selectedPlan.startDate} ~ {selectedPlan.endDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-sans">参与协同人</span>
                  <span className="text-slate-700 font-sans">{selectedPlan.participants.join('、')}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-sans">验证周期机制</span>
                  <span className="text-indigo-700 font-sans font-semibold">{selectedPlan.verificationCycle}</span>
                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* B. 经营问题 (说明为什么做)                                       */}
            {/* =============================================================== */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-rose-600 text-base">help</span>
                <span>B. 经营问题剖析 (为什么做)</span>
              </h3>
              <div className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-rose-950 font-bold">
                  <span>来源问题: {selectedPlan.sourceProblemTitle}</span>
                  {selectedPlan.sourceProblemId && (
                    <span className="font-mono text-[11px] text-rose-700">[{selectedPlan.sourceProblemId}]</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
                  <div><strong>影响对象:</strong> {selectedPlan.affectedObject}</div>
                  <div><strong>基线表现:</strong> {selectedPlan.currentProblemMetric} (正常 {selectedPlan.normalBaselineMetric})</div>
                </div>
                <div className="text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-rose-100">
                  <span className="font-bold text-slate-900">根本原因分析：</span>
                  {selectedPlan.problemCause}
                </div>
                <div className="text-rose-700 font-medium">
                  <strong>预计业务影响：</strong>{selectedPlan.expectedBusinessImpact}
                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* C. 目标 (必须是经营指标)                                         */}
            {/* =============================================================== */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-base">flag</span>
                <span>C. 经营改善目标 (必须是经营指标，严禁活动清单式目标)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">1. 初始基线值 (Baseline)</span>
                  <div className="text-xl font-black text-slate-700 mt-1 font-mono">
                    {selectedPlan.baselineValue}{selectedPlan.unit}
                  </div>
                  <span className="text-[11px] text-slate-500">问题发生时表现</span>
                </div>

                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                  <span className="text-indigo-600 text-[10px] block font-bold">2. 经营改善目标 (Target)</span>
                  <div className="text-xl font-black text-indigo-700 mt-1 font-mono">
                    {selectedPlan.targetValue}{selectedPlan.unit}
                  </div>
                  <span className="text-[11px] text-indigo-600 font-semibold">必须达成之门槛</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 text-[10px] block font-bold">3. 动态最新值 (Current)</span>
                  <div className="text-xl font-black text-emerald-700 mt-1 font-mono">
                    {selectedPlan.currentValue}{selectedPlan.unit}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">持续读取并验证</span>
                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* D. 行动项 (关键经营行动)                                         */}
            {/* =============================================================== */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-base">checklist</span>
                  <span>D. 关键经营行动项 ({selectedPlan.actionItems.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">运营计划只记录关键经营行动，不取代 Jira</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">行动项内容</th>
                      <th className="py-2.5 px-2">负责人</th>
                      <th className="py-2.5 px-2">执行方</th>
                      <th className="py-2.5 px-2 font-mono">开始 ➔ 截止</th>
                      <th className="py-2.5 px-2 text-center">状态</th>
                      <th className="py-2.5 px-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPlan.actionItems.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-900">{act.actionTitle}</div>
                          {act.completionNote && (
                            <div className="text-[10px] text-emerald-600 font-mono mt-0.5">
                              ✓ {act.completionNote}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-2 font-medium text-slate-800">{act.owner}</td>
                        <td className="py-2.5 px-2">
                          <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100">
                            {act.executorParty}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[11px] text-slate-500">
                          {act.startDate.slice(5)} ➔ {act.dueDate.slice(5)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {act.status === 'COMPLETED' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              已完成
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              进行中
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleToggleActionStatus(act.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            {act.status === 'COMPLETED' ? '设为未完' : '标记完成'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =============================================================== */}
            {/* E. 指标跟踪 (Baseline ➔ Target ➔ Current 趋势)                    */}
            {/* =============================================================== */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-purple-600 text-base">monitoring</span>
                <span>E. 经营指标动态监测轨迹 (Baseline ➔ Target ➔ Current)</span>
              </h3>

              <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span>{selectedPlan.targetMetricName} 演变路径</span>
                  <span>目标: {selectedPlan.targetValue}{selectedPlan.unit}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  {selectedPlan.metricTrend.map((pt, idx) => (
                    <div key={idx} className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">{pt.date} {pt.label && `(${pt.label})`}</span>
                      <strong className="text-emerald-400 text-sm mt-1 block">
                        {pt.metricValue}{selectedPlan.unit}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* F. 效果验证 (达标 / 部分达标 / 未达标 / 数据不足)                */}
            {/* =============================================================== */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-base">verified_user</span>
                <span>F. 效果验证评估 (计划结束不能直接完成，必须读取指标达标后方可关闭)</span>
              </h3>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>验证机制：</strong>
                    <span className="text-slate-600">{selectedPlan.verificationCycle}</span>
                  </div>
                  {selectedPlan.verificationResult && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        selectedPlan.verificationResult === 'ACHIEVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedPlan.verificationResult === 'PARTIAL_ACHIEVED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {selectedPlan.verificationResult === 'ACHIEVED'
                        ? '达标已完成'
                        : selectedPlan.verificationResult === 'PARTIAL_ACHIEVED'
                        ? '部分达标 (优化中)'
                        : '未达标'}
                    </span>
                  )}
                </div>

                {selectedPlan.verificationSummary ? (
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-sans">
                    <strong className="text-emerald-700">效果结论：</strong> {selectedPlan.verificationSummary}
                    {selectedPlan.verifiedAt && (
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        验证评估时间: {selectedPlan.verifiedAt}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 italic">
                    ⏳ 计划当前在推进中，待执行周期结束后，系统将自动读取最新周期经营指标进行效果核算判定。
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* 新建运营计划弹窗                                                        */}
      {/* ======================================================================= */}
      {isCreatingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">add_task</span>
                <h3 className="text-base font-bold text-slate-900">创建新运营计划 (解决具体经营问题)</h3>
              </div>
              <button
                onClick={() => setIsCreatingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">计划名称</label>
                <input
                  type="text"
                  placeholder="例如：东南亚新用户首单转化攻坚改善计划"
                  value={newPlanForm.name}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">问题来源分类</label>
                  <select
                    value={newPlanForm.sourceCategory}
                    onChange={(e) =>
                      setNewPlanForm({
                        ...newPlanForm,
                        sourceCategory: e.target.value as any,
                        sourceCategoryName:
                          e.target.value === 'GROWTH_PROBLEM'
                            ? '增长问题'
                            : e.target.value === 'MERCHANT_PROBLEM'
                            ? '商户问题'
                            : '会员问题'
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="GROWTH_PROBLEM">增长问题 (Growth)</option>
                    <option value="MERCHANT_PROBLEM">商户问题 (Merchant)</option>
                    <option value="MEMBER_PROBLEM">会员问题 (Member)</option>
                    <option value="QUOTE_PROBLEM">报价问题 (Quote)</option>
                    <option value="MANUAL_CREATED">运营人工发起</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">影响对象</label>
                  <input
                    type="text"
                    placeholder="例如：东南亚社群代理 × Apple US"
                    value={newPlanForm.affectedObject}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, affectedObject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">来源问题描述与原因</label>
                <textarea
                  rows={2}
                  placeholder="说明为什么要做：来源什么异常、根本原因是什么..."
                  value={newPlanForm.sourceProblemTitle}
                  onChange={(e) =>
                    setNewPlanForm({
                      ...newPlanForm,
                      sourceProblemTitle: e.target.value,
                      problemCause: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 font-sans">经营目标指标名</label>
                  <input
                    type="text"
                    placeholder="如：首单转化率"
                    value={newPlanForm.targetMetricName}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, targetMetricName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 font-sans">当前基线值</label>
                  <input
                    type="number"
                    value={newPlanForm.baselineValue}
                    onChange={(e) =>
                      setNewPlanForm({
                        ...newPlanForm,
                        baselineValue: parseFloat(e.target.value) || 0,
                        currentValue: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 font-sans">期望达成目标值</label>
                  <input
                    type="number"
                    value={newPlanForm.targetValue}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, targetValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">负责人</label>
                  <input
                    type="text"
                    value={newPlanForm.owner}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, owner: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">计划结束时间</label>
                  <input
                    type="date"
                    value={newPlanForm.endDate}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsCreatingModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const created: OperationPlanItem = {
                    id: newPlanForm.id || `PLAN-202610-0${planList.length + 1}`,
                    name: newPlanForm.name || '未命名运营计划',
                    owner: newPlanForm.owner || '运营专家',
                    participants: newPlanForm.participants || ['运营专员'],
                    startDate: newPlanForm.startDate || '2026-10-07',
                    endDate: newPlanForm.endDate || '2026-10-30',
                    status: 'IN_PROGRESS',
                    priority: newPlanForm.priority || 'P1_HIGH',
                    sourceCategory: newPlanForm.sourceCategory || 'GROWTH_PROBLEM',
                    sourceCategoryName: newPlanForm.sourceCategoryName || '增长问题',
                    sourceProblemTitle: newPlanForm.sourceProblemTitle || '运营手动立项',
                    affectedObject: newPlanForm.affectedObject || '全量出卡用户',
                    currentProblemMetric: `${newPlanForm.baselineValue}%`,
                    normalBaselineMetric: `${newPlanForm.targetValue}%`,
                    problemCause: newPlanForm.problemCause || '业务流程存在卡点',
                    expectedBusinessImpact: '改善核心转化率',
                    targetMetricName: newPlanForm.targetMetricName || '核心转化率',
                    baselineValue: newPlanForm.baselineValue || 20.0,
                    targetValue: newPlanForm.targetValue || 30.0,
                    currentValue: newPlanForm.currentValue || 20.0,
                    unit: newPlanForm.unit || '%',
                    actionItems: newPlanForm.actionItems || [],
                    metricTrend: [
                      { date: '10/07', metricValue: newPlanForm.baselineValue || 20.0, label: '立项基线' }
                    ],
                    verificationCycle: '计划结束后观测 7 天'
                  };

                  setPlanList([created, ...planList]);
                  setSelectedPlan(created);
                  setIsCreatingModalOpen(false);
                  notify(`✅ 运营计划【${created.id}】已成功立项并进入【进行中】！`);
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer transition-colors"
              >
                确认立项
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
