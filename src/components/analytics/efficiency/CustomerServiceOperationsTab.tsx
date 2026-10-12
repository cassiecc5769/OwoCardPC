import React, { useState } from 'react';
import { NavPath } from '../../../types';

interface CustomerServiceOperationsTabProps {
  onNavigate?: (path: NavPath) => void;
}

export const CustomerServiceOperationsTab: React.FC<CustomerServiceOperationsTabProps> = ({
  onNavigate
}) => {
  const [filterShift, setFilterShift] = useState('ALL');
  const [filterTaskType, setFilterTaskType] = useState('ALL');

  // 6 大核心指标维度卡片 (PRD 17.4.2)
  const metricDimensions = [
    {
      category: '1. 工作量维度 (Workload)',
      metrics: [
        { label: '新增客服任务', val: '1,240 件', mom: '+6.2%', desc: '当日进线与系统派发任务' },
        { label: '已完成任务', val: '1,215 件', mom: '+7.4%', desc: '已闭环解决归档任务' },
        { label: '处理中任务池', val: '25 件', mom: '-12.0%', desc: '当前坐席正处理工单' }
      ]
    },
    {
      category: '2. 效率维度 (Speed & Latency)',
      metrics: [
        { label: '平均首次响应 (FRT)', val: '18.4 秒', mom: '-2.1s', desc: '用户进线到客服首次打招呼' },
        { label: '平均处理时长 (AHT)', val: '3.2 分钟', mom: '-0.4m', desc: '工单接手到闭环解决' }
      ]
    },
    {
      category: '3. SLA 履约维度',
      metrics: [
        { label: 'SLA 达成率', val: '99.2%', mom: '+0.3%', desc: '在规定时间内解决工单比例' },
        { label: 'SLA 超时任务数', val: '10 件', mom: '-4件', desc: '超过 15 分钟未响应任务' }
      ]
    },
    {
      category: '4. 质量维度 (Resolution Quality)',
      metrics: [
        { label: '一次解决率 (FCR)', val: '94.6%', mom: '+1.2%', desc: '无二次复诉直接闭环' },
        { label: '工单重新打开率', val: '2.1%', mom: '-0.5%', desc: '结案后用户再次追问追诉' }
      ]
    },
    {
      category: '5. 人效维度 (Productivity)',
      metrics: [
        { label: '人均处理任务数', val: '152 件/人', mom: '+8.5%', desc: '单坐席日均处理量' },
        { label: '人均经办交易额', val: '$178,500', mom: '+12.0%', desc: '人均撬动交易规模' }
      ]
    }
  ];

  // 任务结构分布
  const taskStructure = [
    { type: '卡单核验与异常复核 (Card Orders)', count: 645, ratio: '52.0%', avgTime: '2.8m', autoPotential: '可优化为 Card Check 自动放行' },
    { type: '商户接单与额度协同 (Merchants)', count: 273, ratio: '22.0%', avgTime: '3.5m', autoPotential: '商户工作台自助追加押金' },
    { type: '售后争议与扫卡仲裁 (Disputes)', count: 198, ratio: '16.0%', avgTime: '5.6m', autoPotential: 'Card Tool T1/T2 证据链自动判责' },
    { type: '推广人提现与返佣审核 (Affiliates)', count: 124, ratio: '10.0%', avgTime: '1.9m', autoPotential: '小额自动秒级到账规则' }
  ];

  // 客服坐席个人效能榜
  const agentRankings = [
    { name: '王芳 (CS03)', shift: '早班 (08:00-16:00)', completed: 184, aht: '2.6m', sla: '99.8%', fcr: '96.2%', score: 98.5 },
    { name: '李伟 (CS01)', shift: '早班 (08:00-16:00)', completed: 172, aht: '2.8m', sla: '99.4%', fcr: '95.0%', score: 96.8 },
    { name: '张立 (CS02)', shift: '晚班 (16:00-24:00)', completed: 165, aht: '3.1m', sla: '99.0%', fcr: '94.5%', score: 95.0 },
    { name: '刘洋 (CS04)', shift: '晚班 (16:00-24:00)', completed: 148, aht: '3.6m', sla: '98.5%', fcr: '93.2%', score: 92.4 },
    { name: '陈晨 (CS05)', shift: '通宵班 (00:00-08:00)', completed: 135, aht: '3.9m', sla: '98.2%', fcr: '92.0%', score: 90.8 }
  ];

  // 最耗人工的问题聚类与推进自动化建议 (PRD 17.4.2 核心目的)
  const highLaborBottlenecks = [
    {
      title: '1. 面额倒挂人工复核二次议价 (最耗人工作业)',
      dailyCalls: '220 件/天',
      avgTime: '8.5 分钟',
      laborCostTotal: '31.2 人时/天',
      rootCause: '用户申报与官方查验差额时需客服在线与用户沟通确认折价率。',
      automationAdvice: '推行前端「弹窗智能快捷确认新报价」，用户一键确认即可自动放行，预计节约 80% 人工。'
    },
    {
      title: '2. 模糊卡码人工肉眼识别与补全 (高耗时)',
      dailyCalls: '140 件/天',
      avgTime: '6.2 分钟',
      laborCostTotal: '14.5 人时/天',
      rootCause: '实体卡涂层刮花导致 OCR 失败，客服需放大图片肉眼比对。',
      automationAdvice: '接入多模态 AI 智能补全算法 (CODE_COMPLETE)，前缀特征自动纠错匹配。'
    }
  ];

  return (
    <div className="space-y-4 text-xs text-slate-800 antialiased animate-in fade-in duration-200">
      {/* 顶部控制栏 */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-xs">坐席与班次筛选:</span>
          <select
            value={filterShift}
            onChange={e => setFilterShift(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
          >
            <option value="ALL">全部班次 (Shift ALL)</option>
            <option value="morning">早班 (08:00 - 16:00)</option>
            <option value="evening">晚班 (16:00 - 24:00)</option>
            <option value="night">通宵班 (00:00 - 08:00)</option>
          </select>

          <select
            value={filterTaskType}
            onChange={e => setFilterTaskType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
          >
            <option value="ALL">全部任务类型</option>
            <option value="card">卡单核验任务</option>
            <option value="dispute">售后争议任务</option>
            <option value="merchant">商户协同任务</option>
          </select>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('workbench-cs')}
          className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <span className="material-symbols-outlined text-[15px]">support_agent</span>
          进入客服统一工作台
        </button>
      </div>

      {/* 1. 客服作业 5 大指标维度卡片 (PRD 17.4.2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {metricDimensions.map((dim, i) => (
          <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <span className="font-bold text-slate-900 text-xs block pb-1 border-b border-slate-100">
              {dim.category}
            </span>
            <div className="space-y-2">
              {dim.metrics.map((m, j) => (
                <div key={j} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{m.label}</span>
                    <span className={`font-mono font-bold ${m.mom.startsWith('+') ? 'text-emerald-700' : 'text-blue-700'}`}>
                      {m.mom}
                    </span>
                  </div>
                  <strong className="text-sm font-bold font-mono text-slate-900 block">{m.val}</strong>
                  <span className="text-[10px] text-slate-400 block">{m.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 2. 高耗人工作业聚类与进一步自动化建议 (PRD 17.4.2 核心目的: 发现哪类问题最耗人工) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              人工耗时黑洞识别与自动化推进策略（发现哪类问题最耗人工）
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">
              分析客服处理工单的时间分布，精准定位低效人工环节，以自动化工具与智能规则替代人工重复劳动。
            </p>
          </div>
          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg font-mono font-bold text-xs border border-purple-200">
            预计可替代 45.7 人时/天
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {highLaborBottlenecks.map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <strong className="text-slate-900 text-xs">{item.title}</strong>
                <span className="text-rose-600 font-mono font-bold text-xs">
                  耗时: {item.laborCostTotal}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/60">
                <span>日均工单: <strong className="text-slate-900">{item.dailyCalls}</strong></span>
                <span>单笔平均耗时: <strong className="text-rose-600">{item.avgTime}</strong></span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                • <strong>耗时根因:</strong> {item.rootCause}
              </p>

              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 text-[11px] leading-relaxed">
                <strong>💡 自动化破局方案:</strong> {item.automationAdvice}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 任务结构占比与客服坐席效能天梯 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 任务结构 (5列) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs">任务类型结构分布 (Task Composition)</h4>
            <span className="text-[11px] text-slate-400 font-mono">1,240 件</span>
          </div>

          <div className="space-y-3">
            {taskStructure.map((t, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-sans text-slate-800">{t.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{t.count}件 ({t.ratio})</span>
                    <span className="text-slate-400 text-[11px]">均耗 {t.avgTime}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: t.ratio }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 坐席天梯 (7列) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs">坐席人效与质量评估 (Agent Productivity)</h4>
            <span className="text-[11px] text-slate-400 font-mono">Top 5 坐席</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold font-mono">
                  <th className="py-2 px-2.5">客服坐席</th>
                  <th className="py-2 px-2.5">班次</th>
                  <th className="py-2 px-2.5">完成件数</th>
                  <th className="py-2 px-2.5">平均处理</th>
                  <th className="py-2 px-2.5">SLA 达成</th>
                  <th className="py-2 px-2.5">一次解决率</th>
                  <th className="py-2 px-2.5 text-right">综合人效分</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {agentRankings.map((agent, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-2 px-2.5 font-bold text-slate-900 font-sans">{agent.name}</td>
                    <td className="py-2 px-2.5 text-slate-500 text-[11px] font-sans">{agent.shift.split(' ')[0]}</td>
                    <td className="py-2 px-2.5 font-bold">{agent.completed} 件</td>
                    <td className="py-2 px-2.5 text-slate-700">{agent.aht}</td>
                    <td className="py-2 px-2.5 text-emerald-700 font-bold">{agent.sla}</td>
                    <td className="py-2 px-2.5 text-blue-700">{agent.fcr}</td>
                    <td className="py-2 px-2.5 text-right font-bold text-indigo-700">{agent.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
