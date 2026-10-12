import React, { useState } from 'react';
import { BusinessReasonItem } from './types';

interface TestEchoModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: BusinessReasonItem | null;
}

export const TestEchoModal: React.FC<TestEchoModalProps> = ({
  isOpen,
  onClose,
  reason,
}) => {
  const [selectedClient, setSelectedClient] = useState<'app' | 'api' | 'cs' | 'bot'>('app');
  const [selectedLang, setSelectedLang] = useState<'zhCN' | 'enUS' | 'pidgin'>('zhCN');
  const [orderNo, setOrderNo] = useState('ORD-20260920-9941');
  const [cardBrand, setCardBrand] = useState('Steam 美区礼品卡');
  const [declaredVal, setDeclaredVal] = useState(100);
  const [echoResult, setEchoResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen || !reason) return null;

  const handleRunEcho = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setEchoResult(`ECHO_OK: 耗时 12ms · 规则 [${reason.code}] 匹配成功 · 触发处置动作 [${reason.actionDecision}]`);
    }, 300);
  };

  const getRenderedText = () => {
    return reason.i18n[selectedLang].text;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">bug_report</span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                跨端输出回显仿真沙盒 (Client Echo Sandbox)
              </h3>
              <span className="text-[11px] font-mono text-blue-700 font-semibold">
                目标字典项: {reason.code} - {reason.nameZh}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">终端模拟通道</label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedClient('app')}
                  className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    selectedClient === 'app'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">smartphone</span>
                  <span>出卡端 App</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClient('api')}
                  className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    selectedClient === 'api'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">api</span>
                  <span>商户 OpenAPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClient('cs')}
                  className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    selectedClient === 'cs'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">support_agent</span>
                  <span>客服工单</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClient('bot')}
                  className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    selectedClient === 'bot'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">notifications</span>
                  <span>企微机器人</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">语言环境 (Locale)</label>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedLang('zhCN')}
                  className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedLang === 'zhCN'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  中文 (zh-CN)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLang('enUS')}
                  className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedLang === 'enUS'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  英文 (en-US)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLang('pidgin')}
                  className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedLang === 'pidgin'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  洋泾浜 (Pidgin)
                </button>
              </div>
            </div>
          </div>

          {/* Test Parameters */}
          <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="text-slate-500 block mb-1 text-[11px]">测试订单号</label>
              <input
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1 text-[11px]">卡种名称</label>
              <input
                value={cardBrand}
                onChange={(e) => setCardBrand(e.target.value)}
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-[11px]"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1 text-[11px]">申报面额 (USD)</label>
              <input
                type="number"
                value={declaredVal}
                onChange={(e) => setDeclaredVal(Number(e.target.value))}
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Dynamic Render Sandbox */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700 uppercase text-[10px] tracking-wider">
                终端视图实时回显 (Render Preview)
              </span>
              <span className="font-mono text-[10px] text-emerald-600">延迟 &lt; 15ms</span>
            </div>

            {selectedClient === 'app' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>出卡失败提示 ({reason.shortCode})</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-700">{orderNo}</span>
                </div>
                <p className="text-amber-950 font-medium text-xs leading-relaxed">
                  {getRenderedText()}
                </p>
                <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-amber-900">
                  <span>建议动作: {reason.actionDecision}</span>
                  <button className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-semibold text-[10px]">
                    发起复核申诉
                  </button>
                </div>
              </div>
            )}

            {selectedClient === 'api' && (
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-rose-400 font-bold">
                    {reason.clientRenders.merchantApiError.httpStatus}
                  </span>
                  <span className="text-slate-400 text-[10px]">Content-Type: application/json</span>
                </div>
                <pre className="text-emerald-400 overflow-x-auto p-1 bg-slate-950 rounded leading-relaxed">
                  {JSON.stringify(
                    {
                      code: reason.shortCode,
                      message: getRenderedText(),
                      order_id: orderNo,
                      card: cardBrand,
                      declared_amount: declaredVal,
                      timestamp: new Date().toISOString(),
                      retryable: false,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}

            {selectedClient === 'cs' && (
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[17px]">support_agent</span>
                    <span>客服工单归因标注: [{reason.code}]</span>
                  </span>
                  <span className="text-[10px] font-mono text-purple-700">SLA 15MIN</span>
                </div>
                <div className="text-purple-950 text-xs leading-relaxed bg-white p-2.5 rounded border border-purple-100">
                  <strong>用户申诉归因:</strong> {getRenderedText()}
                  <div className="mt-1 text-slate-500">
                    <strong>标准处置动作:</strong> {reason.actionDecision}
                  </div>
                </div>
              </div>
            )}

            {selectedClient === 'bot' && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                  <span className="material-symbols-outlined text-[17px]">smart_toy</span>
                  <span>企业微信/钉钉告警机器人</span>
                </div>
                <div className="bg-white p-3 rounded border border-blue-100 space-y-1 font-mono text-[11px] text-slate-800">
                  <div className="text-rose-600 font-bold">⚠️ 收到高频归因触发通知</div>
                  <div>- 原因代码: {reason.code}</div>
                  <div>- 触发订单: {orderNo} ({cardBrand})</div>
                  <div>- 语义解释: {getRenderedText()}</div>
                  <div className="text-slate-400 text-[10px] pt-1">
                    系统策略组自动广播 · 签名已校验
                  </div>
                </div>
              </div>
            )}
          </div>

          {echoResult && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
              <span>{echoResult}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleRunEcho}
              disabled={isSimulating}
              className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-xs border border-blue-200 flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">play_arrow</span>
              <span>{isSimulating ? '沙盒模拟中...' : '重新执行仿真'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold cursor-pointer"
            >
              完成测试并退出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
