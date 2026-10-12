import React, { useState } from 'react';
import { RechargeAuditRecord } from '../../types/rechargeAudit';

export type ActionModalType = 'VERIFY' | 'CREDIT_PTS' | 'REJECT';

interface RechargeAuditActionModalProps {
  isOpen: boolean;
  type: ActionModalType;
  record: RechargeAuditRecord | null;
  onClose: () => void;
  onConfirm: (recordId: string, actionType: ActionModalType, remark?: string) => void;
}

export const RechargeAuditActionModal: React.FC<RechargeAuditActionModalProps> = ({
  isOpen,
  type,
  record,
  onClose,
  onConfirm
}) => {
  const [confirmedCheck, setConfirmedCheck] = useState<boolean>(false);
  const [rejectReasonType, setRejectReasonType] = useState<string>('假水单或篡改凭证');
  const [remark, setRemark] = useState<string>('');

  if (!isOpen || !record) return null;

  const handleAction = () => {
    if (type === 'VERIFY' && !confirmedCheck) return;
    const finalRemark = type === 'REJECT' ? `${rejectReasonType}: ${remark || '未提供详细备注'}` : remark;
    onConfirm(record.id, type, finalRemark);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              type === 'VERIFY' ? 'bg-blue-100 text-blue-700' :
              type === 'CREDIT_PTS' ? 'bg-emerald-100 text-emerald-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              <span className="material-symbols-outlined text-[20px]">
                {type === 'VERIFY' ? 'account_balance_wallet' :
                 type === 'CREDIT_PTS' ? 'currency_exchange' : 'block'}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {type === 'VERIFY' && '出纳资金核验到账确认'}
                {type === 'CREDIT_PTS' && '审核复核 · 确认入账 PTS 积点'}
                {type === 'REJECT' && '驳回此笔充值申报'}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                工单号: {record.orderNo} · {record.merchantName}
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

        {/* Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* Summary Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">申报金额:</span>
              <span className="font-bold text-slate-900 text-sm">
                {record.currency === 'NGN' ? `₦${record.amount.toLocaleString()}` : `$${record.amount.toLocaleString()} ${record.currency}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">折算入账积点:</span>
              <span className="font-bold text-emerald-700 text-sm">+{record.pointsCredited.toLocaleString()} PTS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">收款归集渠道:</span>
              <span className="text-slate-800">{record.payMethod}</span>
            </div>
          </div>

          {type === 'VERIFY' && (
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed">
                <span className="font-bold block mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>
                  PRD 4.2 确凿到账验资准则:
                </span>
                出纳经办人必须通过企业网银 U-Key / 链上全节点，确凿核验等额款项已实际到账入库，严禁任何形式的信用垫付或无款放行。
              </div>

              <label className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedCheck}
                  onChange={e => setConfirmedCheck(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] text-slate-700 leading-snug font-medium">
                  我已严格通过网银流水查验，确认该笔款项已实际到账，未发生任何形式的伪造与金额不符。
                </span>
              </label>
            </div>
          )}

          {type === 'CREDIT_PTS' && (
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] leading-relaxed">
                <span className="font-bold block mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">currency_exchange</span>
                  终审放行与积点实时释放:
                </span>
                点击确认后，清算核心引擎将自动执行记账流水操作，纳秒级增加商户可用积点 <strong className="font-mono">+{record.pointsCredited.toLocaleString()} PTS</strong>，并向商户发送 Webhook 到账通知。
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">复核审批附言 (选填):</label>
                <input
                  type="text"
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  placeholder="符合 PRD 4.2 终审放行标准，经双人复核无误"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          )}

          {type === 'REJECT' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">驳回原因分类:</label>
                <select
                  value={rejectReasonType}
                  onChange={e => setRejectReasonType(e.target.value)}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
                >
                  <option value="假水单或篡改凭证">假水单或篡改凭证 (EXIF分析异常)</option>
                  <option value="网银流水未到账">网银流水未到账 (对公专户无此记录)</option>
                  <option value="实收金额不符">实收金额不符 (少付或币种错误)</option>
                  <option value="涉嫌洗钱或高危地址">涉嫌洗钱或高危地址 (风控系统拦截)</option>
                  <option value="商户自主撤回申报">商户自主撤回申报</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">详细驳回调查说明:</label>
                <textarea
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  rows={3}
                  placeholder="请输入风控调查核实细节，该信息将同步记入商户风险画像与日志账簿..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            取消
          </button>

          {type === 'VERIFY' && (
            <button
              onClick={handleAction}
              disabled={!confirmedCheck}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>确认到账并移交复核</span>
            </button>
          )}

          {type === 'CREDIT_PTS' && (
            <button
              onClick={handleAction}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">currency_exchange</span>
              <span>确认入账释放 PTS</span>
            </button>
          )}

          {type === 'REJECT' && (
            <button
              onClick={handleAction}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">block</span>
              <span>确认驳回并记入风控单</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
