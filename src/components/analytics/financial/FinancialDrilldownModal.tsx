import React, { useState } from 'react';
import {
  FinancialMultiDimensionalRow,
  MOCK_FINANCIAL_L4_ORDERS,
  FinancialL4OrderRow,
} from './financialMultiDimensionalData';

export type DrilldownType = 'trend' | 'details' | 'l4' | 'risk';

interface FinancialDrilldownModalProps {
  isOpen: boolean;
  type: DrilldownType;
  row: FinancialMultiDimensionalRow | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const FinancialDrilldownModal: React.FC<FinancialDrilldownModalProps> = ({
  isOpen,
  type,
  row,
  onClose,
  onShowToast,
}) => {
  const [l4Filter, setL4Filter] = useState<string>('ALL');

  if (!isOpen || !row) return null;

  const getTitle = () => {
    switch (type) {
      case 'trend':
        return `毛利与单体经济趋势演化透视 · ${row.name}`;
      case 'details':
        return `细分规格与二级品类拆解明细 · ${row.name}`;
      case 'l4':
        return `L4 穿透原始交易对账流水抽检 · ${row.name}`;
      case 'risk':
        return `高危慢卡风控核减与敞口警示 · ${row.name}`;
    }
  };

  const filteredOrders = MOCK_FINANCIAL_L4_ORDERS.filter((o) => {
    if (l4Filter === 'ALL') return true;
    return o.status === l4Filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-4xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-surface-container-low/80 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              {row.iconText}
            </div>
            <div>
              <h3 className="font-headline-sm text-sm font-bold text-on-surface">{getTitle()}</h3>
              <p className="text-[11px] text-outline font-code-token">{row.subDesc} · GMV ${row.gmv.toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content based on type */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {type === 'trend' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-[11px] text-outline uppercase font-label-caps">近30日利差均值</span>
                  <div className="text-lg font-bold font-numeric-stat text-primary mt-1">+{row.spreadRatePercent.toFixed(2)}%</div>
                  <span className="text-[11px] text-secondary">环比上升 +0.22%</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-[11px] text-outline uppercase font-label-caps">经营毛利率演变</span>
                  <div className="text-lg font-bold font-numeric-stat text-secondary mt-1">{row.netMarginPercent.toFixed(2)}%</div>
                  <span className="text-[11px] text-outline">目标基准值: 3.50%</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-[11px] text-outline uppercase font-label-caps">直接成本综合抵扣</span>
                  <div className="text-lg font-bold font-numeric-stat text-error mt-1">
                    ${(Math.abs(row.commissionAmount) + Math.abs(row.subsidyAmount) + Math.abs(row.badDebtAmount)).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-outline">佣金+补贴+坏账</span>
                </div>
              </div>

              {/* 简易柱状/走势图模拟 */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-on-surface">近 6 个月净毛利率演化柱形 (2026.03 ~ 2026.08)</span>
                  <span className="text-[11px] text-secondary font-medium">健康走势</span>
                </div>
                <div className="grid grid-cols-6 gap-2 h-36 items-end pt-4 pb-2 border-b border-outline-variant/20">
                  {[
                    { month: '03月', margin: (row.netMarginPercent * 0.85).toFixed(1), h: '55%' },
                    { month: '04月', margin: (row.netMarginPercent * 0.88).toFixed(1), h: '60%' },
                    { month: '05月', margin: (row.netMarginPercent * 0.92).toFixed(1), h: '68%' },
                    { month: '06月', margin: (row.netMarginPercent * 0.95).toFixed(1), h: '75%' },
                    { month: '07月', margin: (row.netMarginPercent * 1.02).toFixed(1), h: '88%' },
                    { month: '08月', margin: row.netMarginPercent.toFixed(1), h: '82%' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-numeric-table font-semibold text-primary">{item.margin}%</span>
                      <div
                        className="w-full max-w-[40px] rounded-t-md bg-primary/80 hover:bg-primary transition-all"
                        style={{ height: item.h }}
                      ></div>
                      <span className="text-[10px] text-outline font-numeric-table">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {type === 'details' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface flex items-center justify-between">
                <span>品类下属二级规格分布 (Physical/Digital Card breakdown)</span>
                <span className="font-code-token text-primary">已挂接 14 个在售 SKU 节点</span>
              </div>
              <table className="w-full text-left text-xs whitespace-nowrap border border-outline-variant/20 rounded-lg overflow-hidden">
                <thead className="bg-surface-container font-label-caps text-outline uppercase h-9">
                  <tr>
                    <th className="px-3 py-2">子规格与面额区间</th>
                    <th className="px-3 py-2 text-right">流水 GMV</th>
                    <th className="px-3 py-2 text-right">利差率</th>
                    <th className="px-3 py-2 text-right">毛利率</th>
                    <th className="px-3 py-2 text-center">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container/60">
                  <tr className="hover:bg-surface-container-low">
                    <td className="px-3 py-2.5 font-medium">$50 ~ $100 小额主流物理面额</td>
                    <td className="px-3 py-2.5 text-right font-numeric-table">${(row.gmv * 0.45).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-numeric-table text-primary">{(row.spreadRatePercent + 0.3).toFixed(2)}%</td>
                    <td className="px-3 py-2.5 text-right font-numeric-table text-secondary">{(row.netMarginPercent + 0.2).toFixed(2)}%</td>
                    <td className="px-3 py-2.5 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary/10 text-secondary">顺畅流转</span></td>
                  </tr>
                  <tr className="hover:bg-surface-container-low">
                    <td className="px-3 py-2.5 font-medium">$200 ~ $500 大面额批量采购</td>
                    <td className="px-3 py-2.5 text-right font-numeric-table">${(row.gmv * 0.35).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-numeric-table text-primary">{row.spreadRatePercent.toFixed(2)}%</td>
                    <td className="px-3 py-2.5 text-right font-numeric-table text-secondary">{row.netMarginPercent.toFixed(2)}%</td>
                    <td className="px-3 py-2.5 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary/10 text-secondary">大客主力</span></td>
                  </tr>
                  <tr className="hover:bg-surface-container-low">
                    <td className="px-3 py-2.5 font-medium">$15 ~ $25 碎额与电子激活码</td>
                    <td className="px-3 py-2.5 text-right font-numeric-table">${(row.gmv * 0.20).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-numeric-table text-primary">{(row.spreadRatePercent - 0.4).toFixed(2)}%</td>
                    <td className="px-3 py-2.5 text-right font-numeric-table text-outline">{(row.netMarginPercent - 0.5).toFixed(2)}%</td>
                    <td className="px-3 py-2.5 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-container-high text-on-surface-variant">走量防御</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {type === 'l4' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs text-on-surface">
                  <span className="text-outline">核对状态:</span>
                  {(['ALL', 'SETTLED', 'AUDITED'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setL4Filter(status)}
                      className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                        l4Filter === status
                          ? 'bg-primary text-on-primary font-medium'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {status === 'ALL' ? '全部交易' : status === 'SETTLED' ? '已平账结算' : '待稽核确认'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => onShowToast('已导出该品类 L4 级实时穿透对账清单 (CSV)')}
                  className="px-2.5 py-1 rounded bg-surface-container text-primary text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  导出流水
                </button>
              </div>

              <table className="w-full text-left text-xs whitespace-nowrap border border-outline-variant/20 rounded-lg overflow-hidden">
                <thead className="bg-surface-container font-label-caps text-outline uppercase h-9">
                  <tr>
                    <th className="px-3 py-2">订单号 / 时间</th>
                    <th className="px-3 py-2 text-right">面额 (USD)</th>
                    <th className="px-3 py-2 text-right">收卡折率 / 承揽折率</th>
                    <th className="px-3 py-2 text-right">直接利差</th>
                    <th className="px-3 py-2 text-right text-secondary">净贡献毛利</th>
                    <th className="px-3 py-2">承揽商户</th>
                    <th className="px-3 py-2 text-center">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container/60">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.orderId} className="hover:bg-surface-container-low">
                      <td className="px-3 py-2.5">
                        <div className="font-code-token font-semibold text-primary">{ord.orderId}</div>
                        <div className="text-[10px] text-outline">{ord.timestamp}</div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-numeric-table font-semibold">${ord.denominationUsd.toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-right font-numeric-table">
                        <span className="text-outline">{ord.quotedDiscountRate}%</span>
                        <span className="mx-1 text-outline-variant">/</span>
                        <span className="text-on-surface font-medium">{ord.merchantDiscountRate}%</span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-numeric-table text-primary font-medium">+${ord.spreadProfitUsd.toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-right font-numeric-table font-bold text-secondary">+${ord.netProfitUsd.toFixed(2)}</td>
                      <td className="px-3 py-2.5 font-medium text-[11px]">{ord.merchantName}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            ord.status === 'SETTLED'
                              ? 'bg-secondary/10 text-secondary'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {type === 'risk' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-error/10 border border-error/20 flex items-start gap-2.5 text-error">
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">warning</span>
                <div className="text-xs">
                  <div className="font-bold">高危慢卡风控警示 (Risk Restrict Alert)</div>
                  <div className="text-error/90 mt-0.5">
                    该卡种近30日售后争议与坏账冲销占比达到 11.5%，综合净毛利率已压缩至 {row.netMarginPercent}%，低于大盘 3.50% 安全基准线。
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-3">
                <h4 className="text-xs font-semibold text-on-surface">建议风控干预策略</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-xs">
                    <input type="checkbox" defaultChecked className="rounded text-error focus:ring-error" />
                    <span>强制提升商户履约准备金门槛由 10% 上调至 25%</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-xs">
                    <input type="checkbox" defaultChecked className="rounded text-error focus:ring-error" />
                    <span>单日承揽敞口限额收紧为 $5,000 USD</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-xs">
                    <input type="checkbox" defaultChecked className="rounded text-error focus:ring-error" />
                    <span>下调散客报价 1.5% 以平抑潜在坏账溢价</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-container-low/40 border-t border-outline-variant/20 flex items-center justify-between">
          <span className="text-[11px] text-outline font-numeric-table">
            审计口径: USD 基准统一折算 · 会计准则完全符合 </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-surface border border-outline-variant/30 text-on-surface hover:bg-surface-container text-xs transition-colors cursor-pointer"
            >
              关闭
            </button>
            {type === 'risk' && (
              <button
                onClick={() => {
                  onShowToast('已成功对该高危卡种应用限额与降权风控指令');
                  onClose();
                }}
                className="px-4 py-1.5 bg-error text-on-error hover:bg-error/90 text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                确认执行风控指令
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
