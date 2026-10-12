import React from 'react';
import { RechargeAuditRecord } from '../../types/rechargeAudit';

interface RechargeProofModalProps {
  record: RechargeAuditRecord | null;
  onClose: () => void;
  onVerify: (record: RechargeAuditRecord) => void;
  onReject: (record: RechargeAuditRecord) => void;
}

export const RechargeProofModal: React.FC<RechargeProofModalProps> = ({
  record,
  onClose,
  onVerify,
  onReject
}) => {
  if (!record) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              record.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <span className="material-symbols-outlined text-[20px]">
                {record.proofType === 'blockchain' ? 'deployed_code' : record.proofType === 'swift' ? 'description' : 'receipt_long'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">充值凭据电子存证与风控核验</h3>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {record.orderNo}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                商户主体: {record.merchantName} ({record.tier}) · MID: {record.mid}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-700">
          {/* Status & Anti-fraud badge */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            record.status === 'rejected'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : record.status === 'credited'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[22px]">
                {record.status === 'rejected' ? 'gpp_bad' : 'verified'}
              </span>
              <div>
                <div className="font-bold text-xs flex items-center gap-2">
                  <span>图像与报文反欺诈检测：</span>
                  {record.status === 'rejected' ? (
                    <span className="text-rose-700 font-extrabold">高危篡改拦截 (评分: {record.exifSecurityScore}/100)</span>
                  ) : (
                    <span className="text-emerald-700 font-bold">合规存证校验通过 (评分: {record.exifSecurityScore}/100)</span>
                  )}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {record.status === 'rejected' ? record.rejectReason : '无图片 EXIF 篡改痕迹，链上 / 银行电报要素与清算网关 100% 勾稽一致。'}
                </div>
              </div>
            </div>
          </div>

          {/* Electronic Voucher Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[11px]">
              <span className="text-slate-500 font-sans font-semibold">凭证类别:</span>
              <span className="font-bold text-slate-800 uppercase">
                {record.proofType === 'blockchain' ? 'TRC20 链上交易哈希 (BLOCKCHAIN TXID)' :
                 record.proofType === 'swift' ? 'SWIFT MT103 离岸银行报文' :
                 record.proofType === 'fake_alert' ? '本地银行电子回单 (存疑)' : '银行电子汇款水单'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block font-sans">申报充值原币资金:</span>
                <span className="text-base font-bold text-slate-900">
                  {record.currency === 'NGN' ? `₦${record.amount.toLocaleString()}` : `$${record.amount.toLocaleString()} ${record.currency}`}
                </span>
                <span className="text-[10px] text-slate-400 block font-sans">网络通道: {record.currencySub}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-sans">折算应发行积点:</span>
                <span className="text-base font-bold text-emerald-700">+{record.pointsCredited.toLocaleString()} PTS</span>
                <span className="text-[10px] text-slate-400 block font-sans">基准锁定汇率: 1 USD = {record.exchangeRate} PTS</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">付款方账户:</span>
                <span className="text-slate-800 font-bold">{record.payerAccount || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">收款归集账户:</span>
                <span className="text-slate-800">{record.receivingAccount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans">凭证流水指纹:</span>
                <span className="text-blue-700 font-bold truncate max-w-xs">{record.proofRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">网关对账状态:</span>
                <span className="text-emerald-700 font-semibold">{record.proofStatus}</span>
              </div>
            </div>
          </div>

          {/* Audit Chain Context */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 text-[11px]">
            <div className="font-bold text-slate-900 font-sans text-xs mb-1">经办与复核链条记录</div>
            <div className="flex justify-between">
              <span className="text-slate-500">申报提交时间:</span>
              <span className="font-mono text-slate-800">{record.createTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">经办出纳:</span>
              <span className="text-slate-800 font-medium">{record.teller}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">复核审核岗:</span>
              <span className="text-slate-800 font-medium">{record.reviewer}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            关闭预览
          </button>
          <div className="flex items-center gap-2">
            {record.status === 'pending' && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onReject(record);
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
                >
                  驳回此单
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onVerify(record);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>确凿到账 · 核验通过</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
