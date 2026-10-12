import React, { useState, useMemo } from 'react';
import {
  UserDimensionKey,
  UserMultiDimensionalRow,
  CHANNEL_ROWS_DATA,
  TEAM_ROWS_DATA,
  TIER_ROWS_DATA,
  REGION_ROWS_DATA,
  SEGMENT_ROWS_DATA,
  BRAND_ROWS_DATA,
  DATE_ROWS_DATA,
} from './userMultiDimensionalData';

interface UserDimensionalAnalyticsSectionProps {
  onOpenDrilldown: (row: UserMultiDimensionalRow) => void;
  onSwitchToReport: (dimension: UserDimensionKey) => void;
  onOpenProtectionPolicy: () => void;
  onOpenTierRules?: (tierRow?: any) => void;
  onOpenChannelLtv?: (channelRow?: any) => void;
  onShowToast: (msg: string) => void;
}

export const UserDimensionalAnalyticsSection: React.FC<UserDimensionalAnalyticsSectionProps> = ({
  onOpenDrilldown,
  onSwitchToReport,
  onOpenProtectionPolicy,
  onOpenTierRules,
  onOpenChannelLtv,
  onShowToast,
}) => {
  // 当前选中的分析维度 (默认渠道)
  const [activeDimension, setActiveDimension] = useState<UserDimensionKey>('channel');

  // 当前可视化图表视角：'distribution' (规模与GMV分布) | 'quadrant' (CAC与留存价值象限) | 'funnel' (漏斗流失诊断)
  const [visualMode, setVisualMode] = useState<'distribution' | 'quadrant' | 'funnel'>('distribution');

  // 当前选中待深度透视的行 ID
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  // 维度配置
  const DIMENSIONS: { key: UserDimensionKey; label: string; icon: string; count: number; desc: string }[] = [
    { key: 'channel', label: '按获客渠道 (Channel)', icon: 'hub', count: CHANNEL_ROWS_DATA.length, desc: 'WhatsApp广播、Telegram大客、TikTok挂链、电脑城档口等' },
    { key: 'team', label: '按推广战队 (Team)', icon: 'groups', count: TEAM_ROWS_DATA.length, desc: '西非阿尔法拓展组、机构大客组、社媒投放组、地推网格' },
    { key: 'tier', label: '按会员等级 (Tier)', icon: 'workspace_premium', count: TIER_ROWS_DATA.length, desc: 'LV1新手、LV2白银、LV3黄金、LV4钻石黑金、LV5皇冠至尊' },
    { key: 'region', label: '按国家地区 (Region)', icon: 'public', count: REGION_ROWS_DATA.length, desc: '尼日利亚核心市场、加纳战略副中心、肯尼亚东非、跨境离岸' },
    { key: 'segment', label: '按价值分群 (Segment)', icon: 'group_work', count: SEGMENT_ROWS_DATA.length, desc: '核心复购老客、新客破冰、大宗买手、沉睡边缘客、流失高危客' },
    { key: 'brand', label: '按卡种偏好 (Brand)', icon: 'credit_card', count: BRAND_ROWS_DATA.length, desc: 'Apple、Steam、Razer Gold、Vanilla Visa、Google Play、Amazon' },
    { key: 'date', label: '按日期走势 (Date)', icon: 'calendar_month', count: DATE_ROWS_DATA.length, desc: '近7日每日交易规模、破冰效率与复购时序追踪' },
  ];

  // 对应维度数据集
  const dataset = useMemo(() => {
    switch (activeDimension) {
      case 'team':
        return TEAM_ROWS_DATA;
      case 'tier':
        return TIER_ROWS_DATA;
      case 'region':
        return REGION_ROWS_DATA;
      case 'segment':
        return SEGMENT_ROWS_DATA;
      case 'brand':
        return BRAND_ROWS_DATA;
      case 'date':
        return DATE_ROWS_DATA;
      case 'channel':
      default:
        return CHANNEL_ROWS_DATA;
    }
  }, [activeDimension]);

  // 当前选中的项
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return dataset[0] || null;
    return dataset.find((item) => item.id === selectedItemId) || dataset[0] || null;
  }, [dataset, selectedItemId]);

  // 维度数据汇总计算
  const summary = useMemo(() => {
    const totalGmv = dataset.reduce((acc, cur) => acc + cur.gmvUsd, 0);
    const totalOrders = dataset.reduce((acc, cur) => acc + cur.orderCount, 0);
    const totalNewUsers = dataset.reduce((acc, cur) => acc + cur.newUsers, 0);
    const totalFirstUsers = dataset.reduce((acc, cur) => acc + cur.firstOrderUsers, 0);
    const avgConversion = totalNewUsers > 0 ? (totalFirstUsers / totalNewUsers) * 100 : 0;
    const avgRetention = dataset.reduce((acc, cur) => acc + cur.repeatRate30d, 0) / (dataset.length || 1);
    const totalProfit = dataset.reduce((acc, cur) => acc + cur.grossProfit90d, 0);

    return {
      totalGmv,
      totalOrders,
      totalNewUsers,
      totalFirstUsers,
      avgConversion,
      avgRetention,
      totalProfit,
    };
  }, [dataset]);

  // 切换维度
  const handleDimensionChange = (dim: UserDimensionKey) => {
    setActiveDimension(dim);
    setSelectedItemId('');
    const target = DIMENSIONS.find((d) => d.key === dim);
    onShowToast(`已切换至【${target?.label}】多维分析看板`);
  };

  return (
    <section className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col gap-4">
      {/* 模块头部：标题与功能描述 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-4.5 bg-blue-600 rounded-xs" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                多维用户客群经营与深度画像透视
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
                7大多维切片 · 全景下钻
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              跨获客渠道、战队归属、会员层级、国家地域、价值分群、卡种偏好与日期时序多维下钻
            </p>
          </div>
        </div>

        {/* 顶部右侧：视图形态切换 (分布 / 象限 / 漏斗) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => {
                setVisualMode('distribution');
                onShowToast('已切换至规模与GMV分布视图');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                visualMode === 'distribution'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">bar_chart</span>
              <span>规模与GMV分布</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setVisualMode('quadrant');
                onShowToast('已切换至CAC与留存价值象限');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                visualMode === 'quadrant'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">scatter_plot</span>
              <span>效能价值象限</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setVisualMode('funnel');
                onShowToast('已切换至转化漏斗与流失预警');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                visualMode === 'funnel'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">filter_alt</span>
              <span>漏斗流失诊断</span>
            </button>
          </div>
        </div>
      </div>

      {/* 维度切换胶囊栏 (7个分析维度) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {DIMENSIONS.map((dim) => {
          const isActive = activeDimension === dim.key;
          return (
            <button
              key={dim.key}
              type="button"
              onClick={() => handleDimensionChange(dim.key)}
              className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`material-symbols-outlined text-[17px] ${
                    isActive ? 'text-blue-600' : 'text-slate-500'
                  }`}
                >
                  {dim.icon}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {dim.count}
                </span>
              </div>
              <div className="mt-2">
                <span
                  className={`text-xs font-semibold block truncate ${
                    isActive ? 'text-blue-900' : 'text-slate-800'
                  }`}
                >
                  {dim.label.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block truncate">
                  {dim.label.split(' ')[1] || ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 维度聚合摘要栏 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 text-xs">
        <div>
          <span className="text-slate-500 text-[11px]">当前维度累计 GMV</span>
          <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">
            ${summary.totalGmv.toLocaleString()} USD
          </p>
        </div>
        <div>
          <span className="text-slate-500 text-[11px]">出卡完成订单总量</span>
          <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">
            {summary.totalOrders.toLocaleString()} 笔
          </p>
        </div>
        <div>
          <span className="text-slate-500 text-[11px]">首单平均破冰转化率</span>
          <p className="text-sm font-bold font-mono text-blue-700 mt-0.5">
            {summary.avgConversion.toFixed(1)}%
          </p>
        </div>
        <div>
          <span className="text-slate-500 text-[11px]">30天平均复购留存率</span>
          <p className="text-sm font-bold font-mono text-emerald-700 mt-0.5">
            {summary.avgRetention.toFixed(1)}%
          </p>
        </div>
        <div>
          <span className="text-slate-500 text-[11px]">90天贡献毛利估算</span>
          <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">
            ${summary.totalProfit.toLocaleString()} USD
          </p>
        </div>
      </div>

      {/* 主体交互区域：左侧多维可视化列表/图表 (7列) + 右侧深度客群画像透视 (5列) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* 左侧 (7列)：可视化图表与数据行 */}
        <div className="xl:col-span-7 bg-slate-50/50 rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 min-h-[480px]">
          {/* 模式 1: 规模与GMV分布条形图 */}
          {visualMode === 'distribution' && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1.5 border-b border-slate-200/60 font-medium">
                <span>切片项目 / 代码</span>
                <div className="flex items-center gap-6">
                  <span>破冰 / 复购率</span>
                  <span>贡献GMV及占比</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {dataset.map((row) => {
                  const isSelected = selectedItem?.id === row.id;
                  const gmvPercent = summary.totalGmv > 0 ? (row.gmvUsd / summary.totalGmv) * 100 : 0;

                  return (
                    <div
                      key={row.id}
                      onClick={() => {
                        setSelectedItemId(row.id);
                        onShowToast(`已聚焦查看【${row.name}】详细画像`);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white hover:bg-slate-100/70 border-slate-200/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${row.iconBg} ${row.iconColor}`}>
                            <span className="material-symbols-outlined text-[18px]">{row.icon}</span>
                          </span>
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {row.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block truncate">
                              {row.code}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-5 text-right shrink-0">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 font-mono text-xs">
                              <span className="text-blue-700 font-semibold" title="首单破冰率">
                                {row.firstConversionRate.toFixed(1)}%
                              </span>
                              <span className="text-slate-300">/</span>
                              <span className="text-emerald-700 font-semibold" title="30天复购率">
                                {row.repeatRate30d.toFixed(1)}%
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">破冰 / 复购</span>
                          </div>

                          <div className="flex flex-col items-end w-24">
                            <span className="text-xs font-bold font-mono text-slate-900">
                              ${row.gmvUsd.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              占比 {gmvPercent.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 进度分布条 */}
                      <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(5, gmvPercent))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 模式 2: CAC 与留存效能象限散点图 */}
          {visualMode === 'quadrant' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold">获客成本 (CAC) 与 30天复购留存率 象限分析</span>
                <span className="text-[11px] text-slate-500">右上: 高留存高成本 · 左上: 核心标杆高留存低成本</span>
              </div>

              {/* 象限容器 */}
              <div className="relative bg-white rounded-xl border border-slate-200 p-4 h-[380px] flex flex-col justify-between overflow-hidden">
                {/* 象限十字背景线 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-px bg-slate-200" />
                  <div className="absolute h-full w-px bg-slate-200" />
                </div>

                {/* 象限标签 */}
                <div className="absolute top-2 left-3 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Q1: 核心标杆 (低CAC / 高留存)
                </div>
                <div className="absolute top-2 right-3 text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Q2: 大宗高潜 (高CAC / 高留存)
                </div>
                <div className="absolute bottom-2 left-3 text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Q3: 自然散客 (低CAC / 偏弱留存)
                </div>
                <div className="absolute bottom-2 right-3 text-[10px] font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Q4: 预警治理 (高CAC / 偏弱留存)
                </div>

                {/* 散点气泡映射 */}
                <div className="relative w-full h-full">
                  {dataset.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    // CAC 范围 0 ~ 45
                    const leftPercent = Math.min(92, Math.max(8, (item.cacUsd / 45) * 100));
                    // 复购率 0 ~ 100
                    const bottomPercent = Math.min(92, Math.max(8, item.repeatRate30d));

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItemId(item.id);
                          onShowToast(`已定位散点【${item.name}】`);
                        }}
                        style={{ left: `${leftPercent}%`, bottom: `${bottomPercent}%` }}
                        className={`absolute transform -translate-x-1/2 translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-700 ring-4 ring-blue-500/20 z-20 scale-110'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-blue-400 z-10'
                        }`}
                        title={`${item.name} - CAC: $${item.cacUsd}, 30D留存: ${item.repeatRate30d}%`}
                      >
                        <span className={`material-symbols-outlined text-[15px] ${isSelected ? 'text-white' : item.iconColor}`}>
                          {item.icon}
                        </span>
                        <div className="flex flex-col text-left">
                          <span className="text-[11px] font-bold truncate max-w-[110px] leading-tight">
                            {item.name.split(' ')[0]}
                          </span>
                          <span className={`text-[9px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            CAC ${item.cacUsd} · {item.repeatRate30d}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 模式 3: 全链路漏斗流失诊断 */}
          {visualMode === 'funnel' && (
            <div className="flex flex-col gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span className="font-semibold">各切片链路流失衰减诊断 (注册 → 破冰 → 30天复购)</span>
                <span className="text-[11px] text-slate-500">点击任意行查看右侧智能化运营建议</span>
              </div>

              <div className="flex flex-col gap-2">
                {dataset.map((row) => {
                  const isSelected = selectedItem?.id === row.id;
                  const dropRate = (100 - row.firstConversionRate).toFixed(1);

                  return (
                    <div
                      key={row.id}
                      onClick={() => {
                        setSelectedItemId(row.id);
                        onShowToast(`已聚焦【${row.name}】流失漏斗诊断`);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white hover:bg-slate-100/70 border-slate-200/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 truncate max-w-[240px]">
                          {row.name}
                        </span>
                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          <span className="text-slate-600">
                            新增 {row.newUsers.toLocaleString()} 人
                          </span>
                          <span className="text-blue-700 font-semibold">
                            破冰 {row.firstOrderUsers.toLocaleString()} 人 ({row.firstConversionRate}%)
                          </span>
                          <span className="text-rose-600 font-semibold">
                            破冰流失 {dropRate}%
                          </span>
                        </div>
                      </div>

                      {/* 漏斗流向进度条 */}
                      <div className="mt-2 w-full bg-slate-100 rounded-full h-2 flex overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all duration-300"
                          style={{ width: `${row.firstConversionRate}%` }}
                          title="首次破冰转化率"
                        />
                        <div
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{ width: `${(row.repeatRate30d * (row.firstConversionRate / 100))}%` }}
                          title="30天复购留存"
                        />
                        <div
                          className="bg-rose-200 h-full transition-all duration-300"
                          style={{ width: `${100 - row.firstConversionRate}%` }}
                          title="未破冰流失客群"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 右侧 (5列)：重点客群全景画像透视面板 (Customer Segment Deep Inspector) */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-slate-200/80 p-4.5 flex flex-col justify-between shadow-xs min-h-[480px]">
          {selectedItem ? (
            <div className="flex flex-col gap-4">
              {/* 卡片头部 */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${selectedItem.iconBg} ${selectedItem.iconColor}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{selectedItem.icon}</span>
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {selectedItem.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                      {selectedItem.code}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 shrink-0">
                  {selectedItem.retentionEvaluation} 评级
                </span>
              </div>

              {/* 核心指标矩阵网格 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">累计交易 GMV</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                    ${selectedItem.gmvUsd.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">折合约 ¥{(selectedItem.gmvUsd * 7.1).toLocaleString()}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">客单价 / ARPU</span>
                  <span className="text-base font-bold font-mono text-blue-700 mt-0.5 block">
                    ${selectedItem.arpuUsd.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">订单量 {selectedItem.orderCount.toLocaleString()} 笔</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">首单破冰率</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-bold font-mono text-slate-900">
                      {selectedItem.firstConversionRate.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">({selectedItem.firstOrderUsers}人)</span>
                  </div>
                  <span className="text-[10px] text-emerald-600">高效转化通道</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">30天复购率</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-bold font-mono text-emerald-700">
                      {selectedItem.repeatRate30d.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">({selectedItem.repeatUsers}人)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">稳定留存资产</span>
                </div>
              </div>

              {/* 经营效益与 CAC 诊断 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">单客获客成本 CAC:</span>
                  <span className="font-bold text-slate-900">${selectedItem.cacUsd.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">90天累计毛利贡献:</span>
                  <span className="font-bold text-emerald-700">${selectedItem.grossProfit90d.toLocaleString()} USD</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono pt-1.5 border-t border-slate-200/50">
                  <span className="text-slate-500">LTV / CAC 投资回报比:</span>
                  <span className="font-bold text-blue-700">
                    {selectedItem.cacUsd > 0 ? (selectedItem.grossProfit90d / (selectedItem.newUsers * selectedItem.cacUsd || 1)).toFixed(2) : '∞ (自然流量)'}x
                  </span>
                </div>
              </div>

              {/* 智能化运营诊断建议 */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/70 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-blue-900 text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">smart_toy</span>
                  <span>智能化运营策略建议</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {selectedItem.firstConversionRate > 60
                    ? `当前切片客群（${selectedItem.name}）转化极高，建议配置大宗专属加价汇率券，促成二级搬砖大客沉淀至私域 Telegram / WhatsApp 专群。`
                    : `当前切片客群首次破冰流失较高（${(100 - selectedItem.firstConversionRate).toFixed(1)}%），建议优化首单免核销门槛，并推送新人破冰补贴礼包。`}
                </p>
              </div>

              {/* 快捷操作区 */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenDrilldown(selectedItem)}
                    className="flex-1 h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">groups</span>
                    <span>穿透客户流水</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSwitchToReport(activeDimension)}
                    className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    title="在多维报表中透视当前维度"
                  >
                    <span className="material-symbols-outlined text-[16px] text-blue-600">table_chart</span>
                    <span>在多维报表中透视</span>
                  </button>
                </div>

                {activeDimension === 'tier' && onOpenTierRules && (
                  <button
                    type="button"
                    onClick={() => onOpenTierRules(selectedItem)}
                    className="w-full h-8 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer rounded-lg transition-colors border border-indigo-200/60"
                  >
                    <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                    <span>查看【{selectedItem.name}】画像准入规则与权益</span>
                  </button>
                )}

                {activeDimension === 'channel' && onOpenChannelLtv && (
                  <button
                    type="button"
                    onClick={() => onOpenChannelLtv(selectedItem)}
                    className="w-full h-8 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer rounded-lg transition-colors border border-emerald-200/60"
                  >
                    <span className="material-symbols-outlined text-[16px]">hub</span>
                    <span>查看【{selectedItem.name}】渠道深度留存与 LTV 回收</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onOpenProtectionPolicy}
                  className="w-full h-8 px-2 text-slate-600 hover:text-slate-900 text-xs flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px] text-amber-600">verified_user</span>
                  <span>配置分级保护与流失预警策略</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
              <span className="material-symbols-outlined text-4xl mb-2">touch_app</span>
              <p className="text-xs">请在左侧列表中点击任意项目查看深度画像</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
