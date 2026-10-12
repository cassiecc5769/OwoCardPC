import React, { useState, useMemo } from 'react';
import { StandardSKU, MarketRawSourceItem } from './quoteTypes';
import {
  STANDARD_SKUS,
  INITIAL_RAW_SOURCES,
  INITIAL_MARKET_TRENDS,
  MOCK_MARKET_FEEDS,
  MarketSourceFeed
} from './mockQuoteData';

interface MarketTrendsTabProps {
  showToast: (msg: string) => void;
  onNavigateToQuotes?: () => void;
  initialSubTab?: string;
}

export const MarketTrendsTab: React.FC<MarketTrendsTabProps> = ({
  showToast,
  onNavigateToQuotes
}) => {
  // 11.4 核心 3 大功能 Tab + 1 个异常隔离规则 Tab
  const [activeSubTab, setActiveSubTab] = useState<'latest' | 'trend' | 'sources' | 'anomalies_rules'>('latest');

  // 1. 最新行情 筛选条件
  const [filterBrand, setFilterBrand] = useState<string>('ALL');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [filterMatchStatus, setFilterMatchStatus] = useState<string>('ALL');
  const [searchRawQuery, setSearchRawQuery] = useState<string>('');

  // 原始抓取盘口数据集
  const [rawSources, setRawSources] = useState<MarketRawSourceItem[]>(INITIAL_RAW_SOURCES);

  // 2. 行情趋势 筛选与定位
  const [selectedSkuId, setSelectedSkuId] = useState<string>(STANDARD_SKUS[0].id);
  const [timeScope, setTimeScope] = useState<'24h' | '7d' | '30d'>('7d');

  // 3. 数据来源 列表
  const [sourceFeeds, setSourceFeeds] = useState<MarketSourceFeed[]>(MOCK_MARKET_FEEDS);

  // SKU 纠错手动映射 Modal
  const [mappingItem, setMappingItem] = useState<MarketRawSourceItem | null>(null);
  const [targetSkuId, setTargetSkuId] = useState<string>(STANDARD_SKUS[0].id);

  // 多源聚合盘口 Drawer
  const [activeMultiSourceSKU, setActiveMultiSourceSKU] = useState<StandardSKU | null>(null);

  // 最新行情 筛选列表
  const filteredRawSources = useMemo(() => {
    return rawSources.filter(item => {
      if (filterMatchStatus === 'MATCHED' && !item.isMapped) return false;
      if (filterMatchStatus === 'UNMATCHED' && item.isMapped) return false;

      if (searchRawQuery.trim()) {
        const q = searchRawQuery.trim().toLowerCase();
        const matchRaw = item.rawProduct.toLowerCase().includes(q);
        const matchSku = item.standardSkuCode.toLowerCase().includes(q);
        const matchSource = item.source.toLowerCase().includes(q);
        if (!matchRaw && !matchSku && !matchSource) return false;
      }
      return true;
    });
  }, [rawSources, filterMatchStatus, searchRawQuery]);

  // 当前选中 SKU 的趋势数据
  const currentSKUObj = useMemo(() => {
    return STANDARD_SKUS.find(s => s.id === selectedSkuId) || STANDARD_SKUS[0];
  }, [selectedSkuId]);

  const currentTrendData = useMemo(() => {
    return INITIAL_MARKET_TRENDS[selectedSkuId] || INITIAL_MARKET_TRENDS['SKU-APPL-US-USD-ECODE-100'];
  }, [selectedSkuId]);

  // 保存 SKU 手动纠错映射
  const handleSaveMapping = () => {
    if (!mappingItem) return;
    const targetSku = STANDARD_SKUS.find(s => s.id === targetSkuId);
    if (!targetSku) return;

    setRawSources(prev =>
      prev.map(r =>
        r.id === mappingItem.id
          ? {
              ...r,
              standardSkuCode: targetSku.formattedSKU,
              isMapped: true,
              confidenceScore: 100,
              status: '正常'
            }
          : r
      )
    );
    setMappingItem(null);
    showToast(`已将原始商品【${mappingItem.rawProduct}】成功纠错映射至标准 SKU【${targetSku.formattedSKU}】！`);
  };

  // 触发行情源握手探针
  const handleProbeFeed = (feed: MarketSourceFeed) => {
    showToast(`正在对【${feed.sourceName}】发起 WebSocket/RESTful 健康度握手...`);
    setTimeout(() => {
      setSourceFeeds(prev =>
        prev.map(f =>
          f.id === feed.id
            ? {
                ...f,
                status: '持续抓取',
                lastSuccessTime: new Date().toTimeString().split(' ')[0],
                latencyMs: Math.floor(Math.random() * 30) + 30
              }
            : f
        )
      );
      showToast(`✅ 【${feed.sourceName}】握手探针成功！网络延迟 ${feed.latencyMs}ms，采集服务正常。`);
    }, 800);
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 11.4.1 页面定位说明卡 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">trending_up</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">市场行情工作台</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-mono text-[10px] font-semibold">
                外部行情 ≠ 平台报价
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              统一管理第三方市场报价，为平台判断报价竞争力提供公允外部参照。它回答：<strong>“外面的市场现在多少钱？”</strong>
            </p>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-600 font-mono flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <strong>SKU 标准化：</strong> Brand × Country × Currency × Card Form × Denomination × Speed ➔ 标准 SKU
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <strong>隔离保护：</strong> 行情抓取失败绝不误判平台报价异常
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => showToast('已发起全网 5 大行情数据源即时轮询抓取！')}
            className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>触发全网行情抓取</span>
          </button>
        </div>
      </div>

      {/* 3 大 PRD Tab 导航条 (11.4.2 / 11.4.3 / 11.4.4 / 11.4.5) */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-2 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg">
          {[
            { id: 'latest', label: '最新行情', icon: 'flash_on' },
            { id: 'trend', label: '行情趋势', icon: 'show_chart' },
            { id: 'sources', label: '数据来源', icon: 'hub', badge: sourceFeeds.length },
            { id: 'anomalies_rules', label: '异常与容错隔离', icon: 'shield' }
          ].map(tab => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeSubTab === 'latest' && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterMatchStatus}
              onChange={e => setFilterMatchStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">全部匹配状态</option>
              <option value="MATCHED">仅看 已匹配 SKU</option>
              <option value="UNMATCHED">仅看 待匹配/待纠错</option>
            </select>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[15px]">
                search
              </span>
              <input
                type="text"
                placeholder="搜索原始商品、来源或 SKU..."
                value={searchRawQuery}
                onChange={e => setSearchRawQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 w-52"
              />
            </div>
          </div>
        )}
      </section>

      {/* 11.4.2 最新行情 【Tab】 */}
      {activeSubTab === 'latest' && (
        <div className="space-y-4">
          {/* 标准 SKU 匹配与多源加权架构说明 */}
          <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400 text-[20px]">hub</span>
              <div>
                <strong className="text-white block">抓取清洗与多源标准化匹配:</strong>
                <span className="text-slate-300 text-[10px]">
                  第三方平台原始文本 ➔ 提取 6 维属性 ➔ 标准 SKU 映射 ➔ 3-Sigma 离群过滤 ➔ 多源加权生成【平台统一市场参考价】
                </span>
              </div>
            </div>
            <span className="text-emerald-400 font-bold shrink-0">
              加权算法置信度: 98.5%
            </span>
          </div>

          {/* 最新行情列表 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-slate-900 text-xs">最新抓取市场行情明细</h3>
              <span className="text-slate-400 font-mono text-[11px]">
                采样条数: {filteredRawSources.length} 条
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold font-mono whitespace-nowrap">
                    <th className="py-2.5 px-3">流水号</th>
                    <th className="py-2.5 px-3">市场来源</th>
                    <th className="py-2.5 px-3">第三方原始商品文本</th>
                    <th className="py-2.5 px-3 text-right">市场报价</th>
                    <th className="py-2.5 px-3 text-center">币种</th>
                    <th className="py-2.5 px-3">映射标准 SKU</th>
                    <th className="py-2.5 px-3 text-center">匹配状态</th>
                    <th className="py-2.5 px-3 text-right">置信度</th>
                    <th className="py-2.5 px-3 text-center">数据状态</th>
                    <th className="py-2.5 px-3">抓取时间</th>
                    <th className="py-2.5 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredRawSources.map(item => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{item.id}</td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{item.source}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-700 max-w-xs truncate" title={item.rawProduct}>
                        {item.rawProduct}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-blue-700">
                        {item.rawQuote.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                        {item.currency || 'USD'}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {item.isMapped ? (
                          <span className="font-semibold text-slate-800">{item.standardSkuCode}</span>
                        ) : (
                          <span className="text-rose-600 font-bold italic">待纠错映射...</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        {item.isMapped ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            已匹配
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-200/80 font-bold">
                            待匹配
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                        {item.confidenceScore}%
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.status === '有效' || item.status === '正常'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : item.status === '即将失效'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                              : item.status === '异常剔除'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                              : 'bg-slate-100 text-slate-600 border border-slate-200/80'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">{item.collectedAt}</td>
                      <td className="py-2.5 px-3 text-right font-sans whitespace-nowrap">
                        {!item.isMapped ? (
                          <button
                            onClick={() => {
                              setMappingItem(item);
                              setTargetSkuId(STANDARD_SKUS[0].id);
                            }}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold shadow-2xs cursor-pointer"
                          >
                            手动纠错映射
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const matchingSku = STANDARD_SKUS.find(s => item.standardSkuCode.includes(s.brand));
                              setActiveMultiSourceSKU(matchingSku || STANDARD_SKUS[0]);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium cursor-pointer"
                          >
                            查看多源盘口
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 11.4.3 行情趋势 【Tab】 */}
      {activeSubTab === 'trend' && (
        <div className="space-y-4">
          {/* SKU 选择器与范围控制 */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700 text-xs">选择监控 SKU:</span>
              <select
                value={selectedSkuId}
                onChange={e => setSelectedSkuId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-700 outline-none focus:border-blue-500 cursor-pointer"
              >
                {STANDARD_SKUS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.formattedSKU}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {(['24h', '7d', '30d'] as const).map(scope => (
                <button
                  key={scope}
                  onClick={() => setTimeScope(scope)}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
                    timeScope === scope ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {scope === '24h' ? '日 (24小时)' : scope === '7d' ? '周 (7日)' : '月 (30日)'}
                </button>
              ))}
            </div>
          </div>

          {/* 趋势图表区 */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-indigo-600 text-[18px]">show_chart</span>
                  <span>走势研判: 【{currentSKUObj.formattedSKU}】</span>
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5 font-mono">
                  判断依据：回答 “是商户突然降价了，还是整个市场涨/跌价了”
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono font-semibold">
                <span className="flex items-center gap-1 text-blue-600">
                  <span className="w-3 h-0.5 bg-blue-600 inline-block"></span> 外部市场参考价
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-3 h-0.5 bg-emerald-600 inline-block"></span> 平台最高商户报价
                </span>
              </div>
            </div>

            {/* SVG 折线图 */}
            <div className="w-full h-60 bg-slate-50 rounded-xl p-4 border border-slate-200 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                <line x1="0" y1="40" x2="500" y2="40" stroke="#e2e8f0" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#e2e8f0" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#e2e8f0" strokeDasharray="4 4" />

                {/* 绿线：平台最高商户报价 */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  points="50,110 150,95 250,85 350,70 450,55"
                />

                {/* 蓝线：外部市场参考价 */}
                <polyline
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  points="50,100 150,85 250,75 350,60 450,45"
                />

                {[
                  { x: 50, y: 100 },
                  { x: 150, y: 85 },
                  { x: 250, y: 75 },
                  { x: 350, y: 60 },
                  { x: 450, y: 45 }
                ].map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                ))}
              </svg>

              <div className="absolute bottom-1 left-0 right-0 flex justify-around text-[10px] text-slate-400 font-mono px-6">
                <span>08:00</span>
                <span>10:00</span>
                <span>12:00</span>
                <span>14:00</span>
                <span>最新 (14:38)</span>
              </div>
            </div>
          </div>

          {/* 历史采样清单表 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs">历史采样时面数据明细表</h4>
              <span className="text-slate-400 font-mono text-[11px]">全网盘口同步</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold font-mono">
                    <th className="py-2.5 px-3">时间截面</th>
                    <th className="py-2.5 px-3 text-right">外部市场参考价</th>
                    <th className="py-2.5 px-3 text-right">平台最高商户报价</th>
                    <th className="py-2.5 px-3 text-right">价差 (Gap)</th>
                    <th className="py-2.5 px-3 text-center">市场高/低盘口</th>
                    <th className="py-2.5 px-3">行情归因判断</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {currentTrendData.historyTimeline.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/20">
                      <td className="py-2.5 px-3 text-slate-600">{item.timeStr}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-700">{item.referencePrice.toFixed(2)}%</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{item.platformStandard.toFixed(2)}%</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                        {(item.platformStandard - item.referencePrice).toFixed(2)}pp
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500">
                        {item.marketHigh.toFixed(2)}% / {item.marketLow.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-700">
                        {idx === 4 ? '外盘微涨 +0.3pp，商户同步跟进' : '大盘行情平稳'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 数据来源 【Tab】 */}
      {activeSubTab === 'sources' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">hub</span>
                  <span>第三方行情数据源抓取状态监控</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  监控外部 API 连通性、抓取频率、卡种/国家覆盖率与延迟，无缝防范数据源失效。
                </p>
              </div>
              <button
                onClick={() => showToast('已对全网 5 大行情源并发发起健康握手...')}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">sensors</span>
                <span>全局探针握手</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold font-mono whitespace-nowrap">
                    <th className="py-2.5 px-3">行情源名称</th>
                    <th className="py-2.5 px-3 text-center">抓取状态</th>
                    <th className="py-2.5 px-3">覆盖卡种</th>
                    <th className="py-2.5 px-3">覆盖国家</th>
                    <th className="py-2.5 px-3 text-center">抓取频率</th>
                    <th className="py-2.5 px-3">最近成功时间</th>
                    <th className="py-2.5 px-3">最近失败时间</th>
                    <th className="py-2.5 px-3 text-right">成功率</th>
                    <th className="py-2.5 px-3 text-right">数据延迟</th>
                    <th className="py-2.5 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {sourceFeeds.map(feed => (
                    <tr key={feed.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-sans font-bold text-slate-900">{feed.sourceName}</td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            feed.status === '持续抓取' || feed.status === '正常'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : feed.status === '重试中'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/80 animate-pulse'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          }`}
                        >
                          {feed.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-700">
                        {feed.coveredBrands.join('、')}
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-700">
                        {feed.coveredCountries.join('、')}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">{feed.fetchFrequency}</td>
                      <td className="py-3 px-3 text-emerald-700 font-semibold">{feed.lastSuccessTime}</td>
                      <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-xs" title={feed.lastFailureTime}>
                        {feed.lastFailureTime}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">{feed.successRate}%</td>
                      <td className="py-3 px-3 text-right font-bold text-blue-700">{feed.latencyMs}ms</td>
                      <td className="py-3 px-3 text-right font-sans whitespace-nowrap">
                        <button
                          onClick={() => handleProbeFeed(feed)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer"
                        >
                          握手探测
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

      {/* 市场行情异常与容错隔离规则 【Tab】 */}
      {activeSubTab === 'anomalies_rules' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-400 text-[20px]">shield</span>
                <span>市场行情异常处理与平台隔离机制</span>
              </h3>
              <span className="text-[11px] text-amber-300 font-mono font-bold">
                ⚠️ 核心禁令：绝不因行情抓取失败误判平台报价异常
              </span>
            </div>

            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2.5 px-3">异常类型</th>
                    <th className="py-2.5 px-3">系统自动化处理动作</th>
                    <th className="py-2.5 px-3">对平台报价判定的隔离保护</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-rose-300">抓取失败</td>
                    <td className="py-2.5 px-3 text-slate-200">自动启动退避 Retry (3 次)，记录日志</td>
                    <td className="py-2.5 px-3 text-emerald-300">保持上一有效行情镜像，不触发调价报警</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-rose-400">连续失败</td>
                    <td className="py-2.5 px-3 text-slate-200">标记数据源异常，自动切换备用数据源</td>
                    <td className="py-2.5 px-3 text-emerald-300">隔离该数据源，降级使用其他有效源算力</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-amber-300">SKU 无法匹配</td>
                    <td className="py-2.5 px-3 text-slate-200">进入【待匹配】归档，等待人工映射或正则修正</td>
                    <td className="py-2.5 px-3 text-slate-400">不加入该 SKU 的全网加权比价</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-amber-300">数据明显异常 (插针)</td>
                    <td className="py-2.5 px-3 text-slate-200">标记待确认，采用 3-Sigma / IQR 离群点自动剔除</td>
                    <td className="py-2.5 px-3 text-emerald-300">防止极控恶性行情拉偏市场参考价</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-400">数据过期 (&gt;300s)</td>
                    <td className="py-2.5 px-3 text-slate-200">标记为过期，暂停参与实时计算</td>
                    <td className="py-2.5 px-3 text-slate-400">使用存量有效行情源计算</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-amber-400">单个来源失效</td>
                    <td className="py-2.5 px-3 text-slate-200">动态重重权，自动使用其他有效来源加权</td>
                    <td className="py-2.5 px-3 text-emerald-300">计算不中断，保证平台比价平滑</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-rose-500">所有来源失效</td>
                    <td className="py-2.5 px-3 text-slate-200">SKU 市场参考价统一显示为“暂无有效市场行情”</td>
                    <td className="py-2.5 px-3 text-rose-300 font-bold">锁定比价引擎，绝对禁止判定平台报价异常！</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 手动纠错映射 Modal */}
      {mappingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-rose-600 text-[18px]">build</span>
                <span>第三方商品手动纠错映射</span>
              </h3>
              <button onClick={() => setMappingItem(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
                <span className="text-slate-400 text-[10px] block">原始抓取商品文本:</span>
                <span className="font-bold text-slate-900 block mt-0.5">{mappingItem.rawProduct}</span>
                <span className="text-slate-500 text-[10px] block mt-1">来源: {mappingItem.source} · 报价: {mappingItem.rawQuote}%</span>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">选择映射的目标标准 SKU</label>
                <select
                  value={targetSkuId}
                  onChange={e => setTargetSkuId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-mono cursor-pointer"
                >
                  {STANDARD_SKUS.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.formattedSKU}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setMappingItem(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveMapping}
                className="px-4 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer transition-colors"
              >
                确认建立标准化映射
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 查看多源盘口 Modal */}
      {activeMultiSourceSKU && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">hub</span>
                <span>多源实时盘口加权列表: {activeMultiSourceSKU.formattedSKU}</span>
              </h3>
              <button onClick={() => setActiveMultiSourceSKU(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200/80 flex items-center justify-between">
                <span>算力推导市场参考价:</span>
                <strong className="text-blue-700 font-bold text-sm">84.80% (USD)</strong>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-2 px-3">行情来源</th>
                      <th className="py-2 px-3 text-right">盘口报价</th>
                      <th className="py-2 px-3 text-right">采信置信度</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 px-3 font-sans font-bold text-slate-800">Paxful Official API</td>
                      <td className="py-2 px-3 text-right font-bold text-blue-700">84.80%</td>
                      <td className="py-2 px-3 text-right text-emerald-700">98%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans font-bold text-slate-800">Noones B2B Gateway</td>
                      <td className="py-2 px-3 text-right font-bold text-blue-700">84.50%</td>
                      <td className="py-2 px-3 text-right text-emerald-700">96%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans font-bold text-slate-800">Cardtonic OTC Stream</td>
                      <td className="py-2 px-3 text-right font-bold text-blue-700">84.60%</td>
                      <td className="py-2 px-3 text-right text-emerald-700">94%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveMultiSourceSKU(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
