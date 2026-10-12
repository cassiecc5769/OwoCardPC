import React, { useState, useMemo } from 'react';
import { OrderAttributionItem } from './types';

interface PromotionPerformanceTabProps {
  orders: OrderAttributionItem[];
  onShowToast: (msg: string) => void;
}

export const PromotionPerformanceTab: React.FC<PromotionPerformanceTabProps> = ({
  orders,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'VERIFIED' | 'PENDING' | 'DISCREPANCY'>('all');
  const [cardFilter, setCardFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch =
        searchTerm === '' ||
        o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.userUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.promoterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.inviteCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || o.verificationStatus === statusFilter;
      const matchesCard = cardFilter === 'all' || o.cardName.toLowerCase().includes(cardFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesCard;
    });
  }, [orders, searchTerm, statusFilter, cardFilter]);

  const totalGmv = filteredOrders.reduce((sum, o) => sum + o.settledAmount, 0);
  const totalCommission = filteredOrders.reduce((sum, o) => sum + o.estimatedCommission, 0);

  return (
    <div className="space-y-4">
      {/* 4 大宏观业绩指标 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">本月撬动出单流水 (GMV)</span>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="font-numeric-stat text-2xl font-bold text-slate-900 tracking-tight">$1,842,500</span>
            <span className="text-xs text-slate-400 font-code-token">.00</span>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>出单总量</span>
            <span className="font-numeric-table text-slate-800 font-semibold">28,450 笔卡单</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">直属一级出单业绩</span>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="font-numeric-stat text-2xl font-bold text-blue-600 tracking-tight">$1,381,875</span>
            <span className="text-xs text-slate-400 font-code-token"> (75.0%)</span>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>一级提成点位</span>
            <span className="font-code-token text-blue-700 font-semibold">4.0% 固定比例</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">二级裂变出单业绩</span>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="font-numeric-stat text-2xl font-bold text-indigo-600 tracking-tight">$460,625</span>
            <span className="text-xs text-slate-400 font-code-token"> (25.0%)</span>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>二级提成点位</span>
            <span className="font-code-token text-indigo-700 font-semibold">1.0% 固定比例</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">对账校验通过率</span>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="font-numeric-stat text-2xl font-bold text-emerald-700 tracking-tight">99.98%</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-code-token font-semibold border border-emerald-200/60">PASS</span>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>异常存疑核验单</span>
            <span className="font-code-token text-rose-600 font-semibold">1 笔待核验</span>
          </div>
        </div>
      </div>

      {/* 搜索与过滤 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="搜索出单流水号 / 客户 UID / 推广员 / 专属码..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 text-slate-900 text-xs border border-slate-200/80 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            <select
              value={cardFilter}
              onChange={e => setCardFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-slate-50 text-slate-800 text-xs border border-slate-200/80 focus:bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">卡种: 全部卡种</option>
              <option value="Apple">Apple Gift Card</option>
              <option value="Steam">Steam Wallet</option>
              <option value="Razer">Razer Gold</option>
              <option value="Google">Google Play</option>
              <option value="Vanilla">Vanilla Visa</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-lg bg-slate-50 text-slate-800 text-xs border border-slate-200/80 focus:bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">对账状态: 全量状态</option>
              <option value="VERIFIED">对账通过 (Verified)</option>
              <option value="PENDING">待核验 (Pending)</option>
              <option value="DISCREPANCY">异常存疑 (Discrepancy)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onShowToast('全量订单核验比对成功，提成与卡单流水 100% 吻合')}
              className="h-9 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>执行全网对账比对</span>
            </button>
            <button
              onClick={() => onShowToast('已导出出单明细流水清单 (.xlsx)')}
              className="h-9 px-3.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>导出对账明细</span>
            </button>
          </div>
        </div>
      </div>

      {/* 订单流水明细表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider h-10 border-b border-slate-200 select-none">
                <th className="py-2.5 px-4 font-semibold">订单流水号 / 核销时间</th>
                <th className="py-2.5 px-3 font-semibold">卡种与面额</th>
                <th className="py-2.5 px-3 font-semibold text-right">结算金额 (USD)</th>
                <th className="py-2.5 px-3 font-semibold">出单客户 UID</th>
                <th className="py-2.5 px-3 font-semibold">归属推广员 / 专属码</th>
                <th className="py-2.5 px-3 font-semibold">归因层级</th>
                <th className="py-2.5 px-3 font-semibold text-right">提成点位</th>
                <th className="py-2.5 px-3 font-semibold text-right">预估佣金</th>
                <th className="py-2.5 px-3 font-semibold text-center">对账校验</th>
                <th className="py-2.5 px-4 font-semibold text-right">IP 溯源</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredOrders.map(o => {
                const isDiscrepancy = o.verificationStatus === 'DISCREPANCY';

                return (
                  <tr key={o.orderId} className={`h-12 hover:bg-slate-50/80 transition-colors ${isDiscrepancy ? 'bg-rose-50/30' : ''}`}>
                    <td className="py-2.5 px-4">
                      <div>
                        <span className="font-code-token font-semibold text-slate-900 text-xs">{o.orderId}</span>
                        <span className="font-code-token text-[10px] text-slate-400 block">{o.orderTime}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-blue-600">{o.cardIcon}</span>
                        <span className="font-medium text-slate-800 text-xs">{o.cardName}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="font-numeric-table text-xs font-bold text-slate-900">${o.settledAmount.toFixed(2)}</span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-code-token text-slate-700 text-xs">{o.userUid}</span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800">{o.promoterName}</span>
                        <span className="font-code-token text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-blue-200/60">
                          {o.inviteCode}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      {o.tier === 'tier1' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-code-token text-[10px] font-semibold border border-blue-200/60">
                          一级直属
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-code-token text-[10px] font-semibold border border-indigo-200/60">
                          二级裂变
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="font-numeric-table text-xs font-semibold text-slate-700">
                        {(o.commissionRate * 100).toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-numeric-table text-xs font-bold ${
                        o.estimatedCommission > 0 ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        ${o.estimatedCommission.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {o.verificationStatus === 'VERIFIED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-code-token text-[10px] font-semibold border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>PASS
                        </span>
                      )}
                      {o.verificationStatus === 'DISCREPANCY' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-code-token text-[10px] font-semibold border border-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>FLAG 待复核
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right font-code-token text-slate-400 text-[11px]">
                      {o.ipAddress}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 汇总尾栏 */}
        <div className="h-11 bg-slate-50/80 px-4 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200">
          <div className="flex items-center gap-6 font-numeric-table">
            <span>当前筛选流水: <b className="text-slate-900">{filteredOrders.length}</b> 笔</span>
            <span>核销金额合计: <b className="text-blue-600 font-bold">${totalGmv.toFixed(2)}</b></span>
            <span>预估佣金小计: <b className="text-emerald-700 font-bold">${totalCommission.toFixed(2)}</b></span>
          </div>
          <div className="text-slate-400 font-code-token text-[11px]">
            仅作为预估对账，实质放款由财务结算中心统一执行
          </div>
        </div>
      </div>
    </div>
  );
};
