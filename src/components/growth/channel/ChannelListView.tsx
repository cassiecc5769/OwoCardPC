import React, { useState, useEffect } from 'react';
import { ChannelItem } from './types';

interface ChannelListViewProps {
  channels: ChannelItem[];
  onSelectChannel: (channel: ChannelItem) => void;
  onOpenNewChannel: () => void;
  onOpenLinkModal: (channel: ChannelItem) => void;
  onToggleStatus: (channelId: string) => void;
  onOpenRules: () => void;
  onOpenRebalance: () => void;
  onShowToast: (msg: string) => void;
}

export const ChannelListView: React.FC<ChannelListViewProps> = ({
  channels,
  onSelectChannel,
  onOpenNewChannel,
  onOpenLinkModal,
  onToggleStatus,
  onOpenRules,
  onOpenRebalance,
  onShowToast
}) => {
  const [activeSegment, setActiveSegment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedConvRate, setSelectedConvRate] = useState('');
  const [selectedTimeWindow, setSelectedTimeWindow] = useState('7d');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [refreshCountdown, setRefreshCountdown] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Auto refresh timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) return 10;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter channels
  const filteredChannels = channels.filter(ch => {
    if (activeSegment === 'ads' && ch.type !== '社媒广告') return false;
    if (activeSegment === 'kol' && ch.type !== '社群合作' && ch.type !== '官方私域') return false;
    if (activeSegment === 'offline' && ch.type !== '线下物料') return false;
    if (activeSegment === 'direct' && ch.type !== '自然搜索流量') return false;
    if (activeSegment === 'high-roi') {
      const isHighRoi = ch.roi.includes('1:3') || ch.roi.includes('1:4') || ch.roi.includes('1:5') || ch.roi.includes('∞');
      if (!isHighRoi) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        ch.name.toLowerCase().includes(q) ||
        ch.id.toLowerCase().includes(q) ||
        ch.manager.toLowerCase().includes(q) ||
        ch.shortUrl.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedType && ch.type !== selectedType) return false;

    if (selectedStatus) {
      if (selectedStatus === 'active' && ch.status !== '投放中' && ch.status !== '活跃中' && ch.status !== '正常') return false;
      if (selectedStatus === 'paused' && ch.status !== '已暂停') return false;
    }

    if (selectedConvRate) {
      const rateVal = parseFloat(ch.firstOrderConvRate);
      if (selectedConvRate === 'high' && rateVal < 20) return false;
      if (selectedConvRate === 'mid' && (rateVal < 10 || rateVal >= 20)) return false;
      if (selectedConvRate === 'low' && rateVal >= 10) return false;
    }

    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredChannels.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchCopy = () => {
    if (selectedIds.length === 0) {
      onShowToast('请先勾选需要批量复制的渠道');
      return;
    }
    const links = channels
      .filter(c => selectedIds.includes(c.id))
      .map(c => `${c.name}: ${c.fullUrl}`)
      .join('\n');
    navigator.clipboard.writeText(links);
    onShowToast(`已批量复制 ${selectedIds.length} 个渠道的完整追踪链接！`);
  };

  const handleBatchToggleStatus = () => {
    if (selectedIds.length === 0) {
      onShowToast('请先勾选需要批量操作的渠道');
      return;
    }
    selectedIds.forEach(id => onToggleStatus(id));
    onShowToast(`已批量更新 ${selectedIds.length} 个渠道的投放状态！`);
  };

  const handleCopyLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    onShowToast(`已复制短链: ${url}`);
  };

  const handleExport = () => {
    onShowToast('正在生成西非全域渠道 ROI 归因分析报表 (Excel)...');
    setTimeout(() => {
      onShowToast('报表生成完毕，已启动离线下载！');
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-[#0b1c30] antialiased">
      {/* 顶部统一业务标头 */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              01 渠道管理 · 全域归因与流量 ROI 监控台
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[11px] font-semibold border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              REAL-TIME ATTRIBUTION ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            支持对社媒广告、KOL 社群、线下地推及自营私域等全渠道引流、转化率与 CAC 获客成本进行毫秒级归因与动态预算调优
          </p>
        </div>

        {/* Quick Action Cluster */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <div
            onClick={() => setRefreshCountdown(10)}
            className="flex items-center gap-1.5 px-2.5 h-9 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px] border border-slate-200/80 cursor-pointer hover:bg-slate-200/60 transition-colors"
            title="点击立即刷新数据"
          >
            <span className="material-symbols-outlined text-[15px] text-emerald-600 animate-spin">sync</span>
            <span>数据刷新: <strong className="text-slate-900 font-mono">{refreshCountdown}s</strong></span>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span>导出渠道报表</span>
          </button>
          <button
            onClick={onOpenNewChannel}
            className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>新建获客渠道</span>
          </button>
        </div>
      </header>

      {/* KPI Metric Board (PRD 3.2 4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Tile 1: Total Channels */}
        <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              全网累计获客渠道 (TOTAL CHANNELS)
            </span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200/60">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>+14.2%
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-slate-900 tracking-tight">28</span>
            <span className="text-xs text-slate-500">个已建档有效源</span>
          </div>
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 -mx-4 -mb-4 px-4 py-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>广告投放 12
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>社群 6
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>自然/自营 10
            </span>
          </div>
        </div>

        {/* Tile 2: Traffic Volume */}
        <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              累计引流访问 UV (TRAFFIC VOLUME)
            </span>
            <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-200/60">
              99.8% 有效反作弊
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-slate-900 tracking-tight">1,428,500</span>
            <span className="text-xs text-slate-500">UV</span>
          </div>
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 -mx-4 -mb-4 px-4 py-2 border-t border-slate-100">
            <span>今日新增: <strong className="font-mono text-slate-900">+38,420 UV</strong></span>
            <span className="font-mono text-slate-400">落地耗时 avg 180ms</span>
          </div>
        </div>

        {/* Tile 3: Channel Attributed GMV */}
        <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              撬动出卡交易 GMV (ATTRIBUTED GMV)
            </span>
            <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold border border-blue-200/60">
              归因周期 30D
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-blue-600 tracking-tight">$842,650.00</span>
            <span className="font-mono text-xs text-slate-400">USD</span>
          </div>
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 -mx-4 -mb-4 px-4 py-2 border-t border-slate-100">
            <span className="font-mono text-slate-700">≈ ₦1,247,122,000 NGN</span>
            <span className="font-mono font-medium text-emerald-600">核销 11,420 笔</span>
          </div>
        </div>

        {/* Tile 4: CAC & ROI */}
        <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              全网平均获客成本 (CAC & ROI)
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold tracking-wider">
              ROI 1:4.82 极优
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-slate-900 tracking-tight">$2.15</span>
            <span className="text-xs text-slate-500">/ 首单有效用户</span>
          </div>
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 -mx-4 -mb-4 px-4 py-2 border-t border-slate-100">
            <span>首单综合转化率: <strong className="font-mono text-emerald-600 font-bold">14.80%</strong></span>
            <span className="font-mono text-slate-400">回本周转 4.2天</span>
          </div>
        </div>
      </div>

      {/* Operational Filter & Capsule Navigator */}
      <div className="flex flex-col gap-3 bg-white p-4 rounded-xl shadow-xs border border-slate-200/80">
        {/* Stream Segment Capsules */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveSegment('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeSegment === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              全部渠道 (28)
            </button>
            <button
              onClick={() => setActiveSegment('ads')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeSegment === 'ads'
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              社媒广告 (12)
            </button>
            <button
              onClick={() => setActiveSegment('kol')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeSegment === 'kol'
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              KOL与社群 (6)
            </button>
            <button
              onClick={() => setActiveSegment('offline')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeSegment === 'offline'
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              线下物料 (4)
            </button>
            <button
              onClick={() => setActiveSegment('direct')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeSegment === 'direct'
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              自然自营 (6)
            </button>
            <button
              onClick={() => setActiveSegment('high-roi')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeSegment === 'high-roi'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>高ROI标杆 (&gt;1:4.0)</span>
            </button>
          </div>

          <div
            onClick={onOpenRules}
            className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 hover:text-blue-600 cursor-pointer bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">analytics</span>
            <span>归因模型: <strong>首触点优先 (First-touch 70% + Last-touch 30%)</strong></span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">help</span>
          </div>
        </div>

        {/* Inputs and Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-0.5 text-xs">
          {/* Search Field */}
          <div className="lg:col-span-4 relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索渠道名称 / 渠道ID / 追踪参数 / 负责人..."
              className="w-full h-9 pl-9 pr-3 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Type Select */}
          <div className="lg:col-span-2">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 focus:bg-white text-slate-800 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="">所有渠道类型</option>
              <option value="社媒广告">社媒广告 (TikTok/FB/Insta)</option>
              <option value="官方私域">官方私域 (WhatsApp/Telegram)</option>
              <option value="社群合作">KOL与合伙人社群</option>
              <option value="线下物料">线下档口物料 (Ikeja/Alaba)</option>
              <option value="自然搜索流量">自然自营与老带新</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="lg:col-span-2">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 focus:bg-white text-slate-800 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="">渠道状态: 全部</option>
              <option value="active">投放中 / 活跃</option>
              <option value="paused">已暂停</option>
            </select>
          </div>

          {/* Conversion Rate Select */}
          <div className="lg:col-span-2">
            <select
              value={selectedConvRate}
              onChange={e => setSelectedConvRate(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 focus:bg-white text-slate-800 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="">首单转化率区间: 不限</option>
              <option value="high">&gt; 20% (爆款链路)</option>
              <option value="mid">10% - 20% (健康)</option>
              <option value="low">&lt; 10% (需优化排查)</option>
            </select>
          </div>

          {/* Time Window Select */}
          <div className="lg:col-span-2 relative">
            <select
              value={selectedTimeWindow}
              onChange={e => setSelectedTimeWindow(e.target.value)}
              className="w-full h-9 pl-2.5 pr-7 bg-slate-50 focus:bg-white text-slate-800 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="today">今日实时数据</option>
              <option value="7d">近 7 天累积</option>
              <option value="month">本月自然月</option>
              <option value="custom">自定义日历跨度</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-slate-400 text-[16px] pointer-events-none">
              calendar_today
            </span>
          </div>
        </div>
      </div>

      {/* Channel Deep Audit Data Table (PRD 3.2 Matrix) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Table Header Info Line */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-slate-900">渠道全生命周期漏斗转化清单</span>
            <span className="font-mono text-[11px] text-slate-500 px-2 py-0.5 rounded bg-slate-200/60 font-medium">
              已检索 {filteredChannels.length} 条重点核算项 / 共 {channels.length} 项
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-xs">
            <button
              onClick={() => onShowToast('已重置默认列宽自适应显示')}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">view_column</span>
              <span>自定义列宽</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('');
                setSelectedStatus('');
                setSelectedConvRate('');
                setActiveSegment('all');
                onShowToast('已重置全部筛选条件');
              }}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              <span>重置过滤</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider select-none border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredChannels.length}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded accent-blue-600 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3">渠道ID</th>
                <th className="py-2.5 px-3 min-w-[200px]">渠道名称与类型</th>
                <th className="py-2.5 px-3 min-w-[200px]">落地页短链与参数</th>
                <th className="py-2.5 px-3 text-right">累计访问 UV</th>
                <th className="py-2.5 px-3 text-right">注册用户数</th>
                <th className="py-2.5 px-3 text-right">首次报价率</th>
                <th className="py-2.5 px-3 text-right">交易用户数</th>
                <th className="py-2.5 px-3 text-right">首单转化率</th>
                <th className="py-2.5 px-3 text-right">累计出卡 GMV</th>
                <th className="py-2.5 px-3 text-right">获客成本 CAC</th>
                <th className="py-2.5 px-3 text-center">状态</th>
                <th className="py-2.5 px-3 text-right min-w-[150px]">操作</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 divide-y divide-slate-100">
              {filteredChannels.map(row => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelectChannel(row)}
                    className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(row.id)}
                        className="rounded accent-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-600">{row.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[220px]">
                          {row.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-600">
                            {row.type}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {row.manager}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 max-w-[220px]">
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded truncate">
                          {row.shortUrl}
                        </span>
                        <button
                          onClick={e => handleCopyLink(row.fullUrl, e)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="复制完整追踪链接"
                        >
                          <span className="material-symbols-outlined text-[15px]">content_copy</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">
                      {row.uv.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono font-medium text-slate-900">{row.registered.toLocaleString()}</span>
                        <span className="font-mono text-[10px] text-slate-400">{row.registeredRate}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{row.quoteRate}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900">
                      {row.tradingUsers.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <span className={`font-mono font-bold ${
                          parseFloat(row.firstOrderConvRate) >= 15 ? 'text-emerald-600' : 'text-slate-700'
                        }`}>
                          {row.firstOrderConvRate}
                        </span>
                        {parseFloat(row.firstOrderConvRate) >= 15 && (
                          <span className="material-symbols-outlined text-[14px] text-emerald-600">trending_up</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ${row.gmv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      <span className={row.cac > 2.5 ? 'text-rose-600' : 'text-blue-600'}>
                        ${row.cac.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                        row.status === '已暂停'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${row.status === '已暂停' ? 'bg-slate-400' : 'bg-emerald-500'}`}></span>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectChannel(row)}
                          className="px-2 py-1 rounded bg-blue-600 text-white font-medium text-[11px] hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          详情
                        </button>
                        <button
                          onClick={() => onOpenLinkModal(row)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
                        >
                          链接配置
                        </button>
                        <button
                          onClick={() => onToggleStatus(row.id)}
                          className={`px-1.5 py-1 rounded font-medium text-[11px] transition-colors cursor-pointer ${
                            row.status === '已暂停'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {row.status === '已暂停' ? '启用' : '暂停'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Comprehensive Pagination */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Left Batch Operations */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleBatchCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-[11px] transition-all shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">content_copy</span>
                <span>批量复制追踪链接</span>
              </button>
              <button
                onClick={handleBatchToggleStatus}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-[11px] transition-all shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">pause_circle</span>
                <span>批量启停</span>
              </button>
            </div>
            <span className="font-mono text-[11px] text-slate-400">已勾选 {selectedIds.length} 项</span>
          </div>

          {/* Right Pagination Controls */}
          <div className="flex items-center gap-4">
            <span className="text-slate-500">共 <strong className="font-mono text-slate-900">{channels.length}</strong> 个渠道</span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-7 h-7 flex items-center justify-center rounded-md font-mono text-[11px] font-semibold cursor-pointer transition-colors ${
                    currentPage === num
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                disabled={currentPage === 4}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, 4))}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
            <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
              <span>前往</span>
              <input
                type="text"
                defaultValue={currentPage}
                className="w-9 h-7 text-center rounded-md border border-slate-200 bg-white text-slate-900 font-mono text-xs outline-none"
              />
              <span>页</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Conversion Funnel & ROI Diagnostics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Visual Funnel Breakdown */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">filter_alt</span>
              <span className="font-semibold text-xs text-slate-900">
                全域获客漏斗折损全景 (Attribution Health Funnel)
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">基准转化基线: 12.0%</span>
          </div>

          {/* Funnel Progress Bars */}
          <div className="flex flex-col gap-3 my-3 text-xs">
            {/* Stage 1 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-800 font-medium">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-mono text-[10px] font-bold">1</span>
                  访问进入 (UV Landing)
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  1,428,500 <span className="text-slate-400 font-normal text-[11px]">(100%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-800 font-medium">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono text-[10px] font-bold">2</span>
                  手机/邮件注册 (Registered)
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  129,420 <span className="text-emerald-700 font-semibold text-[11px]">(折损率 90.9%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '9.05%' }}></div>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-800 font-medium">
                  <span className="w-5 h-5 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center font-mono text-[10px] font-bold">3</span>
                  首次卡种询价 (Quotation Triggered)
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  68,240 <span className="text-emerald-700 font-semibold text-[11px]">(注册激活 52.7%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '4.77%' }}></div>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-800 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-mono text-[10px] font-bold">4</span>
                  首单成功核销出卡 (First Paid Deal)
                </span>
                <span className="font-mono font-bold text-emerald-600">
                  22,560 <span className="text-emerald-700 font-bold text-[11px]">(综合总转化 1.58%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '1.58%' }}></div>
              </div>
            </div>
          </div>

          {/* Sub Insights Indicator */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-slate-500 font-mono text-[11px] gap-2">
            <span>* 诊断建议: 落地页到首单转化健康，建议加大 WhatsApp 与 Ikeja 线下物料预算倾斜。</span>
            <button
              onClick={onOpenRules}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              查看归因模型规则 &gt;
            </button>
          </div>
        </div>

        {/* Right Quick ROI Benchmarking Card */}
        <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-semibold text-xs text-slate-900">投放回报率 (ROI) 梯队分布</span>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">info</span>
            </div>

            <div className="space-y-2.5 my-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">第一梯队 (ROI &gt; 1:4.0)</span>
                  <span className="font-mono text-[10px] text-slate-400">WhatsApp 私域 / 电脑城档口</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-600">6 个渠道</span>
                  <div className="font-mono text-[10px] text-slate-400">贡献 62% GMV</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">第二梯队 (ROI 1:2.0 ~ 1:4.0)</span>
                  <span className="font-mono text-[10px] text-slate-400">TikTok 视频 / Telegram 频道</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-600">15 个渠道</span>
                  <div className="font-mono text-[10px] text-slate-400">贡献 31% GMV</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">观察与优化梯队 (&lt; 1:2.0)</span>
                  <span className="font-mono text-[10px] text-slate-400">Facebook 信息流 / 宽泛关键词</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-rose-600">7 个渠道</span>
                  <div className="font-mono text-[10px] text-slate-400">CAC 偏高建议复盘</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenRebalance}
            className="w-full py-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-800 font-semibold text-xs transition-colors text-center border border-slate-200/80 cursor-pointer mt-2"
          >
            启动渠道预算智能重平衡建议
          </button>
        </div>
      </div>
    </div>
  );
};
