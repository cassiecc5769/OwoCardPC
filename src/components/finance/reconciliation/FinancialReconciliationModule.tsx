import React, { useState } from 'react';
import { NavPath } from '../../../types';
import { ReconVarianceItem, ReconVarianceStatus, AdjustmentOrderForm, ReconTaskSummary } from './types';
import { INITIAL_RECON_TASK, INITIAL_VARIANCE_ITEMS, HISTORICAL_TASKS } from './mockData';
import { AdjustmentOrderModal } from './AdjustmentOrderModal';
import { VarianceDrilldownDrawer } from './VarianceDrilldownDrawer';

interface FinancialReconciliationModuleProps {
  onNavigate?: (path: NavPath) => void;
}

export const FinancialReconciliationModule: React.FC<FinancialReconciliationModuleProps> = ({ onNavigate }) => {
  // State
  const [taskSummary, setTaskSummary] = useState<ReconTaskSummary>(INITIAL_RECON_TASK);
  const [variances, setVariances] = useState<ReconVarianceItem[]>(INITIAL_VARIANCE_ITEMS);
  const [selectedIds, setSelectedIds] = useState<string[]>(['diff-01', 'diff-02']);
  const [activeTab, setActiveTab] = useState<'WORKBENCH' | 'OVERVIEW'>('WORKBENCH');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReconVarianceStatus>('ALL');
  
  // Interactive UI modals
  const [drilldownItem, setDrilldownItem] = useState<ReconVarianceItem | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<ReconVarianceItem | null>(null);
  const [isRechecking, setIsRechecking] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Checkbox helpers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(variances.map(v => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Re-check trigger
  const handleTriggerRecheck = () => {
    setIsRechecking(true);
    setTimeout(() => {
      setIsRechecking(false);
      const nowStr = new Date().toLocaleTimeString();
      setTaskSummary(prev => ({
        ...prev,
        throughputVolume: prev.throughputVolume + 128,
        lastRecheckTime: `刚刚 (${nowStr})`
      }));
      showToast(`全量重新核对完毕！四账双向勾稽模型核对 48,378 笔流水，无新增账务异常。`);
    }, 1200);
  };

  // Handle Adjustment Submission
  const handleApplyAdjustment = (form: AdjustmentOrderForm) => {
    setVariances(prev =>
      prev.map(v => {
        if (v.id === form.diffId) {
          const isSettled = form.executeImmediately;
          return {
            ...v,
            status: isSettled ? 'SETTLED_BALANCED' : 'APPROVAL_IN_FLIGHT',
            proposedAction: `${v.proposedAction} · [${isSettled ? '双人签章已核验并自动平账' : '调账单审批流推进中'}]`,
            isLocked: !isSettled
          };
        }
        return v;
      })
    );

    setTaskSummary(prev => {
      const isSettled = form.executeImmediately;
      const targetItem = variances.find(v => v.id === form.diffId);
      const riskVal = targetItem?.lockedAtRiskValue || 0;
      return {
        ...prev,
        unresolvedVariancesCount: isSettled ? Math.max(0, prev.unresolvedVariancesCount - 1) : prev.unresolvedVariancesCount,
        lockedRiskValueUSD: isSettled ? Math.max(0, prev.lockedRiskValueUSD - riskVal) : prev.lockedRiskValueUSD,
        auditedPendingCount: Math.max(0, prev.auditedPendingCount - 1),
        approvingCount: isSettled ? prev.approvingCount : prev.approvingCount + 1,
        settledClosedCount: isSettled ? prev.settledClosedCount + 1 : prev.settledClosedCount,
        accuracyRate: isSettled && prev.unresolvedVariancesCount <= 1 ? 100.0 : prev.accuracyRate
      };
    });

    setAdjustingItem(null);
    showToast(
      form.executeImmediately
        ? `平账成功！差异单 [${form.diffNo}] 已生成红字/补平双向凭证，完成四账平账结案。`
        : `调整单已提交！差异单 [${form.diffNo}] 进入双人复核审批阶段。`
    );
  };

  // Batch settle selected
  const handleBatchSettleSelected = () => {
    if (selectedIds.length === 0) {
      showToast('请先勾选待平账的差异单。');
      return;
    }
    const pendingItems = variances.filter(v => selectedIds.includes(v.id) && v.status !== 'SETTLED_BALANCED');
    if (pendingItems.length === 0) {
      showToast('所选差异单已全部平账结案，无需重复处理。');
      return;
    }

    setVariances(prev =>
      prev.map(v => {
        if (selectedIds.includes(v.id)) {
          return {
            ...v,
            status: 'SETTLED_BALANCED',
            proposedAction: `${v.proposedAction} · [批量生成调整单联机平账完成]`,
            isLocked: false
          };
        }
        return v;
      })
    );

    setTaskSummary(prev => ({
      ...prev,
      unresolvedVariancesCount: Math.max(0, prev.unresolvedVariancesCount - pendingItems.length),
      lockedRiskValueUSD: 0,
      auditedPendingCount: 0,
      approvingCount: 0,
      settledClosedCount: prev.settledClosedCount + pendingItems.length,
      accuracyRate: 100.0
    }));

    showToast(`批量平账成功！已为 ${pendingItems.length} 笔差异单生成规范调整凭单并结案。`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['差异单号', '触发节点', '涉案商户', '商户ID', '关联单号', '差异类型', '差额PTS', '根因定位', '责任归属', '状态'];
    const rows = variances.map(v => [
      v.diffNo,
      v.nodeTrigger,
      v.merchantShort,
      v.merchantId,
      v.relatedBizId,
      v.typeName,
      v.diffPoints,
      v.rootCause,
      v.responsibility,
      v.status === 'SETTLED_BALANCED' ? '已平账结案' : v.status === 'APPROVAL_IN_FLIGHT' ? '调账审批中' : '待核查'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_recon_variance_${taskSummary.taskId.replace('#', '')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('差异勾稽报表 CSV 导出就绪！');
  };

  // Filtered variances
  const filteredVariances = variances.filter(v => {
    if (statusFilter === 'ALL') return true;
    return v.status === statusFilter;
  });

  const selectedVariances = variances.filter(v => selectedIds.includes(v.id));
  const selectedDiffTotal = selectedVariances.reduce((sum, v) => sum + v.diffPoints, 0);

  return (
    <div className="flex flex-col w-full pb-12 gap-5 text-slate-800 antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Page Header */}
      <header className="bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">account_balance</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                财务对账中心
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-semibold border border-emerald-200">
                T+0 四账勾稽
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                实时自动核算
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              业务单、通道账单、网银流水与会计账四维一体化自动勾稽与差异调账治理
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span>导出差异报表</span>
          </button>
          <button
            type="button"
            disabled={isRechecking}
            onClick={handleTriggerRecheck}
            className="px-3.5 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors border border-slate-200/80 shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] text-blue-600 ${isRechecking ? 'animate-spin' : ''}`}>
              autorenew
            </span>
            <span>{isRechecking ? '核对计算中...' : '重新全量核对'}</span>
          </button>
          <button
            type="button"
            onClick={handleBatchSettleSelected}
            className="px-4 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">balance</span>
            <span>批量生成调账单 ({selectedIds.length})</span>
          </button>
        </div>
      </header>

      {/* 1. 顶部对账综合健康看板 (4列等宽卡片) */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: 一致率 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                今日四账核对一致率
              </span>
              <span className="font-code-token text-[10px] text-slate-400">ALG-RECON-ACCURACY</span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span className="font-label-caps text-[10px]">HEALTH PASS</span>
            </div>
          </div>
          <div className="my-3 flex items-baseline gap-1">
            <span className="font-numeric-stat text-[32px] text-slate-900 font-bold tracking-tight">
              {taskSummary.accuracyRate.toFixed(2)}
            </span>
            <span className="font-headline-sm text-sm text-slate-500 font-semibold">%</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified_user</span>
              <span>四账模型实时双向勾稽中</span>
            </div>
            <span className="font-code-token text-[11px] text-emerald-700 font-semibold">T+0 SYNC</span>
          </div>
        </div>

        {/* Card 2: 对账流水规模 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                流水核对总吞吐量
              </span>
              <span className="font-code-token text-[10px] text-slate-400">TXN-STREAM-VOLUME</span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            </div>
          </div>
          <div className="my-3 flex items-baseline gap-1">
            <span className="font-numeric-stat text-[32px] text-slate-900 font-bold tracking-tight">
              {taskSummary.throughputVolume.toLocaleString()}
            </span>
            <span className="font-code-token text-xs text-slate-500">笔 (当日)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <span className="text-slate-400">涵盖链路:</span>
            <span className="font-code-token text-[11px] bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
              业务 ↔ 积点 ↔ 结算 ↔ 资金
            </span>
          </div>
        </div>

        {/* Card 3: 账务差异单 (待处置) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-caps text-[11px] text-red-600 uppercase tracking-wider font-bold">
                账务差异单 (待处置)
              </span>
              <span className="font-code-token text-[10px] text-red-400">UNRESOLVED VARIANCES</span>
            </div>
            {taskSummary.unresolvedVariancesCount > 0 ? (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            )}
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className={`font-numeric-stat text-[32px] font-bold tracking-tight ${taskSummary.unresolvedVariancesCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              0{taskSummary.unresolvedVariancesCount}
            </span>
            <span className={`font-label-caps text-[10px] px-1.5 py-0.5 rounded font-semibold ${taskSummary.unresolvedVariancesCount > 0 ? 'text-red-700 bg-red-50 border border-red-200' : 'text-emerald-700 bg-emerald-50'}`}>
              {taskSummary.unresolvedVariancesCount > 0 ? 'CRITICAL 待平账' : 'ALL BALANCED'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-code-token">
            <span>单边账 {taskSummary.unresolvedVarianceTypes.unilateralCount} 笔</span>
            <span className="text-slate-300">|</span>
            <span>少扣 {taskSummary.unresolvedVarianceTypes.deficitCount} 笔</span>
            <span className="text-slate-300">|</span>
            <span>充值未入 {taskSummary.unresolvedVarianceTypes.uncreditedCount} 笔</span>
          </div>
        </div>

        {/* Card 4: 涉案风险金额 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                差异涉案预占金额
              </span>
              <span className="font-code-token text-[10px] text-slate-400">AT-RISK LOCKED VALUE</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span className="font-code-token text-[10px] font-semibold">已预占锁定</span>
            </div>
          </div>
          <div className="my-3 flex items-baseline gap-1">
            <span className="font-label-caps text-base text-blue-600 font-bold">$</span>
            <span className="font-numeric-stat text-[32px] text-blue-600 font-bold tracking-tight">
              {taskSummary.lockedRiskValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="font-code-token text-xs text-slate-500">USD</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-700 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[15px]">security</span>
              无实质敞口资损
            </span>
            <span className="font-code-token text-[11px] text-slate-400">MARGIN: 100%</span>
          </div>
        </div>
      </section>

      {/* 2. 综合控制栏与对账任务选择 */}
      <section className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: 当前对账任务与状态 */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-lg">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">event_repeat</span>
            <div className="flex flex-col">
              <span className="font-label-caps text-[10px] text-slate-400 uppercase font-semibold">
                当前对账任务周期
              </span>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-sm font-bold text-slate-900">
                  {taskSummary.taskName}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-code-token text-[10px] font-bold">
                  {taskSummary.status}
                </span>
                <span className="font-code-token text-xs text-slate-400">
                  {taskSummary.taskId}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Switcher - Standard Image Tab Bar Style */}
          <div className="flex items-center gap-1">
            {[
              { id: 'WORKBENCH', label: '账务差异处理工作台', badge: `${taskSummary.unresolvedVariancesCount}`, icon: 'table_view' },
              { id: 'OVERVIEW', label: '对账任务历史总览', badge: '24 归档', icon: 'history' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                    isActive
                      ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
                      isActive ? 'bg-blue-100 text-[#004ac6] font-semibold' : 'bg-slate-100 text-slate-600 font-medium'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isRechecking}
            onClick={handleTriggerRecheck}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors border border-slate-200"
          >
            <span className={`material-symbols-outlined text-[16px] text-blue-600 ${isRechecking ? 'animate-spin' : ''}`}>
              autorenew
            </span>
            <span>{isRechecking ? '核对计算中...' : '立即执行全量重新核对'}</span>
          </button>
          <button
            type="button"
            onClick={handleBatchSettleSelected}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">balance</span>
            <span>生成调整单批量平账 ({selectedIds.length})</span>
          </button>
        </div>
      </section>

      {/* Main Content Conditional on Tab */}
      {activeTab === 'OVERVIEW' ? (
        /* Overview of Historical Reconciliation Batches */
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-sm text-base font-bold text-slate-900">
                历史对账任务切片执行日志 (Daily Reconciliation Batches)
              </h3>
              <p className="text-xs text-slate-500 font-code-token mt-0.5">
                依据 T+1 日切终态核对准则，每日凌晨 02:00 定时启动自动全量四账勾稽校验
              </p>
            </div>
            <span className="text-xs font-code-token text-slate-400">
              最后全量核查: {taskSummary.lastRecheckTime}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-label-caps uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">对账任务批次号</th>
                  <th className="py-2.5 px-4">任务名称 / 切片周期</th>
                  <th className="py-2.5 px-4 text-right">核对流水量</th>
                  <th className="py-2.5 px-4 text-center">勾稽一致率</th>
                  <th className="py-2.5 px-4 text-center">产生差异单</th>
                  <th className="py-2.5 px-4 text-center">对账终态</th>
                  <th className="py-2.5 px-4">责任审计员</th>
                  <th className="py-2.5 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {HISTORICAL_TASKS.map(task => (
                  <tr key={task.taskId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-code-token font-bold text-blue-600">
                      {task.taskId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{task.name}</div>
                      <div className="text-[11px] text-slate-400 font-code-token">{task.period}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-numeric-table font-semibold text-slate-800">
                      {task.totalVolume.toLocaleString()} 笔
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-numeric-table font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {task.accuracy.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {task.variances > 0 ? (
                        <span className="font-numeric-table font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          {task.variances} 笔
                        </span>
                      ) : (
                        <span className="text-slate-400 font-code-token">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-code-token text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-code-token text-slate-600">
                      {task.operator}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveTab('WORKBENCH');
                          showToast(`已切换至任务 [${task.taskId}] 差异处理工作台。`);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        调阅明细
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        /* 3. 差异单处理高密度作业表格 (遵循 标准化差异单规范) */
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 flex flex-col overflow-hidden">
          {/* Header & Filter pills */}
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-red-600 text-[18px]">warning</span>
                <span className="font-headline-sm text-sm font-bold text-slate-900">
                  四账核对差异单核查池
                </span>
              </div>
              <span className="font-code-token text-[11px] text-slate-400">
                标准化差异单 规范
              </span>
            </div>

            {/* Status pills filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
                }`}
              >
                全部 ({variances.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PENDING_CHECK')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  statusFilter === 'PENDING_CHECK'
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                <span>待核查:</span>
                <span className="font-numeric-table font-bold">
                  {variances.filter(v => v.status === 'PENDING_CHECK').length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('APPROVAL_IN_FLIGHT')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  statusFilter === 'APPROVAL_IN_FLIGHT'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <span>调账审批中:</span>
                <span className="font-numeric-table font-bold">
                  {variances.filter(v => v.status === 'APPROVAL_IN_FLIGHT').length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('SETTLED_BALANCED')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  statusFilter === 'SETTLED_BALANCED'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <span>已平账结案:</span>
                <span className="font-numeric-table font-bold">
                  {variances.filter(v => v.status === 'SETTLED_BALANCED').length}
                </span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1340px]">
              <thead>
                <tr className="h-9 bg-slate-50 text-slate-500 font-label-caps text-[11px] tracking-wider uppercase border-b border-slate-200">
                  <th className="px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === variances.length && variances.length > 0}
                      onChange={handleSelectAll}
                      className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                    />
                  </th>
                  <th className="px-3">差异单号 / 触发节点</th>
                  <th className="px-3">涉案商户 / 关联单号</th>
                  <th className="px-3">标准差异类型</th>
                  <th className="px-3 text-right">业务账 vs 积点账</th>
                  <th className="px-3 text-right">差额数值</th>
                  <th className="px-3">根因定位</th>
                  <th className="px-3">责任归属</th>
                  <th className="px-3">拟定处置方案</th>
                  <th className="px-3 text-center">状态</th>
                  <th className="px-3">经办财务</th>
                  <th className="px-3 text-right">审计与平账动作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-body-sm text-slate-800">
                {filteredVariances.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      <span className="material-symbols-outlined text-[32px] text-slate-300 block mb-1">
                        check_circle
                      </span>
                      暂无符合该状态的差异单
                    </td>
                  </tr>
                ) : (
                  filteredVariances.map(row => {
                    const isSelected = selectedIds.includes(row.id);
                    return (
                      <tr
                        key={row.id}
                        className={`h-14 hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(row.id)}
                            className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                        </td>
                        <td className="px-3">
                          <div className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => setDrilldownItem(row)}
                              className="font-code-token text-xs font-bold text-blue-600 hover:underline text-left cursor-pointer"
                            >
                              {row.diffNo}
                            </button>
                            <span className="font-code-token text-[10px] text-slate-400">
                              {row.timestamp} {row.nodeTrigger}
                            </span>
                          </div>
                        </td>
                        <td className="px-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 truncate max-w-[150px]">
                              {row.merchantName}
                            </span>
                            <span className="font-code-token text-[11px] text-blue-700">
                              {row.relatedBizId}
                            </span>
                          </div>
                        </td>
                        <td className="px-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-code-token text-[11px] font-semibold ${
                            row.type === 'UNCREDITED'
                              ? 'bg-amber-100 text-amber-800'
                              : row.type === 'UNILATERAL'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {row.typeName}
                          </span>
                        </td>
                        <td className="px-3 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-numeric-table text-xs text-slate-900">
                              {row.bizAmountStr}
                            </span>
                            <span className="font-numeric-table text-xs text-slate-500">
                              {row.pointsAmountStr}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`font-numeric-table font-bold text-xs ${row.diffPoints > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {row.diffPoints > 0 ? `+${row.diffPoints.toFixed(2)}` : row.diffPoints.toFixed(2)} PTS
                            </span>
                            <span className="font-code-token text-[10px] text-slate-400">
                              {row.diffCurrencyStr}
                            </span>
                          </div>
                        </td>
                        <td className="px-3">
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'SETTLED_BALANCED' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            <span className="truncate max-w-[170px]" title={row.rootCause}>
                              {row.rootCause}
                            </span>
                          </div>
                        </td>
                        <td className="px-3">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-code-token text-[11px] text-slate-600">
                            {row.responsibility}
                          </span>
                        </td>
                        <td className="px-3">
                          <span className="text-slate-800 font-medium truncate max-w-[180px] block">
                            {row.proposedAction}
                          </span>
                        </td>
                        <td className="px-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-code-token text-[11px] font-semibold ${
                            row.status === 'SETTLED_BALANCED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.status === 'APPROVAL_IN_FLIGHT'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {row.status === 'SETTLED_BALANCED'
                              ? '已平账结案'
                              : row.status === 'APPROVAL_IN_FLIGHT'
                              ? '调账审批中'
                              : '待核查'}
                          </span>
                        </td>
                        <td className="px-3 font-code-token text-slate-600">
                          {row.auditor}
                        </td>
                        <td className="px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {row.status === 'SETTLED_BALANCED' ? (
                              <button
                                type="button"
                                onClick={() => setDrilldownItem(row)}
                                className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs transition-colors"
                              >
                                查看凭据
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setAdjustingItem(row)}
                                className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-xs"
                              >
                                {row.status === 'APPROVAL_IN_FLIGHT' ? '调账单审批 (1/2)' : '定位与调账'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDrilldownItem(row)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              title="穿透双向流水证据链"
                            >
                              <span className="material-symbols-outlined text-[18px]">find_in_page</span>
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

          {/* Table Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span>已勾选 <strong className="text-blue-600 font-numeric-table">{selectedIds.length}</strong> 笔差异单</span>
              <span className="text-slate-300">|</span>
              <span>
                勾选合计待处理差额: <strong className={`font-numeric-table ${selectedDiffTotal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {selectedDiffTotal >= 0 ? `+${selectedDiffTotal.toFixed(2)}` : selectedDiffTotal.toFixed(2)} PTS
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">download</span>
                <span>导出差异勾稽报表 (CSV)</span>
              </button>
              <span className="text-slate-400 font-code-token">共 {filteredVariances.length} 笔差异 (页码 1/1)</span>
            </div>
          </div>
        </section>
      )}

      {/* 4. 底部展示【四账核对模型拓扑图与差异闭环链路】 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Topology Matrix */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">hub</span>
                <h4 className="font-headline-md text-base font-bold text-slate-900">
                  四账核对模型互勾稽拓扑图
                </h4>
              </div>
              <span className="font-code-token text-[10px] text-slate-400">
                QUAD-LEDGER DUAL-ENTRY RECONCILIATION TOPOLOGY
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-code-token text-[11px]">
              <span>RULE: T+0 准实时 + T+1 终态切片</span>
            </div>
          </div>

          {/* 4 Nodes */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {/* Node 1: 业务账 */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-code-token text-xs text-blue-600 font-bold">NODE 01</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <h5 className="font-headline-sm text-sm font-bold text-slate-900">业务账 (Order)</h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    收卡订单生命周期、面值、卡密核销终态、商户手续费。
                  </p>
                </div>
                <div className="mt-3 pt-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                  <span className="font-code-token text-[10px] text-slate-400">主键: OrderID / CardNo</span>
                </div>
              </div>

              {/* Node 2: 积点账 */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-code-token text-xs text-blue-600 font-bold">NODE 02</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <h5 className="font-headline-sm text-sm font-bold text-slate-900">积点账 (Points)</h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    商户积点账户余额、扣减流水、增发及冻结水位。
                  </p>
                </div>
                <div className="mt-3 pt-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                  <span className="font-code-token text-[10px] text-slate-400">主键: PointTxnID</span>
                </div>
              </div>

              {/* Node 3: 结算账 */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-code-token text-xs text-blue-600 font-bold">NODE 03</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <h5 className="font-headline-sm text-sm font-bold text-slate-900">结算账 (Settle)</h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    商户结算周期账单、汇率换算、手续费扣减与出款凭单。
                  </p>
                </div>
                <div className="mt-3 pt-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                  <span className="font-code-token text-[10px] text-slate-400">主键: SettleBatchID</span>
                </div>
              </div>

              {/* Node 4: 资金账 */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-code-token text-xs text-blue-600 font-bold">NODE 04</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <h5 className="font-headline-sm text-sm font-bold text-slate-900">资金账 (Bank/USDT)</h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    网关充值网银对账单、USDT链上确认数、银行真实流水。
                  </p>
                </div>
                <div className="mt-3 pt-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                  <span className="font-code-token text-[10px] text-slate-400">主键: BankTxn / Hash</span>
                </div>
              </div>
            </div>

            {/* Bottom rule strip */}
            <div className="mt-3 pt-3 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">multiple_stop</span>
                <span>
                  核对逻辑：<strong>业务与积点等额借贷</strong> ｜ <strong>积点与结算日切平账</strong> ｜ <strong>结算与银行无敞口打款</strong>
                </span>
              </div>
              <span className="font-code-token text-emerald-700 font-bold">
                PASS-CHECK: 100.00% 自动化
              </span>
            </div>
          </div>
        </div>

        {/* Audit Compliance Red Lines */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
              <h4 className="font-headline-md text-base font-bold">财务合规风控红线</h4>
            </div>
            <span className="font-code-token text-[10px] text-slate-400 uppercase block">
              PRD AUDIT COMPLIANCE &amp; SAFETY
            </span>

            <div className="bg-red-50/60 border border-red-200/80 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">block</span>
                <span>严禁直接修改底层数据库余额</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-body-sm">
                任何平账操作必须通过<strong>「标准账户调整单」</strong>发起，包含正向补平、反向冲正。所有变动必须具备唯一差异单索引、财务双人复核凭证及双向记账流水，杜绝账面虚增或未审计调减。
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="font-label-caps text-[11px] text-slate-800 font-semibold uppercase block">
                标准差异闭环处理流 (SOP)
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-code-token text-[11px] text-blue-600 font-bold">
                  1
                </span>
                <span>触发自动告警与风险金额预占</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-code-token text-[11px] text-blue-600 font-bold">
                  2
                </span>
                <span>定位单边账根因 (网络丢单 / 超限断流)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-code-token text-[11px] text-blue-600 font-bold">
                  3
                </span>
                <span>生成账户调整单 ➔ 财务主管审批 ➔ 自动回冲平账</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-code-token text-slate-400">AUDIT COMPLIANCE LEVEL 4</span>
            <span className="font-label-caps text-emerald-700 font-bold">SOX-404 READY</span>
          </div>
        </div>
      </section>

      {/* Modals & Drawers */}
      {adjustingItem && (
        <AdjustmentOrderModal
          item={adjustingItem}
          isOpen={!!adjustingItem}
          onClose={() => setAdjustingItem(null)}
          onSubmit={handleApplyAdjustment}
        />
      )}

      {drilldownItem && (
        <VarianceDrilldownDrawer
          item={drilldownItem}
          onClose={() => setDrilldownItem(null)}
          onOpenAdjustModal={(item) => setAdjustingItem(item)}
        />
      )}
    </div>
  );
};
