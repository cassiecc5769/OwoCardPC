import React, { useState } from 'react';
import { TradingRuleItem } from './types';

interface EditRuleModalProps {
  rule: TradingRuleItem | null;
  onClose: () => void;
  onSave: (
    updatedRule: TradingRuleItem,
    reason: string,
    ticket: string
  ) => void;
}

export const EditRuleModal: React.FC<EditRuleModalProps> = ({
  rule,
  onClose,
  onSave,
}) => {
  if (!rule) return null;

  const [thresholdValue, setThresholdValue] = useState(rule.thresholdValue);
  const [thresholdUnit, setThresholdUnit] = useState(rule.thresholdUnit);
  const [secondaryValue, setSecondaryValue] = useState(rule.secondaryValue);
  const [desc, setDesc] = useState(rule.desc);
  const [effectiveMode, setEffectiveMode] = useState<'立即生效' | '定时生效' | '审批生效'>(
    rule.effectiveMode || '立即生效'
  );
  const [reason, setReason] = useState('');
  const [ticket, setTicket] = useState(`APPR-${Math.floor(10000 + Math.random() * 90000)}`);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('请填写本次规则调整的业务依据与变更原因！');
      return;
    }
    setErrorMsg(null);
    const updated: TradingRuleItem = {
      ...rule,
      thresholdValue,
      thresholdUnit,
      secondaryValue,
      desc,
      effectiveMode,
      lastModified: '刚刚',
      modifiedBy: '当前管理员',
    };
    onSave(updated, reason, ticket);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                调整规则配置 · <span className="font-mono text-blue-600">{rule.id}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{rule.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current parameter diff preview */}
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                当前生效参数
              </div>
              <div className="font-mono text-base font-bold text-slate-700 mt-0.5">
                {rule.thresholdValue} {rule.thresholdUnit}
              </div>
            </div>
            <span className="material-symbols-outlined text-blue-400 text-[20px]">arrow_forward</span>
            <div>
              <div className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                调整后拟生效参数
              </div>
              <div className="font-mono text-base font-bold text-blue-700 mt-0.5">
                {thresholdValue} {thresholdUnit}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                核心阈值数值
              </label>
              <input
                type="text"
                value={thresholdValue}
                onChange={(e) => setThresholdValue(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                单位 / 维度
              </label>
              <input
                type="text"
                value={thresholdUnit}
                onChange={(e) => setThresholdUnit(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              辅助指标设定 ({rule.secondaryLabel})
            </label>
            <input
              type="text"
              value={secondaryValue}
              onChange={(e) => setSecondaryValue(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              规则详细说明与策略解释
            </label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                生效发布模式
              </label>
              <select
                value={effectiveMode}
                onChange={(e) => setEffectiveMode(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="立即生效">立即生效 (热加载)</option>
                <option value="定时生效">定时生效 (次日零点)</option>
                <option value="审批生效">审批生效 (需双人复核)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                关联审批工单编号
              </label>
              <input
                type="text"
                value={ticket}
                onChange={(e) => setTicket(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              变更原因与风控依据 <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请输入本次参数修改的业务背景、风控依据及审批授权人信息..."
              required
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              确认并同步全网
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
