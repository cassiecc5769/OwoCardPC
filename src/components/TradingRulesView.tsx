import React, { useState, useEffect } from 'react';
import { NavPath } from '../types';
import {
  RuleLifecycleTab,
  TradingRuleItem,
  AuditLogRow,
  SnapshotVersion,
} from './trading-rules/types';
import {
  INITIAL_KPI_METRICS,
  INITIAL_TRADING_RULES,
  INITIAL_AUDIT_LOGS,
  SNAPSHOT_VERSIONS,
} from './trading-rules/mockData';
import { TradingRulesKpiDeck } from './trading-rules/TradingRulesKpiDeck';
import { TradingRulesHealthPipeline } from './trading-rules/TradingRulesHealthPipeline';
import { TradingRulesTabGrid } from './trading-rules/TradingRulesTabGrid';
import { TradingRulesAuditTable } from './trading-rules/TradingRulesAuditTable';
import { TradingRulesBottomBanner } from './trading-rules/TradingRulesBottomBanner';
import { EditRuleModal } from './trading-rules/EditRuleModal';
import { EmergencyRuleModal } from './trading-rules/EmergencyRuleModal';
import { SnapshotRollbackModal } from './trading-rules/SnapshotRollbackModal';
import { ExportAuditModal } from './trading-rules/ExportAuditModal';
import { AuditVerifyModal } from './trading-rules/AuditVerifyModal';
import { PublishConfirmModal } from './trading-rules/PublishConfirmModal';
import { ApprovalTicketModal } from './trading-rules/ApprovalTicketModal';

interface TradingRulesViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const TradingRulesView: React.FC<TradingRulesViewProps> = ({ onNavigate }) => {
  // State
  const [kpiMetrics, setKpiMetrics] = useState(INITIAL_KPI_METRICS);
  const [rules, setRules] = useState<TradingRuleItem[]>(INITIAL_TRADING_RULES);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>(INITIAL_AUDIT_LOGS);
  const [versions, setVersions] = useState<SnapshotVersion[]>(SNAPSHOT_VERSIONS);

  // Filter state
  const [activeTab, setActiveTab] = useState<RuleLifecycleTab>('order');
  const [scopeMode, setScopeMode] = useState<'all' | 'large_merchant' | 'retail' | 'api'>('all');

  // Modals state
  const [editingRule, setEditingRule] = useState<TradingRuleItem | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [verifyingLog, setVerifyingLog] = useState<AuditLogRow | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [viewingTicket, setViewingTicket] = useState<string | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Keyboard shortcut listener: Enter key to trigger Publish Confirm (when no modal is open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const isAnyModalOpen =
          editingRule !== null ||
          isEmergencyModalOpen ||
          isSnapshotModalOpen ||
          isExportModalOpen ||
          verifyingLog !== null ||
          isPublishModalOpen ||
          viewingTicket !== null;

        // If focus is in an input or textarea, don't trigger publish modal
        const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
          return;
        }

        if (!isAnyModalOpen) {
          e.preventDefault();
          setIsPublishModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    editingRule,
    isEmergencyModalOpen,
    isSnapshotModalOpen,
    isExportModalOpen,
    verifyingLog,
    isPublishModalOpen,
    viewingTicket,
  ]);

  // Handle saving an edited rule
  const handleSaveEditedRule = (
    updatedRule: TradingRuleItem,
    reason: string,
    ticket: string
  ) => {
    const prevRule = rules.find((r) => r.id === updatedRule.id);
    const prevValueDisplay = prevRule
      ? `${prevRule.thresholdValue} ${prevRule.thresholdUnit}`
      : '未知';
    const nextValueDisplay = `${updatedRule.thresholdValue} ${updatedRule.thresholdUnit}`;

    // Update rule in list
    setRules((prev) => prev.map((r) => (r.id === updatedRule.id ? updatedRule : r)));

    // Create new audit log row
    const newLog: AuditLogRow = {
      id: updatedRule.id,
      prevValue: prevValueDisplay,
      nextValue: nextValueDisplay,
      mode: updatedRule.effectiveMode,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operator: {
        name: '当前管理员',
        title: '风控策略专家',
        initials: 'AD',
        bg: 'bg-blue-600',
      },
      ticket: ticket || `APPR-${Math.floor(10000 + Math.random() * 90000)}`,
      reason: reason || '业务指标策略例行调优',
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random()
        .toString(16)
        .substring(2, 10)}`,
      approvedBy: '策略审核委员会',
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    setKpiMetrics((prev) => ({
      ...prev,
      versionSnapshotsCount: prev.versionSnapshotsCount + 1,
    }));

    setEditingRule(null);
    showToast(`规则 [${updatedRule.id}] 调整成功，已热加载并写入审计存证！`);
  };

  // Handle adding an emergency rule
  const handleAddEmergencyRule = (
    newRule: TradingRuleItem,
    reason: string,
    ticket: string
  ) => {
    setRules((prev) => [newRule, ...prev]);

    const newLog: AuditLogRow = {
      id: newRule.id,
      prevValue: '无 (新建)',
      nextValue: `${newRule.thresholdValue} (${newRule.thresholdUnit})`,
      mode: '立即生效',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operator: {
        name: '值班风控官',
        title: '应急特勤组',
        initials: 'EM',
        bg: 'bg-rose-600',
      },
      ticket: ticket || `EMG-${Math.floor(10000 + Math.random() * 90000)}`,
      reason: `[紧急特急] ${reason}`,
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random()
        .toString(16)
        .substring(2, 10)}`,
      approvedBy: '首席风控官 (林志华)',
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    setKpiMetrics((prev) => ({
      ...prev,
      activeRulesCount: prev.activeRulesCount + 1,
      versionSnapshotsCount: prev.versionSnapshotsCount + 1,
    }));

    setIsEmergencyModalOpen(false);
    setActiveTab(newRule.tab);
    showToast(`紧急规则 [${newRule.id}] 已发布并以最高优先级插入全网流水线！`);
  };

  // Handle rollback to a snapshot
  const handleRollbackSnapshot = (version: SnapshotVersion) => {
    setVersions((prev) =>
      prev.map((v) => ({
        ...v,
        isCurrent: v.version === version.version,
        status: v.version === version.version ? 'active' : 'archived',
      }))
    );

    const rollbackLog: AuditLogRow = {
      id: 'SYS-ROLLBACK',
      prevValue: 'v2.4-STABLE',
      nextValue: `${version.version} (全量覆盖)`,
      mode: '立即生效',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operator: {
        name: '当前管理员',
        title: '超级管理员',
        initials: 'SU',
        bg: 'bg-indigo-600',
      },
      ticket: `RBK-${Math.floor(10000 + Math.random() * 90000)}`,
      reason: `全网紧急回滚至历史快照版本 [${version.version}]，哈希指纹: ${version.hash}`,
      hash: version.hash,
      approvedBy: '董事会风控合规委',
    };

    setAuditLogs((prev) => [rollbackLog, ...prev]);
    setIsSnapshotModalOpen(false);
    showToast(`系统已毫秒级回退至历史快照 [${version.version}]，全网 12 节点已同步！`);
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            verified
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Live Metrics Strip & Search (Context Banner) */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">撮合通道 SLA:</span>
            <span className="font-mono text-emerald-400 font-bold">99.98%</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">平台积点资金池:</span>
            <span className="font-mono text-amber-300 font-bold">985,658.55 PTS</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="material-symbols-outlined text-[14px] text-emerald-400 animate-pulse">
              radio_button_checked
            </span>
            <span>实时更新: 1s</span>
          </div>
          <div className="font-mono text-slate-500 text-[11px] hidden md:inline">
            UTC+08:00
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">分布式共识:</span>
          <span className="font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800 text-[11px] font-semibold">
            12/12 Raft Active
          </span>
        </div>
      </div>

      {/* Section 1: Top Level Command Banner & Context Header */}
      <header className="bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-xs shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[22px]">gavel</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">交易规则治理中心</h1>
              <span className="font-mono text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded font-semibold">
                v2.4-STABLE
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                全网热加载已挂载
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Trading Rules & SLA Governance · 覆盖出卡、撮合、验卡、熔断与争议处理全生命周期流水线
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsSnapshotModalOpen(true)}
            className="px-3.5 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs border border-slate-200/80"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-600">history</span>
            <span>规则回溯快照</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs border border-slate-200/80"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-600">file_download</span>
            <span>导出规则审计清单</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEmergencyModalOpen(true)}
            className="px-3.5 h-9 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-rose-600">add_moderator</span>
            <span>创建临时紧急规则</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPublishModalOpen(true)}
            className="px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">publish</span>
            <span>发布并全网生效 (Enter)</span>
          </button>
        </div>
      </header>

      {/* Section 2: KPI Metric Strip (4 High-Density Operational Counters) */}
      <TradingRulesKpiDeck kpi={kpiMetrics} />

      {/* Section 3: SLA Realtime Health Radar & Order Lifecycle Pipeline Strip */}
      <TradingRulesHealthPipeline
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        complianceRate={kpiMetrics.complianceRate}
        fusedMerchantsCount={kpiMetrics.fusedMerchantsCount}
        unassignedCount={kpiMetrics.unassignedSuspendedCount}
      />

      {/* Section 4: 5 Big Subsystem Tabs & Parameter Matrices */}
      <TradingRulesTabGrid
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        rules={rules}
        scopeMode={scopeMode}
        onScopeModeChange={(mode) => setScopeMode(mode)}
        onEditRule={(rule) => setEditingRule(rule)}
      />

      {/* Section 5: Rule Version Evolution & Immutable Operation Audit Log Table */}
      <TradingRulesAuditTable
        logs={auditLogs}
        onVerifyAudit={(log) => setVerifyingLog(log)}
        onViewTicket={(ticket) => setViewingTicket(ticket)}
      />

      {/* Section 6: Bottom Safeguard Notice & Hot Reload Ledger Summary */}
      <TradingRulesBottomBanner
        onDownloadReport={() => setIsExportModalOpen(true)}
      />

      {/* Interactive Modals */}
      <EditRuleModal
        rule={editingRule}
        onClose={() => setEditingRule(null)}
        onSave={handleSaveEditedRule}
      />

      <EmergencyRuleModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onAddEmergencyRule={handleAddEmergencyRule}
      />

      <SnapshotRollbackModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        versions={versions}
        onRollback={handleRollbackSnapshot}
      />

      <ExportAuditModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExportDone={(format) => {
          showToast(`已成功导出 [规则审计清单.${format.toLowerCase()}]，数字签名链完整！`);
        }}
      />

      <AuditVerifyModal
        log={verifyingLog}
        onClose={() => setVerifyingLog(null)}
      />

      <PublishConfirmModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublished={() => {
          showToast('全网规则热加载广播成功！12 处撮合节点已实时挂载最新配置。');
        }}
      />

      <ApprovalTicketModal
        ticket={viewingTicket}
        onClose={() => setViewingTicket(null)}
      />
    </div>
  );
};
