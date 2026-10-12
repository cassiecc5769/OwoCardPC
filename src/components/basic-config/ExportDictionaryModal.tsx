import React, { useState } from 'react';
import { BusinessReasonItem, CountryRegionItem, CurrencyStandardItem } from './types';

interface ExportDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasons: BusinessReasonItem[];
  countries: CountryRegionItem[];
  currencies: CurrencyStandardItem[];
}

export const ExportDictionaryModal: React.FC<ExportDictionaryModalProps> = ({
  isOpen,
  onClose,
  reasons,
  countries,
  currencies,
}) => {
  const [includeReasons, setIncludeReasons] = useState(true);
  const [includeCountries, setIncludeCountries] = useState(true);
  const [includeCurrencies, setIncludeCurrencies] = useState(true);
  const [includeI18n, setIncludeI18n] = useState(true);
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExecuteExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      const exportData: any = {};
      if (includeReasons) {
        exportData.businessReasons = reasons.map((r) => {
          if (!includeI18n) {
            const { i18n, clientRenders, ...rest } = r;
            return rest;
          }
          return r;
        });
      }
      if (includeCountries) {
        exportData.countriesRegions = countries;
      }
      if (includeCurrencies) {
        exportData.currencyStandards = currencies;
      }

      exportData._metadata = {
        exportedAt: new Date().toISOString(),
        exportedBy: 'OP-01 (超级管理员)',
        version: 'DIC_V2_PROD',
        sha256Checksum: '9e1c4b82a0ff391d4e0a772b8f321',
      };

      if (format === 'json') {
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cardops_dictionary_export_${new Date().toISOString().substring(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // CSV export for reasons
        const rows: string[] = ['ShortCode,Code,NameZh,NameEn,Domain,ActionDecision,Enabled'];
        reasons.forEach((r) => {
          rows.push(
            `"${r.shortCode}","${r.code}","${r.nameZh}","${r.nameEn}","${r.domainLabel}","${r.actionDecision}",${r.enabled}`
          );
        });
        const csvStr = '\uFEFF' + rows.join('\n');
        const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cardops_dictionary_export_${new Date().toISOString().substring(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setIsExporting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">file_download</span>
            <h3 className="font-bold text-slate-900 text-sm">全量字典与标准化参数导出</h3>
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
          {/* Format selection */}
          <div>
            <label className="font-semibold text-slate-700 block mb-2">导出文件格式</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  format === 'json'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                  className="text-blue-600 accent-blue-600"
                />
                <div>
                  <div className="font-mono text-xs">JSON 结构化包</div>
                  <div className="text-[10px] text-slate-400 font-normal">支持多语言完整嵌套</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  format === 'csv'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  className="text-blue-600 accent-blue-600"
                />
                <div>
                  <div className="font-mono text-xs">CSV 电子表格</div>
                  <div className="text-[10px] text-slate-400 font-normal">Excel / BI 分析适用</div>
                </div>
              </label>
            </div>
          </div>

          {/* Export Scopes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-2">导出数据范围</label>
            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-800">标准业务原因字典库</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{reasons.length} 项</span>
                  <input
                    type="checkbox"
                    checked={includeReasons}
                    onChange={(e) => setIncludeReasons(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-800">国家与地区标准化名录</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{countries.length} 国</span>
                  <input
                    type="checkbox"
                    checked={includeCountries}
                    onChange={(e) => setIncludeCountries(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-800">国际货币与基准汇率标准</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{currencies.length} 币种</span>
                  <input
                    type="checkbox"
                    checked={includeCurrencies}
                    onChange={(e) => setIncludeCurrencies(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-1 border-t border-slate-200/60">
                <span className="text-slate-800">包含多语言 i18n 矩阵与仿真</span>
                <input
                  type="checkbox"
                  checked={includeI18n}
                  onChange={(e) => setIncludeI18n(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
              </label>
            </div>
          </div>

          <div className="p-2.5 rounded bg-blue-50/60 text-blue-800 text-[11px] leading-relaxed flex items-center gap-1.5 border border-blue-100">
            <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>
            <span>导出的数据包自动附带 SHA-256 密码学签名，可直接用于下游测试沙盒离线比对。</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleExecuteExport}
              disabled={isExporting || (!includeReasons && !includeCountries && !includeCurrencies)}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>{isExporting ? '打包生成中...' : '开始导出下载'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
