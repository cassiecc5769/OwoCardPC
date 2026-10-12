import React, { useState, useMemo } from 'react';
import { NavPath } from '../../types';

interface ChannelOpsViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
  showToast: (msg: string) => void;
}

export interface ChannelOverviewItem {
  id: string;
  channelName: string;
  team: string;
  sourceType: 'KOL合作' | '社群代理' | '信息流投放' | '自然SEO' | 'API分销';
  sourceUsers: number; // 来源用户 (访客/线索)
  registeredCount: number; // 注册人数
  firstOrderCount: number; // 首单人数
  firstOrderRate: number; // 首单率 (%)
  tradeUsersCount: number; // 交易人数
  gmvAmount: number; // GMV ($)
  repurchaseRate: number; // 复购率 (%)
  avgOrderValue: number; // 客单价 ($)
  tradeFrequency: number; // 月均交易频次
  afterSaleRate: number; // 售后争议率 (%)
  riskScore: number; // 风险率 (%)
  ltvEstimate: number; // 预估生命周期价值 LTV ($)
  status: '正常放量' | '重点扶持' | '质量预警' | '限流整改';
}

export interface ChannelIssueItem {
  id: string;
  channelId: string;
  channelName: string;
  issueType: '注册下降' | '首单率下降' | '质量下降' | '售后升高' | '风险升高';
  severity: '高危' | '中度' | '轻度';
  description: string;
  baseline: string;
  currentValue: string;
  changeRate: string;
  detectedAt: string;
  linkedPlanId?: string;
  status: '待跟进' | '已生成运营计划' | '已同步推广端' | '已自愈关闭';
}

const MOCK_CHANNELS: ChannelOverviewItem[] = [
  {
    id: 'CH-01',
    channelName: 'YouTube 游戏主播矩阵 (US)',
    team: '海外KOL一组 (Alex)',
    sourceType: 'KOL合作',
    sourceUsers: 14200,
    registeredCount: 3820,
    firstOrderCount: 2280,
    firstOrderRate: 59.7,
    tradeUsersCount: 2150,
    gmvAmount: 286500,
    repurchaseRate: 48.2,
    avgOrderValue: 95.5,
    tradeFrequency: 3.4,
    afterSaleRate: 0.8,
    riskScore: 0.5,
    ltvEstimate: 420.0,
    status: '重点扶持'
  },
  {
    id: 'CH-02',
    channelName: 'WhatsApp 尼日利亚社群代理',
    team: '非洲代理拓展部 (Chidi)',
    sourceType: '社群代理',
    sourceUsers: 28500,
    registeredCount: 6950,
    firstOrderCount: 3120,
    firstOrderRate: 44.9,
    tradeUsersCount: 2980,
    gmvAmount: 342000,
    repurchaseRate: 61.5,
    avgOrderValue: 68.0,
    tradeFrequency: 5.2,
    afterSaleRate: 2.9,
    riskScore: 3.8,
    ltvEstimate: 510.0,
    status: '质量预警' // 售后与风险偏高
  },
  {
    id: 'CH-03',
    channelName: 'Google Search Ads 品牌词',
    team: '搜索广告投放组 (Linda)',
    sourceType: '信息流投放',
    sourceUsers: 9800,
    registeredCount: 2940,
    firstOrderCount: 1850,
    firstOrderRate: 62.9,
    tradeUsersCount: 1790,
    gmvAmount: 215000,
    repurchaseRate: 39.4,
    avgOrderValue: 120.0,
    tradeFrequency: 2.1,
    afterSaleRate: 0.4,
    riskScore: 0.2,
    ltvEstimate: 360.0,
    status: '正常放量'
  },
  {
    id: 'CH-04',
    channelName: 'Telegram 东南亚卡商集市',
    team: '亚太商务二组 (Ken)',
    sourceType: '社群代理',
    sourceUsers: 16800,
    registeredCount: 2420,
    firstOrderCount: 890,
    firstOrderRate: 36.8, // 首单率持续下降
    tradeUsersCount: 820,
    gmvAmount: 94000,
    repurchaseRate: 28.5,
    avgOrderValue: 55.0,
    tradeFrequency: 1.8,
    afterSaleRate: 4.2,
    riskScore: 5.1,
    ltvEstimate: 180.0,
    status: '限流整改'
  },
  {
    id: 'CH-05',
    channelName: '有机自然流量 (SEO Organic)',
    team: '官网增长组 (Direct)',
    sourceType: '自然SEO',
    sourceUsers: 22000,
    registeredCount: 5100,
    firstOrderCount: 3450,
    firstOrderRate: 67.6,
    tradeUsersCount: 3310,
    gmvAmount: 412000,
    repurchaseRate: 54.0,
    avgOrderValue: 110.0,
    tradeFrequency: 3.8,
    afterSaleRate: 0.3,
    riskScore: 0.1,
    ltvEstimate: 580.0,
    status: '正常放量'
  }
];

const MOCK_ISSUES: ChannelIssueItem[] = [
  {
    id: 'ISSUE-CH-01',
    channelId: 'CH-04',
    channelName: 'Telegram 东南亚卡商集市',
    issueType: '首单率下降',
    severity: '高危',
    description: '近 7 日首单转化率从基线 52.0% 骤降至 36.8%，虚假引流号占比偏高',
    baseline: '52.0%',
    currentValue: '36.8%',
    changeRate: '-15.2 pp',
    detectedAt: '2026-10-05 09:30',
    status: '待跟进'
  },
  {
    id: 'ISSUE-CH-02',
    channelId: 'CH-02',
    channelName: 'WhatsApp 尼日利亚社群代理',
    issueType: '风险升高',
    severity: '高危',
    description: '该渠道新引入用户异地 IP 撞卡风险拦截率由 1.2% 飙升至 3.8%，涉案争议单达 24 笔',
    baseline: '1.2%',
    currentValue: '3.8%',
    changeRate: '+2.6 pp',
    detectedAt: '2026-10-04 18:20',
    linkedPlanId: 'OP-2026-Q4-03',
    status: '已生成运营计划'
  },
  {
    id: 'ISSUE-CH-03',
    channelId: 'CH-04',
    channelName: 'Telegram 东南亚卡商集市',
    issueType: '质量下降',
    severity: '中度',
    description: '客单价由 $92.0 下滑至 $55.0，大额卡占比不足 8%',
    baseline: '$92.0',
    currentValue: '$55.0',
    changeRate: '-40.2%',
    detectedAt: '2026-10-03 14:10',
    status: '已同步推广端'
  },
  {
    id: 'ISSUE-CH-04',
    channelId: 'CH-01',
    channelName: 'YouTube 游戏主播矩阵 (US)',
    issueType: '注册下降',
    severity: '轻度',
    description: '主播休假导致周访客转化注册数环比微跌 6.2%，但首单与客单质态优良',
    baseline: '4,100 人',
    currentValue: '3,820 人',
    changeRate: '-6.2%',
    detectedAt: '2026-10-02 11:00',
    status: '已自愈关闭'
  }
];

export const ChannelOpsView: React.FC<ChannelOpsViewProps> = ({ currentPath, onNavigate, showToast }) => {
  // 4 大视角切换: 'overview' (渠道总览) | 'quality' (渠道质量对比) | 'user_quality' (渠道用户质量) | 'issues' (渠道经营问题)
  const [subTab, setSubTab] = useState<'overview' | 'quality' | 'user_quality' | 'issues'>('overview');

  // 路由同步
  React.useEffect(() => {
    if (currentPath === 'channel-quality') setSubTab('quality');
    else if (currentPath === 'channel-user-quality') setSubTab('user_quality');
    else if (currentPath === 'channel-issues') setSubTab('issues');
    else if (currentPath === 'channel-overview' || currentPath === 'channel-operations' || currentPath === 'channel-management') setSubTab('overview');
  }, [currentPath]);

  const [channels] = useState<ChannelOverviewItem[]>(MOCK_CHANNELS);
  const [issues, setIssues] = useState<ChannelIssueItem[]>(MOCK_ISSUES);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤后的渠道列表
  const filteredChannels = useMemo(() => {
    return channels.filter(c => {
      if (filterType !== 'ALL' && c.sourceType !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.channelName.toLowerCase().includes(q) || c.team.toLowerCase().includes(q);
      }
      return true;
    });
  }, [channels, filterType, searchQuery]);

  // 处理经营问题动作
  const handleCreatePlanFromIssue = (issue: ChannelIssueItem) => {
    setIssues(prev =>
      prev.map(i => (i.id === issue.id ? { ...i, status: '已生成运营计划', linkedPlanId: `OP-PLAN-${Date.now().toString().slice(-4)}` } : i))
    );
    showToast(`已针对经营问题【${issue.issueType}】生成专项运营计划并立项跟踪！`);
  };

  const handleSyncToPromotion = (issue: ChannelIssueItem) => {
    setIssues(prev =>
      prev.map(i => (i.id === issue.id ? { ...i, status: '已同步推广端' } : i))
    );
    showToast(`已将问题【${issue.issueType}】同步至渠道推广系统，指令推广团队调整投放素材与激励策略！`);
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 顶部标准子模块导航 Tab 栏 */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: '渠道总览', icon: 'hub' },
          { id: 'quality', label: '渠道质量比较', icon: 'compare_arrows' },
          { id: 'user_quality', label: '渠道用户质量', icon: 'person_search' },
          { id: 'issues', label: `渠道经营问题 (${issues.filter(i => i.status === '待跟进').length})`, icon: 'warning', badge: issues.filter(i => i.status === '待跟进').length }
        ].map(tab => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                const next = tab.id as 'overview' | 'quality' | 'user_quality' | 'issues';
                setSubTab(next);
                if (onNavigate) {
                  const pathMap = {
                    overview: 'channel-overview',
                    quality: 'channel-quality',
                    user_quality: 'channel-user-quality',
                    issues: 'channel-issues'
                  };
                  onNavigate(pathMap[next] as NavPath);
                }
              }}
              className={`px-4 py-3 font-semibold rounded-t-lg transition-colors shrink-0 flex items-center gap-1.5 relative cursor-pointer ${
                isActive
                  ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping ml-0.5"></span>
              ) : null}
            </button>
          );
        })}
      </section>

      {/* 职责定位说明 Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
          <span className="material-symbols-outlined text-[22px]">hub</span>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-slate-900 text-sm">渠道运营（回答：用户从哪里来，这些来源最终质量怎么样？）</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
              经营动作中心
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            贯穿渠道总览、横向质量对比、用户全生命周期质量与经营问题识别。<strong className="text-slate-700">平台在此只定义经营问题，具体触达推广执行由渠道推广系统承接。</strong>
          </p>
        </div>
      </div>

      {/* 核心指标透视栏 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[10px] block font-sans">全渠道来源用户数 (Leads)</span>
          <span className="text-2xl font-black text-slate-900 block mt-0.5">
            {channels.reduce((sum, c) => sum + c.sourceUsers, 0).toLocaleString()}
          </span>
          <span className="text-emerald-700 text-[10px] font-sans font-semibold">注册转化率 23.4%</span>
        </div>
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[10px] block font-sans">全渠道累计 GMV</span>
          <span className="text-2xl font-black text-blue-700 block mt-0.5">
            ${(channels.reduce((sum, c) => sum + c.gmvAmount, 0) / 10000).toFixed(1)} 万
          </span>
          <span className="text-slate-500 text-[10px] font-sans">平均客单价 $91.8</span>
        </div>
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[10px] block font-sans">大盘平均首单转化率</span>
          <span className="text-2xl font-black text-emerald-600 block mt-0.5">54.4%</span>
          <span className="text-slate-500 text-[10px] font-sans">最高达 67.6% (SEO自然)</span>
        </div>
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[10px] block font-sans">系统检出渠道经营问题</span>
          <span className="text-2xl font-black text-rose-600 block mt-0.5">{issues.length} 项</span>
          <span className="text-rose-600 text-[10px] font-sans font-semibold">2 项高危待立项解决</span>
        </div>
      </div>

      {/* 视图 1: 渠道总览 (来源用户｜注册｜首单｜首单率｜交易人数｜GMV｜复购率) */}
      {subTab === 'overview' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-blue-600">table_chart</span>
                <span>渠道总览（漏斗指标：来源 ➔ 注册 ➔ 首单 ➔ 交易 ➔ 复购）</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
              >
                <option value="ALL">全部来源类型</option>
                <option value="KOL合作">KOL合作</option>
                <option value="社群代理">社群代理</option>
                <option value="信息流投放">信息流投放</option>
                <option value="自然SEO">自然SEO</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50/90 font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 h-9">
                  <th className="py-2.5 px-3">渠道名称 & 所属团队</th>
                  <th className="py-2.5 px-2 font-mono">1. 来源用户</th>
                  <th className="py-2.5 px-2 font-mono">2. 注册数</th>
                  <th className="py-2.5 px-2 font-mono">3. 首单人数</th>
                  <th className="py-2.5 px-2 font-mono">4. 首单率</th>
                  <th className="py-2.5 px-2 font-mono">5. 交易人数</th>
                  <th className="py-2.5 px-2 font-mono">6. 累计 GMV</th>
                  <th className="py-2.5 px-2 font-mono">7. 复购率</th>
                  <th className="py-2.5 px-2 text-center">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
                {filteredChannels.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-sans">
                      <strong className="text-slate-900 block">{item.channelName}</strong>
                      <span className="text-[10px] text-slate-400">{item.team} · {item.sourceType}</span>
                    </td>
                    <td className="py-2.5 px-2 text-slate-600">{item.sourceUsers.toLocaleString()}</td>
                    <td className="py-2.5 px-2 text-slate-800 font-semibold">{item.registeredCount.toLocaleString()}</td>
                    <td className="py-2.5 px-2 text-blue-700 font-bold">{item.firstOrderCount.toLocaleString()}</td>
                    <td className="py-2.5 px-2 font-bold text-emerald-600">{item.firstOrderRate.toFixed(1)}%</td>
                    <td className="py-2.5 px-2 text-slate-800">{item.tradeUsersCount.toLocaleString()}</td>
                    <td className="py-2.5 px-2 font-black text-indigo-700">${(item.gmvAmount / 1000).toFixed(1)}k</td>
                    <td className="py-2.5 px-2 font-bold text-blue-600">{item.repurchaseRate.toFixed(1)}%</td>
                    <td className="py-2.5 px-2 text-center font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          item.status === '重点扶持'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : item.status === '正常放量'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === '质量预警'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 视图 2: 渠道质量比较 (比较：渠道 / 推广团队 / 来源类型) */}
      {subTab === 'quality' && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-indigo-600">compare</span>
              <span>渠道质量比较矩阵（渠道 / 推广团队 / 来源类型 横向 PK）</span>
            </h3>
            <span className="text-slate-400 text-xs">按综合产出 ROI 与获客首单质量加权评级</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-xs block">按来源类型比较:</span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                  <span className="font-sans">自然SEO (直接访客)</span>
                  <span className="font-bold text-emerald-600">首单率 67.6% · LTV $580</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                  <span className="font-sans">信息流搜索广告</span>
                  <span className="font-bold text-blue-600">首单率 62.9% · LTV $360</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                  <span className="font-sans">KOL 主播矩阵</span>
                  <span className="font-bold text-indigo-600">首单率 59.7% · LTV $420</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                  <span className="font-sans">社群带单代理</span>
                  <span className="font-bold text-amber-600">首单率 41.2% · 风险 3.8%</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-xs block">按推广团队贡献比较:</span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                  <span className="font-sans">官网增长组 (Direct)</span>
                  <span className="font-bold text-indigo-700">GMV $41.2万 (贡献 30%)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                  <span className="font-sans">非洲代理拓展部</span>
                  <span className="font-bold text-blue-700">GMV $34.2万 (贡献 25%)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                  <span className="font-sans">海外KOL一组</span>
                  <span className="font-bold text-purple-700">GMV $28.6万 (贡献 21%)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                  <span className="font-sans">搜索广告投放组</span>
                  <span className="font-bold text-slate-700">GMV $21.5万 (贡献 16%)</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
              <span className="font-bold text-indigo-950 text-xs block">渠道调优运营策略建议:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                <li>加大 SEO 品牌词与英文卡密长尾词投入，自然用户质量最高。</li>
                <li>针对社群代理渠道引入出卡前验证门槛，压降 3.8% 异地 IP 风险率。</li>
                <li>KOL 渠道复购粘性好，建议配套专属首单加价券促进长线留存。</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 视图 3: 渠道用户质量 (客单价｜交易频次｜复购｜售后｜风险｜生命周期价值 LTV) */}
      {subTab === 'user_quality' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">verified_user</span>
              <span>渠道用户质量画像（重点：客单价 ｜ 交易频次 ｜ 复购 ｜ 售后 ｜ 风险 ｜ LTV）</span>
            </h3>
            <span className="text-slate-500 font-mono text-xs">评估不同来源引入用户的含金量</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 h-9 font-sans">
                  <th className="py-2.5 px-3">渠道名称</th>
                  <th className="py-2.5 px-2 font-mono">客单价 (AOV)</th>
                  <th className="py-2.5 px-2 font-mono">月均交易频次</th>
                  <th className="py-2.5 px-2 font-mono">30日复购率</th>
                  <th className="py-2.5 px-2 font-mono">售后争议率</th>
                  <th className="py-2.5 px-2 font-mono">风控拦截率</th>
                  <th className="py-2.5 px-2 font-mono">预估生命周期价值 (LTV)</th>
                  <th className="py-2.5 px-3 text-right">健康评级</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
                {channels.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{item.channelName}</td>
                    <td className="py-2.5 px-2 font-bold text-slate-900">${item.avgOrderValue.toFixed(1)}</td>
                    <td className="py-2.5 px-2 text-slate-700">{item.tradeFrequency} 次/月</td>
                    <td className="py-2.5 px-2 text-blue-700 font-bold">{item.repurchaseRate.toFixed(1)}%</td>
                    <td className="py-2.5 px-2">
                      <span className={item.afterSaleRate > 2.0 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {item.afterSaleRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={item.riskScore > 3.0 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {item.riskScore.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-black text-emerald-600">${item.ltvEstimate.toFixed(0)}</td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.ltvEstimate >= 400
                            ? 'bg-emerald-50 text-emerald-800'
                            : item.ltvEstimate >= 300
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {item.ltvEstimate >= 400 ? '优质 (Grade A)' : item.ltvEstimate >= 300 ? '良好 (Grade B)' : '需改善 (Grade C)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 视图 4: 渠道经营问题 (系统自动识别：注册下降、首单率下降、质量下降、售后升高、风险升高) */}
      {subTab === 'issues' && (
        <div className="bg-white rounded-xl border border-rose-200 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-rose-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-rose-600">report_problem</span>
                <span>渠道经营问题自动识别池（这里只定义经营问题，推广执行由渠道推广系统承接）</span>
              </h3>
              <p className="text-slate-400 text-xs">
                覆盖：注册下降、首单率下降、质量下降、售后升高、风险升高 5 大维度异常诊断
              </p>
            </div>
            <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 font-bold text-xs">
              检出 {issues.length} 项经营问题
            </span>
          </div>

          <div className="space-y-2.5">
            {issues.map(issue => (
              <div
                key={issue.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                        issue.severity === '高危'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{issue.channelName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                      {issue.issueType}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">{issue.detectedAt}</span>
                  </div>

                  <p className="text-slate-600 text-xs">{issue.description}</p>

                  <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px] pt-0.5">
                    <span>基线: <strong className="text-slate-800">{issue.baseline}</strong></span>
                    <span>当前值: <strong className="text-rose-600">{issue.currentValue}</strong></span>
                    <span>变化幅度: <strong className="text-rose-600 font-bold">{issue.changeRate}</strong></span>
                    {issue.linkedPlanId && (
                      <span className="text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                        关联计划: {issue.linkedPlanId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {issue.status === '待跟进' ? (
                    <>
                      <button
                        onClick={() => handleCreatePlanFromIssue(issue)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs cursor-pointer"
                      >
                        立项运营计划
                      </button>
                      <button
                        onClick={() => handleSyncToPromotion(issue)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs border border-slate-200 cursor-pointer"
                      >
                        同步推广端
                      </button>
                    </>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 font-semibold text-xs">
                      {issue.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
