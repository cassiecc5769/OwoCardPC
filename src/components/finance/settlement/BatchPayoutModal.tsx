import React, { useState } from 'react';
import { SettlementLedgerItem } from './types';

interface BatchPayoutModalProps {
  isOpen: boolean;
  selectedItems: SettlementLedgerItem[];
  onClose: () => void;
  onConfirmPayout: (channel: string, secretKey: string) => void;
}

export const BatchPayoutModal: React.FC<BatchPayoutModalProps> = ({
  isOpen,
  selectedItems,
  onClose,
  onConfirmPayout
}) => {
  const [channel, setChannel] = useState<string>('CMB_DIRECT');
  const [approver, setApprover] = useState<string>('CFO-01 (财务总监双人签章)');
  const [pinCode, setPinCode] = useState<string>('888666');
  const [isCallingH2H, setIsCallingH2H] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalPayout = selectedItems.reduce((acc, item) => acc + item.actualPayoutAmount, 0);

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCallingH2H(true);
    setTimeout(() => {
      setIsCallingH2H(false);
      onConfirmPayout(channel, pinCode);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-slate-900">
                银企直联批量打款出账 (Host-to-Host Bank Direct Payout)
              </h3>
              <p className="text-xs text-slate-500 font-code-token">
                直联金融专网通道 ｜ 双人复核密匙联机验签
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

        {/* Form Body */}
        <form onSubmit={handleExecute} className="p-6 space-y-4 text-xs text-slate-700">
          {/* Summary Box */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-label-caps uppercase text-blue-800 font-semibold block">
                待出款总批次笔数
              </span>
              <div className="font-numeric-stat text-2xl font-bold text-slate-900 mt-0.5">
                {selectedItems.length} <span className="text-xs font-normal text-slate-500">份结算单</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-label-caps uppercase text-blue-800 font-semibold block">
                合计实际划拨总额
              </span>
              <div className="font-numeric-stat text-2xl font-bold text-blue-600 mt-0.5">
                ${totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xs font-normal text-slate-500 ml-1">USD</span>
              </div>
            </div>
          </div>

          {/* List of items preview */}
          <div className="border border-slate-200 rounded-lg max-h-36 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
            {selectedItems.map((item) => (
              <div key={item.id} className="p-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="font-code-token text-blue-600">{item.settlementNo}</span>
                    <span className="text-slate-400">|</span>
                    <span className="truncate max-w-[180px]">{item.targetEntity}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-code-token">
                    {item.channelName} · {item.period}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-numeric-table font-bold text-slate-900">
                    ${item.actualPayoutAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] font-code-token text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {item.status === 'SETTLED' ? '已结案' : '待放行'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Channel Selector */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              出账专用专网通道 (Payment Gateway Channel)
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="CMB_DIRECT">招商银行企业银企直连 (CMB Host-to-Host SSL-VPN)</option>
              <option value="USDT_CONTRACT">USDT (TRC20) 智能合约多签代付池</option>
              <option value="OPAY_DIRECT">OPay Nigeria Direct B2B 通道</option>
            </select>
          </div>

          {/* Double-Sign Approver & PIN */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                双人复核终审人 (Authorizer)
              </label>
              <select
                value={approver}
                onChange={(e) => setApprover(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="CFO-01 (财务总监双人签章)">CFO-01 (财务总监)</option>
                <option value="AUDIT-LEAD-03 (总审计师)">AUDIT-LEAD-03 (总审计师)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                U-Key 安全复核口令 (Security PIN)
              </label>
              <input
                type="password"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-code-token focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="输入6位安全口令"
              />
            </div>
          </div>

          {/* Security Guarantee notice */}
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
            <span className="material-symbols-outlined text-emerald-600 text-[16px]">security</span>
            <span>直连专网专线保障，一旦发起将生成不可篡改金融打款凭证与银行回单。</span>
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isCallingH2H}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${isCallingH2H ? 'animate-spin' : ''}`}>
                {isCallingH2H ? 'sync' : 'send'}
              </span>
              <span>{isCallingH2H ? '银企专网通讯打款中...' : '核验签名并联机出账'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
