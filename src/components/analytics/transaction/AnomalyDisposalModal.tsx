import React, { useState } from 'react';
import { AnomalyItem } from './types';

interface AnomalyDisposalModalProps {
  anomaly: AnomalyItem | null;
  onClose: () => void;
  onConfirm: (disposalType: string, comment: string) => void;
}

export const AnomalyDisposalModal: React.FC<AnomalyDisposalModalProps> = ({
  anomaly,
  onClose,
  onConfirm,
}) => {
  const [disposalType, setDisposalType] = useState<string>('merchant_penalty');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!anomaly) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      onConfirm(disposalType, comment);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 700);
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">异常交易处置与责任决议</h3>
              <p className="text-[11px] text-slate-500">
                卡单号: <span className="font-code-token font-bold text-slate-700">{anomaly.typicalTxId}</span> · {anomaly.causeCategory}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="grid grid-cols-2 gap-2 text-[11.5px]">
              <div>
                <span className="text-slate-400 block text-[10px]">责任认定方</span>
                <span className="font-bold text-slate-900">{anomaly.responsibleParty}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">涉诉受损金额</span>
                <span className="font-bold text-rose-600 font-numeric-stat">${anomaly.amountUsd} USD</span>
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-900 block mb-2">选择处置方案</label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  disposalType === 'merchant_penalty'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="disposalType"
                  value="merchant_penalty"
                  checked={disposalType === 'merchant_penalty'}
                  onChange={(e) => setDisposalType(e.target.value)}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">扣除商户保证金积点并向用户先行退付</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">
                    适用于商户超时流单、虚假做卡核销回执，从保证金池直接划拨冲正。
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  disposalType === 'risk_blacklist'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="disposalType"
                  value="risk_blacklist"
                  checked={disposalType === 'risk_blacklist'}
                  onChange={(e) => setDisposalType(e.target.value)}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">将申报人/卡密特征列入全网反欺诈黑名单</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">
                    判定用户恶意倒卖已兑换卡、二次提交流转，封禁账户出卡权限 30 天。
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  disposalType === 'platform_escrow'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="disposalType"
                  value="platform_escrow"
                  checked={disposalType === 'platform_escrow'}
                  onChange={(e) => setDisposalType(e.target.value)}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">平台特别容错兜底，闭环归档</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">
                    双方均无恶意过错（官方临时风控阻断），由平台风险拨备基金承担损失。
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-900 block mb-1.5">处置备注与审核日志</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="填写责任认定细节、商户回执凭证审核结论及操作人意见..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs text-slate-800"
            />
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs animate-fadeIn">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
              <span>处置决议已执行，资金冲正及日志已归档至风控中心！</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? '正在执行处置...' : '确认执行处置'}
          </button>
        </div>
      </div>
    </div>
  );
};
