import React, { useState } from 'react';
import { RuleLifecycleTab, TradingRuleItem } from './types';

interface EmergencyRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmergencyRule: (newRule: TradingRuleItem, reason: string, ticket: string) => void;
}

export const EmergencyRuleModal: React.FC<EmergencyRuleModalProps> = ({
  isOpen,
  onClose,
  onAddEmergencyRule,
}) => {
  if (!isOpen) return null;

  const [tab, setTab] = useState<RuleLifecycleTab>('order');
  const [name, setName] = useState('');
  const [thresholdValue, setThresholdValue] = useState('100% 拦截');
  const [thresholdUnit, setThresholdUnit] = useState('强阻断');
  const [secondaryLabel, setSecondaryLabel] = useState('应急响应级别');
  const [secondaryValue, setSecondaryValue] = useState('P0 特级防御');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState('4小时后自动解除');
  const [approver, setApprover] = useState('首席风控官 (林志华)');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const randomId = `RULE-EMG-${Math.floor(100 + Math.random() * 900)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !reason.trim()) {
      setErrorMsg('请完整填写规则名称和紧急处置原因！');
      return;
    }
    setErrorMsg(null);

    const newRule: TradingRuleItem = {
      id: randomId,
      name: `[紧急] ${name.trim()}`,
      tab,
      tag: '紧急防御',
      tagColor: 'rose',
      icon: 'add_moderator',
      desc: `${desc.trim() || name.trim()} (有效期: ${duration})`,
      thresholdValue,
      thresholdUnit,
      secondaryLabel,
      secondaryValue,
      secondaryColor: 'text-rose-600',
      lastModified: '刚刚 (紧急发布)',
      modifiedBy: approver,
      strategyScope: '全网紧急防御池',
      scopeMode: 'all',
      enabled: true,
      effectiveMode: '立即生效',
    };

    onAddEmergencyRule(newRule, reason, `EMG-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-50/70 border-b border-rose-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
              <span className="material-symbols-outlined text-[20px]">add_moderator</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                创建临时紧急风控规则
                <span className="font-mono text-xs bg-rose-600 text-white px-1.5 py-0.2 rounded font-semibold">
                  P0 优先
                </span>
              </h3>
              <p className="text-xs text-rose-700/80 mt-0.5">
                即时插入撮合流水线执行拦截，针对突发性盗卡、黑客撞库或通道故障
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-rose-100/50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                挂载生命周期节点
              </label>
              <select
                value={tab}
                onChange={(e) => setTab(e.target.value as RuleLifecycleTab)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="order">01 下单申报 (出卡端)</option>
                <option value="dispatch">02 派单撮合 (配单端)</option>
                <option value="operation">03 验卡作业 (商户端)</option>
                <option value="timeout">04 超时熔断 (流单熔断)</option>
                <option value="dispute">05 售后争议 (质押保全)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                临时有效期
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="1小时后自动解除">1 小时后自动恢复</option>
                <option value="4小时后自动解除">4 小时后自动恢复 (推荐)</option>
                <option value="12小时后自动解除">12 小时后自动恢复</option>
                <option value="24小时后自动解除">24 小时后自动恢复</option>
                <option value="持续生效直至手动撤销">持续生效直至手动撤销</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              紧急规则名称与触发对象 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 全网紧急暂停 Apple 500 美元卡密自动化配单"
              required
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                防御动作 / 阈值
              </label>
              <input
                type="text"
                value={thresholdValue}
                onChange={(e) => setThresholdValue(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                处置动作归属
              </label>
              <input
                type="text"
                value={thresholdUnit}
                onChange={(e) => setThresholdUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              执行策略细节
            </label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="描述具体的条件判断逻辑，例如：单笔面值 >= 500 USD 且渠道评级 < P2 时直接阻断..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                特批授权人
              </label>
              <input
                type="text"
                value={approver}
                onChange={(e) => setApprover(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                紧急响应凭证
              </label>
              <input
                type="text"
                readOnly
                value="EMG-AUTH-APPROVED"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 text-slate-500 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              应急处置理由与风险预估 <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请填写触发紧急规则的监控告警线索或上游通报内容..."
              required
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

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
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              立即广播特急规则
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
