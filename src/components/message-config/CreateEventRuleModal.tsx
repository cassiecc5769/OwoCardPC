import React, { useState } from 'react';
import { EventRuleItem, MessageTemplateItem } from './types';

interface CreateEventRuleModalProps {
  isOpen: boolean;
  templates: MessageTemplateItem[];
  onClose: () => void;
  onCreate: (newRule: EventRuleItem) => void;
}

export const CreateEventRuleModal: React.FC<CreateEventRuleModalProps> = ({
  isOpen,
  templates,
  onClose,
  onCreate,
}) => {
  if (!isOpen) return null;

  const [id, setId] = useState(`EVT-NEW-${Math.floor(1000 + Math.random() * 9000)}`);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState<'trade' | 'aftersale' | 'finance' | 'member'>('trade');
  const [source, setSource] = useState('业务核心 · 事件源');
  const [primaryRole, setPrimaryRole] = useState('接单商户');
  const [channels, setChannels] = useState<string[]>(['WS秒推', '站内信']);
  const [templateId, setTemplateId] = useState(templates[0]?.id || 'TMPL_NEW_ORDER_DISPATCH');
  const [rateLimit, setRateLimit] = useState('30次/分 频控');

  const channelOptions = [
    'WS秒推',
    '短信SMS',
    '企微/钉钉',
    'Webhook',
    '声音蜂鸣',
    '电话TTS语音',
    '邮件通知',
    'WhatsApp广播',
    '站内信',
  ];

  const toggleChannel = (ch: string) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const selectedTmpl = templates.find((t) => t.id === templateId);
    const domainLabels = {
      trade: '交易事件',
      aftersale: '售后事件',
      finance: '财务事件',
      member: '运营会员',
    };

    const newRule: EventRuleItem = {
      id: id.toUpperCase().trim(),
      name: name.trim(),
      domain,
      domainLabel: domainLabels[domain],
      source,
      icon: domain === 'trade' ? 'receipt_long' : domain === 'finance' ? 'paid' : domain === 'aftersale' ? 'balance' : 'card_membership',
      iconBg: domain === 'trade' ? 'bg-blue-50' : domain === 'finance' ? 'bg-emerald-50' : domain === 'aftersale' ? 'bg-purple-50' : 'bg-indigo-50',
      iconColor: domain === 'trade' ? 'text-blue-600' : domain === 'finance' ? 'text-emerald-600' : domain === 'aftersale' ? 'text-purple-600' : 'text-indigo-600',
      targetRole: {
        primary: primaryRole,
        secondary: '平台调度组',
        icon: 'store',
        iconColor: 'text-blue-500',
      },
      channels: {
        customLabels: channels.length > 0 ? channels : ['WS秒推'],
      },
      throttlePolicy: {
        timing: '事件触发即推',
        rateLimit,
      },
      templateId,
      templateName: selectedTmpl ? selectedTmpl.name : '自定模板',
      status: 'running',
      statusText: '运行中',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    onCreate(newRule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">新增事件驱动触发规则</h3>
              <p className="text-xs text-slate-500 mt-0.5">注册新的全域业务事件流与目标分发矩阵</p>
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
        <div className="p-6 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">事件代码 (EVT-*)</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="EVT-ORD-..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-600"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">业务领域</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="trade">交易领域 (Trade)</option>
                <option value="aftersale">售后仲裁 (Aftersale)</option>
                <option value="finance">资金结算 (Finance)</option>
                <option value="member">运营会员 (Member)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">事件中文名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: 异地高危登录告警 / 批量自动结算完成"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">业务触发源</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">首要接收角色</label>
              <select
                value={primaryRole}
                onChange={(e) => setPrimaryRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="出卡用户">出卡用户 (Seller)</option>
                <option value="接单商户">接单商户 (Merchant)</option>
                <option value="接单客服">接单客服 (CS)</option>
                <option value="平台仲裁组">平台仲裁组 (Legal)</option>
                <option value="商户财务">商户财务 (Finance)</option>
              </select>
            </div>
          </div>

          {/* Channels */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">生效通知通道</label>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              {channelOptions.map((ch) => {
                const isSelected = channels.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChannel(ch)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">绑定消息模板</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.id})
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
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
              disabled={!name.trim()}
              onClick={handleCreate}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>创建事件规则</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
