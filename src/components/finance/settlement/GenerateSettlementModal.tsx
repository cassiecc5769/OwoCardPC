import React, { useState } from 'react';

interface GenerateSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    period: string;
    entityTypes: string[];
    autoDeductFee: boolean;
    remark: string;
  }) => void;
}

export const GenerateSettlementModal: React.FC<GenerateSettlementModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [period, setPeriod] = useState<string>('2026-09-01 ~ 2026-09-15');
  const [entityTypes, setEntityTypes] = useState<string[]>(['MERCHANT', 'AFFILIATE', 'CHANNEL']);
  const [autoDeductFee, setAutoDeductFee] = useState<boolean>(true);
  const [remark, setRemark] = useState<string>('依照 与 6.3 标准规范，对本账期内终态已核销订单执行全量账单快照结转与自动计费。');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleEntityType = (type: string) => {
    setEntityTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleRunGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirm({
        period,
        entityTypes,
        autoDeductFee,
        remark
      });
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-slate-900">
                批量生成周期结算单 (Batch Settlement Billing)
              </h3>
              <p className="text-xs text-slate-500 font-code-token">
                依据系统日切 / 半月度核算规则自动生成待审结算账单
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
        <form onSubmit={handleRunGenerate} className="p-6 space-y-4 text-xs text-slate-700">
          {/* Compliance notice */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-2 text-blue-900 leading-relaxed">
            <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">verified</span>
            <div>
              <strong className="font-semibold">协同规范提醒：</strong>
              系统将自动锁定选定周期内已终审完成的交易卡密流水与增长端推送的分销提成单，杜绝跨周期重结漏结。
            </div>
          </div>

          {/* Period Selection */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              结算账期周期 (Billing Cycle)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPeriod('2026-09-01 ~ 2026-09-15')}
                className={`py-2 px-3 rounded-lg border text-center transition-all ${
                  period === '2026-09-01 ~ 2026-09-15'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                本月前半期 (09-01 ~ 09-15)
              </button>
              <button
                type="button"
                onClick={() => setPeriod('2026-09-16 ~ 2026-09-30')}
                className={`py-2 px-3 rounded-lg border text-center transition-all ${
                  period === '2026-09-16 ~ 2026-09-30'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                本月后半期 (09-16 ~ 09-30)
              </button>
              <button
                type="button"
                onClick={() => setPeriod('2026-08-01 ~ 2026-08-31')}
                className={`py-2 px-3 rounded-lg border text-center transition-all ${
                  period === '2026-08-01 ~ 2026-08-31'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                上月全月 (08-01 ~ 08-31)
              </button>
            </div>
          </div>

          {/* Settlement Targets */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              结算归属主体范围 (Scope)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={entityTypes.includes('MERCHANT')}
                  onChange={() => toggleEntityType('MERCHANT')}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="font-medium text-slate-800">商户接单承揽 (42家)</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={entityTypes.includes('AFFILIATE')}
                  onChange={() => toggleEntityType('AFFILIATE')}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="font-medium text-slate-800">推广分佣提成 (18份)</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={entityTypes.includes('CHANNEL')}
                  onChange={() => toggleEntityType('CHANNEL')}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="font-medium text-slate-800">渠道合作商 (4家)</span>
              </label>
            </div>
          </div>

          {/* Auto deductions */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoFee"
                checked={autoDeductFee}
                onChange={(e) => setAutoDeductFee(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <label htmlFor="autoFee" className="cursor-pointer font-medium text-slate-800">
                联动合同阶梯费率与仲裁退单判责款自动扣划
              </label>
            </div>
            <span className="font-code-token text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              自动执行
            </span>
          </div>

          {/* Remark */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              执行附注 / 审计说明
            </label>
            <textarea
              rows={2}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Actions */}
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
              disabled={isProcessing || entityTypes.length === 0}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${isProcessing ? 'animate-spin' : ''}`}>
                {isProcessing ? 'sync' : 'auto_fix_high'}
              </span>
              <span>{isProcessing ? '账单汇总核算中...' : '确认启动批量汇总'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
