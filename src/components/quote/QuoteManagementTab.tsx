import React, { useState, useMemo } from 'react';
import {
  StandardSKU,
  SKUQuoteOverview,
  SKUMerchantQuoteDetail,
  MerchantQuoteOverview,
  MerchantSKUQuoteMatrixItem,
  PriceChangeRecordItem,
  QuoteCalculatorData
} from './quoteTypes';
import {
  STANDARD_SKUS,
  MOCK_SKU_QUOTE_OVERVIEWS,
  getMerchantQuotesForSKU,
  MOCK_MERCHANT_QUOTE_OVERVIEWS,
  getSKUMatrixForMerchant,
  MOCK_PRICE_CHANGE_RECORDS
} from './mockQuoteData';

interface QuoteManagementTabProps {
  showToast: (msg: string) => void;
  onNavigateToAnomalies?: () => void;
  initialSubTab?: 'platform' | 'merchant' | 'history';
}

export const QuoteManagementTab: React.FC<QuoteManagementTabProps> = ({
  showToast,
  onNavigateToAnomalies,
  initialSubTab = 'platform'
}) => {
  // 3 大标准子功能 Tab: 按SKU (by_sku) ｜ 按商户 (by_merchant) ｜ 调价记录 (history)
  const [subTab, setSubTab] = useState<'by_sku' | 'by_merchant' | 'history'>(() => {
    if (initialSubTab === 'history') return 'history';
    if (initialSubTab === 'merchant') return 'by_merchant';
    return 'by_sku';
  });

  // 1. 按SKU 筛选条件
  const [filterBrand, setFilterBrand] = useState<string>('ALL');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [filterCurrency, setFilterCurrency] = useState<string>('ALL');
  const [filterForm, setFilterForm] = useState<string>('ALL');
  const [filterSpeed, setFilterSpeed] = useState<string>('ALL');
  const [filterDenom, setFilterDenom] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchSKUQuery, setSearchSKUQuery] = useState<string>('');
  const [showMoreBrands, setShowMoreBrands] = useState<boolean>(false);

  // 2. 按商户 筛选条件
  const [searchMerchantQuery, setSearchMerchantQuery] = useState<string>('');
  const [merchantStatusFilter, setMerchantStatusFilter] = useState<string>('ALL');

  // 3. 调价记录 筛选条件
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [historySourceFilter, setHistorySourceFilter] = useState<string>('ALL');

  // Modals & Drawers 状态
  const [activeSKUDetail, setActiveSKUDetail] = useState<SKUQuoteOverview | null>(null);
  const [activeMerchantDetail, setActiveMerchantDetail] = useState<MerchantQuoteOverview | null>(null);
  const [merchantMatrixOnlyAbnormal, setMerchantMatrixOnlyAbnormal] = useState<boolean>(false);
  const [calculatorSKU, setCalculatorSKU] = useState<StandardSKU | null>(null);
  const [showCalculatorModal, setShowCalculatorModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);

  // 11.3.3 按SKU 过滤后的 SKU 报价列表
  const filteredSKUOverviews = useMemo(() => {
    return MOCK_SKU_QUOTE_OVERVIEWS.filter(item => {
      const s = item.sku;
      if (filterBrand !== 'ALL' && s.brand !== filterBrand) return false;
      if (filterCountry !== 'ALL' && s.country !== filterCountry) return false;
      if (filterCurrency !== 'ALL' && s.currency !== filterCurrency) return false;
      if (filterForm !== 'ALL' && s.cardForm !== filterForm) return false;
      if (filterSpeed !== 'ALL' && s.speed !== filterSpeed) return false;
      if (filterDenom !== 'ALL' && String(s.denomination) !== filterDenom) return false;
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;

      if (searchSKUQuery.trim()) {
        const q = searchSKUQuery.trim().toLowerCase();
        const matchSKU = s.formattedSKU.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
        const matchBrand = s.brand.toLowerCase().includes(q);
        if (!matchSKU && !matchBrand) return false;
      }
      return true;
    });
  }, [filterBrand, filterCountry, filterCurrency, filterForm, filterSpeed, filterDenom, filterStatus, searchSKUQuery]);

  // 11.3.4 按商户 过滤后的商户列表
  const filteredMerchantOverviews = useMemo(() => {
    return MOCK_MERCHANT_QUOTE_OVERVIEWS.filter(m => {
      if (merchantStatusFilter !== 'ALL' && m.status !== merchantStatusFilter) return false;
      if (searchMerchantQuery.trim()) {
        const q = searchMerchantQuery.trim().toLowerCase();
        const matchName = m.merchantName.toLowerCase().includes(q);
        const matchId = m.merchantId.toLowerCase().includes(q);
        if (!matchName && !matchId) return false;
      }
      return true;
    });
  }, [searchMerchantQuery, merchantStatusFilter]);

  // 11.3.5 调价记录 过滤后的变更列表
  const filteredChangeRecords = useMemo(() => {
    return MOCK_PRICE_CHANGE_RECORDS.filter(rec => {
      if (historySourceFilter !== 'ALL' && rec.adjustSource !== historySourceFilter) return false;
      if (historySearchQuery.trim()) {
        const q = historySearchQuery.trim().toLowerCase();
        const matchSKU = rec.sku.formattedSKU.toLowerCase().includes(q);
        const matchM = rec.merchantName.toLowerCase().includes(q) || rec.merchantId.toLowerCase().includes(q);
        const matchId = rec.changeId.toLowerCase().includes(q);
        if (!matchSKU && !matchM && !matchId) return false;
      }
      return true;
    });
  }, [historySearchQuery, historySourceFilter]);

  // 打开报价计算器并充填 SKU
  const handleOpenCalculator = (sku?: StandardSKU) => {
    if (sku) setCalculatorSKU(sku);
    else setCalculatorSKU(STANDARD_SKUS[0]);
    setShowCalculatorModal(true);
  };

  // 导出 CSV 逻辑
  const handleExportData = () => {
    showToast('已成功导出当前 SKU 报价罗盘标准表单 (CSV 格式)！');
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 模块定位 Banner (PRD 11.3 工作台升级说明) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80 shrink-0">
            <span className="material-symbols-outlined text-[22px]">hub</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">SKU 报价管理工作台 (统一事实罗盘)</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200/80">
                收卡端维权 · 作业端看/比/查/变
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              按照 <strong className="text-slate-700 font-mono">Brand × Country × Currency × Card Form × Denomination × Speed</strong> 形成标准 SKU，作为全平台礼品卡报价事实统一管理入口。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => handleOpenCalculator()}
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            <span>报价计算器</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAuditModal(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold border border-amber-200/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">gavel</span>
            <span>代调价风控权限</span>
          </button>
          <button
            type="button"
            onClick={handleExportData}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>导出数据</span>
          </button>
        </div>
      </div>

      {/* 核心 3 大 Tab 导航栏 (统一 Standard Image Tab Bar 风格) */}
      <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-2 pt-2 flex items-center justify-between gap-1 overflow-x-auto text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'by_sku', label: '按SKU (同卡比商户)', icon: 'compare_arrows', badge: `${MOCK_SKU_QUOTE_OVERVIEWS.length} 组SKU` },
            { id: 'by_merchant', label: '按商户 (商户报价矩阵)', icon: 'storefront', badge: `${MOCK_MERCHANT_QUOTE_OVERVIEWS.length} 家商户` },
            { id: 'history', label: '调价记录 (历史履历画像)', icon: 'history', badge: `${MOCK_PRICE_CHANGE_RECORDS.length} 笔变动` }
          ].map(tab => {
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSubTab(tab.id as any);
                  showToast(`已切换至【${tab.label}】`);
                }}
                className={`px-5 py-3 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs sm:text-sm ${
                  isActive
                    ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
                    isActive ? 'bg-blue-100 text-[#004ac6] font-semibold' : 'bg-slate-100 text-slate-600 font-medium'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================================= */}
      {/* Tab 1: 按SKU【Tab】 (默认首页 - 从卡的角度看商户报价) */}
      {/* ========================================================================================= */}
      {subTab === 'by_sku' && (
        <div className="space-y-4">
          {/* 查询条件栏 (11.3.3 一) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            {/* 卡种快捷选择器 (常用卡种 + 搜索 + 更多) */}
            <div className="flex items-center gap-2 flex-wrap border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-bold shrink-0">卡种快捷精选:</span>
              {['ALL', 'Apple', 'Steam', 'Google Play', 'Razer Gold', 'Sephora'].map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setFilterBrand(b)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterBrand === b
                      ? 'bg-[#004ac6] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b === 'ALL' ? '全部卡种' : b}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowMoreBrands(!showMoreBrands)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-0.5"
              >
                <span>{showMoreBrands ? '收起更多' : '更多卡种 ▾'}</span>
              </button>

              {showMoreBrands && (
                <div className="flex items-center gap-1.5 flex-wrap w-full pt-2 animate-in fade-in">
                  {['Vanilla Visa', 'Nordstrom', 'Target', 'Walmart', 'Nike', 'eBay'].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setFilterBrand(b)}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                        filterBrand === b
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 多维度组合下拉筛选器 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {/* 国家 */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">国家 (Country)</label>
                <select
                  value={filterCountry}
                  onChange={e => setFilterCountry(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value="ALL">全部国家</option>
                  <option value="US">US (美国)</option>
                  <option value="CA">CA (加拿大)</option>
                  <option value="UK">UK (英国)</option>
                  <option value="Global">Global (全球)</option>
                </select>
              </div>

              {/* 币种 */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">币种 (Currency)</label>
                <select
                  value={filterCurrency}
                  onChange={e => setFilterCurrency(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value="ALL">全部币种</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>

              {/* 卡介质 */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">卡介质 (Form)</label>
                <select
                  value={filterForm}
                  onChange={e => setFilterForm(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value="ALL">全部介质</option>
                  <option value="E-Code">E-Code (纯卡密)</option>
                  <option value="Physical">Physical (实体小票)</option>
                  <option value="Direct-PIN">Direct-PIN (直充)</option>
                </select>
              </div>

              {/* 交易速度 */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">交易速度 (Speed)</label>
                <select
                  value={filterSpeed}
                  onChange={e => setFilterSpeed(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value="ALL">全部速度</option>
                  <option value="Fast">Fast (秒级直通)</option>
                  <option value="Standard">Standard (标准核销)</option>
                </select>
              </div>

              {/* 面值 */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">面值 (Denom)</label>
                <select
                  value={filterDenom}
                  onChange={e => setFilterDenom(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 font-mono"
                >
                  <option value="ALL">全部面值</option>
                  <option value="50">$50</option>
                  <option value="100">$100</option>
                  <option value="200">$200</option>
                  <option value="400">$400</option>
                </select>
              </div>

              {/* 报价状态 */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">报价状态</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value="ALL">全部状态</option>
                  <option value="生效">生效</option>
                  <option value="失效">失效</option>
                </select>
              </div>

              {/* SKU 模糊搜索 */}
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">SKU 模糊搜索</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchSKUQuery}
                    onChange={e => setSearchSKUQuery(e.target.value)}
                    placeholder="输入品牌/面值/formattedSKU..."
                    className="w-full pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SKU 报价列表主表 (11.3.3 二) */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">SKU 报价主表罗盘</span>
                <span className="font-mono text-[11px] text-slate-500">
                  (已匹配出 {filteredSKUOverviews.length} 组标准 SKU)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                市场参考价与竞争力由行情/监控引擎加权推导
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">标准 SKU 规范串</th>
                    <th className="py-2.5 px-3">卡种 / 国家 / 币种</th>
                    <th className="py-2.5 px-3">面值 / 介质 / 速度</th>
                    <th className="py-2.5 px-2 font-mono text-center">有效商户</th>
                    <th className="py-2.5 px-3 font-mono">最高报价</th>
                    <th className="py-2.5 px-3 font-mono">最低报价</th>
                    <th className="py-2.5 px-3 font-mono">平台目标价</th>
                    <th className="py-2.5 px-3 font-mono">外部市场参考价</th>
                    <th className="py-2.5 px-3 font-mono">最优市场差</th>
                    <th className="py-2.5 px-3">竞争力评价</th>
                    <th className="py-2.5 px-3">最优商户 (最高)</th>
                    <th className="py-2.5 px-2 text-center">状态</th>
                    <th className="py-2.5 px-3 font-mono text-right">更新时间</th>
                    <th className="py-2.5 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSKUOverviews.map(item => {
                    const s = item.sku;
                    const hasMarketRef = item.marketReferencePrice !== null;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => setActiveSKUDetail(item)}
                        className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      >
                        {/* Standard SKU formatted */}
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-[#004ac6] hover:underline text-xs">
                            {s.formattedSKU}
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 block">{s.id}</span>
                        </td>

                        {/* Card/Country/Curr */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{s.brand}</div>
                          <div className="font-mono text-[11px] text-slate-500">
                            {s.country} · {s.currency}
                          </div>
                        </td>

                        {/* Denom/Form/Speed */}
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-900">${s.denomination}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                              {s.cardForm}
                            </span>
                            <span className="px-1 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono text-[10px] font-semibold">
                              {s.speed}
                            </span>
                          </div>
                        </td>

                        {/* 有效报价商户数 */}
                        <td className="py-3 px-2 font-mono font-bold text-blue-700 text-center">
                          {item.activeMerchantCount} 家
                        </td>

                        {/* 最高报价 */}
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-sm">
                          {item.highestQuote.toFixed(2)}%
                        </td>

                        {/* 最低报价 */}
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {item.lowestQuote.toFixed(2)}%
                        </td>

                        {/* 平台目标价 */}
                        <td className="py-3 px-3 font-mono text-blue-700 font-semibold">
                          {item.platformTargetPrice.toFixed(2)}%
                        </td>

                        {/* 市场参考价 (特殊需求: 找不到时显示 "暂无市场参考"，不能判定正常) */}
                        <td className="py-3 px-3 font-mono">
                          {hasMarketRef ? (
                            <span className="font-bold text-slate-800">{item.marketReferencePrice?.toFixed(2)}%</span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/80 text-[10px] font-semibold whitespace-nowrap">
                              暂无市场参考
                            </span>
                          )}
                        </td>

                        {/* 最优市场差 */}
                        <td className="py-3 px-3 font-mono font-semibold">
                          {hasMarketRef && item.bestMarketDiff !== null ? (
                            <span className={item.bestMarketDiff >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                              {item.bestMarketDiff >= 0 ? `+${item.bestMarketDiff.toFixed(2)}pp` : `${item.bestMarketDiff.toFixed(2)}pp`}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* 竞争力 */}
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${
                            item.competitiveness === '优势' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
                            item.competitiveness === '正常' ? 'bg-blue-50 text-blue-700 border-blue-200/80' :
                            item.competitiveness === '关注' ? 'bg-amber-50 text-amber-700 border-amber-200/80' :
                            'bg-rose-50 text-rose-700 border-rose-200/80'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              item.competitiveness === '优势' ? 'bg-emerald-500' :
                              item.competitiveness === '正常' ? 'bg-blue-500' :
                              item.competitiveness === '关注' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}></span>
                            <span>{item.competitiveness}</span>
                          </span>
                        </td>

                        {/* 最优商户 */}
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {item.bestMerchant.name}
                        </td>

                        {/* 报价状态 */}
                        <td className="py-3 px-2 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            {item.status}
                          </span>
                        </td>

                        {/* 更新时间 */}
                        <td className="py-3 px-3 font-mono text-slate-400 text-right">
                          {item.updatedAt}
                        </td>

                        {/* 操作 */}
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSKUDetail(item);
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                          >
                            查看详情 →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* Tab 2: 按商户【Tab】 (从商户角度看其报价覆盖、竞争力及问题) (11.3.4) */}
      {/* ========================================================================================= */}
      {subTab === 'by_merchant' && (
        <div className="space-y-4">
          {/* 顶栏筛选 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700">商户筛选:</span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchMerchantQuery}
                  onChange={e => setSearchMerchantQuery(e.target.value)}
                  placeholder="搜索商户名称 / MID..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 w-56 font-medium"
                />
              </div>

              <select
                value={merchantStatusFilter}
                onChange={e => setMerchantStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              >
                <option value="ALL">全部商户状态</option>
                <option value="正常">正常接单</option>
                <option value="授信预警">授信预警</option>
                <option value="暂停">暂停承接</option>
              </select>
            </div>

            <span className="text-slate-400 font-mono">
              解决运营/客服联系商户前“快速诊断该商户哪些 SKU 报价有问题”
            </span>
          </div>

          {/* 商户列表主表 (11.3.4 一) */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">商户名称 & MID</th>
                    <th className="py-2.5 px-3">商户等级</th>
                    <th className="py-2.5 px-3 font-mono text-center">报价 SKU 数</th>
                    <th className="py-2.5 px-3 font-mono text-center">有效报价数</th>
                    <th className="py-2.5 px-3 font-mono text-center">优势 SKU</th>
                    <th className="py-2.5 px-3 font-mono text-center">正常 SKU</th>
                    <th className="py-2.5 px-3 font-mono text-center">关注 SKU</th>
                    <th className="py-2.5 px-3 font-mono text-center">异常 SKU (需排查)</th>
                    <th className="py-2.5 px-3 font-mono">平均市场价差</th>
                    <th className="py-2.5 px-3 font-mono">最近报价时间</th>
                    <th className="py-2.5 px-3 text-center">商户状态</th>
                    <th className="py-2.5 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMerchantOverviews.map(m => (
                    <tr
                      key={m.merchantId}
                      onClick={() => setActiveMerchantDetail(m)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                        m.abnormalSKUs > 0 ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* 商户 */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-xs">{m.merchantName}</div>
                        <span className="font-mono text-[10px] text-slate-400">{m.merchantId}</span>
                      </td>

                      {/* 等级 */}
                      <td className="py-3 px-3 font-mono">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80 font-bold text-[10px]">
                          {m.merchantTier}
                        </span>
                      </td>

                      {/* 报价SKU数 */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 text-center">
                        {m.totalSKUs} 组
                      </td>

                      {/* 有效报价数 */}
                      <td className="py-3 px-3 font-mono text-emerald-700 font-bold text-center">
                        {m.activeQuotes} 组
                      </td>

                      {/* 优势 SKU */}
                      <td className="py-3 px-3 font-mono text-center text-emerald-700 font-bold">
                        {m.advantageSKUs}
                      </td>

                      {/* 正常 SKU */}
                      <td className="py-3 px-3 font-mono text-center text-blue-700 font-medium">
                        {m.normalSKUs}
                      </td>

                      {/* 关注 SKU */}
                      <td className="py-3 px-3 font-mono text-center text-amber-700 font-semibold">
                        {m.attentionSKUs}
                      </td>

                      {/* 异常 SKU */}
                      <td className="py-3 px-3 font-mono text-center">
                        {m.abnormalSKUs > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/90 font-bold animate-pulse">
                            ⚠️ {m.abnormalSKUs} 组异常
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">0</span>
                        )}
                      </td>

                      {/* 平均市场价差 */}
                      <td className="py-3 px-3 font-mono font-semibold">
                        <span className={m.avgMarketDiff >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                          {m.avgMarketDiff >= 0 ? `+${m.avgMarketDiff.toFixed(2)}pp` : `${m.avgMarketDiff.toFixed(2)}pp`}
                        </span>
                      </td>

                      {/* 最近报价时间 */}
                      <td className="py-3 px-3 font-mono text-slate-400 text-xs">
                        {m.lastAdjustTime}
                      </td>

                      {/* 商户状态 */}
                      <td className="py-3 px-3 text-center font-medium">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          m.status === '正常' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
                          'bg-amber-50 text-amber-700 border-amber-200/80'
                        }`}>
                          {m.status}
                        </span>
                      </td>

                      {/* 操作 */}
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMerchantDetail(m);
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          排查商户报价 →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* Tab 3: 调价记录【Tab】 (统一查看商户报价历史变更全履历) (11.3.5) */}
      {/* ========================================================================================= */}
      {subTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700">调价搜索:</span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={e => setHistorySearchQuery(e.target.value)}
                  placeholder="搜索 SKU / 商户名 / Change ID..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 w-64 font-medium"
                />
              </div>

              <select
                value={historySourceFilter}
                onChange={e => setHistorySourceFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              >
                <option value="ALL">全部调整来源</option>
                <option value="商户自发">商户自发</option>
                <option value="系统策略">系统策略</option>
                <option value="运营应急干预">运营应急干预</option>
                <option value="机器人推导">机器人推导</option>
              </select>
            </div>

            <span className="text-slate-400 font-mono">
              包含完整审计轨与操作人留痕，支持查看历史报价变动趋势
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Change ID</th>
                    <th className="py-2.5 px-3">报价商户</th>
                    <th className="py-2.5 px-3">标准 SKU</th>
                    <th className="py-2.5 px-3 font-mono">原报价 (%)</th>
                    <th className="py-2.5 px-3 font-mono">新报价 (%)</th>
                    <th className="py-2.5 px-3 font-mono">变化 (pp)</th>
                    <th className="py-2.5 px-3">调整来源</th>
                    <th className="py-2.5 px-3">操作人</th>
                    <th className="py-2.5 px-3 font-mono">调整时间</th>
                    <th className="py-2.5 px-2 text-center">生效状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredChangeRecords.map(rec => (
                    <tr key={rec.changeId} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-blue-700 text-xs">
                        {rec.changeId}
                      </td>

                      <td className="py-3 px-3 font-sans font-semibold text-slate-900">
                        {rec.merchantName}
                      </td>

                      <td className="py-3 px-3 font-sans font-medium text-slate-800">
                        {rec.sku.formattedSKU}
                      </td>

                      <td className="py-3 px-3 text-slate-500">
                        {rec.oldQuote.toFixed(2)}%
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-900">
                        {rec.newQuote.toFixed(2)}%
                      </td>

                      <td className="py-3 px-3 font-bold">
                        <span className={rec.diff >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                          {rec.diff >= 0 ? `+${rec.diff.toFixed(2)}%` : `${rec.diff.toFixed(2)}%`}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {rec.adjustSource}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-sans text-slate-600 text-[11px]">
                        {rec.operator}
                      </td>

                      <td className="py-3 px-3 text-slate-400 text-xs">
                        {rec.adjustedAt}
                      </td>

                      <td className="py-3 px-2 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          {rec.effectiveStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* Drawer / Modal 1: SKU 详情 Drawer (11.3.3 三) */}
      {/* ========================================================================================= */}
      {activeSKUDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-slate-400 font-mono text-[10px]">SKU 报价全盘细查</span>
                <h3 className="font-bold text-sm text-white font-mono">{activeSKUDetail.sku.formattedSKU}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSKUDetail(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* 核心指标 Banner */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">市场参考价</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {activeSKUDetail.marketReferencePrice !== null ? `${activeSKUDetail.marketReferencePrice.toFixed(2)}%` : '暂无参考'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">平台目标价</span>
                  <span className="font-bold text-blue-700 text-xs">{activeSKUDetail.platformTargetPrice.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">最高商户价</span>
                  <span className="font-bold text-emerald-700 text-xs">{activeSKUDetail.highestQuote.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">最低商户价</span>
                  <span className="font-bold text-slate-700 text-xs">{activeSKUDetail.lowestQuote.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">有效商户数</span>
                  <span className="font-bold text-blue-700 text-xs">{activeSKUDetail.activeMerchantCount} 家</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">当前竞争力</span>
                  <span className="font-bold text-emerald-700 text-xs">{activeSKUDetail.competitiveness}</span>
                </div>
              </div>

              {/* 商户报价细盘列表 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">storefront</span>
                    <span>商户报价明细 PK 阵列</span>
                  </h4>
                  <span className="text-slate-400 font-mono text-[11px]">按价格从高到低自动排序</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-200">
                        <th className="py-2 px-2.5">排名 / 商户</th>
                        <th className="py-2 px-2.5">当前报价</th>
                        <th className="py-2 px-2.5">与最优价差</th>
                        <th className="py-2 px-2.5">与市场价差</th>
                        <th className="py-2 px-2 text-center">状态</th>
                        <th className="py-2 px-2.5 text-right">履约率</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {getMerchantQuotesForSKU(activeSKUDetail.sku.id).map(q => (
                        <tr key={q.merchantId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-2.5 font-sans">
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                                {q.rank}
                              </span>
                              <span className="font-bold text-slate-900 text-xs">{q.merchantName}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2.5 font-bold text-slate-900 text-xs">
                            {q.currentQuote.toFixed(2)}%
                          </td>
                          <td className="py-2.5 px-2.5 font-semibold text-slate-600">
                            {q.bestPriceDiff === 0 ? '最优价' : `${q.bestPriceDiff.toFixed(2)}pp`}
                          </td>
                          <td className="py-2.5 px-2.5 font-semibold text-slate-600">
                            {q.marketPriceDiff !== null ? `${q.marketPriceDiff >= 0 ? '+' : ''}${q.marketPriceDiff.toFixed(2)}pp` : '-'}
                          </td>
                          <td className="py-2.5 px-2 text-center font-sans">
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold">
                              {q.acceptanceStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-bold text-emerald-700">
                            {q.successRate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 权限说明与保护提示 */}
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">shield</span>
                  <span>报价修改权限约束提醒</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  平台作业端原则上不直接修改商户生产报价，商户实际报价由商户在收卡业务端自主维护。若发生紧急行情波动或倒挂，须发起【应急代调价授权申请】，经二次签名确认并记录审计轨。
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleOpenCalculator(activeSKUDetail.sku)}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">calculate</span>
                <span>呼出报价计算器 (自动带入本SKU)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSKUDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
              >
                关闭细盘
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* Drawer / Modal 2: 商户报价矩阵 Drawer */}
      {/* ========================================================================================= */}
      {activeMerchantDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-slate-400 font-mono text-[10px]">商户报价全盘诊断</span>
                <h3 className="font-bold text-sm text-white font-mono">{activeMerchantDetail.merchantName} ({activeMerchantDetail.merchantId})</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMerchantDetail(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* 快捷排查与统计 Banner */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 font-mono">
                  <span>总SKU: <strong className="text-slate-900">{activeMerchantDetail.totalSKUs}</strong></span>
                  <span>优势SKU: <strong className="text-emerald-700">{activeMerchantDetail.advantageSKUs}</strong></span>
                  <span>正常SKU: <strong className="text-blue-700">{activeMerchantDetail.normalSKUs}</strong></span>
                  <span>异常SKU: <strong className="text-rose-600 font-bold">{activeMerchantDetail.abnormalSKUs}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={() => setMerchantMatrixOnlyAbnormal(!merchantMatrixOnlyAbnormal)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    merchantMatrixOnlyAbnormal
                      ? 'bg-rose-50 text-rose-700 border-rose-200/90 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {merchantMatrixOnlyAbnormal ? '✓ 已开启：只看异常SKU' : '只看异常SKU (离线跟进)'}
                </button>
              </div>

              {/* 商户全量 SKU 矩阵列表 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-200">
                      <th className="py-2.5 px-3 font-sans">标准 SKU</th>
                      <th className="py-2.5 px-3">商户当前报价</th>
                      <th className="py-2.5 px-3 font-sans">竞争力评估</th>
                      <th className="py-2.5 px-3">外部市场参考</th>
                      <th className="py-2.5 px-3">与市场价差</th>
                      <th className="py-2.5 px-3 text-right">更新时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {getSKUMatrixForMerchant(activeMerchantDetail.merchantId)
                      .filter(x => (!merchantMatrixOnlyAbnormal || x.competitiveness === '异常' || x.competitiveness === '关注'))
                      .map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                            {item.sku.formattedSKU}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 text-xs">
                            {item.currentQuote.toFixed(2)}%
                          </td>
                          <td className="py-2.5 px-3 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              item.competitiveness === '优势' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
                              item.competitiveness === '正常' ? 'bg-blue-50 text-blue-700 border-blue-200/80' :
                              item.competitiveness === '关注' ? 'bg-amber-50 text-amber-700 border-amber-200/80' :
                              'bg-rose-50 text-rose-700 border-rose-200/80'
                            }`}>
                              {item.competitiveness}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {item.marketReferencePrice !== null ? `${item.marketReferencePrice.toFixed(2)}%` : '暂无参考'}
                          </td>
                          <td className="py-2.5 px-3 font-bold">
                            {item.diffToMarket !== null ? (
                              <span className={item.diffToMarket >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                                {item.diffToMarket >= 0 ? `+${item.diffToMarket.toFixed(2)}pp` : `${item.diffToMarket.toFixed(2)}pp`}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                            {item.updatedAt}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-sans">
                运营/客服可直接依据此矩阵离线联系商户干预调价
              </span>
              <button
                type="button"
                onClick={() => setActiveMerchantDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
              >
                关闭矩阵
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* Modal 3: 报价计算器 Modal (11.3.6) */}
      {/* ========================================================================================= */}
      {showCalculatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-400">calculate</span>
                <span className="font-bold text-sm">报价计算器 (辅助推算工具)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCalculatorModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-800 text-[11px] leading-relaxed">
                输入标准 SKU 维度（卡种、国家、币种、介质、速度、面值），系统将自动联算当前实时汇率、市场参考价、最高/最低商户报价及预估利润空间。
              </div>

              {/* 输入参数 */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">卡种 Brand</label>
                  <input
                    type="text"
                    value={calculatorSKU?.brand || 'Apple'}
                    readOnly
                    className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">国家 & 币种</label>
                  <input
                    type="text"
                    value={`${calculatorSKU?.country || 'US'} · ${calculatorSKU?.currency || 'USD'}`}
                    readOnly
                    className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">卡介质 & 速度</label>
                  <input
                    type="text"
                    value={`${calculatorSKU?.cardForm || 'E-Code'} · ${calculatorSKU?.speed || 'Fast'}`}
                    readOnly
                    className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">卡面值 Denomination</label>
                  <input
                    type="text"
                    value={`$${calculatorSKU?.denomination || 100}`}
                    readOnly
                    className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* 自动联算结果 */}
              <div className="space-y-2 bg-slate-900 text-white p-4 rounded-xl font-mono">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">实时参考汇率:</span>
                  <span className="font-bold text-blue-400 text-sm">7.1820 RMB/USD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">外部市场参考价:</span>
                  <span className="font-bold text-slate-200">84.80%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">平台当前目标价:</span>
                  <span className="font-bold text-blue-400">82.50%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">当前最高商户报价:</span>
                  <span className="font-bold text-emerald-400">85.30% (招财进宝科技)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">当前最低商户报价:</span>
                  <span className="font-bold text-slate-300">83.10% (极速易换卡行)</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-bold">预计平台单卡利润空间:</span>
                  <span className="font-bold text-emerald-400 text-sm">+2.80% (约 ¥20.10 RMB)</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">测算数据为实时算力演算</span>
              <button
                type="button"
                onClick={() => setShowCalculatorModal(false)}
                className="px-4 py-1.5 bg-[#004ac6] text-white hover:bg-blue-700 font-bold rounded-lg transition-colors cursor-pointer"
              >
                已知悉测算结果
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* Modal 4: 平台代调价风控权限说明 Modal (11.3.7) */}
      {/* ========================================================================================= */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-amber-400">gavel</span>
                <span className="font-bold text-sm">报价代调价风控权限</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs leading-relaxed text-slate-700">
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 space-y-1">
                <strong className="block text-xs font-bold">核心权限原则:</strong>
                <p className="text-[11px] text-amber-800">
                  平台作业端原则上不直接修改商户生产报价，商户实际报价必须在收卡业务端自主维护。
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <strong className="text-slate-900 block">应急代调价强约束规程:</strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                  <li>必须具备【高级运营代调价专专项权限】。</li>
                  <li>必须由商户线上提交《应急代调价授权确认函》。</li>
                  <li>每次改价操作全程存入加密审计轨，全网可追溯留痕。</li>
                </ol>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-white hover:bg-slate-900 font-bold rounded-lg transition-colors cursor-pointer"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
