import React, { useState } from 'react';

interface VipProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePolicy?: (policy: {
    inactivityHours: number;
    enableDedicatedManager: boolean;
    rateBoostPercent: number;
    priorityVerification: boolean;
  }) => void;
}

export const VipProtectionModal: React.FC<VipProtectionModalProps> = ({
  isOpen,
  onClose,
  onSavePolicy,
}) => {
  const [inactivityHours, setInactivityHours] = useState(72);
  const [enableDedicatedManager, setEnableDedicatedManager] = useState(true);
  const [rateBoostPercent, setRateBoostPercent] = useState(0.3);
  const [priorityVerification, setPriorityVerification] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      if (onSavePolicy) {
        onSavePolicy({
          inactivityHours,
          enableDedicatedManager,
          rateBoostPercent,
          priorityVerification,
        });
      }
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">配置大客分级保护与防流失策略</h3>
              <p className="text-[11px] text-slate-500">
                针对 LV4 钻石机构户与 LV5 殿堂核心客的自动流失预警与让利机制
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* 流失预警阈值 */}
          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-amber-600">
                  alarm_on
                </span>
                <span>未挂单超时预警时长阈值</span>
              </span>
              <span className="font-numeric-stat font-bold text-amber-700 text-sm">
                {inactivityHours} 小时
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 leading-relaxed">
              当 LV4/LV5 客户超过设有时长无任何询价、提交卡单或划付动作时，系统将自动向专属客户经理推送风控待办工单。
            </p>
            <div className="flex items-center gap-2 pt-1">
              {[24, 48, 72, 96, 120].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setInactivityHours(h)}
                  className={`flex-1 py-1.5 rounded-lg text-center font-medium border text-[11px] transition-all cursor-pointer ${
                    inactivityHours === h
                      ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                  }`}
                >
                  {h}小时
                </button>
              ))}
            </div>
          </div>

          {/* 策略保护项 */}
          <div className="space-y-3">
            <label className="font-semibold text-slate-900 block">保护通道与补偿策略</label>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50">
              <div>
                <span className="font-medium text-slate-900 block">
                  自动派发 1v1 Telegram / WhatsApp 关怀工单
                </span>
                <span className="text-[11px] text-slate-500">
                  预警触发后，在 15 分钟内通知指定专属商务对接沟通
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableDedicatedManager}
                onChange={(e) => setEnableDedicatedManager(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50">
              <div>
                <span className="font-medium text-slate-900 block">
                  防流失专属让利加息补偿券
                </span>
                <span className="text-[11px] text-slate-500">
                  出卡结算汇率上浮加成，锁定再次复购
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-numeric-stat text-xs">
                <span className="text-emerald-700 font-bold">+{rateBoostPercent}%</span>
                <select
                  value={rateBoostPercent}
                  onChange={(e) => setRateBoostPercent(parseFloat(e.target.value))}
                  className="p-1 rounded border border-slate-200 bg-white cursor-pointer"
                >
                  <option value={0.1}>+0.1%</option>
                  <option value={0.2}>+0.2%</option>
                  <option value={0.3}>+0.3% (推荐)</option>
                  <option value={0.5}>+0.5% (顶格)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50">
              <div>
                <span className="font-medium text-slate-900 block">
                  VIP 秒级核销撮合绿色通道
                </span>
                <span className="text-[11px] text-slate-500">
                  卡单享有优先撮合队列，SLA 保证在 60 秒内核销完毕
                </span>
              </div>
              <input
                type="checkbox"
                checked={priorityVerification}
                onChange={(e) => setPriorityVerification(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs animate-fadeIn">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                check_circle
              </span>
              <span>分级保护策略已成功保存并立即同步至风控撮合引擎！</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            disabled={isSaving}
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[15px] animate-spin">refresh</span>
                <span>正在应用策略...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[15px]">save</span>
                <span>应用并激活策略</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
