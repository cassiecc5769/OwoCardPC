import React, { useState } from 'react';
import { NavPath } from '../../types';

interface RobotAnalyticsViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const RobotAnalyticsView: React.FC<RobotAnalyticsViewProps> = ({ onNavigate }) => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('today');
  const [selectedRobot, setSelectedRobot] = useState<'all' | 'pricing' | 'risk' | 'marketing'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Toast 提示 */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl border border-slate-700">
          <span className="material-symbols-outlined text-[17px] text-emerald-400">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 头部标题与时段切换 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-blue-600">08 经营分析</span>
            <span>/</span>
            <span className="text-slate-800 font-medium">机器人效果分析</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </span>
            <span>三大多模态机器人运营效能与 ROI 赋能看板</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              工具负责干活 · 平台负责管理 · 人负责决策
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            实时监控「报价监控机器人」、「卡风控机器人」与「AI推广机器人」对平台人效提升、资金避损与用户转化的量化贡献
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 时间跨度 */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1 rounded-md transition-all ${
                timeRange === 'today' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              今日实时
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1 rounded-md transition-all ${
                timeRange === '7days' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近 7 天
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1 rounded-md transition-all ${
                timeRange === '30days' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近 30 天
            </button>
          </div>

          <button
            type="button"
            onClick={() => showToast('已导出机器人运营效能综合分析报告 (PDF)')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            导出报告
          </button>
        </div>
      </div>

      {/* 机器人综合宏观收益卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs">机器人直接避损总额</span>
            <span className="material-symbols-outlined text-[18px] text-rose-500">shield</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {timeRange === 'today' ? '$48,250.00' : timeRange === '7days' ? '$295,400.00' : '$1,180,500.00'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 mt-1.5">
            <span className="font-semibold">↑ 18.5%</span>
            <span className="text-slate-400">主要由卡风控预检前置拦截坏卡贡献</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs">等效节省人工工时</span>
            <span className="material-symbols-outlined text-[18px] text-blue-500">group_work</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {timeRange === 'today' ? '128.5 人时' : timeRange === '7days' ? '890 人时' : '3,620 人时'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 mt-1.5">
            <span className="font-semibold">相当于 16 名</span>
            <span className="text-slate-400">全职初级客服及盯盘人员</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs">AI促成首单新 GMV</span>
            <span className="material-symbols-outlined text-[18px] text-indigo-500">trending_up</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {timeRange === 'today' ? '$24,680.00' : timeRange === '7days' ? '$184,200.00' : '$720,000.00'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 mt-1.5">
            <span className="font-semibold">86.2% 独立闭环</span>
            <span className="text-slate-400">AI推广直接引导注册首单</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs">全网报价竞争力指数</span>
            <span className="material-symbols-outlined text-[18px] text-amber-500">award_star</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            94.6 <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 mt-1.5">
            <span className="font-semibold">领先同行 +1.8pp</span>
            <span className="text-slate-400">自动比价预警将偏离时效压缩至 12min</span>
          </div>
        </div>
      </div>

      {/* 机器人视角切换 Tab */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setSelectedRobot('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedRobot === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          全景效能对比
        </button>
        <button
          type="button"
          onClick={() => setSelectedRobot('risk')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedRobot === 'risk' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          卡风控机器人专项
        </button>
        <button
          type="button"
          onClick={() => setSelectedRobot('pricing')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedRobot === 'pricing' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          报价监控机器人专项
        </button>
        <button
          type="button"
          onClick={() => setSelectedRobot('marketing')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedRobot === 'marketing' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          AI推广机器人专项
        </button>
      </div>

      {/* =========================================================================
          SECTOR 1: 卡风控机器人深度成效
         ========================================================================= */}
      {(selectedRobot === 'all' || selectedRobot === 'risk') && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs border border-rose-200">
                01
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">卡风控机器人：交易前预检与资金避损成效</h3>
                <span className="text-[11px] text-slate-500">六大主流卡种（Apple / Steam / Sephora / Target / Foot Locker / Macy's）全覆盖</span>
              </div>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('risk-monitor')}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>前往卡风控监控</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
              <span className="text-xs text-slate-500 block font-medium">Card Check 预检总时效分布</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 font-mono">1.82s</span>
                <span className="text-xs text-emerald-600">平均接口耗时</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: '78%' }} title="< 2秒 (78%)"></div>
                <div className="bg-blue-500 h-full" style={{ width: '18%' }} title="2-4秒 (18%)"></div>
                <div className="bg-amber-500 h-full" style={{ width: '4%' }} title="> 4秒 (4%)"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>&lt;2秒 (78%)</span>
                <span>2-4秒 (18%)</span>
                <span>&gt;4秒 (4%)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
              <span className="text-xs text-slate-500 block font-medium">坏卡/假卡直接拦截率</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-rose-600 font-mono">2.23%</span>
                <span className="text-xs text-slate-500">今日 318 张拦截</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                有效卡券 97.77% 毫秒级放行进入商户收卡池，假卡坏卡进入撮合池概率由历史 1.4% 降至 <strong>0.02%</strong>。
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
              <span className="text-xs text-slate-500 block font-medium">存证合规与争议支持率</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600 font-mono">100%</span>
                <span className="text-xs text-slate-500">SHA-256 存证完整率</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                所有拦截单据均保留毫秒级时间戳、第三方服务商原始快照与验卡截图，商户争议追偿胜诉率达 <strong>99.4%</strong>。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTOR 2: 报价监控机器人深度成效
         ========================================================================= */}
      {(selectedRobot === 'all' || selectedRobot === 'pricing') && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs border border-amber-200">
                02
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">报价监控机器人：全网盯盘与竞争力维系成效</h3>
                <span className="text-[11px] text-slate-500">持续监控 426 个核心 SKU，自动生成统一待办并协同商户调价</span>
              </div>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('quote-management')}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>前往报价运营</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">监控 SKU 覆盖</span>
              <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">426 个</span>
              <span className="text-[10px] text-emerald-600 mt-1 block">全网 12 家主流平台比对</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">第三方数据采集正常率</span>
              <span className="text-xl font-bold text-emerald-600 font-mono mt-0.5 block">98.6%</span>
              <span className="text-[10px] text-slate-400 mt-1 block">采集异常与业务异常严格隔离</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">报价异常处理平均耗时</span>
              <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">11.8 分钟</span>
              <span className="text-[10px] text-emerald-600 mt-1 block">考核标准 ≤ 15分钟，达标率 94%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">调价后达标自动关闭率</span>
              <span className="text-xl font-bold text-indigo-600 font-mono mt-0.5 block">100%</span>
              <span className="text-[10px] text-slate-400 mt-1 block">无需人工点完成，下一轮轮巡复核</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTOR 3: AI推广机器人深度成效
         ========================================================================= */}
      {(selectedRobot === 'all' || selectedRobot === 'marketing') && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-200">
                03
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">AI推广机器人：流量承接与转化闭环成效</h3>
                <span className="text-[11px] text-slate-500">前台智能解答与引导、后台人机接管待办、不会问题反哺知识库</span>
              </div>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('ai-promotion')}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>前往AI推广运营后台</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">AI接待访客</span>
              <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">1,286 人</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">↑ 12.6%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">独立接待率</span>
              <span className="text-lg font-bold text-emerald-600 font-mono mt-0.5 block">86.2%</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">↑ 3.1pp</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">转人工接管率</span>
              <span className="text-lg font-bold text-amber-700 font-mono mt-0.5 block">13.8%</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">↓ 2.1pp</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">引导注册点击率</span>
              <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">42.6%</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">↑ 1.8pp</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">访客→注册转化率</span>
              <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">18.3%</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">↑ 2.2pp</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">注册→首单转化率</span>
              <span className="text-lg font-bold text-indigo-600 font-mono mt-0.5 block">36.5%</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">↑ 1.4pp</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-indigo-50/40 border border-indigo-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-indigo-950">知识库飞轮效应显著：</span>
              <p className="text-[11px] text-indigo-800">
                本周通过「AI不会的问题池」沉淀补充 34 条新知识话术，高流失问题 A/B 胜出率 72.4%，促成流失挽回金额 $18,400。
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('ai-promotion')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap"
            >
              管理推广知识库
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
