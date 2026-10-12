import React, { useState } from 'react';

interface FunnelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: FunnelConfig) => void;
}

export interface FunnelConfig {
  ocrLossThreshold: number;
  quoteLossThreshold: number;
  merchantAcceptLossThreshold: number;
  apiTimeoutLossThreshold: number;
  quoteSlaSec: number;
  merchantResponseSlaSec: number;
  officialVerifySlaSec: number;
  autoCircuitBreaker: boolean;
  smsAlertStaff: boolean;
}

export const FunnelConfigModal: React.FC<FunnelConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState<FunnelConfig>({
    ocrLossThreshold: 6.0,
    quoteLossThreshold: 20.0,
    merchantAcceptLossThreshold: 3.5,
    apiTimeoutLossThreshold: 8.0,
    quoteSlaSec: 1.0,
    merchantResponseSlaSec: 3.0,
    officialVerifySlaSec: 45.0,
    autoCircuitBreaker: true,
    smsAlertStaff: true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">全息转化漏斗参数与预警阈值设定</h3>
              <p className="text-[11px] text-slate-500">转化漏斗 SLA 与动态折损警戒策略</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Section 1: 环节流失预警线 */}
          <div>
            <span className="font-semibold text-slate-900 text-xs block mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs inline-block" />
              流失率警戒红线配置 (超出即触发运营警报)
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-[11px] text-slate-500 block mb-1">Step 1: OCR/格式校验流失</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    value={config.ocrLossThreshold}
                    onChange={(e) => setConfig({ ...config, ocrLossThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-16 h-8 bg-white border border-slate-200 rounded-lg px-2 font-numeric-stat font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <span className="text-slate-500">%</span>
                  <span className="text-[10.5px] text-slate-400 ml-auto">当前5.0%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-[11px] text-slate-500 block mb-1">Step 2: 报价未锁放弃流失</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    value={config.quoteLossThreshold}
                    onChange={(e) => setConfig({ ...config, quoteLossThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-16 h-8 bg-white border border-slate-200 rounded-lg px-2 font-numeric-stat font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <span className="text-slate-500">%</span>
                  <span className="text-[10.5px] text-slate-400 ml-auto">当前18.0%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-[11px] text-slate-500 block mb-1">Step 3: 无承兑商流单率</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    value={config.merchantAcceptLossThreshold}
                    onChange={(e) => setConfig({ ...config, merchantAcceptLossThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-16 h-8 bg-white border border-slate-200 rounded-lg px-2 font-numeric-stat font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <span className="text-slate-500">%</span>
                  <span className="text-[10.5px] text-slate-400 ml-auto">当前3.0%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-[11px] text-slate-500 block mb-1">Step 4: API做卡超时折损</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    value={config.apiTimeoutLossThreshold}
                    onChange={(e) => setConfig({ ...config, apiTimeoutLossThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-16 h-8 bg-white border border-slate-200 rounded-lg px-2 font-numeric-stat font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <span className="text-slate-500">%</span>
                  <span className="text-[10.5px] text-slate-400 ml-auto">当前6.0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: SLA时效基准 */}
          <div>
            <span className="font-semibold text-slate-900 text-xs block mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-emerald-600 rounded-xs inline-block" />
              SLA 流转时效基线标准 (基准参考线)
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-[10.5px] text-slate-500 block mb-1">系统报价响应</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={config.quoteSlaSec}
                    onChange={(e) => setConfig({ ...config, quoteSlaSec: parseFloat(e.target.value) || 0 })}
                    className="w-14 h-7 bg-white border border-slate-200 rounded px-1.5 font-numeric-stat font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-slate-500">秒</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-[10.5px] text-slate-500 block mb-1">商户抢单受理</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={config.merchantResponseSlaSec}
                    onChange={(e) => setConfig({ ...config, merchantResponseSlaSec: parseFloat(e.target.value) || 0 })}
                    className="w-14 h-7 bg-white border border-slate-200 rounded px-1.5 font-numeric-stat font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-slate-500">秒</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-[10.5px] text-slate-500 block mb-1">官方核销耗时</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="1"
                    value={config.officialVerifySlaSec}
                    onChange={(e) => setConfig({ ...config, officialVerifySlaSec: parseFloat(e.target.value) || 0 })}
                    className="w-14 h-7 bg-white border border-slate-200 rounded px-1.5 font-numeric-stat font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-slate-500">秒</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 自动化策略与联动开关 */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block text-xs">自动触发风控熔断保护</span>
                <span className="text-[11px] text-slate-400">当单卡种 5 分钟内连续流失率超过警戒值 1.5 倍时自动暂停该通道</span>
              </div>
              <input
                type="checkbox"
                checked={config.autoCircuitBreaker}
                onChange={(e) => setConfig({ ...config, autoCircuitBreaker: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block text-xs">短信与企微协同告警通知</span>
                <span className="text-[11px] text-slate-400">出现商户接单承揽断崖式下跌时即时推送值班工程师与承兑运营</span>
              </div>
              <input
                type="checkbox"
                checked={config.smsAlertStaff}
                onChange={(e) => setConfig({ ...config, smsAlertStaff: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {savedSuccess ? '参数已更新至实时风控规则引擎！' : '修改将即时作用于流转漏斗看板与警戒判定'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer shadow-xs"
            >
              {savedSuccess ? '保存成功' : '保存并生效'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
