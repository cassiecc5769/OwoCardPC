import React, { useState, useMemo } from 'react';
import { NavPath } from '../../../types';
import {
  SettlementLedgerItem,
  SettlementKPISummary,
  SettlementEntityType
} from './types';
import {
  INITIAL_SETTLEMENT_KPI,
  INITIAL_SETTLEMENT_LEDGERS
} from './mockData';
import { GenerateSettlementModal } from './GenerateSettlementModal';
import { BatchPayoutModal } from './BatchPayoutModal';
import { SettlementInspectorSection } from './SettlementInspectorSection';

interface SettlementManagementModuleProps {
  onNavigate?: (path: NavPath) => void;
}

export const SettlementManagementModule: React.FC<SettlementManagementModuleProps> = ({ onNavigate }) => {
  // States
  const [kpiSummary, setKpiSummary] = useState<SettlementKPISummary>(INITIAL_SETTLEMENT_KPI);
  const [ledgers, setLedgers] = useState<SettlementLedgerItem[]>(INITIAL_SETTLEMENT_LEDGERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | SettlementEntityType>('ALL');
  const [periodFilter, setPeriodFilter] = useState<'CURRENT' | 'LAST' | 'CUSTOM'>('CURRENT');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState<boolean>(false);
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Currently inspected item in the 6-Tab view
  const [inspectedItemId, setInspectedItemId] = useState<string>(INITIAL_SETTLEMENT_LEDGERS[0].id);

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [isBatchPayoutModalOpen, setIsBatchPayoutModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Find currently inspected item
  const currentInspectedItem = useMemo(() => {
    return ledgers.find((l) => l.id === inspectedItemId) || ledgers[0];
  }, [ledgers, inspectedItemId]);

  // Filtering
  const filteredLedgers = useMemo(() => {
    return ledgers.filter((l) => {
      if (activeTab !== 'ALL' && l.entityType !== activeTab) return false;
      if (channelFilter !== 'ALL' && l.channel !== channelFilter) return false;
      if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matched =
          l.settlementNo.toLowerCase().includes(q) ||
          l.targetEntity.toLowerCase().includes(q) ||
          l.creditCodeOrSource.toLowerCase().includes(q);
        if (!matched) return false;
      }
      return true;
    });
  }, [ledgers, activeTab, channelFilter, statusFilter, searchQuery]);

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredLedgers.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Batch Payout Action
  const handleOpenBatchPayout = () => {
    const itemsToPay = ledgers.filter(
      (l) =>
        (selectedIds.length > 0 ? selectedIds.includes(l.id) : true) &&
        l.status !== 'SETTLED' &&
        l.status !== 'SUSPENDED_RISK'
    );
    if (itemsToPay.length === 0) {
      showToast('当前没有待打款出账的结算单（已结案或差异挂起除外）。');
      return;
    }
    setIsBatchPayoutModalOpen(true);
  };

  const handleConfirmBatchPayout = (channel: string, secretKey: string) => {
    const targetIds =
      selectedIds.length > 0
        ? selectedIds
        : ledgers
            .filter((l) => l.status === 'PENDING_PAYOUT' || l.status === 'PENDING_APPROVAL')
            .map((l) => l.id);

    let payoutSum = 0;
    setLedgers((prev) =>
      prev.map((l) => {
        if (targetIds.includes(l.id) && l.status !== 'SUSPENDED_RISK') {
          payoutSum += l.actualPayoutAmount;
          return {
            ...l,
            status: 'SETTLED',
            statusLabel: '● 已结案',
            actualPayoutNote: `实结: $${l.actualPayoutAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            inspectorData: {
              ...l.inspectorData,
              overview: {
                ...l.inspectorData.overview,
                bankHostStatus: 'CMB-HOST-TO-HOST: 批量直联打款成功',
                bankSerialNo: `CMB-H2H-TX-${Date.now().toString().slice(-8)}`
              }
            }
          };
        }
        return l;
      })
    );

    setKpiSummary((prev) => ({
      ...prev,
      pendingSettlementUSD: Math.max(0, prev.pendingSettlementUSD - payoutSum),
      completedNetSettlementUSD: prev.completedNetSettlementUSD + payoutSum
    }));

    showToast(`银企直联批量打款成功！共为 ${targetIds.length} 份结算单完成出账回写。`);
    setSelectedIds([]);
  };

  // Generate Settlement Batch
  const handleConfirmGenerate = (data: {
    period: string;
    entityTypes: string[];
    autoDeductFee: boolean;
    remark: string;
  }) => {
    // Dynamically insert a newly generated settlement order
    const newNo = `SET202609-M0${Math.floor(250 + Math.random() * 50)}`;
    const newItem: SettlementLedgerItem = {
      id: `set-${Date.now()}`,
      settlementNo: newNo,
      period: `${data.period} (新增周期汇总结算)`,
      periodType: 'HALF_MONTH',
      entityType: 'MERCHANT',
      entityTypeLabel: '商户接单承揽',
      targetEntity: '上海翼卡数码科技有限公司',
      creditCodeOrSource: '统一社会信用代码: 91310115MA1HXXXX92',
      cardOrderCount: 980,
      gmvUSD: 142000.0,
      deductFeeAmount: -5680.0,
      deductDetailText: '费率4% (退单抵扣$0)',
      payableAmount: 136320.0,
      actualPayoutAmount: 136320.0,
      actualPayoutNote: '应付待核',
      channel: 'CMB_DIRECT',
      channelName: '招行企业直连',
      channelIcon: 'corporate_fare',
      status: 'PENDING_APPROVAL',
      statusLabel: '待确认审批',
      inspectorData: {
        overview: {
          reconPassRate: '100.00%',
          reconNote: '980 笔卡密流水已完成三方核销验证，计费引擎核算通过',
          bankHostStatus: 'CMB-HOST-PENDING: 待复核出账',
          bankSerialNo: `BATCH-NEW-${Date.now().toString().slice(-6)}`,
          targetAccount: '招商银行上海分行陆家嘴支行 0219 **** **** 9102',
          taxInvoiceStatus: '等待商户寄达电子增值税发票',
          invoiceCode: '310022100981 | 待开具',
          taxNote: '依合同协议执行定期月度开票',
          netReceivableUSD: 136320.0,
          platformRetainFeeUSD: 5680.0,
          disputeDeductionUSD: 0.0
        },
        transactions: [
          {
            orderId: 'KD-20260915-SH-01',
            cardType: 'Steam US $100',
            faceValue: 100.0,
            rate: '96.0%',
            settleAmount: 96.0,
            finishTime: '2026-09-15 15:30:10',
            status: '核销完成 (VERIFIED)'
          }
        ],
        feeDeductions: [
          {
            itemCode: 'FEE-BASE-4PCT',
            itemName: '平台基础清算技术服务费',
            calcBase: '$142,000.00 GMV',
            ratePercent: '4.00%',
            amountUSD: 5680.0,
            direction: 'SUB',
            remark: '标准阶梯扣费'
          }
        ],
        disputes: [],
        payoutVoucher: {
          voucherNo: `VOUCH-${newNo}`,
          paymentMethod: '招商银行银企直联 Host-to-Host',
          payoutTime: '等待审批触发',
          invoiceNumber: 'TAX-PENDING',
          invoiceTaxAmount: 56800.0,
          verificationSeal: 'NEW-SETTLE-SEAL'
        },
        auditLogs: [
          {
            stepId: 'LOG-GEN01',
            actionName: '周期结算批次自动生成',
            operator: 'AUDIT-MGR-08',
            timestamp: new Date().toLocaleTimeString(),
            node: 'BATCH-GEN-CONTROLLER',
            notes: data.remark,
            verifyStatus: 'PASS'
          }
        ]
      }
    };

    setLedgers((prev) => [newItem, ...prev]);
    setKpiSummary((prev) => ({
      ...prev,
      pendingSettlementUSD: prev.pendingSettlementUSD + 136320.0,
      pendingMerchantCount: prev.pendingMerchantCount + 1
    }));
    setInspectedItemId(newItem.id);
    showToast(`批量生成结算单成功！已新增结算单 [${newNo}]。`);
  };

  // Single Action: Approve & Payout
  const handleSinglePayout = (item: SettlementLedgerItem) => {
    setLedgers((prev) =>
      prev.map((l) =>
        l.id === item.id
          ? {
              ...l,
              status: 'SETTLED',
              statusLabel: '● 已结案',
              actualPayoutNote: `实结: $${l.actualPayoutAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              inspectorData: {
                ...l.inspectorData,
                overview: {
                  ...l.inspectorData.overview,
                  bankHostStatus: 'CMB-HOST-TO-HOST: 打款成功',
                  bankSerialNo: `CMB-TX-${Date.now().toString().slice(-8)}`
                }
              }
            }
          : l
      )
    );

    setKpiSummary((prev) => ({
      ...prev,
      pendingSettlementUSD: Math.max(0, prev.pendingSettlementUSD - item.actualPayoutAmount),
      completedNetSettlementUSD: prev.completedNetSettlementUSD + item.actualPayoutAmount
    }));

    showToast(`结算单 [${item.settlementNo}] 已成功完成银企直联出账打款并平账！`);
  };

  // Single Action: Suspend or Unsuspend
  const handleToggleSuspend = (item: SettlementLedgerItem) => {
    const willSuspend = item.status !== 'SUSPENDED_RISK';
    setLedgers((prev) =>
      prev.map((l) =>
        l.id === item.id
          ? {
              ...l,
              status: willSuspend ? 'SUSPENDED_RISK' : 'PENDING_APPROVAL',
              statusLabel: willSuspend ? '● 差异挂起' : '待确认审批',
              actualPayoutNote: willSuspend ? '暂缓实付' : '应付待核',
              riskLevel: willSuspend ? 'RISK-L2' : undefined
            }
          : l
      )
    );

    setKpiSummary((prev) => ({
      ...prev,
      suspendedDisputeCount: willSuspend
        ? prev.suspendedDisputeCount + 1
        : Math.max(0, prev.suspendedDisputeCount - 1)
    }));

    showToast(
      willSuspend
        ? `结算单 [${item.settlementNo}] 已置为风险挂起，资金已锁定拦截。`
        : `结算单 [${item.settlementNo}] 已解挂并送入复审出账队列。`
    );
  };

  return (
    <div className="flex flex-col w-full pb-12 text-slate-800 antialiased">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Standard White Page Header Area */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              多方周期性账单汇总结算与出账控制台
            </h1>
            <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded font-mono text-[11px] font-bold">
              v2.0-STABLE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            支持商户接单承揽、推广员分润提成及渠道合作方的自动化阶梯计费、双人复核审批与银企直联直达打款
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors shadow-2xs border border-slate-200/80 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">receipt_long</span>
            <span>批量生成周期结算单</span>
          </button>
          <button
            type="button"
            onClick={handleOpenBatchPayout}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            <span>银企直联批量打款出账 ({selectedIds.length > 0 ? selectedIds.length : '全部待出'})</span>
          </button>
        </div>
      </header>

      {/* KPI Summary Banner (4-column cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: 待结算总额 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              本期待结算总额 (待出账)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-code-token text-[10px] font-semibold shrink-0">
              USD ACCRUAL
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="font-numeric-stat text-2xl md:text-[28px] text-slate-900 font-bold leading-none tracking-tight">
              ${kpiSummary.pendingSettlementUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="font-code-token text-xs text-slate-400 font-medium">USD</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-500 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>商户 <strong className="text-slate-900 font-semibold">{kpiSummary.pendingMerchantCount}</strong> 家</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>推广分佣 <strong className="text-slate-900 font-semibold">{kpiSummary.pendingAffiliateCount}</strong> 份</span>
            </span>
          </div>
        </div>

        {/* Card 2: 已完成结算净额 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              本期已完成结算净额
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-code-token text-[10px] font-semibold shrink-0 border border-emerald-200">
              100% 平账
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="font-numeric-stat text-2xl md:text-[28px] text-emerald-600 font-bold leading-none tracking-tight">
              ${kpiSummary.completedNetSettlementUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="font-code-token text-xs text-slate-400 font-medium">USD</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-500 text-xs">
            <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>银企全额打款平账</span>
            </span>
            <span className="font-code-token text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
              0 逾期
            </span>
          </div>
        </div>

        {/* Card 3: 平台综合扣划与毛利留存 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              平台综合扣划与毛利留存
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-code-token text-[10px] text-blue-700 font-semibold shrink-0">
              RETENTION
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="font-numeric-stat text-2xl md:text-[28px] text-blue-600 font-bold leading-none tracking-tight">
              ${kpiSummary.platformRetentionFeeUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="font-code-token text-xs text-slate-400 font-medium">USD</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-500 text-xs">
            <span className="text-slate-600">
              手续费净收 <strong className="text-slate-900 font-semibold">{kpiSummary.platformFeeRatePercent.toFixed(2)}%</strong>
            </span>
            <span className="font-numeric-table text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
              质押抵扣 ${kpiSummary.collateralDeductUSD.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 4: 异常挂起待处理结算单 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-caps text-[11px] text-red-600 uppercase tracking-wider font-bold">
              异常挂起待处理结算单
            </span>
            <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-code-token text-[10px] font-bold shrink-0">
              {kpiSummary.suspendedDisputeCount} 笔暂缓
            </span>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="font-numeric-stat text-2xl md:text-[28px] text-red-600 font-bold leading-none tracking-tight">
              0{kpiSummary.suspendedDisputeCount}
            </span>
            <span className="text-xs text-red-600 font-medium">笔争议拦截中</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
            <span className="text-red-600 inline-flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>汇差争议 / 争议卡单</span>
            </span>
            <span className="font-code-token text-[11px] text-slate-600 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
              {kpiSummary.suspendedRiskLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Operational Filter Hub & Tab Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 mb-4 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Tabs - Standard Image Tab Bar Style */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'ALL', label: '全部结算单', badge: `${ledgers.length}`, icon: 'receipt_long' },
              { id: 'MERCHANT', label: '商户接单结算', badge: '42', icon: 'storefront' },
              { id: 'AFFILIATE', label: '推广分佣出账', badge: '18', icon: 'groups' },
              { id: 'CHANNEL', label: '渠道合作方', badge: '4', icon: 'hub' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs sm:text-sm ${
                    isActive
                      ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
                      isActive ? 'bg-blue-100 text-[#004ac6] font-semibold' : 'bg-slate-100 text-slate-600 font-medium'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Date Periods & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setPeriodFilter('CURRENT')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  periodFilter === 'CURRENT'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                本月周期 (2026-09)
              </button>
              <button
                type="button"
                onClick={() => setPeriodFilter('LAST')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  periodFilter === 'LAST'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                上月归档 (2026-08)
              </button>
              <button
                type="button"
                onClick={() => setPeriodFilter('CUSTOM')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  periodFilter === 'CUSTOM'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                自定义账期
              </button>
            </div>

            <div className="relative min-w-[220px]">
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索结算单号 / 商户名称 / 推广ID..."
                className="w-full h-9 pl-9 pr-3 bg-slate-100 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
              className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs transition-colors border ${
                advancedFilterOpen
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>高级筛选</span>
            </button>
          </div>
        </div>

        {/* Advanced Filter Collapsible Bar */}
        {advancedFilterOpen && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in duration-100">
            <div>
              <label className="block text-slate-500 font-medium mb-1">按出账通道筛选</label>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="ALL">全部通道 (招行直联 / USDT / OPay)</option>
                <option value="CMB_DIRECT">招行企业直连</option>
                <option value="USDT_CONTRACT">USDT 智能合约</option>
                <option value="OPAY_DIRECT">OPay Local Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">按结算终态筛选</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="ALL">全部结算状态</option>
                <option value="SETTLED">已结案</option>
                <option value="PENDING_PAYOUT">待打款出账</option>
                <option value="PENDING_APPROVAL">待确认审批</option>
                <option value="SUSPENDED_RISK">差异挂起</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setChannelFilter('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs transition-colors"
              >
                重置筛选条件
              </button>
            </div>
          </div>
        )}
      </div>

      {/* High-Density Settlement Ledgers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1240px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-label-caps text-[11px] uppercase tracking-wider h-10 border-b border-slate-200">
                <th className="px-3 py-2 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredLedgers.length && filteredLedgers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                  />
                </th>
                <th className="px-3 py-2">结算单号 / 账期范围</th>
                <th className="px-3 py-2">结算对象 / 归属主体</th>
                <th className="px-3 py-2 text-right">卡单量 / GMV (USD)</th>
                <th className="px-3 py-2 text-right">扣除项 (手续费/判责)</th>
                <th className="px-3 py-2 text-right">应结 / 实结金额</th>
                <th className="px-3 py-2 text-center">出账通道</th>
                <th className="px-3 py-2 text-center">结算状态</th>
                <th className="px-3 py-2 text-right">操作指令</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-body-sm">
              {filteredLedgers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[32px] text-slate-300 block mb-1">
                      search_off
                    </span>
                    暂无符合条件的结算单记录
                  </td>
                </tr>
              ) : (
                filteredLedgers.map((row) => {
                  const isSelected = selectedIds.includes(row.id);
                  const isCurrentInspected = inspectedItemId === row.id;

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        row.status === 'SUSPENDED_RISK'
                          ? 'bg-red-50/20'
                          : isCurrentInspected
                          ? 'bg-blue-50/30'
                          : isSelected
                          ? 'bg-blue-50/20'
                          : ''
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(row.id)}
                          className="rounded text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                        />
                      </td>

                      {/* 结算单号 / 账期 */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => setInspectedItemId(row.id)}
                            className={`font-numeric-table text-xs font-semibold text-left cursor-pointer hover:underline ${
                              row.status === 'SUSPENDED_RISK' ? 'text-red-600' : 'text-blue-600'
                            }`}
                          >
                            {row.settlementNo}
                          </button>
                          <span
                            className={`font-code-token text-[10px] ${
                              row.status === 'SUSPENDED_RISK' ? 'text-red-500 font-medium' : 'text-slate-400'
                            }`}
                          >
                            {row.period}
                          </span>
                        </div>
                      </td>

                      {/* 结算对象 / 归属主体 */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded font-label-caps text-[10px] font-semibold ${
                              row.entityType === 'AFFILIATE'
                                ? 'bg-indigo-50 text-indigo-700'
                                : row.entityType === 'CHANNEL'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-slate-100 text-blue-700'
                            }`}
                          >
                            {row.entityTypeLabel}
                          </span>
                          <span
                            className={`font-headline-sm text-xs font-semibold truncate max-w-[200px] ${
                              row.status === 'SUSPENDED_RISK' ? 'text-red-700' : 'text-slate-900'
                            }`}
                          >
                            {row.targetEntity}
                          </span>
                        </div>
                        <span className="font-code-token text-[10px] text-slate-400 block truncate max-w-[260px] mt-0.5">
                          {row.creditCodeOrSource}
                        </span>
                      </td>

                      {/* 卡单量 / GMV */}
                      <td className="px-3 py-3 text-right">
                        <div className="font-numeric-table font-semibold text-slate-900">
                          {row.cardOrderCount.toLocaleString()} 笔
                        </div>
                        <div className="font-code-token text-[11px] text-slate-400">
                          ${row.gmvUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* 扣除项 */}
                      <td className="px-3 py-3 text-right">
                        <div
                          className={`font-numeric-table font-semibold ${
                            row.deductFeeAmount < 0 ? 'text-red-600' : 'text-slate-600'
                          }`}
                        >
                          {row.deductFeeAmount === 0 ? '-$0.00' : `-$${Math.abs(row.deductFeeAmount).toFixed(2)}`}
                        </div>
                        <div className="font-code-token text-[10px] text-slate-400">
                          {row.deductDetailText}
                        </div>
                      </td>

                      {/* 应结 / 实结金额 */}
                      <td className="px-3 py-3 text-right">
                        <div
                          className={`font-numeric-table font-bold ${
                            row.status === 'SUSPENDED_RISK' ? 'text-red-600' : 'text-slate-900'
                          }`}
                        >
                          ${row.payableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div
                          className={`font-code-token text-[10px] font-semibold ${
                            row.status === 'SETTLED'
                              ? 'text-emerald-700'
                              : row.status === 'SUSPENDED_RISK'
                              ? 'text-red-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.actualPayoutNote}
                        </div>
                      </td>

                      {/* 出账通道 */}
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 font-code-token text-[11px] text-slate-700">
                          <span className="material-symbols-outlined text-[13px] text-blue-600">
                            {row.channelIcon}
                          </span>
                          {row.channelName}
                        </span>
                      </td>

                      {/* 结算状态 */}
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-code-token text-[10px] font-bold ${
                            row.status === 'SETTLED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.status === 'PENDING_PAYOUT'
                              ? 'bg-blue-100 text-blue-800'
                              : row.status === 'SUSPENDED_RISK'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {row.statusLabel}
                        </span>
                      </td>

                      {/* 操作指令 */}
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectedItemId(row.id)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-blue-700 font-headline-sm text-xs transition-colors"
                          >
                            结算详情
                          </button>

                          {row.status === 'SETTLED' && (
                            <button
                              type="button"
                              disabled
                              className="px-2 py-1 rounded bg-slate-50 text-slate-400 cursor-not-allowed text-xs"
                            >
                              已出账
                            </button>
                          )}

                          {row.status === 'PENDING_PAYOUT' && (
                            <button
                              type="button"
                              onClick={() => handleSinglePayout(row)}
                              className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 font-headline-sm text-xs transition-colors shadow-2xs"
                            >
                              确认并出账
                            </button>
                          )}

                          {row.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSinglePayout(row)}
                                className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 font-headline-sm text-xs transition-colors shadow-2xs"
                              >
                                出账审批
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleSuspend(row)}
                                className="px-2 py-1 rounded bg-slate-100 text-red-600 hover:bg-red-50 text-xs font-headline-sm transition-colors"
                              >
                                挂起
                              </button>
                            </>
                          )}

                          {row.status === 'SUSPENDED_RISK' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setInspectedItemId(row.id);
                                  showToast(`已调阅差异单 [${row.settlementNo}] 详情，建议在第四 Tab 处理争议判责。`);
                                }}
                                className="px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 text-xs font-headline-sm transition-colors"
                              >
                                对账调解
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleSuspend(row)}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-headline-sm transition-colors"
                              >
                                解挂复审
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              当前显示第 <strong className="text-slate-900 font-numeric-table">1 - {filteredLedgers.length}</strong> 项，共计{' '}
              <strong className="text-slate-900 font-numeric-table">{filteredLedgers.length}</strong> 份周期结算单
            </span>
            <div className="flex items-center gap-1">
              <span>每页:</span>
              <select className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-800 focus:outline-none text-xs">
                <option>10条/页</option>
                <option>20条/页</option>
                <option>50条/页</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded bg-blue-600 text-white font-semibold flex items-center justify-center"
            >
              1
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center"
            >
              2
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center"
            >
              3
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deep Settlement Inspector Drawer (Integrated Visual Accordion) */}
      <SettlementInspectorSection selectedItem={currentInspectedItem} />

      {/* Section Standard: Business Boundary Specification Banner */}
      <div className="bg-slate-100/80 border border-slate-200/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">policy</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-sm font-bold text-slate-900">
                业务边界与推广结算协同规范声明
              </span>
              <span className="bg-blue-50 border border-blue-200 text-blue-700 font-code-token text-[10px] font-bold px-1.5 py-0.2 rounded">
                MANDATORY PROTOCOL
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              明确系统职责分工：<strong className="text-slate-900">【增长运营端】</strong> 负责全链路多级分销佣金核算、梯度算法执行与结算提成单发起；<strong className="text-slate-900">【财务结算端】</strong> 仅作为清算受理与终审出账节点，负责执行实名KYC比对、风控流水扣除、银企直联付款及凭证回写，杜绝跨权调账与账目倒挂。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-code-token text-[11px] text-emerald-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            流水回写通道保持畅通
          </span>
        </div>
      </div>

      {/* Modals */}
      <GenerateSettlementModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onConfirm={handleConfirmGenerate}
      />

      <BatchPayoutModal
        isOpen={isBatchPayoutModalOpen}
        selectedItems={
          selectedIds.length > 0
            ? ledgers.filter((l) => selectedIds.includes(l.id))
            : ledgers.filter((l) => l.status === 'PENDING_PAYOUT' || l.status === 'PENDING_APPROVAL')
        }
        onClose={() => setIsBatchPayoutModalOpen(false)}
        onConfirmPayout={handleConfirmBatchPayout}
      />
    </div>
  );
};
