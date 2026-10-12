import React, { useState } from 'react';
import { NavPath, UserRole } from '../types';
import { TodoCenter } from './TodoCenter';
import { ROLE_DEFINITIONS } from '../data/rolesData';
import {
  ChevronRight,
  Search,
  X,
  ArrowRight,
  ChevronDown,
  Check,
  Bell,
  Headphones,
  Coins,
  User,
} from 'lucide-react';

interface HeaderProps {
  currentPath: NavPath;
  onNavigate: (path: NavPath) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

interface NavItemMeta {
  path: NavPath;
  label: string;
  category: string;
  keywords: string;
}

const NAV_ITEMS_INDEX: NavItemMeta[] = [
  // 工作台
  { path: 'workbench', label: '工作台', category: '工作台', keywords: '工作台 驾驶舱 概览 待办 今日' },
  { path: 'workbench-operations', label: '运营工作台', category: '工作台', keywords: '运营 工作台 增长 获客 经营' },
  { path: 'workbench-cs', label: '客服工作台', category: '工作台', keywords: '客服 工作台 异常 待办' },
  { path: 'workbench-cs-orders', label: '卡单作业', category: '工作台', keywords: '卡单 作业 待处理 异常置顶 履约' },
  { path: 'workbench-cs-merchant', label: '商户异常', category: '工作台', keywords: '商户 异常 拒单 超时 催办' },
  { path: 'workbench-cs-promotion', label: '推广异常', category: '工作台', keywords: '推广 异常 渠道 留存' },
  { path: 'workbench-finance', label: '财务工作台', category: '工作台', keywords: '财务 工作台 积点 资金' },
  { path: 'online-service', label: '在线客服', category: '工作台', keywords: '在线客服 实时 接待 聊天 坐席' },
  { path: 'my-messages', label: '我的消息', category: '工作台', keywords: '消息 通知 待办 告警 站内信' },

  // 交易管理
  { path: 'order-management', label: '卡单管理', category: '交易管理', keywords: '卡单 订单 卡密 充值 履约 状态' },
  { path: 'exception-orders', label: '异常订单', category: '交易管理', keywords: '异常 超时 OCR 反光 面额不符 拒单 核销失败' },
  { path: 'dispute-resolution', label: '售后争议', category: '交易管理', keywords: '争议 申诉 碰卡 举证 复核 仲裁 赔付' },

  // 报价运营
  { path: 'quote-management', label: '报价管理', category: '报价运营', keywords: '报价 平台报价 商户报价 调价记录 折率 定价 浮动 竞争力' },
  { path: 'quote-monitor', label: '报价监控', category: '报价运营', keywords: '监控 竞争力监控 异常待处理 异常闭环 爬虫 比价' },
  { path: 'market-trends', label: '市场行情', category: '报价运营', keywords: '行情 最新行情 历史行情 外部价格 趋势' },

  // 用户与商户
  { path: 'user-management', label: '用户管理', category: '用户与商户', keywords: '出卡方 用户 会员 认证 档案 黑名单' },
  { path: 'user-list', label: '用户列表', category: '用户与商户', keywords: '用户 列表 明细 查验' },
  { path: 'user-profile', label: '用户档案', category: '用户与商户', keywords: '档案 画像 KYC' },
  { path: 'user-tags', label: '用户标签', category: '用户与商户', keywords: '标签 分类 特征' },
  { path: 'user-segments', label: '用户分群', category: '用户与商户', keywords: '分群 人群 圈选' },
  { path: 'merchant-management', label: '商户管理', category: '用户与商户', keywords: '接卡商户 产能 席位 额度 履约 档案' },
  { path: 'merchant-list', label: '商户列表', category: '用户与商户', keywords: '商户 列表' },
  { path: 'merchant-profile', label: '商户档案', category: '用户与商户', keywords: '商户 档案 资质' },
  { path: 'merchant-capacity', label: '承接能力', category: '用户与商户', keywords: '产能 承接 额度 质押' },
  { path: 'merchant-anomalies', label: '商户异常记录', category: '用户与商户', keywords: '违规 扣罚 异常 记录' },

  // 运营管理
  { path: 'channel-overview', label: '渠道总览', category: '运营管理', keywords: '渠道 推广 流量 来源 合伙人' },
  { path: 'channel-quality', label: '渠道质量', category: '运营管理', keywords: '渠道 质量 留存 转化' },
  { path: 'channel-user-quality', label: '渠道用户质量', category: '运营管理', keywords: '出卡用户 质量 真实度' },
  { path: 'channel-issues', label: '渠道经营问题', category: '运营管理', keywords: '渠道 问题 掉量 异常' },
  { path: 'growth-overview', label: '增长总览', category: '运营管理', keywords: '增长 漏斗 注册 首单' },
  { path: 'growth-funnel', label: '增长漏斗', category: '运营管理', keywords: '漏斗 转化 各环节' },
  { path: 'growth-cohort', label: '增长人群', category: '运营管理', keywords: '人群 留存 获客' },
  { path: 'growth-conversion-issues', label: '转化问题', category: '运营管理', keywords: '转化 流失 卡点' },
  { path: 'growth-strategy', label: '增长策略', category: '运营管理', keywords: '策略 AI推广 短链' },
  { path: 'merchant-ops-overview', label: '商户经营总览', category: '运营管理', keywords: '商户 经营 供给' },
  { path: 'merchant-tiering', label: '商户分层', category: '运营管理', keywords: '商户 等级 分层 扶持' },
  { path: 'merchant-ops-issues', label: '商户经营问题', category: '运营管理', keywords: '商户 痛点 瓶颈 供给' },
  { path: 'member-levels', label: '会员等级', category: '运营管理', keywords: '会员 等级 规则' },
  { path: 'member-growth', label: '会员成长', category: '运营管理', keywords: '成长 经验 积分' },
  { path: 'member-lifecycle', label: '会员生命周期', category: '运营管理', keywords: '生命周期 沉默 唤醒' },
  { path: 'activity-management', label: '活动管理', category: '运营管理', keywords: '活动 满减 加息 营销' },
  { path: 'activity-config', label: '活动配置', category: '运营管理', keywords: '活动 参数 规则 预算' },
  { path: 'activity-performance', label: '活动效果', category: '运营管理', keywords: '活动 产出 ROI 收益' },
  { path: 'benefit-config', label: '权益配置', category: '运营管理', keywords: '权益 券 模版' },
  { path: 'benefit-distribution', label: '权益发放', category: '运营管理', keywords: '发券 批量 投放' },
  { path: 'benefit-records', label: '权益记录', category: '运营管理', keywords: '核销 消耗 记录' },
  { path: 'plan-management', label: '计划管理', category: '运营管理', keywords: '运营计划 闭环 策略 动作' },
  { path: 'plan-actions', label: '行动项', category: '运营管理', keywords: '执行 追踪 认领' },
  { path: 'plan-verification', label: '效果验证', category: '运营管理', keywords: '复盘 验证 归因' },

  // 风控管理
  { path: 'risk-overview', label: '风控总览', category: '风控管理', keywords: '风控 态势 大盘 规则' },
  { path: 'risk-precheck', label: '交易预检', category: '风控管理', keywords: '交易 预检 Card Check 查验' },
  { path: 'abnormal-cards', label: '异常卡', category: '风控管理', keywords: '异常卡 拦截 撞库 嫌疑' },
  { path: 'card-check-logs', label: '卡查询记录', category: '风控管理', keywords: 'Card Check 查询 日志 存证' },
  { path: 'risk-records', label: '风险记录', category: '风控管理', keywords: '黑名单 封禁 存证 哈希' },

  // 财务结算
  { path: 'points-account', label: '账户管理', category: '财务结算', keywords: '积点账户 钱包 质押 冻结 余额' },
  { path: 'recharge-management', label: '充值管理', category: '财务结算', keywords: '充值 USDT 银行流水 汇款 补水' },
  { path: 'points-management', label: '积点管理', category: '财务结算', keywords: '明细 流水 划转 扣除 收支' },
  { path: 'platform-settlement', label: '结算管理', category: '财务结算', keywords: '结算 日结 提现 代付' },
  { path: 'financial-reconciliation', label: '财务对账', category: '财务结算', keywords: '对账 四账勾稽 轧差 差异' },
  { path: 'abnormal-finance', label: '异常账务', category: '财务结算', keywords: '异常账务 低积点 挂账 挪账 长账龄 结算异常' },

  // 卡工具管理
  { path: 'card-tools-management', label: '工具管理', category: '卡工具管理', keywords: '工具列表 上架 能力配置 调度策略 苹果 蒸汽 网关' },
  { path: 'card-tools-auth', label: '商户授权', category: '卡工具管理', keywords: '商户授权 工具授权 配额 QPS 审计' },
  { path: 'card-tools-query', label: '卡查询', category: '卡工具管理', keywords: '查卡 余额 状态 快充 补全 订单 Apple Steam Target Vanilla' },
  { path: 'card-tools-logs', label: '调用记录', category: '卡工具管理', keywords: '调用日志 异常日志 报文 超时 网关故障' },
  { path: 'card-tools-evidence', label: '证据记录', category: '卡工具管理', keywords: '余额证据 订单证据 时间轴 责任判定 仲裁' },

  // 经营分析
  { path: 'business-overview', label: '经营总览', category: '经营分析', keywords: '经营大盘 GMV 利润 概览 看板' },
  { path: 'analytics-trade', label: '交易经营', category: '经营分析', keywords: '交易分析 卡种 区域 转化' },
  { path: 'user-analytics', label: '用户经营', category: '经营分析', keywords: '用户画像 留存 复购 活跃' },
  { path: 'merchant-analytics', label: '商户经营', category: '经营分析', keywords: '商户产能 集中度 履约时效 拒单率' },
  { path: 'financial-analytics', label: '收益分析', category: '经营分析', keywords: '财务分析 息差 毛利 资金成本' },
  { path: 'service-analytics', label: '客服作业', category: '经营分析', keywords: '客服 效能 响应 时效' },
  { path: 'fulfillment-analytics', label: '商户履约', category: '经营分析', keywords: '履约 核销 时效 违约' },
  { path: 'robot-analytics', label: '自动化效果', category: '经营分析', keywords: '机器人 AI推广 监控预检 效果' },
  { path: 'report-standard', label: '标准报表', category: '经营分析', keywords: '报表 日报 周报 月报 台账' },
  { path: 'report-custom', label: '自定义报表', category: '经营分析', keywords: '自定义 透视 维度' },
  { path: 'report-export', label: '报表导出', category: '经营分析', keywords: '导出 任务 CSV XLSX' },

  // 平台配置
  { path: 'card-config', label: '卡种/SKU配置', category: '平台配置', keywords: '卡种 面额 范围 规则' },
  { path: 'trading-config', label: '交易配置', category: '平台配置', keywords: '交易 规则 撮合 限额' },
  { path: 'rule-quote', label: '报价规则', category: '平台配置', keywords: '报价 浮动 竞价 规则' },
  { path: 'rule-card-check', label: 'Card Check规则', category: '平台配置', keywords: '查卡 接口 超时 重试' },
  { path: 'rule-risk', label: '风控规则', category: '平台配置', keywords: '风控 拦截 阈值 黑名单' },
  { path: 'rule-sla', label: 'SLA规则', category: '平台配置', keywords: 'SLA 时限 超时 催办 强改派' },
  { path: 'rule-loss', label: '损失规则', category: '平台配置', keywords: '损失 责任 兜底 赔付 扣减' },
  { path: 'message-config', label: '消息配置', category: '平台配置', keywords: '消息 短信 邮件 站内信 模板' },
  { path: 'permission-config', label: '权限配置', category: '平台配置', keywords: '权限 角色 账号 认证' },
  { path: 'basic-config', label: '基础配置', category: '平台配置', keywords: '基础配置 本位币 汇率源 系统时钟' },
  { path: 'audit-logs', label: '审计日志', category: '平台配置', keywords: '操作 审计 日志 轨迹' },
];

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  currentRole,
  onRoleChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentRoleConfig = ROLE_DEFINITIONS[currentRole] || ROLE_DEFINITIONS.operations;

  const getBreadcrumb = () => {
    const item = NAV_ITEMS_INDEX.find(n => n.path === currentPath);
    if (!item) {
      if (currentPath === 'workbench' || currentPath === 'workbench-operations' || currentPath === 'workbench-cs' || currentPath === 'workbench-finance') {
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">工作台</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-900">{currentRoleConfig.name}工作台</span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>平台作业端</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900">{currentPath}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span 
          onClick={() => onNavigate('workbench')}
          className="text-slate-500 cursor-pointer hover:text-blue-600 transition-colors"
        >
          {item.category}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-slate-900">{item.label}</span>
      </div>
    );
  };

  const filteredNavItems = searchQuery.trim()
    ? NAV_ITEMS_INDEX.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : NAV_ITEMS_INDEX.slice(0, 8);

  const handleSelectNav = (path: NavPath) => {
    onNavigate(path);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleRoleSelect = (role: UserRole) => {
    onRoleChange(role);
    setShowRoleModal(false);
    const targetPath = ROLE_DEFINITIONS[role]?.primaryPath || 'workbench-operations';
    onNavigate(targetPath);
  };

  return (
    <header className="fixed top-0 left-[240px] right-0 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] z-40 flex items-center justify-between px-6 select-none">
      {/* Left: Clean Breadcrumb & Role tag */}
      <div className="flex items-center gap-3">
        {getBreadcrumb()}
      </div>

      {/* Center: Global Quick Navigator */}
      <div className="relative hidden md:block w-72 lg:w-96">
        <div 
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200/60 cursor-pointer text-xs text-slate-500 transition-colors"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="flex-1 truncate">搜索功能、异常订单、报价运营、对账...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400 shadow-2xs">
            快捷检索
          </kbd>
        </div>

        {/* Search Modal */}
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/40 backdrop-blur-xs">
            <div 
              className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="输入模块名称、业务场景或关键词直达..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <button 
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto p-2">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400">
                  {searchQuery ? '匹配的功能模块' : '常用业务直达'}
                </div>
                {filteredNavItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    未找到匹配的功能，请输入其他关键词
                  </div>
                ) : (
                  filteredNavItems.map(item => (
                    <div
                      key={item.path}
                      onClick={() => handleSelectNav(item.path)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{item.label}</span>
                        <span className="text-[11px] text-slate-400">· {item.category}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Balance Security Callout, Role Switcher, To-Do Center, Notifications & User profile */}
      <div className="flex items-center gap-3">
        {/* 顶栏商户积点余额安全水位卡片 (5.3 Balance Security Callout) */}
        <div
          onClick={() => onNavigate('points-account')}
          className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-emerald-50/80 border-emerald-200/60 text-emerald-900 text-xs cursor-pointer hover:bg-emerald-100/70 transition-colors select-none"
          title="商户积点总水位健康：当前可支撑交易约 14.8 小时"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="text-[11px] text-emerald-800">商户积点:</span>
          <span className="font-mono font-bold text-emerald-950">1,248,500 pts</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">充裕安全</span>
        </div>

        {/* 三大角色切换器 (平台客服/平台运营/平台财务) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleModal(!showRoleModal)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${currentRoleConfig.badgeBg}`}
            type="button"
            title="点击快速切换作业角色 (管经营 / 管问题 / 管账和钱)"
          >
            <span className={`w-2 h-2 rounded-full ${
              currentRole === 'operations' ? 'bg-blue-600 animate-pulse' :
              currentRole === 'customer_service' ? 'bg-emerald-600 animate-pulse' :
              currentRole === 'finance' ? 'bg-amber-600 animate-pulse' :
              currentRole === 'u_rate_manager' ? 'bg-cyan-600 animate-pulse' : 'bg-purple-600'
            }`}></span>
            <span>{currentRoleConfig.name}</span>
            <span className="text-[10px] text-slate-400 font-mono hidden xl:inline">
              ({currentRole === 'customer_service' ? '管问题' : currentRole === 'operations' ? '管经营' : currentRole === 'finance' ? '管账和钱' : currentRole === 'u_rate_manager' ? '管价格' : '管平台'})
            </span>
            <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
          </button>

          {/* 角色切换悬浮面板 */}
          {showRoleModal && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">切换平台作业角色入口</span>
                <span className="text-[10.5px] text-slate-400">同数据 · 不同入口</span>
              </div>
              <div className="py-2 space-y-1.5">
                {(['operations', 'customer_service', 'finance', 'u_rate_manager', 'admin'] as UserRole[]).map(roleKey => {
                  const roleItem = ROLE_DEFINITIONS[roleKey];
                  const active = currentRole === roleKey;
                  return (
                    <div
                      key={roleKey}
                      onClick={() => handleRoleSelect(roleKey)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        active
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            roleKey === 'operations' ? 'bg-blue-600' :
                            roleKey === 'customer_service' ? 'bg-emerald-600' :
                            roleKey === 'finance' ? 'bg-amber-600' :
                            roleKey === 'u_rate_manager' ? 'bg-cyan-600' : 'bg-purple-600'
                          }`}></span>
                          <span className="text-xs font-bold text-slate-900">{roleItem.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                            {roleItem.tagline.split('·')[0]}
                          </span>
                        </div>
                        {active && <Check className="w-4 h-4 text-blue-600 font-bold shrink-0" />}
                      </div>
                      <div className="text-[10.5px] text-slate-500 mt-1 pl-4.5 line-clamp-1">
                        核心职责: {roleItem.coreFocus}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                切换角色后，工作台与左侧菜单将自动按角色职责聚焦呈现
              </div>
            </div>
          )}
        </div>

        {/* Real-time To-Do Center */}
        <TodoCenter onNavigate={onNavigate} />

        {/* Notifications & System Alerts */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="通知中心"
            type="button"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[15px] h-3.5 px-1 rounded-full bg-slate-500 text-white text-[9.5px] font-semibold leading-none">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">系统预警通知 (3)</span>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  全部标为已读
                </button>
              </div>
              <div className="divide-y divide-slate-100 text-xs mt-1 max-h-64 overflow-y-auto">
                <div 
                  onClick={() => { setShowNotifications(false); onNavigate('exception-orders'); }}
                  className="py-2 hover:bg-slate-50 px-1 rounded cursor-pointer"
                >
                  <div className="flex items-center justify-between text-rose-600 font-semibold text-[11px]">
                    <span>[异常单预警] 6笔订单即将到达响应阈值</span>
                    <span className="text-slate-400 font-normal">2m前</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">商户接单超时，请客服快速介入。</p>
                </div>
                <div 
                  onClick={() => { setShowNotifications(false); onNavigate('quote-anomalies'); }}
                  className="py-2 hover:bg-slate-50 px-1 rounded cursor-pointer"
                >
                  <div className="flex items-center justify-between text-amber-600 font-semibold text-[11px]">
                    <span>[报价异常] Apple US $100 偏离基准价</span>
                    <span className="text-slate-400 font-normal">8m前</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">4 家商户报价偏低，已触发批量提醒商户协同。</p>
                </div>
                <div 
                  onClick={() => { setShowNotifications(false); onNavigate('abnormal-finance'); }}
                  className="py-2 hover:bg-slate-50 px-1 rounded cursor-pointer"
                >
                  <div className="flex items-center justify-between text-purple-600 font-semibold text-[11px]">
                    <span>[资金监控] 8 家商户积点处于警戒水位</span>
                    <span className="text-slate-400 font-normal">1h前</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">请财务核实充值流水并下发催补水通知。</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900 leading-tight">{currentRoleConfig.badgeText}</span>
            <span className="text-[10px] text-slate-500">{currentRoleConfig.tagline.split('·')[0]}</span>
          </div>
          <div className={`w-8 h-8 rounded-full ${currentRoleConfig.avatarBg} flex items-center justify-center text-white shadow-xs font-medium text-xs`}>
            {currentRole === 'customer_service' ? (
              <Headphones className="w-4 h-4" />
            ) : currentRole === 'finance' ? (
              <Coins className="w-4 h-4" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
