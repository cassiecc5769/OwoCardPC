import React, { useState } from 'react';

interface DispatchConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: {
    spreadBoostPercent: number;
    top1RedlinePercent: number;
    backupDivertPercent: number;
    priorityMode: string;
    autoThrottle: boolean;
  }) => void;
}

export const DispatchConfigModal: React.FC<DispatchConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [spreadBoostPercent, setSpreadBoostPercent] = useState(0.8);
  const [top1RedlinePercent, setTop1RedlinePercent] = useState(40.0);
  const [backupDivertPercent, setBackupDivertPercent] = useState(15);
  const [priorityMode, setPriorityMode] = useState('低费率优先 (Cost Optimal)');
  const [autoThrottle, setAutoThrottle] = useState(true);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      spreadBoostPercent,
      top1RedlinePercent,
      backupDivertPercent,
      priorityMode,
      autoThrottle,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                供需调度与风控熔断规则配置
              </h3>
              <span className="text-[11px] text-slate-500 font-code-token">
                DISPATCH ENGINE PARAMETERS (PRD v2.0)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* 规则 1: 缺口卡种动态上浮加价补贴 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-900">
                缺口卡种商户折率上浮补贴 (Spread Boost)
              </label>
              <span className="font-numeric-stat font-bold text-blue-600">
                +{spreadBoostPercent}%
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              当某卡种供求缓冲低于 70% 触发缺口报警时，撮合引擎对接单商户自动追加上浮折率以吸引产能。
            </p>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={spreadBoostPercent}
              onChange={(e) => setSpreadBoostPercent(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* 规则 2: 单商户日承揽熔断红线 */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-900">
                单商户全网日承揽熔断红线 (HHI Anti-Monopoly)
              </label>
              <span className="font-numeric-stat font-bold text-rose-600">
                {top1RedlinePercent}%
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              防止单点故障引发全盘瘫痪。超过此比例后，强制暂停向该商户派单，溢出订单分流至备用池。
            </p>
            <input
              type="range"
              min="25"
              max="50"
              step="1"
              value={top1RedlinePercent}
              onChange={(e) => setTop1RedlinePercent(parseFloat(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          {/* 规则 3: 备用商户池流量预热比例 */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-900">
                备用商户试水流量预热比例 (Warm-up Pool)
              </label>
              <span className="font-numeric-stat font-bold text-emerald-700">
                {backupDivertPercent}%
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              常态向 Tier-A 及 Tier-B 轮训派发小额测试单，确保备选通道 API 连接通畅、人工坐席在岗。
            </p>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={backupDivertPercent}
              onChange={(e) => setBackupDivertPercent(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* 规则 4: 优先撮合逻辑 */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <label className="font-semibold text-slate-900 block">
              默认主排程撮合优先级策略
            </label>
            <select
              value={priorityMode}
              onChange={(e) => setPriorityMode(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none cursor-pointer"
            >
              <option>低费率优先 (Cost Optimal) - 平台利差最大化</option>
              <option>SLA响应时效优先 (Speed First) - API极速完单优先</option>
              <option>保证金充裕度加权 (Risk Safe) - 质押金高者优先</option>
              <option>履约信用分加权均衡 (Balanced Score)</option>
            </select>
          </div>

          {/* 规则 5: 防爆仓限流规则开关 */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 block">防爆仓限流防护机制 (Auto-Throttle)</span>
              <span className="text-[11px] text-slate-500">当全网做卡平均耗时超过90秒时，自动放缓前端放水节奏</span>
            </div>
            <button
              onClick={() => setAutoThrottle(!autoThrottle)}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                autoThrottle ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
          >
            保存并实时下发调度引擎
          </button>
        </div>
      </div>
    </div>
  );
};
