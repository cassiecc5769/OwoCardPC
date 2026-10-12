import React, { useState } from 'react';

interface TransactionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeRangeLabel: string;
}

export const TransactionExportModal: React.FC<TransactionExportModalProps> = ({
  isOpen,
  onClose,
  timeRangeLabel,
}) => {
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv' | 'json'>('xlsx');
  const [includeKpi, setIncludeKpi] = useState(true);
  const [includeFunnel, setIncludeFunnel] = useState(true);
  const [includeQuadrant, setIncludeQuadrant] = useState(true);
  const [includeAnomalies, setIncludeAnomalies] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);

  if (!isOpen) return null;

  const handleStartExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setDownloadReady(true);

      // Trigger client-side file download
      const fileName = `Transaction_Analytics_Report_${Date.now()}.${exportFormat}`;
      const dummyContent = JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          period: timeRangeLabel,
          modules: {
            macroKpi: includeKpi ? { gmv: 1428500, orders: 12560, autoPass: '78.5%' } : null,
            funnel: includeFunnel ? { endToEndConversion: '71.03%', totalSubmitted: 10000, settled: 7103 } : null,
            quadrants: includeQuadrant ? ['Apple US', 'Steam Global', 'Google Play', 'Razer Gold', 'Vanilla Visa'] : null,
            anomalies: includeAnomalies ? { count: 680, lossAmountUsd: 28450 } : null,
          },
        },
        null,
        2
      );

      const blob = new Blob([dummyContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <span className="material-symbols-outlined text-[20px]">file_download</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">导出交易质量深度报表</h3>
              <p className="text-[11px] text-slate-500">统计周期: {timeRangeLabel}</p>
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
          <div>
            <label className="font-semibold text-slate-900 block mb-2">选择导出格式</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('xlsx')}
                className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer font-medium ${
                  exportFormat === 'xlsx'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer font-medium ${
                  exportFormat === 'csv'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                CSV 格式
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer font-medium ${
                  exportFormat === 'json'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                JSON 原始集
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-900 block mb-2">包含数据模块</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeKpi}
                  onChange={(e) => setIncludeKpi(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-slate-800">交易宏观质量看板 (GMV / 笔数 / 直通率)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFunnel}
                  onChange={(e) => setIncludeFunnel(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-slate-800">全生命周期转化漏斗 (5步损耗与流失归因)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQuadrant}
                  onChange={(e) => setIncludeQuadrant(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-slate-800">卡种品牌象限与面值结构分析</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAnomalies}
                  onChange={(e) => setIncludeAnomalies(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-slate-800">异常根因归集与典型卡单清单</span>
              </label>
            </div>
          </div>

          {downloadReady && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs animate-fadeIn">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
              <span>报表已成功生成并推送到浏览器下载！</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
          >
            关闭
          </button>
          <button
            disabled={isExporting}
            onClick={handleStartExport}
            className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <span className="material-symbols-outlined text-[15px] animate-spin">refresh</span>
                <span>正在生成报表...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>确认导出并下载</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
