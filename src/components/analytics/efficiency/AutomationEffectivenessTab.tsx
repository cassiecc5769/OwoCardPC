import React, { useState } from 'react';
import { NavPath } from '../../../types';

interface AutomationEffectivenessTabProps {
  onNavigate?: (path: NavPath) => void;
}

export const AutomationEffectivenessTab: React.FC<AutomationEffectivenessTabProps> = ({
  onNavigate
}) => {
  const [selectedHub, setSelectedHub] = useState<'quote_bot' | 'card_check' | 'card_tool'>('card_check');

  // 4 大终极自动化综合指标 (PRD 17.4.4 最终最核心的几个指标)
  const topKpis = [
    {
      title: '自动化覆盖率',
      val: '98.5%',
      mom: '+0.8%',
      target: '目标 ≥98.0%',
      desc: '进入平台全流程由自动化工具接管的业务比例',
      color: 'blue'
    },
    {
      title: '自动处理率 (替代人工)',
      val: '83.5%',
      mom: '+2.4%',
      target: '目标 ≥80.0%',
      desc: '无需任何人工客服介入、全自动闭环处理比例',
      color: 'purple'
    },
    {
      title: '人工介入率 (需客服操作)',
      val: '16.5%',
      mom: '-2.4%',
      target: '红线 ≤20.0%',
      desc: '因 REVIEW、面额倒挂或通道抖动需人工复核比例',
      color: 'amber'
    },
    {
      title: '自动处理成功率',
      val: '99.1%',
      mom: '+0.2%',
      target: '目标 ≥99.0%',
      desc: '自动化执行任务无错误、无误杀并成功结算比例',
      color: 'emerald'
    }
  ];

  // 三大自动化中枢详细指标 (PRD 17.4.4)
  const hubs = {
    quote_bot: {
      name: '1. 报价机器人 (Quotation Intelligence Bot)',
      desc: '自动从全球主流交易所与外盘抓取最新汇率与做卡折扣，智能匹配 SKU 并实时预警异常倒挂。',
      metrics: [
        { label: '行情自动采集覆盖率', val: '99.2%', mom: '+0.4%', note: '支持 210 款主流 SKU 毫秒级爬取' },
        { label: 'SKU 智能匹配成功率', val: '98.6%', mom: '+0.2%', note: '多币种汇率映射无偏差' },
        { label: '自动发现异常倒挂数', val: '28 件/周', mom: '+4件', note: '包含套利风险与断崖式暴跌' },
        { label: '人工二次确认率', val: '12.4%', mom: '-3.1%', note: '大额调价仍保留人工审批' },
        { label: '报价异常识别命中率', val: '96.5%', mom: '+1.0%', note: '有效防范羊毛党恶意套利' },
        { label: '价格异常自动恢复率', val: '95.0%', mom: '+1.5%', note: '外盘恢复后 5 分钟内自动归位' }
      ]
    },
    card_check: {
      name: '2. Card Check 交易预检与验真 (Transaction Precheck)',
      desc: '进单环节自动调用多通道进行卡密格式、重复卡排重、官方直连余额查验与风险拦截。',
      metrics: [
        { label: '自动预检覆盖率', val: '100.0%', mom: '0.0%', note: '所有进单 100% 必须穿透预检' },
        { label: 'PASS 自动放行率', val: '83.5%', mom: '+2.4%', note: '直连验真完好，秒级推入撮合池' },
        { label: 'REVIEW 人工复核率', val: '11.2%', mom: '-1.8%', note: '面额微差或新客首次提单' },
        { label: 'BLOCK 风险阻断率', val: '4.5%', mom: '-0.5%', note: '零余额/重复卡/黑名单硬性拦截' },
        { label: 'CHECK_FAILED 通道异常率', val: '0.8%', mom: '-0.1%', note: '网关 504 超时，触发 Failover' },
        { label: '自动化直通完成率', val: '83.5%', mom: '+2.4%', note: '从进单到结算无人工触碰' },
        { label: '人工介入复核率', val: '16.5%', mom: '-2.4%', note: '需要客服专员二次介入' }
      ]
    },
    card_tool: {
      name: '3. Card Tool 平台卡工具服务 (Card Tool Service)',
      desc: '统一封装底层多供应商与官方接口，提供余额查询、状态查询、订单查询、快充与补全能力。',
      metrics: [
        { label: '周期总调用次数', val: '42,500 次', mom: '+12.4%', note: '含余额、状态与快充调用' },
        { label: '工具调用综合成功率', val: '99.1%', mom: '+0.3%', note: '全网关综合成功率' },
        { label: 'Primary Source 成功率', val: '96.4%', mom: '+0.5%', note: '直连主源完成查验' },
        { label: 'Failover 备用源接管率', val: '2.7%', mom: '-0.3%', note: '主源超时后无缝平滑切换' },
        { label: 'Tool Error 最终错误率', val: '0.9%', mom: '-0.2%', note: '主备均异常，需业务兜底' },
        { label: '接口平均响应时间', val: '890 ms', mom: '-120ms', note: '毫秒级查验' },
        { label: '自动化 API 调用占比', val: '98.2%', mom: '+0.6%', note: '仅 1.8% 为客服手动临时查询' }
      ]
    }
  };

  const currentHubData = hubs[selectedHub];

  return (
    <div className="space-y-4 text-xs text-slate-800 antialiased animate-in fade-in duration-200">
      {/* 1. 4 大终极自动化核心指标 (PRD 17.4.4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {topKpis.map((kpi, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold">{kpi.title}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                {kpi.target}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900">{kpi.val}</span>
              <span className={`text-xs font-mono font-bold ${kpi.mom.startsWith('+') ? 'text-emerald-700' : 'text-blue-700'}`}>
                环比: {kpi.mom}
              </span>
            </div>

            <p className="text-[10.5px] text-slate-400 font-sans">{kpi.desc}</p>
          </div>
        ))}
      </div>

      {/* 2. 经典作业效能穿透下钻链路 (PRD 17.4.5: 经营指标 → 作业指标 → 技术事实) */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
            </span>
            <div>
              <h4 className="font-bold text-blue-950 text-sm">
                作业效能经典下钻归因案例（经营指标 ➔ 作业指标 ➔ 技术事实）
              </h4>
              <p className="text-blue-900 text-xs mt-0.5">
                实时穿透：当人工介入率突增时，精准定位到具体卡种、具体能力与底层第三方供应商网关。
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('card-tools-records')}
            className="px-3 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <span>直达卡工具调用日志</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {/* 链路节点 */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-xs">
          <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
            <span className="text-[10px] text-slate-400 font-sans block">1. 经营指标异动</span>
            <strong className="text-rose-600 font-bold block">人工介入率 ↑ 28%</strong>
            <span className="text-[10px] text-slate-500 font-sans">较基准 15% 显著上升</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
            <span className="text-[10px] text-slate-400 font-sans block">2. 预检环节表现</span>
            <strong className="text-amber-700 font-bold block">Card Check REVIEW ↑</strong>
            <span className="text-[10px] text-slate-500 font-sans">复核工单量激增</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
            <span className="text-[10px] text-slate-400 font-sans block">3. 聚类品牌与地区</span>
            <strong className="text-blue-700 font-bold block">Apple US 卡种 ↑</strong>
            <span className="text-[10px] text-slate-500 font-sans">集中于 Apple US $100</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
            <span className="text-[10px] text-slate-400 font-sans block">4. 能力调用表现</span>
            <strong className="text-purple-700 font-bold block">余额查询失败 ↑</strong>
            <span className="text-[10px] text-slate-500 font-sans">BALANCE_CHECK 超时</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
            <span className="text-[10px] text-slate-400 font-sans block">5. 底层技术事实</span>
            <strong className="text-rose-700 font-bold block">Source A Tool Error</strong>
            <span className="text-[10px] text-slate-500 font-sans">官方网关 504 超时</span>
          </div>
        </div>
      </div>

      {/* 3. 三大自动化中枢深度指标看板 (PRD 17.4.4) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">三大自动化核心中枢效能指标</h4>
            <p className="text-slate-500 text-xs mt-0.5">{currentHubData.desc}</p>
          </div>

          {/* 切换中枢 */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60 text-xs font-semibold">
            {[
              { id: 'card_check', label: 'Card Check 预检' },
              { id: 'card_tool', label: 'Card Tool 路由' },
              { id: 'quote_bot', label: '报价监控机器人' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedHub(tab.id as typeof selectedHub)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  selectedHub === tab.id
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 指标矩阵 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentHubData.metrics.map((m, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-sans font-medium">{m.label}</span>
                <span className={`text-[11px] font-bold ${m.mom.startsWith('+') ? 'text-emerald-700' : 'text-blue-700'}`}>
                  {m.mom}
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900">{m.val}</div>
              <p className="text-[10.5px] text-slate-400 font-sans">{m.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
