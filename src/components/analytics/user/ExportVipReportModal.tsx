import React, { useState } from 'react';

interface ExportVipReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportVipReportModal: React.FC<ExportVipReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tierSelection, setTierSelection] = useState<'both' | 'lv5' | 'lv4'>('both');
  const [includeContact, setIncludeContact] = useState(true);
  const [includeCardPreferences, setIncludeCardPreferences] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 900);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <span className="material-symbols-outlined text-[20px]">stacked_line_chart</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">导出高价值大客流转报表</h3>
              <p className="text-[11px] text-slate-500">
                LV4 钻石机构 + LV5 殿堂户 · 贡献 58.4% 全站 GMV 专属名册
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
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex justify-between items-center text-[11.5px]">
              <span className="text-slate-500">当前大客总池:</span>
              <span className="font-bold text-indigo-700 font-numeric-stat">
                4,210 人 (占总注册 6.1%)
              </span>
            </div>
            <div className="flex justify-between items-center text-[11.5px]">
              <span className="text-slate-500">月均出卡贡献:</span>
              <span className="font-bold text-slate-900 font-numeric-stat">
                $4,850,200 USD (占比 58.4%)
              </span>
            </div>
          </div>

          {/* 等级范围选择 */}
          <div>
            <label className="font-semibold text-slate-900 block mb-1.5">包含大客等级</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTierSelection('both')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                  tierSelection === 'both'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                LV4 + LV5 全体大客
              </button>
              <button
                type="button"
                onClick={() => setTierSelection('lv5')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                  tierSelection === 'lv5'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                仅 LV5 殿堂核心客 (1,230人)
              </button>
              <button
                type="button"
                onClick={() => setTierSelection('lv4')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                  tierSelection === 'lv4'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                仅 LV4 钻石机构户 (2,980人)
              </button>
            </div>
          </div>

          {/* 包含字段配置 */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-900 block">字段附带选项</label>
            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={includeContact}
                onChange={(e) => setIncludeContact(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-medium text-slate-900">包含客户经理 1v1 对接联系人</span>
                <p className="text-[11px] text-slate-500">
                  附带负责的 Telegram 客服 Handle、专属 WhatsApp 号码及最后关怀沟通时间
                </p>
              </div>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCardPreferences}
                onChange={(e) => setIncludeCardPreferences(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-medium text-slate-900">包含近 90 天主出卡种及折算偏好</span>
                <p className="text-[11px] text-slate-500">
                  标识核心持仓卡种（如 Apple Store, Steam, Vanilla Visa）与结算币种
                </p>
              </div>
            </label>
          </div>

          {exportSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs animate-fadeIn">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                check_circle
              </span>
              <span>高价值大客流转报表生成完毕 (VIP_Portfolio_Report.xlsx)！</span>
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
            disabled={isExporting}
            onClick={handleExport}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            {isExporting ? (
              <>
                <span className="material-symbols-outlined text-[15px] animate-spin">refresh</span>
                <span>正在编译导出...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[15px]">file_download</span>
                <span>导出 VIP 流转清单</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
