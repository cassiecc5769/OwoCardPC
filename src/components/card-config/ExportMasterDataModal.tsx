import React, { useState } from 'react';
import { CardSkuMasterItem } from './types';

interface ExportMasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardSkuMasterItem[];
  onSuccess: (filename: string) => void;
}

export const ExportMasterDataModal: React.FC<ExportMasterDataModalProps> = ({
  isOpen,
  onClose,
  cards,
  onSuccess,
}) => {
  const [format, setFormat] = useState<'json' | 'csv' | 'xlsx'>('json');
  const [includeLadders, setIncludeLadders] = useState(true);
  const [includeRegex, setIncludeRegex] = useState(true);
  const [includeOcr, setIncludeOcr] = useState(true);

  if (!isOpen) return null;

  const handleExport = () => {
    const filename = `CardOps_MasterData_Dictionary_${new Date()
      .toISOString()
      .slice(0, 10)}.${format}`;
    onSuccess(filename);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                导出主数据字典 JSON / CSV
              </h3>
              <span className="font-code-token text-[11px] text-slate-500">
                MASTER DATA SCHEMA EXPORT v2.0
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
          {/* Format selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800 block">数据字典格式</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                  format === 'json'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                JSON (程序字典)
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
                CSV 表格
              </button>
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
            </div>
          </div>

          {/* Included Fields */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <label className="font-semibold text-slate-800 block">包含子集配置属性</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeRegex}
                onChange={(e) => setIncludeRegex(e.target.checked)}
                className="rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
              <span>卡密校验正则与形态物料定义 (Regex & Physical Material)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLadders}
                onChange={(e) => setIncludeLadders(e.target.checked)}
                className="rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
              <span>完整面值阶梯、建议收购折率及单日承揽限额</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeOcr}
                onChange={(e) => setIncludeOcr(e.target.checked)}
                className="rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
              <span>OCR 神经网络管道配置与实时余额反查状态</span>
            </label>
          </div>

          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>当前导出涵盖 {cards.length} 条已配置 SKU</span>
            <span className="font-mono">HASH: 8F2A-09BD-C941</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>生成并下载数据字典</span>
          </button>
        </div>
      </div>
    </div>
  );
};
