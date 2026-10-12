import React, { useState, useMemo } from 'react';
import { QuoteProblemItem, QuoteMonitorStatus, SKUMerchantQuoteDetail } from './quoteTypes';
import { MOCK_QUOTE_PROBLEMS, DEFAULT_ANOMALY_RULES } from './mockQuoteData';

interface QuoteMonitorTabProps {
  showToast: (msg: string) => void;
  onNavigateToQuotes?: () => void;
  initialSubTab?: string;
}

export const QuoteMonitorTab: React.FC<QuoteMonitorTabProps> = ({
  showToast,
  onNavigateToQuotes
}) => {
  // 11.5.2 页面状态 6 大 Tabs
  const [activeTab, setActiveTab] = useState<QuoteMonitorStatus | '全部'>('全部');
  const [problemTypeFilter, setProblemTypeFilter] = useState<'ALL' | '平台级' | '商户级'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 问题工单列表数据
  const [problems, setProblems] = useState<QuoteProblemItem[]>(MOCK_QUOTE_PROBLEMS);

  // 当前选中待查看详情的 Quote Problem
  const [activeProblem, setActiveProblem] = useState<QuoteProblemItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 离线跟进弹窗 / 表单状态
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpMerchant, setFollowUpMerchant] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [expectedRecoveryTime, setExpectedRecoveryTime] = useState('15分钟内');

  // 规则配置查看 Modal
  const [showRuleModal, setShowRuleModal] = useState(false);

  // 11.5.6 默认排序逻辑：
  // 平台级异常 → 影响 GMV 高 → 异常持续时间长 → 价差大
  const sortedAndFilteredProblems = useMemo(() => {
    return problems
      .filter(item => {
        if (activeTab !== '全部' && item.status !== activeTab) return false;
        if (problemTypeFilter !== 'ALL' && item.problemType !== problemTypeFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSku = item.sku.formattedSKU.toLowerCase().includes(q) || item.sku.id.toLowerCase().includes(q);
          const matchBrand = item.sku.brand.toLowerCase().includes(q);
          const matchOwner = item.owner.toLowerCase().includes(q);
          if (!matchSku && !matchBrand && !matchOwner) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // 1. 平台级异常优先
        const aIsPlatform = a.problemType === '平台级' ? 2 : a.problemType === '商户级' ? 1 : 0;
        const bIsPlatform = b.problemType === '平台级' ? 2 : b.problemType === '商户级' ? 1 : 0;
        if (aIsPlatform !== bIsPlatform) return bIsPlatform - aIsPlatform;

        // 2. 影响 GMV 高
        if (b.affectedGmv !== a.affectedGmv) return b.affectedGmv - a.affectedGmv;

        // 3. 持续时间长
        if (b.durationMinutes !== a.durationMinutes) return b.durationMinutes - a.durationMinutes;

        // 4. 价差大 (绝对值)
        return Math.abs(b.gap) - Math.abs(a.gap);
      });
  }, [problems, activeTab, problemTypeFilter, searchQuery]);

  // 各状态计数
  const statusCounts = useMemo(() => {
    return {
      all: problems.length,
      normal: problems.filter(p => p.status === '正常').length,
      warning: problems.filter(p => p.status === '关注').length,
      pending: problems.filter(p => p.status === '异常待处理').length,
      processing: problems.filter(p => p.status === '处理中').length,
      recovered: problems.filter(p => p.status === '已恢复').length,
    };
  }, [problems]);

  // 触发全局机器人即时比价巡检
  const [isScanning, setIsScanning] = useState(false);
  const handleTriggerScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      showToast('🤖 报价巡检机器人比价完成：全网行情与商户报价已核对，更新 2 项算力差距！');
    }, 1200);
  };

  // 点击查看详情
  const handleOpenDetail = (item: QuoteProblemItem) => {
    setActiveProblem(item);
    setIsDetailOpen(true);
  };

  // 添加跟进记录 / 推进状态 (11.5.8 流程闭环)
  const handleAddFollowUpLog = () => {
    if (!activeProblem) return;
    const nowStr = new Date().toTimeString().split(' ')[0];
    const newLog = {
      time: nowStr,
      operator: '当前运营人员',
      action: '跟进干预',
      remark: `已线下联系商户【${followUpMerchant || '主要商户'}】：${followUpNote || '要求在收卡业务端提高报价'}（预计 ${expectedRecoveryTime} 完成改价）`
    };

    const updatedItem: QuoteProblemItem = {
      ...activeProblem,
      status: '处理中',
      auditLogs: [newLog, ...activeProblem.auditLogs]
    };

    setProblems(prev => prev.map(p => p.id === activeProblem.id ? updatedItem : p));
    setActiveProblem(updatedItem);
    setShowFollowUpModal(false);
    setFollowUpNote('');
    showToast(`已成功录入跟进动作，工单状态已切换为【处理中】`);
  };

  // 自动复核（模拟商户在收卡业务端改价回流，机器人重新比价）
  const handleRobotRecheck = (problemItem: QuoteProblemItem) => {
    showToast(`🤖 机器人启动比价核验...`);
    setTimeout(() => {
      const nowStr = new Date().toTimeString().split(' ')[0];
      const newLog = {
        time: nowStr,
        operator: '报价复核机器人',
        action: '比价核销',
        remark: '最新商户报价回流：商户最高报价已提升至目标价以上，差异消除，系统自动恢复状态。'
      };

      const recoveredItem: QuoteProblemItem = {
        ...problemItem,
        status: '已恢复',
        recoveryTime: nowStr,
        bestMerchantPrice: Number((problemItem.targetPrice + 0.30).toFixed(2)),
        gap: 0.30,
        competitiveness: '正常',
        auditLogs: [newLog, ...problemItem.auditLogs]
      };

      setProblems(prev => prev.map(p => p.id === problemItem.id ? recoveredItem : p));
      if (activeProblem?.id === problemItem.id) {
        setActiveProblem(recoveredItem);
      }
      showToast(`✅ 复核成功！SKU【${problemItem.sku.formattedSKU}】已自动恢复为【已恢复】健康状态！`);
    }, 1000);
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 11.5.1 核心工作台 - 顶部定位说明与控制栏 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">visibility</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">报价监控工作台 (核心运营工作台)</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-mono text-[10px] font-semibold">
                自动巡检比价引擎
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              系统自动把外部市场行情与平台各商户报价进行比较，识别缺乏竞争力的 SKU，并推动问题快速恢复。
            </p>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-600 font-mono flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <strong>系统：</strong> 持续监控 ➔ 自动计算 ➔ 自动判断 ➔ 自动排序
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <strong>人工：</strong> 运营/客服干预 ➔ 线下联系 ➔ 推动商户在收卡端改价
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowRuleModal(true)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">tune</span>
            <span>规则配置参数</span>
          </button>
          <button
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isScanning ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isScanning ? '巡检比价中...' : '触发机器人即时比价'}</span>
          </button>
        </div>
      </div>

      {/* 11.5.3 竞争力计算逻辑 & 11.5.5 单商户与平台问题区分 说明横栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* 左侧：竞争力推导公式 */}
        <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-400 text-[18px]">calculate</span>
              <span className="font-bold text-white">报价竞争力推导公式:</span>
            </div>
            <button
              onClick={() => showToast('规则参数可前往【平台配置 ➔ 规则配置 ➔ 报价规则】自定义调整')}
              className="text-[11px] text-blue-300 hover:underline font-mono"
            >
              配置阈值 →
            </button>
          </div>
          <div className="bg-white/5 p-2.5 rounded-lg font-mono text-[11px] flex items-center justify-between gap-1 overflow-x-auto text-slate-200">
            <span>外部市场价</span>
            <span className="text-slate-500">➔</span>
            <span>用户目标价</span>
            <span className="text-slate-500">➔</span>
            <span>平台利润</span>
            <span className="text-slate-500">➔</span>
            <span className="font-bold text-amber-300">商户目标底线 (Target Threshold)</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-300">
            <span>4 级竞争力：</span>
            <div className="flex items-center gap-1 font-semibold text-[10px]">
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">优势</span>
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">正常</span>
              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">关注</span>
              <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">异常</span>
            </div>
          </div>
        </div>

        {/* 右侧：单商户异常 vs 平台级异常 */}
        <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-rose-400 text-[18px]">emergency_home</span>
              <span className="font-bold text-white">单商户问题 VS 平台级问题判定:</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">自动分级·按需响应</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-rose-500/10 border border-rose-500/30 p-2 rounded-lg">
              <strong className="text-rose-300 block font-bold">🚨 平台级SKU报价异常</strong>
              <p className="text-slate-300 text-[10px] mt-0.5">
                多个主要商户均无优势，全网丢单风险高。<strong>最高优先级提醒运营与客服！</strong>
              </p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg">
              <strong className="text-amber-300 block font-bold">⚠️ 商户级异常</strong>
              <p className="text-slate-300 text-[10px] mt-0.5">
                仅个别商户报价偏弱，平台整体仍有竞争力。<strong>优先级较低，线下日常跟进。</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 11.5.2 6 大状态 Tab 切换栏 (按规范无 static pill) */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-2 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* 6 大 Tab 切换按钮 */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg shrink-0">
          {[
            { id: '全部', label: '全部', count: statusCounts.all },
            { id: '正常', label: '🟢 正常', count: statusCounts.normal },
            { id: '关注', label: '🟡 关注', count: statusCounts.warning },
            { id: '异常待处理', label: '🔴 异常待处理', count: statusCounts.pending, highlight: true },
            { id: '处理中', label: '⚡ 处理中', count: statusCounts.processing },
            { id: '已恢复', label: '✅ 已恢复', count: statusCounts.recovered },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isActive
                      ? tab.highlight ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-800'
                      : 'text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 筛选与搜索 */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={problemTypeFilter}
            onChange={e => setProblemTypeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">全部问题级别</option>
            <option value="平台级">仅看 平台级异常 (高优先)</option>
            <option value="商户级">仅看 商户级异常</option>
          </select>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[15px]">
              search
            </span>
            <input
              type="text"
              placeholder="搜索 SKU、卡种或负责人..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 w-52"
            />
          </div>
        </div>
      </section>

      {/* 11.5.6 报价监控列表 (PRD 主表字段 + 默认排序) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-xs">报价监控工作台列表</h3>
            <span className="text-slate-400 text-[11px]">
              (默认按: <strong className="text-slate-700 font-mono">平台级异常 ➔ 高GMV ➔ 持续时间 ➔ 价差缺口</strong> 排序)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            共匹配 {sortedAndFilteredProblems.length} 项监控记录
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold whitespace-nowrap">
                <th className="py-2.5 px-3">SKU 标准标的</th>
                <th className="py-2.5 px-3 text-right">市场参考价</th>
                <th className="py-2.5 px-3 text-right">平台目标价</th>
                <th className="py-2.5 px-3 text-right">当前最高报价</th>
                <th className="py-2.5 px-3 text-right">价差 (Gap)</th>
                <th className="py-2.5 px-3 text-center">有效商户数</th>
                <th className="py-2.5 px-3 text-center">异常商户/占比</th>
                <th className="py-2.5 px-3 text-center">问题级别</th>
                <th className="py-2.5 px-3 text-center">竞争力</th>
                <th className="py-2.5 px-3 text-center">异常持续</th>
                <th className="py-2.5 px-3">Owner 负责人</th>
                <th className="py-2.5 px-3">当前状态</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {sortedAndFilteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400 font-sans">
                    暂无符合条件的报价监控记录
                  </td>
                </tr>
              ) : (
                sortedAndFilteredProblems.map(item => {
                  const isPlatformLevel = item.problemType === '平台级';
                  const isGapNegative = item.gap < 0;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        isPlatformLevel && item.status === '异常待处理'
                          ? 'bg-rose-50/30'
                          : item.status === '处理中'
                          ? 'bg-amber-50/20'
                          : ''
                      }`}
                    >
                      {/* SKU */}
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-slate-900">{item.sku.formattedSKU}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{item.id}</span>
                          <span>·</span>
                          <span>GMV: ${item.affectedGmv.toLocaleString()}/日</span>
                        </div>
                      </td>

                      {/* 市场参考价 */}
                      <td className="py-3 px-3 text-right font-bold text-slate-600">
                        {item.marketPrice.toFixed(2)}%
                      </td>

                      {/* 平台目标价 */}
                      <td className="py-3 px-3 text-right font-bold text-slate-800">
                        {item.targetPrice.toFixed(2)}%
                      </td>

                      {/* 当前最高报价 */}
                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        {item.bestMerchantPrice.toFixed(2)}%
                      </td>

                      {/* 价差 (Gap) */}
                      <td className="py-3 px-3 text-right font-black">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            isGapNegative
                              ? 'bg-rose-50 text-rose-700 border border-rose-200/80 font-bold'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                          }`}
                        >
                          {item.gap > 0 ? `+${item.gap.toFixed(2)}` : item.gap.toFixed(2)}pp
                        </span>
                      </td>

                      {/* 有效商户数 */}
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {item.totalMerchantCount} 家
                      </td>

                      {/* 异常商户 / 占比 */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-bold ${
                            item.affectedMerchantCount > 0 ? 'text-rose-600' : 'text-slate-400'
                          }`}
                        >
                          {item.affectedMerchantCount} 家 ({item.anomalyRatio}%)
                        </span>
                      </td>

                      {/* 问题级别 (11.5.5) */}
                      <td className="py-3 px-3 text-center font-sans">
                        {item.problemType === '平台级' ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap">
                            🚨 平台级异常
                          </span>
                        ) : item.problemType === '商户级' ? (
                          <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
                            ⚠️ 商户级异常
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">正常</span>
                        )}
                      </td>

                      {/* 竞争力 */}
                      <td className="py-3 px-3 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.competitiveness === '优势'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : item.competitiveness === '正常'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                              : item.competitiveness === '关注'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          }`}
                        >
                          {item.competitiveness}
                        </span>
                      </td>

                      {/* 异常持续 */}
                      <td className="py-3 px-3 text-center font-mono text-slate-600">
                        {item.durationMinutes} 分钟
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-3 font-sans text-slate-700 font-medium">
                        {item.owner}
                      </td>

                      {/* 当前状态 */}
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === '异常待处理'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200/80 animate-pulse'
                              : item.status === '处理中'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                              : item.status === '已恢复'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : item.status === '关注'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                              : 'bg-slate-100 text-slate-700 border border-slate-200/80'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* 操作 */}
                      <td className="py-3 px-3 text-right font-sans whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                            item.status === '异常待处理'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                              : item.status === '处理中'
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {item.status === '异常待处理' ? '立即处置' : '查看详情'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 11.5.7 异常详情 Drawer / Modal (包含 6 大部分) */}
      {isDetailOpen && activeProblem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-rose-400 text-[24px]">visibility</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{activeProblem.sku.formattedSKU}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-200 border border-white/20">
                      {activeProblem.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    监控状态: <strong className="text-amber-300">{activeProblem.status}</strong> · Owner: {activeProblem.owner}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDetailOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
              {/* 问题概览 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">analytics</span>
                    <span>异常与报价核心指标概览</span>
                  </h4>
                  <span className="font-mono text-[11px] text-slate-500">
                    影响 GMV: <strong className="text-slate-800">${activeProblem.affectedGmv.toLocaleString()}/日</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 text-[10px] block">外部市场参考价</span>
                    <span className="font-bold text-sm text-slate-800 block mt-0.5">{activeProblem.marketPrice.toFixed(2)}%</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 text-[10px] block">平台目标价</span>
                    <span className="font-bold text-sm text-slate-800 block mt-0.5">{activeProblem.targetPrice.toFixed(2)}%</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 text-[10px] block">当前最高商户报价</span>
                    <span className="font-bold text-sm text-blue-700 block mt-0.5">{activeProblem.bestMerchantPrice.toFixed(2)}%</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 text-[10px] block">价差缺口 (Gap)</span>
                    <span className={`font-bold text-sm block mt-0.5 ${activeProblem.gap < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {activeProblem.gap > 0 ? `+${activeProblem.gap.toFixed(2)}` : activeProblem.gap.toFixed(2)}pp
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono pt-1">
                  <span>异常商户覆盖: <strong className="text-rose-600">{activeProblem.affectedMerchantCount} / {activeProblem.totalMerchantCount} 家 ({activeProblem.anomalyRatio}%)</strong></span>
                  <span>持续时间: <strong className="text-slate-800">{activeProblem.durationMinutes} 分钟</strong></span>
                </div>
              </div>

              {/* 系统判断说明 */}
              <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5 flex items-start gap-3">
                <span className="material-symbols-outlined text-rose-600 text-[20px] shrink-0 mt-0.5">smart_toy</span>
                <div>
                  <h5 className="font-bold text-rose-900 text-xs">机器人比价与规则引擎诊断说明</h5>
                  <p className="text-rose-800 text-[11px] mt-1 font-mono leading-relaxed">
                    {activeProblem.systemVerdict}
                  </p>
                </div>
              </div>

              {/* 商户报价列表 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-indigo-600 text-[18px]">store</span>
                    <span>关联商户明细报价矩阵</span>
                  </h4>
                  <span className="text-slate-400 text-[10px] font-mono">商户实际报价由商户在收卡业务端维护</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-mono">
                        <th className="py-2 px-3">排名</th>
                        <th className="py-2 px-3">商户名称</th>
                        <th className="py-2 px-3 text-right">当前报价</th>
                        <th className="py-2 px-3 text-right">与最优价差</th>
                        <th className="py-2 px-3 text-right">与市场价差</th>
                        <th className="py-2 px-3 text-center">接单状态</th>
                        <th className="py-2 px-3 text-right">成功率</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {activeProblem.merchantQuotesList.map(m => (
                        <tr key={m.merchantId} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-500">#{m.rank}</td>
                          <td className="py-2 px-3 font-sans font-semibold text-slate-800">
                            {m.merchantName}
                            <span className="text-[10px] text-slate-400 font-mono ml-1">({m.merchantTier})</span>
                          </td>
                          <td className="py-2 px-3 text-right font-black text-slate-900">{m.currentQuote.toFixed(2)}%</td>
                          <td className="py-2 px-3 text-right font-semibold text-slate-600">
                            {m.bestPriceDiff === 0 ? '最优' : `${m.bestPriceDiff.toFixed(2)}pp`}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-slate-600">
                            {m.marketPriceDiff ? `${m.marketPriceDiff > 0 ? '+' : ''}${m.marketPriceDiff.toFixed(2)}pp` : '-'}
                          </td>
                          <td className="py-2 px-3 text-center font-sans">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              {m.acceptanceStatus}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-800">{m.successRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 市场趋势与比价走势 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">show_chart</span>
                  <span>外部市场价 VS 平台最高报价 24h 走势对比</span>
                </h4>
                <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded bg-blue-400 inline-block"></span> 外部市场参考价
                      <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block"></span> 平台最高商户报价
                    </span>
                    <span>近 24 小时监控打点</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {activeProblem.trendData.map((td, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-300">
                          <span>{td.time}</span>
                          <span>市场: <strong className="text-blue-300">{td.marketPrice}%</strong> · 平台最高: <strong className="text-amber-300">{td.bestMerchantPrice}%</strong></span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                          <div className="bg-blue-500 h-full transition-all" style={{ width: `${td.marketPrice}%` }}></div>
                          <div className="bg-amber-500 h-full transition-all opacity-80" style={{ width: `${td.bestMerchantPrice}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 处理记录 & 离线干预跟进 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-purple-600 text-[18px]">assignment_turned_in</span>
                    <span>问题处置与线下沟通跟进日志</span>
                  </h4>
                  <button
                    onClick={() => {
                      setFollowUpMerchant(activeProblem.merchantQuotesList[0]?.merchantName || '');
                      setShowFollowUpModal(true);
                    }}
                    className="px-3 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[15px]">add_comment</span>
                    <span>录入线下沟通跟进</span>
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  {activeProblem.auditLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 pb-2 border-b border-slate-200/60 last:border-0 last:pb-0 font-mono text-[11px]">
                      <span className="text-slate-400 shrink-0 mt-0.5">{log.time}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 font-bold shrink-0">{log.action}</span>
                      <div className="flex-1 font-sans text-slate-700">
                        <strong className="text-slate-900">{log.operator}:</strong> {log.remark}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    showToast(`已向商户【${activeProblem.affectedMerchantNames.join('、')}】的收卡端推送调价预警通知！`);
                  }}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-600">send</span>
                  <span>推送收卡端催办通知</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* 自动复核按钮 */}
                <button
                  onClick={() => handleRobotRecheck(activeProblem)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">published_with_changes</span>
                  <span>机器人重新比价 (试复核)</span>
                </button>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 录入沟通跟进 Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">support_agent</span>
                <span>录入线下联系跟进记录</span>
              </h3>
              <button onClick={() => setShowFollowUpModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <div>
                <label className="block text-slate-600 font-medium mb-1">沟通的目标商户</label>
                <input
                  type="text"
                  value={followUpMerchant}
                  onChange={e => setFollowUpMerchant(e.target.value)}
                  placeholder="如：招财进宝数卡科技"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">预计改价恢复时间</label>
                <select
                  value={expectedRecoveryTime}
                  onChange={e => setExpectedRecoveryTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs cursor-pointer"
                >
                  <option value="15分钟内">15 分钟内</option>
                  <option value="30分钟内">30 分钟内</option>
                  <option value="1小时内">1 小时内</option>
                  <option value="半天内">半天内</option>
                  <option value="待商户排期">待商户排期</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">跟进记录与商户反馈说明</label>
                <textarea
                  rows={3}
                  value={followUpNote}
                  onChange={e => setFollowUpNote(e.target.value)}
                  placeholder="例如：已通过微信联系商户负责人，商户同意将 Apple US $100 报价由 83.1% 提升至 84.8%..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleAddFollowUpLog}
                className="px-4 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer transition-colors shadow-2xs"
              >
                保存并切换为【处理中】
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 规则配置参数 Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">rule</span>
                <span>报价监控判定规则阈值配置 (非硬编码)</span>
              </h3>
              <button onClick={() => setShowRuleModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <p className="text-slate-500 text-[11px] font-sans">
                具体竞争力等级与异常升级阈值统一进入【平台配置 ➔ 规则配置 ➔ 报价规则】进行统一设置。
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">价差倒挂阈值</span>
                  <span className="font-bold text-slate-900 block mt-0.5">&gt; {DEFAULT_ANOMALY_RULES.diffThresholdPp} pp</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">异常商户门槛</span>
                  <span className="font-bold text-slate-900 block mt-0.5">&ge; {DEFAULT_ANOMALY_RULES.minAnomalyMerchants} 家</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">平台级升级占比</span>
                  <span className="font-bold text-slate-900 block mt-0.5">&gt; {DEFAULT_ANOMALY_RULES.anomalyRatioThreshold}%</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">未自愈超时限额</span>
                  <span className="font-bold text-slate-900 block mt-0.5">&gt; {DEFAULT_ANOMALY_RULES.durationThresholdMinutes} 分钟</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowRuleModal(false);
                  showToast('已跳转或已定位至【10 平台配置 ➔ 规则配置】');
                }}
                className="px-4 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer"
              >
                前往【规则配置】编辑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
