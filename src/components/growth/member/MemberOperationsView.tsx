import React, { useState } from 'react';
import {
  INITIAL_TIER_CONFIGS,
  INITIAL_GROWTH_RULES,
  INITIAL_RETENTION_CONFIG,
  INITIAL_MEMBERS,
  INITIAL_PTS_LEDGER,
  INITIAL_RETENTION_CARE_POOL,
  INITIAL_PRIVILEGE_STATS,
} from './mockData';
import {
  MemberProfile,
  MemberTierConfig,
  GrowthFormulaRule,
  RetentionCareItem,
  GrowthPointsLedgerItem,
} from './types';
import { MemberOverviewTab } from './MemberOverviewTab';
import { MemberLedgerTab } from './MemberLedgerTab';
import { MemberRetentionTab } from './MemberRetentionTab';
import { MemberPrivilegeAuditTab } from './MemberPrivilegeAuditTab';
import {
  Member360Modal,
  MemberPointAdjustModal,
  MemberCareCouponModal,
  TierRuleConfigModal,
  GrowthFormulaModal,
  AuditSnapshotModal,
  PublishRuleModal,
} from './MemberModals';

type MemberSubTab = 'overview' | 'ledger' | 'retention' | 'privilege';

export const MemberOperationsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MemberSubTab>('overview');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Core Data States
  const [tiers, setTiers] = useState<MemberTierConfig[]>(INITIAL_TIER_CONFIGS);
  const [rules, setRules] = useState<GrowthFormulaRule[]>(INITIAL_GROWTH_RULES);
  const [retentionConfig, setRetentionConfig] = useState(INITIAL_RETENTION_CONFIG);
  const [members, setMembers] = useState<MemberProfile[]>(INITIAL_MEMBERS);
  const [ledger, setLedger] = useState<GrowthPointsLedgerItem[]>(INITIAL_PTS_LEDGER);
  const [carePool, setCarePool] = useState<RetentionCareItem[]>(INITIAL_RETENTION_CARE_POOL);
  const [stats] = useState(INITIAL_PRIVILEGE_STATS);

  // Modal States
  const [selected360Member, setSelected360Member] = useState<MemberProfile | null>(null);
  const [selectedAdjustMember, setSelectedAdjustMember] = useState<MemberProfile | null>(null);
  const [selectedCouponMember, setSelectedCouponMember] = useState<MemberProfile | null>(null);
  const [selectedEditTier, setSelectedEditTier] = useState<MemberTierConfig | null>(null);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isAuditSnapshotOpen, setIsAuditSnapshotOpen] = useState(false);
  const [isPublishRuleOpen, setIsPublishRuleOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Submit Point Adjust
  const handlePointAdjustSubmit = (data: {
    uid: string;
    type: string;
    delta: number;
    reason: string;
    ticket: string;
  }) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.uid === data.uid) {
          const newPts = Math.max(0, m.currentPts + data.delta);
          return {
            ...m,
            currentPts: newPts,
          };
        }
        return m;
      })
    );

    // Append to ledger
    const targetMem = members.find((m) => m.uid === data.uid);
    const newBalance = (targetMem ? targetMem.currentPts : 0) + data.delta;

    const newLedgerItem: GrowthPointsLedgerItem = {
      id: 'ledger-' + Date.now(),
      serialNo: 'PTS-20260919-' + Math.floor(10000 + Math.random() * 90000),
      uid: data.uid,
      phone: targetMem ? targetMem.phone : '',
      tier: targetMem ? targetMem.tier : 'LV3',
      changeType: data.type as any,
      pointsChange: data.delta,
      operator: 'OP-01 (运营组)',
      time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      balanceAfter: newBalance,
      note: `${data.reason} (工单: ${data.ticket})`,
      status: '审核通过',
    };

    setLedger((prev) => [newLedgerItem, ...prev]);
    setSelectedAdjustMember(null);
    showToast(`已成功为会员 ${data.uid} 调整成长值 (${data.delta > 0 ? '+' : ''}${data.delta} PTS)`);
  };

  // Submit Coupon Dispatch
  const handleCouponSubmit = (couponName: string, channel: string, message: string) => {
    if (selectedCouponMember) {
      // Update care pool if present
      setCarePool((prev) =>
        prev.map((c) =>
          c.uid === selectedCouponMember.uid ? { ...c, careStatus: '已派挽留券' } : c
        )
      );

      showToast(`已成功通过 [${channel}] 向 ${selectedCouponMember.uid} 派发特权: ${couponName}`);
      setSelectedCouponMember(null);
    }
  };

  // Save Tier Config
  const handleSaveTier = (updated: MemberTierConfig) => {
    setTiers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedEditTier(null);
    showToast(`已更新 ${updated.name} (${updated.tier}) 规则参数配置`);
  };

  // Save Formula Rules
  const handleSaveFormula = (updatedRules: GrowthFormulaRule[]) => {
    setRules(updatedRules);
    setIsFormulaModalOpen(false);
    showToast('已更新成长值获取与结算公式规则');
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-[#0b1c30] antialiased">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-[#0b1c30] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 顶部统一业务标头 */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              会员运营 · 会员体系与全生命周期运营治理中心
            </h1>
            <span className="bg-blue-50 border border-blue-200/60 text-blue-700 px-2 py-0.5 rounded font-code-token text-[11px] font-bold">
              LOYALTY-CORE V2.4
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-code-token text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              成长值账本实时防刷中
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            等级晋升标准、成长值流水双向勾稽存证、生命周期流失预警挽留与出卡溢价权益核销全景控制台
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
          <button
            onClick={() => setIsFormulaModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors shadow-2xs border border-slate-200/80 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">functions</span>
            <span>成长公式配置</span>
          </button>
          <button
            onClick={() => setIsAuditSnapshotOpen(true)}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors shadow-2xs border border-slate-200/80 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-600">history_edu</span>
            <span>审计存证快照</span>
          </button>
          <button
            onClick={() => setIsPublishRuleOpen(true)}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">publish</span>
            <span>发布规则生效</span>
          </button>
        </div>
      </header>

      {/* Sub-Tab Navigation (统一标准风格) */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            {
              id: 'overview',
              label: '等级与权益全景',
              icon: 'grid_view'
            },
            {
              id: 'ledger',
              label: '成长值流水账本',
              icon: 'receipt_long',
              badge: `${ledger.length}`,
              badgeClass: 'bg-blue-100 text-blue-800'
            },
            {
              id: 'retention',
              label: '保级与预警挽留',
              icon: 'crisis_alert',
              badge: `${carePool.filter((c) => c.daysRemaining <= 7).length} 极危`,
              badgeClass: 'bg-rose-100 text-rose-700'
            },
            {
              id: 'privilege',
              label: '权益加点审计',
              icon: 'price_check'
            }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MemberSubTab)}
                className={`px-4 py-3 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                  isActive
                    ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-blue-100 text-blue-800' : tab.badgeClass
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SLA 保级巡检 04:00 CRON 正常</span>
        </div>
      </section>

      {/* Main Tab Render */}
      {activeTab === 'overview' && (
        <MemberOverviewTab
          tiers={tiers}
          rules={rules}
          retentionConfig={retentionConfig}
          members={members}
          onOpenAuditSnapshot={() => setIsAuditSnapshotOpen(true)}
          onOpenPublishRule={() => setIsPublishRuleOpen(true)}
          onEditTier={(t) => setSelectedEditTier(t)}
          onOpenFormulaModal={() => setIsFormulaModalOpen(true)}
          onOpen360={(m) => setSelected360Member(m)}
          onOpenAdjust={(m) => setSelectedAdjustMember(m)}
          onOpenCoupon={(m) => setSelectedCouponMember(m)}
          onShowToast={showToast}
        />
      )}

      {activeTab === 'ledger' && (
        <MemberLedgerTab
          ledger={ledger}
          onOpenManualAdjust={() => {
            if (members.length > 0) {
              setSelectedAdjustMember(members[0]);
            }
          }}
          onShowToast={showToast}
        />
      )}

      {activeTab === 'retention' && (
        <MemberRetentionTab
          carePool={carePool}
          onOpenCareModal={(item) => {
            const mem = members.find((m) => m.uid === item.uid) || {
              id: item.id,
              uid: item.uid,
              phone: item.phone,
              avatarBg: 'bg-blue-600',
              tier: item.tier,
              tierName: item.tierName,
              currentPts: item.rollingPts,
              nextTierGapText: '',
              gmv30d: item.gmv30d,
              preferredCards: ['Apple'],
              bonusRate: '+0.50%',
              lastTradeTime: '近期',
              status: '预警下调',
              warningDaysRemaining: item.daysRemaining,
              tradesCount180d: item.rollingTradesCount,
              kycStatus: '已通过实名认证',
              riskTag: '正常',
              registeredDate: '2024-01-01',
              activeRate: '60%',
            };
            setSelectedCouponMember(mem);
          }}
          onShowToast={showToast}
        />
      )}

      {activeTab === 'privilege' && (
        <MemberPrivilegeAuditTab stats={stats} onShowToast={showToast} />
      )}

      {/* Modals */}
      <Member360Modal
        member={selected360Member}
        onClose={() => setSelected360Member(null)}
        onAdjustPoints={(m) => setSelectedAdjustMember(m)}
        onSendCoupon={(m) => setSelectedCouponMember(m)}
      />

      <MemberPointAdjustModal
        member={selectedAdjustMember}
        onClose={() => setSelectedAdjustMember(null)}
        onSubmit={handlePointAdjustSubmit}
      />

      <MemberCareCouponModal
        member={selectedCouponMember}
        onClose={() => setSelectedCouponMember(null)}
        onSubmit={handleCouponSubmit}
      />

      <TierRuleConfigModal
        tierConfig={selectedEditTier}
        onClose={() => setSelectedEditTier(null)}
        onSave={handleSaveTier}
      />

      <GrowthFormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        rules={rules}
        onSave={handleSaveFormula}
      />

      <AuditSnapshotModal
        isOpen={isAuditSnapshotOpen}
        onClose={() => setIsAuditSnapshotOpen(false)}
      />

      <PublishRuleModal
        isOpen={isPublishRuleOpen}
        onClose={() => setIsPublishRuleOpen(false)}
        onConfirm={() => {
          showToast('已成功发布全网生效规则 (PRD v2.0 SEC-5 标准已全网同步)');
        }}
      />
    </div>
  );
};
