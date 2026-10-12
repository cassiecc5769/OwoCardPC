import React, { useState, useMemo } from 'react';
import { UniversalBenefitTemplate, BenefitType, BenefitCategory, BenefitStatus } from './types';
import { TemplateSimulatorModal } from './TemplateSimulatorModal';
import { TemplateDetailDrawer } from './TemplateDetailDrawer';
import { CreateEditTemplateModal } from './CreateEditTemplateModal';

interface UniversalTemplateLibraryModuleProps {
  templates: UniversalBenefitTemplate[];
  onUpdateTemplates: (updater: (prev: UniversalBenefitTemplate[]) => UniversalBenefitTemplate[]) => void;
  onOpenManualIssue?: (template: UniversalBenefitTemplate) => void;
  showToast: (msg: string) => void;
}

export const UniversalTemplateLibraryModule: React.FC<UniversalTemplateLibraryModuleProps> = ({
  templates,
  onUpdateTemplates,
  onOpenManualIssue,
  showToast
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cardFilter, setCardFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Selected row IDs for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawers
  const [detailDrawerTpl, setDetailDrawerTpl] = useState<UniversalBenefitTemplate | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simulatorTargetTplId, setSimulatorTargetTplId] = useState<string | undefined>(undefined);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UniversalBenefitTemplate | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'clone'>('create');

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(tpl => {
      if (typeFilter !== 'all' && tpl.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && tpl.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && tpl.status !== statusFilter) return false;
      if (cardFilter !== 'all' && !tpl.applicableCards.toLowerCase().includes(cardFilter.toLowerCase()) && !tpl.applicableCards.includes('全卡通用')) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          tpl.code.toLowerCase().includes(q) ||
          tpl.name.toLowerCase().includes(q) ||
          tpl.badge.toLowerCase().includes(q) ||
          tpl.description.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [templates, typeFilter, categoryFilter, statusFilter, cardFilter, searchQuery]);

  // Aggregate Stats for KPI Deck
  const totalTemplates = templates.length;
  const activeTemplatesCount = templates.filter(t => t.status === 'active').length;
  const pausedTemplatesCount = templates.filter(t => t.status === 'paused').length;
  const totalIssuedCount = templates.reduce((acc, t) => acc + t.statTotalIssued, 0);
  const totalRedeemedCount = templates.reduce((acc, t) => acc + t.statRedeemed, 0);
  const overallRedemptionRate = totalIssuedCount > 0 ? ((totalRedeemedCount / totalIssuedCount) * 100).toFixed(1) : '78.5';
  const totalGmvDriven = templates.reduce((acc, t) => acc + t.statGmvDriven, 0);
  const totalAllocatedBudget = templates.reduce((acc, t) => acc + t.budgetAllocated, 0);
  const totalUsedBudget = templates.reduce((acc, t) => acc + t.budgetUsed, 0);
  const budgetUsagePercent = totalAllocatedBudget > 0 ? ((totalUsedBudget / totalAllocatedBudget) * 100).toFixed(1) : '62.4';

  // Handlers
  const handleToggleStatus = (tpl: UniversalBenefitTemplate) => {
    const newStatus: BenefitStatus = tpl.status === 'active' ? 'paused' : 'active';
    onUpdateTemplates(prev =>
      prev.map(t => (t.id === tpl.id ? { ...t, status: newStatus } : t))
    );
    if (detailDrawerTpl?.id === tpl.id) {
      setDetailDrawerTpl(prev => prev ? { ...prev, status: newStatus } : null);
    }
    showToast(`模板【${tpl.name}】(${tpl.code}) 状态已切换为: ${newStatus === 'active' ? '生效中' : '已暂停发放'}`);
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setModalMode('create');
    setCreateEditModalOpen(true);
  };

  const handleOpenEdit = (tpl: UniversalBenefitTemplate) => {
    setEditingTemplate(tpl);
    setModalMode('edit');
    setCreateEditModalOpen(true);
  };

  const handleOpenClone = (tpl: UniversalBenefitTemplate) => {
    setEditingTemplate(tpl);
    setModalMode('clone');
    setCreateEditModalOpen(true);
  };

  const handleSaveTemplate = (saved: UniversalBenefitTemplate) => {
    if (modalMode === 'create' || modalMode === 'clone') {
      onUpdateTemplates(prev => [saved, ...prev]);
      showToast(`已成功将权益模板【${saved.name}】(${saved.code}) 发布并纳入全域通用模板库！`);
    } else {
      onUpdateTemplates(prev => prev.map(t => (t.id === saved.id ? saved : t)));
      if (detailDrawerTpl?.id === saved.id) {
        setDetailDrawerTpl(saved);
      }
      showToast(`权益模板【${saved.name}】配置参数已同步更新！`);
    }
  };

  const handleOpenSimulator = (tpl?: UniversalBenefitTemplate) => {
    setSimulatorTargetTplId(tpl?.id);
    setSimulatorOpen(true);
  };

  const handleExportTemplates = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `benefit-templates-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`已导出 ${templates.length} 个权益通用模板配置字典 JSON 文件！`);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTemplates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTemplates.map(t => t.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleBatchToggleStatus = (targetStatus: BenefitStatus) => {
    if (selectedIds.length === 0) return;
    onUpdateTemplates(prev =>
      prev.map(t => (selectedIds.includes(t.id) ? { ...t, status: targetStatus } : t))
    );
    showToast(`批量操作成功：已将选中的 ${selectedIds.length} 个模板统一设为【${targetStatus === 'active' ? '生效中' : '暂停'}】`);
    setSelectedIds([]);
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-xs text-slate-800">
      {/* 1. 顶部操作栏与介绍 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px] text-blue-600">tune</span>
              <span>权益通用模板库 (Benefit Universal Template Library)</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold border border-blue-200">
              规则引擎核心
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-semibold border border-emerald-200">
              自动发券与核销闭环
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 max-w-3xl leading-relaxed">
            集中纳管全品类加价券、固定满减补贴、提现手续费免除、极速直通卡与锁汇特权。支持多场景事件触发、沙箱模拟试算与双人复核审批。
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExportTemplates}
            className="px-3 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span>导出模板字典</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenSimulator()}
            className="px-3 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            <span>沙箱测算模拟</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-3.5 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>新建权益模板</span>
          </button>
        </div>
      </div>

      {/* 2. 宏观核心 KPI 看板 (4列等宽) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: 模板纳管矩阵 */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">纳管通用模板库</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-mono text-2xl font-bold text-slate-900">{totalTemplates}</span>
                <span className="text-xs text-slate-500">类</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">category</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-mono font-medium">● {activeTemplatesCount} 生效中</span>
            <span className="text-amber-700 font-mono">● {pausedTemplatesCount} 暂停</span>
            <span className="text-slate-400 font-mono">全域纳管 100%</span>
          </div>
        </div>

        {/* KPI 2: 模板累计发券量 */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">模板累计下发量</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-mono text-2xl font-bold text-slate-900">
                  {totalIssuedCount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">张</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">核销收拢: {totalRedeemedCount.toLocaleString()}</span>
            <span className="text-emerald-700 font-mono font-bold">履约率 {overallRedemptionRate}%</span>
          </div>
        </div>

        {/* KPI 3: 撬动出单 GMV */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">撬动卡单交易 GMV</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-mono text-2xl font-bold text-slate-900">
                  ${(totalGmvDriven / 1000000).toFixed(2)}M
                </span>
                <span className="text-xs text-slate-500">USD</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">杠杆乘数 1:18.4</span>
            <span className="text-indigo-600 font-mono font-bold">加成均值 +0.72%</span>
          </div>
        </div>

        {/* KPI 4: 预算熔断池水位 */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">权益总预算消耗水位</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-mono text-2xl font-bold text-slate-900">
                  {budgetUsagePercent}%
                </span>
                <span className="text-xs text-slate-500">已占用</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">${(totalUsedBudget / 1000).toFixed(1)}k / ${(totalAllocatedBudget / 1000).toFixed(1)}k</span>
            <span className="text-emerald-700 font-medium">熔断线安全 (85%)</span>
          </div>
        </div>
      </div>

      {/* 3. 组合筛选工具栏与视图切换 */}
      <div className="p-3.5 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
          {/* 搜索框 */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
              placeholder="搜索模板代码 (TPL-xxx) / 模板名称 / 标签 / 说明"
            />
          </div>

          {/* 权益形态类型 */}
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-800 text-xs font-medium focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">全部权益类型</option>
              <option value="rate">比例加价券 (Rate %)</option>
              <option value="fixed">固定现金加价 (Fixed Cash)</option>
              <option value="fee">提现免手续费 (Fee Waiver)</option>
              <option value="service">极速通道特权 (Speed Lane)</option>
              <option value="lock">锁汇保价特权 (Rate Lock)</option>
            </select>
          </div>

          {/* 业务归属场景 */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-800 text-xs font-medium focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">全业务场景归属</option>
              <option value="acquisition">市场拉新 (首单/迎新)</option>
              <option value="activation">交易促活 (大额/品类)</option>
              <option value="loyalty">会员尊享 (等级/返现)</option>
              <option value="retention">召回挽损 (客服争议补偿)</option>
              <option value="service">服务保障 (专线/保价)</option>
              <option value="channel">渠道联名 (BD专属定制)</option>
            </select>
          </div>

          {/* 适用卡种 */}
          <div>
            <select
              value={cardFilter}
              onChange={e => setCardFilter(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-800 text-xs font-medium focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">全部适用卡种</option>
              <option value="Apple">Apple / iTunes</option>
              <option value="Steam">Steam Wallet</option>
              <option value="Google">Google Play</option>
              <option value="Razer">Razer Gold</option>
              <option value="Sephora">Sephora 美妆</option>
              <option value="USDT">USDT 结算</option>
            </select>
          </div>

          {/* 模板状态 */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-800 text-xs font-medium focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">全部模板状态</option>
              <option value="active">生效中 (Active)</option>
              <option value="paused">已暂停 (Paused)</option>
              <option value="review">审核中 (In Review)</option>
            </select>
          </div>
        </div>

        {/* 底部小工具条: 选中统计、批量操作、卡片/表格视图切换 */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              共检索到 <strong className="text-slate-900 font-mono">{filteredTemplates.length}</strong> 个标准权益模板
            </span>
            {selectedIds.length > 0 && (
              <span className="font-mono text-blue-600 font-medium">
                (已选中 {selectedIds.length} 项)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1.5 animate-fade-in">
                <button
                  type="button"
                  onClick={() => handleBatchToggleStatus('active')}
                  className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium border border-emerald-200 cursor-pointer"
                >
                  批量启用 ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchToggleStatus('paused')}
                  className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium border border-amber-200 cursor-pointer"
                >
                  批量暂停 ({selectedIds.length})
                </button>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
                <span>卡片矩阵</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">table_rows</span>
                <span>明细台账</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 视图呈现：卡片矩阵视图 (Card Grid View) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-full p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400">
              <span className="material-symbols-outlined text-[40px] text-slate-300 block mb-2">inbox</span>
              <span>暂无匹配的权益配置模板，可调整筛选或点击右上角新建模板</span>
            </div>
          ) : (
            filteredTemplates.map(tpl => {
              const isSelected = selectedIds.includes(tpl.id);
              const budgetPercent = tpl.budgetAllocated > 0
                ? Math.min(100, (tpl.budgetUsed / tpl.budgetAllocated) * 100)
                : 0;

              return (
                <div
                  key={tpl.id}
                  className={`p-4 rounded-xl bg-white border transition-all shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-blue-300 hover:shadow-sm ${
                    isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20' : 'border-slate-200/80'
                  }`}
                >
                  {/* Top Bar inside Card */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(tpl.id)}
                          className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold border ${tpl.badgeColor}`}>
                          {tpl.badge}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {tpl.version}
                        </span>
                      </div>

                      {tpl.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          生效中
                        </span>
                      ) : tpl.status === 'paused' ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          已暂停
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-slate-500 font-semibold">
                          待审核
                        </span>
                      )}
                    </div>

                    {/* Template Name & Code */}
                    <div className="mb-2">
                      <h3
                        onClick={() => setDetailDrawerTpl(tpl)}
                        className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer transition-colors line-clamp-1"
                        title={tpl.name}
                      >
                        {tpl.name}
                      </h3>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 mt-0.5">
                        <span className="text-blue-600 font-semibold">{tpl.code}</span>
                        <span>·</span>
                        <span>{tpl.categoryLabel}</span>
                      </div>
                    </div>

                    {/* Discount Value Display */}
                    <div className="flex items-baseline gap-1.5 my-2.5 p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                      <span className="font-mono text-2xl font-bold text-blue-600">
                        {tpl.discountDisplay}
                      </span>
                      <span className="text-slate-400 text-xs">{tpl.discountSub}</span>
                      {tpl.capAmount > 0 && (
                        <span className="ml-auto font-mono text-[10px] text-slate-400">
                          封顶 ${tpl.capAmount}
                        </span>
                      )}
                    </div>

                    {/* Rules Metadata */}
                    <div className="space-y-1 text-slate-600 text-[11px] mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">check_circle</span>
                        <span className="truncate">门槛: {tpl.minThreshold}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">schedule</span>
                        <span className="truncate">期限: {tpl.validity}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">credit_card</span>
                        <span className="truncate font-mono text-slate-700">{tpl.applicableCards}</span>
                      </div>
                    </div>

                    {/* Budget progress */}
                    <div className="space-y-1 mb-2">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>预算池占用: {budgetPercent.toFixed(0)}%</span>
                        <span>${(tpl.budgetUsed / 1000).toFixed(1)}k / ${(tpl.budgetAllocated / 1000).toFixed(1)}k</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${budgetPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenSimulator(tpl)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                        title="沙箱试算此模板"
                      >
                        <span className="material-symbols-outlined text-[16px]">calculate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenClone(tpl)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                        title="复制克隆此模板"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(tpl)}
                        className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                        title={tpl.status === 'active' ? '暂停此模板' : '启用此模板'}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {tpl.status === 'active' ? 'pause_circle' : 'play_circle'}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDetailDrawerTpl(tpl)}
                        className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                      >
                        详情配置
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenManualIssue) {
                            onOpenManualIssue(tpl);
                          } else {
                            showToast(`已调起针对模板【${tpl.name}】的人工发券审批工作流`);
                          }
                        }}
                        className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] shadow-2xs transition-colors cursor-pointer"
                      >
                        发券
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 5. 视图呈现：结构化明细表格视图 (Data Table View) */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                  <th className="px-3 py-2.5 text-center w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredTemplates.length && filteredTemplates.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2.5">模板代码与名称</th>
                  <th className="px-3 py-2.5">场景类型</th>
                  <th className="px-3 py-2.5">加价额度/面值</th>
                  <th className="px-3 py-2.5">起用门槛与限制</th>
                  <th className="px-3 py-2.5">适用卡种范围</th>
                  <th className="px-3 py-2.5">下发与履约核销</th>
                  <th className="px-3 py-2.5">撬动 GMV</th>
                  <th className="px-3 py-2.5">状态</th>
                  <th className="px-3 py-2.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      未找到符合当前条件的权益模板
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map(tpl => {
                    const isSelected = selectedIds.includes(tpl.id);
                    return (
                      <tr
                        key={tpl.id}
                        className={`hover:bg-slate-50/80 transition-colors h-12 ${
                          isSelected ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(tpl.id)}
                            className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => setDetailDrawerTpl(tpl)}>
                                {tpl.name}
                              </span>
                              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-semibold border ${tpl.badgeColor}`}>
                                {tpl.badge}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-blue-600 font-semibold">{tpl.code} · {tpl.version}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{tpl.typeLabel}</span>
                            <span className="text-slate-400 text-[10px]">{tpl.categoryLabel}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-blue-600 text-sm">{tpl.discountDisplay}</span>
                            <span className="text-slate-400 text-[10px]">
                              {tpl.capAmount > 0 ? `最高封顶 $${tpl.capAmount}` : '无封顶'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="font-mono text-slate-800">{tpl.minThreshold}</span>
                            <span className="text-slate-400 text-[10px]">{tpl.validity}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {tpl.applicableCardTags.map((tag, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col font-mono text-[11px]">
                            <span>发: {tpl.statTotalIssued.toLocaleString()} / 销: {tpl.statRedeemed.toLocaleString()}</span>
                            <span className="text-emerald-700 font-semibold">履约率 {tpl.statRedemptionRate}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono font-semibold text-slate-900">
                          ${(tpl.statGmvDriven / 1000).toFixed(1)}k
                        </td>
                        <td className="px-3 py-2">
                          {tpl.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              生效中
                            </span>
                          ) : tpl.status === 'paused' ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                              已暂停
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                              审核中
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenSimulator(tpl)}
                              className="text-indigo-600 hover:underline font-medium cursor-pointer"
                            >
                              测算
                            </button>
                            <button
                              type="button"
                              onClick={() => setDetailDrawerTpl(tpl)}
                              className="text-blue-600 hover:underline font-medium cursor-pointer"
                            >
                              详情
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(tpl)}
                              className="text-slate-600 hover:underline font-medium cursor-pointer"
                            >
                              编辑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. 模态框与抽屉注入 */}
      {/* 模板详情配置抽屉 */}
      <TemplateDetailDrawer
        template={detailDrawerTpl}
        isOpen={Boolean(detailDrawerTpl)}
        onClose={() => setDetailDrawerTpl(null)}
        onToggleStatus={handleToggleStatus}
        onCloneTemplate={handleOpenClone}
        onOpenSimulator={handleOpenSimulator}
        onUseToIssue={tpl => {
          setDetailDrawerTpl(null);
          if (onOpenManualIssue) onOpenManualIssue(tpl);
        }}
      />

      {/* 沙箱模拟试算弹窗 */}
      <TemplateSimulatorModal
        templates={templates}
        initialTemplateId={simulatorTargetTplId}
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />

      {/* 创建 / 编辑 / 复制 模板向导弹窗 */}
      <CreateEditTemplateModal
        isOpen={createEditModalOpen}
        onClose={() => setCreateEditModalOpen(false)}
        onSave={handleSaveTemplate}
        initialTemplate={editingTemplate}
        mode={modalMode}
      />
    </div>
  );
};
