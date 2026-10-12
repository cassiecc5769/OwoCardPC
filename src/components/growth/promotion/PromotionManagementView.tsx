import React, { useState } from 'react';
import {
  INITIAL_PROMOTERS,
  INITIAL_TEAMS,
  INITIAL_ATTRIBUTION_USERS,
  INITIAL_ORDER_ATTRIBUTIONS,
  INITIAL_SETTLEMENT_BATCHES
} from './mockData';
import { PromoterItem, TeamItem, SettlementBatchItem } from './types';
import { PromotionPromoterTab } from './PromotionPromoterTab';
import { PromotionTeamTab } from './PromotionTeamTab';
import { PromotionUserTab } from './PromotionUserTab';
import { PromotionPerformanceTab } from './PromotionPerformanceTab';
import { PromotionSettlementTab } from './PromotionSettlementTab';
import {
  AssignPromoterModal,
  AttributionRulesModal,
  CustomerAttributionDrawer,
  ReconciliationModal,
  RiskInterventionModal,
  VoucherTransferModal
} from './PromotionModals';

type TabKey = 'promoters' | 'teams' | 'users' | 'performance' | 'settlement';

export const PromotionManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('promoters');

  // State data
  const [promoters, setPromoters] = useState<PromoterItem[]>(INITIAL_PROMOTERS);
  const [teams] = useState<TeamItem[]>(INITIAL_TEAMS);
  const [batches, setBatches] = useState<SettlementBatchItem[]>(INITIAL_SETTLEMENT_BATCHES);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedPromoterForAttribution, setSelectedPromoterForAttribution] = useState<PromoterItem | null>(null);
  const [selectedPromoterForReconciliation, setSelectedPromoterForReconciliation] = useState<PromoterItem | null>(null);
  const [selectedPromoterForRisk, setSelectedPromoterForRisk] = useState<PromoterItem | null>(null);
  const [transferBatchTarget, setTransferBatchTarget] = useState<SettlementBatchItem | null>(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3200);
  };

  // Add promoter
  const handleAddPromoter = (newP: Partial<PromoterItem>) => {
    const full = newP as PromoterItem;
    setPromoters(prev => [full, ...prev]);
    showToast(`成功关联并录入新推广员: ${full.name} (${full.id})，专属码: ${full.inviteCode}`);
  };

  // Risk intervention resolution
  const handleResolveRisk = (promoterId: string, newStatus: 'active' | 'paused') => {
    setPromoters(prev =>
      prev.map(p => {
        if (p.id === promoterId) {
          const actionText = newStatus === 'active' ? '已合规解冻恢复接单' : '已实施风控熔断暂停接单';
          showToast(`推广员 ${p.name} (${p.id}) ${actionText}`);
          return {
            ...p,
            status: newStatus,
            statusReason: newStatus === 'active' ? undefined : '风控中心手工实施熔断',
            isFlagged: newStatus === 'paused'
          };
        }
        return p;
      })
    );
  };

  // Confirm batch transfer to 04 Finance Hub
  const handleConfirmTransfer = (batchNo: string) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.batchNo === batchNo) {
          return {
            ...b,
            transferStatus: 'TRANSFERRED',
            transferredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            transferredBy: '增长运营合规组 · 超级调度员',
            voucherHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
          };
        }
        return b;
      })
    );
    showToast(`结算批次 ${batchNo} 已生成只读凭证，成功移交 04 财务结算中心`);
  };

  return (
    <div className="flex flex-col w-full pb-12 text-slate-800 antialiased">
      {/* 飘窗 Toast 提示 */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          <span className="font-medium">{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Top Operational Banner & Meta Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              02 推广管理 · 人带人裂变与两级归因推广控制台
            </h1>
            <span className="bg-blue-50 border border-blue-200/60 text-blue-700 px-2 py-0.5 rounded font-code-token text-[11px] font-bold">
              PRD-SEC4 COMPLIANT
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-code-token text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              第3级熔断 100%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans max-w-4xl">
            严格贯彻「全员平级 · 一人一码 · 两级归因封顶 (第3级熔断) · 与财务结算隔离」四大合规底线，精准把控推广专员效能、团队人效、穿透用户网络、出单对账与只读凭证批次移交。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
          <button
            onClick={() => setIsRulesModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors shadow-2xs border border-slate-200/80 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">rule_folder</span>
            <span>归因规则快照</span>
          </button>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>分配录入推广员</span>
          </button>
          <button
            onClick={() => showToast('全网两级归因与第3级熔断规则配置已验证并发布全网生效')}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs border border-slate-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
            <span>生效全网规则</span>
          </button>
        </div>
      </header>

      {/* Layer 1: 4 Key Promotional Asset Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        {/* Card 1: 团队与推广专员总盘 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              团队与专员编制 (全员平级)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-code-token text-[10px] font-semibold shrink-0">
              NO SUB-AGENTS
            </span>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="font-numeric-stat text-2xl text-slate-900 font-bold leading-none tracking-tight">18</span>
            <span className="text-xs text-slate-500 font-medium">个战队 /</span>
            <span className="font-numeric-stat text-2xl text-slate-900 font-bold leading-none tracking-tight ml-1">142</span>
            <span className="text-xs text-slate-500 font-medium">名专员</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>在岗 <strong className="text-slate-900 font-semibold">128</strong> 人 (90.1%)</span>
            </span>
            <span className="font-code-token text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
              0 代理层级抽水
            </span>
          </div>
        </div>

        {/* Card 2: 累计两级裂变大盘 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              两级裂变大盘 (两级封顶)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-code-token text-[10px] font-semibold shrink-0">
              TIER 1 &amp; 2
            </span>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="font-numeric-stat text-2xl text-slate-900 font-bold leading-none tracking-tight">
              68,420
            </span>
            <span className="font-code-token text-xs text-slate-400 font-medium">人 (终身锁客)</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs">
            <span className="inline-flex items-center gap-1">
              <span>一级 <strong className="text-slate-900 font-semibold font-numeric-table">45,210</strong> / 二级 <strong className="text-slate-900 font-semibold font-numeric-table">23,210</strong></span>
            </span>
            <span className="font-code-token text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              第3级 100% 熔断
            </span>
          </div>
        </div>

        {/* Card 3: 本月撬动出单流水 (GMV) */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              本月撬动出单流水 (GMV)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-code-token text-[10px] font-semibold shrink-0">
              GMV ACCRUAL
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="font-numeric-stat text-2xl text-blue-600 font-bold leading-none tracking-tight">
              $1,842,500.00
            </span>
            <span className="font-code-token text-xs text-slate-400 font-medium">USD</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs">
            <span className="inline-flex items-center gap-1">
              <span>核销 <strong className="text-slate-900 font-semibold font-numeric-table">28,450</strong> 笔卡单</span>
            </span>
            <span className="font-numeric-table font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]">
              +18.4% YoY
            </span>
          </div>
        </div>

        {/* Card 4: 预估待结算分佣池 (财务硬隔离) */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              预估待结算分佣 (财务隔离)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-code-token text-[10px] font-semibold shrink-0">
              READ-ONLY
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="font-numeric-stat text-2xl text-slate-900 font-bold leading-none tracking-tight">
              $112,450.00
            </span>
            <span className="font-code-token text-xs text-slate-400 font-medium">USD</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs">
            <span className="inline-flex items-center gap-1 font-numeric-table text-[11px]">
              <span>一级 $89,960 / 二级 $22,490</span>
            </span>
            <span className="font-code-token text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
              财务专权出账
            </span>
          </div>
        </div>
      </div>

      {/* 5-Tab Scene Navigation Bar - Standard Image Tab Bar Style */}
      <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200/80 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'promoters', label: '推广员 (人员与状态)', badge: `${promoters.length}`, icon: 'badge' },
            { id: 'teams', label: '推广团队 (团队与人效)', badge: '18组', icon: 'groups' },
            { id: 'users', label: '推广用户 (两级穿透)', badge: '6.8w', icon: 'account_tree' },
            { id: 'performance', label: '推广业绩 (出单与对账)', badge: '2.8w单', icon: 'receipt_long' },
            { id: 'settlement', label: '推广结算 (收益移交财务)', badge: '只读移交', icon: 'price_check' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={`px-5 py-3 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs sm:text-sm ${
                  isActive
                    ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
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

        <div className="flex items-center gap-2 text-xs text-slate-500 font-code-token px-2 py-1 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>SLA 48h 巡检正常 · 3级熔断器生效中</span>
        </div>
      </div>

      {/* 核心 Tab 内容区域 */}
      {activeTab === 'promoters' && (
        <PromotionPromoterTab
          promoters={promoters}
          onOpenAssignModal={() => setIsAssignModalOpen(true)}
          onOpenRulesModal={() => setIsRulesModalOpen(true)}
          onViewAttribution={p => setSelectedPromoterForAttribution(p)}
          onViewReconciliation={p => setSelectedPromoterForReconciliation(p)}
          onInterveneRisk={p => setSelectedPromoterForRisk(p)}
          onShowToast={showToast}
        />
      )}

      {activeTab === 'teams' && (
        <PromotionTeamTab
          teams={teams}
          promoters={promoters}
          onSelectTeamMember={p => {
            setSelectedPromoterForAttribution(p);
          }}
          onShowToast={showToast}
        />
      )}

      {activeTab === 'users' && (
        <PromotionUserTab
          users={INITIAL_ATTRIBUTION_USERS}
          onShowToast={showToast}
        />
      )}

      {activeTab === 'performance' && (
        <PromotionPerformanceTab
          orders={INITIAL_ORDER_ATTRIBUTIONS}
          onShowToast={showToast}
        />
      )}

      {activeTab === 'settlement' && (
        <PromotionSettlementTab
          batches={batches}
          onOpenTransferModal={b => setTransferBatchTarget(b)}
          onShowToast={showToast}
        />
      )}

      {/* 交互式弹窗集 */}
      <AssignPromoterModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleAddPromoter}
      />

      <AttributionRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <CustomerAttributionDrawer
        promoter={selectedPromoterForAttribution}
        onClose={() => setSelectedPromoterForAttribution(null)}
      />

      <ReconciliationModal
        promoter={selectedPromoterForReconciliation}
        onClose={() => setSelectedPromoterForReconciliation(null)}
      />

      <RiskInterventionModal
        promoter={selectedPromoterForRisk}
        onClose={() => setSelectedPromoterForRisk(null)}
        onResolve={handleResolveRisk}
      />

      <VoucherTransferModal
        batch={transferBatchTarget}
        isOpen={Boolean(transferBatchTarget)}
        onClose={() => setTransferBatchTarget(null)}
        onConfirmTransfer={handleConfirmTransfer}
      />
    </div>
  );
};
