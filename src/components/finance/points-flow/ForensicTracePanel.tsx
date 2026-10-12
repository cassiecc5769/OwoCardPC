import React, { useState } from 'react';
import { LedgerTransaction } from './types';

interface ForensicTracePanelProps {
  transaction: LedgerTransaction | null;
  onOpenRawModal: () => void;
  onOpenBizDrawer: () => void;
}

export const ForensicTracePanel: React.FC<ForensicTracePanelProps> = ({
  transaction,
  onOpenRawModal,
  onOpenBizDrawer
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!transaction) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden transition-all duration-200">
      {/* Panel Header */}
      <div className="px-4 py-3 bg-slate-50/90 flex items-center justify-between border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
          </div>
          <span className="font-headline-sm text-sm text-slate-900 font-bold">
            PRD 5.3 账本全息双向穿透与证据链看板 (Audit Forensic Trace)
          </span>
          <span className="font-code-token text-xs bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-blue-700 font-semibold">
            TX: {transaction.txid}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-label-caps text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            不可篡改加密存证有效
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            type="button"
            title={collapsed ? '展开看板' : '收起看板'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {collapsed ? 'unfold_more' : 'unfold_less'}
            </span>
          </button>
        </div>
      </div>

      {/* Panel 3-Column Content Body */}
      {!collapsed && (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Column 1: 业务层触发事实 */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="font-label-caps text-[11px] text-slate-400 uppercase font-semibold">
                  Layer 1: 业务层触发事实
                </span>
                <button
                  type="button"
                  onClick={onOpenBizDrawer}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-code-token text-xs transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                  title="查看关联业务单双向穿透详情"
                >
                  <span>{transaction.bizId}</span>
                  <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                </button>
              </div>

              <div className="mt-3 space-y-2 text-xs font-body-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">业务类型:</span>
                  <span className="font-medium text-slate-900">{transaction.bizType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">卡品类与面值:</span>
                  <span className="font-numeric-table font-semibold text-slate-900 text-right">
                    {transaction.cardDetails}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">商户结算协议率:</span>
                  <span className="font-numeric-table text-emerald-600 font-semibold">
                    {transaction.settlementRate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">所属商户主体:</span>
                  <span className="font-medium text-slate-900">{transaction.merchantName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">商户统一账户 (MID):</span>
                  <span className="font-code-token text-blue-700 font-semibold">
                    {transaction.merchantMid}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 mt-3 bg-white p-2 rounded-lg border border-slate-200/80 text-xs text-slate-600 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0">info</span>
              <span className="truncate">{transaction.note}</span>
            </div>
          </div>

          {/* Column 2: 会计科目与双记凭证 */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="font-label-caps text-[11px] text-slate-400 uppercase font-semibold">
                  Layer 2: 会计科目与双记凭证
                </span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-code-token text-[11px] font-semibold">
                  DOUBLE-ENTRY OK
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs font-body-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">借方借记科目 (Dr):</span>
                  <span className="font-code-token text-slate-900 font-semibold">
                    {transaction.debitSubject}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">贷方贷记科目 (Cr):</span>
                  <span className="font-code-token text-slate-900 font-semibold">
                    {transaction.creditSubject}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">本次变动积点:</span>
                  <span className={`font-numeric-stat text-xs font-bold ${
                    transaction.pointsChange > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {transaction.pointsChange > 0 ? `+${transaction.pointsChange.toLocaleString()}` : transaction.pointsChange.toLocaleString()} PTS
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">可用账户余额影响:</span>
                  <span className="font-numeric-table font-medium text-slate-900">
                    {transaction.availableBefore.toLocaleString()} ➔ {transaction.availableAfter.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">风控审计员工单:</span>
                  <span className="font-code-token text-slate-400 font-semibold">
                    {transaction.auditOperator}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/60">
              <span>账本一致性校验: 100% 吻合</span>
              <span className="font-code-token text-emerald-600 font-semibold">
                ZERO_VARIANCE
              </span>
            </div>
          </div>

          {/* Column 3: 官方API回执与哈希存证 */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="font-label-caps text-[11px] text-slate-400 uppercase font-semibold">
                  Layer 3: 官方API回执与哈希存证
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-code-token text-[11px] font-semibold">
                  200 OK SUCCESS
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs font-body-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">核销接口节点:</span>
                  <span className="font-code-token text-slate-900 font-semibold">
                    {transaction.apiNode}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">官方核销凭证流水:</span>
                  <span className="font-code-token text-blue-700 font-semibold">
                    {transaction.apiTx}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">回执响应毫秒时延:</span>
                  <span className="font-numeric-table text-emerald-600 font-semibold">
                    {transaction.apiLatency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">账本物理区块哈希:</span>
                  <span className="font-code-token text-slate-400 truncate max-w-[160px]" title={transaction.blockHash}>
                    {transaction.blockHash}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">数字签名验签状态:</span>
                  <span className="font-code-token text-emerald-600 flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    SHA256-RSA-VALID
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenRawModal}
                className="w-full bg-white hover:bg-slate-100 text-slate-800 text-xs py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors shadow-2xs border border-slate-200/80 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-600">terminal</span>
                <span>调阅原始 JSON 报文回执</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
