import React, { useState } from 'react';
import { MessageTemplateItem, ChannelKey } from './types';

interface TestDispatchModalProps {
  template: MessageTemplateItem | null;
  onClose: () => void;
  onSuccess: (channel: string, target: string, latency: string) => void;
}

export const TestDispatchModal: React.FC<TestDispatchModalProps> = ({
  template,
  onClose,
  onSuccess,
}) => {
  if (!template) return null;

  const [channel, setChannel] = useState<ChannelKey>('sms');
  const [recipient, setRecipient] = useState('13800138000');
  const [isSending, setIsSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{
    success: boolean;
    latency: string;
    hash: string;
    payload: string;
  } | null>(null);

  const handleSend = () => {
    setIsSending(true);
    setDispatchResult(null);

    setTimeout(() => {
      const latency = `${Math.floor(25 + Math.random() * 35)}ms`;
      const hash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random()
        .toString(16)
        .substring(2, 10)}`;

      setIsSending(false);
      setDispatchResult({
        success: true,
        latency,
        hash,
        payload: template.smsBody
          .replace('{{用户昵称}}', '测试员 Alex')
          .replace('{{卡种品牌}}', 'Apple US $100')
          .replace('{{结算金额}}', '¥ 682.50')
          .replace('{{官方回执哈希}}', '#a89c2...f81')
          .replace('{{到账渠道}}', '支付宝沙盒环境')
          .replace('{{SLA耗时}}', '38s'),
      });
      onSuccess(channel.toUpperCase(), recipient, latency);
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
              <span className="material-symbols-outlined text-[20px]">bug_report</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                沙盒测试模拟下发 · <span className="font-mono text-blue-600">{template.id}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">向测试接收终端模拟下发已解析模板的即时消息</p>
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
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">测试通道协议</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setChannel('sms');
                  setRecipient('13800138000');
                }}
                className={`py-2 px-3 rounded-lg border font-medium text-center cursor-pointer transition-all ${
                  channel === 'sms'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                短信 SMS 专线
              </button>
              <button
                type="button"
                onClick={() => {
                  setChannel('dingtalk');
                  setRecipient('https://oapi.dingtalk.com/robot/send?access_token=test');
                }}
                className={`py-2 px-3 rounded-lg border font-medium text-center cursor-pointer transition-all ${
                  channel === 'dingtalk'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                企微/钉钉 Webhook
              </button>
              <button
                type="button"
                onClick={() => {
                  setChannel('webhook');
                  setRecipient('https://api.merchant-sandbox.com/callback');
                }}
                className={`py-2 px-3 rounded-lg border font-medium text-center cursor-pointer transition-all ${
                  channel === 'webhook'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                开放接口 Webhook
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              测试接收地址 / 手机号 / URL
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>

          {/* Dispatch Result Card */}
          {dispatchResult && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">
                    verified
                  </span>
                  模拟下发成功 (HTTP 200 OK)
                </span>
                <span className="font-mono text-[11px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-semibold">
                  耗时 {dispatchResult.latency}
                </span>
              </div>
              <div className="text-slate-600 text-[11px] bg-white p-2.5 rounded-lg border border-emerald-100 leading-relaxed font-sans">
                {dispatchResult.payload}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>防伪签名: {dispatchResult.hash}</span>
                <span className="text-emerald-600 font-semibold">已写入流水审计</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              关闭
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={handleSend}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isSending ? 'sync' : 'send'}
              </span>
              <span>{isSending ? '正在模拟通道下发...' : '开始测试下发'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
