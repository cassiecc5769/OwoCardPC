import React, { useState } from 'react';
import { DisputeCaseItem } from '../data/mockDisputes';

interface DisputeSpecialOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newCase: Partial<DisputeCaseItem>) => void;
}

export const DisputeSpecialOrderModal: React.FC<DisputeSpecialOrderModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  if (!isOpen) return null;

  const [orderNo, setOrderNo] = useState('ORD-20260827-9912');
  const [cardName, setCardName] = useState('Apple Gift Card US $200.00');
  const [disputeType, setDisputeType] = useState('卡密已被兑换');
  const [claimAmount, setClaimAmount] = useState('200.00');
  const [reason, setReason] = useState('商户反馈接口提示卡密已被使用，出卡方声称刚在超市购得，需特许立案调取官方时间戳质证。');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      orderNo,
      cardName,
      disputeType,
      claimAmount: `$${claimAmount}`,
      pointsConverted: `${(parseFloat(claimAmount) * 6.95).toFixed(0)} PTS`,
      claimDetail: reason
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in text-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">add_task</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">发起特许售后争议工单</span>
              <p className="text-xs text-slate-400 mt-0.5">人工强制立案并立即冻结商户对应履约保证金</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700">关联原卡单号</label>
            <input
              type="text"
              required
              value={orderNo}
              onChange={e => setOrderNo(e.target.value)}
              className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              placeholder="例如: ORD-20260827-9912"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">卡种品类及面额</label>
              <input
                type="text"
                required
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">涉案争议诉求金额 ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={claimAmount}
                onChange={e => setClaimAmount(e.target.value)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700">争议类型</label>
            <select
              value={disputeType}
              onChange={e => setDisputeType(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
            >
              <option value="卡密已被兑换">卡密已被兑换 (核销时间互斥)</option>
              <option value="面额少充/不符">面额少充/不符 (差额追偿)</option>
              <option value="卡密无效/错误">卡密无效/格式校验失败</option>
              <option value="跨区Geo不匹配">跨区国家限制无法充值</option>
              <option value="黑卡欺诈拦截">黑卡恶意刷单与司法倒查</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700">立案事实自述与核验要求</label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
            ></textarea>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">info</span>
            <span>特许立案提交后将实时进入 48h SLA 仲裁倒计时，并对商户保证金实施刚性先行保全。</span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">done</span>
              <span>确认立案并锁定保证金</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
