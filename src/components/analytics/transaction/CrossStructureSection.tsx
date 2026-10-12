import React, { useState } from 'react';
import { QuadrantBrandItem } from './types';

interface CrossStructureSectionProps {
  brandItems: QuadrantBrandItem[];
  onOpenProfitModal: () => void;
  onSelectBrand?: (brandName: string) => void;
}

export const CrossStructureSection: React.FC<CrossStructureSectionProps> = ({
  brandItems,
  onOpenProfitModal,
  onSelectBrand,
}) => {
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);

  const activeItem = brandItems.find((b) => b.id === activeBrandId) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
      {/* Left 7 Columns: Quadrant Matrix */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <span className="material-symbols-outlined text-[18px]">scatter_plot</span>
                </span>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  卡种品牌：时效与成功率象限矩阵
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 pl-8">
                横轴：平均核销用时 (s) · 纵轴：核销成功率 (%) · 气泡大小：交易单量规模
              </p>
            </div>

            <span className="text-[11px] text-slate-400 font-code-token self-start sm:self-auto">
              样本量: 12,250 单
            </span>
          </div>

          {/* Interactive Quadrant Canvas Area */}
          <div className="relative mt-4 bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 h-64 sm:h-72 select-none overflow-hidden">
            {/* Quadrant Background Grid & Labels */}
            {/* Horizontal Split Line (around 85% success rate) */}
            <div className="absolute left-10 right-4 top-1/2 border-b border-dashed border-slate-300" />
            {/* Vertical Split Line (around 45s duration) */}
            <div className="absolute top-4 bottom-8 left-1/2 border-r border-dashed border-slate-300" />

            {/* Quadrant Watermark Badges */}
            <div className="absolute top-3 left-12 text-[10.5px] font-semibold text-emerald-700/60 bg-emerald-50/60 px-2 py-0.5 rounded">
              Q1: 核心标杆 (高成功率 / 极速)
            </div>
            <div className="absolute top-3 right-5 text-[10.5px] font-semibold text-blue-700/60 bg-blue-50/60 px-2 py-0.5 rounded">
              Q2: 需提速卡种 (高成功率 / 慢核销)
            </div>
            <div className="absolute bottom-10 left-12 text-[10.5px] font-semibold text-amber-700/60 bg-amber-50/60 px-2 py-0.5 rounded">
              Q3: 快速失败区 (低成功率 / 快反馈)
            </div>
            <div className="absolute bottom-10 right-5 text-[10.5px] font-semibold text-rose-700/60 bg-rose-50/60 px-2 py-0.5 rounded">
              Q4: 滞留淘汰区 (低质 / 超时)
            </div>

            {/* Axis Labels */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-semibold text-slate-400">
              成功率 (%) ↑
            </div>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-400">
              平均核销用时 (秒) →
            </div>

            {/* Data Bubbles */}
            {brandItems.map((item) => {
              // Calculate relative positions
              // X: Duration 0s -> 130s => 10% to 90%
              const xPercent = Math.min(Math.max((item.avgDurationSec / 130) * 80 + 10, 15), 88);
              // Y: Success rate 60% -> 100% => inverted 90% down to 15%
              const yPercent = Math.min(Math.max(100 - ((item.successRate - 65) / 35) * 75 - 15, 12), 82);

              const isHovered = activeBrandId === item.id;
              const radius = Math.min(Math.max(item.orderCount / 120, 24), 50);

              return (
                <div
                  key={item.id}
                  style={{
                    left: `${xPercent}%`,
                    top: `${yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => {
                    setActiveBrandId(item.id);
                    if (onSelectBrand) onSelectBrand(item.name);
                  }}
                  onMouseEnter={() => setActiveBrandId(item.id)}
                  className="absolute cursor-pointer transition-transform duration-200 z-10"
                >
                  <div
                    style={{ width: `${radius}px`, height: `${radius}px` }}
                    className={`rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-md transition-all ${
                      item.tagColor
                    } ${isHovered ? 'ring-4 ring-blue-300 scale-110 z-20' : 'opacity-90 hover:opacity-100'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {item.categoryIcon}
                    </span>
                  </div>

                  {/* Brand Short Label below or above */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white/90 px-1 rounded shadow-2xs">
                    {item.name.split(' ')[0]}
                  </div>
                </div>
              );
            })}

            {/* Hover Tooltip Overlay */}
            {activeItem && (
              <div className="absolute top-2 right-2 bg-slate-900/90 text-white rounded-lg p-2.5 shadow-xl text-xs z-30 pointer-events-none max-w-xs animate-fadeIn">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="font-bold text-sm text-blue-200">{activeItem.name}</span>
                  <span className="text-[10px] text-slate-400">{activeItem.region}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-300">
                  <div>
                    成功率:{' '}
                    <span className="font-bold text-emerald-400">{activeItem.successRate}%</span>
                  </div>
                  <div>
                    均耗时: <span className="font-bold text-amber-300">{activeItem.avgDurationSec}s</span>
                  </div>
                  <div>
                    总单量: <span className="font-bold text-white">{activeItem.orderCount.toLocaleString()} 笔</span>
                  </div>
                  <div>
                    GMV: <span className="font-bold text-blue-300">${activeItem.gmvAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-1.5 pt-1.5 border-t border-slate-700 text-[10.5px] text-slate-400">
                  {activeItem.note}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Quick Chips for All 5 Brands */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
          {brandItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveBrandId(item.id);
                if (onSelectBrand) onSelectBrand(item.name);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                activeBrandId === item.id
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{item.categoryIcon}</span>
              <span>{item.name}</span>
              <span className="font-numeric-stat text-slate-400 text-[10.5px]">
                {item.avgDurationSec}s · {item.successRate}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Right 5 Columns: Denomination Structure */}
      <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
        <div>
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </span>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                面值结构：固定大额 vs 散额浮动
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-8">
              面值档位分布与承兑撮合深度对比
            </p>
          </div>

          <div className="space-y-3.5 mt-4">
            {/* Card 1: 固定整额 */}
            <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    固定整额 ($100 / $200 / $500)
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    96.4% 转化率
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-numeric-stat">8,450 笔</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                承兑商底仓充足，支持 API 秒级自动吃单
              </p>

              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2.5">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96.4%' }} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-emerald-100 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">提交量</span>
                  <span className="font-numeric-stat font-semibold text-slate-800">8,450 笔</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">成交面值</span>
                  <span className="font-numeric-stat font-semibold text-slate-800">$1,210,000</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">竞价响应</span>
                  <span className="font-code-token font-semibold text-emerald-700">0.6s (瞬时)</span>
                </div>
              </div>
            </div>

            {/* Card 2: 散额浮动 */}
            <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    散额浮动 ($10 ~ $50 / 不规则零钱)
                  </span>
                  <span className="text-[11px] text-amber-700 font-semibold bg-white px-2 py-0.5 rounded-full border border-amber-200">
                    64.2% 转化率
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-numeric-stat">4,790 笔</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                流转损耗高，商户多流单，核验需人工核对
              </p>

              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2.5">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '64.2%' }} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-amber-100 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">提交量</span>
                  <span className="font-numeric-stat font-semibold text-slate-800">4,790 笔</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">成交面值</span>
                  <span className="font-numeric-stat font-semibold text-slate-800">$310,000</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">竞价响应</span>
                  <span className="font-code-token font-semibold text-amber-700">4.8s (常流单)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rule Recommendation Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">
              lightbulb
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                业务规则优化建议 (Rule Recommendation)
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                针对 &lt;$25 美金散额，建议提高 <span className="font-bold text-blue-700">0.5%</span> 撮合让利点以激励承兑商排队承接，预计可将流失率降低 <span className="font-bold text-emerald-700">17.3%</span>。
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={onOpenProfitModal}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            >
              <span>查看让利测算与调优</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
