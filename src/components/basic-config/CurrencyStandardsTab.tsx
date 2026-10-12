import React, { useState } from 'react';
import { CurrencyStandardItem } from './types';

interface CurrencyStandardsTabProps {
  currencies: CurrencyStandardItem[];
  selectedCurrencyCode: string;
  onSelectCurrency: (code: string) => void;
  onToggleStatus: (code: string) => void;
  onSyncRate: (currency: CurrencyStandardItem) => void;
}

export const CurrencyStandardsTab: React.FC<CurrencyStandardsTabProps> = ({
  currencies,
  selectedCurrencyCode,
  onSelectCurrency,
  onToggleStatus,
  onSyncRate,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const totalItems = currencies.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = currencies.slice(startIndex, startIndex + pageSize);

  const selectedCurrency = currencies.find((c) => c.code === selectedCurrencyCode) || currencies[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left: Currencies Table (7/12) */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-sm">法定与数字货币币种字典</span>
            <span className="font-mono text-xs text-slate-400">
              (共 {totalItems} 种结算货币 / ISO 4217 国际标准)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">单页:</span>
            <span className="font-mono text-xs text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
              {pageSize} 条/页
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3 w-8 text-center">选</th>
                <th className="py-2.5 px-3">代码 / 符号</th>
                <th className="py-2.5 px-3">币种全称</th>
                <th className="py-2.5 px-2">类型</th>
                <th className="py-2.5 px-3">官方中间牌价 (CNY基准)</th>
                <th className="py-2.5 px-2">波动阈值</th>
                <th className="py-2.5 px-2 text-center">状态</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {currentItems.map((curr) => {
                const isSelected = selectedCurrency?.code === curr.code;
                return (
                  <tr
                    key={curr.code}
                    onClick={() => onSelectCurrency(curr.code)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/60 hover:bg-blue-50/80' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="radio"
                        name="curr_select"
                        checked={isSelected}
                        onChange={() => onSelectCurrency(curr.code)}
                        className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded bg-slate-100 text-slate-800 font-bold font-mono flex items-center justify-center text-xs">
                          {curr.symbol}
                        </span>
                        <span className="font-mono font-bold text-blue-700">{curr.code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{curr.nameZh}</div>
                      <div className="font-mono text-[10px] text-slate-400">{curr.nameEn}</div>
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                          curr.type === 'CRYPTO'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {curr.typeLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div className="font-bold text-slate-900">
                        {curr.referenceRate.toFixed(curr.decimalPrecision > 2 ? curr.decimalPrecision : 4)}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {curr.priceSource}
                      </div>
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap font-mono text-emerald-700 font-semibold">
                      ±{curr.floatThresholdPercent}%
                    </td>
                    <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={curr.enabled}
                          onChange={() => onToggleStatus(curr.code)}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSyncRate(curr)}
                        className="text-blue-600 hover:underline font-medium cursor-pointer"
                        type="button"
                      >
                        平价校准
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            当前显示第 {startIndex + 1} 至 {Math.min(startIndex + pageSize, totalItems)} 项，共 {totalItems} 币种
          </span>
          <div className="flex items-center gap-1 font-mono">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              type="button"
            >
              上一页
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
                type="button"
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              type="button"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* Right: Currency Inspector (5/12) */}
      <div className="lg:col-span-5 space-y-4">
        {selectedCurrency && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold font-mono text-base flex items-center justify-center">
                  {selectedCurrency.symbol}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedCurrency.nameZh} ({selectedCurrency.code})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    精度: {selectedCurrency.decimalPrecision} 位小数 · {selectedCurrency.typeLabel}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                SYNCED
              </span>
            </div>

            {/* Exchange Rate Alignment Monitor */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">基准中间价 (1 {selectedCurrency.code} =):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {selectedCurrency.referenceRate} CNY
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">官方牌价数据源:</span>
                <span className="font-medium text-slate-700 text-[11px]">{selectedCurrency.priceSource}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">双轨同步心跳:</span>
                <span className="font-mono text-emerald-600 font-semibold">{selectedCurrency.lastSyncTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">基差偏离度 (Basis Points):</span>
                <span className="font-mono text-blue-700 font-semibold">
                  +{selectedCurrency.basisPointsDiff} bps (安全区间内)
                </span>
              </div>
            </div>

            {/* Rounding & Ledger Rules */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                日终清算平账与尾差截断规则
              </span>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 leading-relaxed font-mono text-[11px]">
                {selectedCurrency.roundingMethod}。系统每日日切时钟将毫秒级自动对账，平抑微调差额自动过账进入汇兑损益凭证。
              </div>
            </div>

            {/* Volume Stats */}
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">24小时承兑交易量</span>
                <span className="font-mono font-bold text-blue-900 text-base">
                  {selectedCurrency.dailyVolumeUsd}
                </span>
              </div>
              <button
                onClick={() => onSyncRate(selectedCurrency)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">sync</span>
                <span>立即拉取最新牌价</span>
              </button>
            </div>
          </div>
        )}

        {/* Currency Safety Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <span className="material-symbols-outlined text-[17px] text-blue-600">
              currency_exchange
            </span>
            <span>汇率毫秒级双轨对齐保护规范</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            当中国银行外汇牌价与 CoinMarketCap 链上价基差超过 ±0.15% 阈值时，撮合引擎自动启用防抖平抑算法，锁价保护期延长至 180 秒以防止极端行情套利穿仓。
          </p>
        </div>
      </div>
    </div>
  );
};
