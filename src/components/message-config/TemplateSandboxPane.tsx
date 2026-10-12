import React, { useState } from 'react';
import { MessageTemplateItem, PreviewFormat, VariableItem } from './types';
import { SYSTEM_VARIABLES, CHANNEL_GATEWAYS } from './mockData';

interface TemplateSandboxPaneProps {
  currentTemplate: MessageTemplateItem;
  allTemplates: MessageTemplateItem[];
  onSelectTemplate: (templateId: string) => void;
  onOpenTestDispatch: (template: MessageTemplateItem) => void;
  onOpenEditTemplate: (template: MessageTemplateItem) => void;
  onCopyVariableFeedback: (variable: string) => void;
}

export const TemplateSandboxPane: React.FC<TemplateSandboxPaneProps> = ({
  currentTemplate,
  allTemplates,
  onSelectTemplate,
  onOpenTestDispatch,
  onOpenEditTemplate,
  onCopyVariableFeedback,
}) => {
  const [format, setFormat] = useState<PreviewFormat>('sms');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (variableKey: string) => {
    navigator.clipboard?.writeText(variableKey);
    setCopiedKey(variableKey);
    onCopyVariableFeedback(variableKey);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <div className="xl:col-span-5 flex flex-col gap-4">
      {/* Template Sandbox Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
        {/* Inspector Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <span className="material-symbols-outlined text-[19px]">preview</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">模版渲染器与变量沙盒</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-semibold">
                  {currentTemplate.version}
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-500 truncate max-w-[260px]">
                Inspector: {currentTemplate.id} ({currentTemplate.name})
              </div>
            </div>
          </div>

          <div className="relative">
            <select
              value={currentTemplate.id}
              onChange={(e) => onSelectTemplate(e.target.value)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium bg-transparent border-0 focus:ring-0 cursor-pointer pr-5 py-1"
            >
              {allTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview Format Selector Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setFormat('sms')}
            className={`flex-1 py-1.5 rounded-md cursor-pointer transition-all ${
              format === 'sms'
                ? 'bg-white text-blue-600 font-semibold shadow-xs text-center'
                : 'text-slate-600 hover:text-slate-900 text-center'
            }`}
          >
            SMS 短信 {format === 'sms' && '(选中)'}
          </button>
          <button
            type="button"
            onClick={() => setFormat('push')}
            className={`flex-1 py-1.5 rounded-md cursor-pointer transition-all ${
              format === 'push'
                ? 'bg-white text-blue-600 font-semibold shadow-xs text-center'
                : 'text-slate-600 hover:text-slate-900 text-center'
            }`}
          >
            App Push
          </button>
          <button
            type="button"
            onClick={() => setFormat('email')}
            className={`flex-1 py-1.5 rounded-md cursor-pointer transition-all ${
              format === 'email'
                ? 'bg-white text-blue-600 font-semibold shadow-xs text-center'
                : 'text-slate-600 hover:text-slate-900 text-center'
            }`}
          >
            邮件水单
          </button>
          <button
            type="button"
            onClick={() => setFormat('webhook')}
            className={`flex-1 py-1.5 rounded-md font-mono cursor-pointer transition-all ${
              format === 'webhook'
                ? 'bg-white text-blue-600 font-semibold shadow-xs text-center'
                : 'text-slate-600 hover:text-slate-900 text-center'
            }`}
          >
            Webhook JSON
          </button>
        </div>

        {/* Realistic Simulated Preview Box */}
        {format === 'sms' && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 shadow-inner flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/60 pb-2">
              <span className="flex items-center gap-1.5 font-medium text-slate-800">
                <span className="material-symbols-outlined text-[16px] text-blue-600">sms</span>
                【CardOps 官方清算】
              </span>
              <span className="font-mono text-[11px] text-slate-400">刚刚 · 专线通道 01</span>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed font-sans pt-1">
              尊敬的{' '}
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
                Alex Chen
              </span>
              ，您提交的{' '}
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
                Apple US $100
              </span>{' '}
              充值卡已核销成功！官方回执哈希为{' '}
              <span className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 font-semibold">
                #a89c2...f81
              </span>
              。折合结算金额{' '}
              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded">
                ¥ 682.50
              </span>{' '}
              已实时注入您的{' '}
              <span className="font-medium text-slate-900 underline decoration-slate-300">
                支付宝对公余额
              </span>
              。总耗时{' '}
              <span className="font-mono text-slate-900 font-semibold">42s</span>。感谢使用 CardOps
              极速撮合！
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-200/50">
              <span>字数: {currentTemplate.charCount} 字 (计为 {currentTemplate.smsSegments} 条短信)</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                语法校验: PASS
              </span>
            </div>
          </div>
        )}

        {format === 'push' && (
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-md space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white">
                  C
                </div>
                <span>CardOps OS · 极速撮合</span>
              </div>
              <span>刚刚</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white mb-0.5">
                {currentTemplate.pushTitle}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentTemplate.pushBody.replace('{{卡种品牌}}', 'Apple US $100').replace('{{卡单号}}', 'ORD-20260920-8819').replace('{{结算金额}}', '¥ 682.50').replace('{{到账渠道}}', '支付宝余额').replace('{{SLA耗时}}', '42s')}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-blue-400 font-medium cursor-pointer hover:underline">
                立即查看对账凭证 →
              </span>
              <span className="text-slate-500 font-mono">Push Token: Active</span>
            </div>
          </div>
        )}

        {format === 'email' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5 text-xs text-slate-700">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-900">
                主题: {currentTemplate.emailSubject.replace('{{卡单号}}', 'ORD-20260920-8819')}
              </span>
              <span className="font-mono text-[10px] text-slate-400">发件方: system@cardops.io</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">结算客户:</span>
                <span className="font-bold text-slate-800">Alex Chen (VIP-02)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">卡单编号:</span>
                <span className="font-mono text-blue-600">ORD-20260920-8819</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">申报标的:</span>
                <span className="font-medium text-slate-800">Apple US $100.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">实付结算金额:</span>
                <span className="font-mono font-bold text-emerald-600">¥ 682.50 CNY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">数字存证哈希:</span>
                <span className="font-mono text-[11px] text-slate-500">0x9e1c4b82a105c317...</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 text-right">
              由 AWS SES 企业通道多活签名投递
            </div>
          </div>
        )}

        {format === 'webhook' && (
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2 pb-1 border-b border-slate-800">
              <span>POST /api/v1/webhooks/cardops</span>
              <span className="text-emerald-400">Content-Type: application/json</span>
            </div>
            <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed overflow-x-auto max-h-52">
              {currentTemplate.webhookJson}
            </pre>
          </div>
        )}

        {/* Dynamic Variable Pool (8 Variables Grid) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              可用系统级动态变量池 (Variable Pool)
            </span>
            <span className="text-[11px] font-mono text-blue-600">
              点击标签一键复制
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
            {SYSTEM_VARIABLES.slice(0, 8).map((v) => {
              const isCopied = copiedKey === v.key;
              return (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => handleCopy(v.key)}
                  className={`p-1.5 rounded-lg text-left flex items-center justify-between transition-colors border cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border-slate-200 text-slate-700'
                  }`}
                  title={`${v.label} (${v.desc}) - 示例: ${v.example}`}
                >
                  <span className="truncate">{v.key}</span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0 ml-1">
                    {isCopied ? 'check' : 'content_copy'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Testing & Edit Controls */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onOpenTestDispatch(currentTemplate)}
            className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">bug_report</span>
            <span>测试下发 (Sandbox)</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenEditTemplate(currentTemplate)}
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs shadow-blue-500/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            <span>编辑此模版</span>
          </button>
        </div>
      </div>

      {/* Channel Throttle & Circuit Breaker Status Widget */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="material-symbols-outlined text-[17px] text-blue-600">
              security
            </span>
            <span>全域通道限流与熔断策略</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            全通道正常
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {CHANNEL_GATEWAYS.slice(0, 3).map((gw, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-slate-800">{gw.name}</div>
                <div className="font-mono text-[11px] text-slate-400">
                  {gw.description}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200 shrink-0 ml-2">
                {gw.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
