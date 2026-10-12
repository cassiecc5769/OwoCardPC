import React, { useState } from 'react';
import {
  MemberTierConfig,
  GrowthFormulaRule,
  RetentionPolicyConfig,
  MemberProfile,
} from './types';

interface MemberOverviewTabProps {
  tiers: MemberTierConfig[];
  rules: GrowthFormulaRule[];
  retentionConfig: RetentionPolicyConfig;
  members: MemberProfile[];
  onOpenAuditSnapshot: () => void;
  onOpenPublishRule: () => void;
  onEditTier: (tier: MemberTierConfig) => void;
  onOpenFormulaModal: () => void;
  onOpen360: (member: MemberProfile) => void;
  onOpenAdjust: (member: MemberProfile) => void;
  onOpenCoupon: (member: MemberProfile) => void;
  onShowToast: (msg: string) => void;
}

export const MemberOverviewTab: React.FC<MemberOverviewTabProps> = ({
  tiers,
  rules,
  retentionConfig,
  members,
  onOpenAuditSnapshot,
  onOpenPublishRule,
  onEditTier,
  onOpenFormulaModal,
  onOpen360,
  onOpenAdjust,
  onOpenCoupon,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('全部');
  const [selectedStatus, setSelectedStatus] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Filter members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.preferredCards.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTier = selectedTier === '全部' || m.tier === selectedTier;
    const matchesStatus =
      selectedStatus === '全部' ||
      (selectedStatus === '跃升升级' && m.status === '跃升升级') ||
      (selectedStatus === '稳定保级' && (m.status === '稳定保级' || m.status === '已达最高级')) ||
      (selectedStatus === '预警下调' && m.status === '预警下调');

    return matchesSearch && matchesTier && matchesStatus;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedTier('全部');
    setSelectedStatus('全部');
    setCurrentPage(1);
    onShowToast('已重置会员检索筛选条件');
  };

  const handleExport = () => {
    onShowToast(`已成功导出 ${filteredMembers.length} 名高价值会员名录数据 (CSV)`);
  };

  return (
    <div className="flex flex-col w-full space-y-5 text-slate-800 antialiased">
      {/* Top Operational Banner & Meta Header */}
      <div className="relative overflow-hidden bg-white rounded-xl shadow-xs border border-slate-200/80 p-5">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-blue-600/5 via-indigo-600/5 to-transparent pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[11px] font-semibold tracking-wider">
                MODULE 03
              </span>
              <span className="font-mono text-xs text-blue-600 font-semibold tracking-wide">
                GROWTH & RETENTION ENGINE
              </span>
              <span className="text-slate-300 font-mono text-xs">|</span>
              <span className="font-mono text-xs text-slate-400">SPEC PRD v2.0 SEC-5 COMPLIANT</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              会员等级体系与成长规则控制台
            </h1>
            <p className="text-xs text-slate-500 max-w-4xl leading-relaxed">
              通过 LV1 新客至 LV5 殿堂核心等级体系、真实交易贡献驱动成长值机制与梯级权益联动，促进用户长期稳定出卡与批量大额转让。
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenAuditSnapshot}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span>等级审计快照</span>
            </button>
            <button
              onClick={onOpenPublishRule}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">rule_folder</span>
              <span>发布全网生效规则</span>
            </button>
          </div>
        </div>
      </div>

      {/* Layer 1: 4 Key Membership Asset Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: 全平台会员总盘 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                全平台会员总盘
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl font-bold text-slate-900 tracking-tight">68,430</span>
                <span className="text-xs text-slate-400">人</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div className="mt-4 pt-2 bg-slate-50/80 rounded-lg p-2.5 space-y-1 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>活跃会员占比</span>
              <span className="font-mono font-semibold text-emerald-600">78.4%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>月度跃迁晋升率</span>
              <span className="font-mono font-semibold text-blue-600">8.6%</span>
            </div>
          </div>
        </div>

        {/* Card 2: 高价值大客池 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                高价值大客池 (LV4 + LV5)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl font-bold text-slate-900 tracking-tight">4,210</span>
                <span className="text-xs text-slate-400">人</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">diamond</span>
            </div>
          </div>
          <div className="mt-4 pt-2 bg-slate-50/80 rounded-lg p-2.5 space-y-1 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>总盘人口占比</span>
              <span className="font-mono font-semibold text-slate-900">仅 6.1%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>平台 GMV 贡献度</span>
              <span className="font-mono font-semibold text-emerald-600">58.4%</span>
            </div>
          </div>
        </div>

        {/* Card 3: 累计会员上浮加点支出 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                累计会员上浮加点支出
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-bold text-blue-600 tracking-tight">+$42,860.00</span>
                <span className="font-mono text-xs text-slate-400 font-medium ml-1">USD</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100/60 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">currency_exchange</span>
            </div>
          </div>
          <div className="mt-4 pt-2 bg-slate-50/80 rounded-lg p-2.5 space-y-1 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>平均出卡额外溢价</span>
              <span className="font-mono font-semibold text-blue-600">+0.35%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>带动复购频次提升</span>
              <span className="font-mono font-semibold text-emerald-600">+24.2%</span>
            </div>
          </div>
        </div>

        {/* Card 4: 成长值总池存量 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                成长值总池存量 (PTS)
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-bold text-slate-900 tracking-tight">128,450,000</span>
                <span className="font-mono text-xs text-slate-400 font-medium ml-1">PTS</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
          </div>
          <div className="mt-4 pt-2 bg-slate-50/80 rounded-lg p-2.5 space-y-1 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>真实卡单交易贡献</span>
              <span className="font-mono font-semibold text-emerald-600">96.2%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>首单及激励任务奖励</span>
              <span className="font-mono font-semibold text-slate-500">3.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 2: LV1~LV5 Membership Hierarchy & Tier Privilege Cards */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h2 className="text-base font-bold text-slate-900">LV1~LV5 会员等级与梯级权益配置矩阵</h2>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
              PRD 5.3 严格对照
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
            <span>全部等级规则处于实时运行状态</span>
          </div>
        </div>

        {/* 5 Tier Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {tiers.map((t) => {
            const isLV5 = t.tier === 'LV5';
            const isLV4 = t.tier === 'LV4';
            const isLV3 = t.tier === 'LV3';
            const isLV2 = t.tier === 'LV2';

            return (
              <div
                key={t.id}
                className={`bg-white rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border ${
                  isLV5
                    ? 'border-indigo-200'
                    : isLV4
                    ? 'border-blue-200'
                    : isLV3
                    ? 'border-blue-100'
                    : 'border-slate-200/80'
                }`}
              >
                <div>
                  {/* Top card header */}
                  <div className={`flex items-center justify-between pb-3 mb-3 ${t.headerBg} -mx-4 -mt-4 p-4 rounded-t-xl`}>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${t.badgeBg} ${t.badgeText}`}>
                        {t.tier}
                      </span>
                      <span className={`font-bold text-xs ${isLV5 ? 'text-indigo-900' : isLV4 ? 'text-blue-900' : 'text-slate-800'}`}>
                        {t.name}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      {isLV5 ? 'stars' : isLV4 ? 'diamond' : isLV3 ? 'workspace_premium' : isLV2 ? 'military_tech' : 'person_outline'}
                    </span>
                  </div>

                  {/* Body properties */}
                  <div className="space-y-3">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">晋升门槛</div>
                      <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                        {t.thresholdPts.toLocaleString()} PTS
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500">报价结算系数</span>
                        <span className="font-mono font-semibold text-slate-800">{t.quoteCoefficient}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500">额外溢价加点</span>
                        <span className={`font-mono font-semibold ${t.bonusValue > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {t.bonusPercent}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500">核销队列通道</span>
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                          isLV5
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : isLV4 || isLV3
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t.queueChannel}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500">客服服务保障</span>
                        <span className="text-slate-700 text-[11px] truncate max-w-[120px]" title={t.csGuarantee}>
                          {t.csGuarantee}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 mb-2.5">
                    <span>{isLV5 ? '核心基数' : '池内基数'}</span>
                    <span className="text-slate-900 font-semibold">{t.memberCount.toLocaleString()} 人</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onEditTier(t)}
                      className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-center text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      调整规则
                    </button>
                    <button
                      onClick={() => onEditTier(t)}
                      className={`py-1.5 px-2 rounded-lg text-center text-[11px] font-medium transition-colors cursor-pointer ${
                        isLV5
                          ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      特权配置
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layer 3: PRD 5.2 Growth Rules & Retention Lifecycle Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: 成长值获取公式计算模型 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-[18px]">calculate</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">成长值获取与结算公式 (PRD 5.2.1)</h3>
                <span className="font-mono text-[10px] text-slate-400">REAL-TIME ACCRUAL & DEDUCTION PARSER</span>
              </div>
            </div>
            <button
              onClick={onOpenFormulaModal}
              className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>参数配置</span>
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3 rounded-lg flex items-center justify-between ${
                  rule.type === 'deduction' ? 'bg-red-50/60 border border-red-100' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-md flex items-center justify-center font-mono text-[11px] font-bold ${
                    rule.type === 'deduction' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {rule.code}
                  </span>
                  <div>
                    <div className={`font-semibold ${rule.type === 'deduction' ? 'text-red-700' : 'text-slate-900'}`}>
                      {rule.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{rule.desc}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-mono font-bold text-xs ${
                    rule.type === 'deduction' ? 'text-red-700' : rule.code === '01' ? 'text-emerald-600' : 'text-blue-600'
                  }`}>
                    {rule.formulaText}
                  </div>
                  <span className="text-[10px] text-slate-400">{rule.subText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 保级周期与衰减规则控制面板 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-[18px]">update</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">保级周期与衰减规则引擎 (PRD 5.2.2)</h3>
                <span className="font-mono text-[10px] text-slate-400">RETENTION LIFECYCLE & DECAY LOGIC</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] font-semibold">
              {retentionConfig.cronSchedule}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Param 1 */}
            <div className="p-3 rounded-lg bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">统计考量周期 (Rolling Window)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">以滚动时段监测出卡指标，避免瞬间刷单冲击长期权益</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono font-bold text-slate-900 px-2.5 py-1 bg-white rounded-md shadow-2xs border border-slate-100">
                  滚动 {retentionConfig.rollingWindowDays} 天
                </span>
                <span className="material-symbols-outlined text-[16px] text-slate-400">lock</span>
              </div>
            </div>

            {/* Param 2 */}
            <div className="p-3 rounded-lg bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">保级基本要求 (二者满足其一即通过)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">门槛 A: 周期内核销满 3 笔 | 门槛 B: 累计达成 50% 等级门槛</div>
              </div>
              <div className="text-right shrink-0">
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px] font-semibold">
                  ≥ {retentionConfig.minTradesCount} 笔 或 {retentionConfig.minPtsPercent}% PTS
                </span>
              </div>
            </div>

            {/* Param 3 */}
            <div className="p-3 rounded-lg bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">逾期未达标降级策略</div>
                <div className="text-[11px] text-slate-400 mt-0.5">保护客群心理感知，不发生断崖式降至初始新客</div>
              </div>
              <div className="text-right shrink-0">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">
                  {retentionConfig.decayStrategy}
                </span>
              </div>
            </div>

            {/* Param 4: 预警触发 */}
            <div className="p-3 rounded-lg bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">降级前触达与自动化关怀</div>
                <div className="text-[11px] text-slate-400 mt-0.5">在窗口期届满倒数时段自动通过 App Push、短信及定向券挽回</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-600 font-semibold">
                  倒计时 {retentionConfig.warningDays} 天预警
                </span>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="px-2 py-1 rounded bg-blue-600 text-white font-mono text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
                >
                  查看流转模板
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: High Value Tier Movement & Real-time Operations Monitor Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Filter Bar Header */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-blue-600">swap_horiz</span>
            <h3 className="font-bold text-sm text-slate-900">高价值会员跃迁与保级流动监控列表</h3>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
              实时动态捕获
            </span>
          </div>

          {/* Search Filters */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-64 h-8.5 pl-8 pr-3 bg-white text-slate-900 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                placeholder="会员UID / 手机号 / 卡种偏好..."
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">search</span>
            </div>

            <select
              value={selectedTier}
              onChange={(e) => {
                setSelectedTier(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8.5 px-3 bg-white text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            >
              <option value="全部">全部等级 (LV1 - LV5)</option>
              <option value="LV5">LV5 殿堂核心 (1,100)</option>
              <option value="LV4">LV4 钻石大客 (3,110)</option>
              <option value="LV3">LV3 黄金会员 (18,250)</option>
              <option value="LV2">LV2 白银会员 (24,120)</option>
              <option value="LV1">LV1 普通新客 (21,850)</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8.5 px-3 bg-white text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            >
              <option value="全部">跃迁状态: 全部</option>
              <option value="跃升升级">跃升升级 (晋升至高阶)</option>
              <option value="稳定保级">稳定保级 (达标正常)</option>
              <option value="预警下调">预警下调 (距降级 &lt;15天)</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="h-8.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              <span>重置</span>
            </button>

            <button
              onClick={handleExport}
              className="h-8.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>导出名录</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4 font-semibold">用户基本标识</th>
                <th className="py-2.5 px-4 font-semibold">当前等级</th>
                <th className="py-2.5 px-4 font-semibold">累计成长值</th>
                <th className="py-2.5 px-4 font-semibold">距下一等级差额</th>
                <th className="py-2.5 px-4 font-semibold">近30天 GMV</th>
                <th className="py-2.5 px-4 font-semibold">偏好核心卡种</th>
                <th className="py-2.5 px-4 font-semibold">享受权益加点</th>
                <th className="py-2.5 px-4 font-semibold">最近出卡时间</th>
                <th className="py-2.5 px-4 font-semibold text-right">调度操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="material-symbols-outlined text-[32px] text-slate-300">search_off</span>
                      <span>未找到符合条件的会员记录</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const isLV5 = m.tier === 'LV5';
                  const isLV4 = m.tier === 'LV4';
                  const isLV3 = m.tier === 'LV3';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full ${m.avatarBg} text-white flex items-center justify-center font-mono text-[10px] font-bold shadow-2xs`}>
                            {m.tier === 'LV5' ? 'VIP' : m.tier === 'LV4' ? 'DIA' : m.tier === 'LV3' ? 'GLD' : 'SLV'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{m.uid}</span>
                            <span className="font-mono text-[11px] text-slate-400">{m.phone}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            isLV5
                              ? 'bg-indigo-600 text-white'
                              : isLV4
                              ? 'bg-blue-600 text-white'
                              : isLV3
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {m.tierName}
                          </span>
                          {m.status === '预警下调' && (
                            <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-mono text-[10px] font-semibold">
                              距降级 {m.warningDaysRemaining || 7}天
                            </span>
                          )}
                          {m.status === '跃升升级' && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-semibold">
                              今日晋升
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        {m.currentPts.toLocaleString()} PTS
                      </td>

                      <td className="py-2.5 px-4">
                        {m.nextTierGapText === '已达最高级' ? (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[11px]">
                            已达最高级
                          </span>
                        ) : (
                          <span className="font-mono text-slate-500 text-[11px]">
                            {m.nextTierGapText}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                        ${m.gmv30d.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                          {m.preferredCards.join(' / ')}
                        </span>
                      </td>

                      <td className="py-2.5 px-4">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold text-[11px]">
                          {m.bonusRate}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                        {m.lastTradeTime}
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpen360(m)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-blue-600 font-medium text-[11px] transition-colors cursor-pointer"
                          >
                            360°档案
                          </button>
                          <button
                            onClick={() => onOpenAdjust(m)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
                          >
                            调分审批
                          </button>
                          <button
                            onClick={() => onOpenCoupon(m)}
                            className={`px-2 py-1 rounded font-medium text-[11px] transition-colors cursor-pointer ${
                              m.status === '预警下调'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-emerald-700'
                            }`}
                          >
                            {m.status === '预警下调' ? '定向挽留券' : '发关怀券'}
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

        {/* Table Pagination Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-slate-500 text-xs">
          <div className="flex items-center gap-2">
            <span>
              共检索到 <strong className="text-slate-900 font-mono font-bold">{filteredMembers.length}</strong> 名重点跟踪会员
            </span>
            <span>·</span>
            <span>当前筛选池总基数 4,210 人</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-lg font-mono text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === 1 ? 'bg-blue-600 text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 rounded-lg font-mono text-xs flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === 2 ? 'bg-blue-600 text-white shadow-2xs font-semibold' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-8 h-8 rounded-lg font-mono text-xs flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === 3 ? 'bg-blue-600 text-white shadow-2xs font-semibold' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button
              onClick={() => setCurrentPage(211)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-mono text-xs flex items-center justify-center transition-colors cursor-pointer"
            >
              211
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* 流转关怀模板查看弹窗 */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">mark_email_read</span>
                <span className="font-bold text-sm text-slate-900">降级预警关怀流转模板库</span>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
                <div className="font-bold text-blue-900">模板 A: 倒计时 15 天短信/PUSH 提醒</div>
                <p className="text-blue-700 text-[11px] mt-1 leading-relaxed">
                  “【平台通知】尊贵的会员，您当前的钻石等级将在15天后进行周期审核，再完成1笔出卡交易即可享受下一季度绿色通道与溢价特权！”
                </p>
              </div>
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100">
                <div className="font-bold text-indigo-900">模板 B: 倒计时 7 天定向加成券触发</div>
                <p className="text-indigo-700 text-[11px] mt-1 leading-relaxed">
                  “【专属关怀】特为您派发一张 +0.50% 出卡专属提价券，有效期7天，出卡立享额外收益并锁定保级资格。”
                </p>
              </div>
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                已了解
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
