import React, { useState, useEffect } from 'react';
import { EventRuleItem, MessageTemplateItem } from './types';

interface ConfigEventRuleModalProps {
  rule: EventRuleItem | null;
  templates: MessageTemplateItem[];
  onClose: () => void;
  onSave: (updatedRule: EventRuleItem) => void;
}

export const ConfigEventRuleModal: React.FC<ConfigEventRuleModalProps> = ({
  rule,
  templates,
  onClose,
  onSave,
}) => {
  if (!rule) return null;

  const [name, setName] = useState(rule.name);
  const [source, setSource] = useState(rule.source);
  const [primaryRole, setPrimaryRole] = useState(rule.targetRole.primary);
  const [secondaryRole, setSecondaryRole] = useState(rule.targetRole.secondary || '');
  const [timing, setTiming] = useState(rule.throttlePolicy.timing);
  const [rateLimit, setRateLimit] = useState(rule.throttlePolicy.rateLimit);
  const [templateId, setTemplateId] = useState(rule.templateId);
  const [channels, setChannels] = useState<string[]>(rule.channels.customLabels || ['WS秒推']);
  const [status, setStatus] = useState<'running' | 'throttled' | 'fused'>(rule.status);

  useEffect(() => {
    setName(rule.name);
    setSource(rule.source);
    setPrimaryRole(rule.targetRole.primary);
    setSecondaryRole(rule.targetRole.secondary || '');
    setTiming(rule.throttlePolicy.timing);
    setRateLimit(rule.throttlePolicy.rateLimit);
    setTemplateId(rule.templateId);
    setChannels(rule.channels.customLabels || ['WS秒推']);
    setStatus(rule.status);
  }, [rule]);

  const toggleChannel = (ch: string) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const channelOptions = [
    'WS秒推',
    '短信SMS',
    '企微/钉钉',
    'Webhook',
    '极速强弹窗',
    '声音蜂鸣',
    '电话TTS语音',
    '邮件通知',
    'WhatsApp广播',
    '站内信',
  ];

  const handleSave = () => {
    const selectedTmpl = templates.find((t) => t.id === templateId);
    const updated: EventRuleItem = {
      ...rule,
      name,
      source,
      targetRole: {
        ...rule.targetRole,
        primary: primaryRole,
        secondary: secondaryRole,
      },
      channels: {
        ...rule.channels,
        customLabels: channels,
      },
      throttlePolicy: {
        ...rule.throttlePolicy,
        timing,
        rateLimit,
      },
      templateId,
      templateName: selectedTmpl ? selectedTmpl.name : rule.templateName,
      status,
      statusText: status === 'running' ? '运行中' : status === 'throttled' ? '频控中' : '异常熔断',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                配置事件规则 · <span className="font-mono text-blue-600">{rule.id}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                调整触发条件、接收角色、多通道路由策略与频控阈值
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">事件名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">业务触发源</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">主要接收角色</label>
              <select
                value={primaryRole}
                onChange={(e) => setPrimaryRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
              >
                <option value="出卡用户">出卡用户 (Seller)</option>
                <option value="接单商户">接单商户 (Merchant)</option>
                <option value="接单客服">接单客服 (CS)</option>
                <option value="平台仲裁组">平台仲裁组 (Legal)</option>
                <option value="商户财务">商户财务 (Finance)</option>
                <option value="商户运营">商户运营 (Ops)</option>
                <option value="风控合规组">风控合规组 (Risk)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">次级/抄送角色</label>
              <input
                type="text"
                value={secondaryRole}
                onChange={(e) => setSecondaryRole(e.target.value)}
                placeholder="例如: 财务 · 清算台 / 平台调度组"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Channels Selection */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1.5">
              生效多通道矩阵 (点击勾选/取消)
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {channelOptions.map((ch) => {
                const isActive = channels.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChannel(ch)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-medium transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {ch} {isActive && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Throttle Policy */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">触发时机与延迟</label>
              <input
                type="text"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">流控与频控保护</label>
              <input
                type="text"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Linked Template */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">关联渲染模版</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer font-mono"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.id}) - {t.category}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">规则运行状态</label>
            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="rule-status"
                  checked={status === 'running'}
                  onChange={() => setStatus('running')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-emerald-700">● 正常运行中</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="rule-status"
                  checked={status === 'throttled'}
                  onChange={() => setStatus('throttled')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-amber-700">● 频控限流中</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="rule-status"
                  checked={status === 'fused'}
                  onChange={() => setStatus('fused')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-rose-700">● 异常熔断</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>保存规则配置</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
