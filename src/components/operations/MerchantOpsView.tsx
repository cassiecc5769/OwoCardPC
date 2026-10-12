import React, { useState, useMemo } from 'react';
import { NavPath } from '../../types';
import {
  MerchantTierItem,
  SkuSupplyAnalysisItem,
  FulfillmentDrilldownItem,
  MerchantProblemItem,
  MerchantTierGrade,
  MerchantProblemStatus
} from './merchantOpsTypes';
import {
  INITIAL_MERCHANT_TIERS,
  INITIAL_SKU_SUPPLY_LIST,
  INITIAL_FULFILLMENT_DRILLDOWN,
  INITIAL_MERCHANT_PROBLEMS
} from './mockMerchantOpsData';

interface MerchantOpsViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
  showToast: (msg: string) => void;
}

type MainTab = 'overview' | 'analysis' | 'problems';
type AnalysisSubView = 'tiering' | 'supply' | 'fulfillment';

export const MerchantOpsView: React.FC<MerchantOpsViewProps> = ({ currentPath, onNavigate, showToast }) => {
  // 3 大主 Tab: 商户总览 / 商户分析 / 商户问题
  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    if (currentPath === 'merchant-tiering') return 'analysis';
    if (currentPath === 'merchant-ops-issues') return 'problems';
    return 'overview';
  });

  // 商户分析下的 3 个视角: 商户分层 / 供给分析 / 履约分析
  const [analysisView, setAnalysisView] = useState<AnalysisSubView>('tiering');

  // 路由同步
  React.useEffect(() => {
    if (currentPath === 'merchant-tiering') {
      setActiveTab('analysis');
      setAnalysisView('tiering');
    } else if (currentPath === 'merchant-ops-issues') {
      setActiveTab('problems');
    } else if (currentPath === 'merchant-ops-overview' || currentPath === 'merchant-ops') {
      setActiveTab('overview');
    }
  }, [currentPath]);

  // Merchant Score 权重配置 (3.1)
  const [weightQuote, setWeightQuote] = useState<number>(20);
  const [weightCapacity, setWeightCapacity] = useState<number>(20);
  const [weightFulfillment, setWeightFulfillment] = useState<number>(25);
  const [weightQuality, setWeightQuality] = useState<number>(20);
  const [weightContribution, setWeightContribution] = useState<number>(15);
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);

  // 数据集状态
  const [tierList] = useState<MerchantTierItem[]>(INITIAL_MERCHANT_TIERS);
  const [supplyList] = useState<SkuSupplyAnalysisItem[]>(INITIAL_SKU_SUPPLY_LIST);
  const [fulfillmentList] = useState<FulfillmentDrilldownItem[]>(INITIAL_FULFILLMENT_DRILLDOWN);
  const [problemList, setProblemList] = useState<MerchantProblemItem[]>(INITIAL_MERCHANT_PROBLEMS);

  // Tab 2A 分层筛选
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  // Tab 2B 供给状态筛选
  const [supplyStatusFilter, setSupplyStatusFilter] = useState<string>('ALL');
  // Tab 2C 履约商户筛选
  const [fulMerchantFilter, setFulMerchantFilter] = useState<string>('ALL');

  // Tab 3 问题筛选
  const [probCategoryFilter, setProbCategoryFilter] = useState<string>('ALL');
  const [probStatusFilter, setProbStatusFilter] = useState<string>('ALL');
  const [probSearch, setProbSearch] = useState('');

  // 弹窗状态
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantTierItem | null>(null);

  // 派单模拟计算示范 (3.3)
  const [simSKU] = useState('Apple Gift Card US $100');
  const [simMerchantAInflight] = useState(20); // 满载 20/20
  const [simMerchantAScore] = useState(96.5);
  const [simMerchantBInflight] = useState(4);  // 4/20
  const [simMerchantBScore] = useState(91.0);

  // 动态计算 Merchant Score (3.1)
  const computeMerchantScore = (m: MerchantTierItem) => {
    const quoteScore = m.quoteCompetitiveness; // 报价分
    const capacityScore = Math.min(100, (m.coveredSkuCount / 30) * 100); // 承接分
    const fulfillmentScore = m.fulfillmentSuccessRate; // 履约分
    const qualityScore = Math.max(0, 100 - m.aftersaleDisputeRate * 200 - m.anomalyCount * 10); // 质量分
    const contributionScore = Math.min(100, (m.monthlyGmv / 300000) * 100); // 平台贡献分

    const total =
      (quoteScore * weightQuote) / 100 +
      (capacityScore * weightCapacity) / 100 +
      (fulfillmentScore * weightFulfillment) / 100 +
      (qualityScore * weightQuality) / 100 +
      (contributionScore * weightContribution) / 100;

    return {
      totalScore: parseFloat(total.toFixed(1)),
      quoteScore: Math.round(quoteScore),
      capacityScore: Math.round(capacityScore),
      fulfillmentScore: Math.round(fulfillmentScore),
      qualityScore: Math.round(qualityScore),
      contributionScore: Math.round(contributionScore)
    };
  };

  // 过滤：商户分层 (Tab 2A)
  const filteredTiers = useMemo(() => {
    return tierList.filter((m) => {
      if (tierFilter !== 'ALL' && m.tier !== tierFilter) return false;
      return true;
    });
  }, [tierList, tierFilter]);

  // 过滤：SKU 供给分析 (Tab 2B)
  const filteredSupply = useMemo(() => {
    return supplyList.filter((s) => {
      if (supplyStatusFilter !== 'ALL' && s.supplyStatus !== supplyStatusFilter) return false;
      return true;
    });
  }, [supplyList, supplyStatusFilter]);

  // 过滤：履约链路分析 (Tab 2C)
  const filteredFulfillment = useMemo(() => {
    return fulfillmentList.filter((f) => {
      if (fulMerchantFilter !== 'ALL' && f.merchantMid !== fulMerchantFilter) return false;
      return true;
    });
  }, [fulfillmentList, fulMerchantFilter]);

  // 过滤：商户问题 (Tab 3)
  const filteredProblems = useMemo(() => {
    return problemList.filter((p) => {
      if (probCategoryFilter !== 'ALL' && p.category !== probCategoryFilter) return false;
      if (probStatusFilter !== 'ALL' && p.status !== probStatusFilter) return false;
      if (probSearch.trim()) {
        const kw = probSearch.toLowerCase().trim();
        const match =
          p.id.toLowerCase().includes(kw) ||
          p.merchantName.toLowerCase().includes(kw) ||
          p.merchantMid.toLowerCase().includes(kw) ||
          p.title.toLowerCase().includes(kw) ||
          p.description.toLowerCase().includes(kw) ||
          p.owner.toLowerCase().includes(kw);
        if (!match) return false;
      }
      return true;
    });
  }, [problemList, probCategoryFilter, probStatusFilter, probSearch]);

  // 辅助渲染分层徽标
  const renderTierBadge = (tier: MerchantTierGrade) => {
    switch (tier) {
      case 'CORE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="material-symbols-outlined text-[13px]">stars</span>
            核心商户
          </span>
        );
      case 'GROWING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="material-symbols-outlined text-[13px]">trending_up</span>
            成长商户
          </span>
        );
      case 'STANDARD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            普通商户
          </span>
        );
      case 'NEEDS_IMPROVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="material-symbols-outlined text-[13px]">warning</span>
            待改善商户
          </span>
        );
      case 'HIGH_RISK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="material-symbols-outlined text-[13px]">dangerous</span>
            风险商户
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{tier}</span>;
    }
  };

  return (
    <div className="space-y-4 text-xs antialiased text-slate-800">
      {/* 顶部 Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-xl">store</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">商户运营</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                商户综合质量与 Merchant Score 评估中枢
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              量化商户长期经营质量，形成 Merchant Score 综合评分与 5 级商户分层。
              配合派单系统逻辑：先判断【可承接？】，再结合【报价 + 负载 + Merchant Score + 风险规则】综合计分派单。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowWeightModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            配置 Merchant Score 权重
          </button>
          <button
            onClick={() => onNavigate && onNavigate('quote-management')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">swap_horiz</span>
            跳转报价运营
          </button>
        </div>
      </div>

      {/* 3 大主 Tab */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: '商户总览', icon: 'dashboard' },
          { id: 'analysis', label: '商户分析 & Merchant Score', icon: 'analytics' },
          { id: 'problems', label: '商户问题', icon: 'warning', badge: problemList.filter((p) => p.status !== 'RESOLVED').length, badgeClass: 'bg-rose-100 text-rose-700' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3.5 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                isActive
                  ? 'text-blue-700 bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${isActive ? 'bg-blue-100 text-blue-800' : tab.badgeClass}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </section>

      {/* TAB 1: 商户总览 */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5">verified</span>
            <div className="text-xs text-slate-800 leading-relaxed flex-1">
              <span className="font-bold text-blue-950">商户大盘经营质效结论：</span>
              大盘商户平均 Merchant Score 为 <strong>91.4 分</strong>。核心商户 (Tier S/A) 占据大盘 84% 交易量；
              商户分层用于经营扶持与派单权重参考，与风控安全阻断红线互相独立。
            </div>
          </div>

          {/* 3.3 派单逻辑全流程示范卡片 */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">account_tree</span>
                <span className="font-bold text-slate-900 text-sm">Merchant Score 与派单系统集成计算示范</span>
              </div>
              <span className="font-mono text-blue-700 font-semibold text-xs">
                示例: 正在为 SKU 【{simSKU}】寻找最优承接商户
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-1 font-bold text-slate-900">
                <span>派单流程:</span>
                <span className="text-blue-700">【1. 可承接判定 (当前状态)】</span> ➔
                <span className="text-indigo-700">【2. 派单综合得分 (报价 + 负载 + Merchant Score + 风险规则)】</span> ➔
                <span className="text-emerald-700">【3. 选定最高分商户】</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* 商户 A */}
                <div className="p-3 bg-white border border-rose-200 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">商户 A (M0192) - 核心商户</span>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold font-mono">派单得分: 0 (满载排除)</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600">
                    Merchant Score: <strong>{simMerchantAScore} 分 (超高)</strong> · 当前负载: <strong className="text-rose-700">{simMerchantAInflight}/20 (100% 满载)</strong>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    解释: 虽然商户 A 历史表现与分层分极高，但由于此刻已经满载，1.可承接判定直接拦截，系统不再继续派单。
                  </p>
                </div>

                {/* 商户 B */}
                <div className="p-3 bg-white border border-emerald-200 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">商户 B (M0088) - 成长商户</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold font-mono">派单得分: 94.2 (选中派单 ✅)</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600">
                    Merchant Score: <strong>{simMerchantBScore} 分</strong> · 当前负载: <strong className="text-emerald-700">{simMerchantBInflight}/20 (20% 空闲)</strong>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    解释: 校验通过可承接，结合空闲负载与优质 Merchant Score，派单得分最高，系统分配商户 B！
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 商户分析 & Merchant Score (3.1 & 3.2) */}
      {activeTab === 'analysis' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1">
            <button
              onClick={() => setAnalysisView('tiering')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                analysisView === 'tiering' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">stars</span>
              <span>Merchant Score & 5 级商户分层</span>
            </button>
            <button
              onClick={() => setAnalysisView('supply')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                analysisView === 'supply' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">emergency</span>
              <span>SKU 供给分析</span>
            </button>
            <button
              onClick={() => setAnalysisView('fulfillment')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                analysisView === 'fulfillment' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">fact_check</span>
              <span>履约链路分析</span>
            </button>
          </div>

          {/* 视角 A: Merchant Score 5 维模型与分层 (3.1 & 3.2) */}
          {analysisView === 'tiering' && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Merchant Score 综合评分与商户分层矩阵</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    计算公式: 报价分({weightQuote}%) + 承接分({weightCapacity}%) + 履约分({weightFulfillment}%) + 质量分({weightQuality}%) + 平台贡献分({weightContribution}%) ➔ Merchant Score
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowWeightModal(true)}
                    className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded font-semibold text-xs cursor-pointer"
                  >
                    修改 5 维权重配置
                  </button>
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                  >
                    <option value="ALL">全部商户分层</option>
                    <option value="CORE">核心商户</option>
                    <option value="GROWING">成长商户</option>
                    <option value="STANDARD">普通商户</option>
                    <option value="NEEDS_IMPROVE">待改善商户</option>
                    <option value="HIGH_RISK">风险商户</option>
                  </select>
                </div>
              </div>

              {/* 商户列表 Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-3 px-3">商户名称 / MID</th>
                      <th className="py-3 px-3">分层</th>
                      <th className="py-3 px-3 font-mono">Merchant Score</th>
                      <th className="py-3 px-2 font-mono">报价分 ({weightQuote}%)</th>
                      <th className="py-3 px-2 font-mono">承接分 ({weightCapacity}%)</th>
                      <th className="py-3 px-2 font-mono">履约分 ({weightFulfillment}%)</th>
                      <th className="py-3 px-2 font-mono">质量分 ({weightQuality}%)</th>
                      <th className="py-3 px-2 font-mono">贡献分 ({weightContribution}%)</th>
                      <th className="py-3 px-3 font-mono text-right">月 GMV</th>
                      <th className="py-3 px-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTiers.map((m) => {
                      const scoreData = computeMerchantScore(m);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{m.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{m.mid}</div>
                          </td>
                          <td className="py-3 px-3">{renderTierBadge(m.tier)}</td>
                          <td className="py-3 px-3 font-mono font-black text-blue-700 text-sm">
                            {scoreData.totalScore} 分
                          </td>
                          <td className="py-3 px-2 font-mono text-slate-800">{scoreData.quoteScore}</td>
                          <td className="py-3 px-2 font-mono text-slate-800">{scoreData.capacityScore}</td>
                          <td className="py-3 px-2 font-mono text-emerald-700 font-bold">{scoreData.fulfillmentScore}</td>
                          <td className="py-3 px-2 font-mono text-slate-800">{scoreData.qualityScore}</td>
                          <td className="py-3 px-2 font-mono text-purple-700 font-bold">{scoreData.contributionScore}</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900 text-right">
                            ${m.monthlyGmv.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setSelectedMerchant(m)}
                              className="px-2 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                            >
                              得分明细
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 视角 B: 供给分析 */}
          {analysisView === 'supply' && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">SKU 级商户供给分析</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-3 px-3">SKU 标的</th>
                      <th className="py-3 px-2 font-mono">可承接商户数</th>
                      <th className="py-3 px-2 font-mono">活跃报价商户数</th>
                      <th className="py-3 px-2 font-mono font-bold text-slate-900">月 GMV</th>
                      <th className="py-3 px-3">供给诊断</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSupply.map((s, idx) => (
                      <tr key={s.skuId || idx} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">{s.skuName}</td>
                        <td className="py-3 px-2 font-mono">{s.eligibleMerchantsCount} 家</td>
                        <td className="py-3 px-2 font-mono text-blue-700 font-bold">{s.activeQuotingMerchants} 家</td>
                        <td className="py-3 px-2 font-mono text-slate-900 font-bold">${s.monthlyGmv.toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {s.statusText}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 视角 C: 履约分析 */}
          {analysisView === 'fulfillment' && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">商户履约链路明细分析</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-3 px-3">商户</th>
                      <th className="py-3 px-2 font-mono">分发单数</th>
                      <th className="py-3 px-2 font-mono">接单率</th>
                      <th className="py-3 px-2 font-mono">完成率</th>
                      <th className="py-3 px-2 font-mono text-rose-600">超时率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFulfillment.map((f, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">{f.merchantName} ({f.merchantMid})</td>
                        <td className="py-3 px-2 font-mono">{f.dispatchedOrders} 单</td>
                        <td className="py-3 px-2 font-mono font-bold text-blue-700">{f.acceptRate}%</td>
                        <td className="py-3 px-2 font-mono font-bold text-emerald-700">{f.completeRate}%</td>
                        <td className="py-3 px-2 font-mono text-rose-600 font-semibold">{f.timeoutRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 商户问题 */}
      {activeTab === 'problems' && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">商户经营异常与跟进案卷</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-3">问题单号</th>
                  <th className="py-3 px-3">商户</th>
                  <th className="py-3 px-3">问题类型</th>
                  <th className="py-3 px-3">问题描述</th>
                  <th className="py-3 px-3">负责人</th>
                  <th className="py-3 px-3">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProblems.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{p.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{p.merchantName} ({p.merchantMid})</td>
                    <td className="py-3 px-3 font-bold text-indigo-700">{p.category}</td>
                    <td className="py-3 px-3 text-slate-700">{p.title}</td>
                    <td className="py-3 px-3 text-slate-600">{p.owner}</td>
                    <td className="py-3 px-3 font-bold text-amber-700">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Merchant Score 权重配置 Modal (3.1) */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">配置 Merchant Score 5 维权重</span>
              <button onClick={() => setShowWeightModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-500">调整各评估维度的百分比权重（5 项之和需为 100%）：</p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>1. 报价竞争力 (优势SKU占比、平均价差)</span>
                    <span className="font-mono text-blue-700">{weightQuote}%</span>
                  </div>
                  <input type="range" min={0} max={50} value={weightQuote} onChange={e => setWeightQuote(Number(e.target.value))} className="w-full cursor-pointer" />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>2. 承接能力 (SKU覆盖、有效承接)</span>
                    <span className="font-mono text-blue-700">{weightCapacity}%</span>
                  </div>
                  <input type="range" min={0} max={50} value={weightCapacity} onChange={e => setWeightCapacity(Number(e.target.value))} className="w-full cursor-pointer" />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>3. 履约质量 (接单率、完成率、超时率)</span>
                    <span className="font-mono text-blue-700">{weightFulfillment}%</span>
                  </div>
                  <input type="range" min={0} max={50} value={weightFulfillment} onChange={e => setWeightFulfillment(Number(e.target.value))} className="w-full cursor-pointer" />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>4. 交易质量 (售后率、争议率、转单率)</span>
                    <span className="font-mono text-blue-700">{weightQuality}%</span>
                  </div>
                  <input type="range" min={0} max={50} value={weightQuality} onChange={e => setWeightQuality(Number(e.target.value))} className="w-full cursor-pointer" />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>5. 平台贡献 (GMV、订单量、核心SKU贡献)</span>
                    <span className="font-mono text-blue-700">{weightContribution}%</span>
                  </div>
                  <input type="range" min={0} max={50} value={weightContribution} onChange={e => setWeightContribution(Number(e.target.value))} className="w-full cursor-pointer" />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 font-mono text-slate-700 flex justify-between font-bold">
                <span>当前权重合计:</span>
                <span className={weightQuote + weightCapacity + weightFulfillment + weightQuality + weightContribution === 100 ? 'text-emerald-700' : 'text-rose-700'}>
                  {weightQuote + weightCapacity + weightFulfillment + weightQuality + weightContribution}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowWeightModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer">
                取消
              </button>
              <button
                onClick={() => {
                  setShowWeightModal(false);
                  showToast('Merchant Score 评估权重已保存并重新计算全盘商户分！');
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
              >
                保存权重配置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 商户得分明细 Modal */}
      {selectedMerchant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{selectedMerchant.name} ({selectedMerchant.mid})</span>
                <span className="text-[11px] text-slate-500 font-mono">Merchant Score 5 维度打分明细</span>
              </div>
              <button onClick={() => setSelectedMerchant(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {(() => {
              const sd = computeMerchantScore(selectedMerchant);
              return (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-blue-900">Merchant Score 综合得分</span>
                    <span className="font-mono text-2xl font-black text-blue-700">{sd.totalScore} 分</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span>1. 报价竞争力得分:</span>
                      <span className="font-mono font-bold text-slate-900">{sd.quoteScore} / 100</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span>2. 承接能力得分:</span>
                      <span className="font-mono font-bold text-slate-900">{sd.capacityScore} / 100</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span>3. 履约质量得分:</span>
                      <span className="font-mono font-bold text-emerald-700">{sd.fulfillmentScore} / 100</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span>4. 交易质量得分:</span>
                      <span className="font-mono font-bold text-slate-900">{sd.qualityScore} / 100</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span>5. 平台贡献得分:</span>
                      <span className="font-mono font-bold text-purple-700">{sd.contributionScore} / 100</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setSelectedMerchant(null)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
