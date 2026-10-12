import React, { useState, useMemo } from 'react';
import {
  MerchantDimensionKey,
  MerchantMultiDimensionalRow,
  MERCHANT_ROWS_DATA,
  TIER_ROWS_DATA,
  BRAND_ROWS_DATA,
  SKU_ROWS_DATA,
  REGION_ROWS_DATA,
  CHANNEL_ROWS_DATA,
  DATE_ROWS_DATA,
} from './merchantMultiDimensionalData';

interface MerchantDimensionalAnalyticsSectionProps {
  onOpenDrilldown: (row: MerchantMultiDimensionalRow) => void;
  onSwitchToReport: (dimension: MerchantDimensionKey) => void;
  onOpenDispatchConfig: () => void;
  onShowToast: (msg: string) => void;
  onOpenProfile?: (merchantId: string, merchantName: string) => void;
  onOpenAdjustQuota?: (merchantId: string, merchantName: string, currentLimit: number) => void;
}

export const MerchantDimensionalAnalyticsSection: React.FC<MerchantDimensionalAnalyticsSectionProps> = ({
  onOpenDrilldown,
  onSwitchToReport,
  onOpenDispatchConfig,
  onShowToast,
  onOpenProfile,
  onOpenAdjustQuota,
}) => {
  // 当前选中的分析维度
  const [activeDimension, setActiveDimension] = useState<MerchantDimensionKey>('tier');

  // 当前可视化图表视角：'distribution' (产能占比分布条形图) | 'quadrant' (时效与成功率象限散点) | 'risk' (拒单与流单风控)
  const [visualMode, setVisualMode] = useState<'distribution' | 'quadrant' | 'risk'>('distribution');

  // 当前选中待深度透视的行
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  // 维度选项配置
  const DIMENSIONS: { key: MerchantDimensionKey; label: string; icon: string; count: number; desc: string }[] = [
    { key: 'tier', label: '按商户分层 (Tier)', icon: 'workspace_premium', count: TIER_ROWS_DATA.length, desc: '战略自营、Tier-A、Tier-B及长尾兜底池' },
    { key: 'brand', label: '按卡品牌 (Brand)', icon: 'credit_card', count: BRAND_ROWS_DATA.length, desc: 'Apple、Steam、Razer、Google Play、Vanilla等' },
    { key: 'sku', label: '按规格面值 (SKU)', icon: 'sell', count: SKU_ROWS_DATA.length, desc: '主流$100爆品、$50标准、$200预付等' },
    { key: 'region', label: '按国家大区 (Region)', icon: 'public', count: REGION_ROWS_DATA.length, desc: '北美大区、欧洲、亚太及拉美新兴市场' },
    { key: 'channel', label: '按通道模式 (Channel)', icon: 'hub', count: CHANNEL_ROWS_DATA.length, desc: 'API直连专线、智能撮合、混合兜底、人工专席' },
    { key: 'merchant', label: '按商户主体 (Merchant)', icon: 'storefront', count: MERCHANT_ROWS_DATA.length, desc: '全平台认证重点做卡商户横向评测' },
    { key: 'date', label: '按日期走势 (Date)', icon: 'calendar_month', count: DATE_ROWS_DATA.length, desc: '近7日承揽爬坡与峰值流向追踪' },
  ];

  // 当前维度数据集
  const dataset = useMemo(() => {
    switch (activeDimension) {
      case 'tier':
        return TIER_ROWS_DATA;
      case 'brand':
        return BRAND_ROWS_DATA;
      case 'sku':
        return SKU_ROWS_DATA;
      case 'region':
        return REGION_ROWS_DATA;
      case 'channel':
        return CHANNEL_ROWS_DATA;
      case 'date':
        return DATE_ROWS_DATA;
      case 'merchant':
      default:
        return MERCHANT_ROWS_DATA;
    }
  }, [activeDimension]);

  // 当前选中的项
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return dataset[0] || null;
    return dataset.find((item) => item.id === selectedItemId) || dataset[0] || null;
  }, [dataset, selectedItemId]);

  // 计算当前维度的汇总统计
  const dimensionSummary = useMemo(() => {
    const totalGmv = dataset.reduce((acc, cur) => acc + cur.gmvUsd, 0);
    const totalOrders = dataset.reduce((acc, cur) => acc + cur.ordersAccepted, 0);
    const totalSuccess = dataset.reduce((acc, cur) => acc + cur.ordersSuccess, 0);
    const avgSuccessRate = totalOrders > 0 ? (totalSuccess / totalOrders) * 100 : 0;
    const avgResponse = dataset.reduce((acc, cur) => acc + cur.avgResponseSec, 0) / (dataset.length || 1);
    const warningCount = dataset.filter((d) => d.isWarning || d.status === 'WARNING').length;

    return {
      totalGmv,
      totalOrders,
      avgSuccessRate,
      avgResponse,
      warningCount,
    };
  }, [dataset]);

  // 切换维度
  const handleDimensionChange = (dim: MerchantDimensionKey) => {
    setActiveDimension(dim);
    setSelectedItemId('');
    const target = DIMENSIONS.find((d) => d.key === dim);
    onShowToast(`已切换至【${target?.label}】分析维度`);
  };

  return (
    <section className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 flex flex-col gap-4">
      {/* 1. 顶层标题栏与维度选择控制器 */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
              <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-sm font-bold text-slate-900 tracking-tight">
                  多维承揽效能与分布全景 (Multi-Dimensional Capacity &amp; Performance Matrix)
                </h2>
                <span className="font-code-token text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60">
                  全维切片分析
                </span>
                {dimensionSummary.warningCount > 0 && (
                  <span className="font-code-token text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    {dimensionSummary.warningCount} 项存在时效预警
                  </span>
                )}
              </div>
              <p className="font-body-sm text-xs text-slate-500 mt-0.5">
                支持按商户分层、承揽卡种品牌、SKU面值规格、国家大区、做卡通道及主体自由切片透视
              </p>
            </div>
          </div>

          {/* 右侧直达多维报表与操作按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSwitchToReport(activeDimension)}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer shadow-2xs"
              title="切换至该维度的多维报表查看详细指标与自定义列"
            >
              <span className="material-symbols-outlined text-[15px] text-blue-600">table_view</span>
              <span>进入该维度多维报表</span>
            </button>
            <button
              onClick={onOpenDispatchConfig}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200/60 transition-all cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[15px]">tune</span>
              <span>调度参数配置</span>
            </button>
          </div>
        </div>

        {/* 维度切换胶囊栏 (7个分析维度) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {DIMENSIONS.map((dim) => {
            const isActive = activeDimension === dim.key;
            return (
              <button
                key={dim.key}
                onClick={() => handleDimensionChange(dim.key)}
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70'
                }`}
                title={dim.desc}
              >
                <span className={`material-symbols-outlined text-[16px] ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {dim.icon}
                </span>
                <span>{dim.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full font-code-token text-[10px] ${
                    isActive ? 'bg-indigo-800/60 text-indigo-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {dim.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 核心图表与透视工作区 (双栏布局: 左7列图表, 右5列明细与下钻) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* 左侧 7 列：可视化分析引擎 (三种视图模式) */}
        <div className="lg:col-span-7 bg-slate-50/50 rounded-xl border border-slate-200/80 p-3.5 flex flex-col justify-between">
          <div>
            {/* 图表控制器 */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-xs font-bold text-slate-800">
                  {DIMENSIONS.find((d) => d.key === activeDimension)?.label} 效能透视
                </span>
                <span className="text-[11px] text-slate-500 font-code-token">
                  共计 {dataset.length} 个分析节点
                </span>
              </div>

              {/* 视角切换器 */}
              <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setVisualMode('distribution')}
                  className={`px-2 py-0.8 rounded-md transition-all font-medium cursor-pointer ${
                    visualMode === 'distribution'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  产能与GMV占比
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode('quadrant')}
                  className={`px-2 py-0.8 rounded-md transition-all font-medium cursor-pointer ${
                    visualMode === 'quadrant'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  时效/质量象限
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode('risk')}
                  className={`px-2 py-0.8 rounded-md transition-all font-medium cursor-pointer ${
                    visualMode === 'risk'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  异常与拒单率
                </button>
              </div>
            </div>

            {/* 模式 1: 产能与GMV占比分布条形图 */}
            {visualMode === 'distribution' && (
              <div className="mt-3 flex flex-col gap-2.5">
                {dataset.map((item, idx) => {
                  const isSelected = selectedItem?.id === item.id;
                  const gmvShare = item.gmvSharePercent;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-300 shadow-2xs'
                          : 'bg-white hover:bg-slate-100/70 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-code-token text-[11px] font-bold ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-800'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-700'
                                : idx === 2
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-900">{item.name}</span>
                          <span className="font-code-token text-[10.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {item.code}
                          </span>
                          {item.isWarning && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-code-token text-[10px] font-bold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px]">warning</span>
                              预警
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-numeric-stat">
                            ${item.gmvUsd.toLocaleString()} USD
                          </span>
                          <span className="font-code-token text-[11px] text-indigo-600 font-bold">
                            {gmvShare.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* 进度条与指标小签 */}
                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden my-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.isWarning
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}
                          style={{ width: `${Math.min(Math.max(gmvShare, 5), 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-code-token pt-0.5">
                        <div className="flex items-center gap-3">
                          <span>接单: <strong className="text-slate-800">{item.ordersAccepted}</strong></span>
                          <span>做卡成功: <strong className="text-emerald-700">{item.ordersSuccess}</strong></span>
                          <span>成功率: <strong className="text-slate-800">{item.successRate}%</strong></span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>平均响应: <strong className="text-slate-800">{item.avgResponseSec}s</strong></span>
                          <span>平均时效: <strong className="text-slate-800">{item.avgFulfillmentSec}s</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 模式 2: 时效与成功率象限散点矩阵 */}
            {visualMode === 'quadrant' && (
              <div className="mt-3">
                <div className="relative bg-white border border-slate-200/90 rounded-xl p-4 h-72 select-none overflow-hidden">
                  {/* 象限虚线与背景 */}
                  {/* 横向分割线 (成功率 98% 基准) */}
                  <div className="absolute left-10 right-4 top-1/2 border-b border-dashed border-slate-300" />
                  {/* 纵向分割线 (响应用时 25s 基准) */}
                  <div className="absolute top-4 bottom-8 left-1/2 border-r border-dashed border-slate-300" />

                  {/* 象限说明水印 */}
                  <div className="absolute top-2.5 left-12 text-[10.5px] font-semibold text-emerald-700/80 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200/40">
                    Q1: 极速履约标杆 (高成功率 / 极速响应)
                  </div>
                  <div className="absolute top-2.5 right-4 text-[10.5px] font-semibold text-blue-700/80 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/40">
                    Q2: 慢吞吐承揽区 (高成功率 / 慢核销)
                  </div>
                  <div className="absolute bottom-10 left-12 text-[10.5px] font-semibold text-amber-700/80 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/40">
                    Q3: 波动观察区 (一般成功率 / 快响应)
                  </div>
                  <div className="absolute bottom-10 right-4 text-[10.5px] font-semibold text-rose-700/80 bg-rose-50/80 px-2 py-0.5 rounded border border-rose-200/40">
                    Q4: 风险控流区 (超时 / 拒单偏高)
                  </div>

                  {/* 坐标轴标签 */}
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-400">
                    做卡成功率 (%) ↑
                  </div>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">
                    平均响应时间 (秒) →
                  </div>

                  {/* 散点气泡 */}
                  {dataset.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    // X轴：响应时间 0s ~ 70s -> 映射到 12% ~ 88%
                    const xPercent = Math.min(Math.max((item.avgResponseSec / 70) * 76 + 12, 12), 88);
                    // Y轴：成功率 88% ~ 100% -> 映射到 82% ~ 15% (反转)
                    const yPercent = Math.min(Math.max(100 - ((item.successRate - 88) / 12) * 67 - 15, 15), 82);
                    // 气泡大小：GMV 占比
                    const bubbleSize = Math.max(Math.min(item.gmvSharePercent * 0.8 + 24, 48), 24);

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-transform hover:scale-125 flex items-center justify-center shadow-xs border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-white ring-4 ring-indigo-200 z-30 scale-110'
                            : item.isWarning
                            ? 'bg-rose-500/80 text-white border-rose-600 hover:bg-rose-600 z-20'
                            : 'bg-blue-600/80 text-white border-blue-700 hover:bg-blue-600 z-10'
                        }`}
                        style={{
                          left: `${xPercent}%`,
                          top: `${yPercent}%`,
                          width: `${bubbleSize}px`,
                          height: `${bubbleSize}px`,
                        }}
                        title={`${item.name} (${item.code})\n成功率: ${item.successRate}%\n响应时间: ${item.avgResponseSec}s\n承揽: $${item.gmvUsd.toLocaleString()}`}
                      >
                        <span className="font-code-token text-[9.5px] font-bold text-center leading-none px-0.5 truncate max-w-full">
                          {item.name.slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                  <span>提示：气泡大小代表该主体承揽 GMV 占比，点击任意气泡可锁定查看右侧全息画像</span>
                  <span className="font-code-token">基准线: 成功率98% / 响应25s</span>
                </div>
              </div>
            )}

            {/* 模式 3: 异常与拒单率多维雷达 */}
            {visualMode === 'risk' && (
              <div className="mt-3 flex flex-col gap-2.5">
                <div className="bg-white rounded-lg border border-slate-200 p-2.5">
                  <div className="grid grid-cols-12 text-[11px] font-bold text-slate-500 pb-1.5 border-b border-slate-100">
                    <span className="col-span-4">分析主体</span>
                    <span className="col-span-2 text-right">主动拒单率</span>
                    <span className="col-span-2 text-right">超时流单率</span>
                    <span className="col-span-2 text-right">争议纠纷率</span>
                    <span className="col-span-2 text-center">综合风险</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {dataset.map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItemId(item.id)}
                          className={`grid grid-cols-12 items-center py-2 text-xs transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50/60 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="col-span-4 flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.isWarning ? 'bg-rose-600' : 'bg-emerald-500'
                              }`}
                            />
                            <span className="text-slate-900 truncate">{item.name}</span>
                          </div>
                          <div className="col-span-2 text-right font-code-token font-bold text-slate-700">
                            <span className={item.rejectRatePercent > 1.0 ? 'text-rose-600' : 'text-slate-700'}>
                              {item.rejectRatePercent.toFixed(2)}%
                            </span>
                          </div>
                          <div className="col-span-2 text-right font-code-token font-bold text-slate-700">
                            <span className={item.timeoutRatePercent > 0.5 ? 'text-amber-600' : 'text-slate-700'}>
                              {item.timeoutRatePercent.toFixed(2)}%
                            </span>
                          </div>
                          <div className="col-span-2 text-right font-code-token font-bold text-slate-700">
                            <span className={item.disputeRatePercent > 0.1 ? 'text-rose-600' : 'text-slate-700'}>
                              {item.disputeRatePercent.toFixed(2)}%
                            </span>
                          </div>
                          <div className="col-span-2 text-center">
                            {item.isWarning ? (
                              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-code-token text-[10px] font-bold">
                                控流预警
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-code-token text-[10px] font-bold">
                                正常健康
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 当前维度切片聚合统计胶囊 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-200/80 font-code-token text-[11px] text-slate-600">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">当前维度切片聚合:</span>
              <span>节点 <strong className="text-slate-900">{dataset.length}</strong> 个</span>
              <span>合计承揽 GMV: <strong className="text-slate-900">${dimensionSummary.totalGmv.toLocaleString()} USD</strong></span>
              <span>完单: <strong className="text-slate-900">{dimensionSummary.totalOrders.toLocaleString()} 笔</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span>加权成功率: <strong className="text-emerald-700">{dimensionSummary.avgSuccessRate.toFixed(2)}%</strong></span>
              <span>平均响应: <strong className="text-indigo-700">{dimensionSummary.avgResponse.toFixed(1)}s</strong></span>
            </div>
          </div>
        </div>

        {/* 右侧 5 列：选中分析主体全景透视卡片 (Deep-Dive Inspector) */}
        {selectedItem ? (
          <div className="lg:col-span-5 bg-white rounded-xl border border-indigo-200 shadow-xs p-4 flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              {/* 主体标头 */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {selectedItem.code.slice(0, 3)}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-headline-sm text-sm font-bold text-slate-900">
                        {selectedItem.name}
                      </h3>
                      <span className="font-code-token text-[10.5px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-semibold">
                        {selectedItem.tier}
                      </span>
                    </div>
                    <p className="font-code-token text-[11px] text-slate-500">
                      代码: {selectedItem.code}
                    </p>
                  </div>
                </div>

                {selectedItem.isWarning ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    控流介入
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    运转平稳
                  </span>
                )}
              </div>

              {/* 核心指标九宫格 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="text-[11px] text-slate-500">承揽总额 (GMV)</div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-numeric-stat text-base font-bold text-slate-900">
                      ${selectedItem.gmvUsd.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">USD</span>
                  </div>
                  <div className="text-[10px] font-code-token text-indigo-600 font-semibold mt-0.5">
                    大盘占比: {selectedItem.gmvSharePercent.toFixed(1)}%
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="text-[11px] text-slate-500">做卡成功率</div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-numeric-stat text-base font-bold text-emerald-700">
                      {selectedItem.successRate}%
                    </span>
                  </div>
                  <div className="text-[10px] font-code-token text-slate-500 mt-0.5">
                    成功 {selectedItem.ordersSuccess} / 失败 {selectedItem.ordersFailed}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="text-[11px] text-slate-500">平均响应时效</div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-numeric-stat text-base font-bold text-slate-900">
                      {selectedItem.avgResponseSec}s
                    </span>
                    <span className="text-[10px] text-slate-400">/ 15s 基准</span>
                  </div>
                  <div className="text-[10px] font-code-token text-slate-500 mt-0.5">
                    总核销用时: {selectedItem.avgFulfillmentSec}s
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="text-[11px] text-slate-500">授信额度利用</div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-numeric-stat text-base font-bold text-slate-900">
                      ${(selectedItem.creditLimitUsd / 1000).toFixed(0)}k
                    </span>
                    <span className="text-[10px] text-slate-400">授信池</span>
                  </div>
                  <div className="text-[10px] font-code-token text-blue-600 font-semibold mt-0.5">
                    质押保障倍数: 1.8x
                  </div>
                </div>
              </div>

              {/* 承揽核心卡种标签 */}
              <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-slate-50/60 border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-600">主要承揽卡种品类:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedItem.coreCards.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-white text-slate-700 font-code-token text-[11px] border border-slate-200"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* 风险指标三列药丸 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-center">
                  <div className="text-[10px] text-slate-400 font-medium">主动拒单率</div>
                  <div className={`font-code-token font-bold text-xs mt-0.5 ${selectedItem.rejectRatePercent > 1.0 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {selectedItem.rejectRatePercent.toFixed(2)}%
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-center">
                  <div className="text-[10px] text-slate-400 font-medium">超时流单率</div>
                  <div className={`font-code-token font-bold text-xs mt-0.5 ${selectedItem.timeoutRatePercent > 0.5 ? 'text-amber-600' : 'text-slate-800'}`}>
                    {selectedItem.timeoutRatePercent.toFixed(2)}%
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-center">
                  <div className="text-[10px] text-slate-400 font-medium">争议纠纷率</div>
                  <div className={`font-code-token font-bold text-xs mt-0.5 ${selectedItem.disputeRatePercent > 0.1 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {selectedItem.disputeRatePercent.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* 决策建议与风控备注 */}
              {selectedItem.notes && (
                <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">
                    info
                  </span>
                  <span>{selectedItem.notes}</span>
                </div>
              )}
            </div>

            {/* 下钻穿透与快捷调度操作条 */}
            <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onOpenDrilldown(selectedItem)}
                className="w-full h-8.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                <span>穿透该节点做卡订单流水 (Drilldown Orders)</span>
              </button>

              {activeDimension === 'merchant' && (onOpenProfile || onOpenAdjustQuota) && (
                <div className="flex items-center gap-2">
                  {onOpenProfile && (
                    <button
                      type="button"
                      onClick={() => onOpenProfile(selectedItem.id, selectedItem.name)}
                      className="flex-1 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/70 font-medium text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">badge</span>
                      <span>商户全景画像</span>
                    </button>
                  )}
                  {onOpenAdjustQuota && (
                    <button
                      type="button"
                      onClick={() => onOpenAdjustQuota(selectedItem.id, selectedItem.name, selectedItem.creditLimitUsd)}
                      className="flex-1 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/70 font-medium text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">credit_score</span>
                      <span>调配授信额度</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSwitchToReport(activeDimension)}
                  className="flex-1 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px] text-blue-600">table_chart</span>
                  <span>在多维报表中透视</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenDispatchConfig}
                  className="flex-1 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px] text-indigo-600">tune</span>
                  <span>调整配额与分流</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2">touch_app</span>
            <p className="text-xs">请在左侧列表中点击任意分析主体查看全景指标画像</p>
          </div>
        )}
      </div>
    </section>
  );
};
