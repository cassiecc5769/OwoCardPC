import React, { useState } from 'react';
import { NavPath } from '../../types';
import {
  MemberLevelConfigItem,
  MemberVsNonMemberComparison,
  MemberLifecycleStageItem
} from './memberOpsTypes';
import {
  INITIAL_MEMBER_LEVELS,
  INITIAL_MEMBER_VS_NON_MEMBER,
  INITIAL_MEMBER_LIFECYCLES
} from './mockMemberOpsData';

interface MemberOpsViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
  showToast: (msg: string) => void;
}

type MainTab = 'overview' | 'levels' | 'lifecycle';

export const MemberOpsView: React.FC<MemberOpsViewProps> = ({ currentPath, onNavigate, showToast }) => {
  // 3 大主 Tab: 会员总览 / 会员等级 / 会员生命周期
  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    if (currentPath === 'member-levels') return 'levels';
    if (currentPath === 'member-lifecycle') return 'lifecycle';
    return 'overview';
  });

  // 路由同步
  React.useEffect(() => {
    if (currentPath === 'member-levels') {
      setActiveTab('levels');
    } else if (currentPath === 'member-lifecycle') {
      setActiveTab('lifecycle');
    } else if (currentPath === 'member-growth' || currentPath === 'member-operations') {
      setActiveTab('overview');
    }
  }, [currentPath]);

  // 数据集状态
  const [levelList, setLevelList] = useState<MemberLevelConfigItem[]>(INITIAL_MEMBER_LEVELS);
  const [comparisonList] = useState<MemberVsNonMemberComparison[]>(INITIAL_MEMBER_VS_NON_MEMBER);
  const [lifecycleList] = useState<MemberLifecycleStageItem[]>(INITIAL_MEMBER_LIFECYCLES);

  // 编辑等级配置弹窗
  const [editingLevel, setEditingLevel] = useState<MemberLevelConfigItem | null>(null);
  // 查看生命周期人群详情弹窗
  const [selectedLifecycle, setSelectedLifecycle] = useState<MemberLifecycleStageItem | null>(null);

  // 核心大盘汇总计算
  const totalMemberCount = levelList.reduce((sum, l) => sum + (l.levelCode !== 'V0' ? l.memberCount : 0), 0);
  const highValueMemberCount = levelList.filter((l) => l.levelCode === 'V4' || l.levelCode === 'BLACK_GOLD').reduce((s, l) => s + l.memberCount, 0);

  return (
    <div className="space-y-4">
      {/* 顶部 Header 说明 Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-xl">card_membership</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">会员运营</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                高价值用户留存与贡献中枢
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              围绕高价值用户的长期留存、复购和贡献进行经营。会员不是单纯的“等级+权益”，核心目标是：
              <strong>让高价值用户留得更久、交易更多、贡献更高</strong>。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => {
              setActiveTab('lifecycle');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">alarm</span>
            活跃下降防流失 (1,420人)
          </button>
          <button
            onClick={() => onNavigate && onNavigate('growth-operations')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">trending_up</span>
            联动增长策略
          </button>
        </div>
      </div>

      {/* 3 大标准 Tab 导航栏 (统一标准风格) */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          {
            id: 'overview',
            label: '会员总览 (Overview)',
            icon: 'dashboard'
          },
          {
            id: 'levels',
            label: '会员等级 (Levels & Privileges)',
            icon: 'military_tech',
            badge: `${levelList.length} 阶梯`,
            badgeClass: 'bg-blue-100 text-blue-800'
          },
          {
            id: 'lifecycle',
            label: '会员生命周期 (Lifecycle)',
            icon: 'donut_large',
            badge: '6 阶段',
            badgeClass: 'bg-purple-100 text-purple-800'
          }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3.5 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
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
      </section>

      {/* ======================================================================= */}
      {/* TAB 1: 会员总览 (.2 核心指标 + 会员 vs 非会员 对比矩阵)        */}
      {/* ======================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* 核心指标看板 (10 大指标全量覆盖) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* 1. 会员总数 */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[10px] block">有效会员总数</span>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {totalMemberCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">占全盘出卡用户 80.9%</div>
            </div>

            {/* 2. 高价值核心会员 */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[10px] block">高价值会员 (V4/黑金)</span>
              <div className="text-2xl font-black text-purple-700 mt-1 font-mono">
                {highValueMemberCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-purple-600 font-semibold mt-0.5">贡献 55% 核心流水</div>
            </div>

            {/* 3. 新增 / 升降级人数 */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[10px] block">本月新增 / 升级 / 降级</span>
              <div className="text-lg font-black text-slate-900 mt-1 font-mono flex items-baseline gap-1">
                <span className="text-emerald-600">+{2850}</span>
                <span className="text-slate-300">/</span>
                <span className="text-blue-600">+{1420}</span>
                <span className="text-slate-300">/</span>
                <span className="text-rose-600 font-normal text-sm">-180</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">净跃迁升级 +1,240 人</div>
            </div>

            {/* 4. 会员 GMV 与贡献占比 */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[10px] block">会员 GMV / 贡献占比</span>
              <div className="text-2xl font-black text-indigo-700 mt-1 font-mono">$2.48M</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 font-mono">全盘贡献 68.5%</div>
            </div>

            {/* 5. 会员复购率与客单价 */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[10px] block">会员复购率 / 客单价</span>
              <div className="text-xl font-black text-slate-900 mt-1 font-mono">
                72.4% <span className="text-slate-400 text-sm font-normal">/ $215.0</span>
              </div>
              <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">显著领跑非会员</div>
            </div>
          </div>

          {/* 各等级会员金字塔分布 */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600 text-base">stairs</span>
                会员等级规模与 GMV 产出金字塔
              </span>
              <span className="text-xs text-slate-400">共 {levelList.length} 个层级梯度</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
              {levelList.map((lvl) => (
                <div
                  key={lvl.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${lvl.badgeColor}`}>
                      {lvl.levelName}
                    </span>
                    <div className="text-lg font-black text-slate-900 mt-2">
                      {lvl.memberCount.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">人</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-sans">占比 {lvl.percentage}%</div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-indigo-700 font-bold">
                    月均 ${lvl.avgMonthlyGmv.toFixed(0)} · {lvl.avgOrderCount}单
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 重点对比：会员 vs 非会员 经营价值核算 (.2 核心要求) */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">balance</span>
                <h3 className="font-bold text-slate-900 text-sm">
                  会员 vs 非会员 经营价值对比矩阵 (判断会员体系是否真正产出经营价值)
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                会员体系高价值增益显著
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-3">经营价值衡量维度</th>
                    <th className="py-3 px-3 font-mono text-indigo-700">会员群体表现 (Member)</th>
                    <th className="py-3 px-3 font-mono text-slate-500">非会员表现 (Non-Member)</th>
                    <th className="py-3 px-3 font-mono text-emerald-700 font-bold">差距 / 提升倍数</th>
                    <th className="py-3 px-3">经营价值诊断结论</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonList.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-bold text-slate-900">{comp.dimension}</td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700 text-sm">
                        {comp.memberValue}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{comp.nonMemberValue}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                        {comp.ratioOrDiff}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{comp.statusText}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 2: 会员等级 (.3 等级与经营规则配置)                        */}
      {/* ======================================================================= */}
      {activeTab === 'levels' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-indigo-600 text-base">military_tech</span>
                  <span>会员等级与经营业务规则矩阵 (.3)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  管理会员等级以及对应的升级条件、保级条件、降级条件、报价加成溢价与专属权益，底层公共配置遵循平台配置体系
                </p>
              </div>

              <button
                onClick={() => {
                  showToast('会员等级规则已更新并下发至全平台定价与撮合引擎生效！');
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">save</span>
                保存全套等级规则
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-3">等级名称 / Code</th>
                    <th className="py-3 px-3">升级条件 (GMV/次数)</th>
                    <th className="py-3 px-3">保级条件 (周期交易)</th>
                    <th className="py-3 px-3">降级条件 (不活跃)</th>
                    <th className="py-3 px-2 font-mono text-emerald-700">报价溢价加成</th>
                    <th className="py-3 px-3">核心业务权益</th>
                    <th className="py-3 px-2 font-mono text-center">有效期</th>
                    <th className="py-3 px-2 font-mono">现有人数</th>
                    <th className="py-3 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {levelList.map((lvl) => (
                    <tr key={lvl.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${lvl.badgeColor}`}>
                          {lvl.levelName}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{lvl.levelCode}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-medium max-w-xs">{lvl.upgradeCondition}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs">{lvl.maintainCondition}</td>
                      <td className="py-3 px-3 text-rose-700 text-[11px] max-w-xs">{lvl.downgradeCondition}</td>
                      <td className="py-3 px-2 font-mono font-bold text-emerald-700 text-sm">
                        {lvl.quoteBonusRate > 0 ? `+${lvl.quoteBonusRate}%` : '无加成'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {lvl.privileges.map((p, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px]"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-2 font-mono text-center text-slate-600">
                        {lvl.validityPeriodMonths >= 999 ? '永久' : `${lvl.validityPeriodMonths}个月`}
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-slate-900">
                        {lvl.memberCount.toLocaleString()} 人
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setEditingLevel(lvl)}
                          className="px-2 py-1 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                        >
                          调整规则
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 3: 会员生命周期 (.4 六大阶段与营销触达边界)                */}
      {/* ======================================================================= */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-4">
          {/* 营销触达边界说明卡片 */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-base">donut_large</span>
                <span className="font-bold text-sm">
                  会员全生命周期精细化经营与触达边界 (.4)
                </span>
              </div>
              <span className="text-[11px] text-slate-300 font-mono">
                形成增长策略 ➔ 渠道推广系统执行，平台不建重复营销系统
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-center text-[11px] font-mono">
              <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                <span className="text-emerald-300 block font-sans font-bold">1. 新会员</span>
                <span className="text-white mt-0.5 block font-sans">首单后30天 ➔ 促二单</span>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
                <span className="text-blue-300 block font-sans font-bold">2. 成长会员</span>
                <span className="text-white mt-0.5 block font-sans">连续交易 ➔ 提升频次</span>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-400/30">
                <span className="text-purple-300 block font-sans font-bold">3. 高价值会员</span>
                <span className="text-white mt-0.5 block font-sans">高GMV/高频 ➔ 尊享留存</span>
              </div>
              <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-400/30">
                <span className="text-amber-300 block font-sans font-bold">4. 活跃下降</span>
                <span className="text-white mt-0.5 block font-sans">频次下滑 ➔ 防流失干预</span>
              </div>
              <div className="p-2 bg-rose-500/20 rounded-lg border border-rose-400/30">
                <span className="text-rose-300 block font-sans font-bold">5. 沉默会员</span>
                <span className="text-white mt-0.5 block font-sans">45~90天未动 ➔ 定向唤醒</span>
              </div>
              <div className="p-2 bg-slate-700/50 rounded-lg border border-slate-600">
                <span className="text-slate-300 block font-sans font-bold">6. 流失会员</span>
                <span className="text-white mt-0.5 block font-sans">&gt;90天无交易 ➔ 大促召回</span>
              </div>
            </div>
          </div>

          {/* 六大生命周期阶段矩阵卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lifecycleList.map((stage) => (
              <div
                key={stage.stageKey}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3 hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${stage.tagColor}`}>
                      {stage.stageName}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {stage.userCount.toLocaleString()} 人 ({stage.userPercentage}%)
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <strong className="text-slate-900 font-sans">规则口径：</strong> {stage.definitionRule}
                    </div>
                    <div className="mt-1 text-indigo-700 font-semibold font-sans">
                      🎯 主要经营目标：{stage.primaryGoal}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 bg-slate-50 rounded">
                      <span className="text-slate-400 text-[10px] block font-sans">人均月 GMV</span>
                      <span className="font-bold text-slate-900">${stage.avgMonthlyGmv.toFixed(0)}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <span className="text-slate-400 text-[10px] block font-sans">平均出卡频次</span>
                      <span className="font-bold text-slate-900">{stage.avgOrderFreq}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600">
                    <strong className="text-slate-800">💡 经营动作建议：</strong> {stage.suggestedAction}
                  </div>
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-100">
                    <strong>🎁 适配权益礼包：</strong> {stage.incentivePackage}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">Stage: {stage.stageKey}</span>
                  <button
                    onClick={() => {
                      setSelectedLifecycle(stage);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">rocket_launch</span>
                    <span>生成触达策略</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 弹窗 1: 会员等级规则修改弹窗                                            */}
      {/* ======================================================================= */}
      {editingLevel && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">military_tech</span>
                <h3 className="text-base font-bold text-slate-900">配置会员等级业务规则</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${editingLevel.badgeColor}`}>
                  {editingLevel.levelName}
                </span>
              </div>
              <button
                onClick={() => setEditingLevel(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">升级条件 (GMV 或交易次数)</label>
                <input
                  type="text"
                  value={editingLevel.upgradeCondition}
                  onChange={(e) => setEditingLevel({ ...editingLevel, upgradeCondition: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">保级条件 (周期内需达成的出卡指标)</label>
                <input
                  type="text"
                  value={editingLevel.maintainCondition}
                  onChange={(e) => setEditingLevel({ ...editingLevel, maintainCondition: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">降级规则 (未达标降级处理逻辑)</label>
                <input
                  type="text"
                  value={editingLevel.downgradeCondition}
                  onChange={(e) => setEditingLevel({ ...editingLevel, downgradeCondition: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">全卡种报价溢价加成 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingLevel.quoteBonusRate}
                    onChange={(e) => setEditingLevel({ ...editingLevel, quoteBonusRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">等级有效期 (月)</label>
                  <input
                    type="number"
                    value={editingLevel.validityPeriodMonths}
                    onChange={(e) => setEditingLevel({ ...editingLevel, validityPeriodMonths: parseInt(e.target.value) || 12 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingLevel(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setLevelList((prev) =>
                    prev.map((l) => (l.id === editingLevel.id ? editingLevel : l))
                  );
                  setEditingLevel(null);
                  showToast(`已更新等级【${editingLevel.levelName}】的经营规则与报价加成！`);
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                保存等级规则
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 弹窗 2: 会员生命周期生成增长策略弹窗                                    */}
      {/* ======================================================================= */}
      {selectedLifecycle && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">hub</span>
                <h3 className="text-base font-bold text-slate-900">将生命周期人群转化为增长策略并推送</h3>
              </div>
              <button
                onClick={() => setSelectedLifecycle(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <span className="font-bold text-indigo-950 block text-sm">{selectedLifecycle.stageName}</span>
                <div className="text-indigo-800 mt-1">覆盖用户：{selectedLifecycle.userCount.toLocaleString()} 人 ({selectedLifecycle.userPercentage}%)</div>
                <div className="text-indigo-900 mt-0.5">目标：{selectedLifecycle.primaryGoal}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800">跨系统流转机制：</div>
                <p className="text-slate-600 leading-relaxed">
                  平台会员运营制定专属策略与权益包（{selectedLifecycle.incentivePackage}）后，一键推送到【渠道推广系统】执行外部触达（Push/短信/推广员/专属客服）；
                  出卡成交后结果自动回流，平台验证留存与复购达标情况。
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedLifecycle(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setSelectedLifecycle(null);
                  if (onNavigate) onNavigate('growth-strategy');
                  showToast(`✅ 已为【${selectedLifecycle.stageName}】生成专属增长策略并同步至【渠道推广系统】！`);
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">send</span>
                <span>确认并同步渠道推广系统</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
