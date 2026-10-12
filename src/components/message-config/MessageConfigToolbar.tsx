import React from 'react';
import { MessageDomain, ReceiverRole } from './types';

export type ActiveMainTab = 'rules' | 'templates' | 'logs';

interface MessageConfigToolbarProps {
  activeTab: ActiveMainTab;
  onTabChange: (tab: ActiveMainTab) => void;
  rulesCount: number;
  templatesCount: number;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  selectedDomain: MessageDomain;
  onDomainChange: (domain: MessageDomain) => void;
  selectedReceiver: ReceiverRole;
  onReceiverChange: (receiver: ReceiverRole) => void;
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
  onReset: () => void;
}

export const MessageConfigToolbar: React.FC<MessageConfigToolbarProps> = ({
  activeTab,
  onTabChange,
  rulesCount,
  templatesCount,
  searchKeyword,
  onSearchChange,
  selectedDomain,
  onDomainChange,
  selectedReceiver,
  onReceiverChange,
  selectedChannel,
  onChannelChange,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 px-4 pt-1 overflow-x-auto">
        <div className="flex items-center gap-1 flex-wrap">
          {[
            {
              id: 'rules',
              label: '事件规则治理 (Event Trigger Rules)',
              icon: 'alt_route',
              badge: `${rulesCount}项`,
              badgeClass: 'bg-blue-100 text-blue-800'
            },
            {
              id: 'templates',
              label: '消息模板与变量池 (Templates & Variable Pool)',
              icon: 'format_shapes',
              badge: `${templatesCount}套`,
              badgeClass: 'bg-purple-100 text-purple-800'
            },
            {
              id: 'logs',
              label: '投递流水审计 (Dispatch Logs)',
              icon: 'history_edu'
            }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id as ActiveMainTab)}
                className={`px-4 py-3 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
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
                {tab.id === 'logs' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-500 pr-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 运行中
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> 频控限流中
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> 异常熔断
          </span>
        </div>
      </div>

      {/* Filter Tools Row */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs px-4 pb-4">
        {/* Keyword Search */}
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索事件代码 (EVT-*) / 触发源 / 模板ID..."
            className="w-full h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
            search
          </span>
          {searchKeyword && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Domain Pills */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => onDomainChange('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              selectedDomain === 'all'
                ? 'font-semibold bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            全部
          </button>
          <button
            type="button"
            onClick={() => onDomainChange('trade')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              selectedDomain === 'trade'
                ? 'font-semibold bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            交易事件
          </button>
          <button
            type="button"
            onClick={() => onDomainChange('aftersale')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              selectedDomain === 'aftersale'
                ? 'font-semibold bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            售后事件
          </button>
          <button
            type="button"
            onClick={() => onDomainChange('finance')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              selectedDomain === 'finance'
                ? 'font-semibold bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            财务事件
          </button>
          <button
            type="button"
            onClick={() => onDomainChange('member')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              selectedDomain === 'member'
                ? 'font-semibold bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            运营会员
          </button>
        </div>

        {/* Receiver Dropdown */}
        <select
          value={selectedReceiver}
          onChange={(e) => onReceiverChange(e.target.value as ReceiverRole)}
          className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">全部接收对象</option>
          <option value="seller">出卡用户 (Seller)</option>
          <option value="merchant">接单商户 (Merchant)</option>
          <option value="ops">平台运营与调度 (Ops)</option>
          <option value="cs">平台风控与客服 (CS)</option>
          <option value="finance">财务出纳 (Finance)</option>
        </select>

        {/* Channel Dropdown */}
        <select
          value={selectedChannel}
          onChange={(e) => onChannelChange(e.target.value)}
          className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">全通道生效状态</option>
          <option value="ws">WebSocket 秒推</option>
          <option value="sms">短信 SMS 专线</option>
          <option value="dingtalk">企微 / 钉钉机器人</option>
          <option value="webhook">Webhook 开发者回调</option>
          <option value="tts">语音电话 TTS 告警</option>
          <option value="email">邮件通知</option>
        </select>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          title="刷新重置筛选"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
        </button>
      </div>
    </div>
  );
};
