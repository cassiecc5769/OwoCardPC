import React, { useState, useMemo } from 'react';
import { NavPath } from '../../types';

interface MyMessagesViewProps {
  onNavigate: (path: NavPath) => void;
}

// ============================================================================
// 规定消息类型：任务 ｜ 异常 ｜ 系统通知 ｜ 公告 ｜ @消息
// ============================================================================
export type MessageCategory = 'task' | 'anomaly' | 'system_notice' | 'announcement' | 'mention';

export interface BusinessObjectBinding {
  type: '卡单' | '异常' | '商户' | '财务' | '报价' | '规则';
  id: string; // 业务对象唯一识别码
  name: string; // 业务对象名称描述
  targetPath: NavPath; // 点击直接进入对应页面
  targetPageTitle: string; // 对应页面名称
}

export interface PlatformMessageItem {
  id: string;
  category: MessageCategory;
  categoryLabel: string;
  categoryBadgeClass: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
  priority: 'high' | 'medium' | 'normal';
  // 必须绑定业务对象
  businessObject: BusinessObjectBinding;
  sender?: {
    name: string;
    role: string;
    avatarBg: string;
  };
}

const INITIAL_MESSAGES: PlatformMessageItem[] = [
  // 1. 任务 (Task)
  {
    id: 'MSG-TASK-01',
    category: 'task',
    categoryLabel: '任务',
    categoryBadgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    title: '【卡单待复核】Apple US $500 大额实体卡需人工终审核销',
    content: '大客户 David_Trader 提交卡单，官方 Card Check 已验证通过，因金额超 $300 触发平台大客人工复核放款流程，请尽快确认结清。',
    time: '5 分钟前',
    read: false,
    priority: 'high',
    businessObject: {
      type: '卡单',
      id: 'KD-20261005-9921',
      name: 'Apple Gift Card US $500.00 (大客户专线)',
      targetPath: 'workbench-cs-orders',
      targetPageTitle: '卡单作业 · 待人工确认',
    },
  },
  {
    id: 'MSG-TASK-02',
    category: 'task',
    categoryLabel: '任务',
    categoryBadgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    title: '【放款出金】今日 14:00 待结算出金批次已生成，请财务复核',
    content: '共 42 笔商户结算申请已过日终对账轧差，总额 ¥568,240.00，待财务审核并在链上出金。',
    time: '25 分钟前',
    read: false,
    priority: 'high',
    businessObject: {
      type: '财务',
      id: 'BATCH-SETTLE-20261005-01',
      name: '42笔商户日结出金批次 (¥568,240)',
      targetPath: 'platform-settlement',
      targetPageTitle: '财务结算 · 结算管理',
    },
  },

  // 2. 异常 (Anomaly)
  {
    id: 'MSG-ANOMALY-01',
    category: 'anomaly',
    categoryLabel: '异常',
    categoryBadgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    title: '【商户异常】商户「极客卡业」质押额度耗尽打满，产生拒单滞留',
    content: '极客卡业可用质押金已降至 ¥3,200（安全线下），导致 28 笔美区在途卡单无法自动撮合分配，需紧急介入催充或临时授信。',
    time: '12 分钟前',
    read: false,
    priority: 'high',
    businessObject: {
      type: '商户',
      id: 'MA-20261005-01',
      name: '极客卡业 (美区专线) · 额度耗尽',
      targetPath: 'workbench-cs-merchant',
      targetPageTitle: '客服工作台 · 商户异常',
    },
  },
  {
    id: 'MSG-ANOMALY-02',
    category: 'anomaly',
    categoryLabel: '异常',
    categoryBadgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    title: '【对账异常】Steam Wallet 存在 ¥800 账实单边重复扣减',
    content: '系统日终四账勾对发现商户极速易换存在一笔重复扣点单据，差额 ¥800 阻断该商户周结，需发起双向调账冲正。',
    time: '45 分钟前',
    read: false,
    priority: 'high',
    businessObject: {
      type: '财务',
      id: 'RECON-DIFF-99201',
      name: '极速易换对账重复扣减 ¥800',
      targetPath: 'financial-reconciliation',
      targetPageTitle: '财务结算 · 财务对账',
    },
  },
  {
    id: 'MSG-ANOMALY-03',
    category: 'anomaly',
    categoryLabel: '异常',
    categoryBadgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    title: '【报价劣势】Apple US 美区收卡折率低于外部大盘均价 1.5pp',
    content: '监控机器人巡检发现外部主流竞品收购折率达到 84.5%，我方商户仅 83.0%，导致今日进卡转化率下滑 3.2pp。',
    time: '1 小时前',
    read: true,
    priority: 'medium',
    businessObject: {
      type: '报价',
      id: 'QUOTE-ANOMALY-AP-US',
      name: 'Apple Gift Card US 折率倒挂',
      targetPath: 'quote-anomalies',
      targetPageTitle: '报价运营 · 报价异常',
    },
  },

  // 3. 系统通知 (System Notice)
  {
    id: 'MSG-NOTICE-01',
    category: 'system_notice',
    categoryLabel: '系统通知',
    categoryBadgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: '【风控拦截】Card Check 预检拦截 3 笔涉嫌撞库卡券',
    content: '风控预检引擎于 13:40 成功阻断用户提交的重复测试卡密，相关 SHA-256 哈希已存证入库，未造成资金损失。',
    time: '2 小时前',
    read: true,
    priority: 'normal',
    businessObject: {
      type: '异常',
      id: 'RISK-BLOCK-09214',
      name: 'Card Check 撞库黑名单拦截记录',
      targetPath: 'abnormal-cards',
      targetPageTitle: '风控管理 · 异常卡',
    },
  },
  {
    id: 'MSG-NOTICE-02',
    category: 'system_notice',
    categoryLabel: '系统通知',
    categoryBadgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: '【自动恢复】商户「万商网络」补充 50,000 USDT 质押金，接单已解冻',
    content: '链上充值确认完成，系统已自动恢复万商网络的撮合承揽权重，在途排队订单已重新分配。',
    time: '3 小时前',
    read: true,
    priority: 'normal',
    businessObject: {
      type: '商户',
      id: 'M-1011',
      name: '万商合众网络 (商户积点账户)',
      targetPath: 'points-account',
      targetPageTitle: '财务结算 · 账户管理',
    },
  },

  // 4. 公告 (Announcement)
  {
    id: 'MSG-ANNOUNCE-01',
    category: 'announcement',
    categoryLabel: '公告',
    categoryBadgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    title: '【平台公告】OWO 平台作业端 PRD V9.0 架构升级正式上线',
    content: '全量 10 大核心顶级模块已全面就绪，工作台细分为运营工作台、客服工作台、财务工作台与在线客服，实行双岗审批与全链路存证。',
    time: '今天 09:00',
    read: true,
    priority: 'normal',
    businessObject: {
      type: '规则',
      id: 'PLATFORM-V9-RELEASE',
      name: '平台作业端 V9.0 权限与业务规则矩阵',
      targetPath: 'basic-config',
      targetPageTitle: '平台配置 · 基础配置',
    },
  },

  // 5. @消息 (Mention)
  {
    id: 'MSG-MENTION-01',
    category: 'mention',
    categoryLabel: '@消息',
    categoryBadgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    title: '@张立(运营) 邀请你协同处理：Apple 美区商户调价方案',
    content: '“王主管，竞品美区价格持续上拉，建议我们针对优质商户极客卡业给予 0.3pp 平台贴息，尽快抢占晚间高峰出卡量！”',
    time: '35 分钟前',
    read: false,
    priority: 'high',
    sender: {
      name: '张立',
      role: '报价运营专员',
      avatarBg: 'bg-blue-600',
    },
    businessObject: {
      type: '报价',
      id: 'PROB-01',
      name: 'Apple US 美区礼品卡报价竞争力下滑',
      targetPath: 'quote-management',
      targetPageTitle: '报价运营 · 报价管理',
    },
  },
  {
    id: 'MSG-MENTION-02',
    category: 'mention',
    categoryLabel: '@消息',
    categoryBadgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    title: '@李强(客服主管) 请财务复核：争议单垫付损失审批 ¥3,500',
    content: '“财务陈专责，订单 KD-20261005-9650 碰卡争议仲裁已出具官方存证，商户存在恶意拖延，已向出卡用户先行垫付，请在损失审批中签字核准。”',
    time: '1 小时前',
    read: false,
    priority: 'high',
    sender: {
      name: '李强',
      role: '运营客服主管',
      avatarBg: 'bg-emerald-600',
    },
    businessObject: {
      type: '财务',
      id: 'LOSS-202610-09',
      name: '争议单 KD-9650 平台先行垫付损失审批',
      targetPath: 'abnormal-finance',
      targetPageTitle: '财务结算 · 异常账务',
    },
  },
];

export const MyMessagesView: React.FC<MyMessagesViewProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<PlatformMessageItem[]>(INITIAL_MESSAGES);
  const [activeCategory, setActiveCategory] = useState<'all' | MessageCategory>('all');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 点击消息：直接进入对应卡单、异常、商户或财务对象
  const handleOpenBusinessObject = (msg: PlatformMessageItem) => {
    // 标为已读
    setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, read: true } : m)));
    showToast(`正在直接进入关联${msg.businessObject.type}对象【${msg.businessObject.name}】...`);
    // 导航跳转
    onNavigate(msg.businessObject.targetPath);
  };

  // 一键全部已读
  const handleMarkAllRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
    showToast('已将当前所有消息标为已读');
  };

  // 单条切换已读未读
  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, read: !m.read } : m))
    );
  };

  // 过滤
  const filteredMessages = useMemo(() => {
    return messages
      .filter(m => {
        if (activeCategory !== 'all' && m.category !== activeCategory) return false;
        if (onlyUnread && m.read) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            m.title.toLowerCase().includes(q) ||
            m.content.toLowerCase().includes(q) ||
            m.businessObject.id.toLowerCase().includes(q) ||
            m.businessObject.name.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        // 未读排前
        if (!a.read && b.read) return -1;
        if (a.read && !b.read) return 1;
        return 0;
      });
  }, [messages, activeCategory, onlyUnread, searchQuery]);

  // 分类统计
  const counts = useMemo(() => {
    return {
      all: messages.length,
      task: messages.filter(m => m.category === 'task').length,
      anomaly: messages.filter(m => m.category === 'anomaly').length,
      system_notice: messages.filter(m => m.category === 'system_notice').length,
      announcement: messages.filter(m => m.category === 'announcement').length,
      mention: messages.filter(m => m.category === 'mention').length,
      unread: messages.filter(m => !m.read).length,
    };
  }, [messages]);

  return (
    <div className="flex flex-col gap-5 flex-1 w-full max-w-[1400px] mx-auto antialiased text-slate-800 pb-16">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* 顶栏 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <span className="material-symbols-outlined text-[22px]">notifications_active</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">我的消息中心</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                每条消息强绑定业务对象 · 点击直达
              </span>
              {counts.unread > 0 && (
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-500 text-white font-mono font-bold">
                  {counts.unread} 条未读
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              聚合全平台任务待办、实时异常告警、系统运维通知、大盘业务公告与跨岗位 @ 协同消息
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-slate-400">done_all</span>
            <span>全部标为已读</span>
          </button>
        </div>
      </div>

      {/* 统一标准 Top Tab Bar: 消息分类与读取状态 */}
      <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-2 pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* 消息类型 Tab (任务 ｜ 异常 ｜ 系统通知 ｜ 公告 ｜ @消息) */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'all', label: '全部消息', icon: 'mark_email_unread', count: counts.all },
            { id: 'task', label: '任务待办', icon: 'task', count: counts.task },
            { id: 'anomaly', label: '异常告警', icon: 'error', count: counts.anomaly },
            { id: 'system_notice', label: '系统通知', icon: 'notifications', count: counts.system_notice },
            { id: 'announcement', label: '大盘公告', icon: 'campaign', count: counts.announcement },
            { id: 'mention', label: '@协同消息', icon: 'alternate_email', count: counts.mention }
          ].map(tab => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-4 py-3 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                  isActive
                    ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
                    isActive ? 'bg-blue-100 text-[#004ac6] font-semibold' : 'bg-slate-100 text-slate-600 font-medium'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 右侧读取过滤状态切换 */}
        <div className="flex items-center gap-1 pb-2 md:pb-0 px-2 shrink-0">
          <button
            type="button"
            onClick={() => setOnlyUnread(!onlyUnread)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
              onlyUnread
                ? 'bg-blue-50 border-blue-200 text-[#004ac6]'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{onlyUnread ? 'filter_alt' : 'filter_alt_off'}</span>
            <span>{onlyUnread ? '仅看未读' : '包含已读'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono bg-rose-100 text-rose-700">
              {counts.unread} 未读
            </span>
          </button>
        </div>
      </section>

      {/* 搜索与高级过滤栏 */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-[18px]">manage_search</span>
          <span className="text-xs font-semibold text-slate-700">消息搜索与筛查</span>
        </div>

        {/* 搜索框与过滤 */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyUnread}
              onChange={e => setOnlyUnread(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>仅看未读 ({counts.unread})</span>
          </label>

          <div className="relative w-64">
            <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-2">
              search
            </span>
            <input
              type="text"
              placeholder="搜索消息内容、卡单号或商户..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 消息列表卡片流 (每条消息绑定业务对象) */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            暂无匹配的消息通知
          </div>
        ) : (
          filteredMessages.map(msg => {
            const isUnread = !msg.read;
            const obj = msg.businessObject;

            return (
              <div
                key={msg.id}
                onClick={() => handleOpenBusinessObject(msg)}
                className={`bg-white rounded-xl p-4 border transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md hover:border-blue-300 ${
                  isUnread
                    ? 'border-blue-200 bg-blue-50/15 shadow-2xs'
                    : 'border-slate-200/90'
                }`}
              >
                {/* 消息主体 */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* 未读红点或分类图标 */}
                  <div className="mt-1 relative shrink-0">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        msg.category === 'task'
                          ? 'bg-blue-100 text-blue-700'
                          : msg.category === 'anomaly'
                          ? 'bg-rose-100 text-rose-700'
                          : msg.category === 'system_notice'
                          ? 'bg-emerald-100 text-emerald-700'
                          : msg.category === 'announcement'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {msg.category === 'task'
                          ? 'assignment'
                          : msg.category === 'anomaly'
                          ? 'warning'
                          : msg.category === 'system_notice'
                          ? 'notifications'
                          : msg.category === 'announcement'
                          ? 'campaign'
                          : 'alternate_email'}
                      </span>
                    </span>
                    {isUnread && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </div>

                  {/* 文本内容 */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold border font-mono ${msg.categoryBadgeClass}`}
                      >
                        {msg.categoryLabel}
                      </span>
                      <h3
                        className={`text-xs font-bold truncate ${
                          isUnread ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {msg.title}
                      </h3>
                      {msg.sender && (
                        <span className="text-[10.5px] text-slate-500 font-medium">
                          来自: {msg.sender.name} ({msg.sender.role})
                        </span>
                      )}
                      <span className="text-[10.5px] text-slate-400 font-mono ml-auto">
                        {msg.time}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {msg.content}
                    </p>

                    {/* 必须绑定的业务对象卡片 */}
                    <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs group-hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 shrink-0">
                          绑定业务对象 · {obj.type}
                        </span>
                        <span className="font-mono font-bold text-blue-700 shrink-0">
                          {obj.id}
                        </span>
                        <span className="text-slate-600 truncate">{obj.name}</span>
                      </div>

                      <div className="flex items-center gap-1 text-blue-600 font-semibold shrink-0 ml-3 text-[11px]">
                        <span>进入【{obj.targetPageTitle}】</span>
                        <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右侧标记动作 */}
                <div className="flex items-center gap-2 shrink-0 md:self-center">
                  <button
                    type="button"
                    onClick={e => handleToggleRead(msg.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title={isUnread ? '标为已读' : '标为未读'}
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      {isUnread ? 'drafts' : 'mark_email_unread'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
