import React, { useState } from 'react';
import { ChannelItem, ChannelOrder, TrackingLinkItem, AttributedUser, AssociatedCampaign } from './types';
import {
  MOCK_CHANNEL_ORDERS,
  MOCK_TRACKING_LINKS,
  MOCK_ATTRIBUTED_USERS,
  MOCK_CAMPAIGNS
} from './mockData';

interface ChannelDetailViewProps {
  channel: ChannelItem;
  onBack: () => void;
  onOpenLinkModal: () => void;
  onOpenEditModal: () => void;
  onToggleStatus: () => void;
  onShowToast: (msg: string) => void;
}

export const ChannelDetailView: React.FC<ChannelDetailViewProps> = ({
  channel,
  onBack,
  onOpenLinkModal,
  onOpenEditModal,
  onToggleStatus,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'users' | 'funnel' | 'campaigns'>('overview');
  const [orders, setOrders] = useState<ChannelOrder[]>(MOCK_CHANNEL_ORDERS);
  const [links, setLinks] = useState<TrackingLinkItem[]>(MOCK_TRACKING_LINKS);
  const [users, setUsers] = useState<AttributedUser[]>(MOCK_ATTRIBUTED_USERS);
  const [campaigns, setCampaigns] = useState<AssociatedCampaign[]>(MOCK_CAMPAIGNS);
  const [userSearch, setUserSearch] = useState('');
  const [selectedKycFilter, setSelectedKycFilter] = useState('');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`已复制 ${label}: ${text}`);
  };

  const filteredUsers = users.filter(u => {
    if (userSearch) {
      const q = userSearch.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.uid.toLowerCase().includes(q) && !u.phone.includes(q)) {
        return false;
      }
    }
    if (selectedKycFilter && u.kycStatus !== selectedKycFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-4 text-[#0b1c30] antialiased">
      {/* 顶部统一业务标头 */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
            title="返回渠道列表"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                渠道详情 · {channel.name}
              </h1>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-600 font-semibold">
                {channel.id}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px] uppercase border border-blue-200/60">
                {channel.type}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                channel.status === '已暂停'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${channel.status === '已暂停' ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`}></span>
                <span>{channel.status === '已暂停' ? '已暂停 (PAUSED)' : '投放中 (ACTIVE)'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              负责人: <strong className="text-slate-800">{channel.manager}</strong> · 归因全链路实时埋点追踪与转化漏斗监测
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          <button
            onClick={onOpenLinkModal}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">add_link</span>
            <span>生成新追踪参数</span>
          </button>
          <button
            onClick={onOpenEditModal}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">tune</span>
            <span>编辑配置</span>
          </button>
          <button
            onClick={onToggleStatus}
            className={`flex items-center gap-1.5 px-3.5 h-9 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
              channel.status === '已暂停'
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {channel.status === '已暂停' ? 'play_circle' : 'pause_circle'}
            </span>
            <span>{channel.status === '已暂停' ? '恢复投放' : '暂停投放'}</span>
          </button>
        </div>
      </header>

      {/* 固定摘要看板核心指标网格 (PRD 3.3 规范) */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <div className="bg-white p-3 rounded-md border border-slate-200/60 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">累计预算投入</span>
              <div className="mt-1">
                <span className="font-mono text-lg font-bold text-slate-900">${channel.spent.toLocaleString()}</span>
                <span className="font-mono text-[10px] text-slate-400 ml-1">USD</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1">配额完成 {channel.quotaPercent.toFixed(1)}%</span>
            </div>

            <div className="bg-white p-3 rounded-md border border-slate-200/60 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">撬动 GMV 流水</span>
              <div className="mt-1">
                <span className="font-mono text-lg font-bold text-blue-600">${channel.gmv.toLocaleString()}</span>
                <span className="font-mono text-[10px] text-blue-600 ml-0.5">.00</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
                <span className="material-symbols-outlined text-[13px]">trending_up</span> 环比 +18.4%
              </span>
            </div>

            <div className="bg-white p-3 rounded-md border border-slate-200/60 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">综合投放 ROI</span>
              <div className="mt-1">
                <span className="font-mono text-lg font-bold text-emerald-600">{channel.roi}</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1">超预期 212%</span>
            </div>

            <div className="bg-white p-3 rounded-md border border-slate-200/60 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">累计首单用户</span>
              <div className="mt-1">
                <span className="font-mono text-lg font-bold text-slate-900">{channel.tradingUsers.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 ml-1">人</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1">验卡通过率 {channel.verificationPassRate}</span>
            </div>

            <div className="bg-white p-3 rounded-md border border-slate-200/60 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">平均首单 CAC</span>
              <div className="mt-1">
                <span className="font-mono text-lg font-bold text-slate-900">${channel.cac.toFixed(2)}</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium mt-1">行业均值 $3.50 ↓47%</span>
            </div>

            <div className="bg-white p-3 rounded-md border border-slate-200/60 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">客户生命周期 LTV</span>
              <div className="mt-1">
                <span className="font-mono text-lg font-bold text-indigo-600">${channel.ltv.toFixed(2)}</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1">LTV/CAC 达 31.8x</span>
            </div>
          </div>
        </div>

      {/* 5 大场景化 Tab 导航 (按 PRD 3.3 固化) */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/80 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">overview</span>
          <span>01 渠道概况</span>
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'links'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">link</span>
          <span>02 渠道链接 (追踪参数生成器)</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-200 font-mono text-[10px] text-slate-600">
            {links.length}条
          </span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">groups</span>
          <span>03 用户数据 (归因注册用户穿透)</span>
        </button>
        <button
          onClick={() => setActiveTab('funnel')}
          className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'funnel'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">filter_alt</span>
          <span>04 转化漏斗 (访问→注册→首单→复购)</span>
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'campaigns'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">loyalty</span>
          <span>05 关联活动 (当前挂载活动与专属加价券)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>
      </div>

      {/* Tab 1: 渠道概况 */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            {/* 左侧主区域 (8列) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
              {/* 模块 A: 核心转化漏斗微缩视图 */}
              <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">waterfall_chart</span>
                    <span className="font-semibold text-xs text-slate-900">
                      模块 A: 全链路核心转化漏斗微缩视图
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">FUNNEL-FLOW-V2</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100">全周期累计</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100">归因窗口 30D</span>
                  </div>
                </div>

                {/* 阶梯漏斗数据行 */}
                <div className="flex flex-col gap-2 text-xs">
                  {/* 步骤 1 */}
                  <div className="flex flex-col gap-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200/80 font-bold">01</span>
                        <span className="font-semibold text-slate-900">短视频引流曝光 (Ad Impressions / UV)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">{channel.uv.toLocaleString()} UV</span>
                        <span className="font-mono text-[11px] text-slate-400 w-16 text-right">基准 100%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full w-full rounded-full"></div>
                    </div>
                  </div>

                  {/* 步骤 2 */}
                  <div className="flex flex-col gap-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200/80 font-bold">02</span>
                        <span className="font-semibold text-slate-900">平台落地注册激活 (Register & KYC)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">{channel.registered.toLocaleString()} 人</span>
                        <span className="font-mono text-[11px] text-emerald-600 font-bold w-16 text-right">{channel.registeredRate}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '48%' }}></div>
                    </div>
                  </div>

                  {/* 步骤 3 */}
                  <div className="flex flex-col gap-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200/80 font-bold">03</span>
                        <span className="font-semibold text-slate-900">卡种汇率首次试算 (Quote Calculator)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">11,960 人</span>
                        <span className="font-mono text-[11px] text-blue-600 font-bold w-16 text-right">{channel.quoteRate}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: '32%' }}></div>
                    </div>
                  </div>

                  {/* 步骤 4 */}
                  <div className="flex flex-col gap-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200/80 font-bold">04</span>
                        <span className="font-semibold text-slate-900">创建提单 (Card Code Submitted)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">5,420 笔</span>
                        <span className="font-mono text-[11px] text-blue-600 font-bold w-16 text-right">45.32%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full rounded-full" style={{ width: '22%' }}></div>
                    </div>
                  </div>

                  {/* 步骤 5 */}
                  <div className="flex flex-col gap-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200/80 font-bold">05</span>
                        <span className="font-semibold text-slate-900">首单核销完成并出金结算 (First Order Settled)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-emerald-600">{channel.tradingUsers.toLocaleString()} 人</span>
                        <span className="font-mono text-[11px] text-emerald-600 font-bold w-16 text-right">77.68%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '17%' }}></div>
                    </div>
                  </div>

                  {/* 步骤 6 */}
                  <div className="flex flex-col gap-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200/80 font-bold">06</span>
                        <span className="font-semibold text-slate-900">30天内二次复购 (Repeat Transactions)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-purple-700">2,650 人</span>
                        <span className="font-mono text-[11px] text-purple-700 font-bold w-16 text-right">62.95%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: '11%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 模块 B: 渠道获客卡种偏好分布 */}
              <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">pie_chart</span>
                    <span className="font-semibold text-xs text-slate-900">
                      模块 B: 渠道获客卡种偏好分布 (Top Gift Cards Distribution)
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">TOTAL GMV ${channel.gmv.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-semibold text-slate-400">TOP 1 / 46.0%</span>
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      </div>
                      <div className="font-semibold text-slate-900 text-xs mt-1">Apple Gift Card</div>
                      <div className="font-mono text-[10px] text-slate-400">US / UK 区域卡源</div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60">
                      <div className="font-mono text-base font-bold text-slate-900">$114,310</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>平均面额 $100</span>
                        <span className="text-emerald-600 font-bold">高流动性</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-semibold text-slate-400">TOP 2 / 28.0%</span>
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      </div>
                      <div className="font-semibold text-slate-900 text-xs mt-1">Steam Wallet</div>
                      <div className="font-mono text-[10px] text-slate-400">Global / 综合货币</div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60">
                      <div className="font-mono text-base font-bold text-slate-900">$69,580</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>平均面额 $50</span>
                        <span className="text-blue-600 font-bold">高频提交</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-semibold text-slate-400">TOP 3 / 14.0%</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      </div>
                      <div className="font-semibold text-slate-900 text-xs mt-1">Google Play</div>
                      <div className="font-mono text-[10px] text-slate-400">US / 实体与电子码</div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60">
                      <div className="font-mono text-base font-bold text-slate-900">$34,790</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>平均面额 $25</span>
                        <span className="text-slate-500 font-bold">审核平稳</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-semibold text-slate-400">TOP 4 / 12.0%</span>
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      </div>
                      <div className="font-semibold text-slate-900 text-xs mt-1">Razer & Vanilla</div>
                      <div className="font-mono text-[10px] text-slate-400">Visa预付 / 游戏金币</div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60">
                      <div className="font-mono text-base font-bold text-slate-900">$29,820</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>平均面额 $200</span>
                        <span className="text-rose-600 font-bold">需二次审核</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧辅助面板 (4列) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
              {/* 模块 C: 渠道投放预算与 ROI 财务模型 */}
              <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">account_balance_wallet</span>
                    <span className="font-semibold text-xs text-slate-900">模块 C: 预算与财务表现</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500">NG-Q3</span>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500">预算消耗水位</span>
                      <span className="font-mono font-bold text-slate-900">
                        ${channel.spent.toLocaleString()} / ${channel.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${channel.quotaPercent}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between mt-1 font-mono text-[11px] text-slate-400">
                      <span>已支出 {channel.quotaPercent.toFixed(1)}%</span>
                      <span className="text-emerald-600 font-bold">剩余额度 ${(channel.budget - channel.spent).toLocaleString()}.00</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-mono text-[10px] text-slate-400 uppercase">日均消耗</span>
                      <div className="font-mono font-bold text-slate-900 mt-1">$260.00 /天</div>
                      <span className="text-[10px] text-slate-400">匀速消耗中</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-mono text-[10px] text-slate-400 uppercase">预估剩余周期</span>
                      <div className="font-mono font-bold text-blue-600 mt-1">约 8.4 天</div>
                      <span className="text-[10px] text-slate-400">按当前速率</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">平均单客 CAC</span>
                      <span className="font-mono font-bold text-emerald-600">${channel.cac.toFixed(2)} USD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">首单均客单价</span>
                      <span className="font-mono font-bold text-slate-900">$59.02 USD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">平台毛利留存</span>
                      <span className="font-mono font-bold text-blue-600">6.4% ($15,904)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 模块 D: 追踪短链与二维码快捷分发卡 */}
              <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">share</span>
                    <span className="font-semibold text-xs text-slate-900">模块 D: 追踪短链与权益卡</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200/60">
                    ACTIVE
                  </span>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">默认追踪分发短链</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={channel.fullUrl}
                        className="flex-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 outline-none select-all"
                      />
                      <button
                        onClick={() => copyToClipboard(channel.fullUrl, '默认追踪短链')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors cursor-pointer"
                      >
                        复制
                      </button>
                    </div>
                  </div>

                  {/* 专属加价补贴机制 */}
                  <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100 flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-blue-700 font-semibold text-xs">
                      <span className="material-symbols-outlined text-[16px]">redeem</span>
                      <span>挂载权益: 专属加价券</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      新客首单核销金额满 <strong className="text-slate-900 font-mono">$100 USD</strong> 触发实时补贴，结算汇率自动上浮 <strong className="text-emerald-700 font-mono">+$2.00 USD</strong>。
                    </p>
                    <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-slate-400 border-t border-blue-100/60 mt-1">
                      <span>券批次号: VC-NG-TK-08</span>
                      <span className="text-emerald-700 font-bold">已发放 4,210 张</span>
                    </div>
                  </div>

                  {/* 二维码与移动落地预览 */}
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-16 h-16 bg-white p-1 rounded-md border border-slate-200 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm11-2h2v2h-2v-2zm-3 2h2v4h-2v-4zm6 0h2v2h-2v-2zm-3 4h4v2h-4v-2zm3 2h2v2h-2v-2zm-6-2h2v2h-2v-2zM4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4z"></path>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 text-xs">移动扫码即刻体验</span>
                      <span className="text-[11px] text-slate-400">支持原生 TikTok In-App Browser 唤醒</span>
                      <button
                        onClick={() => onShowToast('已启动二维码矢量原图打包下载')}
                        className="text-[11px] text-blue-600 hover:underline mt-1 text-left cursor-pointer"
                      >
                        下载高清矢量码 (SVG/PNG)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部挂载该渠道归因的最新 5 笔首单交易穿透流水预览 */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">receipt_long</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-slate-900">
                    渠道归因首单实时穿透流水 (最新 5 笔验证通过订单)
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-500">
                    REAL-TIME FEED
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="font-mono text-[11px]">系统同步间隔: 3s</span>
                <button
                  onClick={() => setActiveTab('users')}
                  className="text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                >
                  <span>穿透查看全部 4,210 笔订单</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="h-8 bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase border-b border-slate-200">
                    <th className="px-3">卡单编号 (Order ID)</th>
                    <th className="px-3">归因用户 (Sub-User)</th>
                    <th className="px-3">卡种与面额 (Card Spec)</th>
                    <th className="px-3 text-right">交易结算金额 (Settled)</th>
                    <th className="px-3 text-right">加价券补贴 (Bonus)</th>
                    <th className="px-3 text-center">核销状态 (Status)</th>
                    <th className="px-3 text-right">归因核销时间 (UTC+1)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {orders.map(order => (
                    <tr key={order.id} className="h-10 hover:bg-slate-50 transition-colors">
                      <td className="px-3 font-mono font-bold text-blue-600">{order.orderNo}</td>
                      <td className="px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-mono text-[10px] text-slate-600">
                            {order.userTag}
                          </span>
                          <span className="text-slate-800 font-medium">{order.userName}</span>
                          <span className="font-mono text-[11px] text-slate-400">({order.phone})</span>
                        </div>
                      </td>
                      <td className="px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-700">
                          {order.cardSpec}
                        </span>
                      </td>
                      <td className="px-3 text-right font-mono font-bold text-slate-900">{order.settledAmount}</td>
                      <td className="px-3 text-right font-mono font-bold text-emerald-600">{order.bonusAmount}</td>
                      <td className="px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[10px] font-semibold border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{order.status}</span>
                        </span>
                      </td>
                      <td className="px-3 text-right font-mono text-slate-400">{order.timeUtc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 渠道链接 */}
      {activeTab === 'links' && (
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">渠道追踪短链与物料管理</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                支持为不同广告素材、KOL博主分配独立的 UTM 参数短链，独立监控各链接的点击曝光与转化收益。
              </p>
            </div>
            <button
              onClick={onOpenLinkModal}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>+ 生成新链接</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase border-b border-slate-200 h-9">
                  <th className="px-3 font-sans">链接用途说明</th>
                  <th className="px-3 font-sans">UTM 参数组合</th>
                  <th className="px-3 font-sans">完整落地追踪短链</th>
                  <th className="px-3 font-sans text-right">点击访问 UV</th>
                  <th className="px-3 font-sans text-right">促成首单</th>
                  <th className="px-3 font-sans text-right">转化率</th>
                  <th className="px-3 font-sans text-center">状态</th>
                  <th className="px-3 font-sans text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {links.map(l => (
                  <tr key={l.id} className="h-11 hover:bg-slate-50 transition-colors">
                    <td className="px-3 font-sans font-semibold text-slate-900">{l.name}</td>
                    <td className="px-3 text-slate-500 text-[11px]">
                      s={l.utmSource}&m={l.utmMedium}&c={l.utmCampaign}
                    </td>
                    <td className="px-3 select-all text-blue-600 text-[11px]">
                      <span className="truncate max-w-[280px] inline-block">{l.fullUrl}</span>
                    </td>
                    <td className="px-3 text-right font-bold text-slate-900">{l.clicks.toLocaleString()}</td>
                    <td className="px-3 text-right font-bold text-emerald-600">{l.conversions.toLocaleString()}</td>
                    <td className="px-3 text-right font-bold text-slate-700">{l.convRate}</td>
                    <td className="px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        正常分发
                      </span>
                    </td>
                    <td className="px-3 text-right font-sans">
                      <button
                        onClick={() => copyToClipboard(l.fullUrl, l.name)}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      >
                        复制链接
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: 用户数据 */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">该渠道归因注册出卡用户明细</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                基于首触点归因指纹与手机号，穿透查看出卡用户的真实交易与复购周期。
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="搜索姓名 / UID / 手机号..."
                className="w-52 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none"
              />
              <select
                value={selectedKycFilter}
                onChange={e => setSelectedKycFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none cursor-pointer"
              >
                <option value="">全部认证状态</option>
                <option value="KYC已认证">KYC已认证</option>
                <option value="基础认证">基础认证</option>
                <option value="KYC高级">KYC高级</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase border-b border-slate-200 h-9">
                  <th className="px-3 font-sans">用户UID / 姓名</th>
                  <th className="px-3 font-sans">认证级别</th>
                  <th className="px-3 font-sans">首单卡种</th>
                  <th className="px-3 font-sans text-right">出卡笔数</th>
                  <th className="px-3 font-sans text-right">累计交易 GMV</th>
                  <th className="px-3 font-sans text-center">复购状态</th>
                  <th className="px-3 font-sans text-center">风控安全分</th>
                  <th className="px-3 font-sans text-right">注册时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredUsers.map(u => (
                  <tr key={u.uid} className="h-10 hover:bg-slate-50 transition-colors">
                    <td className="px-3 font-sans">
                      <span className="font-bold text-blue-600 font-mono">{u.uid}</span>
                      <span className="ml-1 text-slate-700 font-medium">{u.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{u.phone}</span>
                    </td>
                    <td className="px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-medium">
                        {u.kycStatus}
                      </span>
                    </td>
                    <td className="px-3 font-sans text-slate-700">{u.firstCard}</td>
                    <td className="px-3 text-right font-bold text-slate-900">{u.totalOrders} 笔</td>
                    <td className="px-3 text-right font-bold text-emerald-600">${u.totalGmv.toFixed(2)}</td>
                    <td className="px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.repeatBuyer ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.repeatBuyer ? '已复购 3+次' : '首单新客'}
                      </span>
                    </td>
                    <td className="px-3 text-center">
                      <span className="font-bold text-emerald-600">{u.riskScore} (低危)</span>
                    </td>
                    <td className="px-3 text-right text-slate-400 text-[11px]">{u.registeredTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: 转化漏斗 */}
      {activeTab === 'funnel' && (
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">节点流失分析与流转时长诊断</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              定位各阶段折损瓶颈，持续降低获客 CAC 并提升首单履约转化。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">点击到注册中位时长</span>
              <div className="font-mono text-xl font-bold text-slate-900 mt-1">42 秒</div>
              <span className="text-[11px] text-emerald-600 font-medium">极速完成 短信验证极简</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">注册到首次试算中位时长</span>
              <div className="font-mono text-xl font-bold text-slate-900 mt-1">3.2 分钟</div>
              <span className="text-[11px] text-blue-600 font-medium">即时引导 报价试算活跃</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">试算到首单提单中位时长</span>
              <div className="font-mono text-xl font-bold text-slate-900 mt-1">6.5 分钟</div>
              <span className="text-[11px] text-purple-600 font-medium">配合专属加价券转化极高</span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2.5 text-xs text-slate-700">
            <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">tips_and_updates</span>
            <div>
              <span className="font-bold text-slate-900">优化诊断结论:</span>
              <p className="mt-0.5 leading-relaxed">
                该渠道在“试算汇率 → 提交卡单”阶段流失主要源自实体小票清晰度校验。建议在落地页顶部增加“西非热销卡种实体凭证拍摄规范示意图”，预计可再挽回约 8%~12% 的流失提单。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: 关联活动 */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">当前挂载活动与专属加价券</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                渠道专属利益点配置，提升新客首单出卡决策速度。
              </p>
            </div>
            <button
              onClick={() => onShowToast('已调起权益加价券绑定面板')}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>绑定新活动权益</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {campaigns.map(c => (
              <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-semibold border border-emerald-200/60">
                      生效中
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-blue-600 font-medium">券批次: {c.voucherCode}</div>
                  <p className="mt-2 text-slate-600 text-[11px] leading-relaxed">{c.rule}</p>
                  <div className="mt-1 font-semibold text-emerald-700 text-[11px]">{c.benefit}</div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between font-mono text-[11px] text-slate-500">
                  <span>已领: <strong className="text-slate-900">{c.claimedCount}</strong> 张</span>
                  <span>已核销: <strong className="text-emerald-700">{c.usedCount}</strong> 次</span>
                  <span>消耗: <strong className="text-slate-900">${c.spent}</strong> / ${c.budgetCap}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
