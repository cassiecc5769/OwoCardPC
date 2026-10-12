import React, { useState, useMemo } from 'react';
import { PriceAdjustRecord } from './quoteTypes';
import { INITIAL_ADJUST_RECORDS } from './mockQuoteData';

interface PriceAdjustLogsTabProps {
  showToast: (msg: string) => void;
  onNavigateToQuotes?: () => void;
}

export const PriceAdjustLogsTab: React.FC<PriceAdjustLogsTabProps> = ({ showToast }) => {
  const [records, setRecords] = useState<PriceAdjustRecord[]>(INITIAL_ADJUST_RECORDS);

  // 筛选器
  const [filterMerchant, setFilterMerchant] = useState('ALL');
  const [filterOnlyReminded, setFilterOnlyReminded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 筛选后的记录
  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      if (filterMerchant !== 'ALL' && item.merchantName !== filterMerchant) return false;
      if (filterOnlyReminded && !item.isManualReminded) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.recordNo.toLowerCase().includes(q) ||
          item.merchantName.toLowerCase().includes(q) ||
          item.sku.formattedSKU.toLowerCase().includes(q) ||
          item.associatedAnomalyId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [records, filterMerchant, filterOnlyReminded, searchQuery]);

  // 核心指标提炼：判断「哪些商户长期需要人工催价」画像统计
  const merchantSluggishStats = useMemo(() => {
    const map = new Map<
      string,
      {
        merchantId: string;
        merchantName: string;
        merchantTier: string;
        totalAdjustCount: number;
        manualRemindCount: number;
        totalResponseMinutes: number;
        highCompetitivenessCount: number;
      }
    >();

    records.forEach(r => {
      const cur = map.get(r.merchantId) || {
        merchantId: r.merchantId,
        merchantName: r.merchantName,
        merchantTier: r.merchantTier,
        totalAdjustCount: 0,
        manualRemindCount: 0,
        totalResponseMinutes: 0,
        highCompetitivenessCount: 0
      };

      cur.totalAdjustCount += 1;
      if (r.isManualReminded) {
        cur.manualRemindCount += r.reminderCount;
      }
      cur.totalResponseMinutes += r.responseTimeMinutes;
      if (r.postAdjustmentCompetitiveness === '强竞争力' || r.postAdjustmentCompetitiveness === '达标基准') {
        cur.highCompetitivenessCount += 1;
      }

      map.set(r.merchantId, cur);
    });

    // 转换为数组并按被催次数降序排
    return Array.from(map.values())
      .map(item => ({
        ...item,
        avgResponseMinutes: Math.round(item.totalResponseMinutes / (item.totalAdjustCount || 1)),
        isChronicSluggish: item.manualRemindCount >= 3 // 长期需要人工催价高危标记
      }))
      .sort((a, b) => b.manualRemindCount - a.manualRemindCount);
  }, [records]);

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 顶部标题与价值定位说明卡 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">history</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">调价记录（用于判断：哪些商户长期需要人工催价）</h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                8 大规定留存字段
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-[10px] font-bold">
                商户履约惰性画像
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              完整保存：<span className="font-mono font-bold text-slate-800">商户 ｜ SKU ｜ 原报价 ｜ 新报价 ｜ 调整时间 ｜ 关联异常 ｜ 调整后竞争力 ｜ 恢复时间</span>。
              沉淀调价响应耗时与人工催促频次，辅助运营对长期消极怠调商户实施质押金扣减与限流约束。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => showToast('已成功导出全量调价审计流水与商户催价黑名单 (CSV)')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            <span>导出调价记录</span>
          </button>
        </div>
      </div>

      {/* 核心价值专项：用于判断「哪些商户长期需要人工催价」画像分析大盘 */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 shadow-sm border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-400 text-[18px]">psychology_alt</span>
            <span className="font-bold text-sm text-white">商户调价主动性与催促频次分析榜（核心诊断看板）</span>
          </div>
          <span className="text-[11px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
            高危阈值：被催次数 &ge; 3 次 且 平均响应耗时 &gt; 30 分钟
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {merchantSluggishStats.map(stat => (
            <div
              key={stat.merchantId}
              className={`p-3 rounded-xl border transition-all ${
                stat.isChronicSluggish
                  ? 'bg-rose-500/10 border-rose-500/30 ring-1 ring-rose-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-white text-xs block">{stat.merchantName}</strong>
                  <span className="font-mono text-slate-400 text-[10px]">{stat.merchantTier}</span>
                </div>
                {stat.isChronicSluggish ? (
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-600 text-white animate-pulse">
                    ⚠️ 长期需催价
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    自主跟价良好
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-white/10 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">人工催促次数</span>
                  <span className={`font-bold text-sm block ${stat.manualRemindCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {stat.manualRemindCount} 次
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">平均响应时长</span>
                  <span className={`font-bold text-sm block ${stat.avgResponseMinutes > 30 ? 'text-amber-300' : 'text-slate-200'}`}>
                    {stat.avgResponseMinutes} 分钟
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 筛选与操作栏 */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <div className="relative w-56">
            <input
              type="text"
              placeholder="搜索流水号 / 商户 / SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-mono"
            />
            <span className="material-symbols-outlined absolute left-2 top-2 text-[15px] text-slate-400">search</span>
          </div>

          <select
            value={filterMerchant}
            onChange={e => setFilterMerchant(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="ALL">全部商户</option>
            <option value="鼎盛数字科技">鼎盛数字科技</option>
            <option value="极速易换点卡">极速易换点卡</option>
            <option value="招财进宝数卡">招财进宝数卡</option>
            <option value="万丰国际卡行">万丰国际卡行</option>
            <option value="环球数卡直通">环球数卡直通</option>
          </select>

          <button
            onClick={() => setFilterOnlyReminded(!filterOnlyReminded)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              filterOnlyReminded
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">campaign</span>
            <span>仅看人工催价记录 ({records.filter(r => r.isManualReminded).length})</span>
          </button>
        </div>

        <span className="text-slate-500 font-mono text-[11px] shrink-0">
          检出 {filteredRecords.length} 条调价历史流水
        </span>
      </div>

      {/* 调价记录明细表格：严格包含 8 大规定保存字段 */}
      {/* 商户 ｜ SKU ｜ 原报价 ｜ 新报价 ｜ 调整时间 ｜ 关联异常 ｜ 调整后竞争力 ｜ 恢复时间 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 h-9 font-sans">
                <th className="py-2.5 px-3">流水号</th>
                <th className="py-2.5 px-3">1. 调整商户</th>
                <th className="py-2.5 px-3">2. 标准 SKU</th>
                <th className="py-2.5 px-2 font-mono">3. 原报价</th>
                <th className="py-2.5 px-2 font-mono">4. 新报价</th>
                <th className="py-2.5 px-2 font-mono">调价幅度</th>
                <th className="py-2.5 px-3 font-mono">5. 调整时间</th>
                <th className="py-2.5 px-3">6. 关联异常单号</th>
                <th className="py-2.5 px-2 text-center">7. 调整后竞争力</th>
                <th className="py-2.5 px-3 font-mono text-right">8. 恢复时间 (闭环耗时)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredRecords.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  {/* 流水号 */}
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{item.recordNo}</td>

                  {/* 1. 商户 */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{item.merchantName}</span>
                      <span className="font-mono text-[10px] text-slate-400">({item.merchantTier})</span>
                      {item.isManualReminded && (
                        <span className="px-1.5 py-0.2 rounded font-bold text-[9px] bg-rose-100 text-rose-700 border border-rose-200">
                          催促 {item.reminderCount}次
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 2. SKU */}
                  <td className="py-2.5 px-3 font-mono">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-semibold">
                      {item.sku.formattedSKU}
                    </span>
                  </td>

                  {/* 3. 原报价 */}
                  <td className="py-2.5 px-2 font-mono text-slate-400 line-through">
                    {item.oldQuote.toFixed(2)}%
                  </td>

                  {/* 4. 新报价 */}
                  <td className="py-2.5 px-2 font-mono font-extrabold text-slate-900">
                    {item.newQuote.toFixed(2)}%
                  </td>

                  {/* 调价幅度 */}
                  <td className="py-2.5 px-2 font-mono font-bold text-emerald-600">
                    +{item.diffPp.toFixed(2)} pp
                  </td>

                  {/* 5. 调整时间 */}
                  <td className="py-2.5 px-3 font-mono text-slate-600">{item.adjustedAt}</td>

                  {/* 6. 关联异常 */}
                  <td className="py-2.5 px-3 font-mono">
                    {item.associatedAnomalyId.startsWith('ANO-') ? (
                      <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        {item.associatedAnomalyId}
                      </span>
                    ) : (
                      <span className="text-slate-400">{item.associatedAnomalyId}</span>
                    )}
                  </td>

                  {/* 7. 调整后竞争力 */}
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                        item.postAdjustmentCompetitiveness === '强竞争力'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : item.postAdjustmentCompetitiveness === '达标基准'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {item.postAdjustmentCompetitiveness}
                    </span>
                  </td>

                  {/* 8. 恢复时间 */}
                  <td className="py-2.5 px-3 font-mono text-right text-slate-700">
                    <span className="font-semibold block">{item.recoveredAt}</span>
                    <span className="text-[10px] text-slate-400 block">耗时 {item.responseTimeMinutes}m</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
