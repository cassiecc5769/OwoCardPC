import React from 'react';
import { NavPath } from '../../../types';
import { LedgerTransaction } from './types';

interface BizDetailDrawerProps {
  transaction: LedgerTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: NavPath) => void;
}

export const BizDetailDrawer: React.FC<BizDetailDrawerProps> = ({
  transaction,
  isOpen,
  onClose,
  onNavigate
}) => {
  if (!isOpen || !transaction) return null;

  const handleCrossModuleJump = () => {
    if (!onNavigate) return;
    if (transaction.bizId.startsWith('KD')) {
      onNavigate('order-management');
    } else if (transaction.bizId.startsWith('TOP')) {
      onNavigate('recharge-management');
    } else if (transaction.bizId.startsWith('ARB')) {
      onNavigate('dispute-resolution');
    } else if (transaction.bizId.startsWith('FIN')) {
      onNavigate('points-account');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">assignment</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-headline-sm">
                  关联业务单双向穿透
                </h3>
                <span className="font-code-token text-xs px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                  {transaction.bizId}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-code-token mt-0.5">
                TXID: {transaction.txid}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Card Info */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">业务类型</span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px]">
                {transaction.bizType}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">关联积点流水</span>
              <span className="font-code-token font-semibold text-slate-800">{transaction.txid}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">发生时间</span>
              <span className="font-numeric-table text-slate-700">{transaction.fullTime}</span>
            </div>
          </div>

          {/* Merchant Entity */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-label-caps">
              商户主体档案
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-900 font-semibold text-sm">{transaction.merchantName}</span>
              <span className="font-code-token text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                {transaction.merchantMid}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>协议费率:</span>
              <span className="font-numeric-table font-semibold text-emerald-600">{transaction.settlementRate}</span>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-label-caps">
              履约品类与凭据
            </div>
            <div className="text-slate-900 font-semibold">{transaction.cardDetails}</div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 text-slate-600 text-xs leading-relaxed">
              {transaction.note}
            </div>
          </div>

          {/* Ledger Accounting Impact */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-label-caps">
              双记复式账目影响
            </div>
            <div className="space-y-1.5 font-code-token text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">借方科目 (Dr):</span>
                <span className="text-slate-900 font-semibold">{transaction.debitSubject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">贷方科目 (Cr):</span>
                <span className="text-slate-900 font-semibold">{transaction.creditSubject}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200/80">
                <span className="text-slate-500">积点净变动:</span>
                <span className={`font-numeric-stat font-bold text-xs ${transaction.pointsChange > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {transaction.pointsChange > 0 ? `+${transaction.pointsChange.toLocaleString()}` : transaction.pointsChange.toLocaleString()} PTS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={handleCrossModuleJump}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span>跳转至业务模块调阅详情</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-lg font-medium text-xs transition-colors cursor-pointer shadow-2xs"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
