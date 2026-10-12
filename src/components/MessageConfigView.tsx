import React, { useState, useEffect } from 'react';
import { NavPath } from '../types';
import {
  EventRuleItem,
  MessageTemplateItem,
  DispatchLogItem,
  SnapshotVersion,
  MessageDomain,
  ReceiverRole,
} from './message-config/types';
import {
  INITIAL_EVENT_RULES,
  INITIAL_MESSAGE_TEMPLATES,
  INITIAL_DISPATCH_LOGS,
  INITIAL_SNAPSHOTS,
} from './message-config/mockData';
import { MessageConfigHeaderBar } from './message-config/MessageConfigHeaderBar';
import { MessageConfigKpiDeck } from './message-config/MessageConfigKpiDeck';
import { MessageConfigToolbar, ActiveMainTab } from './message-config/MessageConfigToolbar';
import { EventRulesTablePane } from './message-config/EventRulesTablePane';
import { TemplateSandboxPane } from './message-config/TemplateSandboxPane';
import { TemplatesGovernanceTab } from './message-config/TemplatesGovernanceTab';
import { DispatchLogsTab } from './message-config/DispatchLogsTab';
import { MessageConfigBottomFooter } from './message-config/MessageConfigBottomFooter';

// Modals
import { ConfigEventRuleModal } from './message-config/ConfigEventRuleModal';
import { CreateEventRuleModal } from './message-config/CreateEventRuleModal';
import { EditTemplateModal } from './message-config/EditTemplateModal';
import { TestDispatchModal } from './message-config/TestDispatchModal';
import { SnapshotModal } from './message-config/SnapshotModal';
import { ExportAuditModal } from './message-config/ExportAuditModal';
import { PublishConfirmModal } from './message-config/PublishConfirmModal';
import { LogDetailModal } from './message-config/LogDetailModal';

interface MessageConfigViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const MessageConfigView: React.FC<MessageConfigViewProps> = ({ onNavigate }) => {
  // State
  const [eventRules, setEventRules] = useState<EventRuleItem[]>(INITIAL_EVENT_RULES);
  const [templates, setTemplates] = useState<MessageTemplateItem[]>(INITIAL_MESSAGE_TEMPLATES);
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLogItem[]>(INITIAL_DISPATCH_LOGS);
  const [snapshots, setSnapshots] = useState<SnapshotVersion[]>(INITIAL_SNAPSHOTS);

  // Active Tab & Filters
  const [activeTab, setActiveTab] = useState<ActiveMainTab>('rules');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<MessageDomain>('all');
  const [selectedReceiver, setSelectedReceiver] = useState<ReceiverRole>('all');
  const [selectedChannel, setSelectedChannel] = useState('all');

  // Active selections for dual-pane inspector
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(
    INITIAL_EVENT_RULES[0]?.id || null
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    INITIAL_EVENT_RULES[0]?.templateId || INITIAL_MESSAGE_TEMPLATES[0]?.id || ''
  );

  // Modals state
  const [isConfigRuleOpen, setIsConfigRuleOpen] = useState(false);
  const [ruleToConfig, setRuleToConfig] = useState<EventRuleItem | null>(null);

  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);

  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<MessageTemplateItem | null>(null);

  const [isTestDispatchOpen, setIsTestDispatchOpen] = useState(false);
  const [templateToTest, setTemplateToTest] = useState<MessageTemplateItem | null>(null);

  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  const [isLogDetailOpen, setIsLogDetailOpen] = useState(false);
  const [activeLogItem, setActiveLogItem] = useState<DispatchLogItem | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Keyboard shortcut listener: Enter opens publish modal when not inside input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isPublishOpen && !isConfigRuleOpen && !isCreateRuleOpen) {
        const activeElem = document.activeElement?.tagName.toLowerCase();
        if (activeElem !== 'input' && activeElem !== 'textarea') {
          setIsPublishOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPublishOpen, isConfigRuleOpen, isCreateRuleOpen]);

  // Current inspector template
  const currentTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Filtering Event Rules
  const filteredRules = eventRules.filter((rule) => {
    if (selectedDomain !== 'all' && rule.domain !== selectedDomain) {
      return false;
    }
    if (selectedReceiver !== 'all') {
      const role = rule.targetRole.primary;
      if (selectedReceiver === 'seller' && !role.includes('出卡')) return false;
      if (selectedReceiver === 'merchant' && !role.includes('商户')) return false;
      if (selectedReceiver === 'ops' && !role.includes('运营') && !role.includes('调度')) return false;
      if (selectedReceiver === 'cs' && !role.includes('客服') && !role.includes('风控') && !role.includes('仲裁')) return false;
      if (selectedReceiver === 'finance' && !role.includes('财务')) return false;
    }
    if (selectedChannel !== 'all') {
      const chLabels = (rule.channels.customLabels || []).join(' ').toLowerCase();
      if (selectedChannel === 'ws' && !chLabels.includes('ws')) return false;
      if (selectedChannel === 'sms' && !chLabels.includes('短信') && !chLabels.includes('sms')) return false;
      if (selectedChannel === 'dingtalk' && !chLabels.includes('钉钉') && !chLabels.includes('企微')) return false;
      if (selectedChannel === 'webhook' && !chLabels.includes('webhook')) return false;
      if (selectedChannel === 'tts' && !chLabels.includes('tts') && !chLabels.includes('电话') && !chLabels.includes('蜂鸣')) return false;
      if (selectedChannel === 'email' && !chLabels.includes('邮件')) return false;
    }
    if (searchKeyword) {
      const q = searchKeyword.toLowerCase();
      const matchId = rule.id.toLowerCase().includes(q);
      const matchName = rule.name.toLowerCase().includes(q);
      const matchSource = rule.source.toLowerCase().includes(q);
      const matchTmpl = rule.templateId.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchSource && !matchTmpl) return false;
    }
    return true;
  });

  // Handlers
  const handleSelectRule = (rule: EventRuleItem) => {
    setSelectedRuleId(rule.id);
    setSelectedTemplateId(rule.templateId);
  };

  const handleConfigureRule = (rule: EventRuleItem) => {
    setRuleToConfig(rule);
    setIsConfigRuleOpen(true);
  };

  const handleSaveConfiguredRule = (updatedRule: EventRuleItem) => {
    setEventRules((prev) => prev.map((r) => (r.id === updatedRule.id ? updatedRule : r)));
    showToast(`事件规则 [${updatedRule.id} · ${updatedRule.name}] 配置已实时更新并热生效`);
  };

  const handleCreateRule = (newRule: EventRuleItem) => {
    setEventRules((prev) => [newRule, ...prev]);
    setSelectedRuleId(newRule.id);
    setSelectedTemplateId(newRule.templateId);
    showToast(`成功注册新事件规则: [${newRule.id} · ${newRule.name}]`);
  };

  const handleEditTemplate = (tmpl: MessageTemplateItem) => {
    setTemplateToEdit(tmpl);
    setIsEditTemplateOpen(true);
  };

  const handleSaveEditedTemplate = (updatedTmpl: MessageTemplateItem) => {
    setTemplates((prev) => prev.map((t) => (t.id === updatedTmpl.id ? updatedTmpl : t)));
    showToast(`模版 [${updatedTmpl.id}] 内容与变量语法已成功保存`);
  };

  const handleTestDispatch = (tmpl: MessageTemplateItem) => {
    setTemplateToTest(tmpl);
    setIsTestDispatchOpen(true);
  };

  const handleTestDispatchSuccess = (channel: string, target: string, latency: string) => {
    const newLog: DispatchLogItem = {
      id: `DISP-20260920-${Math.floor(1000 + Math.random() * 9000)}`,
      eventId: selectedRuleId || 'EVT-ORD-SUCCESS',
      eventName: currentTemplate.name,
      templateId: currentTemplate.id,
      recipient: target,
      recipientType: '测试沙盒用户',
      channel: `${channel} (模拟通道)`,
      channelKey: (channel.toLowerCase() as any),
      status: 'success',
      latency,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sha256: `0x${Math.random().toString(16).substring(2, 10)}${Math.random()
        .toString(16)
        .substring(2, 10)}`,
      payloadSummary: currentTemplate.smsBody.substring(0, 80) + '...',
      payloadSnippet: currentTemplate.smsBody.substring(0, 80) + '...',
      retryCount: 0,
    };
    setDispatchLogs((prev) => [newLog, ...prev]);
    showToast(`模拟下发成功！延迟 ${latency}，已自动登记至投递流水审计`);
  };

  const handleRollbackSnapshot = (snapshot: SnapshotVersion) => {
    setSnapshots((prev) =>
      prev.map((s) => ({
        ...s,
        isCurrent: s.version === snapshot.version,
      }))
    );
    showToast(`全网已极速回滚至版本快照 [${snapshot.version}]！`);
  };

  const handleExportDone = (format: string) => {
    showToast(`通知审计清单已打包完成，[${format}] 存证文件已生成下载`);
  };

  const handlePublishedSuccess = () => {
    showToast('消息矩阵配置已成功广播全网 12 节点，Kafka 双活集群已热加载完毕！');
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedDomain('all');
    setSelectedReceiver('all');
    setSelectedChannel('all');
    showToast('已重置所有筛选过滤条件');
  };

  const handleResendLog = (log: DispatchLogItem) => {
    showToast(`已向 [${log.recipient}] 重新下发事件 [${log.eventId}]`);
  };

  const handleViewPayload = (log: DispatchLogItem) => {
    setActiveLogItem(log);
    setIsLogDetailOpen(true);
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased relative pb-10">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            notifications_active
          </span>
          <span className="font-sans font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header Bar */}
      <MessageConfigHeaderBar
        onOpenSnapshots={() => setIsSnapshotOpen(true)}
        onOpenExportAudit={() => setIsExportOpen(true)}
        onOpenCreateRule={() => setIsCreateRuleOpen(true)}
        onOpenPublish={() => setIsPublishOpen(true)}
      />

      {/* 2. KPI Deck */}
      <MessageConfigKpiDeck
        totalEventsCount={eventRules.length}
        totalTemplatesCount={templates.length}
        successRate="99.92"
        channelLoadPercent={34.2}
      />

      {/* 3. Main Toolbar (Tabs & Filters) */}
      <MessageConfigToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        rulesCount={eventRules.length}
        templatesCount={templates.length}
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        selectedDomain={selectedDomain}
        onDomainChange={setSelectedDomain}
        selectedReceiver={selectedReceiver}
        onReceiverChange={setSelectedReceiver}
        selectedChannel={selectedChannel}
        onChannelChange={setSelectedChannel}
        onReset={handleResetFilters}
      />

      {/* 4. Tab 1: Event Rules Governance (Dual Pane) */}
      {activeTab === 'rules' && (
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* Left: 7-col Event Rules Table */}
          <EventRulesTablePane
            rules={filteredRules}
            selectedRuleId={selectedRuleId}
            onSelectRule={handleSelectRule}
            onConfigureRule={handleConfigureRule}
            onSelectTemplate={(tmplId) => {
              setSelectedTemplateId(tmplId);
              showToast(`已将沙盒检查器切换至模板: [${tmplId}]`);
            }}
          />

          {/* Right: 5-col Template Sandbox & Gateways */}
          <TemplateSandboxPane
            currentTemplate={currentTemplate}
            allTemplates={templates}
            onSelectTemplate={(id) => {
              setSelectedTemplateId(id);
              showToast(`已加载模版: [${id}]`);
            }}
            onOpenTestDispatch={handleTestDispatch}
            onOpenEditTemplate={handleEditTemplate}
            onCopyVariableFeedback={(key) => {
              showToast(`动态变量已复制到剪贴板: ${key}`);
            }}
          />
        </section>
      )}

      {/* 5. Tab 2: Message Templates & Dynamic Variable Pool */}
      {activeTab === 'templates' && (
        <TemplatesGovernanceTab
          templates={templates}
          onSelectTemplate={(tmpl) => {
            setSelectedTemplateId(tmpl.id);
            setActiveTab('rules');
            showToast(`已切换至 [${tmpl.id}] 并载入沙盒预览`);
          }}
          onEditTemplate={handleEditTemplate}
          onTestDispatch={handleTestDispatch}
          onCopyVariable={(key) => {
            showToast(`动态变量已复制: ${key}`);
          }}
        />
      )}

      {/* 6. Tab 3: Dispatch Logs Audit */}
      {activeTab === 'logs' && (
        <DispatchLogsTab
          logs={dispatchLogs}
          onResend={handleResendLog}
          onViewPayload={handleViewPayload}
        />
      )}

      {/* 7. Bottom System Status Footer */}
      <MessageConfigBottomFooter />

      {/* Modals */}
      <ConfigEventRuleModal
        rule={ruleToConfig}
        templates={templates}
        onClose={() => {
          setIsConfigRuleOpen(false);
          setRuleToConfig(null);
        }}
        onSave={handleSaveConfiguredRule}
      />

      <CreateEventRuleModal
        isOpen={isCreateRuleOpen}
        templates={templates}
        onClose={() => setIsCreateRuleOpen(false)}
        onCreate={handleCreateRule}
      />

      <EditTemplateModal
        template={templateToEdit}
        onClose={() => {
          setIsEditTemplateOpen(false);
          setTemplateToEdit(null);
        }}
        onSave={handleSaveEditedTemplate}
      />

      <TestDispatchModal
        template={templateToTest}
        onClose={() => {
          setIsTestDispatchOpen(false);
          setTemplateToTest(null);
        }}
        onSuccess={handleTestDispatchSuccess}
      />

      <SnapshotModal
        isOpen={isSnapshotOpen}
        versions={snapshots}
        onClose={() => setIsSnapshotOpen(false)}
        onRollback={handleRollbackSnapshot}
      />

      <ExportAuditModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExportDone={handleExportDone}
      />

      <PublishConfirmModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onPublished={handlePublishedSuccess}
      />

      <LogDetailModal
        log={activeLogItem}
        onClose={() => {
          setIsLogDetailOpen(false);
          setActiveLogItem(null);
        }}
        onResend={handleResendLog}
      />
    </div>
  );
};
