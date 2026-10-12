import React, { useState } from 'react';
import { NavPath } from '../../../types';

interface UserOperationsTabProps {
  onNavigate?: (path: NavPath) => void;
}

export const UserOperationsTab: React.FC<UserOperationsTabProps> = ({ onNavigate }) => {
  const [filterChannel, setFilterChannel] = useState('ALL');
  const [filterCountry, setFilterCountry] = useState('ALL');
  const [filterUserTag, setFilterUserTag] = useState('ALL');

  // 用户生命周期漏斗 (PRD 17.3.3: 注册 ➔ 首单 ➔ 二单 ➔ 复购 ➔ 持续活跃)
  const userFunnel = [
    { stage: '1. 注册激活 (Registered)', count: 5000, ratio: '100.0%', stepConv: '-', drop: 0, desc: '新注册并完成手机/邮箱验证的用户' },
    { stage: '2. 发生首单 (First Order)', count: 3625, ratio: '72.5%', stepConv: '72.5%', drop: 1375, desc: '首次成功提交卡单并完成结算放款' },
    { stage: '3. 发生二单 (Second Order)', count: 2710, ratio: '54.2%', stepConv: '74.8%', drop: 915, desc: '首单后 14 天内再次提交卡单' },
    { stage: '4. 周期复购 (Repurchased 3+)', count: 1930, ratio: '38.6%', stepConv: '71.2%', drop: 780, desc: '30 天内多次出卡并形成出卡习惯' },
    { stage: '5. 持续活跃 (Core Active VIP)', count: 1240, ratio: '24.8%', stepConv: '64.2%', drop: 690, desc: '月均出卡 ≥5 笔的大宗/高频出卡用户' }
  ];

  // 12 大核心用户指标 (PRD 17.3.3)
  const userMetrics = [
    { name: '新增用户 (新增注册)', val: '342 人', mom: '+15.2%', desc: '周期内新注册出卡用户', color: 'blue' },
    { name: '注册转化率 (进站➔注册)', val: '94.2%', mom: '+1.4%', desc: '落地页访问到注册激活转化', color: 'blue' },
    { name: '首单用户数', val: '248 人', mom: '+12.8%', desc: '周期内首次完成出卡用户', color: 'blue' },
    { name: '首单转化率', val: '72.5%', mom: '+2.4%', desc: '首单用户 ÷ 新注册用户', color: 'blue' },
    { name: '首单平均周期', val: '4.2 小时', mom: '-0.8h', desc: '注册到首次完成出卡平均耗时', color: 'emerald' },
    { name: '周期复购用户', val: '2,880 人', mom: '+8.6%', desc: '30天内多次交易用户', color: 'emerald' },
    { name: '复购率 (30天)', val: '68.4%', mom: '+1.8%', desc: '复购用户 ÷ 可复购用户', color: 'emerald' },
    { name: '复购平均周期', val: '5.8 天', mom: '-0.4d', desc: '相隔两笔出卡交易平均天数', color: 'emerald' },
    { name: '活跃用户 (MAU)', val: '4,210 人', mom: '+8.2%', desc: '周期内有出卡行为的活跃出卡人', color: 'purple' },
    { name: '沉默预警用户', val: '620 人', mom: '+3.1%', desc: '连续 30~60 天未出卡老用户', color: 'amber' },
    { name: '流失风险用户', val: '180 人', mom: '-1.2%', desc: '连续 >60 天未出卡用户', color: 'rose' },
    { name: '用户生命周期价值 (LTV)', val: '$1,420.00', mom: '+14.5%', desc: '单个用户全生命周期贡献毛利', color: 'purple' }
  ];

  // 用户留存 Cohort 同期群分析 (PRD 17.3.3)
  const cohortRows = [
    { cohort: '2026-05', users: 1820, day1: '48.2%', day7: '68.5%', day30: '62.4%', day60: '58.1%', day90: '54.2%', ltv: '$1,520' },
    { cohort: '2026-06', users: 2100, day1: '51.0%', day7: '70.2%', day30: '64.8%', day60: '60.5%', day90: '56.8%', ltv: '$1,610' },
    { cohort: '2026-07', users: 2450, day1: '52.4%', day7: '71.8%', day30: '66.2%', day60: '61.4%', day90: '58.0%', ltv: '$1,680' },
    { cohort: '2026-08', users: 2890, day1: '53.5%', day7: '73.0%', day30: '67.5%', day60: '63.2%', day90: '59.5%', ltv: '$1,720' },
    { cohort: '2026-09', users: 3120, day1: '54.2%', day7: '74.5%', day30: '69.0%', day60: '64.8%', day90: '-', ltv: '$1,450*' },
    { cohort: '2026-10 (当期)', users: 1250, day1: '56.8%', day7: '75.2%', day30: '-', day60: '-', day90: '-', ltv: '$480*' }
  ];

  return (
    <div className="space-y-4 text-xs text-slate-800 antialiased animate-in fade-in duration-200">
      {/* 顶部多维交叉过滤条 (渠道 / 国家 / Brand / 注册月份 / 用户标签) */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-900 text-xs">交叉分析:</span>

          {/* 渠道来源 */}
          <select
            value={filterChannel}
            onChange={e => setFilterChannel(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
          >
            <option value="ALL">全部流量渠道 (Channel)</option>
            <option value="referral">推广人裂变 (Referral)</option>
            <option value="ads">精准社媒投放 (Ads)</option>
            <option value="direct">自然私域社群 (Direct)</option>
            <option value="api">B2B API 直连</option>
          </select>

          {/* 国家 */}
          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
          >
            <option value="ALL">全部地区 (Country)</option>
            <option value="US">US (美国)</option>
            <option value="UK">UK (英国)</option>
            <option value="CA">CA (加拿大)</option>
            <option value="NG">NG (尼日利亚)</option>
          </select>

          {/* 用户标签 */}
          <select
            value={filterUserTag}
            onChange={e => setFilterUserTag(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
          >
            <option value="ALL">全部用户标签 (User Tags)</option>
            <option value="vip">大宗出卡商 (Tier-S)</option>
            <option value="regular">高频零售用户</option>
            <option value="new">30天新注册出卡人</option>
            <option value="at_risk">风控关注用户</option>
          </select>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('member-operations')}
          className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <span className="material-symbols-outlined text-[15px]">group</span>
          进入会员运营策略
        </button>
      </div>

      {/* 1. 12 大核心用户指标卡片 (PRD 17.3.3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {userMetrics.map((m, i) => (
          <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{m.name}</span>
              <span className={`font-bold font-mono ${m.mom.startsWith('+') ? 'text-emerald-700' : 'text-blue-700'}`}>
                {m.mom}
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-900">{m.val}</div>
            <p className="text-[10.5px] text-slate-400 font-sans">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* 2. 用户全生命周期漏斗 (注册 ➔ 首单 ➔ 二单 ➔ 复购 ➔ 持续活跃) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              用户全生命周期转化漏斗（注册 ➔ 首单 ➔ 二单 ➔ 复购 ➔ 持续活跃）
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">
              分析平台用户从注册到首单、二次交易与长期留存的价值跃迁，识别新客流失断点。
            </p>
          </div>
          <span className="text-blue-700 font-mono font-bold text-xs">
            核心留存转化率: 24.8%
          </span>
        </div>

        <div className="space-y-2.5">
          {userFunnel.map((step, idx) => {
            const widthPct = Math.round((step.count / 5000) * 100);
            return (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold font-mono text-[11px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <strong className="text-slate-900">{step.stage}</strong>
                    <span className="text-[11px] text-slate-500 font-normal">({step.desc})</span>
                  </div>

                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-slate-900 font-bold text-sm">
                      {step.count.toLocaleString()} 人
                    </span>
                    <span className="text-purple-700 font-bold">
                      占总注册: {step.ratio}
                    </span>
                    {step.stepConv !== '-' && (
                      <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        环节转化: {step.stepConv}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${widthPct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 用户留存 Cohort 同期群分析 (PRD 17.3.3) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              用户同期群留存与复购表现 (Cohort Analysis)
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">
              对比不同月份注册批次用户的首单转化速度、30日复购率与生命周期 LTV，严密评估拉新获客质量。
            </p>
          </div>
          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg font-mono font-bold text-xs border border-purple-200">
            批次质量持续向上 (+14.2% LTV)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold font-mono">
                <th className="py-2.5 px-3">注册批次 (Cohort)</th>
                <th className="py-2.5 px-3">初始注册规模</th>
                <th className="py-2.5 px-3">次日首单率</th>
                <th className="py-2.5 px-3">7日首单率</th>
                <th className="py-2.5 px-3">30日复购率</th>
                <th className="py-2.5 px-3">60日留存率</th>
                <th className="py-2.5 px-3">90日留存率</th>
                <th className="py-2.5 px-3 text-right">批次人均 LTV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
              {cohortRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{row.cohort}</td>
                  <td className="py-2.5 px-3 font-semibold">{row.users.toLocaleString()} 人</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.day1}</td>
                  <td className="py-2.5 px-3 font-bold text-purple-700 bg-purple-50/50">{row.day7}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700 bg-emerald-50/50">{row.day30}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.day60}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.day90}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{row.ltv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
