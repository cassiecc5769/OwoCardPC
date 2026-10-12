import React, { useState } from 'react';
import {
  MOCK_RISK_OVERVIEW_KPIS,
  MOCK_RISK_TYPE_STATS,
  MOCK_RISK_BRAND_STATS,
  MOCK_RISK_LEVEL_STATS,
  MOCK_RISK_WARNINGS
} from './mockRiskData';
import { TimeRangePreset } from './riskTypes';

interface RiskOverviewTabProps {
  showToast: (msg: string) => void;
  onNavigateToPrecheck?: (filterDecision?: string) => void;
  onNavigateToTrends?: () => void;
  onNavigateToAbnormal?: (filterRiskType?: string) => void;
}

export const RiskOverviewTab: React.FC<RiskOverviewTabProps> = ({
  showToast,
  onNavigateToPrecheck,
  onNavigateToTrends,
  onNavigateToAbnormal
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('today');
  const kpis = MOCK_RISK_OVERVIEW_KPIS[timeRange] || MOCK_RISK_OVERVIEW_KPIS.today;

  const [structureView, setStructureView] = useState<'type' | 'brand' | 'level'>('type');

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 职责说明 Banner 与 时间维度选择 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">shield</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">风控总览（回答：现在平台风险怎么样、主要风险在哪里、有无紧急事项？）</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                一屏全局风险态势
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              严密监控预检流量、拦截阻断率、实时待办异常卡及避免损失金额。<strong className="text-slate-700">风控规则统一在「平台配置 → 业务规则」维护。</strong>
            </p>
          </div>
        </div>

        {/* 时间跨度快速切换 */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          {[
            { id: 'today', label: '今日' },
            { id: 'yesterday', label: '昨日' },
            { id: '7days', label: '近 7 日' },
            { id: '30days', label: '近 30 日' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => {
                setTimeRange(btn.id as TimeRangePreset);
                showToast(`已切换风控大盘视角: ${btn.label}`);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                timeRange === btn.id
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 顶部核心指标看板 (7 大关键风控指标) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 font-mono">
        {/* 1. 今日预检卡数 */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] block font-sans">预检卡数</span>
          <span className="text-xl font-black text-slate-900 block mt-0.5">
            {kpis.precheckCount.toLocaleString()}
          </span>
          <span className="text-emerald-600 text-[10px] font-sans font-semibold">
            同比 +{kpis.precheckGrowthRate}%
          </span>
        </div>

        {/* 2. 风险卡数 */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] block font-sans">风险卡数</span>
          <span className="text-xl font-black text-rose-600 block mt-0.5">
            {kpis.riskCardCount.toLocaleString()}
          </span>
          <span className="text-rose-600 text-[10px] font-sans">涉嫌异常/欺诈</span>
        </div>

        {/* 3. 风险卡率 */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] block font-sans">风险卡率</span>
          <span className="text-xl font-black text-amber-700 block mt-0.5">
            {kpis.riskCardRate}%
          </span>
          <span className="text-emerald-700 text-[10px] font-sans font-semibold">
            处于安全阈值 (&lt;5%)
          </span>
        </div>

        {/* 4. 自动拦截数 */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] block font-sans">自动拦截数</span>
          <span className="text-xl font-black text-indigo-700 block mt-0.5">
            {kpis.autoBlockCount.toLocaleString()}
          </span>
          <span className="text-slate-500 text-[10px] font-sans">系统直接阻断</span>
        </div>

        {/* 5. 待人工处理 */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] block font-sans">待人工处理 (异常卡)</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xl font-black text-rose-600">
              {kpis.pendingManualCount}
            </span>
            {kpis.pendingManualCount > 0 && (
              <button
                onClick={() => onNavigateToAbnormal && onNavigateToAbnormal()}
                className="text-[10px] font-sans text-blue-600 hover:underline font-bold"
              >
                去处理 &rarr;
              </button>
            )}
          </div>
          <span className="text-slate-400 text-[10px] font-sans">工作池待办</span>
        </div>

        {/* 6. 风险涉及金额 */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] block font-sans">风险涉及金额</span>
          <span className="text-xl font-black text-slate-800 block mt-0.5">
            ${(kpis.riskInvolvedAmount / 1000).toFixed(1)}k
          </span>
          <span className="text-slate-400 text-[10px] font-sans">对应申报总值</span>
        </div>

        {/* 7. 今日避免损失 */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] block font-sans">避免损失金额</span>
          <span className="text-xl font-black text-emerald-600 block mt-0.5">
            ${(kpis.avoidedLossAmount / 1000).toFixed(1)}k
          </span>
          <span className="text-emerald-700 text-[10px] font-sans font-semibold">
            成功阻断避免坏账
          </span>
        </div>
      </div>

      {/* 四大统一预检结果概览条 (PASS / REVIEW / BLOCK / CHECK_FAILED) */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-xs">统一预检决策分布:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onNavigateToPrecheck && onNavigateToPrecheck('PASS')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>PASS 放行: {Math.round(kpis.precheckCount * 0.924).toLocaleString()}</span>
            </button>
            <button
              onClick={() => onNavigateToPrecheck && onNavigateToPrecheck('REVIEW')}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              <span>REVIEW 复核: {Math.round(kpis.precheckCount * 0.042).toLocaleString()}</span>
            </button>
            <button
              onClick={() => onNavigateToPrecheck && onNavigateToPrecheck('BLOCK')}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              <span>BLOCK 拦截: {kpis.autoBlockCount.toLocaleString()}</span>
            </button>
            <button
              onClick={() => onNavigateToPrecheck && onNavigateToPrecheck('CHECK_FAILED')}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="CHECK_FAILED 属于工具异常，不等于卡片违规 BLOCK"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping"></span>
              <span>CHECK_FAILED 工具异常: 30</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateToPrecheck && onNavigateToPrecheck()}
            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-[#004ac6] rounded-lg text-xs font-semibold cursor-pointer border border-blue-200 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">play_circle</span>
            <span>进入预检运行</span>
          </button>
          <button
            onClick={() => onNavigateToTrends && onNavigateToTrends()}
            className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold cursor-pointer border border-indigo-200 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">trending_up</span>
            <span>查看风控趋势</span>
          </button>
        </div>
      </div>

      {/* 风险预警卡片 (突出真正需要关注的问题) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-rose-600">notification_important</span>
            <span>突发风险预警（系统自动检出偏离基线的核心异常）</span>
          </h3>
          <span className="text-slate-400 font-mono text-[11px]">共检出 {MOCK_RISK_WARNINGS.length} 项风险告警</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MOCK_RISK_WARNINGS.map(warn => (
            <div
              key={warn.id}
              className="bg-white rounded-xl p-4 border border-rose-200/90 shadow-xs flex flex-col justify-between space-y-3 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs">{warn.title}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                    {warn.riskLevel === 'HIGH' ? '高危' : '中危'}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">
                  {warn.issueDesc}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80 space-y-1 text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">当前异常值 / 基线:</span>
                  <span className="font-bold text-rose-600">{warn.currentVal} <span className="text-slate-400 font-normal font-sans">(基线 {warn.baselineVal})</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">影响卡数 / 涉及金额:</span>
                  <span className="font-bold text-slate-800">{warn.affectedCards} 张 / ${warn.involvedAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">开始时间:</span>
                  <span className="text-slate-600">{warn.startTime}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 truncate max-w-[65%]" title={warn.suggestedAction}>
                  💡 {warn.suggestedAction}
                </span>
                <button
                  onClick={() => onNavigateToAbnormal && onNavigateToAbnormal(warn.filterRiskType)}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1 border border-rose-200"
                >
                  <span>查看异常卡</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 风险结构透视（按风险类型 ｜ 按卡种 ｜ 按风险等级） */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-blue-600">pie_chart</span>
              <span>风险结构透视（多维风险溯源与分布特征）</span>
            </h3>
            <span className="text-slate-400 text-xs mt-0.5 block">
              快速发现某一卡种、风险类型或等级是否发生异常聚集
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setStructureView('type')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                structureView === 'type' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              按风险类型
            </button>
            <button
              onClick={() => setStructureView('brand')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                structureView === 'brand' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              按卡种品牌
            </button>
            <button
              onClick={() => setStructureView('level')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                structureView === 'level' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              按风险等级
            </button>
          </div>
        </div>

        {/* 视图 1: 按风险类型 */}
        {structureView === 'type' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
            {MOCK_RISK_TYPE_STATS.map(item => (
              <div key={item.key} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between font-sans">
                  <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">{item.ratioPct}% 占比</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-slate-900">{item.count} <span className="text-xs font-normal text-slate-400">张</span></span>
                  <span className="text-xs font-bold text-blue-700">${item.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.colorClass}`} style={{ width: `${item.ratioPct}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-sans">
                  <span className="text-slate-400">环比变化:</span>
                  <span className={item.periodGrowthPct >= 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                    {item.periodGrowthPct >= 0 ? `+${item.periodGrowthPct}%` : `${item.periodGrowthPct}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 视图 2: 按卡种 */}
        {structureView === 'brand' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">卡种品牌</th>
                  <th className="py-2.5 px-3">预检卡量</th>
                  <th className="py-2.5 px-3">检出风险卡</th>
                  <th className="py-2.5 px-3">风险卡率 (%)</th>
                  <th className="py-2.5 px-3">涉及申报金额</th>
                  <th className="py-2.5 px-3">风险态势</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {MOCK_RISK_BRAND_STATS.map(brand => (
                  <tr key={brand.brand} className="hover:bg-slate-50 transition-colors font-sans">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>{brand.name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-800">{brand.precheckCount.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-600">{brand.riskCount}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{brand.riskRate}%</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">${brand.amount.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      {brand.isSpikeAnomaly ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          ⚠️ 今日突增预警
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          正常受控
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 视图 3: 按风险等级 */}
        {structureView === 'level' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MOCK_RISK_LEVEL_STATS.map(lvl => (
              <div key={lvl.level} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${lvl.badgeClass}`}>
                    {lvl.levelName}
                  </span>
                  <span className="text-slate-400 font-mono text-xs">{lvl.ratioPct}% 占比</span>
                </div>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-2xl font-black text-slate-900">{lvl.count} <span className="text-xs font-normal text-slate-400">张</span></span>
                  <span className="text-sm font-bold text-blue-700">${lvl.amount.toLocaleString()}</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {lvl.level === 'HIGH' && '包含明确欺诈、多次重复卡、黑名单命中、大额异常等，系统强拦截。'}
                  {lvl.level === 'MEDIUM' && '包含面额不符、历史争议较多、状态存疑等，需人工客服复核。'}
                  {lvl.level === 'LOW' && '包含轻微格式修正、非核心通道超时等，记录关注并兜底放行。'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
