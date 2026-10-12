import React, { useState } from 'react';
import { NavPath } from '../types';
import {
  INITIAL_DISPUTE_CASES,
  DisputeCaseItem
} from '../data/mockDisputes';
import { DisputeAuditLogModal } from './DisputeAuditLogModal';
import { DisputeCaseLawModal } from './DisputeCaseLawModal';
import { DisputeSpecialOrderModal } from './DisputeSpecialOrderModal';

interface DisputeResolutionViewProps {
  onNavigate?: (path: NavPath) => void;
}

// 售后争议标准 9 步流程
export type DisputeWorkflowStep =
  | 'initiate'             // 1. 用户/商户发起
  | 'create_ticket'        // 2. 生成售后单
  | 'assemble_evidence'    // 3. 系统自动组装证据
  | 'candidate_judgment'   // 4. 责任候选判断
  | 'cs_review'            // 5. 客服审核
  | 'confirm_liability'    // 6. 责任确认
  | 'verdict_action'       // 7. 赔付/补偿/驳回
  | 'finance_processing'   // 8. 财务处理
  | 'completed';           // 9. 完成

export const DisputeResolutionView: React.FC<DisputeResolutionViewProps> = ({ onNavigate }) => {
  // Mode: 'list' (售后争议案卷大盘) or 'detail' (三方质证与定损详情)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Case list state
  const [cases, setCases] = useState<DisputeCaseItem[]>(INITIAL_DISPUTE_CASES);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>(['DIS-20260827-0091']);
  const [activeCase, setActiveCase] = useState<DisputeCaseItem>(INITIAL_DISPUTE_CASES[0]);

  // Filtering states
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('all');

  // Detail view state: 证据自动组装分栏切换
  const [evidenceTab, setEvidenceTab] = useState<
    'all' | 'user' | 'card_check' | 'snapshot' | 'merchant' | 'cs_log' | 'timeline' | 'proof_attachment'
  >('all');

  // 责任判定与处置决策
  const [liabilityDecision, setLiabilityDecision] = useState<'USER_FAULT' | 'MERCHANT_FAULT' | 'PLATFORM_SUBVENTION'>('USER_FAULT');
  const [verdictAction, setVerdictAction] = useState<'COMPENSATE' | 'SUBSIDY' | 'REJECT'>('REJECT');
  const [verdictReasonText, setVerdictReasonText] = useState<string>(
    '经系统自动汇总比对，官方 Card Check 时间戳显示该卡密在出卡人上传前 125 秒已在第三方账号核销兑换完毕。出卡人未能提供在此时间点前的未消费官方证据。判定出卡人全责，对该申诉予以驳回，解冻商户质押金并归档。'
  );

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isConcluded, setIsConcluded] = useState<boolean>(false);

  // Modals state
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);
  const [isCaseLawOpen, setIsCaseLawOpen] = useState<boolean>(false);
  const [isSpecialOrderOpen, setIsSpecialOrderOpen] = useState<boolean>(false);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string } | null>(null);

  const showToast = (title: string, desc: string) => {
    setToastMsg({ title, desc });
    setTimeout(() => setToastMsg(null), 4500);
  };

  // Selection handlers
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCaseIds(filteredCases.map(c => c.id));
    } else {
      setSelectedCaseIds([]);
    }
  };

  const handleToggleRow = (id: string) => {
    if (selectedCaseIds.includes(id)) {
      setSelectedCaseIds(selectedCaseIds.filter(i => i !== id));
    } else {
      setSelectedCaseIds([...selectedCaseIds, id]);
    }
  };

  // Open detail view
  const handleOpenDetail = (c: DisputeCaseItem) => {
    setActiveCase(c);
    setIsConcluded(c.status === 'closed');
    if (c.arbitrationVerdict) {
      setLiabilityDecision(c.arbitrationVerdict.decision);
      setVerdictReasonText(c.arbitrationVerdict.legalReasonText);
    }
    setViewMode('detail');
  };

  // 执行最终责任确认 ➔ 处置指令 ➔ 财务处理 ➔ 完成
  const handleExecuteArbitration = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsConcluded(true);

      const actionTextMap = {
        COMPENSATE: '已执行全额先行赔付放款',
        SUBSIDY: '已执行适当客诉补贴',
        REJECT: '已驳回出卡人申诉，结案归档'
      };

      const updated: DisputeCaseItem = {
        ...activeCase,
        status: 'closed',
        statusBadgeText: '已结案 (完成)',
        statusBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        arbitrationVerdict: {
          decision: liabilityDecision,
          decisionText:
            liabilityDecision === 'USER_FAULT'
              ? '裁定出卡方责任'
              : liabilityDecision === 'MERCHANT_FAULT'
              ? '裁定商户责任 (扣保赔付)'
              : '平台兜底垫付',
          legalReasonText: verdictReasonText,
          finCommandId: `CMD-FIN-${Date.now().toString().slice(-8)}`,
          executedAt: new Date().toLocaleTimeString(),
          isClosed: true
        }
      };

      setCases(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      setActiveCase(updated);

      showToast(
        '售后争议裁决与财务处理已完成',
        `责任已确认：【${updated.arbitrationVerdict?.decisionText}】· 处置动作：【${actionTextMap[verdictAction]}】· 财务凭证已自动生成！`
      );
    }, 700);
  };

  // Filtered cases - PRD 规定: 待处理 / 处理中 / 待责任确认 / 待赔付 / 已完成
  const filteredCases = cases.filter(c => {
    if (activeTab === 'pending' && c.status !== 'awaiting_evidence') return false;
    if (activeTab === 'processing' && c.status !== 'processing' && c.status !== 'under_review') return false;
    if (activeTab === 'confirming' && c.status !== 'awaiting_acceptance') return false;
    if (activeTab === 'compensating' && c.status !== 'awaiting_settlement') return false;
    if (activeTab === 'completed' && c.status !== 'closed') return false;
    if (activeTab === 'redeemed' && !c.disputeType.includes('已被兑换')) return false;
    if (activeTab === 'partial' && !c.disputeType.includes('面额')) return false;
    if (activeTab === 'invalid' && !c.disputeType.includes('无效')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchOrder = c.orderNo.toLowerCase().includes(q);
      const matchUser = c.userUid.toLowerCase().includes(q) || c.userName.toLowerCase().includes(q);
      const matchMerchant = c.merchantMid.toLowerCase().includes(q) || c.merchantName.toLowerCase().includes(q);
      if (!matchId && !matchOrder && !matchUser && !matchMerchant) return false;
    }

    if (stageFilter === 'merchant_resp' && c.status !== 'awaiting_evidence') return false;
    if (stageFilter === 'final_review' && c.status !== 'under_review') return false;
    if (stageFilter === 'settlement' && c.status !== 'awaiting_settlement') return false;

    return true;
  });

  const isAllSelected = filteredCases.length > 0 && filteredCases.every(c => selectedCaseIds.includes(c.id));

  // ==========================================================================
  // 详情视图：三方质证 · 系统自动组装证据与 9 步全闭环
  // ==========================================================================
  if (viewMode === 'detail') {
    const c = activeCase;
    return (
      <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased text-xs">
        {/* Toast Feedback */}
        {toastMsg && (
          <div className="fixed top-16 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
            <div>
              <div className="font-semibold text-xs text-white">{toastMsg.title}</div>
              <div className="font-mono text-[11px] text-slate-300">{toastMsg.desc}</div>
            </div>
          </div>
        )}

        {/* 顶部业务导航与控制栏 */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setViewMode('list')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>返回争议案卷列表</span>
            </button>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              售后争议裁决中心
            </h1>
            <span className="font-mono text-xs text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              案卷号: {c.id}
            </span>
            <span className="font-mono text-xs text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              关联卡单: {c.orderNo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">当前流转状态:</span>
            <span className={`px-2.5 py-1 rounded text-xs font-bold border ${c.statusBadgeColor}`}>
              {c.statusBadgeText}
            </span>
          </div>
        </header>

        {/* 售后争议标准 9 步流向条 */}
        <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600 text-[18px]">account_tree</span>
              <span className="font-bold text-slate-900 text-xs">售后争议标准全链路时序拓扑（9 阶段闭环）</span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">系统驱动 · 证据先行 · 财务闭环</span>
          </div>

          <div className="overflow-x-auto py-1">
            <div className="min-w-[900px] flex items-center justify-between relative px-2">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>

              {[
                { step: 1, label: '1. 用户/商户发起', state: 'past' },
                { step: 2, label: '2. 生成售后单', state: 'past' },
                { step: 3, label: '3. 自动组装证据', state: 'past' },
                { step: 4, label: '4. 责任候选判断', state: 'past' },
                { step: 5, label: '5. 客服审核', state: isConcluded ? 'past' : 'current' },
                { step: 6, label: '6. 责任确认', state: isConcluded ? 'past' : 'next' },
                { step: 7, label: '7. 赔付/补偿/驳回', state: isConcluded ? 'past' : 'next' },
                { step: 8, label: '8. 财务处理', state: isConcluded ? 'past' : 'next' },
                { step: 9, label: '9. 完成', state: isConcluded ? 'completed' : 'pending' }
              ].map(item => (
                <div key={item.step} className="flex flex-col items-center relative z-10 space-y-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    item.state === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : item.state === 'current'
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : item.state === 'past'
                      ? 'bg-slate-800 text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}>
                    {item.state === 'past' || item.state === 'completed' ? (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    ) : (
                      item.step
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold ${
                    item.state === 'current' ? 'text-blue-700 font-bold' : item.state === 'completed' ? 'text-emerald-700 font-bold' : 'text-slate-600'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 案卷核心诉求卡片 */}
        <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <span className="material-symbols-outlined text-[22px]">gavel</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-base">{c.cardName}</span>
                <span className="font-mono font-bold text-slate-800 text-sm bg-slate-100 px-2 py-0.5 rounded">
                  面额: {c.cardFaceValue}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono text-xs font-semibold border border-purple-100">
                  争议类型: {c.disputeType}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-xs flex-wrap">
                <span>出卡方: <strong className="text-slate-800 font-semibold">{c.userName}</strong> ({c.userUid})</span>
                <span>•</span>
                <span>承接商户: <strong className="text-slate-800 font-semibold">{c.merchantName}</strong> ({c.merchantMid})</span>
                <span>•</span>
                <span>涉案诉求金额: <strong className="text-rose-600 font-mono font-bold">{c.claimAmount}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-right">
              <div className="text-[10px] text-slate-400 font-medium">系统候选责任倾向</div>
              <div className="font-bold text-purple-700 text-xs">{c.initialVerdict}</div>
            </div>
            <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-right">
              <div className="text-[10px] text-emerald-700 font-medium">证据置信度</div>
              <div className="font-mono font-bold text-emerald-800 text-xs">98.4% (PASS)</div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 系统自动汇总证据中心 (7 大结构化证据包) */}
        {/* ==================================================================== */}
        <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">folder_zip</span>
              <span className="font-bold text-slate-900 text-sm">
                系统自动汇总证据包（用户提交 + Card Check + 状态快照 + 商户记录 + 客服记录 + 时间轴 + 凭证存证）
              </span>
            </div>
            <span className="text-slate-400 text-xs">规范十八全面对齐</span>
          </div>

          {/* 证据子分类导航 (统一标准风格) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 border-b border-slate-200 text-xs">
            {[
              { id: 'all', label: '全部证据汇总' },
              { id: 'user', label: '1. 用户提交信息' },
              { id: 'card_check', label: '2. Card Check' },
              { id: 'snapshot', label: '3. 状态快照' },
              { id: 'merchant', label: '4. 商户处理记录' },
              { id: 'cs_log', label: '5. 客服记录' },
              { id: 'timeline', label: '6. 时间轴' },
              { id: 'proof_attachment', label: '7. 凭证存证/附件' }
            ].map((tab) => {
              const isActive = evidenceTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setEvidenceTab(tab.id as any)}
                  className={`px-3.5 py-2.5 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-1.5 relative cursor-pointer text-xs ${
                    isActive
                      ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#004ac6]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 7 大证据块内容展示 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. 用户提交信息 */}
            {(evidenceTab === 'all' || evidenceTab === 'user') && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[16px]">person</span>
                  【1. 用户提交信息】申诉自述与主体画像
                </span>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 space-y-1 text-slate-700">
                  <p className="italic text-xs font-medium">{c.userEvidence.text}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">出卡人</span>
                    <span className="font-bold text-slate-800">{c.userName}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">用户等级</span>
                    <span className="font-bold text-blue-700">{c.userTier}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">风险评分</span>
                    <span className="font-bold text-emerald-700">{c.userRiskScore} (低危)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Card Check 官方验证 */}
            {(evidenceTab === 'all' || evidenceTab === 'card_check') && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">fact_check</span>
                  【2. Card Check】官方底层鉴真日志与时间戳
                </span>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">官方网关探针:</span>
                    <span className="font-mono font-bold text-slate-900">{c.officialGroundTruth.gatewayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">官方记录兑换时间:</span>
                    <span className="font-mono font-bold text-rose-600">{c.officialGroundTruth.redeemTimeEst}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">出卡提单时间戳:</span>
                    <span className="font-mono text-slate-800">{c.officialGroundTruth.platformOrderTimeEst}</span>
                  </div>
                  <div className="text-[11px] text-rose-800 bg-rose-50 p-1.5 rounded font-medium">
                    核心结论: {c.officialGroundTruth.forensicFinding}
                  </div>
                </div>
              </div>
            )}

            {/* 3. 状态快照 */}
            {(evidenceTab === 'all' || evidenceTab === 'snapshot') && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-indigo-600 text-[16px]">camera</span>
                  【3. 状态快照】立案时刻卡单核心数据快照
                </span>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">卡单原始状态:</span>
                    <span className="font-bold text-blue-700">处理中 (转入售后)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">商户锁定质押:</span>
                    <span className="font-bold text-amber-700">3,475 PTS (预扣冻结)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">快照保全哈希:</span>
                    <span className="text-[10px] text-slate-400">0x88f91a029cbff...snap_valid</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. 商户处理记录 */}
            {(evidenceTab === 'all' || evidenceTab === 'merchant') && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-[16px]">storefront</span>
                  【4. 商户处理记录】商户答辩陈词与接口回执
                </span>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 space-y-1 text-slate-700">
                  <p className="italic text-xs font-medium">{c.merchantEvidence.text}</p>
                </div>
                <div className="p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[10px] overflow-x-auto">
                  {c.merchantEvidence.apiRawJson}
                </div>
              </div>
            )}

            {/* 5. 客服记录 */}
            {(evidenceTab === 'all' || evidenceTab === 'cs_log') && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[16px]">support_agent</span>
                  【5. 客服记录】前序介入纪要与调解备忘
                </span>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between font-mono text-[11px] text-slate-400">
                    <span>处理人: OP-8821 (客服专员)</span>
                    <span>10:20:15</span>
                  </div>
                  <p>
                    用户咨询该笔 $500 Apple 卡单为何被阻断。客服向出卡人释明：商户接口报告已兑换，已要求双方限期上传官方核销凭证，并锁定保证金。
                  </p>
                </div>
              </div>
            )}

            {/* 6. 时间轴 (毫秒级时序比对) */}
            {(evidenceTab === 'all' || evidenceTab === 'timeline') && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-indigo-600 text-[16px]">timeline</span>
                  【6. 时间轴】三方事件时序比对 (Ground Truth)
                </span>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">1. 小票收银出票:</span>
                    <span className="font-semibold text-slate-800">{c.officialGroundTruth.ticketTimeEst}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono bg-rose-50 p-1.5 rounded">
                    <span className="text-rose-700 font-bold">2. 官方接口兑换核销:</span>
                    <span className="font-bold text-rose-700">{c.officialGroundTruth.redeemTimeEst}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">3. 用户平台提单:</span>
                    <span className="font-semibold text-slate-800">{c.officialGroundTruth.platformOrderTimeEst}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">4. 商户接单核销尝试:</span>
                    <span className="font-semibold text-slate-800">{c.officialGroundTruth.merchantAttemptTimeEst}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    时差判定: 官方兑换时间早于提单时间 125 秒（出卡前已被消费）
                  </div>
                </div>
              </div>
            )}

            {/* 7. 凭证存证/附件 (结构化电子要素，无多余图片) */}
            {(evidenceTab === 'all' || evidenceTab === 'proof_attachment') && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 md:col-span-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified</span>
                  【7. 凭证存证/附件】结构化电子存证与 EXIF 审计底稿
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200/60 space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>POS小票电子存证要素</span>
                      <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">EXIF PASS</span>
                    </div>
                    <div className="space-y-1 text-slate-600 text-[11px]">
                      <div>发票终端: BESTBUY #NY-88210 POS 直购</div>
                      <div>出票时间: 2026-08-27 15:30:10 EST</div>
                      <div>EXIF 设备: iPhone 14 Pro (GPS 纽约州经纬吻合)</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200/60 space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>卡背涂层电子存档要素</span>
                      <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">OCR 99.4%</span>
                    </div>
                    <div className="space-y-1 text-slate-600 text-[11px]">
                      <div>卡密脱敏: X89Q-****-299L (16位)</div>
                      <div>条码哈希: 0x99201a884ef...clean</div>
                      <div>涂层检测: 无 PS 二次篡改与遮盖迹象</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 客服审核 ➔ 责任确认 ➔ 赔付/补偿/驳回 ➔ 财务处理决策面板 */}
        {/* ==================================================================== */}
        <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">gavel</span>
              <span className="font-bold text-slate-900 text-sm">
                客服终审决策（责任确认 ➔ 赔付/补偿/驳回 ➔ 自动下发财务处理）
              </span>
            </div>
            {isConcluded && (
              <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                已生成财务结算指令，终态归档完成
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 责任确认 */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                责任主体认定 (责任确认)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'USER_FAULT', label: '出卡方全责', desc: '提单前已消费/售二手' },
                  { id: 'MERCHANT_FAULT', label: '商户责任', desc: '扣留卡密未如实履约' },
                  { id: 'PLATFORM_SUBVENTION', label: '平台先行垫付', desc: '官方通道延时/安全池兜底' }
                ].map(item => (
                  <button
                    key={item.id}
                    disabled={isConcluded}
                    onClick={() => setLiabilityDecision(item.id as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      liabilityDecision === item.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 处置动作 (赔付 / 补偿 / 驳回) */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                处置执行动作 (赔付/补偿/驳回)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'REJECT', label: '驳回申诉', desc: '解冻商户保证金，终结案卷' },
                  { id: 'COMPENSATE', label: '全额赔付用户', desc: '从商户质押扣款或平台垫付' },
                  { id: 'SUBSIDY', label: '客诉信誉补偿', desc: '发放 $20 平台优惠券补偿' }
                ].map(item => (
                  <button
                    key={item.id}
                    disabled={isConcluded}
                    onClick={() => setVerdictAction(item.id as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      verdictAction === item.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              终审裁决文书说理 (写入工单底稿与用户回执)
            </label>
            <textarea
              rows={3}
              disabled={isConcluded}
              value={verdictReasonText}
              onChange={e => setVerdictReasonText(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 leading-relaxed disabled:bg-slate-100"
            />
          </div>

          {/* 决策提交按钮 */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-mono">
              经办席位: OP-8821 · 终审仲裁专责 · 签署时效合规
            </span>

            {!isConcluded ? (
              <button
                disabled={isExecuting}
                onClick={handleExecuteArbitration}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isExecuting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                    <span>财务处理动账与归档中...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>确认责任并下发财务指令 (达成完成)</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  案卷已终结归档
                </span>
                <button
                  onClick={() => setViewMode('list')}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-medium text-xs cursor-pointer"
                >
                  返回列表
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ==========================================================================
  // 列表视图：售后争议案卷大盘
  // ==========================================================================
  return (
    <div className="flex flex-col w-full text-slate-800 antialiased text-xs space-y-4">
      {/* 头部定位 */}
      <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">售后争议管理中心</h1>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200">
              三方质证 · 证据链自动组装 · 定损赔付闭环
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            用户/商户发起 ➔ 生成售后单 ➔ 证据自动组装 ➔ 责任候选 ➔ 客服审核 ➔ 责任确认 ➔ 赔付/补偿/驳回 ➔ 财务处理 ➔ 完成。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-right">
            <span className="text-[10px] text-slate-500 block font-medium">当前在案争议</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{cases.length} 卷</span>
          </div>
          <div className="bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 text-right">
            <span className="text-[10px] text-rose-600 block font-medium">SLA 临期预警</span>
            <span className="font-mono font-bold text-rose-700 text-sm">
              {cases.filter(c => c.isUrgent).length} 卷
            </span>
          </div>
        </div>
      </section>

      {/* 搜索与阶段过滤 */}
      <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索争议案卷号、关联卡单号、用户、商户..."
              className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500 bg-slate-50/50"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: '全部' },
            { id: 'pending', label: '待处理' },
            { id: 'processing', label: '处理中' },
            { id: 'confirming', label: '待责任确认' },
            { id: 'compensating', label: '待赔付' },
            { id: 'completed', label: '已完成' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* 案卷列表数据表格 */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">案卷号 / 关联卡单</th>
                <th className="py-2.5 px-3">发起方</th>
                <th className="py-2.5 px-3">出卡用户</th>
                <th className="py-2.5 px-3">承揽商户</th>
                <th className="py-2.5 px-3">卡种 / 面额</th>
                <th className="py-2.5 px-3">争议类型与主张</th>
                <th className="py-2.5 px-3">涉案金额</th>
                <th className="py-2.5 px-3">流转状态</th>
                <th className="py-2.5 px-3">SLA 倒计时</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="space-y-0.5">
                      <button
                        onClick={() => handleOpenDetail(item)}
                        className="font-mono font-bold text-blue-600 hover:underline block text-xs cursor-pointer"
                      >
                        {item.id}
                      </button>
                      <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                        {item.orderNo}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800 text-[11px]">{item.initiator}</span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-900">{item.userName}</span>
                      <div className="font-mono text-[10px] text-slate-400">{item.userUid}</div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="space-y-0.5">
                      <span className="font-medium text-slate-800">{item.merchantName}</span>
                      <div className="font-mono text-[10px] text-slate-400">{item.merchantMid}</div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-800">{item.cardName}</div>
                      <div className="font-mono text-slate-900 font-bold">{item.cardFaceValue}</div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded font-semibold text-[11px] bg-purple-50 text-purple-700 border border-purple-200">
                      {item.disputeType}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-rose-600">
                    {item.claimAmount}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${item.statusBadgeColor}`}>
                      {item.statusBadgeText}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-500">
                    {item.slaRemaining}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleOpenDetail(item)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      质证裁决
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
