import React, { useState } from 'react';
import { ReconVarianceItem, AdjustmentOrderForm } from './types';

interface AdjustmentOrderModalProps {
  item: ReconVarianceItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AdjustmentOrderForm) => void;
}

export const AdjustmentOrderModal: React.FC<AdjustmentOrderModalProps> = ({
  item,
  isOpen,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const initialDirection =
    item.type === 'UNCREDITED'
      ? 'CREDIT_ADD'
      : item.type === 'UNILATERAL'
      ? 'REVERSAL'
      : 'DEBIT_SUB';

  const [direction, setDirection] = useState<'DEBIT_SUB' | 'CREDIT_ADD' | 'REVERSAL'>(initialDirection);
  const [amountPTS, setAmountPTS] = useState<number>(Math.abs(item.diffPoints));
  const [accountingDebit, setAccountingDebit] = useState<string>(
    direction === 'DEBIT_SUB'
      ? '100201 平台商户待清算借方准备金'
      : direction === 'CREDIT_ADD'
      ? '100101 网关银行充值待结算专户'
      : '200105 异常单边结算挂账冲减'
  );
  const [accountingCredit, setAccountingCredit] = useState<string>(
    direction === 'DEBIT_SUB'
      ? '200102 商户积点账户主资产 (补扣出账)'
      : direction === 'CREDIT_ADD'
      ? '200101 商户积点账户主资产 (补写入账)'
      : '100202 结算批次在途负债 (红字冲正)'
  );
  const [secondSignApprover, setSecondSignApprover] = useState<string>('CFO-01 (财务负责人兼复核人)');
  const [remark, setRemark] = useState<string>(
    `依照 PRD 7.2 财务风控红线规范，针对差异单 [${item.diffNo}] 根因 [${item.rootCause}] 提请双人审核制平账调整单。严禁篡改底层数据库，生成规范复式记账分录。`
  );
  const [executeImmediately, setExecuteImmediately] = useState<boolean>(item.status === 'APPROVAL_IN_FLIGHT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      diffId: item.id,
      diffNo: item.diffNo,
      merchantName: item.merchantName,
      merchantId: item.merchantId,
      direction,
      amountPTS,
      equivalentUSD: amountPTS * 1.0,
      reason: item.rootCause,
      accountingSubjectDebit: accountingDebit,
      accountingSubjectCredit: accountingCredit,
      auditManager: item.auditor,
      secondSignApprover,
      remark,
      executeImmediately
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">balance</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[16px] font-bold text-slate-900">
                生成标准账户调整单 (PRD-7.2 合规调账)
              </h3>
              <p className="text-xs text-slate-500 font-code-token">
                差异单索引: <span className="text-blue-600 font-semibold">{item.diffNo}</span> ｜ 触发节点: {item.nodeTrigger}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm text-slate-700">
          {/* Compliance Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
            <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">verified_user</span>
            <div>
              <span className="font-bold">财务合规警示：</span>
              严禁直接篡改底层商户积点账户余额。本调整单提交后将生成带防伪戳的双向会计分录，由【{secondSignApprover}】双人复核后，由清算系统核心完成自动冲正平账。
            </div>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
            <div>
              <span className="text-xs text-slate-500">涉案商户 / 户名:</span>
              <div className="font-semibold text-slate-900 mt-0.5">{item.merchantName}</div>
            </div>
            <div>
              <span className="text-xs text-slate-500">关联源头单号:</span>
              <div className="font-code-token text-xs text-blue-600 font-semibold mt-0.5">{item.relatedBizId}</div>
            </div>
            <div>
              <span className="text-xs text-slate-500">差异分类判定:</span>
              <div className="font-code-token text-xs text-red-600 font-semibold mt-0.5">{item.typeName}</div>
            </div>
            <div>
              <span className="text-xs text-slate-500">核对差额 (建议调账量):</span>
              <div className="font-numeric-table font-bold text-red-600 text-sm mt-0.5">
                {item.diffPoints > 0 ? `+${item.diffPoints.toFixed(2)}` : item.diffPoints.toFixed(2)} PTS
                <span className="text-slate-400 text-xs ml-1.5 font-normal font-code-token">{item.diffCurrencyStr}</span>
              </div>
            </div>
          </div>

          {/* Direction & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">调整性质与流向</label>
              <select
                value={direction}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setDirection(val);
                  if (val === 'DEBIT_SUB') {
                    setAccountingDebit('100201 平台商户待清算借方准备金');
                    setAccountingCredit('200102 商户积点账户主资产 (补扣出账)');
                  } else if (val === 'CREDIT_ADD') {
                    setAccountingDebit('100101 网关银行充值待结算专户');
                    setAccountingCredit('200101 商户积点账户主资产 (补写入账)');
                  } else {
                    setAccountingDebit('200105 异常单边结算挂账冲减');
                    setAccountingCredit('100202 结算批次在途负债 (红字冲正)');
                  }
                }}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="DEBIT_SUB">借记调减 / 补扣积点 (DEBIT-SUB)</option>
                <option value="CREDIT_ADD">贷记调增 / 补入积点 (CREDIT-ADD)</option>
                <option value="REVERSAL">红字反向冲正 / 撤销结算 (REVERSAL)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">核定调整积点数值 (PTS)</label>
              <input
                type="number"
                step="0.01"
                value={amountPTS}
                onChange={(e) => setAmountPTS(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-numeric-table font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Double Entry Accounting Subjects */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">复式记账分录映射 (会计科目)</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] font-label-caps text-blue-600 font-bold uppercase block">借方科目 (Dr.)</span>
                <input
                  type="text"
                  value={accountingDebit}
                  onChange={(e) => setAccountingDebit(e.target.value)}
                  className="w-full mt-1 bg-white px-2.5 py-1 text-xs border border-slate-300 rounded font-code-token"
                />
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] font-label-caps text-emerald-700 font-bold uppercase block">贷方科目 (Cr.)</span>
                <input
                  type="text"
                  value={accountingCredit}
                  onChange={(e) => setAccountingCredit(e.target.value)}
                  className="w-full mt-1 bg-white px-2.5 py-1 text-xs border border-slate-300 rounded font-code-token"
                />
              </div>
            </div>
          </div>

          {/* Approver & Auditor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">经办财务主管 (制单人)</label>
              <input
                type="text"
                disabled
                value={item.auditor}
                className="w-full h-9 px-3 bg-slate-100 border border-slate-200 rounded-lg text-xs font-code-token text-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">双人签章复核人 (审批人)</label>
              <select
                value={secondSignApprover}
                onChange={(e) => setSecondSignApprover(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="CFO-01 (财务负责人兼复核人)">CFO-01 (财务总监)</option>
                <option value="RISK-DIRECTOR-02 (首席风控官)">RISK-DIRECTOR-02 (首席风控官)</option>
                <option value="AUDIT-LEAD-03 (总审计师)">AUDIT-LEAD-03 (总审计师)</option>
              </select>
            </div>
          </div>

          {/* Remark */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">调账依凭与审计附注</label>
            <textarea
              rows={2}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none leading-relaxed"
            />
          </div>

          {/* Execute switch */}
          <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="executeImmediately"
                checked={executeImmediately}
                onChange={(e) => setExecuteImmediately(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="executeImmediately" className="font-semibold text-blue-900 cursor-pointer">
                经财务主管特批，直接通过审批并由清算核心联机入账平账
              </label>
            </div>
            <span className="font-code-token text-[11px] text-blue-700">T+0 SYNC</span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>{executeImmediately ? '核定并联机平账' : '生成调整单提请审批'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
