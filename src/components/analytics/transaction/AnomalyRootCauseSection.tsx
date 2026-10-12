import React, { useState, useMemo } from 'react';
import { AnomalyItem } from './types';

interface AnomalyRootCauseSectionProps {
  anomalies: AnomalyItem[];
  onDrilldownCard: (anomaly: AnomalyItem) => void;
  onDisposal: (anomaly: AnomalyItem) => void;
}

export const AnomalyRootCauseSection: React.FC<AnomalyRootCauseSectionProps> = ({
  anomalies,
  onDrilldownCard,
  onDisposal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState<string>('全部');
  const [selectedStatus, setSelectedStatus] = useState<string>('全部');

  const filteredList = useMemo(() => {
    return anomalies.filter((item) => {
      const matchSearch =
        item.causeCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.typicalTxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.affectedBrands.some((b) => b.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchParty = selectedParty === '全部' || item.responsibleParty === selectedParty;
      const matchStatus = selectedStatus === '全部' || item.status === selectedStatus;

      return matchSearch && matchParty && matchStatus;
    });
  }, [anomalies, searchTerm, selectedParty, selectedStatus]);

  const totalOccurrences = anomalies.reduce((sum, a) => sum + a.occurrences, 0);
  const totalAmount = anomalies.reduce((sum, a) => sum + a.amountUsd, 0);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 transition-all">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <span className="material-symbols-outlined text-[18px]">report_problem</span>
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              交易异常多维根因归集与故障穿透
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100 font-code-token">
              异常总计: {totalOccurrences} 笔 (占全部申报 5.1%)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-8">
            覆盖卡密失效、面额不符、锁区阻断与商户超时全流程故障溯源与闭环决议
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 self-start sm:self-auto">
          <span>涉及涉诉与折损金额:</span>
          <span className="font-numeric-stat font-bold text-rose-600 text-sm">
            ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Anomaly Distribution Spectrum Stacked Bar */}
      <div className="my-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <span>异常诱因分布谱 (Root Cause Spectrum)</span>
          <span className="text-[11px] text-slate-400">100% 故障样本归因</span>
        </div>

        {/* Stacked colored bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200">
          <div style={{ width: '44%' }} className="bg-rose-500 h-full" title="卡已被他人兑换 (44%)" />
          <div style={{ width: '26%' }} className="bg-amber-500 h-full" title="面额少充不符 (26%)" />
          <div style={{ width: '14%' }} className="bg-blue-500 h-full" title="跨区/锁区阻断 (14%)" />
          <div style={{ width: '10%' }} className="bg-indigo-500 h-full" title="商户超时流单 (10%)" />
          <div style={{ width: '6%' }} className="bg-slate-500 h-full" title="黑名单拦截 (6%)" />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
            <span>卡已被他人兑换 (44% · 300笔)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
            <span>面额少充不符 (26% · 176笔)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" />
            <span>跨区/锁区阻断 (14% · 95笔)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500 inline-block" />
            <span>商户超时流单 (10% · 68笔)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-500 inline-block" />
            <span>黑名单拦截 (6% · 41笔)</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[17px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索异常根因、卡单号或卡种..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <span className="text-slate-400 mr-1.5 text-[11px]">责任方:</span>
            <select
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="全部">全部责任方</option>
              <option value="用户申报侧">用户申报侧</option>
              <option value="商户承兑侧">商户承兑侧</option>
              <option value="平台规则与网关侧">平台规则与网关侧</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <span className="text-slate-400 mr-1.5 text-[11px]">处置状态:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="全部">全部状态</option>
              <option value="已闭环追偿">已闭环追偿</option>
              <option value="待商户补证">待商户补证</option>
              <option value="平台先行垫付">平台先行垫付</option>
              <option value="锁定冻结中">锁定冻结中</option>
              <option value="已退还用户">已退还用户</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="h-9 bg-slate-50 text-slate-500 font-label-caps text-[11px] uppercase tracking-wider border-b border-slate-200">
              <th className="px-3.5 font-semibold">异常根因分类</th>
              <th className="px-3 font-semibold text-right">发生频次</th>
              <th className="px-3 font-semibold text-right">涉及金额 (USD)</th>
              <th className="px-3 font-semibold">主要责任方</th>
              <th className="px-3 font-semibold">受影响卡种</th>
              <th className="px-3 font-semibold text-center">处置状态</th>
              <th className="px-3 font-semibold">关联典型卡单</th>
              <th className="px-3.5 font-semibold text-center">操作与处置</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400">
                  无符合条件的异常记录
                </td>
              </tr>
            ) : (
              filteredList.map((item) => (
                <tr key={item.id} className="h-13 hover:bg-slate-50/80 transition-colors">
                  <td className="px-3.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-rose-50 text-rose-600">
                        <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                      </span>
                      <div>
                        <span className="font-semibold text-slate-900 block leading-tight">
                          {item.causeCategory}
                        </span>
                        <span className="text-[10.5px] text-slate-400 leading-none">
                          {item.summary}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 text-right">
                    <span className="font-numeric-stat font-bold text-slate-800">
                      {item.occurrences} 笔
                    </span>
                    <span className="text-[10.5px] text-slate-400 block">
                      {item.ratioPercent}% 占比
                    </span>
                  </td>

                  <td className="px-3 text-right font-numeric-stat font-bold text-rose-600">
                    ${item.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="px-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10.5px] font-medium ${
                        item.responsibleParty === '用户申报侧'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : item.responsibleParty === '商户承兑侧'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}
                    >
                      {item.responsibleParty}
                    </span>
                  </td>

                  <td className="px-3">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {item.affectedBrands.map((b, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${item.statusColor}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-3">
                    <button
                      onClick={() => onDrilldownCard(item)}
                      className="text-blue-600 hover:text-blue-800 font-code-token font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      title="点击穿透卡单全链路详情"
                    >
                      <span>{item.typicalTxId}</span>
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    </button>
                  </td>

                  <td className="px-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onDrilldownCard(item)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-[13px]">search_check</span>
                        <span>下钻</span>
                      </button>

                      <button
                        onClick={() => onDisposal(item)}
                        className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-[13px]">gavel</span>
                        <span>处置</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
