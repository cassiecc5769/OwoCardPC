import React, { useState } from 'react';
import { CountryRegionItem } from './types';

interface CountriesRegionsTabProps {
  countries: CountryRegionItem[];
  selectedCountryCode: string;
  onSelectCountry: (code: string) => void;
  onToggleStatus: (code: string) => void;
  onOpenEditCountry?: (country: CountryRegionItem) => void;
}

export const CountriesRegionsTab: React.FC<CountriesRegionsTabProps> = ({
  countries,
  selectedCountryCode,
  onSelectCountry,
  onToggleStatus,
  onOpenEditCountry,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const totalItems = countries.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = countries.slice(startIndex, startIndex + pageSize);

  const selectedCountry = countries.find((c) => c.codeAlpha2 === selectedCountryCode) || countries[0];

  const getRiskBadge = (rating: string, label: string) => {
    switch (rating) {
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-700 whitespace-nowrap">
            {label}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 whitespace-nowrap">
            {label}
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-700 whitespace-nowrap">
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 whitespace-nowrap">
            {label}
          </span>
        );
    }
  };

  const getChannelBadge = (status: string, label: string) => {
    switch (status) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            {label}
          </span>
        );
      case 'RATE_BUFFER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            {label}
          </span>
        );
      case 'LIMIT_CONTROL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            {label}
          </span>
        );
      default:
        return <span>{label}</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left: Countries Table (7/12) */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-sm">纳管标准化国家与地区名录</span>
            <span className="font-mono text-xs text-slate-400">
              (共 {totalItems} 国 / 覆盖 5 大洲核验网络)
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
                <th className="py-2.5 px-3">ISO 代码 / 国旗</th>
                <th className="py-2.5 px-3">国家/地区全称</th>
                <th className="py-2.5 px-2.5">所属区域 / 区号</th>
                <th className="py-2.5 px-2.5">本位货币</th>
                <th className="py-2.5 px-3">风控准入评级</th>
                <th className="py-2.5 px-2 text-center">状态</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {currentItems.map((country) => {
                const isSelected = selectedCountry?.codeAlpha2 === country.codeAlpha2;
                return (
                  <tr
                    key={country.codeAlpha2}
                    onClick={() => onSelectCountry(country.codeAlpha2)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/60 hover:bg-blue-50/80' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="radio"
                        name="country_select"
                        checked={isSelected}
                        onChange={() => onSelectCountry(country.codeAlpha2)}
                        className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">{country.flagEmoji}</span>
                        <div>
                          <div className="font-mono font-bold text-slate-800">
                            {country.codeAlpha2} / {country.codeAlpha3}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{country.nameZh}</div>
                      <div className="font-mono text-[10px] text-slate-400">{country.nameEn}</div>
                    </td>
                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <div className="text-slate-700">{country.continent}</div>
                      <div className="font-mono text-[10px] text-slate-400">{country.callingCode}</div>
                    </td>
                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-700 px-1.5 py-0.5 rounded bg-blue-50">
                        {country.currency}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getRiskBadge(country.riskRating, country.riskLabel)}
                    </td>
                    <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={country.enabled}
                          onChange={() => onToggleStatus(country.codeAlpha2)}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectCountry(country.codeAlpha2)}
                        className="text-blue-600 hover:underline font-medium cursor-pointer"
                        type="button"
                      >
                        详情
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
            当前显示第 {startIndex + 1} 至 {Math.min(startIndex + pageSize, totalItems)} 项，共 {totalItems} 国
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

      {/* Right: Country Detail Inspector (5/12) */}
      <div className="lg:col-span-5 space-y-4">
        {selectedCountry && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none">{selectedCountry.flagEmoji}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">{selectedCountry.nameZh}</span>
                    <span className="text-xs text-slate-500 font-mono">({selectedCountry.nameEn})</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    ISO {selectedCountry.codeAlpha2} / {selectedCountry.codeAlpha3} · {selectedCountry.continent}
                  </span>
                </div>
              </div>
              {getChannelBadge(selectedCountry.cardChannelStatus, selectedCountry.cardChannelLabel)}
            </div>

            {/* Core Specs Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 text-[10px] block">官方本位货币</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  {selectedCountry.currency}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 text-[10px] block">增值税 / 预扣税率</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {selectedCountry.taxRatePercent}%
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 text-[10px] block">国际长途电话区号</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {selectedCountry.callingCode}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 text-[10px] block">风控安全评级</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {selectedCountry.riskLabel}
                </span>
              </div>
            </div>

            {/* KYC & Identity verification rules */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                当地法定身份认证强校验标准 (KYC MATRIX)
              </span>
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">badge</span>
                  <span className="font-medium text-slate-800">{selectedCountry.kycLevel}</span>
                </div>
                <span className="text-[10px] text-blue-700 font-semibold bg-white px-2 py-0.5 rounded border border-blue-200">
                  强制启用
                </span>
              </div>
            </div>

            {/* Local payment gateways */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                本地出入金即时结算通道 (LOCAL GATEWAYS)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCountry.localPaymentGateways.map((gw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-medium border border-slate-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {gw}
                  </span>
                ))}
              </div>
            </div>

            {/* Supported Card Types */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                该地区高频受支持礼品卡种 (HOT CARDS)
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedCountry.supportedCards.map((card, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[11px]"
                  >
                    {card}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">前置风控哈希完整挂载</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
                >
                  配置通道限额
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Safety Warning Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <span className="material-symbols-outlined text-[17px] text-blue-600">
              public
            </span>
            <span>国家/地区跨域治理红线</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            修改国家代码或主结算币种将触发该区域全部在途挂单的汇率重新锁价，如遇当地网络动荡可启用“汇率浮动保护”自动垫入 0.35% 防抖缓冲。
          </p>
        </div>
      </div>
    </div>
  );
};
