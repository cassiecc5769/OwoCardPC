import React, { useState, useMemo, useRef } from 'react';
import { NavPath } from '../types';
import { INITIAL_MERCHANT_LEDGER } from '../data/financeAccountData';

interface FinanceAccountManagementViewProps {
  onNavigate?: (path: NavPath) => void;
}

type AccountTab = 'platform' | 'merchant' | 'wallet';
type MerchantWalletStatus = 'NORMAL' | 'DISABLED';
type MerchantDrawer = 'wallet' | 'points' | 'uAddress' | 'ledger' | 'recharge' | null;
type MerchantWalletAction = 'DISABLE' | 'ENABLE' | 'FREEZE' | 'UNFREEZE';
type MerchantPointsAction = 'RECHARGE' | 'WITHDRAW';
type MerchantOperationType = '充值积点' | '撤回积点' | '争议赔付' | '人工冻结' | '交易支出' | '平台费用';
type MerchantOperationStatus = 'SUCCESS' | 'FAILED';
type RechargeDetailType = 'RECHARGE' | 'WITHDRAW';
type RechargeDetailStatus = 'SUCCESS' | 'FAILED' | 'PENDING';
type RechargeDetailSource = 'PLATFORM' | 'SELF';
type UserWalletTab = 'management' | 'withdrawals';
type UserWalletStatus = '正常' | '已禁止提现';
type UserWalletAction = 'DISABLE_WITHDRAW' | 'ENABLE_WITHDRAW' | 'FREEZE' | 'UNFREEZE';
type ManualWalletAdjustmentType = 'CREDIT' | 'DEBIT';
type WithdrawalBusinessType = '提现' | '转账';
type WithdrawalStatus = '提现中' | '提现成功' | '提现失败' | '待审核';

interface UserWalletAccount {
  uid: string;
  userName: string;
  phone: string;
  totalBalance: number;
  availableBalance: number;
  frozenBalance: number;
  withdrawingAmount: number;
  compensatedAmount: number;
  clawbackAmount: number;
  status: UserWalletStatus;
}

interface UserWalletLedger {
  id: string;
  time: string;
  uid: string;
  actionType: string;
  amount: string;
  orderId: string;
  reason: string;
  operator: string;
  approver: string;
  proofImages?: string[];
  internalRemark?: string;
}

interface WithdrawalRecord {
  id: string;
  businessType: WithdrawalBusinessType;
  amountNgn: number;
  amountCny: number;
  serviceFee: number;
  exchangeRate: number;
  bank: string;
  cardNumber: string;
  payeeName: string;
  userId: string;
  userName: string;
  purpose: 'Gift' | 'Logistic';
  sessionId: string;
  initiatedAt: string;
  completedAt?: string;
  status: WithdrawalStatus;
  remark?: string;
}

interface MerchantAccount {
  id: string;
  mid: string;
  name: string;
  availablePoints: number;
  frozenPoints: number;
  cumulativeRechargePoints: number;
  walletStatus: MerchantWalletStatus;
  uAddress: string;
  rechargeAmountMarker: string;
  lastUpdateTime: string;
}

interface MerchantOperationLog {
  id: string;
  time: string;
  merchantId: string;
  merchantName: string;
  merchantCode: string;
  type: MerchantOperationType;
  amount: number;
  direction: '+' | '-' | '—';
  beforeAvailable: number;
  beforeFrozen: number;
  beforeTotal: number;
  afterAvailable: number;
  afterFrozen: number;
  afterTotal: number;
  relatedOrderNo?: string;
  remark: string;
  proofCount: number;
  proofImages: string[];
  operator: string;
  status: MerchantOperationStatus;
}

interface MerchantRechargeDetail {
  id: string;
  merchantId: string;
  type: RechargeDetailType;
  points: number;
  uRate?: number;
  uAmount?: number;
  status: RechargeDetailStatus;
  time: string;
  operator: string;
  source: RechargeDetailSource;
  remark?: string;
  proofImages: string[];
}

interface ConfirmState {
  title: string;
  body: string;
  confirmLabel: string;
  tone: 'primary' | 'danger';
  details?: Array<{ label: string; value: string; emphasis?: boolean }>;
  notice?: string;
  onConfirm: () => void;
}

const createProofPlaceholder = (label: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100" viewBox="0 0 160 100"><rect width="160" height="100" rx="10" fill="#f1f5f9"/><rect x="10" y="10" width="140" height="80" rx="7" fill="#e2e8f0"/><path d="M32 70l25-25 18 18 13-13 25 20H32z" fill="#94a3b8"/><circle cx="57" cy="35" r="7" fill="#64748b"/><text x="80" y="84" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="#475569">${label}</text></svg>`)}`;

export const FinanceAccountManagementView: React.FC<FinanceAccountManagementViewProps> = ({ onNavigate }) => {
  const [accountTab, setAccountTab] = useState<AccountTab>('platform');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 商户账户（积点）管理
  const [merchantAccounts, setMerchantAccounts] = useState<MerchantAccount[]>(() =>
    INITIAL_MERCHANT_LEDGER.map((merchant, index) => ({
      id: merchant.id,
      mid: merchant.mid,
      name: merchant.name,
      availablePoints: merchant.availablePoints,
      frozenPoints: merchant.frozenEscrowPoints,
      cumulativeRechargePoints: merchant.totalPoints + [1680000, 920000, 120000, 2480000, 635000, 880000, 410000, 95000][index],
      walletStatus: merchant.id === 'MCH-005' ? 'DISABLED' : 'NORMAL',
      uAddress: index % 2 === 0 ? `T${merchant.mid.replace('M', 'Q')}9x7K2m8n...${merchant.mid.slice(-2)}pQ88Z1` : '',
      rechargeAmountMarker: index % 3 === 0 ? '.45' : '',
      lastUpdateTime: `2026-10-16 ${merchant.lastUpdateTime}`
    }))
  );
  const [merchantKeyword, setMerchantKeyword] = useState('');
  const [merchantStatusFilter, setMerchantStatusFilter] = useState<'ALL' | MerchantWalletStatus>('ALL');
  const [merchantDrawer, setMerchantDrawer] = useState<MerchantDrawer>(null);
  const [selectedMerchantId, setSelectedMerchantId] = useState('MCH-001');
  const [walletOperationType, setWalletOperationType] = useState<MerchantWalletAction>('DISABLE');
  const [walletOperationAmount, setWalletOperationAmount] = useState('');
  const [walletOperationRemark, setWalletOperationRemark] = useState('');
  const [pointsOperationType, setPointsOperationType] = useState<MerchantPointsAction>('RECHARGE');
  const [pointsOperationAmount, setPointsOperationAmount] = useState('');
  const [pointsOperationRemark, setPointsOperationRemark] = useState('');
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [proofFilePreviews, setProofFilePreviews] = useState<string[]>([]);
  const [isProofDragOver, setIsProofDragOver] = useState(false);
  const proofInputRef = useRef<HTMLInputElement>(null);
  const [walletProofFiles, setWalletProofFiles] = useState<File[]>([]);
  const [walletProofFilePreviews, setWalletProofFilePreviews] = useState<string[]>([]);
  const [isWalletProofDragOver, setIsWalletProofDragOver] = useState(false);
  const walletProofInputRef = useRef<HTMLInputElement>(null);
  const [uAddressValue, setUAddressValue] = useState('');
  const [rechargeAmountMarkerValue, setRechargeAmountMarkerValue] = useState('');
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [proofPreview, setProofPreview] = useState<{ images: string[]; index: number } | null>(null);
  const [merchantOperationLogs, setMerchantOperationLogs] = useState<MerchantOperationLog[]>(() =>
    INITIAL_MERCHANT_LEDGER.slice(0, 3).map<MerchantOperationLog>((merchant, index) => {
      const beforeAvailable = merchant.availablePoints + (index === 0 ? -1000000 : index === 1 ? -800000 : 50000);
      const beforeFrozen = merchant.frozenEscrowPoints;
      const beforeTotal = beforeAvailable + beforeFrozen;
      const isFreeze = index === 1;
      return {
        id: `LEDGER-MERCHANT-${String(index + 1).padStart(4, '0')}`,
        time: `2026-10-16 ${merchant.lastUpdateTime}`,
        merchantId: merchant.id,
        merchantName: merchant.name,
        merchantCode: merchant.mid,
        type: isFreeze ? '人工冻结' : index === 0 ? '充值积点' : '撤回积点',
        amount: isFreeze ? 800000 : index === 0 ? 1000000 : 50000,
        direction: isFreeze ? '—' : index === 0 ? '+' : '-',
        beforeAvailable,
        beforeFrozen,
        beforeTotal,
        afterAvailable: isFreeze ? beforeAvailable - 800000 : index === 0 ? beforeAvailable + 1000000 : beforeAvailable - 50000,
        afterFrozen: isFreeze ? beforeFrozen + 800000 : beforeFrozen,
        afterTotal: isFreeze ? beforeTotal : index === 0 ? beforeTotal + 1000000 : beforeTotal - 50000,
        relatedOrderNo: index === 0 ? 'RCH-20261016-0001' : index === 2 ? 'WDL-20261016-0003' : undefined,
        remark: isFreeze ? '风控工单 RISK-ALERT-CASE-8812，转入争议冻结池' : index === 0 ? '对公充值到账核验通过' : '仲裁扣减责任商户积点',
        proofCount: 1,
        proofImages: [createProofPlaceholder(index === 0 ? '充值凭证' : isFreeze ? '冻结凭证' : '撤回凭证')],
        operator: index === 1 ? '风控主管-陈安 (RISK02)' : '财务专员-张华 (FA02)',
        status: 'SUCCESS'
      };
    }).concat([
      {
        id: 'LEDGER-MERCHANT-MOCK-0004',
        time: '2026-10-15 13:22:18',
        merchantId: 'MCH-001',
        merchantName: INITIAL_MERCHANT_LEDGER[0].name,
        merchantCode: INITIAL_MERCHANT_LEDGER[0].mid,
        type: '争议赔付' as MerchantOperationType,
        amount: 12000,
        direction: '-',
        beforeAvailable: 38450000,
        beforeFrozen: 4350000,
        beforeTotal: 42800000,
        afterAvailable: 38438000,
        afterFrozen: 4350000,
        afterTotal: 42788000,
        relatedOrderNo: 'DSP-20261015-0088',
        remark: '争议订单 ORD-20261015-0088 赔付扣减',
        proofCount: 0,
        proofImages: [],
        operator: '售后专员-李娜 (AF03)',
        status: 'SUCCESS' as MerchantOperationStatus
      },
      {
        id: 'LEDGER-MERCHANT-MOCK-0005',
        time: '2026-10-14 18:06:42',
        merchantId: 'MCH-001',
        merchantName: INITIAL_MERCHANT_LEDGER[0].name,
        merchantCode: INITIAL_MERCHANT_LEDGER[0].mid,
        type: '交易支出' as MerchantOperationType,
        amount: 8600,
        direction: '-',
        beforeAvailable: 38438000,
        beforeFrozen: 4350000,
        beforeTotal: 42788000,
        afterAvailable: 38429400,
        afterFrozen: 4350000,
        afterTotal: 42779400,
        relatedOrderNo: 'ORD-20261014-3106',
        remark: '交易订单 ORD-20261014-3106 资金支出',
        proofCount: 0,
        proofImages: [],
        operator: '系统自动记账 (SYS01)',
        status: 'SUCCESS' as MerchantOperationStatus
      },
      {
        id: 'LEDGER-MERCHANT-MOCK-0006',
        time: '2026-10-13 10:45:09',
        merchantId: 'MCH-001',
        merchantName: INITIAL_MERCHANT_LEDGER[0].name,
        merchantCode: INITIAL_MERCHANT_LEDGER[0].mid,
        type: '平台费用' as MerchantOperationType,
        amount: 3000,
        direction: '-',
        beforeAvailable: 38429400,
        beforeFrozen: 4350000,
        beforeTotal: 42779400,
        afterAvailable: 38426400,
        afterFrozen: 4350000,
        afterTotal: 42776400,
        remark: '平台服务费结算',
        proofCount: 0,
        proofImages: [],
        operator: '财务专员-张华 (FA02)',
        status: 'FAILED' as MerchantOperationStatus
      }
    ])
  );
  const [merchantRechargeDetails] = useState<MerchantRechargeDetail[]>(() =>
    INITIAL_MERCHANT_LEDGER.flatMap((merchant, index) => [
      {
        id: `RECHARGE-${merchant.id}-0001`,
        merchantId: merchant.id,
        type: 'RECHARGE',
        points: 1000000 + index * 120000,
        uRate: 7.12,
        uAmount: (1000000 + index * 120000) / 7.12,
        status: 'SUCCESS',
        time: `2026-10-16 ${merchant.lastUpdateTime}`,
        operator: '财务专员-张华 (FA02)',
        source: 'PLATFORM',
        remark: '对公充值到账核验通过',
        proofImages: [createProofPlaceholder('充值凭证')]
      },
      {
        id: `RECHARGE-${merchant.id}-0002`,
        merchantId: merchant.id,
        type: 'WITHDRAW',
        points: 50000 + index * 5000,
        status: 'SUCCESS',
        time: `2026-10-15 16:${String(20 + index).padStart(2, '0')}:18`,
        operator: '财务专员-张华 (FA02)',
        source: 'PLATFORM',
        remark: '按财务审核结果撤回积点',
        proofImages: []
      },
      {
        id: `RECHARGE-${merchant.id}-0003`,
        merchantId: merchant.id,
        type: 'RECHARGE',
        points: 250000 + index * 10000,
        status: 'PENDING',
        time: `2026-10-14 11:${String(8 + index).padStart(2, '0')}:36`,
        operator: '商户自助充值',
        source: 'SELF',
        remark: '未获取到当前 U 汇率，待汇率获取后自动补入账',
        proofImages: []
      },
      {
        id: `RECHARGE-${merchant.id}-0004`,
        merchantId: merchant.id,
        type: 'RECHARGE',
        points: 120000 + index * 8000,
        uRate: 7.08,
        uAmount: (120000 + index * 8000) / 7.08,
        status: 'FAILED',
        time: `2026-10-12 09:${String(42 + index).padStart(2, '0')}:07`,
        operator: '商户自助充值',
        source: 'SELF',
        remark: '充值凭证校验失败',
        proofImages: [createProofPlaceholder('失败凭证')]
      },
      ...Array.from({ length: 8 }, (_, extraIndex) => {
        const points = 80000 + extraIndex * 7500;
        const hasRate = extraIndex % 2 === 0;
        const type: RechargeDetailType = extraIndex % 3 === 0 ? 'RECHARGE' : 'WITHDRAW';
        const status: RechargeDetailStatus = extraIndex % 4 === 0 ? 'PENDING' : extraIndex % 4 === 1 ? 'FAILED' : 'SUCCESS';
        return {
          id: `RECHARGE-${merchant.id}-${String(extraIndex + 5).padStart(4, '0')}`,
          merchantId: merchant.id,
          type,
          points,
          ...(hasRate ? { uRate: 7.06 + extraIndex * 0.01, uAmount: points / (7.06 + extraIndex * 0.01) } : {}),
          status,
          time: `2026-10-${String(11 - extraIndex).padStart(2, '0')} 10:${String(12 + extraIndex).padStart(2, '0')}:24`,
          operator: type === 'RECHARGE' && extraIndex % 2 === 0 ? '商户自助充值' : '财务专员-张华 (FA02)',
          source: type === 'RECHARGE' && extraIndex % 2 === 0 ? 'SELF' as RechargeDetailSource : 'PLATFORM' as RechargeDetailSource,
          remark: status === 'PENDING' ? '待获取汇率后自动补入账' : status === 'FAILED' ? '系统校验未通过' : undefined,
          proofImages: status === 'FAILED' ? [createProofPlaceholder('失败凭证')] : []
        };
      })
    ])
  );
  const [rechargeTypeFilter, setRechargeTypeFilter] = useState<'ALL' | RechargeDetailType>('ALL');
  const [rechargeStatusFilter, setRechargeStatusFilter] = useState<'ALL' | RechargeDetailStatus>('ALL');
  const [rechargeSourceFilter, setRechargeSourceFilter] = useState<'ALL' | RechargeDetailSource>('ALL');
  const [rechargeStartDate, setRechargeStartDate] = useState('');
  const [rechargeEndDate, setRechargeEndDate] = useState('');
  const [rechargePage, setRechargePage] = useState(1);
  const [rechargePageSize, setRechargePageSize] = useState(10);
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'ALL' | MerchantOperationType>('ALL');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<'ALL' | MerchantOperationStatus>('ALL');
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(10);

  const selectedMerchant = merchantAccounts.find(merchant => merchant.id === selectedMerchantId) || merchantAccounts[0];
  const filteredMerchantAccounts = useMemo(() => {
    const keyword = merchantKeyword.trim().toLowerCase();
    return merchantAccounts.filter(merchant => {
      const matchesKeyword = !keyword || merchant.name.toLowerCase().includes(keyword) || merchant.mid.toLowerCase().includes(keyword);
      const matchesStatus = merchantStatusFilter === 'ALL' || merchant.walletStatus === merchantStatusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [merchantAccounts, merchantKeyword, merchantStatusFilter]);

  const filteredRechargeDetails = useMemo(() => {
    return merchantRechargeDetails
      .filter(detail => detail.merchantId === selectedMerchant?.id)
      .filter(detail => rechargeTypeFilter === 'ALL' || detail.type === rechargeTypeFilter)
      .filter(detail => rechargeStatusFilter === 'ALL' || detail.status === rechargeStatusFilter)
      .filter(detail => rechargeSourceFilter === 'ALL' || detail.source === rechargeSourceFilter)
      .filter(detail => !rechargeStartDate || detail.time.slice(0, 10) >= rechargeStartDate)
      .filter(detail => !rechargeEndDate || detail.time.slice(0, 10) <= rechargeEndDate);
  }, [merchantRechargeDetails, selectedMerchant, rechargeTypeFilter, rechargeStatusFilter, rechargeSourceFilter, rechargeStartDate, rechargeEndDate]);

  const pagedRechargeDetails = filteredRechargeDetails.slice((rechargePage - 1) * rechargePageSize, rechargePage * rechargePageSize);
  const rechargePageCount = Math.max(1, Math.ceil(filteredRechargeDetails.length / rechargePageSize));
  const filteredMerchantOperationLogs = useMemo(() => merchantOperationLogs
    .filter(log => log.merchantId === selectedMerchant?.id)
    .filter(log => ledgerTypeFilter === 'ALL' || log.type === ledgerTypeFilter)
    .filter(log => ledgerStatusFilter === 'ALL' || log.status === ledgerStatusFilter)
    .filter(log => !ledgerStartDate || log.time.slice(0, 10) >= ledgerStartDate)
    .filter(log => !ledgerEndDate || log.time.slice(0, 10) <= ledgerEndDate),
  [merchantOperationLogs, selectedMerchant, ledgerTypeFilter, ledgerStatusFilter, ledgerStartDate, ledgerEndDate]);
  const pagedMerchantOperationLogs = filteredMerchantOperationLogs.slice((ledgerPage - 1) * ledgerPageSize, ledgerPage * ledgerPageSize);
  const ledgerPageCount = Math.max(1, Math.ceil(filteredMerchantOperationLogs.length / ledgerPageSize));

  const formatPoints = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const getMerchantTotal = (merchant: MerchantAccount) => merchant.availablePoints + merchant.frozenPoints;
  const getLedgerTime = () => new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');

  // 平台账户 (5.2) 水位与数据
  const [platformMetrics] = useState({
    totalBalance: 1850000.0,
    availableBalance: 1240000.0,
    frozenBalance: 410000.0,
    pendingPayout: 200000.0,
    safetyWatermark: 300000.0, // 30万最低安全水位
    warningWatermark: 500000.0, // 50万财务预警水位
    estimatedWithdrawalCapacity: 1040000.0,
    recentInflow: '$150,000.00 (对公电汇)',
    lastChangeTime: '15:20:10'
  });

  // 用户钱包操作 Modal (5.4 & 5.5)
  const [showWalletActionModal, setShowWalletActionModal] = useState(false);
  const [walletActionType, setWalletActionType] = useState<UserWalletAction>('DISABLE_WITHDRAW');
  const [targetUserUid, setTargetUserUid] = useState('US-USR-8804912');
  const [actionAmount, setActionAmount] = useState('50.00');
  const [actionReason, setActionReason] = useState('售后争议卡密核销损失补发关怀金');
  const [userWalletProofFiles, setUserWalletProofFiles] = useState<File[]>([]);
  const [userWalletProofFilePreviews, setUserWalletProofFilePreviews] = useState<string[]>([]);
  const [isUserWalletProofDragOver, setIsUserWalletProofDragOver] = useState(false);
  const userWalletProofInputRef = useRef<HTMLInputElement>(null);
  const [userWalletTab, setUserWalletTab] = useState<UserWalletTab>('management');
  const [walletKeyword, setWalletKeyword] = useState('');
  const [walletStatusFilter, setWalletStatusFilter] = useState<'ALL' | UserWalletStatus>('ALL');
  const [walletLedgerUser, setWalletLedgerUser] = useState<UserWalletAccount | null>(null);
  const [walletLedgerKeyword, setWalletLedgerKeyword] = useState('');
  const [withdrawalKeyword, setWithdrawalKeyword] = useState('');
  const [withdrawalBusinessTypeFilter, setWithdrawalBusinessTypeFilter] = useState<'ALL' | WithdrawalBusinessType>('ALL');
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState<'ALL' | WithdrawalStatus>('ALL');
  const [withdrawalDate, setWithdrawalDate] = useState('');
  const [cardLogRecord, setCardLogRecord] = useState<WithdrawalRecord | null>(null);
  const [manualAdjustmentUser, setManualAdjustmentUser] = useState<UserWalletAccount | null>(null);
  const [manualAdjustmentType, setManualAdjustmentType] = useState<ManualWalletAdjustmentType>('CREDIT');
  const [manualAdjustmentAmount, setManualAdjustmentAmount] = useState('');
  const [manualAdjustmentReason, setManualAdjustmentReason] = useState('');
  const [manualAdjustmentRemark, setManualAdjustmentRemark] = useState('');

  // 用户钱包 Mock 数据 (5.4)
  const [walletList, setWalletList] = useState<UserWalletAccount[]>([
    {
      uid: 'USUFXXP13',
      userName: 'cassie456654',
      phone: '138****0912',
      totalBalance: 1250.0,
      availableBalance: 850.0,
      frozenBalance: 200.0,
      withdrawingAmount: 200.0,
      compensatedAmount: 100.0,
      clawbackAmount: 0.0,
      status: '正常'
    },
    {
      uid: 'US-USR-9921010',
      userName: 'Chinedu Obi',
      phone: '139****9921',
      totalBalance: 3400.0,
      availableBalance: 1200.0,
      frozenBalance: 2200.0,
      withdrawingAmount: 2200.0, // 提现处理中
      compensatedAmount: 0.0,
      clawbackAmount: 50.0,
      status: '正常'
    },
    {
      uid: 'USUSRAG72',
      userName: 'gift_oba22',
      phone: '156****2761',
      totalBalance: 780.5,
      availableBalance: 480.5,
      frozenBalance: 300.0,
      withdrawingAmount: 0,
      compensatedAmount: 30.0,
      clawbackAmount: 0,
      status: '已禁止提现'
    },
    {
      uid: 'USUFPQK88',
      userName: 'logistic_adam',
      phone: '186****1549',
      totalBalance: 5260.0,
      availableBalance: 5260.0,
      frozenBalance: 0,
      withdrawingAmount: 0,
      compensatedAmount: 150.0,
      clawbackAmount: 20.0,
      status: '正常'
    }
  ]);

  // 钱包 Ledger 流水
  const [walletLedgers, setWalletLedger] = useState<UserWalletLedger[]>([
    {
      id: 'WLEDGER-8812',
      time: '15:10:02',
      uid: 'USUFXXP13',
      actionType: '补偿入账 (COMPENSATE)',
      amount: '+ $50.00',
      orderId: 'ORD-20261005-882',
      reason: '客诉争议超时赔付垫付',
      operator: '客服专员-李敏 (CS01)',
      approver: '财务主管-王总 (FA01)'
    },
    {
      id: 'WLEDGER-8799',
      time: '2026-10-15 18:42:10',
      uid: 'USUFXXP13',
      actionType: '提现冻结 (WITHDRAW_FREEZE)',
      amount: '- ₦52,000.00',
      orderId: 'WD2026072003002',
      reason: '提现申请已受理，资金转入提现中余额',
      operator: '系统自动记账 (SYS01)',
      approver: '—'
    },
    {
      id: 'WLEDGER-8708',
      time: '2026-10-14 09:18:34',
      uid: 'USUSRAG72',
      actionType: '人工冻结 (FREEZE)',
      amount: '- ₦30,000.00',
      orderId: 'RISK-20261014-031',
      reason: '风控复核期间限制资金出金',
      operator: '风控主管-陈安 (RISK02)',
      approver: '财务主管-王总 (FA01)'
    }
  ]);

  const [withdrawalRecords] = useState<WithdrawalRecord[]>([
    {
      id: 'WD2026072003002', businessType: '提现', amountNgn: 52000, amountCny: 238.42, serviceFee: 520,
      exchangeRate: 218.10, bank: 'Access Bank', cardNumber: '0123 4567 8901', payeeName: 'Cassie Adewale',
      userId: 'USUFXXP13', userName: 'cassie456654', purpose: 'Gift', sessionId: '100033260720052308617786817689',
      initiatedAt: '2026-07-20 05:23:08', status: '提现中', remark: '首次大额提现，等待渠道回调'
    },
    {
      id: 'WD2026072002988', businessType: '转账', amountNgn: 18000, amountCny: 82.53, serviceFee: 180,
      exchangeRate: 218.10, bank: 'GTBank', cardNumber: '**** **** **** 9088', payeeName: 'Chinedu Obi',
      userId: 'US-USR-9921010', userName: 'Chinedu Obi', purpose: 'Logistic', sessionId: '100033260720043149772281684902',
      initiatedAt: '2026-07-20 03:14:49', completedAt: '2026-07-20 03:16:02', status: '提现成功'
    },
    {
      id: 'WD2026072002951', businessType: '提现', amountNgn: 30000, amountCny: 137.55, serviceFee: 300,
      exchangeRate: 218.10, bank: 'Zenith Bank', cardNumber: '**** **** **** 6162', payeeName: 'Gift Obafemi',
      userId: 'USUSRAG72', userName: 'gift_oba22', purpose: 'Gift', sessionId: '100033260720011824820983127644',
      initiatedAt: '2026-07-20 01:18:24', completedAt: '2026-07-20 01:21:38', status: '提现失败', remark: '收款卡状态异常，资金已原路解冻'
    },
    {
      id: 'WD2026071909821', businessType: '转账', amountNgn: 125000, amountCny: 573.12, serviceFee: 1250,
      exchangeRate: 218.10, bank: 'UBA', cardNumber: '**** **** **** 4507', payeeName: 'Adam Yusuf',
      userId: 'USUFPQK88', userName: 'logistic_adam', purpose: 'Logistic', sessionId: '100033260719223410446192830671',
      initiatedAt: '2026-07-19 22:34:10', status: '待审核', remark: '触发人工审核阈值'
    }
  ]);

  const filteredWalletList = useMemo(() => {
    const keyword = walletKeyword.trim().toLowerCase();
    return walletList.filter(wallet => {
      const matchesKeyword = !keyword || [wallet.uid, wallet.userName, wallet.phone].some(value => value.toLowerCase().includes(keyword));
      return matchesKeyword && (walletStatusFilter === 'ALL' || wallet.status === walletStatusFilter);
    });
  }, [walletList, walletKeyword, walletStatusFilter]);

  const filteredWalletLedgers = useMemo(() => {
    if (!walletLedgerUser) return [];
    const keyword = walletLedgerKeyword.trim().toLowerCase();
    return walletLedgers.filter(ledger => ledger.uid === walletLedgerUser.uid).filter(ledger =>
      !keyword || [ledger.id, ledger.orderId, ledger.actionType, ledger.reason].some(value => value.toLowerCase().includes(keyword))
    );
  }, [walletLedgers, walletLedgerUser, walletLedgerKeyword]);

  const filteredWithdrawalRecords = useMemo(() => {
    const keyword = withdrawalKeyword.trim().toLowerCase();
    return withdrawalRecords.filter(record => {
      const matchesKeyword = !keyword || [record.id, record.userId, record.userName, record.sessionId, record.cardNumber].some(value => value.toLowerCase().includes(keyword));
      const matchesType = withdrawalBusinessTypeFilter === 'ALL' || record.businessType === withdrawalBusinessTypeFilter;
      const matchesStatus = withdrawalStatusFilter === 'ALL' || record.status === withdrawalStatusFilter;
      const matchesDate = !withdrawalDate || record.initiatedAt.startsWith(withdrawalDate);
      return matchesKeyword && matchesType && matchesStatus && matchesDate;
    });
  }, [withdrawalRecords, withdrawalKeyword, withdrawalBusinessTypeFilter, withdrawalStatusFilter, withdrawalDate]);
  const selectedUserWallet = walletList.find(wallet => wallet.uid === targetUserUid);

  // 提现异常状态查询与解冻处理 (5.5)
  const [withdrawalTimeouts, setWithdrawalTimeouts] = useState([
    {
      id: 'WD-20261005-001',
      uid: 'US-USR-9921010',
      userName: 'Chinedu Obi',
      amount: 2200.0,
      channel: 'USDT-TRC20 代付网关',
      applyTime: '14:20:10',
      status: '处理中 (超时无回调)',
      queryResult: '未知 (CHANNEL_TIMEOUT)'
    }
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const openUserWalletActionDrawer = (wallet: UserWalletAccount) => {
    setTargetUserUid(wallet.uid);
    setWalletActionType(wallet.status === '已禁止提现' ? 'ENABLE_WITHDRAW' : 'DISABLE_WITHDRAW');
    setActionAmount('');
    setActionReason('');
    setUserWalletProofFiles([]);
    setUserWalletProofFilePreviews([]);
    setIsUserWalletProofDragOver(false);
    setShowWalletActionModal(true);
  };

  const openManualAdjustmentDrawer = (wallet: UserWalletAccount) => {
    setManualAdjustmentUser(wallet);
    setManualAdjustmentType('CREDIT');
    setManualAdjustmentAmount('');
    setManualAdjustmentReason('');
    setManualAdjustmentRemark('');
    setUserWalletProofFiles([]);
    setUserWalletProofFilePreviews([]);
    setIsUserWalletProofDragOver(false);
  };

  const downloadCsv = (fileName: string, headers: string[], rows: Array<Array<string | number>>) => {
    const quote = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const blob = new Blob([`\uFEFF${[headers, ...rows].map(row => row.map(quote).join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportUserWallets = () => {
    downloadCsv('用户钱包管理.csv', ['用户ID', '用户', '钱包状态', '钱包总余额(₦)', '可用余额(₦)', '冻结余额(₦)', '提现中余额(₦)', '累计补偿金(₦)', '累计追回金额(₦)'], filteredWalletList.map(wallet => [wallet.uid, wallet.userName, wallet.status, wallet.totalBalance, wallet.availableBalance, wallet.frozenBalance, wallet.withdrawingAmount, wallet.compensatedAmount, wallet.clawbackAmount]));
    showToast(`已导出 ${filteredWalletList.length} 条用户钱包记录`);
  };

  const exportWithdrawals = () => {
    downloadCsv('用户提现记录.csv', ['订单ID', '业务类型', '提现金额(₦)', '提现金额(¥)', '服务费(₦)', '法币汇率', '收卡银行', '收卡卡号', '收卡人姓名', '提现用户ID', '提现用户', '用途', 'SESSIONID', '发起时间', '完成时间', '状态', '备注'], filteredWithdrawalRecords.map(record => [record.id, record.businessType, record.amountNgn, record.amountCny, record.serviceFee, record.exchangeRate, record.bank, record.cardNumber, record.payeeName, record.userId, record.userName, record.purpose, record.sessionId, record.initiatedAt, record.completedAt || '', record.status, record.remark || '']));
    showToast(`已导出 ${filteredWithdrawalRecords.length} 条提现记录`);
  };

  const openMerchantDrawer = (merchant: MerchantAccount, drawer: Exclude<MerchantDrawer, null>) => {
    setSelectedMerchantId(merchant.id);
    setMerchantDrawer(drawer);
    if (drawer === 'uAddress') {
      setUAddressValue(merchant.uAddress);
      setRechargeAmountMarkerValue(merchant.rechargeAmountMarker);
    }
    if (drawer === 'wallet') {
      setWalletOperationType(merchant.walletStatus === 'DISABLED' ? 'ENABLE' : 'DISABLE');
      setWalletOperationAmount('');
      setWalletOperationRemark('');
      setWalletProofFiles([]);
      setWalletProofFilePreviews([]);
      setIsWalletProofDragOver(false);
    }
    if (drawer === 'points') {
      setPointsOperationType('RECHARGE');
      setPointsOperationAmount('');
      setPointsOperationRemark('');
      setProofFiles([]);
      setProofFilePreviews([]);
    }
    if (drawer === 'recharge') {
      setRechargeTypeFilter('ALL');
      setRechargeStatusFilter('ALL');
      setRechargeSourceFilter('ALL');
      setRechargeStartDate('');
      setRechargeEndDate('');
      setRechargePage(1);
      setRechargePageSize(10);
    }
    if (drawer === 'ledger') {
      setLedgerTypeFilter('ALL');
      setLedgerStatusFilter('ALL');
      setLedgerStartDate('');
      setLedgerEndDate('');
      setLedgerPage(1);
      setLedgerPageSize(10);
    }
  };

  const exportRechargeDetails = () => {
    const headers = ['充值类型', '积点数量', 'U汇率', 'U数量', '状态', '操作时间', '操作人', '来源', '备注', '截图凭证'];
    const csvRows = filteredRechargeDetails.map(detail => [
      detail.type === 'RECHARGE' ? '积点充值' : '积点撤回',
      `${detail.type === 'RECHARGE' ? '+' : '-'}${formatPoints(detail.points)}`,
      detail.uRate === undefined ? '' : detail.uRate.toFixed(4),
      detail.uAmount === undefined ? '' : detail.uAmount.toFixed(2),
      detail.status === 'SUCCESS' ? '成功' : detail.status === 'FAILED' ? '失败' : '待入账',
      detail.time,
      detail.operator,
      detail.source === 'PLATFORM' ? '平台' : '自助充值',
      detail.remark || '',
      detail.proofImages.length > 0 ? `${detail.proofImages.length}张` : ''
    ]);
    const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...csvRows].map(row => row.map(escapeCsvValue).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selectedMerchant.mid}-充值明细-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast(`已导出 ${filteredRechargeDetails.length} 条充值明细`);
  };

  const exportMerchantOperationLogs = () => {
    const headers = ['操作时间', '操作类型', '变动积点', '操作前余额', '操作后余额', '关联单号', '状态', '备注', '操作人'];
    const csvRows = filteredMerchantOperationLogs.map(log => [
      log.time,
      log.type,
      log.direction === '—' ? '—' : `${log.direction}${formatPoints(log.amount)}`,
      `可用 ${formatPoints(log.beforeAvailable)} / 冻结 ${formatPoints(log.beforeFrozen)} / 总计 ${formatPoints(log.beforeTotal)}`,
      `可用 ${formatPoints(log.afterAvailable)} / 冻结 ${formatPoints(log.afterFrozen)} / 总计 ${formatPoints(log.afterTotal)}`,
      log.relatedOrderNo || '',
      log.status === 'SUCCESS' ? '成功' : '失败',
      log.remark,
      log.operator
    ]);
    const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...csvRows].map(row => row.map(escapeCsvValue).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selectedMerchant.mid}-资金操作流水-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast(`已导出 ${filteredMerchantOperationLogs.length} 条资金操作流水`);
  };

  const appendMerchantLog = (log: MerchantOperationLog) => {
    setMerchantOperationLogs(previous => [log, ...previous]);
  };

  const executeMerchantWalletAction = (merchant: MerchantAccount, action: MerchantWalletAction, amount: number, remark: string, proofImages: string[]) => {
    const beforeAvailable = merchant.availablePoints;
    const beforeFrozen = merchant.frozenPoints;
    const beforeTotal = getMerchantTotal(merchant);
    let afterAvailable = beforeAvailable;
    let afterFrozen = beforeFrozen;
    let nextStatus = merchant.walletStatus;
    let type: MerchantOperationType = '人工冻结';

    if (action === 'DISABLE') {
      nextStatus = 'DISABLED';
      type = '人工冻结';
    } else if (action === 'ENABLE') {
      nextStatus = 'NORMAL';
      type = '人工冻结';
    } else if (action === 'FREEZE') {
      afterAvailable -= amount;
      afterFrozen += amount;
      type = '人工冻结';
    } else {
      afterAvailable += amount;
      afterFrozen -= amount;
      type = '人工冻结';
    }

    setMerchantAccounts(previous => previous.map(item => item.id === merchant.id ? {
      ...item,
      availablePoints: afterAvailable,
      frozenPoints: afterFrozen,
      walletStatus: nextStatus,
      lastUpdateTime: getLedgerTime()
    } : item));

    appendMerchantLog({
      id: `LEDGER-MERCHANT-${Date.now()}`,
      time: getLedgerTime(),
      merchantId: merchant.id,
      merchantName: merchant.name,
      merchantCode: merchant.mid,
      type,
      amount,
      direction: action === 'FREEZE' || action === 'UNFREEZE' ? '—' : '—',
      beforeAvailable,
      beforeFrozen,
      beforeTotal,
      afterAvailable,
      afterFrozen,
      afterTotal: afterAvailable + afterFrozen,
      remark,
      proofCount: proofImages.length,
      proofImages,
      operator: '财务专员-张华 (FA02)',
      status: 'SUCCESS'
    });
    setMerchantDrawer(null);
    setConfirmState(null);
    showToast(`已完成${type}：${merchant.name}`);
  };

  const handleMerchantWalletSubmit = () => {
    const merchant = selectedMerchant;
    const amount = Number(walletOperationAmount);
    const amountIsValid = /^\d+(\.\d{1,2})?$/.test(walletOperationAmount) && amount > 0;
    const remark = walletOperationRemark.trim();

    if (!remark || remark.length > 500) {
      showToast('备注为必填项，最多 500 字');
      return;
    }

    if (walletOperationType === 'FREEZE' && (!amountIsValid || amount > merchant.availablePoints)) {
      showToast('冻结金额必须大于 0 且不能超过剩余可用积点');
      return;
    }
    if (walletOperationType === 'UNFREEZE' && (!amountIsValid || amount > merchant.frozenPoints)) {
      showToast('解冻金额必须大于 0 且不能超过冻结积点');
      return;
    }

    const actionName = walletOperationType === 'DISABLE' ? '禁用钱包' : walletOperationType === 'ENABLE' ? '启用钱包' : walletOperationType === 'FREEZE' ? '冻结积点' : '解冻积点';
    setConfirmState({
      title: `确认${actionName}`,
      body: '请确认本次操作信息，提交后将生成资金操作流水。',
      confirmLabel: `确认${actionName}`,
      tone: walletOperationType === 'DISABLE' ? 'danger' : 'primary',
      details: [
        { label: '商户', value: `${merchant.name}（${merchant.mid}）` },
        { label: '操作类型', value: actionName, emphasis: true },
        ...(walletOperationType === 'FREEZE' || walletOperationType === 'UNFREEZE' ? [
          { label: '变动积点', value: `${walletOperationType === 'FREEZE' ? '-' : '+'}${formatPoints(amount)}`, emphasis: true },
          { label: '余额影响', value: `可用 ${formatPoints(merchant.availablePoints)} → ${formatPoints(walletOperationType === 'FREEZE' ? merchant.availablePoints - amount : merchant.availablePoints + amount)}；冻结 ${formatPoints(merchant.frozenPoints)} → ${formatPoints(walletOperationType === 'FREEZE' ? merchant.frozenPoints + amount : merchant.frozenPoints - amount)}` }
        ] : [{ label: '余额影响', value: '钱包状态变更，积点余额不变' }]),
        { label: '备注', value: remark },
        { label: '截图凭证', value: walletProofFilePreviews.length ? `${walletProofFilePreviews.length} 张` : '无' }
      ],
      notice: walletOperationType === 'DISABLE' || walletOperationType === 'FREEZE' ? '确认提交后将立即生效。' : undefined,
      onConfirm: () => executeMerchantWalletAction(merchant, walletOperationType, walletOperationType === 'DISABLE' || walletOperationType === 'ENABLE' ? 0 : amount, remark, [...walletProofFilePreviews])
    });
  };

  const handleMerchantPointsSubmit = () => {
    const merchant = selectedMerchant;
    const amount = Number(pointsOperationAmount);
    if (!/^\d+(\.\d{1,2})?$/.test(pointsOperationAmount) || amount <= 0) {
      showToast('积点数量必须大于 0，且最多输入两位小数');
      return;
    }
    if (!pointsOperationRemark.trim() || pointsOperationRemark.trim().length > 500) {
      showToast('备注为必填项，最多 500 字');
      return;
    }
    if (pointsOperationType === 'WITHDRAW' && amount > getMerchantTotal(merchant)) {
      showToast('撤回积点不能超过钱包总积点');
      return;
    }

    const beforeAvailable = merchant.availablePoints;
    const beforeFrozen = merchant.frozenPoints;
    const beforeTotal = getMerchantTotal(merchant);
    const afterAvailable = pointsOperationType === 'RECHARGE'
      ? beforeAvailable + amount
      : Math.max(0, beforeAvailable - amount);
    const frozenDeduction = pointsOperationType === 'WITHDRAW' ? Math.max(0, amount - beforeAvailable) : 0;
    const afterFrozen = pointsOperationType === 'RECHARGE' ? beforeFrozen : beforeFrozen - frozenDeduction;
    const type: MerchantOperationType = pointsOperationType === 'RECHARGE' ? '充值积点' : '撤回积点';

    setConfirmState({
      title: `确认${type}`,
      body: '请确认本次操作信息，提交后将生成资金操作流水。',
      confirmLabel: `确认${type}`,
      tone: pointsOperationType === 'WITHDRAW' ? 'danger' : 'primary',
      details: [
        { label: '商户', value: `${merchant.name}（${merchant.mid}）` },
        { label: '操作类型', value: type, emphasis: true },
        { label: '变动积点', value: `${pointsOperationType === 'RECHARGE' ? '+' : '-'}${formatPoints(amount)}`, emphasis: true },
        { label: '余额影响', value: `可用 ${formatPoints(beforeAvailable)} → ${formatPoints(afterAvailable)}；冻结 ${formatPoints(beforeFrozen)} → ${formatPoints(afterFrozen)}` },
        { label: '备注', value: pointsOperationRemark.trim() },
        { label: '截图凭证', value: proofFilePreviews.length ? `${proofFilePreviews.length} 张` : '无' }
      ],
      notice: frozenDeduction > 0 ? `其中 ${formatPoints(frozenDeduction)} 积点将从冻结积点中撤回。` : pointsOperationType === 'WITHDRAW' ? '确认提交后将优先从可用积点中撤回。' : undefined,
      onConfirm: () => {
        setMerchantAccounts(previous => previous.map(item => item.id === merchant.id ? {
          ...item,
          availablePoints: afterAvailable,
          frozenPoints: afterFrozen,
          cumulativeRechargePoints: pointsOperationType === 'RECHARGE' ? item.cumulativeRechargePoints + amount : item.cumulativeRechargePoints,
          lastUpdateTime: getLedgerTime()
        } : item));
        appendMerchantLog({
          id: `LEDGER-MERCHANT-${Date.now()}`,
          time: getLedgerTime(),
          merchantId: merchant.id,
          merchantName: merchant.name,
          merchantCode: merchant.mid,
          type,
          amount,
          direction: pointsOperationType === 'RECHARGE' ? '+' : '-',
          beforeAvailable,
          beforeFrozen,
          beforeTotal,
          afterAvailable,
          afterFrozen,
          afterTotal: afterAvailable + afterFrozen,
          remark: pointsOperationRemark.trim(),
          proofCount: proofFiles.length,
          proofImages: [...proofFilePreviews],
          operator: '财务专员-张华 (FA02)',
          status: 'SUCCESS'
        });
        setMerchantDrawer(null);
        setConfirmState(null);
        showToast(`已完成${type} ${formatPoints(amount)} 积点，资金流水已生成`);
      }
    });
  };

  const acceptProofFiles = (files: File[]) => {
    if (files.length > 5) {
      showToast('截图凭证最多上传 5 张');
      return;
    }
    const invalidFile = files.find(file => !['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024);
    if (invalidFile) {
      showToast('仅支持 png/jpg/jpeg 格式，且单张不超过 2MB');
      return;
    }
    setProofFiles(files);
    setProofFilePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleProofFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    acceptProofFiles(Array.from(event.target.files || []));
    event.target.value = '';
  };

  const handleProofPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const pastedImages = Array.from(event.clipboardData.files).filter(file => file.type.startsWith('image/'));
    if (pastedImages.length > 0) {
      event.preventDefault();
      acceptProofFiles([...proofFiles, ...pastedImages]);
    }
  };

  const handleProofDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsProofDragOver(false);
    acceptProofFiles([...proofFiles, ...Array.from(event.dataTransfer.files)]);
  };

  const removeProofFile = (index: number) => {
    setProofFiles(previous => previous.filter((_, fileIndex) => fileIndex !== index));
    setProofFilePreviews(previous => previous.filter((_, fileIndex) => fileIndex !== index));
  };

  const acceptWalletProofFiles = (files: File[]) => {
    if (files.length > 5) {
      showToast('截图凭证最多上传 5 张');
      return;
    }
    const invalidFile = files.find(file => !['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024);
    if (invalidFile) {
      showToast('仅支持 png/jpg/jpeg 格式，且单张不超过 2MB');
      return;
    }
    setWalletProofFiles(files);
    setWalletProofFilePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleWalletProofFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    acceptWalletProofFiles(Array.from(event.target.files || []));
    event.target.value = '';
  };

  const handleWalletProofPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const pastedImages = Array.from(event.clipboardData.files).filter(file => file.type.startsWith('image/'));
    if (pastedImages.length > 0) {
      event.preventDefault();
      acceptWalletProofFiles([...walletProofFiles, ...pastedImages]);
    }
  };

  const handleWalletProofDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsWalletProofDragOver(false);
    acceptWalletProofFiles([...walletProofFiles, ...Array.from(event.dataTransfer.files)]);
  };

  const removeWalletProofFile = (index: number) => {
    setWalletProofFiles(previous => previous.filter((_, fileIndex) => fileIndex !== index));
    setWalletProofFilePreviews(previous => previous.filter((_, fileIndex) => fileIndex !== index));
  };

  const acceptUserWalletProofFiles = (files: File[]) => {
    if (files.length > 5) {
      showToast('截图凭证最多上传 5 张');
      return;
    }
    const invalidFile = files.find(file => !['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024);
    if (invalidFile) {
      showToast('仅支持 png/jpg/jpeg 格式，且单张不超过 2MB');
      return;
    }
    setUserWalletProofFiles(files);
    setUserWalletProofFilePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleUserWalletProofFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    acceptUserWalletProofFiles(Array.from(event.target.files || []));
    event.target.value = '';
  };

  const handleUserWalletProofPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const pastedImages = Array.from(event.clipboardData.files).filter(file => file.type.startsWith('image/'));
    if (pastedImages.length > 0) {
      event.preventDefault();
      acceptUserWalletProofFiles([...userWalletProofFiles, ...pastedImages]);
    }
  };

  const handleUserWalletProofDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsUserWalletProofDragOver(false);
    acceptUserWalletProofFiles([...userWalletProofFiles, ...Array.from(event.dataTransfer.files)]);
  };

  const removeUserWalletProofFile = (index: number) => {
    setUserWalletProofFiles(previous => previous.filter((_, fileIndex) => fileIndex !== index));
    setUserWalletProofFilePreviews(previous => previous.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleUAddressSave = () => {
    const nextAddress = uAddressValue.trim();
    const nextMarker = rechargeAmountMarkerValue.trim();
    if (nextMarker && !/^(?:\d+\.\d{1,4}|\.\d{1,4})$/.test(nextMarker)) {
      showToast('充值金额标识必须包含小数点，且小数点后 1-4 位');
      return;
    }
    setMerchantAccounts(previous => previous.map(item => item.id === selectedMerchant.id ? { ...item, uAddress: nextAddress, rechargeAmountMarker: nextMarker, lastUpdateTime: getLedgerTime() } : item));
    setMerchantDrawer(null);
    showToast('U地址配置已保存');
  };

  const executeWalletAction = (amt: number) => {
    const actionNameMap = {
      DISABLE_WITHDRAW: '禁止用户提现',
      ENABLE_WITHDRAW: '恢复用户提现',
      FREEZE: '冻结余额',
      UNFREEZE: '解冻余额'
    };

    // 更新用户钱包
    setWalletList(prev =>
      prev.map(w => {
        if (w.uid === targetUserUid) {
          let newAvail = w.availableBalance;
          let newFrozen = w.frozenBalance;
          let nextStatus = w.status;

          if (walletActionType === 'DISABLE_WITHDRAW') {
            nextStatus = '已禁止提现';
          } else if (walletActionType === 'ENABLE_WITHDRAW') {
            nextStatus = '正常';
          } else if (walletActionType === 'FREEZE') {
            newAvail -= amt;
            newFrozen += amt;
          } else if (walletActionType === 'UNFREEZE') {
            newFrozen -= amt;
            newAvail += amt;
          }

          return {
            ...w,
            availableBalance: newAvail,
            frozenBalance: newFrozen,
            status: nextStatus,
            totalBalance: newAvail + newFrozen + w.withdrawingAmount
          };
        }
        return w;
      })
    );

    // 追加 Ledger 流水
    const newLedger = {
      id: `WLEDGER-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString(),
      uid: targetUserUid,
      actionType: `${actionNameMap[walletActionType]} (${walletActionType})`,
      amount: walletActionType === 'FREEZE' ? `- ₦${amt.toFixed(2)}` : walletActionType === 'UNFREEZE' ? `+ ₦${amt.toFixed(2)}` : '—',
      orderId: '—',
      reason: actionReason.trim(),
      operator: '财务专员-张华 (FA02)',
      approver: '财务主管-王总 (FA01)',
      proofImages: [...userWalletProofFilePreviews]
    };

    setWalletLedger(prev => [newLedger, ...prev]);
    setShowWalletActionModal(false);
    setConfirmState(null);
    showToast(`✅ 【${actionNameMap[walletActionType]}】执行成功，已回写用户钱包并生成严格审计 Ledger 流水！`);
  };

  // 处理用户钱包动作提交：沿用商户钱包的二次确认与余额校验。
  const handleExecuteWalletAction = () => {
    const needsAmount = walletActionType === 'FREEZE' || walletActionType === 'UNFREEZE';
    const amt = needsAmount ? Number(actionAmount) : 0;
    const targetWallet = walletList.find(wallet => wallet.uid === targetUserUid);
    if (needsAmount && (!/^\d+(\.\d{1,2})?$/.test(actionAmount) || amt <= 0)) {
      showToast('请输入大于 0、最多两位小数的操作金额');
      return;
    }
    if (!targetWallet) {
      showToast('未找到目标用户钱包，请从列表选择用户');
      return;
    }
    if (!actionReason.trim()) {
      showToast('钱包操作必须填写变更原因');
      return;
    }
    if (walletActionType === 'FREEZE' && amt > targetWallet.availableBalance) {
      showToast('操作金额不能超过该用户可用余额');
      return;
    }
    if (walletActionType === 'UNFREEZE' && amt > targetWallet.frozenBalance) {
      showToast('解冻金额不能超过该用户冻结余额');
      return;
    }
    const actionName = walletActionType === 'DISABLE_WITHDRAW' ? '禁止用户提现' : walletActionType === 'ENABLE_WITHDRAW' ? '恢复用户提现' : walletActionType === 'FREEZE' ? '冻结余额' : '解冻余额';
    setConfirmState({
      title: `确认${actionName}`,
      body: '请确认本次操作信息，提交后将写入 Ledger 审计流水。',
      confirmLabel: `确认${actionName}`,
      tone: walletActionType === 'DISABLE_WITHDRAW' || walletActionType === 'FREEZE' ? 'danger' : 'primary',
      details: [
        { label: '用户', value: `${targetWallet.userName}（${targetWallet.uid}）` },
        { label: '操作类型', value: actionName, emphasis: true },
        ...(needsAmount ? [{ label: '变动金额', value: `${walletActionType === 'FREEZE' ? '-' : '+'}₦${amt.toFixed(2)}`, emphasis: true }] : [{ label: '状态变更', value: walletActionType === 'DISABLE_WITHDRAW' ? '已禁止提现' : '正常' }]),
        { label: '变更原因', value: actionReason.trim() }
      ],
      notice: walletActionType === 'DISABLE_WITHDRAW' || walletActionType === 'FREEZE' ? '确认提交后将立即生效。' : undefined,
      onConfirm: () => executeWalletAction(amt)
    });
  };

  const handleManualAdjustmentSubmit = () => {
    const amount = Number(manualAdjustmentAmount);
    if (!manualAdjustmentUser) return;
    if (!/^\d+(\.\d{1,2})?$/.test(manualAdjustmentAmount) || amount <= 0) {
      showToast('请输入大于 0、最多两位小数的调账金额');
      return;
    }
    if (!manualAdjustmentReason.trim()) {
      showToast('请填写用户端展示原因');
      return;
    }
    if (/[\u4e00-\u9fff]/.test(manualAdjustmentReason)) {
      showToast('用户端展示原因仅支持英文，不支持输入汉字');
      return;
    }
    if (manualAdjustmentType === 'DEBIT' && amount > manualAdjustmentUser.availableBalance) {
      showToast('钱包扣款金额不能超过可用余额');
      return;
    }
    const actionName = manualAdjustmentType === 'CREDIT' ? '钱包加款' : '钱包扣款';
    setConfirmState({
      title: `确认${actionName}`,
      body: '请确认本次人工调账信息，确认后将立即变更用户可用余额并写入 Ledger。',
      confirmLabel: `确认${actionName}`,
      tone: manualAdjustmentType === 'DEBIT' ? 'danger' : 'primary',
      details: [
        { label: '用户', value: `${manualAdjustmentUser.userName}（${manualAdjustmentUser.uid}）` },
        { label: '操作类型', value: actionName, emphasis: true },
        { label: '调账金额', value: `${manualAdjustmentType === 'CREDIT' ? '+' : '-'}₦${amount.toFixed(2)}`, emphasis: true },
        { label: '用户端原因', value: manualAdjustmentReason.trim() },
        ...(manualAdjustmentRemark.trim() ? [{ label: '内部备注', value: manualAdjustmentRemark.trim() }] : [])
      ],
      notice: '确认提交后将立即生效。',
      onConfirm: () => {
        setWalletList(previous => previous.map(wallet => wallet.uid === manualAdjustmentUser.uid ? {
          ...wallet,
          availableBalance: manualAdjustmentType === 'CREDIT' ? wallet.availableBalance + amount : wallet.availableBalance - amount,
          totalBalance: manualAdjustmentType === 'CREDIT' ? wallet.totalBalance + amount : wallet.totalBalance - amount
        } : wallet));
        setWalletLedger(previous => [{
          id: `WLEDGER-${Date.now().toString().slice(-6)}`,
          time: getLedgerTime(),
          uid: manualAdjustmentUser.uid,
          actionType: `${actionName} (MANUAL_${manualAdjustmentType})`,
          amount: `${manualAdjustmentType === 'CREDIT' ? '+' : '-'} ₦${amount.toFixed(2)}`,
          orderId: '—',
          reason: manualAdjustmentReason.trim(),
          internalRemark: manualAdjustmentRemark.trim() || undefined,
          operator: '财务专员-张华 (FA02)',
          approver: '财务主管-王总 (FA01)',
          proofImages: [...userWalletProofFilePreviews]
        }, ...previous]);
        setManualAdjustmentUser(null);
        setConfirmState(null);
        showToast(`已完成${actionName} ₦${amount.toFixed(2)}，Ledger 已生成`);
      }
    });
  };

  // 5.5 提现超时状态反查与解冻
  const handleQueryWithdrawalStatus = (wdId: string) => {
    showToast(`🔍 已向代付网关发起 ${wdId} 交易状态反查: 渠道确认交易失败 (FAIL_CHANNEL)`);
    setWithdrawalTimeouts(prev =>
      prev.map(item => {
        if (item.id === wdId) {
          return {
            ...item,
            status: '失败 (已自动解冻资金)',
            queryResult: '已确认失败，资金恢复至可用余额'
          };
        }
        return item;
      })
    );

    // 解冻用户钱包
    setWalletList(prev =>
      prev.map(w => {
        if (w.uid === 'US-USR-9921010') {
          return {
            ...w,
            availableBalance: w.availableBalance + 2200.0,
            withdrawingAmount: 0,
            status: '正常'
          };
        }
        return w;
      })
    );

    showToast(`✅ 提现 ${wdId} 确认失败，已安全自动解冻 $2,200.00 恢复至用户可用余额！`);
  };

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased space-y-4 pb-16 text-xs">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[80] bg-slate-900/90 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 backdrop-blur border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 顶部 Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
            <span className="material-symbols-outlined text-xl">account_balance</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">资金账户</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                平台 + 商户 + 用户三类资金账户
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              统一管理平台资金水位、商户积点与用户钱包。严格遵循<strong>资金变动必须形成 Ledger 流水，禁止直接改余额</strong>红线。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate && onNavigate('abnormal-finance')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
          >
            查看财务异常事件
          </button>
        </div>
      </div>

      {/* 5.1 三类资金账户 Tab 导航栏 */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'platform', label: '平台账户', icon: 'account_balance' },
          { id: 'merchant', label: '商户账户 (积点)', icon: 'storefront' },
          { id: 'wallet', label: '用户钱包', icon: 'account_balance_wallet' }
        ].map(tab => {
          const isActive = accountTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAccountTab(tab.id as AccountTab)}
              className={`px-5 py-3.5 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                isActive
                  ? 'text-emerald-700 bg-emerald-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </section>

      {/* 5.2 平台账户【Tab】 */}
      {accountTab === 'platform' && (
        <div className="space-y-4">
          {/* 水位预警 Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start justify-between gap-3 text-emerald-950">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-xl mt-0.5">verified_user</span>
              <div>
                <span className="font-bold">平台可用资金水位评估：安全</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  当前平台可用余额 <strong>${platformMetrics.availableBalance.toLocaleString()}</strong> 远高于最低安全水位阈值 <strong>${platformMetrics.safetyWatermark.toLocaleString()}</strong>，可完备承接预计提现请求。
                </p>
              </div>
            </div>
            <span className="font-mono text-xs bg-white text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded font-bold shrink-0">
              安全水位线: ${platformMetrics.safetyWatermark.toLocaleString()}
            </span>
          </div>

          {/* 平台账户核心 8 大字段 KPI 看板 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">总账户余额 (Total)</span>
              <span className="font-mono text-2xl font-bold text-slate-900">${platformMetrics.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">可用余额 (Available)</span>
              <span className="font-mono text-2xl font-bold text-emerald-700">${platformMetrics.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">冻结金额 (Frozen)</span>
              <span className="font-mono text-2xl font-bold text-slate-800">${platformMetrics.frozenBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">待支付金额 (Pending)</span>
              <span className="font-mono text-2xl font-bold text-purple-700">${platformMetrics.pendingPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">预计可支撑提现金额</span>
              <span className="font-mono text-xl font-bold text-slate-900">${platformMetrics.estimatedWithdrawalCapacity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className="text-[10px] text-slate-500 block">扣除在途冻结与待付头寸后净额</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">最近充值 (Inflow)</span>
              <span className="font-mono text-base font-bold text-blue-700">{platformMetrics.recentInflow}</span>
              <span className="text-[10px] text-slate-500 block">对公网关自动归集确认</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">最近资金变化时间</span>
              <span className="font-mono text-base font-bold text-slate-800">{platformMetrics.lastChangeTime}</span>
              <span className="text-[10px] text-emerald-700 block">四账恒等式实时平账</span>
            </div>
          </div>
        </div>
      )}

      {/* 5.3 商户账户【Tab】 */}
      {accountTab === 'merchant' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-start gap-2">
              <input
                value={merchantKeyword}
                onChange={event => setMerchantKeyword(event.target.value)}
                placeholder="商户名称 / 唯一编码"
                className="h-8 w-52 px-3 text-xs border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
              />
              <select
                value={merchantStatusFilter}
                onChange={event => setMerchantStatusFilter(event.target.value as 'ALL' | MerchantWalletStatus)}
                className="h-8 px-3 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-emerald-500"
              >
                <option value="ALL">全部钱包状态</option>
                <option value="NORMAL">正常</option>
                <option value="DISABLED">禁用</option>
              </select>
              <button onClick={() => showToast(`已查询 ${filteredMerchantAccounts.length} 个商户账户`)} className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer">查询</button>
              <button onClick={() => { setMerchantKeyword(''); setMerchantStatusFilter('ALL'); }} className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer">重置</button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-left border-collapse">
                <colgroup>
                  <col style={{ width: '170px' }} />
                  <col style={{ width: '130px' }} />
                  <col style={{ width: '130px' }} />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: '80px' }} />
                  <col style={{ width: '145px' }} />
                  <col style={{ width: '204px' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-[11px]">
                    <th className="py-3 px-3">商户名称与唯一编码</th>
                    <th className="py-3 px-3 text-right">剩余可用积点</th>
                    <th className="py-3 px-3 text-right">累计充值积点</th>
                    <th className="py-3 px-3 text-right">冻结积点</th>
                    <th className="py-3 px-3">钱包状态</th>
                    <th className="py-3 px-3">更新时间</th>
                    <th className="py-3 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMerchantAccounts.map(merchant => (
                    <tr key={merchant.id} className="hover:bg-slate-50 align-top">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{merchant.name}</div>
                        <div className="font-mono text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          {merchant.mid}
                          <button onClick={() => { navigator.clipboard?.writeText(merchant.mid); showToast('唯一编码已复制'); }} className="text-slate-400 hover:text-emerald-600 cursor-pointer" title="复制唯一编码">
                            <span className="material-symbols-outlined text-[14px]">content_copy</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">{formatPoints(merchant.availablePoints)}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-800">{formatPoints(merchant.cumulativeRechargePoints)}</td>
                      <td className="py-3 px-3 text-right font-mono text-amber-700">{formatPoints(merchant.frozenPoints)}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${merchant.walletStatus === 'NORMAL' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${merchant.walletStatus === 'NORMAL' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {merchant.walletStatus === 'NORMAL' ? '正常' : '禁用'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{merchant.lastUpdateTime}</td>
                      <td className="py-3 px-3">
                        <div className="grid grid-cols-3 gap-1 w-[204px]">
                          <button onClick={() => openMerchantDrawer(merchant, 'wallet')} className="w-[64px] px-0 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] leading-5 font-semibold text-slate-700 whitespace-nowrap cursor-pointer">钱包管理</button>
                          <button onClick={() => openMerchantDrawer(merchant, 'points')} className="w-[64px] px-0 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-[11px] leading-5 font-semibold text-emerald-700 whitespace-nowrap cursor-pointer">积点管理</button>
                          <button onClick={() => openMerchantDrawer(merchant, 'uAddress')} className="w-[64px] px-0 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-[11px] leading-5 font-semibold text-blue-700 whitespace-nowrap cursor-pointer">U地址管理</button>
                          <button onClick={() => openMerchantDrawer(merchant, 'ledger')} className="w-[64px] px-0 py-1 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded text-[11px] leading-5 font-semibold text-violet-700 whitespace-nowrap cursor-pointer">操作流水</button>
                          <button onClick={() => openMerchantDrawer(merchant, 'recharge')} className="w-[64px] px-0 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] leading-5 font-semibold text-slate-700 whitespace-nowrap cursor-pointer">充值明细</button>
                          <button disabled className="w-[64px] px-0 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] leading-5 font-semibold text-slate-400 whitespace-nowrap cursor-not-allowed">交易明细</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMerchantAccounts.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400">暂无符合条件的商户账户</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>共 {filteredMerchantAccounts.length} 条</span>
              <div className="flex items-center gap-2"><span>10条/页</span><button className="px-2 py-1 border border-slate-200 rounded text-slate-400">‹</button><span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold">1</span><button className="px-2 py-1 border border-slate-200 rounded text-slate-400">›</button></div>
            </div>
          </div>

        </div>
      )}

      {/* 用户钱包 */}
      {accountTab === 'wallet' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="px-4 pt-4 flex items-center gap-5 border-b border-slate-200">
              {([{ id: 'management', label: '钱包管理' }, { id: 'withdrawals', label: '提现记录' }] as const).map(tab => <button key={tab.id} onClick={() => setUserWalletTab(tab.id)} className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${userWalletTab === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{tab.label}</button>)}
            </div>
          </div>

          {userWalletTab === 'management' && <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
              <div className="flex flex-wrap items-center gap-2">
                <input value={walletKeyword} onChange={event => setWalletKeyword(event.target.value)} placeholder="用户ID / 用户名 / 手机号" className="h-8 w-52 px-3 text-xs border border-slate-300 rounded-lg outline-none focus:border-emerald-500" />
                <select value={walletStatusFilter} onChange={event => setWalletStatusFilter(event.target.value as 'ALL' | UserWalletStatus)} className="h-8 px-3 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-emerald-500"><option value="ALL">全部钱包状态</option><option value="正常">正常</option><option value="已禁止提现">已禁止提现</option></select>
                <button onClick={() => showToast(`已查询 ${filteredWalletList.length} 个用户钱包`)} className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer">查询</button>
                <button onClick={() => { setWalletKeyword(''); setWalletStatusFilter('ALL'); }} className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer">重置</button>
                <button onClick={exportUserWallets} className="h-8 px-3 ml-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer">导出</button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between"><span className="font-bold text-slate-900 text-xs">用户钱包台账</span><span className="text-[11px] text-slate-500">共 {filteredWalletList.length} 条</span></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[1280px] text-left border-collapse"><thead><tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-[11px]"><th className="py-3 px-3">用户ID</th><th className="py-3 px-3">钱包状态</th><th className="py-3 px-3 text-right">钱包总余额 (₦)</th><th className="py-3 px-3 text-right">可用余额 (₦)</th><th className="py-3 px-3 text-right">冻结余额 (₦)</th><th className="py-3 px-3 text-right">提现中余额 (₦)</th><th className="py-3 px-3 text-right">累计补偿金 (₦)</th><th className="py-3 px-3 text-right">累计追回金额 (₦)</th><th className="py-3 px-3 text-right">操作</th></tr></thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredWalletList.map(wallet => <tr key={wallet.uid} className="hover:bg-slate-50">
                    <td className="py-3 px-3"><div className="font-mono font-semibold text-slate-900">{wallet.uid}</div><div className="text-[11px] text-slate-500 mt-1">{wallet.userName} · {wallet.phone}</div></td>
                    <td className="py-3 px-3"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${wallet.status === '正常' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}><span className={`w-1.5 h-1.5 rounded-full ${wallet.status === '正常' ? 'bg-emerald-500' : 'bg-rose-500'}`} />{wallet.status}</span></td>
                    <td className="py-3 px-3 text-right font-mono font-bold">{formatPoints(wallet.totalBalance)}</td><td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">{formatPoints(wallet.availableBalance)}</td><td className="py-3 px-3 text-right font-mono text-amber-700">{formatPoints(wallet.frozenBalance)}</td><td className="py-3 px-3 text-right font-mono text-violet-700">{formatPoints(wallet.withdrawingAmount)}</td><td className="py-3 px-3 text-right font-mono text-blue-700">{formatPoints(wallet.compensatedAmount)}</td><td className="py-3 px-3 text-right font-mono text-rose-700">{formatPoints(wallet.clawbackAmount)}</td>
                    <td className="py-3 px-3"><div className="flex justify-end gap-1.5"><button onClick={() => openManualAdjustmentDrawer(wallet)} className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-semibold cursor-pointer">人工调账</button><button onClick={() => openUserWalletActionDrawer(wallet)} className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[11px] font-semibold cursor-pointer">钱包管理</button><button onClick={() => { setWalletLedgerUser(wallet); setWalletLedgerKeyword(''); }} className="px-2 py-1 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 rounded text-[11px] font-semibold cursor-pointer">钱包流水</button></div></td>
                  </tr>)}
                  {filteredWalletList.length === 0 && <tr><td colSpan={9} className="py-14 text-center text-slate-400">暂无符合条件的用户钱包</td></tr>}
                </tbody></table></div>
            </div>
          </>}

          {userWalletTab === 'withdrawals' && <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4"><div className="flex flex-wrap items-center gap-2"><input value={withdrawalKeyword} onChange={event => setWithdrawalKeyword(event.target.value)} placeholder="订单ID / 用户 / SESSIONID / 卡号" className="h-8 w-60 px-3 text-xs border border-slate-300 rounded-lg outline-none focus:border-emerald-500" /><select value={withdrawalBusinessTypeFilter} onChange={event => setWithdrawalBusinessTypeFilter(event.target.value as 'ALL' | WithdrawalBusinessType)} className="h-8 px-3 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-emerald-500"><option value="ALL">全部业务类型</option><option value="提现">提现</option><option value="转账">转账</option></select><select value={withdrawalStatusFilter} onChange={event => setWithdrawalStatusFilter(event.target.value as 'ALL' | WithdrawalStatus)} className="h-8 px-3 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-emerald-500"><option value="ALL">全部状态</option><option value="提现中">提现中</option><option value="提现成功">提现成功</option><option value="提现失败">提现失败</option><option value="待审核">待审核</option></select><input type="date" value={withdrawalDate} onChange={event => setWithdrawalDate(event.target.value)} className="h-8 px-3 text-xs border border-slate-300 rounded-lg outline-none focus:border-emerald-500" /><button onClick={() => showToast(`已查询 ${filteredWithdrawalRecords.length} 条提现记录`)} className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer">查询</button><button onClick={() => { setWithdrawalKeyword(''); setWithdrawalBusinessTypeFilter('ALL'); setWithdrawalStatusFilter('ALL'); setWithdrawalDate(''); }} className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer">重置</button><button onClick={exportWithdrawals} className="h-8 px-3 ml-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer">导出</button></div></div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"><div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between"><span className="font-bold text-slate-900 text-xs">所有用户提现与转账操作记录</span><span className="text-[11px] text-slate-500">共 {filteredWithdrawalRecords.length} 条</span></div><div className="overflow-x-auto"><table className="w-full min-w-[2050px] text-left border-collapse"><thead><tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-[11px]"><th className="py-3 px-3">订单ID</th><th className="py-3 px-3">业务类型</th><th className="py-3 px-3 text-right">提现金额 (₦)</th><th className="py-3 px-3 text-right">提现金额 (¥)</th><th className="py-3 px-3 text-right">服务费 (₦)</th><th className="py-3 px-3">法币汇率</th><th className="py-3 px-3">收卡银行</th><th className="py-3 px-3">收卡卡号</th><th className="py-3 px-3">收卡人姓名</th><th className="py-3 px-3">提现用户ID</th><th className="py-3 px-3">提现用户</th><th className="py-3 px-3">用途</th><th className="py-3 px-3">SESSIONID</th><th className="py-3 px-3">发起时间</th><th className="py-3 px-3">完成时间</th><th className="py-3 px-3">状态</th><th className="py-3 px-3">备注</th><th className="py-3 px-3 text-right">操作</th></tr></thead><tbody className="divide-y divide-slate-100 text-xs">{filteredWithdrawalRecords.map(record => <tr key={record.id} className="hover:bg-slate-50 align-top"><td className="py-3 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap">{record.id}</td><td className="py-3 px-3"><span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-semibold">{record.businessType}</span></td><td className="py-3 px-3 text-right font-mono font-semibold">{formatPoints(record.amountNgn)}</td><td className="py-3 px-3 text-right font-mono">{formatPoints(record.amountCny)}</td><td className="py-3 px-3 text-right font-mono">{formatPoints(record.serviceFee)}</td><td className="py-3 px-3 font-mono">{record.exchangeRate.toFixed(4)}</td><td className="py-3 px-3 whitespace-nowrap">{record.bank}</td><td className="py-3 px-3 font-mono whitespace-nowrap">{record.cardNumber}</td><td className="py-3 px-3 whitespace-nowrap">{record.payeeName}</td><td className="py-3 px-3 font-mono">{record.userId}</td><td className="py-3 px-3">{record.userName}</td><td className="py-3 px-3">{record.purpose}</td><td className="py-3 px-3 font-mono text-[10px]">{record.sessionId}</td><td className="py-3 px-3 font-mono whitespace-nowrap">{record.initiatedAt}</td><td className="py-3 px-3 font-mono whitespace-nowrap">{record.completedAt || '—'}</td><td className="py-3 px-3"><span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${record.status === '提现成功' ? 'bg-emerald-50 text-emerald-700' : record.status === '提现失败' ? 'bg-rose-50 text-rose-700' : record.status === '待审核' ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700'}`}>{record.status}</span></td><td className="py-3 px-3 max-w-48 text-slate-600">{record.remark ? <div className="truncate" title={record.remark}>{record.remark}</div> : '—'}</td><td className="py-3 px-3 text-right"><button onClick={() => setCardLogRecord(record)} className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-semibold whitespace-nowrap cursor-pointer">查卡日志</button></td></tr>)}{filteredWithdrawalRecords.length === 0 && <tr><td colSpan={18} className="py-14 text-center text-slate-400">暂无符合条件的提现记录</td></tr>}</tbody></table></div></div>
          </>}
        </div>
      )}

      {manualAdjustmentUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-[1px]" onMouseDown={event => { if (event.target === event.currentTarget) setManualAdjustmentUser(null); }}>
          <aside className="absolute right-0 top-0 h-full w-full max-w-[560px] bg-white shadow-2xl border-l border-slate-200 flex flex-col" onMouseDown={event => event.stopPropagation()}>
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 shrink-0"><div><div className="font-bold text-slate-900 text-sm">人工调账</div><div className="text-[11px] text-slate-500 mt-1">{manualAdjustmentUser.userName} · <span className="font-mono">{manualAdjustmentUser.uid}</span></div></div><button onClick={() => setManualAdjustmentUser(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><span className="material-symbols-outlined text-[18px]">close</span></button></div>
            <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-2"><div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100"><div className="text-[10px] text-emerald-700">可用余额</div><div className="font-mono font-bold text-emerald-800 mt-1">₦{formatPoints(manualAdjustmentUser.availableBalance)}</div></div><div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-[10px] text-slate-500">钱包总余额</div><div className="font-mono font-bold text-slate-800 mt-1">₦{formatPoints(manualAdjustmentUser.totalBalance)}</div></div></div>
              <div><label className="block text-slate-700 font-semibold mb-1">操作类型</label><select value={manualAdjustmentType} onChange={event => setManualAdjustmentType(event.target.value as ManualWalletAdjustmentType)} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium outline-none focus:border-emerald-500"><option value="CREDIT">钱包加款</option><option value="DEBIT">钱包扣款</option></select></div>
              <div><label className="block text-slate-700 font-semibold mb-1">调账金额 (₦)</label><input value={manualAdjustmentAmount} onChange={event => setManualAdjustmentAmount(event.target.value)} inputMode="decimal" placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm outline-none focus:border-emerald-500" />{manualAdjustmentType === 'DEBIT' && <div className="text-[11px] text-slate-400 mt-1">最多可扣款 ₦{formatPoints(manualAdjustmentUser.availableBalance)}</div>}</div>
              <div><label className="block text-slate-700 font-semibold mb-1">原因 <span className="text-rose-500">*</span></label><textarea value={manualAdjustmentReason} onChange={event => setManualAdjustmentReason(event.target.value)} rows={2} placeholder="e.g. Compensation for delayed settlement" className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-500" /><div className="text-[11px] text-slate-500 mt-1"><strong>必填，用户端展示</strong>，请用英文描述，不支持输入汉字</div></div>
              <div><label className="block text-slate-700 font-semibold mb-1">备注</label><textarea value={manualAdjustmentRemark} onChange={event => setManualAdjustmentRemark(event.target.value)} rows={2} placeholder="仅内部可见" className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-500" /><div className="text-[11px] text-slate-400 mt-1">非必填项，仅内部可见</div></div>
              <div><div className="flex items-center justify-between mb-1.5"><label className="text-xs font-semibold text-slate-700">截图凭证</label><span className="text-[11px] text-slate-400">非必填</span></div><input ref={userWalletProofInputRef} type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" multiple onChange={handleUserWalletProofFilesChange} className="hidden" /><div className="flex flex-wrap items-start gap-2"><div tabIndex={0} onClick={() => userWalletProofInputRef.current?.click()} onPaste={handleUserWalletProofPaste} onDragEnter={event => { event.preventDefault(); setIsUserWalletProofDragOver(true); }} onDragOver={event => event.preventDefault()} onDragLeave={event => { if (event.currentTarget === event.target) setIsUserWalletProofDragOver(false); }} onDrop={handleUserWalletProofDrop} className={`w-[88px] h-[88px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer outline-none transition-colors ${isUserWalletProofDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40'}`}><span className="material-symbols-outlined text-[26px] text-slate-400 mb-1">file_upload</span><span className="text-xs font-semibold text-slate-500">上传图片</span></div>{userWalletProofFilePreviews.map((preview, index) => <div key={`${preview}-${index}`} className="relative w-[88px] h-[88px] rounded-lg overflow-hidden border border-slate-200 bg-slate-50"><button onClick={() => setProofPreview({ images: userWalletProofFilePreviews, index })} className="w-full h-full cursor-pointer"><img src={preview} alt={`截图凭证 ${index + 1}`} className="w-full h-full object-cover" /></button><button onClick={() => removeUserWalletProofFile(index)} className="absolute right-1 top-1 w-5 h-5 rounded-full bg-slate-900/65 text-white flex items-center justify-center hover:bg-rose-600 cursor-pointer"><span className="material-symbols-outlined text-[13px]">close</span></button></div>)}</div><div className="text-[11px] leading-5 text-slate-400 mt-2">支持 png/jpg/jpeg，单张不超过 2MB，最多 5 张；支持拖拽 / 粘贴上传</div></div>
            </div>
            <div className="px-5 py-3 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0"><button onClick={() => setManualAdjustmentUser(null)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer">取消</button><button onClick={handleManualAdjustmentSubmit} className={`px-4 py-2 rounded-lg text-white font-semibold cursor-pointer ${manualAdjustmentType === 'DEBIT' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>提交并确认</button></div>
          </aside>
        </div>
      )}

      {walletLedgerUser && (
        <div className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[1px]" onMouseDown={event => { if (event.target === event.currentTarget) setWalletLedgerUser(null); }}>
          <aside className="absolute right-0 top-0 h-full w-full max-w-[1180px] bg-white shadow-2xl border-l border-slate-200 flex flex-col" onMouseDown={event => event.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between shrink-0"><div><div className="font-bold text-slate-900">用户钱包流水</div><div className="text-[11px] text-slate-500 mt-1">{walletLedgerUser.userName} · <span className="font-mono">{walletLedgerUser.uid}</span></div></div><button onClick={() => setWalletLedgerUser(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><span className="material-symbols-outlined">close</span></button></div>
            <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2 shrink-0"><input value={walletLedgerKeyword} onChange={event => setWalletLedgerKeyword(event.target.value)} placeholder="流水号 / 订单号 / 动作类型 / 原因" className="h-8 w-64 px-3 text-xs border border-slate-300 rounded-lg outline-none focus:border-emerald-500" /><button onClick={() => showToast(`已查询 ${filteredWalletLedgers.length} 条审计流水`)} className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer">查询</button><button onClick={() => setWalletLedgerKeyword('')} className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer">重置</button><span className="ml-auto self-center text-[11px] text-slate-500">共 {filteredWalletLedgers.length} 条</span></div>
            <div className="overflow-auto"><table className="w-full min-w-[1050px] text-left border-collapse"><thead className="sticky top-0 z-10"><tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-[11px]"><th className="py-3 px-3">流水号</th><th className="py-3 px-3">时间</th><th className="py-3 px-3">用户ID</th><th className="py-3 px-3">动作类型</th><th className="py-3 px-3">变动金额</th><th className="py-3 px-3">关联订单</th><th className="py-3 px-3">变更原因</th><th className="py-3 px-3">操作人 / 审批人</th></tr></thead><tbody className="divide-y divide-slate-100 text-xs">{filteredWalletLedgers.map(ledger => <tr key={ledger.id} className="hover:bg-slate-50 align-top"><td className="py-3 px-3 font-mono text-slate-600">{ledger.id}</td><td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">{ledger.time}</td><td className="py-3 px-3 font-mono font-semibold text-slate-900">{ledger.uid}</td><td className="py-3 px-3"><span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">{ledger.actionType}</span></td><td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">{ledger.amount}</td><td className="py-3 px-3 font-mono text-blue-700">{ledger.orderId}</td><td className="py-3 px-3 text-slate-700">{ledger.reason}</td><td className="py-3 px-3 text-slate-600 whitespace-nowrap">{ledger.operator} / {ledger.approver}</td></tr>)}{filteredWalletLedgers.length === 0 && <tr><td colSpan={8} className="py-14 text-center text-slate-400">暂无该用户的审计流水</td></tr>}</tbody></table></div>
          </aside>
        </div>
      )}

      {cardLogRecord && (
        <div className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[1px]" onMouseDown={event => { if (event.target === event.currentTarget) setCardLogRecord(null); }}>
          <aside className="absolute right-0 top-0 h-full w-full max-w-[560px] bg-white shadow-2xl border-l border-slate-200 flex flex-col" onMouseDown={event => event.stopPropagation()}><div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between shrink-0"><div><div className="font-bold text-slate-900">查卡日志</div><div className="font-mono text-[11px] text-slate-500 mt-1">{cardLogRecord.id} · {cardLogRecord.cardNumber}</div></div><button onClick={() => setCardLogRecord(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><span className="material-symbols-outlined">close</span></button></div><div className="p-5 space-y-4 text-xs overflow-y-auto flex-1"><div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-slate-500">收卡信息</div><div className="font-semibold text-slate-900 mt-1">{cardLogRecord.bank} · {cardLogRecord.payeeName}</div></div><ol className="relative border-l border-slate-200 ml-2 space-y-5 pl-5"><li><span className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-emerald-500" /><div className="font-semibold text-slate-800">收款卡准入校验通过</div><div className="text-slate-500 mt-1">{cardLogRecord.initiatedAt} · 卡号与收款人信息已完成脱敏比对</div></li><li><span className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-blue-500" /><div className="font-semibold text-slate-800">代付渠道请求已提交</div><div className="text-slate-500 mt-1">业务类型：{cardLogRecord.businessType}；用途：{cardLogRecord.purpose}</div></li><li><span className={`absolute -left-[5px] w-2.5 h-2.5 rounded-full ${cardLogRecord.status === '提现成功' ? 'bg-emerald-500' : cardLogRecord.status === '提现失败' ? 'bg-rose-500' : 'bg-amber-500'}`} /><div className="font-semibold text-slate-800">当前状态：{cardLogRecord.status}</div><div className="text-slate-500 mt-1">{cardLogRecord.completedAt ? `完成时间：${cardLogRecord.completedAt}` : '等待渠道状态回传或人工审核结果'}</div></li></ol></div><div className="px-5 py-3 border-t border-slate-100 flex justify-end shrink-0"><button onClick={() => setCardLogRecord(null)} className="h-8 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer">关闭</button></div></aside>
        </div>
      )}

      {/* 商户账户操作抽屉 */}
      {merchantDrawer && (
        <div className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[1px]" onMouseDown={event => { if (event.target === event.currentTarget) setMerchantDrawer(null); }}>
          <aside className={`absolute right-0 top-0 h-full w-full ${merchantDrawer === 'recharge' || merchantDrawer === 'ledger' ? 'max-w-[1180px]' : 'max-w-[560px]'} bg-white shadow-2xl border-l border-slate-200 flex flex-col`} onMouseDown={event => event.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <div className="font-bold text-slate-900 text-base">{merchantDrawer === 'wallet' ? '钱包管理' : merchantDrawer === 'points' ? '积点管理' : merchantDrawer === 'uAddress' ? 'U地址管理' : merchantDrawer === 'recharge' ? '充值明细' : '资金操作流水'}</div>
                <div className="text-[11px] text-slate-500 mt-1">{selectedMerchant.name} · <span className="font-mono">{selectedMerchant.mid}</span></div>
              </div>
              <button onClick={() => setMerchantDrawer(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><span className="material-symbols-outlined">close</span></button>
            </div>

            {merchantDrawer === 'wallet' && (
              <div className="p-5 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100"><div className="text-[10px] text-emerald-700">可用积点</div><div className="font-mono font-bold text-emerald-800 mt-1">{formatPoints(selectedMerchant.availablePoints)}</div></div>
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-100"><div className="text-[10px] text-amber-700">冻结积点</div><div className="font-mono font-bold text-amber-800 mt-1">{formatPoints(selectedMerchant.frozenPoints)}</div></div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-[10px] text-slate-500">钱包总积点</div><div className="font-mono font-bold text-slate-800 mt-1">{formatPoints(getMerchantTotal(selectedMerchant))}</div></div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">操作类型</label>
                  <select value={walletOperationType} onChange={event => { setWalletOperationType(event.target.value as MerchantWalletAction); setWalletOperationAmount(''); }} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white outline-none focus:border-emerald-500">
                    <option value="DISABLE">禁用商户钱包</option>
                    <option value="ENABLE">启用商户钱包</option>
                    <option value="FREEZE">冻结指定金额</option>
                    <option value="UNFREEZE">解冻指定金额</option>
                  </select>
                </div>
                {(walletOperationType === 'FREEZE' || walletOperationType === 'UNFREEZE') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">积点数量</label>
                    <div className="relative"><input value={walletOperationAmount} onChange={event => setWalletOperationAmount(event.target.value)} inputMode="decimal" placeholder="0.00" className="w-full px-3 py-2.5 pr-14 border border-slate-300 rounded-lg font-mono outline-none focus:border-emerald-500" /><span className="absolute right-3 top-2.5 text-slate-400">积点</span></div>
                    <div className="text-[11px] text-slate-400 mt-1">{walletOperationType === 'FREEZE' ? `最多可冻结 ${formatPoints(selectedMerchant.availablePoints)} 积点` : `最多可解冻 ${formatPoints(selectedMerchant.frozenPoints)} 积点`}</div>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-1.5"><label className="text-xs font-semibold text-slate-700">备注 <span className="text-rose-500">*</span></label><span className={`text-[11px] ${walletOperationRemark.length > 500 ? 'text-rose-600' : 'text-slate-400'}`}>{walletOperationRemark.length}/500</span></div>
                  <textarea value={walletOperationRemark} onChange={event => setWalletOperationRemark(event.target.value)} rows={3} maxLength={500} placeholder="请输入操作备注" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg resize-none outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5"><label className="text-xs font-semibold text-slate-700">截图凭证</label><span className="text-[11px] text-slate-400">非必填</span></div>
                  <input ref={walletProofInputRef} type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" multiple onChange={handleWalletProofFilesChange} className="hidden" />
                  <div className="flex flex-wrap items-start gap-2">
                    <div
                      tabIndex={0}
                      onClick={() => walletProofInputRef.current?.click()}
                      onPaste={handleWalletProofPaste}
                      onDragEnter={event => { event.preventDefault(); setIsWalletProofDragOver(true); }}
                      onDragOver={event => event.preventDefault()}
                      onDragLeave={event => { if (event.currentTarget === event.target) setIsWalletProofDragOver(false); }}
                      onDrop={handleWalletProofDrop}
                      className={`w-[88px] h-[88px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer outline-none transition-colors ${isWalletProofDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40'}`}
                    >
                      <span className="material-symbols-outlined text-[26px] text-slate-400 mb-1">file_upload</span>
                      <span className="text-xs font-semibold text-slate-500">上传图片</span>
                    </div>
                    {walletProofFilePreviews.map((preview, previewIndex) => <div key={`${preview}-${previewIndex}`} className="relative w-[88px] h-[88px] rounded-lg overflow-hidden border border-slate-200 bg-slate-50"><button onClick={() => setProofPreview({ images: walletProofFilePreviews, index: previewIndex })} className="w-full h-full cursor-pointer" title="点击查看图片"><img src={preview} alt={`截图凭证 ${previewIndex + 1}`} className="w-full h-full object-cover" /></button><button onClick={event => { event.stopPropagation(); removeWalletProofFile(previewIndex); }} className="absolute right-1 top-1 w-5 h-5 rounded-full bg-slate-900/65 text-white flex items-center justify-center hover:bg-rose-600 cursor-pointer" title="删除图片"><span className="material-symbols-outlined text-[13px]">close</span></button></div>)}
                  </div>
                  <div className="text-[11px] leading-5 text-slate-400 mt-2">支持 png/jpg/jpeg，单张不超过 2MB，最多 5 张；支持拖拽 / 粘贴上传</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                  {walletOperationType === 'DISABLE' ? '禁用后商户侧不能支出资金；后台仍可执行充值、撤回、冻结和解冻。' : walletOperationType === 'ENABLE' ? '启用后恢复商户侧资金支出能力，余额和冻结积点保持不变。' : walletOperationType === 'FREEZE' ? '仅锁定指定金额，钱包状态保持正常，剩余可用积点仍可使用。' : '仅将指定金额从冻结积点转回可用积点，钱包总积点不变。'}
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100"><button onClick={() => setMerchantDrawer(null)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer">取消</button><button onClick={handleMerchantWalletSubmit} className={`px-4 py-2 rounded-lg text-white font-semibold cursor-pointer ${walletOperationType === 'DISABLE' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>提交操作</button></div>
              </div>
            )}

            {merchantDrawer === 'points' && (
              <div className="p-5 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100"><div className="text-[10px] text-emerald-700">可用积点</div><div className="font-mono font-bold text-emerald-800 mt-1">{formatPoints(selectedMerchant.availablePoints)}</div></div>
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-100"><div className="text-[10px] text-amber-700">冻结积点</div><div className="font-mono font-bold text-amber-800 mt-1">{formatPoints(selectedMerchant.frozenPoints)}</div></div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-[10px] text-slate-500">累计充值</div><div className="font-mono font-bold text-slate-800 mt-1">{formatPoints(selectedMerchant.cumulativeRechargePoints)}</div></div>
                </div>
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">操作类型</label><select value={pointsOperationType} onChange={event => setPointsOperationType(event.target.value as MerchantPointsAction)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white outline-none focus:border-emerald-500"><option value="RECHARGE">充值积点</option><option value="WITHDRAW">撤回积点</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">积点数量 <span className="text-rose-500">*</span></label><div className="relative"><input value={pointsOperationAmount} onChange={event => setPointsOperationAmount(event.target.value)} inputMode="decimal" placeholder="0.00" className="w-full px-3 py-2.5 pr-14 border border-slate-300 rounded-lg font-mono outline-none focus:border-emerald-500" /><span className="absolute right-3 top-2.5 text-slate-400">积点</span></div></div>
                <div><div className="flex items-center justify-between mb-1.5"><label className="text-xs font-semibold text-slate-700">备注 <span className="text-rose-500">*</span></label><span className={`text-[11px] ${pointsOperationRemark.length > 500 ? 'text-rose-600' : 'text-slate-400'}`}>{pointsOperationRemark.length}/500</span></div><textarea value={pointsOperationRemark} onChange={event => setPointsOperationRemark(event.target.value)} rows={4} maxLength={500} placeholder="请输入资金操作备注" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg resize-none outline-none focus:border-emerald-500" /></div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">截图凭证</label>
                  <input ref={proofInputRef} type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" multiple onChange={handleProofFilesChange} className="hidden" />
                  <div
                    tabIndex={0}
                    onClick={() => proofInputRef.current?.click()}
                    onPaste={handleProofPaste}
                    onDragEnter={event => { event.preventDefault(); setIsProofDragOver(true); }}
                    onDragOver={event => event.preventDefault()}
                    onDragLeave={event => { if (event.currentTarget === event.target) setIsProofDragOver(false); }}
                    onDrop={handleProofDrop}
                    className={`w-[88px] h-[88px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer outline-none transition-colors ${isProofDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40'}`}
                  >
                    <div className="flex items-center justify-center text-slate-400 mb-1">
                      <span className="material-symbols-outlined text-[26px]">file_upload</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">上传图片</span>
                  </div>
                  <div className="mt-2 text-[11px] leading-5 text-slate-400">
                    <span>请上传格式为 </span>
                    <span className="text-slate-600">png/jpg/jpeg</span>
                    <span> 的文件 </span>
                    <span className="text-slate-400">【请将图片 </span>
                    <span className="font-semibold text-blue-600">拖拽 / 粘贴</span>
                    <span className="text-slate-400"> 到此处上传】</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">单张不超过 2MB，最多 5 张</div>
                  {proofFilePreviews.length > 0 && <div className="flex flex-wrap items-start gap-2 mt-3">{proofFilePreviews.map((preview, previewIndex) => <div key={`${preview}-${previewIndex}`} className="relative w-[88px] h-[88px] rounded-lg overflow-hidden border border-slate-200 bg-slate-50"><button onClick={() => setProofPreview({ images: proofFilePreviews, index: previewIndex })} className="w-full h-full cursor-pointer" title="点击查看图片"><img src={preview} alt={`截图凭证 ${previewIndex + 1}`} className="w-full h-full object-cover" /></button><button onClick={event => { event.stopPropagation(); removeProofFile(previewIndex); }} className="absolute right-1 top-1 w-5 h-5 rounded-full bg-slate-900/65 text-white flex items-center justify-center hover:bg-rose-600 cursor-pointer" title="删除图片"><span className="material-symbols-outlined text-[13px]">close</span></button></div>)}</div>}
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">撤回按“先可用、后冻结”执行。累计充值积点为历史累计值，充值增加，撤回不影响。</div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100"><button onClick={() => setMerchantDrawer(null)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer">取消</button><button onClick={handleMerchantPointsSubmit} className={`px-4 py-2 rounded-lg text-white font-semibold cursor-pointer ${pointsOperationType === 'WITHDRAW' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>提交操作</button></div>
              </div>
            )}

            {merchantDrawer === 'uAddress' && (
              <div className="p-5 space-y-5 overflow-y-auto">
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">U充值地址</label><input value={uAddressValue} onChange={event => setUAddressValue(event.target.value)} placeholder="请输入 U 充值地址" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg font-mono outline-none focus:border-emerald-500" /><div className="text-[11px] text-slate-400 mt-1">非必填，留空保存将清空当前地址</div></div>
                <div><label className="block text-xs font-semibold text-slate-700 mb-1.5">充值金额标识</label><input value={rechargeAmountMarkerValue} onChange={event => setRechargeAmountMarkerValue(event.target.value)} inputMode="decimal" placeholder="例如 .45" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg font-mono outline-none focus:border-emerald-500" /><div className="text-[11px] text-slate-400 mt-1">支持手动输入，如 .45、0.45；必须包含小数点，小数点后支持 1-4 位</div></div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">当前地址仅作为商户充值识别信息保存。正式接入时建议补充链类型校验和地址变更审计。</div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100"><button onClick={() => setMerchantDrawer(null)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer">取消</button><button onClick={handleUAddressSave} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer">保存</button></div>
              </div>
            )}

            {merchantDrawer === 'recharge' && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="p-4 border-b border-slate-100 shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={rechargeTypeFilter} onChange={event => { setRechargeTypeFilter(event.target.value as 'ALL' | RechargeDetailType); setRechargePage(1); }} className="w-[128px] h-8 px-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-emerald-500">
                      <option value="ALL">全部充值类型</option>
                      <option value="RECHARGE">积点充值</option>
                      <option value="WITHDRAW">积点撤回</option>
                    </select>
                    <select value={rechargeStatusFilter} onChange={event => { setRechargeStatusFilter(event.target.value as 'ALL' | RechargeDetailStatus); setRechargePage(1); }} className="w-[100px] h-8 px-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-emerald-500">
                      <option value="ALL">全部状态</option>
                      <option value="SUCCESS">成功</option>
                      <option value="FAILED">失败</option>
                      <option value="PENDING">待入账</option>
                    </select>
                    <select value={rechargeSourceFilter} onChange={event => { setRechargeSourceFilter(event.target.value as 'ALL' | RechargeDetailSource); setRechargePage(1); }} className="w-[100px] h-8 px-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-emerald-500">
                      <option value="ALL">全部来源</option>
                      <option value="PLATFORM">平台</option>
                      <option value="SELF">自助充值</option>
                    </select>
                    <label className="relative w-[142px]"><span className="sr-only">操作时间开始</span><input type="date" value={rechargeStartDate} onChange={event => { setRechargeStartDate(event.target.value); setRechargePage(1); }} className="w-full h-8 px-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-emerald-500" /></label>
                    <label className="relative w-[142px]"><span className="sr-only">操作时间结束</span><input type="date" value={rechargeEndDate} onChange={event => { setRechargeEndDate(event.target.value); setRechargePage(1); }} className="w-full h-8 px-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-emerald-500" /></label>
                    <button onClick={() => { setRechargePage(1); showToast(`已查询 ${filteredRechargeDetails.length} 条充值明细`); }} className="h-8 w-[56px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer">查询</button>
                    <button onClick={() => { setRechargeTypeFilter('ALL'); setRechargeStatusFilter('ALL'); setRechargeSourceFilter('ALL'); setRechargeStartDate(''); setRechargeEndDate(''); setRechargePage(1); }} className="h-8 w-[56px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer">重置</button>
                    <button onClick={exportRechargeDetails} className="h-8 w-[56px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer">导出</button>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-auto">
                  <table className="w-full min-w-[1240px] text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-[11px]">
                        <th className="py-2.5 px-3">充值类型</th>
                        <th className="py-2.5 px-3 text-right">积点数量</th>
                        <th className="py-2.5 px-3 text-right">U汇率</th>
                        <th className="py-2.5 px-3 text-right">U数量</th>
                        <th className="py-2.5 px-3">状态</th>
                        <th className="py-2.5 px-3">操作时间</th>
                        <th className="py-2.5 px-3">操作人</th>
                        <th className="py-2.5 px-3">来源</th>
                        <th className="py-2.5 px-3">备注</th>
                        <th className="py-2.5 px-3">截图凭证</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {pagedRechargeDetails.map(detail => (
                        <tr key={detail.id} className="hover:bg-slate-50 align-top">
                          <td className="py-3 px-3"><span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold ${detail.type === 'RECHARGE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{detail.type === 'RECHARGE' ? '积点充值' : '积点撤回'}</span></td>
                          <td className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${detail.type === 'RECHARGE' ? 'text-emerald-700' : 'text-rose-700'}`}>{detail.type === 'RECHARGE' ? '+' : '-'}{formatPoints(detail.points)}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-700">{detail.uRate === undefined ? null : detail.uRate.toFixed(4)}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-700">{detail.uAmount === undefined ? null : detail.uAmount.toFixed(2)}</td>
                          <td className="py-3 px-3"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${detail.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : detail.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}><span className={`w-1.5 h-1.5 rounded-full ${detail.status === 'SUCCESS' ? 'bg-emerald-500' : detail.status === 'FAILED' ? 'bg-rose-500' : 'bg-amber-500'}`} />{detail.status === 'SUCCESS' ? '成功' : detail.status === 'FAILED' ? '失败' : '待入账'}</span></td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{detail.time}</td>
                          <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{detail.operator}</td>
                          <td className="py-3 px-3 whitespace-nowrap">{detail.source === 'PLATFORM' ? '平台' : '自助充值'}</td>
                          <td className="py-3 px-3 max-w-[230px] text-slate-600">{detail.remark ? <div className="truncate" title={detail.remark}>{detail.remark}</div> : null}</td>
                          <td className="py-3 px-3">{detail.proofImages.length > 0 ? <div className="flex items-center gap-1.5"><button onClick={() => setProofPreview({ images: detail.proofImages, index: 0 })} className="w-9 h-7 overflow-hidden rounded border border-slate-200 bg-slate-100 cursor-pointer hover:ring-2 hover:ring-blue-300" title="点击查看截图凭证"><img src={detail.proofImages[0]} alt="截图凭证" className="w-full h-full object-cover" /></button><span className="text-[10px] text-blue-600 font-semibold whitespace-nowrap">共 {detail.proofImages.length} 张</span></div> : null}</td>
                        </tr>
                      ))}
                      {pagedRechargeDetails.length === 0 && <tr><td colSpan={10} className="py-16 text-center text-slate-400">暂无符合条件的充值明细</td></tr>}
                    </tbody>
                  </table>
                </div>

                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
                  <span>共 {filteredRechargeDetails.length} 条</span>
                  <div className="flex items-center gap-2">
                    <select value={rechargePageSize} onChange={event => { setRechargePageSize(Number(event.target.value)); setRechargePage(1); }} className="h-7 px-2 border border-slate-200 rounded bg-white text-[11px] outline-none">
                      <option value={10}>10条/页</option>
                      <option value={50}>50条/页</option>
                      <option value={100}>100条/页</option>
                    </select>
                    <button disabled={rechargePage <= 1} onClick={() => setRechargePage(page => Math.max(1, page - 1))} className="px-2 py-1 border border-slate-200 rounded text-slate-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">‹</button>
                    <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold">{rechargePage} / {rechargePageCount}</span>
                    <button disabled={rechargePage >= rechargePageCount} onClick={() => setRechargePage(page => Math.min(rechargePageCount, page + 1))} className="px-2 py-1 border border-slate-200 rounded text-slate-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">›</button>
                  </div>
                </div>
              </div>
            )}

            {merchantDrawer === 'ledger' && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="p-4 border-b border-slate-100 shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={ledgerTypeFilter} onChange={event => { setLedgerTypeFilter(event.target.value as 'ALL' | MerchantOperationType); setLedgerPage(1); }} className="w-[128px] h-8 px-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-emerald-500">
                      <option value="ALL">全部操作类型</option>
                      <option value="充值积点">充值积点</option>
                      <option value="撤回积点">撤回积点</option>
                      <option value="争议赔付">争议赔付</option>
                      <option value="人工冻结">人工冻结</option>
                      <option value="交易支出">交易支出</option>
                      <option value="平台费用">平台费用</option>
                    </select>
                    <select value={ledgerStatusFilter} onChange={event => { setLedgerStatusFilter(event.target.value as 'ALL' | MerchantOperationStatus); setLedgerPage(1); }} className="w-[94px] h-8 px-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-emerald-500">
                      <option value="ALL">全部状态</option>
                      <option value="SUCCESS">成功</option>
                      <option value="FAILED">失败</option>
                    </select>
                    <label className="relative w-[142px]"><span className="sr-only">操作时间开始</span><input type="date" value={ledgerStartDate} onChange={event => { setLedgerStartDate(event.target.value); setLedgerPage(1); }} className="w-full h-8 px-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-emerald-500" /></label>
                    <label className="relative w-[142px]"><span className="sr-only">操作时间结束</span><input type="date" value={ledgerEndDate} onChange={event => { setLedgerEndDate(event.target.value); setLedgerPage(1); }} className="w-full h-8 px-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-emerald-500" /></label>
                    <button onClick={() => { setLedgerPage(1); showToast(`已查询 ${filteredMerchantOperationLogs.length} 条资金操作流水`); }} className="h-8 w-[56px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer">查询</button>
                    <button onClick={() => { setLedgerTypeFilter('ALL'); setLedgerStatusFilter('ALL'); setLedgerStartDate(''); setLedgerEndDate(''); setLedgerPage(1); }} className="h-8 w-[56px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer">重置</button>
                    <button onClick={exportMerchantOperationLogs} className="h-8 w-[56px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer">导出</button>
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-auto">
                  <table className="w-full min-w-[1120px] text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-[11px]">
                        <th className="py-2.5 px-3">操作时间</th>
                        <th className="py-2.5 px-3">操作类型</th>
                        <th className="py-2.5 px-3 text-right">变动积点</th>
                        <th className="py-2.5 px-3">操作前余额</th>
                        <th className="py-2.5 px-3">操作后余额</th>
                        <th className="py-2.5 px-3">关联单号</th>
                        <th className="py-2.5 px-3">状态</th>
                        <th className="py-2.5 px-3">备注 / 凭证</th>
                        <th className="py-2.5 px-3">操作人</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {pagedMerchantOperationLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 align-top">
                          <td className="py-3 px-3 whitespace-nowrap"><div className="font-mono text-[11px] text-slate-600">{log.time}</div><div className="text-[10px] text-slate-400 mt-1">{log.id}</div></td>
                          <td className="py-3 px-3"><span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold ${log.type === '撤回积点' || log.type === '争议赔付' || log.type === '交易支出' || log.type === '平台费用' ? 'bg-rose-50 text-rose-700' : log.type === '人工冻结' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{log.type}</span></td>
                          <td className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${log.direction === '-' ? 'text-rose-700' : log.direction === '+' ? 'text-emerald-700' : 'text-slate-500'}`}>{log.direction === '—' ? '—' : `${log.direction}${formatPoints(log.amount)}`}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">可用 {formatPoints(log.beforeAvailable)}<br /><span className="text-amber-700">冻结 {formatPoints(log.beforeFrozen)}</span><br />总计 {formatPoints(log.beforeTotal)}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">可用 {formatPoints(log.afterAvailable)}<br /><span className="text-amber-700">冻结 {formatPoints(log.afterFrozen)}</span><br />总计 {formatPoints(log.afterTotal)}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">{log.relatedOrderNo ? log.relatedOrderNo : null}</td>
                          <td className="py-3 px-3"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}><span className={`w-1.5 h-1.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'}`} />{log.status === 'SUCCESS' ? '成功' : '失败'}</span></td>
                          <td className="py-3 px-3 max-w-[260px] text-slate-600"><div className="truncate" title={log.remark}>{log.remark}</div>{log.proofImages.length > 0 && <div className="flex items-center gap-1.5 mt-2"><button onClick={() => setProofPreview({ images: log.proofImages, index: 0 })} className="w-9 h-7 overflow-hidden rounded border border-slate-200 bg-slate-100 cursor-pointer hover:ring-2 hover:ring-blue-300" title="点击查看截图凭证"><img src={log.proofImages[0]} alt="截图凭证" className="w-full h-full object-cover" /></button><span className="text-[10px] text-blue-600 font-semibold whitespace-nowrap">共 {log.proofImages.length} 张</span></div>}</td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{log.operator}</td>
                        </tr>
                      ))}
                      {pagedMerchantOperationLogs.length === 0 && <tr><td colSpan={9} className="py-12 text-center text-slate-400">暂无符合条件的资金操作流水</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
                  <span>共 {filteredMerchantOperationLogs.length} 条</span>
                  <div className="flex items-center gap-2">
                    <select value={ledgerPageSize} onChange={event => { setLedgerPageSize(Number(event.target.value)); setLedgerPage(1); }} className="h-7 px-2 border border-slate-200 rounded bg-white text-[11px] outline-none">
                      <option value={10}>10条/页</option>
                      <option value={50}>50条/页</option>
                      <option value={100}>100条/页</option>
                    </select>
                    <button disabled={ledgerPage <= 1} onClick={() => setLedgerPage(page => Math.max(1, page - 1))} className="px-2 py-1 border border-slate-200 rounded text-slate-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">‹</button>
                    <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold">{ledgerPage} / {ledgerPageCount}</span>
                    <button disabled={ledgerPage >= ledgerPageCount} onClick={() => setLedgerPage(page => Math.min(ledgerPageCount, page + 1))} className="px-2 py-1 border border-slate-200 rounded text-slate-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">›</button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {proofPreview && (
        <div className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={event => { if (event.target === event.currentTarget) setProofPreview(null); }}>
          <div className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-xl shadow-2xl p-4 flex flex-col gap-3" onMouseDown={event => event.stopPropagation()}>
            <div className="flex items-center justify-between"><div><div className="font-bold text-slate-900">截图凭证</div><div className="text-[11px] text-slate-400 mt-0.5">{proofPreview.index + 1} / {proofPreview.images.length}</div></div><button onClick={() => setProofPreview(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><span className="material-symbols-outlined">close</span></button></div>
            <div className="relative min-h-[280px] max-h-[68vh] rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden"><img src={proofPreview.images[proofPreview.index]} alt={`截图凭证 ${proofPreview.index + 1}`} className="max-w-full max-h-[68vh] object-contain" />{proofPreview.images.length > 1 && <><button onClick={() => setProofPreview(previous => previous ? { ...previous, index: (previous.index - 1 + previous.images.length) % previous.images.length } : previous)} className="absolute left-3 w-9 h-9 rounded-full bg-white/90 shadow text-slate-700 hover:bg-white cursor-pointer"><span className="material-symbols-outlined">chevron_left</span></button><button onClick={() => setProofPreview(previous => previous ? { ...previous, index: (previous.index + 1) % previous.images.length } : previous)} className="absolute right-3 w-9 h-9 rounded-full bg-white/90 shadow text-slate-700 hover:bg-white cursor-pointer"><span className="material-symbols-outlined">chevron_right</span></button></>}</div>
            {proofPreview.images.length > 1 && <div className="flex justify-center gap-2 overflow-x-auto">{proofPreview.images.map((image, imageIndex) => <button key={`preview-thumb-${imageIndex}`} onClick={() => setProofPreview(previous => previous ? { ...previous, index: imageIndex } : previous)} className={`w-14 h-10 overflow-hidden rounded border-2 cursor-pointer ${proofPreview.index === imageIndex ? 'border-blue-500' : 'border-slate-200'}`}><img src={image} alt={`缩略图 ${imageIndex + 1}`} className="w-full h-full object-cover" /></button>)}</div>}
          </div>
        </div>
      )}

      {confirmState && (
        <div className="fixed inset-0 z-[60] bg-slate-950/45 backdrop-blur-[1px] flex items-center justify-center p-4" onMouseDown={event => { if (event.target === event.currentTarget) setConfirmState(null); }}>
          <div className="w-full max-w-[520px] rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden" onMouseDown={event => event.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><span className="font-bold text-slate-900">操作确认</span><button onClick={() => setConfirmState(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer" title="关闭"><span className="material-symbols-outlined text-[20px]">close</span></button></div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3"><div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${confirmState.tone === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}><span className="material-symbols-outlined">{confirmState.tone === 'danger' ? 'warning' : 'verified'}</span></div><div><div className="font-bold text-slate-900">{confirmState.title}</div><div className="text-xs text-slate-500 mt-1 leading-relaxed">{confirmState.body}</div></div></div>
              {confirmState.details && <dl className="rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden">{confirmState.details.map(detail => <div key={detail.label} className="grid grid-cols-[82px_1fr] gap-3 px-3 py-2.5 text-xs"><dt className="text-slate-500">{detail.label}</dt><dd className={`min-w-0 text-right break-all ${detail.emphasis ? confirmState.tone === 'danger' ? 'font-mono font-bold text-rose-700' : 'font-mono font-bold text-emerald-700' : 'text-slate-700'}`}>{detail.value}</dd></div>)}</dl>}
              {confirmState.notice && <div className={`rounded-lg px-3 py-2 text-[11px] leading-5 ${confirmState.tone === 'danger' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-800 border border-amber-100'}`}>{confirmState.notice}</div>}
            </div>
            <div className="px-5 py-3 flex justify-end gap-2 border-t border-slate-100"><button onClick={() => setConfirmState(null)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer">取消</button><button onClick={confirmState.onConfirm} className={`px-4 py-2 rounded-lg text-white font-semibold cursor-pointer ${confirmState.tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{confirmState.confirmLabel}</button></div>
          </div>
        </div>
      )}

      {/* 用户钱包操作抽屉 */}
      {showWalletActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-[1px]" onMouseDown={event => { if (event.target === event.currentTarget) setShowWalletActionModal(false); }}>
          <aside className="absolute right-0 top-0 h-full w-full max-w-[560px] bg-white shadow-2xl border-l border-slate-200 flex flex-col" onMouseDown={event => event.stopPropagation()}>
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
              <div><div className="font-bold text-slate-900 text-sm">钱包管理</div><div className="text-[11px] text-slate-500 mt-1">{selectedUserWallet?.userName || '未选择用户'} · <span className="font-mono">{targetUserUid}</span></div></div>
              <button onClick={() => setShowWalletActionModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs overflow-y-auto flex-1">
              {selectedUserWallet && <div className="grid grid-cols-3 gap-2"><div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100"><div className="text-[10px] text-emerald-700">可用余额</div><div className="font-mono font-bold text-emerald-800 mt-1">₦{formatPoints(selectedUserWallet.availableBalance)}</div></div><div className="p-3 rounded-lg bg-amber-50 border border-amber-100"><div className="text-[10px] text-amber-700">冻结余额</div><div className="font-mono font-bold text-amber-800 mt-1">₦{formatPoints(selectedUserWallet.frozenBalance)}</div></div><div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-[10px] text-slate-500">钱包总余额</div><div className="font-mono font-bold text-slate-800 mt-1">₦{formatPoints(selectedUserWallet.totalBalance)}</div></div></div>}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">操作类型</label>
                <select
                  value={walletActionType}
                  onChange={e => { setWalletActionType(e.target.value as UserWalletAction); setActionAmount(''); }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium outline-none focus:border-emerald-500"
                >
                  {selectedUserWallet?.status === '已禁止提现' ? <option value="ENABLE_WITHDRAW">恢复用户提现</option> : <option value="DISABLE_WITHDRAW">禁止用户提现</option>}
                  <option value="FREEZE">冻结指定金额</option>
                  <option value="UNFREEZE">解冻指定金额</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">目标用户 UID</label>
                <input
                  type="text"
                  value={targetUserUid}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-500 bg-slate-50 cursor-not-allowed"
                />
              </div>

              {(walletActionType === 'FREEZE' || walletActionType === 'UNFREEZE') && <>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">金额 (₦)</label>
                <input
                  type="text"
                  value={actionAmount}
                  onChange={e => setActionAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm outline-none focus:border-emerald-500"
                />
                <div className="text-[11px] text-slate-400 mt-1">{walletActionType === 'FREEZE' ? `最多可冻结 ₦${formatPoints(selectedUserWallet?.availableBalance || 0)}` : `最多可解冻 ₦${formatPoints(selectedUserWallet?.frozenBalance || 0)}`}</div>
              </div>
              </>}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">变动原因与审批依据 (必填)</label>
                <textarea
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5"><label className="text-xs font-semibold text-slate-700">截图凭证</label><span className="text-[11px] text-slate-400">非必填</span></div>
                <input ref={userWalletProofInputRef} type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" multiple onChange={handleUserWalletProofFilesChange} className="hidden" />
                <div className="flex flex-wrap items-start gap-2">
                  <div
                    tabIndex={0}
                    onClick={() => userWalletProofInputRef.current?.click()}
                    onPaste={handleUserWalletProofPaste}
                    onDragEnter={event => { event.preventDefault(); setIsUserWalletProofDragOver(true); }}
                    onDragOver={event => event.preventDefault()}
                    onDragLeave={event => { if (event.currentTarget === event.target) setIsUserWalletProofDragOver(false); }}
                    onDrop={handleUserWalletProofDrop}
                    className={`w-[88px] h-[88px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer outline-none transition-colors ${isUserWalletProofDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40'}`}
                  >
                    <span className="material-symbols-outlined text-[26px] text-slate-400 mb-1">file_upload</span>
                    <span className="text-xs font-semibold text-slate-500">上传图片</span>
                  </div>
                  {userWalletProofFilePreviews.map((preview, previewIndex) => <div key={`${preview}-${previewIndex}`} className="relative w-[88px] h-[88px] rounded-lg overflow-hidden border border-slate-200 bg-slate-50"><button onClick={() => setProofPreview({ images: userWalletProofFilePreviews, index: previewIndex })} className="w-full h-full cursor-pointer" title="点击查看图片"><img src={preview} alt={`截图凭证 ${previewIndex + 1}`} className="w-full h-full object-cover" /></button><button onClick={event => { event.stopPropagation(); removeUserWalletProofFile(previewIndex); }} className="absolute right-1 top-1 w-5 h-5 rounded-full bg-slate-900/65 text-white flex items-center justify-center hover:bg-rose-600 cursor-pointer" title="删除图片"><span className="material-symbols-outlined text-[13px]">close</span></button></div>)}
                </div>
                <div className="text-[11px] leading-5 text-slate-400 mt-2">支持 png/jpg/jpeg，单张不超过 2MB，最多 5 张；支持拖拽 / 粘贴上传</div>
              </div>

              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
                ⚠️ {walletActionType === 'DISABLE_WITHDRAW' ? '禁止提现仅限制后续提现申请，不改变任何余额。' : walletActionType === 'ENABLE_WITHDRAW' ? '恢复用户提现后，用户可再次发起提现申请。' : '提交后将写入 Ledger 审计流水，禁止直接修改数据库余额。'}
              </div>
            </div>

            <div className="px-5 py-3 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
              <button onClick={() => setShowWalletActionModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer">
                取消
              </button>
              <button onClick={handleExecuteWalletAction} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer">
                提交并确认
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
