import React, { useState } from 'react';
import { MultiDimensionalRowItem, MOCK_TREND_SERIES } from './multiDimensionalData';

interface MultiDimensionalTrendModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MultiDimensionalRowItem | null;
}

export const MultiDimensionalTrendModal: React.FC<MultiDimensionalTrendModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [metricTab, setMetricTab] = useState<'gmv' | 'orders' | 'successRate' | 'sla'>('gmv');

  if (!isOpen || !item) return null;

  const series = MOCK_TREND_SERIES[item.id] || MOCK_TREND_SERIES.default;

  const maxGmv = Math.max(...series.map((s) => s.gmv));
  const minGmv = Math.min(...series.map((s) => s.gmv));
  const avgSuccessRate = (
    series.reduce((sum, s) => sum + s.successRate, 0) / series.length
  ).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-surface-container-low/80 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${item.iconBg} ${item.iconColor}`}
            >
              {item.iconText}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                  {item.name} · 趋势走势分析
                </h3>
                <span className="font-code-token text-[11px] text-outline px-1.5 py-0.5 bg-white rounded border border-outline-variant/30">
                  {item.code}
                </span>
                {item.isWarning && (
                  <span className="px-1.5 py-0.5 rounded bg-error/10 text-error font-bold text-[10px]">
                    告警品类
                  </span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant">
                数据周期: 近7天 (2026-08-21 ~ 2026-08-27) · 毫秒级撮合流回放
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Key Stat Highlights */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20">
              <span className="text-[10px] font-label-caps text-outline block">当前成交 GMV</span>
              <span className="font-numeric-stat text-base font-bold text-primary">
                ${item.settledGmv.toLocaleString()}
              </span>
              <span className="text-[10px] text-outline block mt-0.5">
                高点: ${(maxGmv / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20">
              <span className="text-[10px] font-label-caps text-outline block">当前成功率</span>
              <span
                className={`font-numeric-stat text-base font-bold ${
                  item.successRate >= 98
                    ? 'text-secondary'
                    : item.successRate >= 95
                    ? 'text-tertiary'
                    : 'text-error'
                }`}
              >
                {item.successRate}%
              </span>
              <span className="text-[10px] text-outline block mt-0.5">
                7日均值: {avgSuccessRate}%
              </span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20">
              <span className="text-[10px] font-label-caps text-outline block">平均核销时效</span>
              <span
                className={`font-numeric-stat text-base font-bold ${
                  item.avgDurationSec <= 40 ? 'text-secondary' : 'text-error'
                }`}
              >
                {item.avgDurationSec}s
              </span>
              <span className="text-[10px] text-outline block mt-0.5">
                SLA 达标率 99.2%
              </span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20">
              <span className="text-[10px] font-label-caps text-outline block">争议率 / 超时率</span>
              <span
                className={`font-numeric-stat text-base font-bold ${
                  item.disputeRate > 1.0 ? 'text-error' : 'text-on-surface'
                }`}
              >
                {item.disputeRate}%
              </span>
              <span className="text-[10px] text-outline block mt-0.5">
                超时率 {item.timeoutRate}%
              </span>
            </div>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-on-surface">指标走势图谱:</span>
            <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-outline-variant/30 text-xs">
              <button
                onClick={() => setMetricTab('gmv')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  metricTab === 'gmv'
                    ? 'bg-primary text-on-primary font-medium shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                成交 GMV ($)
              </button>
              <button
                onClick={() => setMetricTab('orders')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  metricTab === 'orders'
                    ? 'bg-primary text-on-primary font-medium shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                申报出单量
              </button>
              <button
                onClick={() => setMetricTab('successRate')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  metricTab === 'successRate'
                    ? 'bg-primary text-on-primary font-medium shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                核销成功率 (%)
              </button>
              <button
                onClick={() => setMetricTab('sla')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  metricTab === 'sla'
                    ? 'bg-primary text-on-primary font-medium shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                平均核销时效 (s)
              </button>
            </div>
          </div>

          {/* Trend Chart Bars / Visualization */}
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">
            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
              {series.map((pt, idx) => {
                let valueHeight = 0;
                let displayVal = '';
                let barColor = 'bg-primary';

                if (metricTab === 'gmv') {
                  const range = maxGmv - minGmv || 1;
                  const ratio = (pt.gmv - minGmv) / range;
                  valueHeight = Math.max(20, Math.round(ratio * 90 + 20));
                  displayVal = `$${(pt.gmv / 1000).toFixed(0)}k`;
                  barColor = 'bg-primary';
                } else if (metricTab === 'orders') {
                  const maxOrders = Math.max(...series.map((s) => s.orders));
                  valueHeight = Math.max(20, Math.round((pt.orders / maxOrders) * 110));
                  displayVal = `${pt.orders}`;
                  barColor = 'bg-indigo-600';
                } else if (metricTab === 'successRate') {
                  const minRate = 90;
                  const maxRate = 100;
                  valueHeight = Math.max(20, Math.round(((pt.successRate - minRate) / 10) * 110));
                  displayVal = `${pt.successRate}%`;
                  barColor = pt.successRate >= 98 ? 'bg-secondary' : pt.successRate >= 95 ? 'bg-tertiary' : 'bg-error';
                } else {
                  const maxDuration = Math.max(...series.map((s) => s.durationSec));
                  valueHeight = Math.max(20, Math.round((pt.durationSec / maxDuration) * 110));
                  displayVal = `${pt.durationSec}s`;
                  barColor = pt.durationSec <= 35 ? 'bg-secondary' : 'bg-amber-500';
                }

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="font-numeric-table text-[10px] text-outline group-hover:text-primary font-semibold transition-colors">
                      {displayVal}
                    </span>
                    <div className="w-full bg-surface-container rounded-t-md flex items-end justify-center p-0.5 overflow-hidden h-28">
                      <div
                        className={`w-full ${barColor} rounded-t-sm transition-all duration-300 group-hover:opacity-85`}
                        style={{ height: `${valueHeight}%` }}
                      />
                    </div>
                    <span className="font-numeric-table text-[11px] text-on-surface-variant font-medium">
                      {pt.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Root-cause notes / Trend Summary */}
          <div className="bg-surface-container-low/60 rounded-xl p-3 border border-outline-variant/20 flex items-start gap-2.5 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">
              analytics
            </span>
            <div className="leading-relaxed">
              <span className="font-semibold text-on-surface">趋势诊断结论: </span>
              {item.isWarning ? (
                <span className="text-error font-medium">
                  该规格受部分离线 POSA 激活异常影响，近 3 天成功率下滑至 {item.successRate}%，平均核销时效达到 {item.avgDurationSec}s，建议调整商户接单权重并触发发卡行接口重试机制。
                </span>
              ) : (
                <span>
                  近 7 天交易曲线保持稳健正向增长，综合承兑率稳定在 {item.successRate}%，平均处理时效 {item.avgDurationSec} 秒远优于 SLA 38 秒基线，属于全网高净值健康规格。
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-surface-container-low/40 border-t border-outline-variant/20 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-primary text-on-primary hover:bg-primary/90 text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            完成查看
          </button>
        </div>
      </div>
    </div>
  );
};
