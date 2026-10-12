import React from 'react';

export const GrowthAttributionMatrix: React.FC = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Attribution 1: Gift Card Brand Distribution */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-sm transition-shadow">
        <div>
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">credit_card</span>
              <h4 className="font-headline-sm text-sm font-bold text-slate-900">
                卡种 GMV 分布
              </h4>
            </div>
            <span className="font-code-token text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              5 主流品类
            </span>
          </div>

          {/* Distribution Stack Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Apple Store</span>
                <span className="font-numeric-table font-semibold text-slate-900">
                  58% <span className="text-slate-400 font-normal">($828,530)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[58%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Steam Wallet</span>
                <span className="font-numeric-table font-semibold text-slate-900">
                  21% <span className="text-slate-400 font-normal">($299,985)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full w-[21%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Google Play</span>
                <span className="font-numeric-table font-semibold text-slate-900">
                  12% <span className="text-slate-400 font-normal">($171,420)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full w-[12%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Razer Gold</span>
                <span className="font-numeric-table font-semibold text-slate-900">
                  5% <span className="text-slate-400 font-normal">($71,425)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full w-[5%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">其他游戏与消费礼品卡</span>
                <span className="font-numeric-table font-semibold text-slate-900">
                  4% <span className="text-slate-400 font-normal">($57,140)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="bg-slate-300 h-full rounded-full w-[4%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-slate-50 rounded-lg p-2.5 flex items-center justify-between text-xs border border-slate-100">
          <span className="text-slate-500">核心品类集中度 (CR2)</span>
          <span className="font-numeric-table font-semibold text-blue-600">79.0% 稳健</span>
        </div>
      </div>

      {/* Attribution 2: Geographic Liquidity */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-sm transition-shadow">
        <div>
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-indigo-600 text-[18px]">public</span>
              <h4 className="font-headline-sm text-sm font-bold text-slate-900">
                国家/地区结构
              </h4>
            </div>
            <span className="font-code-token text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              全球清算分布
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> US (美国)
                </span>
                <span className="font-numeric-table font-semibold text-slate-900">
                  64% <span className="text-slate-400 font-normal">($914,240)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[64%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> UK (英国)
                </span>
                <span className="font-numeric-table font-semibold text-slate-900">
                  18% <span className="text-slate-400 font-normal">($257,130)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full w-[18%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> DE (德国/欧洲)
                </span>
                <span className="font-numeric-table font-semibold text-slate-900">
                  9% <span className="text-slate-400 font-normal">($128,565)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full w-[9%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span> NG (尼日利亚本土)
                </span>
                <span className="font-numeric-table font-semibold text-slate-900">
                  5% <span className="text-slate-400 font-normal">($71,425)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full w-[5%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> JP (日本其他)
                </span>
                <span className="font-numeric-table font-semibold text-slate-900">
                  4% <span className="text-slate-400 font-normal">($57,140)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full w-[4%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-slate-50 rounded-lg p-2.5 flex items-center justify-between text-xs border border-slate-100">
          <span className="text-slate-500">北美交易活跃比重</span>
          <span className="font-numeric-table font-semibold text-slate-900">64.0% (主结算盘)</span>
        </div>
      </div>

      {/* Attribution 3: Traffic Channel Acquisition */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-sm transition-shadow">
        <div>
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">hub</span>
              <h4 className="font-headline-sm text-sm font-bold text-slate-900">
                流量获客归因
              </h4>
            </div>
            <span className="font-code-token text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              漏斗沉淀
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">社媒广告投放 (Meta/TikTok)</span>
                <span className="font-numeric-table text-xs font-bold text-blue-600">42%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[42%]"></div>
              </div>
              <div className="flex justify-between font-code-token text-[10.5px] text-slate-500 mt-0.5">
                <span>转化 CPA $3.80</span>
                <span>订单转化率 14.8%</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">推广人带人裂变 (Affiliate)</span>
                <span className="font-numeric-table text-xs font-bold text-emerald-600">34%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full w-[34%]"></div>
              </div>
              <div className="flex justify-between font-code-token text-[10.5px] text-slate-500 mt-0.5">
                <span>KOC 节点 412 位</span>
                <span>留存周期 45 天</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">私域社群与自来流量 (Organic)</span>
                <span className="font-numeric-table text-xs font-bold text-indigo-600">24%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full w-[24%]"></div>
              </div>
              <div className="flex justify-between font-code-token text-[10.5px] text-slate-500 mt-0.5">
                <span>零成本出卡用户</span>
                <span>复购粘性 82%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-slate-50 rounded-lg p-2.5 flex items-center justify-between text-xs border border-slate-100">
          <span className="text-slate-500">裂变加权获客比重</span>
          <span className="font-numeric-table font-semibold text-emerald-600">58.0% 稳步提升</span>
        </div>
      </div>

      {/* Attribution 4: Merchant Fulfillment Share */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-sm transition-shadow">
        <div>
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">handshake</span>
              <h4 className="font-headline-sm text-sm font-bold text-slate-900">
                商户供给承揽占比
              </h4>
            </div>
            <span className="font-code-token text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              路由配额
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-800">Tier-S 核心做卡大商</span>
                <span className="font-numeric-table text-xs font-bold text-blue-600">45%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[45%]"></div>
              </div>
              <span className="font-code-token text-[10.5px] text-slate-500">
                承揽额度 $1,467,000 · 12 家大商
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-800">平台自营流动性兜底池</span>
                <span className="font-numeric-table text-xs font-bold text-emerald-600">35%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full w-[35%]"></div>
              </div>
              <span className="font-code-token text-[10.5px] text-slate-500">
                极速核销池 · 实时秒级消卡保障
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-800">常规认证接单商户</span>
                <span className="font-numeric-table text-xs font-bold text-slate-600">20%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full w-[20%]"></div>
              </div>
              <span className="font-code-token text-[10.5px] text-slate-500">
                承揽额度 $652,000 · 76 家长尾商户
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-slate-50 rounded-lg p-2.5 flex items-center justify-between text-xs border border-slate-100">
          <span className="text-slate-500">履约容灾系数</span>
          <span className="font-numeric-table font-semibold text-emerald-600">N+2 冗余充沛</span>
        </div>
      </div>
    </section>
  );
};
