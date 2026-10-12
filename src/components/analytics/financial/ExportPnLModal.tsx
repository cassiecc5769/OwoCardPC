import React, { useState } from 'react';
import { CurrencyMode, USD_TO_NGN_RATE } from './types';

interface ExportPnLModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyMode;
  timeRangeLabel: string;
  onExportSuccess: (filename: string) => void;
}

export const ExportPnLModal: React.FC<ExportPnLModalProps> = ({
  isOpen,
  onClose,
  currency,
  timeRangeLabel,
  onExportSuccess,
}) => {
  const [format, setFormat] = useState<'xlsx' | 'csv' | 'pdf'>('xlsx');
  const [exportCurrency, setExportCurrency] = useState<CurrencyMode>(currency);
  const [includeWaterfall, setIncludeWaterfall] = useState(true);
  const [includeAttribution, setIncludeAttribution] = useState(true);
  const [includeSensitivity, setIncludeSensitivity] = useState(true);
  const [memo, setMemo] = useState('2026年08月管理层经营分析与单元经济学核算报表');

  if (!isOpen) return null;

  const handleExport = () => {
    const filename = `CardOps_PnL_Management_Report_${new Date().toISOString().slice(0, 10)}.${format}`;
    onExportSuccess(filename);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">file_download</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                导出管理层损益表 (P&L Export)
              </h3>
              <span className="font-code-token text-[11px] text-slate-500">
                AUDIT COMPLIANT · IFRS / ACCRUAL BASIS
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* Export Format */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800 block">导出版式与格式</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                  format === 'xlsx'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                  format === 'csv'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                CSV 原始数据
              </button>
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                  format === 'pdf'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                PDF (呈批版)
              </button>
            </div>
          </div>

          {/* Time & Currency settings */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-500 block mb-1">统计周期:</span>
              <span className="font-semibold text-slate-900">{timeRangeLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">结算货币口径:</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="exportCurr"
                    checked={exportCurrency === 'USD'}
                    onChange={() => setExportCurrency('USD')}
                    className="accent-blue-600"
                  />
                  <span>USD ($)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="exportCurr"
                    checked={exportCurrency === 'NGN'}
                    onChange={() => setExportCurrency('NGN')}
                    className="accent-blue-600"
                  />
                  <span>NGN (₦)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Included Sections */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 block">包含附表与透视维度</label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWaterfall}
                  onChange={(e) => setIncludeWaterfall(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span>现金流逐层留存瀑布模型 (Unit Economics Waterfall)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAttribution}
                  onChange={(e) => setIncludeAttribution(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span>品类与发行国多维毛利透视表及三层成本归因 (SKU & Geo P&L)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSensitivity}
                  onChange={(e) => setIncludeSensitivity(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span>近6个月净毛利率演进趋势与分成敏感度模拟 (Simulation Analysis)</span>
              </label>
            </div>
          </div>

          {/* Report Note */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-800 block">报表呈批摘要与流水号</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>生成并下载管理层报表</span>
          </button>
        </div>
      </div>
    </div>
  );
};
