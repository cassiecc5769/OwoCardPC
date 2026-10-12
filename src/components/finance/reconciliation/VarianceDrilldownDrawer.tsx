import React from 'react';
import { ReconVarianceItem } from './types';

interface VarianceDrilldownDrawerProps {
  item: ReconVarianceItem | null;
  onClose: () => void;
  onOpenAdjustModal: (item: ReconVarianceItem) => void;
}

export const VarianceDrilldownDrawer: React.FC<VarianceDrilldownDrawerProps> = ({
  item,
  onClose,
  onOpenAdjustModal
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">find_in_page</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-base font-bold text-slate-900">
                  四账穿透全景追踪
                </h3>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-code-token text-xs font-bold">
                  {item.diffNo}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-code-token">
                关联业务单: {item.relatedBizId} ｜ 触发节点: {item.nodeTrigger}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700">
          {/* Status & Diff Overview */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] font-label-caps uppercase text-slate-400 block font-semibold">
                差异分类
              </span>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 font-code-token">
                {item.typeName}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-label-caps uppercase text-slate-400 block font-semibold">
                核对差额 (PTS / 折合)
              </span>
              <span className="font-numeric-table font-bold text-red-600 text-sm mt-1 block">
                {item.diffPoints > 0 ? `+${item.diffPoints.toFixed(2)}` : item.diffPoints.toFixed(2)} PTS
                <span className="text-xs text-slate-500 font-normal ml-1">({item.diffCurrencyStr})</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] font-label-caps uppercase text-slate-400 block font-semibold">
                处置状态
              </span>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold font-code-token ${
                  item.status === 'SETTLED_BALANCED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.status === 'APPROVAL_IN_FLIGHT'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {item.status === 'SETTLED_BALANCED'
                  ? '已平账结案'
                  : item.status === 'APPROVAL_IN_FLIGHT'
                  ? '调账审批中'
                  : '待核查'}
              </span>
            </div>
          </div>

          {/* Root cause analysis */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-sm">
              <span className="material-symbols-outlined text-red-500 text-[18px]">bug_report</span>
              <span>故障根因与责任归属分析</span>
            </div>
            <div className="p-4 bg-red-50/40 border border-red-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-red-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  {item.rootCause}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200/80 font-code-token text-[11px] text-slate-700">
                  责任: {item.responsibility}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-body-sm">
                {item.rootCauseDetail}
              </p>
            </div>
          </div>

          {/* Quad-Ledger Evidence Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-sm">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">account_tree</span>
                <span>PRD 7.1 四账流水双向证据链条 (Evidence Ledger)</span>
              </div>
              <span className="text-[11px] font-code-token text-slate-400">实时快照存证</span>
            </div>

            <div className="space-y-2.5">
              {/* Ledger 1: 业务账 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-code-token text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      NODE 01 业务账
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      收卡/充值业务流水
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-code-token">
                    单号: {item.ledgerEvidence.bizLedgerEntry?.id} ｜ 时间: {item.ledgerEvidence.bizLedgerEntry?.time}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-numeric-table font-semibold text-slate-900 text-xs">
                    ¥{item.ledgerEvidence.bizLedgerEntry?.amount.toFixed(2)}
                  </div>
                  <span className="text-[10px] font-code-token text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {item.ledgerEvidence.bizLedgerEntry?.status}
                  </span>
                </div>
              </div>

              {/* Ledger 2: 积点账 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-code-token text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      NODE 02 积点账
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      商户积点账户流水
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-code-token">
                    TxID: {item.ledgerEvidence.pointsLedgerEntry?.txid} ｜ 时间: {item.ledgerEvidence.pointsLedgerEntry?.time}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-numeric-table font-semibold text-red-600 text-xs">
                    {item.ledgerEvidence.pointsLedgerEntry?.points.toFixed(2)} PTS
                  </div>
                  <span className="text-[10px] font-code-token text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                    {item.ledgerEvidence.pointsLedgerEntry?.status}
                  </span>
                </div>
              </div>

              {/* Ledger 3: 结算账 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-code-token text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      NODE 03 结算账
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      商户日切结算账单
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-code-token">
                    批次: {item.ledgerEvidence.settleLedgerEntry?.batchId} ｜ 汇率: {item.ledgerEvidence.settleLedgerEntry?.rate}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-code-token text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                    {item.ledgerEvidence.settleLedgerEntry?.status}
                  </span>
                </div>
              </div>

              {/* Ledger 4: 资金账 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-code-token text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      NODE 04 资金账
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      第三方银行/链上流水
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-code-token">
                    通道: {item.ledgerEvidence.bankLedgerEntry?.channel} ｜ 凭证: {item.ledgerEvidence.bankLedgerEntry?.bankTx}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-code-token text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1 justify-end">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    存证验签通过
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SOP Compliance Step Flow */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-800 block">SOP 闭环处置进度 (标准作业流程)</span>
            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>告警与资金锁定</span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>全景根因定位</span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${item.status === 'SETTLED_BALANCED' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
                  {item.status === 'SETTLED_BALANCED' ? '✓' : '3'}
                </span>
                <span className="font-semibold text-blue-900">生成调整单并平账</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            经办审计师: <span className="font-code-token text-slate-800 font-semibold">{item.auditor}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium text-xs transition-colors"
            >
              关闭
            </button>
            {item.status !== 'SETTLED_BALANCED' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdjustModal(item);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">balance</span>
                <span>发起标准账户调整单平账</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
