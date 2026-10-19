import React, { useState, useMemo } from 'react';
import { NavPath } from '../types';
import {
  CardSkuMasterItem,
  CardConfigFilterState,
  FaceValueLadder,
  AuditLogRecord,
} from './card-config/types';
import {
  MOCK_CARD_SKU_ITEMS,
  MOCK_CARD_KPI_DATA,
  MOCK_AUDIT_LOGS,
} from './card-config/mockData';
import { CardConfigKpiDeck } from './card-config/CardConfigKpiDeck';
import { CardConfigFilterBar } from './card-config/CardConfigFilterBar';
import { CardConfigTable } from './card-config/CardConfigTable';
import { CardDetailModal } from './card-config/CardDetailModal';
import { FaceValueLadderModal } from './card-config/FaceValueLadderModal';
import { BatchStatusModal } from './card-config/BatchStatusModal';
import { ExportMasterDataModal } from './card-config/ExportMasterDataModal';
import { CardAuditLogModal } from './card-config/CardAuditLogModal';
import { ChannelLogModal } from './card-config/ChannelLogModal';
import { ColumnSettingsModal } from './card-config/ColumnSettingsModal';

interface CardConfigViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const CardConfigView: React.FC<CardConfigViewProps> = ({ onNavigate }) => {
  // 1. 卡种主数据及 KPI 状态
  const [cards, setCards] = useState<CardSkuMasterItem[]>(MOCK_CARD_SKU_ITEMS);
  const [kpiData, setKpiData] = useState(MOCK_CARD_KPI_DATA);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>(MOCK_AUDIT_LOGS);

  // 2. 筛选器状态
  const [filters, setFilters] = useState<CardConfigFilterState>({
    tab: 'all',
    search: '',
    region: '',
    currency: '',
    model: '',
    includeInactive: true,
  });

  // 3. 勾选行
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 4. 模态窗控制状态
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardSkuMasterItem | null>(null);

  const [isLadderModalOpen, setIsLadderModalOpen] = useState(false);
  const [ladderCard, setLadderCard] = useState<CardSkuMasterItem | null>(null);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const [isChannelLogOpen, setIsChannelLogOpen] = useState(false);
  const [channelLogCard, setChannelLogCard] = useState<CardSkuMasterItem | null>(null);

  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

  // 5. 交互提示反馈
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 切换单个卡种收卡状态 (Active <-> Maintenance)
  const handleToggleStatus = (id: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'active' ? 'maintenance' : 'active';
          const nextBadge = nextStatus === 'maintenance' ? '维护停收' : undefined;
          showToast(
            `卡种 [${c.brandName}] 已切换为: ${
              nextStatus === 'active' ? '正常在收 (ACTIVE)' : '维护停收 (PAUSED)'
            }`
          );
          return { ...c, status: nextStatus, riskBadge: nextBadge };
        }
        return c;
      })
    );

    // 动态更新 KPI 计数
    setKpiData((prev) => {
      const activeCount = cards.filter((c) => c.status === 'active').length;
      return {
        ...prev,
        activeBrandsCount: activeCount,
        pausedBrandsCount: prev.totalBrandsCount - activeCount,
      };
    });
  };

  // 切换抢单模式，仅影响该卡种是否参与自动抢单。
  const handleToggleGrabOrder = (id: string) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        const enabled = !(card.grabOrderEnabled ?? true);
        showToast(`卡种 [${card.brandName}] 已${enabled ? '开启' : '关闭'}抢单模式`);
        return { ...card, grabOrderEnabled: enabled };
      })
    );
  };

  // 上下架独立于原有收卡通道状态，用于控制前台可见性。
  const handleToggleListing = (id: string) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        const listed = !(card.listed ?? card.status === 'active');
        showToast(`卡种 [${card.brandName}] 已${listed ? '上架' : '下架'}`);
        return { ...card, listed };
      })
    );
  };

  // 批量修改状态
  const handleBatchStatus = (targetStatus: 'active' | 'maintenance', reason: string) => {
    const idsToUpdate = selectedIds.length > 0 ? selectedIds : cards.map((c) => c.id);
    setCards((prev) =>
      prev.map((c) => {
        if (idsToUpdate.includes(c.id)) {
          return {
            ...c,
            status: targetStatus,
            riskBadge: targetStatus === 'maintenance' ? '维护停收' : undefined,
          };
        }
        return c;
      })
    );

    // 新增审计日志
    const newLog: AuditLogRecord = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      operator: '超级管理员 (OP-01)',
      targetSku: idsToUpdate.length > 1 ? `批量 ${idsToUpdate.length} 个SKU` : idsToUpdate[0],
      action: targetStatus === 'active' ? '批量恢复在收' : '批量维护停收熔断',
      details: reason,
      hash: `HASH: ${Math.random().toString(16).substring(2, 6).toUpperCase()}-B019-91AC`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    setSelectedIds([]);
    showToast(
      `已完成对 ${idsToUpdate.length} 个卡种的批量状态热更新并广播多机房: ${
        targetStatus === 'active' ? '正常在收' : '维护停收'
      }`
    );
  };

  // 保存卡种主数据 (新增或编辑)
  const handleSaveCard = (savedCard: CardSkuMasterItem) => {
    const exists = cards.some((c) => c.id === savedCard.id);
    if (exists) {
      setCards((prev) => prev.map((c) => (c.id === savedCard.id ? savedCard : c)));
      showToast(`卡种 [${savedCard.brandName}] 主配置已成功更新生效`);
    } else {
      setCards((prev) => [savedCard, ...prev]);
      setKpiData((prev) => ({
        ...prev,
        totalBrandsCount: prev.totalBrandsCount + 1,
        activeBrandsCount: prev.activeBrandsCount + 1,
      }));
      showToast(`全新卡种品牌 [${savedCard.brandName}] 已成功入库并热加载`);
    }

    const newLog: AuditLogRecord = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      operator: '超级管理员 (OP-01)',
      targetSku: savedCard.id,
      action: exists ? '卡种主配置变更' : '新增卡种品牌入库',
      details: `更新面值模型及录入要素规则（${savedCard.entryElements?.length || 0} 个要素）`,
      hash: savedCard.auditHash,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // 保存面值阶梯配置
  const handleSaveLadders = (cardId: string, ladders: FaceValueLadder[]) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          const desc = `常规阶梯: ${ladders
            .slice(0, 4)
            .map((l) => l.amount)
            .join(' / ')} 浮动`;
          return { ...c, ladders, ladderDetailDesc: desc };
        }
        return c;
      })
    );
    showToast(`卡种 [${cardId}] 阶梯策略已更新 (${ladders.length} 个有效档位)，实时生效`);
  };

  // 刷新主数据
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('已与卡种主数据库字典完成心跳同步，当前配置处于最新状态');
    }, 600);
  };

  // 保存失败审核设置
  const handleAttemptReconnect = (cardId: string) => {
    showToast(`卡种 [${cardId}] 的失败审核设置已保存并即时生效`);
  };

  // 过滤后的列表
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Tab 过滤
      if (filters.tab === 'active' && card.status !== 'active') return false;
      if (filters.tab === 'maintenance' && card.status !== 'maintenance') return false;
      if (filters.tab === 'high_risk' && card.riskTier !== 'high_risk') return false;

      // 停收卡种过滤
      if (!filters.includeInactive && card.status === 'maintenance') return false;

      // 搜索框
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchSku = card.id.toLowerCase().includes(q);
        const matchBrand = card.brandName.toLowerCase().includes(q);
        const matchSub = card.subTitle.toLowerCase().includes(q);
        const matchRegex = card.regexRule.toLowerCase().includes(q);
        if (!matchSku && !matchBrand && !matchSub && !matchRegex) return false;
      }

      // 属地过滤
      if (filters.region && card.countryCode !== filters.region) return false;

      // 币种过滤
      if (filters.currency && !card.currency.includes(filters.currency)) return false;

      // 面值模型过滤
      if (filters.model && card.faceValueModel !== filters.model && card.faceValueModel !== 'BOTH') {
        return false;
      }

      return true;
    });
  }, [cards, filters]);

  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased pb-12">
      {/* Toast 提示条 */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-slate-700 animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Title Banner (SKU配置) */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 rounded-2xl border border-indigo-950 text-white shadow-xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center justify-center p-1.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
              <span className="material-symbols-outlined text-lg">credit_card</span>
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">卡种 / SKU 主数据配置中心</h1>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-mono font-bold">
              SKU Master Hub (六十一条)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>交易·报价·风控·财务统一主数据</span>
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 max-w-4xl leading-relaxed">
            核心主数据维护标准：<strong className="text-amber-300">品牌 ｜ 国家 ｜ 币种 ｜ 卡形式(实体卡/电子码) ｜ 面额/区间 ｜ SKU编码 ｜ 状态</strong>。作为全站撮合、智能机器人、Card Check 预检与财务结算的唯一权威基准。
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="h-9 px-3.5 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-slate-300">download</span>
            <span>导出主数据 JSON/CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsBatchModalOpen(true)}
            className="h-9 px-3.5 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-slate-300">toggle_on</span>
            <span>批量启用 / 停收</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingCard(null);
              setIsDetailModalOpen(true);
            }}
            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            <span>新增卡种</span>
          </button>
        </div>
      </header>

      {/* KPI Metric Overview Cards (4 cols) */}
      <CardConfigKpiDeck kpi={kpiData} />

      {/* Multi-dimensional Filter Bar */}
      <CardConfigFilterBar
        filters={filters}
        onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        onReset={() =>
          setFilters({
            tab: 'all',
            search: '',
            region: '',
            currency: '',
            model: '',
            includeInactive: true,
          })
        }
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Data Table Container */}
      <CardConfigTable
        cards={filteredCards}
        onToggleGrabOrder={handleToggleGrabOrder}
        onToggleListing={handleToggleListing}
        onOpenDetail={(card) => {
          setEditingCard(card);
          setIsDetailModalOpen(true);
        }}
        onOpenRules={(card) => {
          setLadderCard(card);
          setIsLadderModalOpen(true);
        }}
        onOpenFailureAudit={(card) => {
          setChannelLogCard(card);
          setIsChannelLogOpen(true);
        }}
        onOpenColumnSettings={() => setIsColumnSettingsOpen(true)}
      />

      {/* Hot Reload Safe Guard Footer Notice */}
      <div className="rounded-xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-blue-600 text-[20px]">security</span>
          <span className="font-semibold text-slate-800">配置热加载安全保障机制已挂接</span>
          <span className="text-slate-300 hidden md:inline">|</span>
          <span className="text-slate-500">
            所有卡种面值区间、卡密格式及启收变更将自动触发策略引擎多机房热重载，并留存 Hash 审计链。
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded font-medium">
            HASH: 8F2A-09BD-C941
          </span>
          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className="text-blue-600 hover:underline font-semibold cursor-pointer"
          >
            查看审计日志
          </button>
        </div>
      </div>

      {/* 模态窗体系 */}
      {/* 1. 卡种配置详情 / 新增模态窗 */}
      <CardDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        card={editingCard}
        onSave={handleSaveCard}
      />

      {/* 2. 面值阶梯配置模态窗 */}
      <FaceValueLadderModal
        isOpen={isLadderModalOpen}
        onClose={() => setIsLadderModalOpen(false)}
        card={ladderCard}
        onSaveLadders={handleSaveLadders}
      />

      {/* 3. 批量启用 / 停收模态窗 */}
      <BatchStatusModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        cards={cards}
        selectedIds={selectedIds}
        onConfirmBatch={handleBatchStatus}
      />

      {/* 4. 导出主数据字典模态窗 */}
      <ExportMasterDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        cards={cards}
        onSuccess={(filename) =>
          showToast(`已成功导出主数据字典文件: ${filename}`)
        }
      />

      {/* 5. 审计日志模态窗 */}
      <CardAuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
      />

      {/* 6. 通道熔断监控日志模态窗 */}
      <ChannelLogModal
        isOpen={isChannelLogOpen}
        onClose={() => setIsChannelLogOpen(false)}
        card={channelLogCard}
        onAttemptReconnect={handleAttemptReconnect}
      />

      {/* 7. 自定义列显示模态窗 */}
      <ColumnSettingsModal
        isOpen={isColumnSettingsOpen}
        onClose={() => setIsColumnSettingsOpen(false)}
        onSaveColumns={() => showToast('已成功保存字段偏好设置')}
      />
    </div>
  );
};
