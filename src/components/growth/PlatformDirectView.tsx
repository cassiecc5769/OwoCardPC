import React, { useState } from 'react';
import { NavPath } from '../../types';

interface PlatformDirectViewProps {
  onNavigate?: (path: NavPath) => void;
}

// 直推任务
interface DirectTask {
  id: string;
  name: string;
  targetGroup: string;
  targetCount: number;
  brand: string;
  country: string;
  channelMethod: 'SMS' | 'APP_PUSH' | 'DIRECT_LINK' | 'WHATSAPP_OFFICIAL';
  aiPromoterName: string;
  targetGoal: '首单转化' | '沉睡召回' | '大额变现' | '促复购';
  status: 'running' | 'completed' | 'paused';
  sentCount: number;
  aiEngagedCount: number;
  registeredCount: number;
  firstOrderCount: number;
  directGmv: string;
  manager: string;
  startTime: string;
  endTime: string;
}

// 直推专属 AI 推广员
interface DirectPromoter {
  id: string;
  name: string;
  avatarBg: string;
  avatarIcon: string;
  specialtyBrand: string;
  language: string;
  boundTasksCount: number;
  todaySessions: number;
  conversionRate: string;
  independentRate: string;
  status: 'active' | 'idle';
  welcomeScript: string;
  nextActionStrategy: string;
}

// 直推用户会话
interface DirectSession {
  id: string;
  visitorId: string;
  boundUserId?: string;
  phoneMasked: string;
  sourceType: 'PLATFORM_DIRECT';
  taskName: string;
  promoterName: string;
  userStage: '线索触达' | '咨询中' | '高意向' | '已首单' | '待接管';
  lastMessageTime: string;
  lastMessageText: string;
  intentTag: string;
  estimatedGmv: string;
  isTakeoverNeeded: boolean;
  messages: Array<{
    sender: 'user' | 'ai' | 'agent';
    text: string;
    time: string;
  }>;
}

export const PlatformDirectView: React.FC<PlatformDirectViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'promoters' | 'sessions' | 'users' | 'takeover' | 'analytics'>('tasks');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // 创建直推任务弹窗
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    name: '',
    targetGroup: '注册30天未首单用户 (3,280人)',
    brand: 'Apple',
    country: 'US',
    channelMethod: 'SMS' as const,
    aiPromoterName: 'Apple-US-Agent (直推专属AI)',
    targetGoal: '首单转化' as const,
    manager: '运营A (陈峰)',
    startTime: '2026-10-05 10:00',
    endTime: '2026-10-12 24:00',
  });

  // 选中的对话抽屉
  const [activeSession, setActiveSession] = useState<DirectSession | null>(null);
  const [replyInput, setReplyInput] = useState('');

  // 1. 直推任务列表
  const [tasks, setTasks] = useState<DirectTask[]>([
    {
      id: 'DIR-202610-01',
      name: 'Apple 未首单沉睡用户加价召回',
      targetGroup: '注册30天未首单用户',
      targetCount: 3280,
      brand: 'Apple',
      country: 'US',
      channelMethod: 'SMS',
      aiPromoterName: 'Apple-US-Agent',
      targetGoal: '首单转化',
      status: 'running',
      sentCount: 3280,
      aiEngagedCount: 1420,
      registeredCount: 0, // 已注册用户召回
      firstOrderCount: 428,
      directGmv: '$38,600.00',
      manager: '运营A (陈峰)',
      startTime: '2026-10-01 09:00',
      endTime: '2026-10-10 24:00',
    },
    {
      id: 'DIR-202610-02',
      name: 'Steam 全球代码卡大额直推计划',
      targetGroup: '历史出卡≥$500 高净值老客',
      targetCount: 1250,
      brand: 'Steam',
      country: 'Global',
      channelMethod: 'WHATSAPP_OFFICIAL',
      aiPromoterName: 'Steam-VIP-Promoter',
      targetGoal: '促复购',
      status: 'running',
      sentCount: 1250,
      aiEngagedCount: 890,
      registeredCount: 0,
      firstOrderCount: 312,
      directGmv: '$64,200.00',
      manager: '运营B (周丽)',
      startTime: '2026-10-02 10:00',
      endTime: '2026-10-15 24:00',
    },
    {
      id: 'DIR-202610-03',
      name: '线下门店意向未注册线索转化',
      targetGroup: '官网落地页留资新访客',
      targetCount: 980,
      brand: 'Sephora / Target',
      country: 'US',
      channelMethod: 'DIRECT_LINK',
      aiPromoterName: 'Retail-Direct-Bot',
      targetGoal: '首单转化',
      status: 'running',
      sentCount: 980,
      aiEngagedCount: 650,
      registeredCount: 286,
      firstOrderCount: 114,
      directGmv: '$18,400.00',
      manager: '运营A (陈峰)',
      startTime: '2026-10-03 14:00',
      endTime: '2026-10-08 24:00',
    },
    {
      id: 'DIR-202609-04',
      name: '中秋假期沉默用户回流激活',
      targetGroup: '超60天未出卡沉睡用户',
      targetCount: 5400,
      brand: '全卡种',
      country: 'US',
      channelMethod: 'SMS',
      aiPromoterName: 'General-Recall-Bot',
      targetGoal: '沉睡召回',
      status: 'completed',
      sentCount: 5400,
      aiEngagedCount: 2180,
      registeredCount: 0,
      firstOrderCount: 520,
      directGmv: '$46,800.00',
      manager: '运营C (赵雷)',
      startTime: '2026-09-20 09:00',
      endTime: '2026-09-30 24:00',
    }
  ]);

  // 2. 直推专属 AI 推广员列表
  const [promoters] = useState<DirectPromoter[]>([
    {
      id: 'PRM-001',
      name: 'Apple-US-Agent (直推专属AI)',
      avatarBg: 'bg-black text-white',
      avatarIcon: '',
      specialtyBrand: 'Apple US (App Store & iTunes)',
      language: 'English (US)',
      boundTasksCount: 2,
      todaySessions: 386,
      conversionRate: '30.1%',
      independentRate: '88.5%',
      status: 'active',
      welcomeScript: 'Hello! I noticed you have an unused balance or quote ticket. Today we offer an exclusive +0.5% bonus on US Apple cards—instant verification in 45s!',
      nextActionStrategy: '引导查实时加价折率 → 给出 0.5% 优惠券码 → 唤起一键上传卖卡'
    },
    {
      id: 'PRM-002',
      name: 'Steam-VIP-Promoter (大客户直推)',
      avatarBg: 'bg-[#171a21] text-white',
      avatarIcon: 'sports_esports',
      specialtyBrand: 'Steam Wallet (Global / US / UK)',
      language: 'English / 中文',
      boundTasksCount: 1,
      todaySessions: 240,
      conversionRate: '35.0%',
      independentRate: '84.2%',
      status: 'active',
      welcomeScript: 'Hi there! Steam bulk code liquidation is now active. Instant automatic redemption with zero slippage. Would you like a customized VIP quote?',
      nextActionStrategy: '大客申报面额 → 自动申请大商户专属点差 → 触发大客户绿色通道'
    },
    {
      id: 'PRM-003',
      name: 'Retail-Direct-Bot (全美零售卡推广)',
      avatarBg: 'bg-rose-600 text-white',
      avatarIcon: 'storefront',
      specialtyBrand: 'Sephora / Target / Foot Locker',
      language: 'English',
      boundTasksCount: 1,
      todaySessions: 185,
      conversionRate: '17.5%',
      independentRate: '86.0%',
      status: 'active',
      welcomeScript: 'Got unredeemed Sephora or Target gift cards? Turn them into instant cash today! Verification takes less than a minute.',
      nextActionStrategy: '引导拍摄小票与卡密 → 自动 OCR 预检 → 引导注册收款账户'
    }
  ]);

  // 3. 直推会话列表
  const [sessions, setSessions] = useState<DirectSession[]>([
    {
      id: 'SES-DIR-101',
      visitorId: 'Visitor#2381',
      boundUserId: 'UID-882190',
      phoneMasked: '138****9921',
      sourceType: 'PLATFORM_DIRECT',
      taskName: 'Apple 未首单沉睡用户加价召回',
      promoterName: 'Apple-US-Agent',
      userStage: '待接管',
      lastMessageTime: '14:38:12',
      lastMessageText: '我有 10 张 Apple 500 刀实体卡，折率能破 93% 吗？现在卖怎么打款？',
      intentTag: '大客大宗谈判 (超出知识库)',
      estimatedGmv: '$5,000.00',
      isTakeoverNeeded: true,
      messages: [
        { sender: 'ai', text: '您好！平台系统检测到您领取了首单加价券。今天 Apple 美区卡折率已上调至 92.8%，出卡 45 秒内全自动打款到账！', time: '14:36:10' },
        { sender: 'user', text: '500 刀面额实体卡收不收？我有 10 张，折率能到 93% 吗？', time: '14:37:45' },
        { sender: 'ai', text: '识别到您有大宗出卡意向（总计 $5,000）！平台已为您匹配大客户专属操盘通道，正为您转接高级客服专员进行一对一锁价谈判，请稍候...', time: '14:37:46' },
        { sender: 'user', text: '我有 10 张 Apple 500 刀实体卡，折率能破 93% 吗？现在卖怎么打款？', time: '14:38:12' }
      ]
    },
    {
      id: 'SES-DIR-102',
      visitorId: 'Visitor#5182',
      boundUserId: 'UID-109234',
      phoneMasked: '159****4410',
      sourceType: 'PLATFORM_DIRECT',
      taskName: 'Apple 未首单沉睡用户加价召回',
      promoterName: 'Apple-US-Agent',
      userStage: '已首单',
      lastMessageTime: '14:20:05',
      lastMessageText: '钱已经打到我的银行卡了，速度确实快，下次还来！',
      intentTag: '交易履约完成 · 满星好评',
      estimatedGmv: '$100.00',
      isTakeoverNeeded: false,
      messages: [
        { sender: 'ai', text: '您好！您的 Apple $100 优惠券即将于 6 小时后失效，当前出卡折率 92.9% 历史最高！', time: '14:10:00' },
        { sender: 'user', text: '直接复制卡密就行吗？', time: '14:12:15' },
        { sender: 'ai', text: '是的！点击下方【立即上传】，粘贴卡密后 Card Check 机器人将在 2 秒内查验余额并自动放款。', time: '14:12:16' },
        { sender: 'user', text: '钱已经打到我的银行卡了，速度确实快，下次还来！', time: '14:20:05' }
      ]
    },
    {
      id: 'SES-DIR-103',
      visitorId: 'Visitor#8891',
      phoneMasked: '186****1102',
      sourceType: 'PLATFORM_DIRECT',
      taskName: '线下门店意向未注册线索转化',
      promoterName: 'Retail-Direct-Bot',
      userStage: '待接管',
      lastMessageTime: '14:31:00',
      lastMessageText: '我注册时短信验证码一直收不到，能不能直接微信转我？',
      intentTag: '注册遇阻 (短信网关通道问题)',
      estimatedGmv: '$200.00',
      isTakeoverNeeded: true,
      messages: [
        { sender: 'ai', text: '您好！欢迎进入礼品卡极速变现通道，现在注册即享新手专享加价券包！', time: '14:28:10' },
        { sender: 'user', text: '我注册时短信验证码一直收不到，能不能直接微信转我？', time: '14:31:00' },
        { sender: 'ai', text: '很抱歉给您带来困扰！系统检测到部分海外号段短信通道波动，平台客服已接入协助您快速完成实名核验。', time: '14:31:01' }
      ]
    }
  ]);

  // 新建任务操作
  const handleCreateTask = () => {
    if (!newTaskForm.name.trim()) {
      showToast('⚠️ 请填写直推任务名称');
      return;
    }
    const newTask: DirectTask = {
      id: `DIR-202610-${String(tasks.length + 1).padStart(2, '0')}`,
      name: newTaskForm.name,
      targetGroup: newTaskForm.targetGroup,
      targetCount: 1500,
      brand: newTaskForm.brand,
      country: newTaskForm.country,
      channelMethod: newTaskForm.channelMethod,
      aiPromoterName: newTaskForm.aiPromoterName,
      targetGoal: newTaskForm.targetGoal,
      status: 'running',
      sentCount: 1500,
      aiEngagedCount: 0,
      registeredCount: 0,
      firstOrderCount: 0,
      directGmv: '$0.00',
      manager: newTaskForm.manager,
      startTime: newTaskForm.startTime,
      endTime: newTaskForm.endTime,
    };
    setTasks([newTask, ...tasks]);
    setIsCreateTaskModalOpen(false);
    showToast(`✅ 直推任务「${newTask.name}」已创建并开始通过 ${newTask.channelMethod} 主动触达！`);
  };

  // 客服/运营接管回复
  const handleSendTakeoverReply = () => {
    if (!activeSession || !replyInput.trim()) return;
    const nowStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newMsg = {
      sender: 'agent' as const,
      text: replyInput.trim(),
      time: nowStr,
    };
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSession.id) {
        return {
          ...s,
          isTakeoverNeeded: false,
          userStage: '高意向' as const,
          lastMessageTime: nowStr,
          lastMessageText: replyInput.trim(),
          messages: [...s.messages, newMsg]
        };
      }
      return s;
    });
    setSessions(updatedSessions);
    setActiveSession({
      ...activeSession,
      isTakeoverNeeded: false,
      userStage: '高意向',
      messages: [...activeSession.messages, newMsg]
    });
    setReplyInput('');
    showToast('💬 人工专员回复已直接推达用户端聊天窗口！');
  };

  const takeoverSessions = sessions.filter(s => s.isTakeoverNeeded);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Toast 提示 */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[17px] text-emerald-400">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 顶部标题与定位 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-blue-600">05 运营管理</span>
            <span>/</span>
            <span className="text-slate-800 font-medium">平台直推 (Platform Direct)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <span className="material-symbols-outlined text-[20px]">near_me</span>
            </span>
            <span>平台用户直推中心</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              PRD V6.0 平台专有线索转化闭环
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            平台利用掌握的潜客线索（未首单、沉默老客、落地页留资），由运营定策略、AI推广员主动触达答疑、客服异常接管，直推交易不产生第三方佣金。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            创建直推任务
          </button>
        </div>
      </div>

      {/* 核心指标统计 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-500 block">直推潜客线索</span>
          <div className="text-lg font-bold text-slate-900 font-mono mt-1">10,910 人</div>
          <span className="text-[10px] text-indigo-600 mt-1 block">历史访客/未首单/沉睡</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-500 block">主动触达发送量</span>
          <div className="text-lg font-bold text-slate-900 font-mono mt-1">10,910 次</div>
          <span className="text-[10px] text-emerald-600 mt-1 block">到达率 98.4%</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-500 block">AI 产生互动会话</span>
          <div className="text-lg font-bold text-indigo-600 font-mono mt-1">5,140 人</div>
          <span className="text-[10px] text-indigo-500 mt-1 block">会话互动率 47.1%</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-500 block">直推首单转化数</span>
          <div className="text-lg font-bold text-emerald-600 font-mono mt-1">1,374 单</div>
          <span className="text-[10px] text-emerald-600 mt-1 block">首单转化率 26.7%</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-500 block">直推沉淀 GMV</span>
          <div className="text-lg font-bold text-slate-900 font-mono mt-1">$168,000</div>
          <span className="text-[10px] text-slate-400 mt-1 block">0 佣金支出净收益</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] text-amber-700 font-semibold block">待人工接管待办</span>
          <div className="text-lg font-bold text-amber-700 font-mono mt-1">{takeoverSessions.length} 人</div>
          <span className="text-[10px] text-amber-600 mt-1 block">平均等待 &lt; 40s</span>
        </div>
      </div>

      {/* 子模块切换 Tab - Standard Image Tab Bar Style */}
      <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-2 pt-2 flex items-center justify-between gap-1 overflow-x-auto text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'tasks', label: '直推任务', badge: `${tasks.length}`, icon: 'campaign' },
            { id: 'promoters', label: 'AI 推广员', badge: `${promoters.length}`, icon: 'smart_toy' },
            { id: 'sessions', label: '推广会话流', badge: `${sessions.length}`, icon: 'chat' },
            { id: 'takeover', label: '待人工接管', badge: `${takeoverSessions.length}`, icon: 'support_agent' },
            { id: 'users', label: '直推用户线索池', badge: '线索', icon: 'groups' },
            { id: 'analytics', label: '直推效果与 ROI', badge: 'ROI 看板', icon: 'analytics' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs sm:text-sm ${
                  isActive
                    ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
                    isActive ? 'bg-blue-100 text-[#004ac6] font-semibold' : 'bg-slate-100 text-slate-600 font-medium'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          TAB 1: 直推任务列表
         ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-indigo-600">task_alt</span>
                <h3 className="text-sm font-bold text-slate-900">平台直推营销任务运行台</h3>
              </div>
              <span className="text-xs text-slate-500">
                链路：圈选人群 → 创建任务 → 主动触达 → AI接待答疑 → 注册/首单 → 效果自动回流
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">任务编号 / 名称</th>
                    <th className="py-3 px-3">目标人群圈选</th>
                    <th className="py-3 px-3">标的卡种 / 触达</th>
                    <th className="py-3 px-3">执行 AI 推广员</th>
                    <th className="py-3 px-3 text-right">触达 / 互动</th>
                    <th className="py-3 px-3 text-right">首单转化 / GMV</th>
                    <th className="py-3 px-3 text-center">状态</th>
                    <th className="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-slate-400 block">{t.id}</span>
                        <span className="font-bold text-slate-900 text-xs">{t.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">负责人: {t.manager}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium block w-fit">
                          {t.targetGroup}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">规模: {t.targetCount} 人</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">{t.brand} ({t.country})</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">通道: {t.channelMethod}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-indigo-700 block">{t.aiPromoterName}</span>
                        <span className="text-[10px] text-slate-400">目标: {t.targetGoal}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        <div className="font-bold text-slate-800">{t.sentCount} 发送</div>
                        <div className="text-[11px] text-indigo-600 font-medium">{t.aiEngagedCount} 互动</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        <div className="font-bold text-emerald-600">{t.firstOrderCount} 首单</div>
                        <div className="text-[11px] text-slate-600">{t.directGmv}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'running' ? 'bg-emerald-100 text-emerald-800' :
                          t.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t.status === 'running' ? '执行中' : t.status === 'completed' ? '已结束' : '已暂停'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('sessions');
                              showToast(`已筛选任务「${t.name}」的 AI 实时会话流`);
                            }}
                            className="px-2 py-1 rounded text-[11px] text-indigo-600 hover:bg-indigo-50 border border-indigo-200"
                          >
                            查看会话
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: AI 推广员列表
         ========================================================================= */}
      {activeTab === 'promoters' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-indigo-600">psychology</span>
                <span>平台直推数字员工 (AI Promoters)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                基于底层统一 AI 推广能力创建的数字推广员，负责特定品牌、地区与用户生命周期的自动问询与首单促成
              </p>
            </div>
            <button
              type="button"
              onClick={() => showToast('已从底层 AI 推广能力库同步最新知识至所有推广员')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">sync</span>
              同步最新知识库
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promoters.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${p.avatarBg} flex items-center justify-center font-bold text-sm shadow-2xs`}>
                        {p.avatarIcon}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{p.name}</h4>
                        <span className="text-[10px] text-slate-400">{p.id} · {p.language}</span>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      在线巡航
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 text-xs mt-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">今日会话</span>
                      <span className="font-bold font-mono text-slate-800">{p.todaySessions} 次</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">独立解决</span>
                      <span className="font-bold font-mono text-emerald-600">{p.independentRate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">首单转化</span>
                      <span className="font-bold font-mono text-indigo-600">{p.conversionRate}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">特长卡种与业务</span>
                      <span className="text-slate-800 font-medium">{p.specialtyBrand}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">核心引导转化策略 (Next Action)</span>
                      <p className="text-[11px] text-indigo-900 bg-indigo-50/50 p-2 rounded border border-indigo-100">
                        {p.nextActionStrategy}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">绑定直推任务: {p.boundTasksCount} 个</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('sessions');
                      showToast(`已载入推广员 ${p.name} 的会话记录`);
                    }}
                    className="text-xs text-indigo-600 hover:underline font-medium"
                  >
                    查看会话
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3 & 4: 推广会话流 & 人工接管池
         ========================================================================= */}
      {(activeTab === 'sessions' || activeTab === 'takeover') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 左侧 1/3: 会话列表 */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col max-h-[680px]">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="font-bold text-xs text-slate-800">
                {activeTab === 'takeover' ? '待人工接管会话队列' : '直推实时对话流 (7×24h)'}
              </span>
              <span className="text-[10px] text-slate-400">
                {activeTab === 'takeover' ? `${takeoverSessions.length} 条等待接入` : `共 ${sessions.length} 条会话`}
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
              {(activeTab === 'takeover' ? takeoverSessions : sessions).map(s => {
                const isSelected = activeSession?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveSession(s)}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/80 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{s.visitorId}</span>
                        {s.boundUserId && (
                          <span className="text-[10px] text-indigo-600 font-mono">({s.boundUserId})</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{s.lastMessageTime}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {s.lastMessageText}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px]">
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 truncate max-w-[130px]">
                        {s.promoterName.split(' ')[0]}
                      </span>
                      {s.isTakeoverNeeded ? (
                        <span className="px-1.5 py-0.2 rounded font-bold bg-rose-100 text-rose-700 animate-pulse">
                          待接管 ({s.estimatedGmv})
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded font-medium bg-emerald-100 text-emerald-800">
                          {s.userStage}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右侧 2/3: 会话详情与实时接管工作抽屉 */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between max-h-[680px]">
            {activeSession ? (
              <>
                {/* 抽屉头部 */}
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{activeSession.visitorId}</h4>
                      {activeSession.boundUserId && (
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-medium">
                          已绑定会员: {activeSession.boundUserId}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        手机号: {activeSession.phoneMasked}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      来源归因：<strong>PLATFORM_DIRECT (平台直推)</strong> · 任务: {activeSession.taskName} · 预估意向: {activeSession.estimatedGmv}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeSession.isTakeoverNeeded && (
                      <span className="px-2 py-1 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {activeSession.intentTag}
                      </span>
                    )}
                  </div>
                </div>

                {/* 消息对话列表 */}
                <div className="p-4 space-y-3.5 overflow-y-auto flex-1 bg-slate-50/30">
                  {activeSession.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        m.sender === 'user' ? 'items-start' : m.sender === 'agent' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 px-1">
                        <span>{m.sender === 'user' ? '访客 (User)' : m.sender === 'agent' ? '人工专员 (Agent)' : 'AI推广员'}</span>
                        <span>·</span>
                        <span>{m.time}</span>
                      </div>
                      <div
                        className={`max-w-[78%] p-3 rounded-xl text-xs leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                            : m.sender === 'agent'
                            ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                            : 'bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-tl-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 底部回复工具栏 */}
                <div className="p-3 border-t border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      客服专员已介入接管模式 · 发送内容将实时推送到用户 H5/小程序端
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setReplyInput('您好！我是平台大客户操盘主管，识别到您有 10 张 Apple 500 刀出卡意向。针对 5,000 刀总额，我们可以为您申请 93.1% 的大客专享锁价！')}
                        className="text-[10px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded"
                      >
                        填入大客报价模板
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyInput('您好！海外验证码通道已为您切换专属备用节点，请重新点击发送，如有问题我将全程为您协助。')}
                        className="text-[10px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded"
                      >
                        填入注册通道模板
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={replyInput}
                      onChange={e => setReplyInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendTakeoverReply()}
                      placeholder="输入人工回复内容，按回车直接发送..."
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleSendTakeoverReply}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                    >
                      发送接管回复
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">chat</span>
                <p className="text-xs">请在左侧列表中点击选择一条直推会话查看对话记录与接管</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: 直推用户线索池
         ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">平台自有潜在用户线索库</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                包含注册未首单、沉默流失老客、大额意向访客，支持动态打标圈选与一键创建直推唤醒任务
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => showToast('已成功导入 1,200 条最新沉睡用户唤醒线索')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
              >
                导入外部线索
              </button>
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
              >
                基于选中线索创建任务
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">线索标识 / 手机号</th>
                  <th className="py-3 px-3">用户画像属性</th>
                  <th className="py-3 px-3">偏好品牌 / 面额</th>
                  <th className="py-3 px-3">触达频次 (本月)</th>
                  <th className="py-3 px-3">最近互动状态</th>
                  <th className="py-3 px-4 text-right">快捷操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-900 font-bold">UID-882190</span>
                    <span className="text-[10px] text-slate-400 block">138****9921 · 注册28天</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      大额高净值潜客
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800">Apple ($500 × 多张)</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    触达 2 次 · 互动 1 次
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-rose-600 font-bold">待客服人工谈判</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('sessions');
                        showToast('已载入该用户直推会话');
                      }}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      接入会话
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-900 font-bold">UID-109234</span>
                    <span className="text-[10px] text-slate-400 block">159****4410 · 注册45天</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      已转化首单老客
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800">Apple US $100</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    触达 1 次 · 互动 1 次
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-emerald-700 font-medium">已履约出资完成</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('user-management')}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      查看用户画像
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-900 font-bold">LEAD-88410</span>
                    <span className="text-[10px] text-slate-400 block">186****1102 · 留资线索</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                      注册流程遇阻
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800">Sephora / Retail</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    触达 1 次 · 互动 1 次
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-amber-700 font-medium">等待人工协助验证码</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('sessions');
                        showToast('已接入该用户');
                      }}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      立即协助
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: 直推效果与 ROI
         ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-indigo-600">analytics</span>
              <span>平台直推全链路转化漏斗与经营效益</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              直推产生的交易归因为 <strong>PLATFORM_DIRECT</strong>，不计入第三方推广佣金支出，是平台高毛利自营增长核心引擎
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs text-slate-400">潜客触达到达率</span>
              <div className="text-2xl font-bold font-mono text-slate-900">98.4%</div>
              <span className="text-[10px] text-emerald-600 block">短信与官方 WhatsApp 高触达</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs text-slate-400">触达→会话响应率</span>
              <div className="text-2xl font-bold font-mono text-indigo-600">47.1%</div>
              <span className="text-[10px] text-slate-500 block">AI 推广员首句吸引力 A/B 优化</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs text-slate-400">会话→首单转化率</span>
              <div className="text-2xl font-bold font-mono text-emerald-600">26.7%</div>
              <span className="text-[10px] text-emerald-600 block">高于普通自然流量 12.4pp</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs text-slate-400">节省推广佣金支出</span>
              <div className="text-2xl font-bold font-mono text-slate-900">¥48,200</div>
              <span className="text-[10px] text-slate-500 block">相当于免除 2% 第三方渠道提成</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: 创建直推任务弹窗
         ========================================================================= */}
      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-indigo-600">campaign</span>
                <h3 className="text-sm font-bold text-slate-900">新建平台直推营销任务 (PRD V6.0)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">任务名称</label>
                <input
                  type="text"
                  value={newTaskForm.name}
                  onChange={e => setNewTaskForm({ ...newTaskForm, name: e.target.value })}
                  placeholder="例如：Apple 30天未首单加价券直推"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">目标圈选人群</label>
                  <select
                    value={newTaskForm.targetGroup}
                    onChange={e => setNewTaskForm({ ...newTaskForm, targetGroup: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-indigo-500"
                  >
                    <option value="注册30天未首单用户 (3,280人)">注册30天未首单用户 (3,280人)</option>
                    <option value="超60天未出卡沉睡用户 (5,400人)">超60天未出卡沉睡用户 (5,400人)</option>
                    <option value="落地页留资新访客 (980人)">落地页留资新访客 (980人)</option>
                    <option value="大客大额咨询未成交 (450人)">大客大额咨询未成交 (450人)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">触达通道</label>
                  <select
                    value={newTaskForm.channelMethod}
                    onChange={e => setNewTaskForm({ ...newTaskForm, channelMethod: e.target.value as any })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-indigo-500"
                  >
                    <option value="SMS">官方短信通道 (SMS)</option>
                    <option value="WHATSAPP_OFFICIAL">官方 WhatsApp Service</option>
                    <option value="DIRECT_LINK">个性化专属直推链接</option>
                    <option value="APP_PUSH">OWO APP Push 推送</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">目标卡种与国家</label>
                  <input
                    type="text"
                    value={`${newTaskForm.brand} (${newTaskForm.country})`}
                    onChange={e => setNewTaskForm({ ...newTaskForm, brand: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">执行 AI 推广员</label>
                  <select
                    value={newTaskForm.aiPromoterName}
                    onChange={e => setNewTaskForm({ ...newTaskForm, aiPromoterName: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-indigo-500"
                  >
                    {promoters.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">推广核心目标</label>
                  <select
                    value={newTaskForm.targetGoal}
                    onChange={e => setNewTaskForm({ ...newTaskForm, targetGoal: e.target.value as any })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-indigo-500"
                  >
                    <option value="首单转化">首单转化 (引导完成首次卖卡)</option>
                    <option value="沉睡召回">沉睡召回 (加价券唤醒老客)</option>
                    <option value="促复购">促复购 (返现激励二次出卡)</option>
                    <option value="大额变现">大额变现 (大客户一对一锁价)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">策略负责人</label>
                  <input
                    type="text"
                    value={newTaskForm.manager}
                    disabled
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
                💡 <strong>直推合规说明</strong>：直推产生的所有订单将自动标记 <code>Source_Type = PLATFORM_DIRECT</code>，不产生渠道推广团队佣金，交易数据直接沉淀至平台自营增长大盘。
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreateTask}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
              >
                立即发布并启动触达
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
