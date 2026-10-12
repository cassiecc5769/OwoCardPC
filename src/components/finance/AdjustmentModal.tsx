import React, { useState, useEffect } from 'react';
import { MerchantLedgerItem, AdjustmentType, AdjustmentTicket } from '../../types/financeAccount';

interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchants: MerchantLedgerItem[];
  preselectedMid?: string | null;
  onSubmitAdjustment: (ticket: AdjustmentTicket) => void;
}

export const AdjustmentModal: React.FC<AdjustmentModalProps> = ({
  isOpen,
  onClose,
  merchants,
  preselectedMid,
  onSubmitAdjustment
}) => {
  const [targetMid, setTargetMid] = useState<string>(merchants[0]?.mid || 'M0192');
  const [adjType, setAdjType] = useState<AdjustmentType>('INCREASE');
  const [amount, setAmount] = useState<string>('500000.00');
  const [docRef, setDocRef] = useState<string>('BANK-DEP-20250518-8829');
  const [reason, setReason] = useState<string>('');
  const [approver, setApprover] = useState<string>('风控总监 (AUDIT-DIR-01)');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (preselectedMid && merchants.some(m => m.mid === preselectedMid)) {
      setTargetMid(preselectedMid);
    } else if (merchants.length > 0 && !merchants.some(m => m.mid === targetMid)) {
      setTargetMid(merchants[0].mid);
    }
  }, [preselectedMid, merchants]);

  if (!isOpen) return null;

  const currentMerchant = merchants.find(m => m.mid === targetMid) || merchants[0];
  const numAmount = parseFloat(amount) || 0;

  // Dynamic simulation based on adjustment type
  let simulatedAvailable = currentMerchant?.availablePoints || 0;
  let simulatedFrozen = currentMerchant?.frozenEscrowPoints || 0;
  let simulatedTotal = currentMerchant?.totalPoints || 0;

  if (adjType === 'INCREASE') {
    simulatedAvailable += numAmount;
    simulatedTotal += numAmount;
  } else if (adjType === 'DECREASE') {
    simulatedAvailable = Math.max(0, simulatedAvailable - numAmount);
    simulatedTotal = Math.max(0, simulatedTotal - numAmount);
  } else if (adjType === 'FREEZE') {
    const actualFreeze = Math.min(simulatedAvailable, numAmount);
    simulatedAvailable -= actualFreeze;
    simulatedFrozen += actualFreeze;
  } else if (adjType === 'UNFREEZE') {
    const actualUnfreeze = Math.min(simulatedFrozen, numAmount);
    simulatedFrozen -= actualUnfreeze;
    simulatedAvailable += actualUnfreeze;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 15) {
      setErrorMessage('依照 PRD 3.4 审计规则，调账合规理由必填且不得少于 15 个字。');
      return;
    }
    if (numAmount <= 0) {
      setErrorMessage('变动调整积点数量必须大于 0。');
      return;
    }

    const typeLabels: Record<AdjustmentType, string> = {
      INCREASE: '平台人工增记积点 (+PTS - 线下银行转账到账)',
      DECREASE: '平台人工扣减积点 (-PTS - 欺诈伪卡坏账核销)',
      FREEZE: '在途紧急押款冻结 (可用转冻结)',
      UNFREEZE: '合规解除冻结 (冻结转可用)'
    };

    const randomHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newTicket: AdjustmentTicket = {
      id: `ADJ-${Date.now()}`,
      ticketNo: `#ADJ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      targetMid: currentMerchant.mid,
      targetName: currentMerchant.name,
      type: adjType,
      typeLabel: typeLabels[adjType],
      deltaAmount: numAmount,
      preAvailable: currentMerchant.availablePoints,
      postAvailable: simulatedAvailable,
      preTotal: currentMerchant.totalPoints,
      postTotal: simulatedTotal,
      docRef: docRef.trim() || `SYS-REF-${Date.now()}`,
      reason: reason.trim(),
      applicant: '财务主管 (AUDIT-MGR-08)',
      approver,
      status: 'APPROVED',
      timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
      ledgerHash: randomHash
    };

    onSubmitAdjustment(newTicket);
    setReason('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                发起商户积点调整单 (双人复核)
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                SYS-ACC-PTS-V2 · PRD-SPEC-3.4 TWO-MAN RULE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs text-slate-700">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
              <span className="font-medium text-[12px]">{errorMessage}</span>
            </div>
          )}

          {/* Target Merchant Selector & Adjustment Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                目标调整商户主体 *
              </label>
              <select
                value={targetMid}
                onChange={e => {
                  setTargetMid(e.target.value);
                  setErrorMessage('');
                }}
                className="h-9 px-3 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-medium cursor-pointer"
                required
              >
                {merchants.map(m => (
                  <option key={m.mid} value={m.mid}>
                    {m.mid} - {m.name} (可用: {m.availablePoints.toLocaleString()} PTS)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                调整类型 *
              </label>
              <select
                value={adjType}
                onChange={e => {
                  setAdjType(e.target.value as AdjustmentType);
                  setErrorMessage('');
                }}
                className="h-9 px-3 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-medium cursor-pointer"
                required
              >
                <option value="INCREASE">平台人工增记积点 (+PTS - 线下银行转账到账)</option>
                <option value="DECREASE">平台人工扣减积点 (-PTS - 欺诈伪卡坏账核销)</option>
                <option value="FREEZE">在途紧急押款冻结 (可用转冻结)</option>
                <option value="UNFREEZE">合规解除冻结 (冻结转可用)</option>
              </select>
            </div>
          </div>

          {/* Amount & Doc Ref */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                变动调整积点数量 (PTS) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={e => {
                    setAmount(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="例如: 500000.00"
                  className="w-full h-9 pl-3 pr-12 bg-slate-50 text-slate-900 font-mono text-sm font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-slate-400 font-bold">
                  PTS
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                关联交易凭据 / 工单编号 *
              </label>
              <input
                type="text"
                value={docRef}
                onChange={e => {
                  setDocRef(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="如: BANK-DEP-20250518-8829"
                className="w-full h-9 px-3 bg-slate-50 text-slate-900 font-mono text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

          {/* Mathematical Balance Simulation Card */}
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">calculate</span>
                恒等式核算预演 (Simulation)
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                公式: 总积点 = 可用积点 + 在途冻结
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs font-mono pt-1 text-slate-600 border-t border-blue-100/60 mt-1">
              <span>
                调账前可用: <strong className="text-slate-900 font-bold">{currentMerchant?.availablePoints.toLocaleString('en-US', { minimumFractionDigits: 2 })} PTS</strong>
              </span>
              <span className="text-blue-600 font-bold mx-2">➔</span>
              <span>
                调账后预计可用: <strong className="text-emerald-700 font-bold text-[13px]">{simulatedAvailable.toLocaleString('en-US', { minimumFractionDigits: 2 })} PTS</strong>
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
              <span>调账后总积点: <strong className="text-slate-800">{simulatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} PTS</strong></span>
              <span>冻结保证金: <strong className="text-blue-700">{simulatedFrozen.toLocaleString('en-US', { minimumFractionDigits: 2 })} PTS</strong></span>
            </div>
          </div>

          {/* Reason / Audit Explanation */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                申请理由与合规审查说明 (必填不少于15字) *
              </label>
              <span className={`font-mono text-[10px] ${reason.trim().length >= 15 ? 'text-emerald-600' : 'text-amber-600'}`}>
                已录入 {reason.trim().length} / 15 字
              </span>
            </div>
            <textarea
              rows={3}
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                setErrorMessage('');
              }}
              placeholder="请详尽录入调账事实依据、资金划转流水号及业务合规审批会签意见，提交后抄送第二复核岗..."
              className="w-full p-3 bg-slate-50 text-slate-900 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
              required
            />
          </div>

          {/* Approver Designation */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">person_check</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900 text-xs">
                  指定第二复核人 (Two-man Checker)
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  需持有 F-AUDIT-L2 密钥签名权限
                </span>
              </div>
            </div>
            <select
              value={approver}
              onChange={e => setApprover(e.target.value)}
              className="h-8 px-3 bg-white text-slate-800 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option>风控总监 (AUDIT-DIR-01)</option>
              <option>清算合规主管 (SETTLE-LEAD-03)</option>
              <option>财务总监 (CFO-AUTH-02)</option>
            </select>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>提报审批流水并锁定</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
