import React, { useState } from 'react';
import { NavPath, BasicSystemConfig } from '../types';
import { MOCK_BASIC_SYSTEM_CONFIG } from '../data/mockData';
import {
  BasicConfigTab,
  ReasonDomain,
  BusinessReasonItem,
  CountryRegionItem,
  CurrencyStandardItem,
  BasicAuditLogEntry,
} from './basic-config/types';
import {
  INITIAL_BUSINESS_REASONS,
  INITIAL_COUNTRIES_REGIONS,
  INITIAL_CURRENCIES,
  INITIAL_AUDIT_LOGS,
} from './basic-config/mockData';
import { BasicConfigKpiDeck } from './basic-config/BasicConfigKpiDeck';
import { BasicConfigTabsAndFilters } from './basic-config/BasicConfigTabsAndFilters';
import { BusinessReasonsTab } from './basic-config/BusinessReasonsTab';
import { CountriesRegionsTab } from './basic-config/CountriesRegionsTab';
import { CurrencyStandardsTab } from './basic-config/CurrencyStandardsTab';
import { SystemRuntimeParamsTab } from './basic-config/SystemRuntimeParamsTab';
import { AddEditReasonModal } from './basic-config/AddEditReasonModal';
import { EditI18nModal } from './basic-config/EditI18nModal';
import { AuditLineageModal } from './basic-config/AuditLineageModal';
import { ExportDictionaryModal } from './basic-config/ExportDictionaryModal';
import { TestEchoModal } from './basic-config/TestEchoModal';

interface BasicConfigViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const BasicConfigView: React.FC<BasicConfigViewProps> = ({ onNavigate }) => {
  // Master data states
  const [activeTab, setActiveTab] = useState<BasicConfigTab>('reasons');
  const [reasons, setReasons] = useState<BusinessReasonItem[]>(INITIAL_BUSINESS_REASONS);
  const [countries, setCountries] = useState<CountryRegionItem[]>(INITIAL_COUNTRIES_REGIONS);
  const [currencies, setCurrencies] = useState<CurrencyStandardItem[]>(INITIAL_CURRENCIES);
  const [auditLogs, setAuditLogs] = useState<BasicAuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [systemConfig, setSystemConfig] = useState<BasicSystemConfig>(MOCK_BASIC_SYSTEM_CONFIG);

  // Inspector selection states
  const [selectedReasonId, setSelectedReasonId] = useState<string>(INITIAL_BUSINESS_REASONS[0].id);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(INITIAL_COUNTRIES_REGIONS[0].codeAlpha2);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>(INITIAL_CURRENCIES[0].code);

  // Filter states
  const [reasonSearch, setReasonSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<ReasonDomain>('ALL');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal visibility states
  const [isAddEditReasonOpen, setIsAddEditReasonOpen] = useState(false);
  const [reasonToEdit, setReasonToEdit] = useState<BusinessReasonItem | null>(null);

  const [isEditI18nOpen, setIsEditI18nOpen] = useState(false);
  const [reasonToEditI18n, setReasonToEditI18n] = useState<BusinessReasonItem | null>(null);

  const [isAuditLineageOpen, setIsAuditLineageOpen] = useState(false);
  const [auditFilterCode, setAuditFilterCode] = useState<string | null>(null);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTestEchoOpen, setIsTestEchoOpen] = useState(false);
  const [reasonToTestEcho, setReasonToTestEcho] = useState<BusinessReasonItem | null>(null);

  // Toast notification state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Filter calculations
  const filteredReasons = reasons.filter((item) => {
    if (selectedDomain !== 'ALL' && item.domain !== selectedDomain) {
      return false;
    }
    if (statusFilter === 'active' && !item.enabled) {
      return false;
    }
    if (statusFilter === 'disabled' && item.enabled) {
      return false;
    }
    if (reasonSearch.trim()) {
      const q = reasonSearch.toLowerCase().trim();
      return (
        item.code.toLowerCase().includes(q) ||
        item.nameZh.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.actionDecision.toLowerCase().includes(q) ||
        item.shortCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredCountries = countries.filter((c) => {
    if (statusFilter !== 'all' && c.continent !== statusFilter) {
      return false;
    }
    if (reasonSearch.trim()) {
      const q = reasonSearch.toLowerCase().trim();
      return (
        c.nameZh.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.codeAlpha2.toLowerCase().includes(q) ||
        c.codeAlpha3.toLowerCase().includes(q) ||
        c.callingCode.includes(q)
      );
    }
    return true;
  });

  const filteredCurrencies = currencies.filter((c) => {
    if (statusFilter !== 'all' && c.type !== statusFilter) {
      return false;
    }
    if (reasonSearch.trim()) {
      const q = reasonSearch.toLowerCase().trim();
      return (
        c.code.toLowerCase().includes(q) ||
        c.nameZh.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.priceSource.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handlers for Reasons
  const handleToggleReasonStatus = (id: string) => {
    setReasons((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newStatus = !r.enabled;
          // Add audit log
          const newLog: BasicAuditLogEntry = {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            operator: 'OP-01 (超级管理员)',
            role: 'Super Admin',
            category: 'REASONS',
            targetCode: r.shortCode,
            targetName: r.nameZh,
            actionType: 'TOGGLE_STATUS',
            beforeVal: `enabled = ${r.enabled}`,
            afterVal: `enabled = ${newStatus}`,
            sha256: `3b8f1a${Math.random().toString(16).substring(2, 8)}98c7e2`,
            impactedOrders: Math.floor(Math.random() * 200 + 50),
          };
          setAuditLogs((prevLogs) => [newLog, ...prevLogs]);
          showToast(`字典 [${r.code}] 状态已调整为: ${newStatus ? '生效中' : '已停用'}`);
          return { ...r, enabled: newStatus };
        }
        return r;
      })
    );
  };

  const handleSaveReason = (newOrUpdated: BusinessReasonItem) => {
    setReasons((prev) => {
      const exists = prev.some((r) => r.id === newOrUpdated.id);
      if (exists) {
        showToast(`已成功保存字典项 [${newOrUpdated.code}] 并广播全链路`);
        return prev.map((r) => (r.id === newOrUpdated.id ? newOrUpdated : r));
      } else {
        showToast(`已新增标准原因代码 [${newOrUpdated.code}]`);
        setSelectedReasonId(newOrUpdated.id);
        return [newOrUpdated, ...prev];
      }
    });

    const newLog: BasicAuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operator: 'OP-01 (超级管理员)',
      role: 'Super Admin',
      category: 'REASONS',
      targetCode: newOrUpdated.shortCode,
      targetName: newOrUpdated.nameZh,
      actionType: 'UPDATE_TEXT',
      beforeVal: reasonToEdit ? `[${reasonToEdit.nameZh}] ${reasonToEdit.actionDecision}` : 'null',
      afterVal: `[${newOrUpdated.nameZh}] ${newOrUpdated.actionDecision}`,
      sha256: `7f9c2e${Math.random().toString(16).substring(2, 8)}44a1b0`,
      impactedOrders: 0,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleOpenEditReason = (reason: BusinessReasonItem) => {
    setReasonToEdit(reason);
    setIsAddEditReasonOpen(true);
  };

  const handleOpenCreateReason = () => {
    setReasonToEdit(null);
    setIsAddEditReasonOpen(true);
  };

  const handleOpenAuditLineage = (reason: BusinessReasonItem) => {
    setAuditFilterCode(reason.shortCode);
    setIsAuditLineageOpen(true);
  };

  const handleOpenEditI18n = (reason: BusinessReasonItem) => {
    setReasonToEditI18n(reason);
    setIsEditI18nOpen(true);
  };

  const handleOpenTestEcho = (reason: BusinessReasonItem) => {
    setReasonToTestEcho(reason);
    setIsTestEchoOpen(true);
  };

  // Handlers for Countries
  const handleToggleCountryStatus = (codeAlpha2: string) => {
    setCountries((prev) =>
      prev.map((c) => {
        if (c.codeAlpha2 === codeAlpha2) {
          const newStatus = !c.enabled;
          showToast(`国家准入 [${c.nameZh} / ${c.codeAlpha2}] 状态已设置为: ${newStatus ? '正常' : '暂停'}`);
          return { ...c, enabled: newStatus };
        }
        return c;
      })
    );
  };

  // Handlers for Currencies
  const handleToggleCurrencyStatus = (code: string) => {
    setCurrencies((prev) =>
      prev.map((c) => {
        if (c.code === code) {
          const newStatus = !c.enabled;
          showToast(`货币结算代码 [${c.code}] 状态已更新为: ${newStatus ? '活跃' : '暂停'}`);
          return { ...c, enabled: newStatus };
        }
        return c;
      })
    );
  };

  const handleSyncRate = (curr: CurrencyStandardItem) => {
    showToast(`正在从权威数据源 [${curr.priceSource}] 拉取 ${curr.code} 最新牌价...`);
    setTimeout(() => {
      setCurrencies((prev) =>
        prev.map((c) => {
          if (c.code === curr.code) {
            const jitter = (Math.random() - 0.5) * 0.002;
            const updatedRate = parseFloat((c.referenceRate * (1 + jitter)).toFixed(4));
            return {
              ...c,
              referenceRate: updatedRate,
              lastSyncTime: '刚刚 (0秒前)',
            };
          }
          return c;
        })
      );
      showToast(`${curr.code} 牌价已完成双轨对齐校验并入库`);
    }, 600);
  };

  const handleResetFilters = () => {
    setReasonSearch('');
    setSelectedDomain('ALL');
    setStatusFilter('all');
    showToast('已重置所有检索条件');
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-14 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 transition-all animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Module Header Bar */}
      <header className="bg-white px-5 py-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">settings_system_daydream</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                基础配置与标准化数据治理中心
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold border border-blue-200">
                DIC_V2_PROD
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              规范礼品卡业务原因代码、主权国家准入、国际外汇币种精度及全系统安全运行基线
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto shrink-0">
          <button
            onClick={() => {
              setAuditFilterCode(null);
              setIsAuditLineageOpen(true);
            }}
            className="px-3.5 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">history</span>
            <span>变更溯源审计 ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="px-3.5 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span>全量字典导出</span>
          </button>

          <button
            onClick={handleOpenCreateReason}
            className="px-4 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            <span>新增字典代码</span>
          </button>
        </div>
      </header>

      {/* KPI Deck */}
      <BasicConfigKpiDeck
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        reasonsCount={reasons.length}
        countriesCount={countries.length}
        currenciesCount={currencies.length}
      />

      {/* Tabs & Adaptive Search Filter */}
      <BasicConfigTabsAndFilters
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setReasonSearch('');
          setStatusFilter('all');
        }}
        reasonsCount={reasons.length}
        countriesCount={countries.length}
        currenciesCount={currencies.length}
        reasonSearch={reasonSearch}
        onReasonSearchChange={setReasonSearch}
        selectedDomain={selectedDomain}
        onDomainChange={setSelectedDomain}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onResetFilters={handleResetFilters}
        onTriggerSearch={() => showToast(`已完成对 [${activeTab}] 的条件过滤检索`)}
      />

      {/* Tab Panes */}
      {activeTab === 'reasons' && (
        <BusinessReasonsTab
          reasons={filteredReasons}
          selectedReasonId={selectedReasonId}
          onSelectReason={setSelectedReasonId}
          onToggleStatus={handleToggleReasonStatus}
          onOpenEditReason={handleOpenEditReason}
          onOpenAuditLineage={handleOpenAuditLineage}
          onOpenEditI18n={handleOpenEditI18n}
          onOpenTestEcho={handleOpenTestEcho}
        />
      )}

      {activeTab === 'countries' && (
        <CountriesRegionsTab
          countries={filteredCountries}
          selectedCountryCode={selectedCountryCode}
          onSelectCountry={setSelectedCountryCode}
          onToggleStatus={handleToggleCountryStatus}
        />
      )}

      {activeTab === 'currencies' && (
        <CurrencyStandardsTab
          currencies={filteredCurrencies}
          selectedCurrencyCode={selectedCurrencyCode}
          onSelectCurrency={setSelectedCurrencyCode}
          onToggleStatus={handleToggleCurrencyStatus}
          onSyncRate={handleSyncRate}
        />
      )}

      {activeTab === 'runtime-params' && (
        <SystemRuntimeParamsTab
          config={systemConfig}
          onChangeConfig={setSystemConfig}
          onSave={() => showToast('系统运行基准与机房安全白名单参数已全网下发生效')}
        />
      )}

      {/* Interactive Modals */}
      <AddEditReasonModal
        isOpen={isAddEditReasonOpen}
        onClose={() => setIsAddEditReasonOpen(false)}
        reasonToEdit={reasonToEdit}
        onSave={handleSaveReason}
      />

      <EditI18nModal
        isOpen={isEditI18nOpen}
        onClose={() => setIsEditI18nOpen(false)}
        reason={reasonToEditI18n}
        onSave={(updated) => {
          handleSaveReason(updated);
          showToast(`已成功保存 [${updated.code}] 的多语言译文与仿真报文`);
        }}
      />

      <AuditLineageModal
        isOpen={isAuditLineageOpen}
        onClose={() => setIsAuditLineageOpen(false)}
        logs={auditLogs}
        filterTargetCode={auditFilterCode}
      />

      <ExportDictionaryModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        reasons={reasons}
        countries={countries}
        currencies={currencies}
      />

      <TestEchoModal
        isOpen={isTestEchoOpen}
        onClose={() => setIsTestEchoOpen(false)}
        reason={reasonToTestEcho}
      />
    </div>
  );
};
