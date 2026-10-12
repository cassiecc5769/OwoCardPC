import React, { useState } from 'react';
import { NavPath } from '../../types';

interface ActivityOpsViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
  showToast: (msg: string) => void;
}

export interface ActivityCampaignItem {
  id: string;
  code: string;
  name: string;
  status: '草稿' | '已发布进行中' | '已结束' | '暂停中';
  // 8 步标准流程字段:
  // 1. 创建活动 -> 2. 选择目标人群 -> 3. 配置参与条件 -> 4. 选择权益 -> 5. 发布 -> 6. 用户参与 -> 7. 交易回流 -> 8. 计算效果
  targetCohort: string; // 目标人群 (直接引用分群)
  conditionRule: string; // 参与条件 (例如 提交 Apple/Steam 面额 >= $100)
  benefitName: string; // 选择权益 (例如 +1.5% 溢价加息卡券)
  period: string;
  // 活动效果 (至少看：参与人数｜新增｜首单｜复购｜GMV｜成本｜转化率)
  performance: {
    participantsCount: number; // 参与人数
    newUsersCount: number; // 新增用户数
    firstOrdersCount: number; // 首单数
    repurchaseCount: number; // 复购数
    totalGmvAmount: number; // GMV ($)
    costAmount: number; // 权益及营销成本 ($)
    conversionRate: number; // 转化率 (%)
    roi: number; // 投入产出比
  };
}

const MOCK_ACTIVITIES: ActivityCampaignItem[] = [
  {
    id: 'ACT-01',
    code: 'ACT-202610-001',
    name: '十月金秋出卡狂欢节 · 新老用户加息盛典',
    status: '已发布进行中',
    targetCohort: '全平台活跃出卡人 + 注册 7 天未首单新人',
    conditionRule: '单笔提交卡单面额 >= $50.00，支持任意卡种',
    benefitName: '阶梯溢价券（+$2.00 现金补贴 / +1.0% 折率券）',
    period: '2026-10-01 ~ 2026-10-15',
    performance: {
      participantsCount: 8450,
      newUsersCount: 1820,
      firstOrdersCount: 1450,
      repurchaseCount: 3890,
      totalGmvAmount: 642000,
      costAmount: 8900,
      conversionRate: 63.2,
      roi: 72.1
    }
  },
  {
    id: 'ACT-02',
    code: 'ACT-202610-002',
    name: 'Apple US 专属大额实体卡定向保价撮合专场',
    status: '已发布进行中',
    targetCohort: '累计 GMV > $5000 高价值核心出卡人',
    conditionRule: '仅限 Apple US $200/$500 实体卡',
    benefitName: '93.5% 高折率兜底锁定 + VIP 免预检绿色通道',
    period: '2026-10-03 ~ 2026-10-10',
    performance: {
      participantsCount: 280,
      newUsersCount: 15,
      firstOrdersCount: 28,
      repurchaseCount: 420,
      totalGmvAmount: 385000,
      costAmount: 3200,
      conversionRate: 88.5,
      roi: 120.3
    }
  },
  {
    id: 'ACT-03',
    code: 'ACT-202609-009',
    name: '中秋老友回归召回计划',
    status: '已结束',
    targetCohort: '60 天完全无交互沉默出卡人',
    conditionRule: '重新登录并绑定手机号，完成 1 笔出卡',
    benefitName: '$5.00 无门槛立减现金红包',
    period: '2026-09-15 ~ 2026-09-30',
    performance: {
      participantsCount: 1200,
      newUsersCount: 0,
      firstOrdersCount: 0,
      repurchaseCount: 680,
      totalGmvAmount: 142000,
      costAmount: 4500,
      conversionRate: 56.6,
      roi: 31.5
    }
  }
];

export const ActivityOpsView: React.FC<ActivityOpsViewProps> = ({ currentPath, onNavigate, showToast }) => {
  // 3 大子 Tab: 'management' (活动管理) | 'config' (活动配置流程) | 'performance' (活动效果)
  const [subTab, setSubTab] = useState<'management' | 'config' | 'performance'>('management');

  // 路由同步
  React.useEffect(() => {
    if (currentPath === 'activity-config') setSubTab('config');
    else if (currentPath === 'activity-performance') setSubTab('performance');
    else if (currentPath === 'activity-management' || currentPath === 'activity-operations') setSubTab('management');
  }, [currentPath]);

  const [activities, setActivities] = useState<ActivityCampaignItem[]>(MOCK_ACTIVITIES);
  const [selectedAct, setSelectedAct] = useState<ActivityCampaignItem>(MOCK_ACTIVITIES[0]);

  // 新建活动配置表单状态
  const [newName, setNewName] = useState('');
  const [newCohort, setNewCohort] = useState('注册 7 天未首单新人');
  const [newCondition, setNewCondition] = useState('单笔提交面额 >= $50.00');
  const [newBenefit, setNewBenefit] = useState('+1.5% 专属溢价券');

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('请输入活动名称！');
      return;
    }
    const item: ActivityCampaignItem = {
      id: `ACT-0${activities.length + 1}`,
      code: `ACT-202610-00${activities.length + 1}`,
      name: newName,
      status: '已发布进行中',
      targetCohort: newCohort,
      conditionRule: newCondition,
      benefitName: newBenefit,
      period: '2026-10-06 ~ 2026-10-25',
      performance: {
        participantsCount: 0,
        newUsersCount: 0,
        firstOrdersCount: 0,
        repurchaseCount: 0,
        totalGmvAmount: 0,
        costAmount: 0,
        conversionRate: 0,
        roi: 0
      }
    };
    setActivities([item, ...activities]);
    setSelectedAct(item);
    setNewName('');
    setSubTab('management');
    showToast(`✅ 活动【${item.name}】已遵循 8 步标准流发布成功！用户交易行为已启动实时效果追踪。`);
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 顶部标准子模块导航 Tab 栏 */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'management', label: `活动管理 (${activities.length})`, icon: 'celebration' },
          { id: 'config', label: '活动配置', icon: 'tune' },
          { id: 'performance', label: '活动效果看板', icon: 'analytics' }
        ].map(tab => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                const next = tab.id as 'management' | 'config' | 'performance';
                setSubTab(next);
                if (onNavigate) {
                  const pathMap = {
                    management: 'activity-management',
                    config: 'activity-config',
                    performance: 'activity-performance'
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
            </button>
          );
        })}
      </section>

      {/* 职责说明 Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
          <span className="material-symbols-outlined text-[22px]">celebration</span>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-slate-900 text-sm">活动运营（活动管理 ｜ 活动配置 ｜ 活动效果）</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
              8 步闭环标准流程
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            流程：创建活动 ➔ 选目标人群 ➔ 配置参与条件 ➔ 选权益 ➔ 发布 ➔ 用户参与 ➔ 交易回流 ➔ 计算活动效果（参与人数/新增/首单/复购/GMV/成本/转化率）。
          </p>
        </div>
      </div>

      {/* 视图 1: 活动管理 */}
      {subTab === 'management' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-amber-600">view_list</span>
              <span>全平台活动大盘列表</span>
            </h3>
            <button
              onClick={() => setSubTab('config')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs shadow-xs cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>新建活动</span>
            </button>
          </div>

          <div className="space-y-3">
            {activities.map(act => (
              <div
                key={act.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                        act.status === '已发布进行中'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {act.status}
                    </span>
                    <strong className="text-slate-900 text-xs">{act.name}</strong>
                    <span className="font-mono text-slate-400 text-[10px]">{act.code}</span>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-0.5 font-sans pt-1">
                    <div>🎯 目标人群: <strong className="text-slate-800">{act.targetCohort}</strong></div>
                    <div>📋 参与条件: <strong className="text-slate-800">{act.conditionRule}</strong></div>
                    <div>🎁 配套权益: <strong className="text-indigo-700">{act.benefitName}</strong></div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">参与人数:</span>
                    <strong className="text-slate-900">{act.performance.participantsCount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">活动 GMV:</span>
                    <strong className="text-blue-700 font-bold">${(act.performance.totalGmvAmount / 1000).toFixed(1)}k</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">转化率:</span>
                    <strong className="text-emerald-700 font-bold">{act.performance.conversionRate}%</strong>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAct(act);
                      setSubTab('performance');
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs cursor-pointer font-sans"
                  >
                    效果报表
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 视图 2: 活动配置 (8步标准流表单) */}
      {subTab === 'config' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4 max-w-2xl mx-auto">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-amber-600">tune</span>
              <span>创建活动配置（标准 8 步规范流）</span>
            </h3>
            <span className="text-slate-400 font-mono text-[11px]">新建向导</span>
          </div>

          <form onSubmit={handleCreateActivity} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">1. 活动名称 (Campaign Name):</label>
              <input
                type="text"
                placeholder="例如：万圣节 Apple US 溢价换新大促"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">2. 选择目标人群 (直接引用用户分群底座):</label>
              <select
                value={newCohort}
                onChange={e => setNewCohort(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
              >
                <option value="注册 7 天未首单新人">注册 7 天未首单新人</option>
                <option value="首单已完成但 30 天未复购">首单已完成但 30 天未复购</option>
                <option value="近 14 天活跃度环比下降 50%">近 14 天活跃度环比下降 50%</option>
                <option value="60 天完全无交互沉默出卡人">60 天完全无交互沉默出卡人</option>
                <option value="累计 GMV > $5000 高价值核心出卡人">累计 GMV &gt; $5000 高价值核心出卡人</option>
                <option value="全平台全部出卡用户">全平台全部出卡用户</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">3. 配置参与门槛条件 (Participation Rule):</label>
              <input
                type="text"
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">4. 选择激励权益 (Benefits):</label>
              <select
                value={newBenefit}
                onChange={e => setNewBenefit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
              >
                <option value="+1.5% 专属溢价券">+1.5% 专属溢价券</option>
                <option value="$3.00 现金抵扣红包">$3.00 现金抵扣红包</option>
                <option value="500 平台积分礼包">500 平台积分礼包</option>
                <option value="极速审核绿色通道免预检特权">极速审核绿色通道免预检特权</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSubTab('management')}
                className="px-4 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
              >
                立即发布活动并启动追踪
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 视图 3: 活动效果 (效果至少看：参与人数｜新增｜首单｜复购｜GMV｜成本｜转化率) */}
      {subTab === 'performance' && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">insights</span>
                <span>活动效果评估看板：【{selectedAct.name}】</span>
              </h3>
              <p className="text-slate-400 text-xs">
                严格留存：参与人数 ｜ 新增 ｜ 首单 ｜ 复购 ｜ GMV ｜ 成本 ｜ 转化率 7 大核心指标
              </p>
            </div>
            <span className="font-mono text-xs text-slate-500">{selectedAct.period}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 font-mono text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] block font-sans">1. 参与人数</span>
              <strong className="text-lg font-black text-slate-900 block mt-0.5">
                {selectedAct.performance.participantsCount.toLocaleString()}
              </strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] block font-sans">2. 带来新增</span>
              <strong className="text-lg font-black text-blue-700 block mt-0.5">
                {selectedAct.performance.newUsersCount.toLocaleString()}
              </strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] block font-sans">3. 促成首单</span>
              <strong className="text-lg font-black text-emerald-600 block mt-0.5">
                {selectedAct.performance.firstOrdersCount.toLocaleString()}
              </strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] block font-sans">4. 唤醒复购</span>
              <strong className="text-lg font-black text-indigo-700 block mt-0.5">
                {selectedAct.performance.repurchaseCount.toLocaleString()}
              </strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] block font-sans">5. 产生 GMV</span>
              <strong className="text-lg font-black text-purple-700 block mt-0.5">
                ${(selectedAct.performance.totalGmvAmount / 1000).toFixed(1)}k
              </strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] block font-sans">6. 营销成本</span>
              <strong className="text-lg font-black text-rose-600 block mt-0.5">
                ${selectedAct.performance.costAmount.toLocaleString()}
              </strong>
            </div>
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
              <span className="text-emerald-800 text-[10px] block font-sans font-bold">7. 转化率 / ROI</span>
              <strong className="text-lg font-black text-emerald-700 block mt-0.5">
                {selectedAct.performance.conversionRate}% ({selectedAct.performance.roi}x)
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
