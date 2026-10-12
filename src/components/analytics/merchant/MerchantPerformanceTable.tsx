import React, { useState } from 'react';
import { MerchantPerformanceRow } from './types';

interface MerchantPerformanceTableProps {
  merchants: MerchantPerformanceRow[];
  onOpenProfile: (merchant: MerchantPerformanceRow) => void;
  onOpenAdjustQuota: (merchant: MerchantPerformanceRow) => void;
  onUrgentAlert: (merchant: MerchantPerformanceRow) => void;
  onArbitrate: (merchant: MerchantPerformanceRow) => void;
  onRefundDeposit: (merchant: MerchantPerformanceRow) => void;
}

export const MerchantPerformanceTable: React.FC<MerchantPerformanceTableProps> = ({
  merchants,
  onOpenProfile,
  onOpenAdjustQuota,
  onUrgentAlert,
  onArbitrate,
  onRefundDeposit,
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMerchants = merchants.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.merchantName.toLowerCase().includes(q) ||
      m.merchantId.toLowerCase().includes(q) ||
      m.majorCards.toLowerCase().includes(q)
    );
  });

  return (
    <section className="bg-white rounded-xl shadow-xs p-4 border border-slate-200/80 flex flex-col gap-3.5">
      {/* 头部标题与搜索框 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
            <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-sm font-bold text-slate-900 tracking-tight">
                商户履约质量横向对齐列表 (Merchant Performance Matrix)
              </h2>
              <span className="font-code-token text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                实时加权分析
              </span>
            </div>
            <p className="font-body-sm text-xs text-slate-500 mt-0.5">
              对认证做卡商进行全景画像比对，实行精细化配额倾斜与超时惩罚
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 rounded-lg pl-8 pr-3 py-1.5 font-body-sm text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none border border-slate-200 focus:border-blue-600 transition-colors"
              placeholder="搜索商户名 / MID / 账户..."
              type="text"
            />
            <span className="material-symbols-outlined absolute left-2 top-2 text-[16px] text-slate-400">
              search
            </span>
          </div>
        </div>
      </div>

      {/* 数据表主体 */}
      <div className="w-full overflow-x-auto rounded-lg border border-slate-200/80 bg-slate-50/30">
        <table className="w-full text-left font-body-sm text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-600 font-label-caps text-[11px] uppercase tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-3.5 font-semibold">商户全称 / MID</th>
              <th className="py-2.5 px-3.5 font-semibold">分层</th>
              <th className="py-2.5 px-3.5 font-semibold">主力承揽卡种</th>
              <th className="py-2.5 px-3.5 text-right font-semibold">承揽单量</th>
              <th className="py-2.5 px-3.5 text-right font-semibold">核销 GMV (USD)</th>
              <th className="py-2.5 px-3.5 text-right font-semibold">成功率</th>
              <th className="py-2.5 px-3.5 text-right font-semibold">平均响应</th>
              <th className="py-2.5 px-3.5 text-right font-semibold">总耗时</th>
              <th className="py-2.5 px-3.5 text-right font-semibold">主动拒单率</th>
              <th className="py-2.5 px-3.5 text-center font-semibold">履约评分</th>
              <th className="py-2.5 px-3.5 text-right font-semibold">管理操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white font-numeric-table">
            {filteredMerchants.map((merchant) => {
              const isSuspended = merchant.tier === 'SUSPEND' || merchant.isSuspended;

              return (
                <tr
                  key={merchant.merchantId}
                  className={`transition-colors ${
                    isSuspended
                      ? 'bg-rose-50/30 hover:bg-rose-50/60'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* 商户全称 / MID */}
                  <td className="py-3 px-3.5 font-body-md text-xs">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-semibold ${
                            isSuspended ? 'text-rose-700' : 'text-slate-900'
                          }`}
                        >
                          {merchant.merchantName}
                        </span>
                        {isSuspended && (
                          <span className="material-symbols-outlined text-[15px] text-rose-600">
                            lock
                          </span>
                        )}
                      </div>
                      <span className="font-code-token text-[10.5px] text-slate-400 mt-0.5">
                        {merchant.merchantId} · {merchant.channelDesc}
                      </span>
                    </div>
                  </td>

                  {/* 分层 */}
                  <td className="py-3 px-3.5">
                    {merchant.tier === 'Tier-S' && (
                      <span className="inline-flex px-2 py-0.5 rounded bg-blue-600 text-white font-code-token text-[11px] font-semibold">
                        Tier-S
                      </span>
                    )}
                    {merchant.tier === 'Tier-A' && (
                      <span className="inline-flex px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-code-token text-[11px] font-semibold border border-blue-200">
                        Tier-A
                      </span>
                    )}
                    {merchant.tier === 'Tier-B' && (
                      <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-code-token text-[11px] font-medium border border-slate-200">
                        Tier-B
                      </span>
                    )}
                    {merchant.tier === 'SUSPEND' && (
                      <span className="inline-flex px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-code-token text-[11px] font-bold border border-rose-200 animate-pulse">
                        SUSPEND
                      </span>
                    )}
                  </td>

                  {/* 主力承揽卡种 */}
                  <td className="py-3 px-3.5 font-body-sm text-xs text-slate-700">
                    {merchant.majorCards}
                  </td>

                  {/* 承揽单量 */}
                  <td className="py-3 px-3.5 text-right font-medium text-slate-900 font-numeric-stat">
                    {merchant.fulfilledOrderCount.toLocaleString()}
                  </td>

                  {/* 核销 GMV */}
                  <td className="py-3 px-3.5 text-right font-semibold text-slate-900 font-numeric-stat">
                    ${merchant.verifiedGmvUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* 成功率 */}
                  <td
                    className={`py-3 px-3.5 text-right font-semibold font-numeric-stat ${
                      merchant.successRate >= 98
                        ? 'text-emerald-700'
                        : merchant.successRate >= 90
                        ? 'text-slate-900'
                        : 'text-rose-600 font-bold'
                    }`}
                  >
                    {merchant.successRate.toFixed(1)}%
                  </td>

                  {/* 平均响应 */}
                  <td
                    className={`py-3 px-3.5 text-right font-numeric-stat ${
                      merchant.isHighLatency ? 'text-rose-600 font-bold' : 'text-slate-800'
                    }`}
                  >
                    {merchant.avgResponseSeconds.toFixed(1)}s
                  </td>

                  {/* 总耗时 */}
                  <td
                    className={`py-3 px-3.5 text-right font-numeric-stat ${
                      merchant.isHighLatency ? 'text-rose-600' : 'text-slate-800'
                    }`}
                  >
                    {merchant.totalDurationText}
                  </td>

                  {/* 主动拒单率 */}
                  <td
                    className={`py-3 px-3.5 text-right font-numeric-stat ${
                      merchant.isHighReject ? 'text-rose-600 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {merchant.activeRejectRate.toFixed(2)}%
                  </td>

                  {/* 履约评分 */}
                  <td className="py-3 px-3.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-bold font-numeric-stat text-xs ${
                        merchant.performanceScore >= 95
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : merchant.performanceScore >= 90
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : merchant.performanceScore >= 80
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {merchant.performanceScore.toFixed(1)}
                    </span>
                  </td>

                  {/* 管理操作 */}
                  <td className="py-3 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isSuspended ? (
                        <>
                          <button
                            onClick={() => onArbitrate(merchant)}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-body-sm text-xs font-semibold cursor-pointer shadow-2xs"
                          >
                            仲裁处置
                          </button>
                          <button
                            onClick={() => onRefundDeposit(merchant)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-body-sm text-xs font-medium cursor-pointer"
                          >
                            清退保证金
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onOpenProfile(merchant)}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 font-body-sm text-xs font-semibold cursor-pointer border border-blue-200/60"
                          >
                            履约画像
                          </button>
                          {merchant.isHighLatency ? (
                            <button
                              onClick={() => onUrgentAlert(merchant)}
                              className="px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 font-body-sm text-xs font-semibold cursor-pointer border border-rose-200 animate-pulse"
                            >
                              催办告警
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenAdjustQuota(merchant)}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-body-sm text-xs font-medium cursor-pointer"
                            >
                              调配额
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 表格分页与汇总脚注 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-slate-500 font-body-sm text-xs">
        <div>
          显示第 1 至 {filteredMerchants.length} 家商户（共 142 家认证做卡主体，在线服务中 88 家）
        </div>
        <div className="flex items-center gap-1 font-numeric-stat">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
          >
            上一页
          </button>
          <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold shadow-2xs">
            1
          </button>
          <button className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">
            2
          </button>
          <button className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">
            3
          </button>
          <span className="px-1 text-slate-400">...</span>
          <button className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">
            24
          </button>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            下一页
          </button>
        </div>
      </div>
    </section>
  );
};
