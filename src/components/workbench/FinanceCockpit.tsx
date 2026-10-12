import React, { useState, useMemo } from 'react';
import { NavPath } from '../../types';

interface FinanceCockpitProps {
  onNavigate: (path: NavPath) => void;
}

// ============================================================================
// 11.1 核心指标结构
// ============================================================================
export interface FinanceCoreMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  subText: string;
  highlightText: string;
  status: 'normal' | 'warning' | 'danger';
  statusLabel: string;
  targetPath: NavPath;
  targetPathLabel: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

// ============================================================================
// 11.2 财务待办结构 (按：风险 × 金额 × 持续时间 排序)
// ============================================================================
export type FinanceRiskLevel = 'high' | 'medium' | 'low';
export type FinanceTaskType = 'settlement' | 'reconciliation' | 'points' | 'suspense' | 'loss_approval';

export interface FinanceTodoTask {
  id: string;
  title: string;
  category: FinanceTaskType;
  categoryLabel: string;
  riskLevel: FinanceRiskLevel; // 高/中/低
  riskWeight: number; // 风险分 1~100 (40%)
  amount: number; // 涉及金额 (元)
  amountDisplay: string;
  durationHours: number; // 持续时间/账龄 (小时)
  durationDisplay: string;
  detail: string; // 详情与归因
  suggestedAction: string; // 建议处置
  targetPath: NavPath; // 点击进入财务结算对应页面
  targetPageName: string;
  status: 'pending' | 'processing' | 'completed';
  canQuickAction: boolean;
  quickActionLabel?: string;
}

// 商户积点监控简表
interface MerchantPointRunway {
  id: string;
  name: string;
  balance: string;
  todayConsume: string;
  runwayDays: string;
  status: 'exhausted' | 'urgent' | 'warning' | 'normal';
  statusText: string;
  statusClass: string;
}

export const FinanceCockpit: React.FC<FinanceCockpitProps> = ({ onNavigate }) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 11.2 待办筛选: PRD 标准 4 大 Tab (资金待办 / 结算待办 / 对账异常 / 风险提醒)
  const [todoFilter, setTodoFilter] = useState<'all' | 'capital' | 'settlement' | 'reconciliation' | 'risk_alert' | 'high' | FinanceTaskType>('capital');
  const [searchQuery, setSearchQuery] = useState('');

  // 模态框控制
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isAuditDocModalOpen, setIsAuditDocModalOpen] = useState(false);
  const [activeActionTask, setActiveActionTask] = useState<FinanceTodoTask | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ============================================================================
  // 11.1 核心指标数据：
  // 待结算金额 ｜ 待对账金额 ｜ 对账差异 ｜ 低积点商户 ｜ 挂账金额 ｜ 异常损失待审批
  // ============================================================================
  const FINANCE_CORE_METRICS: FinanceCoreMetric[] = [
    {
      id: 'pending_settlement',
      name: '待结算金额',
      value: '¥568,240',
      unit: '.00',
      subText: '42 笔日结批次待放款 · 今日已结算 8 批',
      highlightText: '结算完成率 98.4%',
      status: 'normal',
      statusLabel: '正常履约',
      targetPath: 'platform-settlement',
      targetPathLabel: '结算管理',
      icon: 'payments',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'pending_reconciliation',
      name: '待对账金额',
      value: '¥1,248,500',
      unit: '.00',
      subText: '68 笔流水待四账自动勾对 · 轧差中',
      highlightText: '自动勾对率 94.2%',
      status: 'normal',
      statusLabel: '对账处理中',
      targetPath: 'financial-reconciliation',
      targetPathLabel: '财务对账',
      icon: 'fact_check',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'recon_difference',
      name: '对账差异',
      value: '¥4,820',
      unit: '.00',
      subText: '3 笔账实不符单据 · 阻断日终自动清算',
      highlightText: '需人工复核平账',
      status: 'danger',
      statusLabel: '异常警戒',
      targetPath: 'financial-reconciliation',
      targetPathLabel: '财务对账 · 差异核对',
      icon: 'rule',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
    {
      id: 'low_points_merchants',
      name: '低积点商户',
      value: '4',
      unit: '家',
      subText: '1 家已耗尽 · 3 家可用积点低于警戒线 15%',
      highlightText: '影响卡单承接',
      status: 'warning',
      statusLabel: '需紧急催充',
      targetPath: 'points-account',
      targetPathLabel: '账户管理 · 积点水位',
      icon: 'water_drop',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      id: 'suspense_amount',
      name: '挂账金额',
      value: '¥96,400',
      unit: '.00',
      subText: '共 7 笔挂账 · 其中 3 笔长账龄 >30 天',
      highlightText: '超期占用资金',
      status: 'warning',
      statusLabel: '挂账清理中',
      targetPath: 'abnormal-finance',
      targetPathLabel: '异常账务 · 挂账清理',
      icon: 'credit_card_off',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      id: 'pending_loss_approval',
      name: '异常损失待审批',
      value: '¥12,800',
      unit: '.00',
      subText: '2 笔争议垫付/撞卡赔付申请待主管核准',
      highlightText: '双岗复核流转',
      status: 'danger',
      statusLabel: '待审批',
      targetPath: 'abnormal-finance',
      targetPathLabel: '异常账务 · 损失审批',
      icon: 'approval',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-700',
    },
  ];

  // ============================================================================
  // 11.2 待办任务列表 (包含丰富数据，支持动态排序)
  // ============================================================================
  const [tasks, setTasks] = useState<FinanceTodoTask[]>([
    {
      id: 'TASK-FIN-01',
      title: '极客卡业可用积点仅剩 ¥3,200 (即将断供)',
      category: 'points',
      categoryLabel: '积点催充',
      riskLevel: 'high',
      riskWeight: 98,
      amount: 186000,
      amountDisplay: '¥186,000 (日均承揽)',
      durationHours: 3.5,
      durationDisplay: '3.5 小时',
      detail: '商户今日接单峰值超出可用质押预警线，可用承接天数不足 0.2 天，若断供将导致美区多笔大额 Apple 卡停滞转单。',
      suggestedAction: '立即向商户操盘人发起充值催办通知，或开启临时授信 50,000 USDT',
      targetPath: 'recharge-management',
      targetPageName: '充值管理',
      status: 'pending',
      canQuickAction: true,
      quickActionLabel: '一键催充值',
    },
    {
      id: 'TASK-FIN-02',
      title: '先行赔付与撞卡净损失审批 (¥12,800)',
      category: 'loss_approval',
      categoryLabel: '损失审批',
      riskLevel: 'high',
      riskWeight: 95,
      amount: 12800,
      amountDisplay: '¥12,800',
      durationHours: 24,
      durationDisplay: '24 小时 (已超时)',
      detail: '客服作业端提交的 2 笔争议仲裁终审单：商户已核销但拒付款，平台对高信用大客完成先行赔付，需财务复核转入损失台账。',
      suggestedAction: '核对官方查验时间戳与存证底稿，完成主管双岗签字并核销',
      targetPath: 'abnormal-finance',
      targetPageName: '异常账务 · 损失审批',
      status: 'pending',
      canQuickAction: true,
      quickActionLabel: '复核审批',
    },
    {
      id: 'TASK-FIN-03',
      title: '商户极速易换重复扣减流水平账 (¥800 差额)',
      category: 'reconciliation',
      categoryLabel: '对账平账',
      riskLevel: 'high',
      riskWeight: 90,
      amount: 800,
      amountDisplay: '¥800 (差额)',
      durationHours: 48,
      durationDisplay: '48 小时',
      detail: '高风险阻断单：网关偶发重试导致同一单据重复扣除商户积点，产生账实不符，阻断该商户周结清算。',
      suggestedAction: '发起双向调账冲正，将多扣的 800 积点原路反冲至商户账户',
      targetPath: 'financial-reconciliation',
      targetPageName: '财务对账 · 差异平账',
      status: 'pending',
      canQuickAction: true,
      quickActionLabel: '冲正平账',
    },
    {
      id: 'TASK-FIN-04',
      title: '长账龄冻结挂账清理 (3笔 / ¥70,000)',
      category: 'suspense',
      categoryLabel: '挂账清理',
      riskLevel: 'medium',
      riskWeight: 75,
      amount: 70000,
      amountDisplay: '¥70,000',
      durationHours: 720,
      durationDisplay: '30 天+',
      detail: '用户提现失败挂账已超期 30 天未被认领，以及商户退款单未对平挂账，长期占用财务备付金池。',
      suggestedAction: '核实原路退汇记录，确认无权属争议后转入营业外科目销账',
      targetPath: 'abnormal-finance',
      targetPageName: '异常账务 · 挂账管理',
      status: 'pending',
      canQuickAction: true,
      quickActionLabel: '挂账清理',
    },
    {
      id: 'TASK-FIN-05',
      title: 'USDT 大额放款批次终审 (¥568,240 / 42笔)',
      category: 'settlement',
      categoryLabel: '放款结算',
      riskLevel: 'medium',
      riskWeight: 72,
      amount: 568240,
      amountDisplay: '¥568,240',
      durationHours: 1.5,
      durationDisplay: '1.5 小时',
      detail: '今日 14:00 批次自动结算清单已生成，经办人员已核对完毕，待财务专责完成资金池出金复核。',
      suggestedAction: '校验资金热钱包余额，一键批量签名下发打款指令',
      targetPath: 'platform-settlement',
      targetPageName: '结算管理 · 批量放款',
      status: 'pending',
      canQuickAction: true,
      quickActionLabel: '审核出金',
    },
    {
      id: 'TASK-FIN-06',
      title: '线下银行大额充值单据流水勾稽 (8笔 / ¥12,300)',
      category: 'reconciliation',
      categoryLabel: '充值勾稽',
      riskLevel: 'low',
      riskWeight: 45,
      amount: 12300,
      amountDisplay: '¥12,300',
      durationHours: 4,
      durationDisplay: '4 小时',
      detail: '商户对公转账到账后因附言遗漏系统识别码，未能自动完成上账，需人工比对网银电子回单与商户充值申请。',
      suggestedAction: '核查银行流水流水号，人工匹配上账并增加商户积点',
      targetPath: 'recharge-management',
      targetPageName: '充值管理 · 流水勾对',
      status: 'pending',
      canQuickAction: true,
      quickActionLabel: '流水勾稽',
    },
  ]);

  // ============================================================================
  // 11.2 排序算法：严格按「风险 × 金额 × 持续时间」排序
  // ============================================================================
  const sortedAndFilteredTasks = useMemo(() => {
    return tasks
      .map(task => {
        // 1. 风险权重 (0~100)
        const riskScore = task.riskWeight;

        // 2. 金额归一化得分 (对数归一化，最大以 500,000 为满分基准)
        const amountScore = Math.min(100, Math.max(10, (Math.log10(task.amount + 1) / Math.log10(500000)) * 100));

        // 3. 持续时间归一化得分 (以 72 小时为满分基准，超过72小时记100分)
        const durationScore = Math.min(100, Math.max(10, (task.durationHours / 72) * 100));

        // 综合公式：风险(40%) × 金额(35%) × 持续时间(25%)
        const compositeScore = Number((riskScore * 0.4 + amountScore * 0.35 + durationScore * 0.25).toFixed(1));

        return {
          ...task,
          compositeScore,
        };
      })
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .filter(task => {
        if (todoFilter === 'all') return true;
        if (todoFilter === 'capital') return task.category === 'points' || task.category === 'suspense';
        if (todoFilter === 'settlement') return task.category === 'settlement';
        if (todoFilter === 'reconciliation') return task.category === 'reconciliation';
        if (todoFilter === 'risk_alert') return task.riskLevel === 'high' || task.category === 'loss_approval';
        if (todoFilter === 'high') return task.riskLevel === 'high';
        return task.category === todoFilter;
      })
      .filter(task => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(q) ||
          task.id.toLowerCase().includes(q) ||
          task.detail.toLowerCase().includes(q) ||
          task.suggestedAction.toLowerCase().includes(q)
        );
      });
  }, [tasks, todoFilter, searchQuery]);

  // 商户积点水位展示数据
  const MERCHANT_WATER_LEVELS: MerchantPointRunway[] = [
    {
      id: 'M0192',
      name: '极客卡业 (美区专线)',
      balance: '¥3,200',
      todayConsume: '¥18,600',
      runwayDays: '<0.2天',
      status: 'urgent',
      statusText: '即将耗尽',
      statusClass: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 'M0412',
      name: '极速易换点卡',
      balance: '¥0',
      todayConsume: '¥12,300',
      runwayDays: '0天',
      status: 'exhausted',
      statusText: '已耗尽·停滞',
      statusClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    },
    {
      id: 'M0204',
      name: '金玉满堂工作室',
      balance: '¥28,600',
      todayConsume: '¥15,200',
      runwayDays: '1.8天',
      status: 'warning',
      statusText: '低水位关注',
      statusClass: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'M0088',
      name: '全球礼品卡自营',
      balance: '¥326,000',
      todayConsume: '¥21,000',
      runwayDays: '15.5天',
      status: 'normal',
      statusText: '充裕正常',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  // 快捷操作
  const handleOpenAction = (task: FinanceTodoTask) => {
    setActiveActionTask(task);
    setApprovalNote('');
  };

  const handleExecuteAction = () => {
    if (!activeActionTask) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setTasks(prev =>
        prev.map(t =>
          t.id === activeActionTask.id ? { ...t, status: 'completed' } : t
        )
      );
      setIsSubmitting(false);
      showToast(`已成功执行操作:【${activeActionTask.quickActionLabel || '处理完成'}】！`);
      setActiveActionTask(null);
    }, 600);
  };

  return (
    <div className="w-full space-y-6 flex-1 bg-slate-50 text-slate-800 antialiased relative pb-16">
      {/* Toast 提示 */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* 顶栏业务定位与快捷工具 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold">
            <span className="material-symbols-outlined text-[24px]">account_balance</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">财务工作台</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                管账和钱 · 资金与风控控制中心
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                FINANCE CONTROL ENGINE V9.0
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              核心闭环：全网对账轧差 ➔ 待结算出金 ➔ 积点水位监控 ➔ 挂账与长账龄处置 ➔ 异常损失复核
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAuditDocModalOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">description</span>
            <span>导出对账底稿</span>
          </button>
          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>新建调账单据</span>
          </button>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 11.1 核心指标区 (固定展示 6 项标准指标，点击直接进入财务结算对应页面) */}
      {/* ============================================================================ */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-600 rounded-full"></span>
            <h2 className="text-sm font-bold text-slate-900">财务核心指标区</h2>
            <span className="text-xs text-slate-400">实时四账勾稽与资金敞口全域监控 · 点击卡片直达业务功能</span>
          </div>
          <span className="text-[11px] text-slate-400">更新频率: 实时秒级 / 日终轧差</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          {FINANCE_CORE_METRICS.map(metric => {
            const isDanger = metric.status === 'danger';
            const isWarning = metric.status === 'warning';

            return (
              <div
                key={metric.id}
                onClick={() => {
                  onNavigate(metric.targetPath);
                  showToast(`已直接进入【${metric.targetPathLabel}】页面`);
                }}
                className={`bg-white rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md hover:-translate-y-0.5 ${
                  isDanger
                    ? 'border-rose-300 bg-rose-50/20 ring-1 ring-rose-200'
                    : isWarning
                    ? 'border-amber-300 bg-amber-50/15 ring-1 ring-amber-200'
                    : 'border-slate-200/90 shadow-2xs hover:border-blue-400'
                }`}
              >
                <div>
                  {/* 指标名称与状态徽标 */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                      {metric.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isDanger
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {metric.statusLabel}
                    </span>
                  </div>

                  {/* 核心数值展示 */}
                  <div className="mt-3 mb-1 flex items-baseline gap-1">
                    <span className="font-mono text-2xl font-black text-slate-900 tracking-tight">
                      {metric.value}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      {metric.unit}
                    </span>
                  </div>

                  {/* 辅助说明 */}
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {metric.subText}
                  </p>
                </div>

                {/* 底部跳转指示 */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className={`font-semibold ${isDanger ? 'text-rose-600' : isWarning ? 'text-amber-700' : 'text-emerald-600'}`}>
                    {metric.highlightText}
                  </span>
                  <div className="flex items-center gap-0.5 text-slate-400 group-hover:text-blue-600">
                    <span className="font-medium text-[10.5px]">直达办理</span>
                    <span className="material-symbols-outlined text-[13px] group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================================ */}
      {/* 11.2 待办任务中心 (严格按：风险 × 金额 × 持续时间 排序) */}
      {/* ============================================================================ */}
      <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col gap-4">
        {/* 标题栏与算法规则 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <h2 className="text-sm font-bold text-slate-900">今日财务待办中心</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold">
              {sortedAndFilteredTasks.filter(t => t.status !== 'completed').length} 笔待闭环
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 font-mono">
            <span className="material-symbols-outlined text-[15px] text-amber-600">calculate</span>
            <span>待办排序引擎：风险权重(40%) × 涉及金额(35%) × 持续时间/账龄(25%)</span>
          </div>
        </div>

        {/* PRD 标准 4 大 Tab 栏: 资金待办 / 结算待办 / 对账异常 / 风险提醒 */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'capital', label: '资金待办', icon: 'account_balance_wallet', count: tasks.filter(t => t.category === 'points' || t.category === 'suspense').length, badgeColor: 'bg-amber-100 text-amber-800' },
              { id: 'settlement', label: '结算待办', icon: 'payments', count: tasks.filter(t => t.category === 'settlement').length, badgeColor: 'bg-blue-100 text-blue-800' },
              { id: 'reconciliation', label: '对账异常', icon: 'sync_problem', count: tasks.filter(t => t.category === 'reconciliation').length, badgeColor: 'bg-purple-100 text-purple-800' },
              { id: 'risk_alert', label: '风险提醒', icon: 'warning', count: tasks.filter(t => t.riskLevel === 'high' || t.category === 'loss_approval').length, badgeColor: 'bg-rose-100 text-rose-800' },
              { id: 'all', label: '全部待办', icon: 'list', count: tasks.filter(t => t.status !== 'completed').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTodoFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  todoFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  todoFilter === tab.id ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-2">
              search
            </span>
            <input
              type="text"
              placeholder="搜索待办任务、商户或金额..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 11.2 待办任务数据表格 */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3 w-20 text-center">优先级权重</th>
                <th className="py-2.5 px-3 min-w-[220px]">待办事项与归因</th>
                <th className="py-2.5 px-3 w-24">业务分类</th>
                <th className="py-2.5 px-3 w-20">风险等级</th>
                <th className="py-2.5 px-3 w-28">涉及金额</th>
                <th className="py-2.5 px-3 w-24">持续时间</th>
                <th className="py-2.5 px-3 min-w-[200px]">建议处置动作</th>
                <th className="py-2.5 px-3 min-w-[140px]">目标结算页面</th>
                <th className="py-2.5 px-3 w-28 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAndFilteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    暂无符合条件的财务待办任务
                  </td>
                </tr>
              ) : (
                sortedAndFilteredTasks.map((task, idx) => {
                  const isHigh = task.riskLevel === 'high';
                  const isMedium = task.riskLevel === 'medium';
                  const isCompleted = task.status === 'completed';

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCompleted
                          ? 'opacity-40 bg-slate-50/60'
                          : isHigh
                          ? 'bg-rose-50/15'
                          : ''
                      }`}
                    >
                      {/* 优先级打分 */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center ${
                              isCompleted
                                ? 'bg-slate-200 text-slate-500'
                                : idx === 0
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : idx === 1
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <span className="text-[9.5px] font-mono text-slate-400 mt-0.5">
                            {task.compositeScore}分
                          </span>
                        </div>
                      </td>

                      {/* 待办标题与说明 */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{task.title}</span>
                            <span className="font-mono text-[10px] text-slate-400">{task.id}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {task.detail}
                          </span>
                        </div>
                      </td>

                      {/* 业务分类 */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {task.categoryLabel}
                        </span>
                      </td>

                      {/* 风险等级 */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            isHigh
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isMedium
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isHigh ? '高风险' : isMedium ? '中风险' : '低风险'}
                        </span>
                      </td>

                      {/* 涉及金额 */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {task.amountDisplay}
                      </td>

                      {/* 持续时间 */}
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {task.durationDisplay}
                      </td>

                      {/* 建议动作 */}
                      <td className="py-3 px-3 text-slate-700 leading-snug">
                        <div className="flex items-start gap-1">
                          <span className="material-symbols-outlined text-blue-600 text-[14px] shrink-0 mt-0.5">
                            lightbulb
                          </span>
                          <span>{task.suggestedAction}</span>
                        </div>
                      </td>

                      {/* 点击进入财务结算对应页面 */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate(task.targetPath);
                            showToast(`已进入【${task.targetPageName}】模块`);
                          }}
                          className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{task.targetPageName}</span>
                          <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                        </button>
                      </td>

                      {/* 操作 */}
                      <td className="py-3 px-3 text-right">
                        {isCompleted ? (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                            <span className="material-symbols-outlined text-[14px]">check</span>
                            已办结
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenAction(task)}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs cursor-pointer transition-colors"
                          >
                            {task.quickActionLabel || '处置'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* 辅助专区：商户积点水位监控表 */}
      {/* ============================================================================ */}
      <section className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
            <h2 className="text-sm font-bold text-slate-900">商户积点水位大盘监控 (关联核心指标 ④)</h2>
          </div>
          <button
            onClick={() => onNavigate('points-account')}
            className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1"
          >
            <span>进入商户账户管理全量矩阵</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 font-medium border-b border-slate-100">
              <tr>
                <th className="pb-2">商户编号及名称</th>
                <th className="pb-2">当前可用质押/积点</th>
                <th className="pb-2">今日消耗金额</th>
                <th className="pb-2">预计可用支撑天数</th>
                <th className="pb-2">水位状态</th>
                <th className="pb-2 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[12px]">
              {MERCHANT_WATER_LEVELS.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 font-sans font-semibold text-slate-900">
                    {m.name} <span className="text-slate-400 font-mono">({m.id})</span>
                  </td>
                  <td className={`py-2.5 font-bold ${m.balance === '¥0' ? 'text-rose-600' : 'text-slate-900'}`}>
                    {m.balance}
                  </td>
                  <td className="py-2.5 text-slate-600">{m.todayConsume}</td>
                  <td className="py-2.5 font-bold text-slate-800">{m.runwayDays}</td>
                  <td className="py-2.5 font-sans">
                    <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${m.statusClass}`}>
                      {m.statusText}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-sans">
                    <button
                      onClick={() => {
                        onNavigate('recharge-management');
                        showToast(`已跳转充值催办通道，为【${m.name}】配发充值单！`);
                      }}
                      className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold"
                    >
                      催充增额
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* 模态框 1: 待办任务快速处置确认 */}
      {/* ============================================================================ */}
      {activeActionTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">
                  account_balance_wallet
                </span>
                <span className="font-bold text-sm text-slate-900">
                  财务指令经办处置 · {activeActionTask.categoryLabel}
                </span>
              </div>
              <button
                onClick={() => setActiveActionTask(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3.5 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex flex-col gap-1.5">
                <span className="font-bold text-slate-900 text-sm">{activeActionTask.title}</span>
                <div className="flex items-center justify-between text-slate-600 font-mono">
                  <span>涉及金额: <strong className="text-slate-900">{activeActionTask.amountDisplay}</strong></span>
                  <span>持续时间: <strong className="text-slate-900">{activeActionTask.durationDisplay}</strong></span>
                </div>
                <p className="text-slate-500 mt-1 leading-relaxed">{activeActionTask.detail}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">系统推荐处置方案：</span>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium leading-relaxed">
                  {activeActionTask.suggestedAction}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  财务复核批注 / 凭证字号 (双岗存证留痕)：
                </label>
                <textarea
                  rows={2}
                  value={approvalNote}
                  onChange={e => setApprovalNote(e.target.value)}
                  placeholder="例如：经办人已核对银行流水凭证一致，予以复核放行。"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const target = activeActionTask.targetPath;
                  setActiveActionTask(null);
                  onNavigate(target);
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1"
              >
                <span>直接前往【{activeActionTask.targetPageName}】完整办理</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveActionTask(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleExecuteAction}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? '处理中...' : '确认签批并结清'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 模态框 2: 新建调账单据 */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">新建双向调账单据 (双岗分离机制)</span>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">调账目标账户类型</label>
                <select className="w-full p-2 border border-slate-200 rounded-lg text-xs">
                  <option>商户质押/积点账户 (反冲/增额)</option>
                  <option>用户钱包账户 (补发/扣减)</option>
                  <option>平台收益科目 (差错损失平账)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">调账金额 (USDT / CNY)</label>
                <input type="number" placeholder="请输入调账金额" className="w-full p-2 border border-slate-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">调账原因及凭证编号</label>
                <textarea rows={2} placeholder="如：#KD-991204 结算单边错误反冲" className="w-full p-2 border border-slate-200 rounded-lg text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setIsAdjustModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">取消</button>
              <button
                onClick={() => {
                  setIsAdjustModalOpen(false);
                  showToast('调账单已成功提交经办，已流转至财务主管待复核池！');
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
              >
                提交经办审批
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模态框 3: 导出对账底稿 */}
      {isAuditDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">导出财务对账审计底稿</span>
              <button onClick={() => setIsAuditDocModalOpen(false)} className="text-slate-400">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              底稿将包含四账勾稽明细表（商户流水、对公银行流水、系统卡单履约、外部抓取存证），支持导出为标准 XLSX 格式并附加财务数字防伪哈希。
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setIsAuditDocModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">取消</button>
              <button
                onClick={() => {
                  setIsAuditDocModalOpen(false);
                  showToast('对账审计底稿已成功生成并启动下载 (FIN_AUDIT_202610.xlsx)！');
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>确认导出</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
