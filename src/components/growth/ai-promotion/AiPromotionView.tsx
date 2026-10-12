import React, { useState } from 'react';
import { NavPath } from '../../../types';

interface AiPromotionViewProps {
  onNavigate?: (path: NavPath) => void;
}

// 待人工接管用户
interface TakeoverItem {
  id: string;
  visitorId: string;
  channel: string;
  entryTime: string;
  currentQuestion: string;
  aiJudgment: string;
  judgmentReason: string;
  waitTimeSeconds: number;
  status: 'waiting' | 'in_progress' | 'resolved';
  messages: Array<{ sender: 'visitor' | 'ai' | 'agent'; text: string; time: string }>;
  userIntent: string;
  estimatedGmv: string;
}

// AI 不会的问题池
interface UnknownQuestionItem {
  id: string;
  type: string;
  sampleQuestion: string;
  weeklyCount: number;
  currentHandling: string;
  suggestion: string;
  suggestedAction: string;
  suggestedAnswer: string;
  status: 'pending' | 'learned' | 'ignored';
}

// 高流失问题池
interface ChurnQuestionItem {
  id: string;
  question: string;
  churnRate: string;
  sampleSize: number;
  currentAiScript: string;
  recommendedScript: string;
  nextAction: string;
  status: 'active_ab' | 'updated' | 'analyzing';
}

// 知识库条目
interface KnowledgeItem {
  id: string;
  category: '注册引导' | '报价咨询' | '卡种规则' | '交易流程' | '安全保障' | '大额专享';
  question: string;
  similarQuestions: string[];
  standardAnswer: string;
  nextAction: string; // 核心：推广机器人独有引导动作
  applicableStage: '新访客' | '咨询中' | '高意向' | '流失召回';
  status: '启用' | '停用';
  version: string;
  updateTime: string;
}

export const AiPromotionView: React.FC<AiPromotionViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'takeover' | 'unknown' | 'churn' | 'knowledge' | 'scripts' | 'funnel'>('overview');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // 1. 待人工接管队列
  const [takeoverList, setTakeoverList] = useState<TakeoverItem[]>([
    {
      id: 'TK-101',
      visitorId: 'Visitor-2381 (138****9921)',
      channel: 'TikTok-A (信息流投放)',
      entryTime: '14:38:12',
      currentQuestion: 'Apple 美区卡面额 500 刀收不收？我有 10 张，折率能到 93% 吗？',
      aiJudgment: '需要人工专员接单',
      judgmentReason: '大额大客意向 (预估 GMV > $5,000)，超出通用加价券额度',
      waitTimeSeconds: 32,
      status: 'waiting',
      userIntent: '大额高意向',
      estimatedGmv: '$5,000.00',
      messages: [
        { sender: 'visitor', text: '你好，你们平台卖卡安全吗？支持哪些卡？', time: '14:37:45' },
        { sender: 'ai', text: '您好！平台由合规支付通道兜底，支持 Apple、Steam、Target 等全球主流卡种，系统自动核验 45 秒内打款！现在注册首单可享 0.5% 额外补贴券～', time: '14:37:46' },
        { sender: 'visitor', text: 'Apple 美区卡面额 500 刀收不收？我有 10 张，折率能到 93% 吗？', time: '14:38:12' },
        { sender: 'ai', text: '识别到您有大宗出卡意向！已为您联络平台高级大客户操盘专员，正在接入专属绿色通道，请稍候...', time: '14:38:13' }
      ]
    },
    {
      id: 'TK-102',
      visitorId: 'Visitor-5182 (匿名访客)',
      channel: 'SMS-B (沉睡用户短信召回)',
      entryTime: '14:37:30',
      currentQuestion: '为什么上次我的 Steam 充值码被拒单了？你们说已兑换，我不服！',
      aiJudgment: '超出推广知识范围 · 转售后客服',
      judgmentReason: '涉及历史争议工单及三方对账凭证，需接入客服仲裁台',
      waitTimeSeconds: 74,
      status: 'waiting',
      userIntent: '售后投诉',
      estimatedGmv: '$100.00',
      messages: [
        { sender: 'visitor', text: '收到你们的回归加息短信才来的，结果之前的账还没平！', time: '14:37:10' },
        { sender: 'ai', text: '非常理解您的心情！请问是遇到订单履约问题了吗？您可以提供订单号，小助手帮您排查～', time: '14:37:12' },
        { sender: 'visitor', text: '为什么上次我的 Steam 充值码被拒单了？你们说已兑换，我不服！', time: '14:37:30' },
        { sender: 'ai', text: '针对已核销争议问题，已为您转接平台售后仲裁值班客服为您调取官方核销网关流水日志！', time: '14:37:31' }
      ]
    },
    {
      id: 'TK-103',
      visitorId: 'Visitor-6804 (159****4120)',
      channel: 'Facebook-Ads (拉美专区)',
      entryTime: '14:36:50',
      currentQuestion: '墨西哥比索 (MXN) 的卡能提现 USDT 吗？手续费是多少？',
      aiJudgment: '需要人工 · 小币种结算咨询',
      judgmentReason: '墨西哥比索结算通道涉及离岸汇差与动态网络费率',
      waitTimeSeconds: 110,
      status: 'waiting',
      userIntent: '小币种跨境外汇',
      estimatedGmv: '$850.00',
      messages: [
        { sender: 'visitor', text: 'Hola, 墨西哥比索 (MXN) 的卡能提现 USDT 吗？手续费是多少？', time: '14:36:50' },
        { sender: 'ai', text: '支持的！平台支持 TRC20/ERC20 USDT 出金。由于实时汇率浮动，已邀请外汇专员为您计算净到账金额！', time: '14:36:51' }
      ]
    }
  ]);

  // 当前正在接管对话的抽屉
  const [activeChat, setActiveChat] = useState<TakeoverItem | null>(null);
  const [agentInput, setAgentInput] = useState('');

  // 2. AI 不会的问题池
  const [unknownQuestions, setUnknownQuestions] = useState<UnknownQuestionItem[]>([
    {
      id: 'UQ-01',
      type: '特殊小众卡种支持',
      sampleQuestion: '你们收不收 Roblox 或 Lululemon 的加拿大礼品卡？',
      weeklyCount: 86,
      currentHandling: '统一转人工客服',
      suggestion: '建议补充加拿大及南美小众卡种收卡范围规则与外部商户承接底池',
      suggestedAction: '推荐引导添加商户客服微信/WhatsApp 专线手工收单',
      suggestedAnswer: '目前平台支持主流商户通道，Roblox 与 Lululemon 加拿大卡正处于灰度上线中，建议联系专线客服为您开通专向撮合！',
      status: 'pending'
    },
    {
      id: 'UQ-02',
      type: '出金到账时效细则',
      sampleQuestion: '银行卡晚上 11 点提现也是秒到账吗？会不会卡在清算行？',
      weeklyCount: 62,
      currentHandling: '回答不稳定 (有时回复秒到，有时回复次日)',
      suggestion: '统一标准化表述：工作日实时清算，夜间及非工作日支持 USDT 30秒无缝秒到',
      suggestedAction: '提示绑定 USDT 钱包体验 7*24h 秒级自动清算',
      suggestedAnswer: '平台支持 7*24h 实时出金！若绑定 USDT 钱包可无视银行清算窗口 30 秒秒级到账；银行卡渠道夜间清算窗口约 5-15 分钟。',
      status: 'pending'
    },
    {
      id: 'UQ-03',
      type: '大额分批出卡风控',
      sampleQuestion: '我一次性卖 5 万美元的卡，会不会被封号或要查税表？',
      weeklyCount: 51,
      currentHandling: '已回答但满意度低 (用户担心封号)',
      suggestion: '消除风控恐慌，强化平台合规资质与大客质押专人包赔兜底',
      suggestedAction: '引导预约大客户 1V1 专属商务经理签署协议',
      suggestedAnswer: '平台拥有合法合规数字资产撮合牌照，大额单笔交易由海外自营高额保证金通道直连，保障资金安全无任何冻卡风险！',
      status: 'pending'
    }
  ]);

  // 3. 高流失问题池
  const [churnQuestions] = useState<ChurnQuestionItem[]>([
    {
      id: 'CQ-01',
      question: '问及 “平台安全吗？会不会吞卡卷款跑路？”',
      churnRate: '38.4%',
      sampleSize: 420,
      currentAiScript: '我们是合规持牌交易平台，系统自动验卡保证安全。',
      recommendedScript: '您好！平台运营超 4 年，累计安全撮合流水超 8 亿元。每一笔订单均由商户在平台质押的 ¥1,850 万保证金先付兜底，出卡后 45 秒内全额直达您的钱包，假一赔三！现在出卡还享平台先行垫付特权。',
      nextAction: '推送《平台安全白皮书》与 0 门槛 $2 新客试水体验金',
      status: 'active_ab'
    },
    {
      id: 'CQ-02',
      question: '问及 “为什么比淘宝/闲鱼收卡折率低 1%？”',
      churnRate: '29.1%',
      sampleSize: 310,
      currentAiScript: '外部个人回收风险高，平台收取正常服务点差。',
      recommendedScript: 'C2C 个人私下回收常有“黑卡碰瓷、卡密被盗、微信封账”风险，平台为您提供的是 100% 官方网关直核销与秒级结算，零坏账零纠纷。今天新客出卡专享 0.5% 折率上浮加价券，实际到手比二手市场更划算！',
      nextAction: '自动派发 0.5% 限时折率上浮加价券 (有效期 2 小时)',
      status: 'active_ab'
    }
  ]);

  // 4. 推广知识库
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([
    {
      id: 'KB-01',
      category: '注册引导',
      question: '新手第一次出卡怎么操作？有新手福利吗？',
      similarQuestions: ['第一次来怎么卖卡', '新手有什么优惠', '卖卡流程复杂吗'],
      standardAnswer: '欢迎来到 OWO！卖卡仅需 3 步：① 选卡种与面额 ② 拍照或输入卡密 ③ 系统 45 秒自动核销即刻到账！现在完成手机号注册立赠【0.5% 首单加价券】！',
      nextAction: '弹窗推送【一键手机号注册引导卡】+ 0.5% 加价券',
      applicableStage: '新访客',
      status: '启用',
      version: 'v2.4',
      updateTime: '2026-10-02'
    },
    {
      id: 'KB-02',
      category: '报价咨询',
      question: 'Apple 美区卡今天什么折率？为什么每家价格不同？',
      similarQuestions: ['苹果卡价格', '今天苹果美卡多少钱收', '折率怎么算'],
      standardAnswer: '今日 Apple US 实体卡参考折率为 92.9% - 93.2%，平台汇聚全网 140+ 认证直连商户实时竞价，系统自动为您撮合全网最高实时出价！',
      nextAction: '渲染【Apple US 实时行情卡片】+ 点击一键提单',
      applicableStage: '咨询中',
      status: '启用',
      version: 'v3.1',
      updateTime: '2026-10-04'
    },
    {
      id: 'KB-03',
      category: '大额专享',
      question: '手上有上万美元的面额，怎么走大额绿色通道？',
      similarQuestions: ['批量出卡', '每天出卡几万怎么合作', '大客返点'],
      standardAnswer: '单日提单大于 $3,000 即刻享受 VIP 大客定制权益：支持锁价收卡、1对1 专属客服席位、专属高额质押通道优先消化！',
      nextAction: '触发【大客户专员接管】并提示输入联系方式',
      applicableStage: '高意向',
      status: '启用',
      version: 'v1.8',
      updateTime: '2026-09-28'
    }
  ]);

  // 弹窗状态：新增知识
  const [isAddKnowledgeOpen, setIsAddKnowledgeOpen] = useState(false);
  const [newKbCategory, setNewKbCategory] = useState<KnowledgeItem['category']>('注册引导');
  const [newKbQuestion, setNewKbQuestion] = useState('');
  const [newKbAnswer, setNewKbAnswer] = useState('');
  const [newKbAction, setNewKbAction] = useState('');
  const [newKbStage, setNewKbStage] = useState<KnowledgeItem['applicableStage']>('新访客');

  const handleSendMessage = () => {
    if (!agentInput.trim() || !activeChat) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg = { sender: 'agent' as const, text: agentInput, time: timeStr };
    
    setTakeoverList(prev => prev.map(t => {
      if (t.id === activeChat.id) {
        return {
          ...t,
          status: 'in_progress',
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));

    setActiveChat(prev => prev ? { ...prev, status: 'in_progress', messages: [...prev.messages, newMsg] } : null);
    setAgentInput('');
    showToast('💬 人工客服消息已实时推送至用户端 H5 对话窗口！');
  };

  const handleQuickAddUnknownToKb = (item: UnknownQuestionItem) => {
    setNewKbQuestion(item.sampleQuestion);
    setNewKbAnswer(item.suggestedAnswer);
    setNewKbAction(item.suggestedAction);
    setNewKbCategory('报价咨询');
    setIsAddKnowledgeOpen(true);
  };

  return (
    <div className="flex flex-col gap-5 flex-1 w-full max-w-[1600px] mx-auto antialiased text-slate-800 pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 backdrop-blur-md animate-in fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* 顶栏标题与系统定位 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI 推广运营控制中心</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              PRD V4.0 PROMOTION ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            系统定位：管理渠道前台 AI 推广机器人的接待质量、知识库演进、转人工接管队列与用户注册首单转化漏斗。
          </p>
        </div>

        {/* 快捷统计指示 */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600">AI 推广机器人状态:</span>
            <span className="font-bold text-emerald-700">在线巡航中 (全渠道挂接)</span>
          </div>
          <button
            onClick={() => setIsAddKnowledgeOpen(true)}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>录入推广知识</span>
          </button>
        </div>
      </div>

      {/* 六大核心推广业务指标卡 (PRD 3.1 明确要求：强调业务转化，不堆砌技术Token) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">今日 AI 接待访客</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">↑12.6%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 my-2">1,286 <span className="text-xs font-normal text-slate-400">人</span></div>
          <div className="text-[10px] text-slate-400">全网各推广渠道落地页访客</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">AI 独立接待率</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">↑3.1pp</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 my-2">86.2%</div>
          <div className="text-[10px] text-slate-400">无需人工介入自主闭环</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">转人工干预率</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold">↓2.1pp</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 my-2">13.8%</div>
          <div className="text-[10px] text-slate-400">共 178 人需客服/操盘手接管</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">注册引导点击率</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">↑1.8pp</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 my-2">42.6%</div>
          <div className="text-[10px] text-slate-400">点击 AI 推送的注册领券卡片</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">访客 → 注册率</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">↑2.2pp</span>
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600 my-2">18.3%</div>
          <div className="text-[10px] text-slate-400">成功完成手机号注册</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">注册 → 首单率</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">↑1.4pp</span>
          </div>
          <div className="text-2xl font-bold font-mono text-purple-700 my-2">36.5%</div>
          <div className="text-[10px] text-slate-400">首单实名核销破冰</div>
        </div>
      </div>

      {/* 主工作区 Tab 导航 (统一标准风格) */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            {
              id: 'overview',
              label: '推广看板大盘',
              icon: 'dashboard'
            },
            {
              id: 'takeover',
              label: '待人工接管队列',
              icon: 'support_agent',
              badge: `${takeoverList.filter(t => t.status === 'waiting').length}`,
              badgeClass: 'bg-rose-100 text-rose-700'
            },
            {
              id: 'unknown',
              label: 'AI 不会的问题池',
              icon: 'help_center',
              badge: `${unknownQuestions.length}`,
              badgeClass: 'bg-amber-100 text-amber-800'
            },
            {
              id: 'churn',
              label: '高流失问题与话术',
              icon: 'trending_down'
            },
            {
              id: 'knowledge',
              label: '推广知识库 (含下一步动作)',
              icon: 'menu_book',
              badge: `${knowledgeList.length}`,
              badgeClass: 'bg-blue-100 text-blue-800'
            }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                  isActive
                    ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                type="button"
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
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-mono flex items-center gap-2 pr-2">
          <span>接待引擎响应延迟: 1.2s</span>
          <span className="text-slate-300">|</span>
          <span>转化追踪版本: V4.0.2</span>
        </div>
      </section>

      {/* TAB 1: 推广总览与各渠道效果大盘 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 左栏 8/12: 各渠道推广转化全矩阵 */}
          <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 text-[18px]">hub</span>
                <h3 className="font-bold text-sm text-slate-900">分渠道 AI 推广与转化穿透表现</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">数据窗口: 今日 (00:00 - 14:40)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] h-9 border-b border-slate-200">
                    <th className="py-2 px-3">推广渠道 / 触点</th>
                    <th className="py-2 px-3 text-right">访客数</th>
                    <th className="py-2 px-3 text-right">AI 独立接待率</th>
                    <th className="py-2 px-3 text-right">转人工数</th>
                    <th className="py-2 px-3 text-right">注册转化率</th>
                    <th className="py-2 px-3 text-right">首单转化率</th>
                    <th className="py-2 px-3 text-center">综合转化评级</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-sans font-medium text-slate-900">
                      TikTok-A (短视频信息流)
                    </td>
                    <td className="py-3 px-3 text-right">542</td>
                    <td className="py-3 px-3 text-right text-emerald-600 font-bold">88.4%</td>
                    <td className="py-3 px-3 text-right text-slate-600">63</td>
                    <td className="py-3 px-3 text-right text-indigo-600 font-bold">21.4%</td>
                    <td className="py-3 px-3 text-right text-purple-700 font-bold">41.2%</td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">S级高转化</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-sans font-medium text-slate-900">
                      SMS-B (沉睡用户大额券召回)
                    </td>
                    <td className="py-3 px-3 text-right">318</td>
                    <td className="py-3 px-3 text-right text-slate-600">82.1%</td>
                    <td className="py-3 px-3 text-right text-amber-600 font-bold">57</td>
                    <td className="py-3 px-3 text-right text-indigo-600 font-bold">26.8%</td>
                    <td className="py-3 px-3 text-right text-purple-700 font-bold">48.6%</td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">大客召回优</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-sans font-medium text-slate-900">
                      Facebook-Ads (海外华人社区)
                    </td>
                    <td className="py-3 px-3 text-right">246</td>
                    <td className="py-3 px-3 text-right text-emerald-600">87.0%</td>
                    <td className="py-3 px-3 text-right text-slate-600">32</td>
                    <td className="py-3 px-3 text-right text-slate-700">14.2%</td>
                    <td className="py-3 px-3 text-right text-slate-700">28.0%</td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">稳健增长</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-sans font-medium text-slate-900">
                      WhatsApp 私域社群合作
                    </td>
                    <td className="py-3 px-3 text-right">180</td>
                    <td className="py-3 px-3 text-right text-slate-600">85.5%</td>
                    <td className="py-3 px-3 text-right text-slate-600">26</td>
                    <td className="py-3 px-3 text-right text-indigo-600 font-bold">19.8%</td>
                    <td className="py-3 px-3 text-right text-purple-700 font-bold">39.0%</td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">私域复购高</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-purple-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">insights</span>
                <span><strong>运营调控建议：</strong>SMS-B 短信召回渠道首单转化高达 48.6%，建议协同推广管理加大近 30 天未出卡用户的加价券推送频次。</span>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('operation-plans')}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                type="button"
              >
                生成召回专项
              </button>
            </div>
          </div>

          {/* 右栏 4/12: 实时待办与转人工告警 */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-rose-500 text-[18px]">support_agent</span>
                  <span>即时待接管告警 (客服工作台同步)</span>
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">3 待处理</span>
              </div>

              <div className="space-y-2.5">
                {takeoverList.map(item => (
                  <div key={item.id} className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100/80 transition-colors space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">{item.visitorId}</span>
                      <span className="font-mono text-[11px] text-rose-600 font-bold">等待 {item.waitTimeSeconds}s</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      "{item.currentQuestion}"
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-purple-700 font-mono bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        {item.aiJudgment}
                      </span>
                      <button
                        onClick={() => {
                          setActiveChat(item);
                          setActiveTab('takeover');
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs cursor-pointer"
                        type="button"
                      >
                        接管对话
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 机器人转化核心闭环小看板 */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-xs space-y-2.5">
              <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center justify-between">
                <span>推广闭环核心原则</span>
                <span className="material-symbols-outlined text-purple-400 text-[16px]">verified</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                "工具负责干活，平台负责管理，人负责异常。" AI 机器人持续接待与发券，人负责大单接管与知识沉淀。
              </p>
              <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px] font-mono text-slate-300">
                <span>今日通过 AI 引导创造 GMV:</span>
                <strong className="text-emerald-400 text-sm">¥318,450.00</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 待人工接管列表与实时会话接入 (PRD 第四节 ①) */}
      {activeTab === 'takeover' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">当前排队待接管访客</h3>
                <span className="text-xs text-slate-400">平均人工介入等待时长: 48 秒</span>
              </div>
              <button
                onClick={() => showToast('已刷新待接管队列')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {takeoverList.map(item => {
                const isSelected = activeChat?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveChat(item)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{item.visitorId}</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                        等待 {item.waitTimeSeconds}s
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 font-medium line-clamp-2">
                      问："{item.currentQuestion}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>渠道: {item.channel.split(' ')[0]}</span>
                      <span className="text-purple-700 font-semibold">{item.aiJudgment}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右侧：实时人工接管对话沙盒 */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[640px] overflow-hidden">
            {activeChat ? (
              <>
                {/* 顶栏信息 */}
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      访
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <span>{activeChat.visitorId}</span>
                        <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px]">
                          {activeChat.userIntent}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        来源: {activeChat.channel} · 预估货值: {activeChat.estimatedGmv}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setTakeoverList(prev => prev.filter(t => t.id !== activeChat.id));
                      setActiveChat(null);
                      showToast('✅ 该用户接管完毕，已引导成功并归档至已服务池！');
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                    type="button"
                  >
                    完成接管并归档
                  </button>
                </div>

                {/* 消息历史区 */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#f8fafc]/50">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                      用户于 {activeChat.entryTime} 进入推广会话 · 由 AI 推广机器人接待
                    </span>
                  </div>

                  {activeChat.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        m.sender === 'visitor' ? 'items-start' : 'items-end'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 mb-1 px-1">
                        {m.sender === 'visitor' ? '访客' : m.sender === 'ai' ? 'AI 推广助手' : '人工客服 (您)'} · {m.time}
                      </span>
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                          m.sender === 'visitor'
                            ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                            : m.sender === 'ai'
                            ? 'bg-purple-50 text-purple-900 border border-purple-200 rounded-tr-xs'
                            : 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 快捷话术条 */}
                <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <span className="text-slate-400 shrink-0 font-medium">快捷回复:</span>
                  <button
                    onClick={() => setAgentInput('您好！我是大客户专属经理，针对 10 张 Apple 500刀，我们可立即为您锁定 93.2% 顶格直收折率，支持先款垫付！')}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded shrink-0 cursor-pointer"
                    type="button"
                  >
                    大额顶格锁价
                  </button>
                  <button
                    onClick={() => setAgentInput('我已帮您生成首单专属 0.5% 现金券，点击链接即可立享折率上浮！')}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded shrink-0 cursor-pointer"
                    type="button"
                  >
                    派发加价券
                  </button>
                  <button
                    onClick={() => setAgentInput('已为您调取该订单在 Apple 官方网关核销流水记录，请查阅此凭证...')}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded shrink-0 cursor-pointer"
                    type="button"
                  >
                    售后凭证出具
                  </button>
                </div>

                {/* 发送框 */}
                <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="输入人工客服回复话术，按 Enter 或点击发送..."
                    value={agentInput}
                    onChange={e => setAgentInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                    type="button"
                  >
                    发送回复
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-2 p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300">chat_bubble_outline</span>
                <span className="font-semibold text-xs">请在左侧列表中点击需要接管的访客会话</span>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  当 AI 判断出大客高意向或涉及争议时，系统会自动发出警报，人工客服接管后将直接在用户端无缝同步消息。
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AI 不会的问题池 (PRD 第四节 ②) */}
      {activeTab === 'unknown' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">AI 无法回答 / 知识缺失问题池</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                形成“用户问 ➔ AI不会 ➔ 人工介入 ➔ 沉淀答案与下一步动作 ➔ AI下次自动掌握”的正向进化闭环。
              </p>
            </div>
            <span className="text-xs text-purple-700 font-mono font-semibold bg-purple-50 px-2 py-1 rounded border border-purple-200">
              知识缺失检出率: 13.8%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] h-9 border-b border-slate-200">
                  <th className="py-2 px-3">问题归类</th>
                  <th className="py-2 px-3">代表性真实用户问法</th>
                  <th className="py-2 px-3 text-center">本周触发频次</th>
                  <th className="py-2 px-3">当前 AI 处理策略</th>
                  <th className="py-2 px-3">运营建议措施</th>
                  <th className="py-2 px-3 text-right">闭环动作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {unknownQuestions.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{item.type}</td>
                    <td className="py-3 px-3 font-medium text-slate-700 max-w-xs">{item.sampleQuestion}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-rose-600">{item.weeklyCount} 次</td>
                    <td className="py-3 px-3 text-slate-600">{item.currentHandling}</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] max-w-sm">{item.suggestion}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleQuickAddUnknownToKb(item)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[14px]">library_add</span>
                        <span>加入知识库</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: 高流失问题池与话术对比 (PRD 第四节 ③) */}
      {activeTab === 'churn' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">高流失问题归因与转化话术 A/B 测试</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                实时定位用户问完直接退出跳出的断点话术，通过优秀人工话术替代并量化验证留存与首单回暖。
              </p>
            </div>
            <span className="text-xs text-rose-600 font-mono font-semibold bg-rose-50 px-2 py-1 rounded border border-rose-200">
              最高跳出率环节: 38.4%
            </span>
          </div>

          <div className="space-y-4">
            {churnQuestions.map(item => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-rose-100 text-rose-800">
                      跳出率 {item.churnRate}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">{item.question}</h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">样本容量: {item.sampleSize} 访客</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">当前低效 AI 话术 (导致高跳出)</div>
                    <p className="text-slate-600 leading-relaxed italic">"{item.currentAiScript}"</p>
                  </div>
                  <div className="p-3 bg-emerald-50/80 rounded-lg border border-emerald-200 space-y-1.5">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase flex items-center justify-between">
                      <span>推荐高转化人工沉淀话术</span>
                      <span className="text-[10px] text-emerald-600 font-mono">预计跳出率降至 &lt;15%</span>
                    </div>
                    <p className="text-emerald-950 font-medium leading-relaxed">"{item.recommendedScript}"</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <div className="text-purple-700 text-[11px]">
                    ★ <strong>附带下一步转化动作：</strong>{item.nextAction}
                  </div>
                  <button
                    onClick={() => showToast('已将推荐高转化话术热更新至全网 AI 推广引擎并启动 50% 流量 A/B 灰度！')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                    type="button"
                  >
                    立即采纳并启动 A/B 灰度
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: 推广知识库管理 (PRD 第五节) */}
      {activeTab === 'knowledge' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">AI 推广机器人专属知识库</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                与普通客服知识库不同，推广知识库的核心字段是【下一步动作 (Next Action)】，用于推动访客领券与首单转化。
              </p>
            </div>
            <button
              onClick={() => setIsAddKnowledgeOpen(true)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>新增推广知识</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] h-9 border-b border-slate-200">
                  <th className="py-2 px-3">分类</th>
                  <th className="py-2 px-3">标准用户问题</th>
                  <th className="py-2 px-3">相似问法</th>
                  <th className="py-2 px-3">标准回答依据</th>
                  <th className="py-2 px-3">★ 下一步引导动作 (核心)</th>
                  <th className="py-2 px-2 text-center">适用阶段</th>
                  <th className="py-2 px-2 text-center">状态</th>
                  <th className="py-2 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {knowledgeList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs">{item.question}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {item.similarQuestions.join(' / ')}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs leading-relaxed">{item.standardAnswer}</td>
                    <td className="py-3 px-3 font-medium text-blue-700 bg-blue-50/40 rounded">
                      {item.nextAction}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.applicableStage}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium">
                      <button
                        onClick={() => showToast(`已重新同步并校验知识条目: ${item.question}`)}
                        className="text-blue-600 hover:underline mr-2 cursor-pointer"
                        type="button"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => {
                          setKnowledgeList(prev => prev.filter(k => k.id !== item.id));
                          showToast('已停用并归档该知识条目');
                        }}
                        className="text-rose-600 hover:underline cursor-pointer"
                        type="button"
                      >
                        停用
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 弹窗：录入推广知识 */}
      {isAddKnowledgeOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsAddKnowledgeOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">录入新推广机器人知识与引导动作</h3>
              <button
                onClick={() => setIsAddKnowledgeOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <label className="block font-semibold mb-1">知识分类</label>
                <select
                  value={newKbCategory}
                  onChange={e => setNewKbCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="注册引导">注册引导</option>
                  <option value="报价咨询">报价咨询</option>
                  <option value="卡种规则">卡种规则</option>
                  <option value="交易流程">交易流程</option>
                  <option value="安全保障">安全保障</option>
                  <option value="大额专享">大额专享</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">用户标准问题</label>
                <input
                  type="text"
                  placeholder="例如：第一次卖卡需要实名认证吗？"
                  value={newKbQuestion}
                  onChange={e => setNewKbQuestion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">标准回答依据</label>
                <textarea
                  rows={3}
                  placeholder="输入给 AI 作为参考的标准客观答案..."
                  value={newKbAnswer}
                  onChange={e => setNewKbAnswer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-purple-700">★ 下一步动作 (核心引导逻辑)</label>
                <input
                  type="text"
                  placeholder="例如：弹出【小额试水免实名快捷挂单卡片】+ 自动填充 100 美元面额"
                  value={newKbAction}
                  onChange={e => setNewKbAction(e.target.value)}
                  className="w-full px-3 py-2 bg-purple-50/50 border border-purple-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">适用访客阶段</label>
                <select
                  value={newKbStage}
                  onChange={e => setNewKbStage(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="新访客">新访客</option>
                  <option value="咨询中">咨询中</option>
                  <option value="高意向">高意向</option>
                  <option value="流失召回">流失召回</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddKnowledgeOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newKbQuestion.trim() || !newKbAnswer.trim()) {
                    showToast('请填写完整的问题与答案！');
                    return;
                  }
                  const newItem: KnowledgeItem = {
                    id: `KB-0${knowledgeList.length + 1}`,
                    category: newKbCategory,
                    question: newKbQuestion,
                    similarQuestions: [newKbQuestion],
                    standardAnswer: newKbAnswer,
                    nextAction: newKbAction || '推送注册加价券',
                    applicableStage: newKbStage,
                    status: '启用',
                    version: 'v1.0',
                    updateTime: '2026-10-05'
                  };
                  setKnowledgeList(prev => [newItem, ...prev]);
                  setIsAddKnowledgeOpen(false);
                  setNewKbQuestion('');
                  setNewKbAnswer('');
                  setNewKbAction('');
                  showToast('🎉 新推广知识条目已成功发布并同步至前台 AI 引擎！');
                }}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                发布生效
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
