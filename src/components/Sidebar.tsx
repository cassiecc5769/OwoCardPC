import React, { useState, useEffect, useMemo } from 'react';
import { NavPath, UserRole } from '../types';
import { ROLE_DEFINITIONS } from '../data/rolesData';
import {
  LayoutDashboard,
  Megaphone,
  Headphones,
  Landmark,
  MessageSquare,
  Bell,
  ArrowLeftRight,
  Receipt,
  Gavel,
  Tag,
  Sliders,
  Eye,
  TrendingUp,
  Users,
  User,
  Store,
  Rocket,
  Award,
  ClipboardList,
  Shield,
  Wallet,
  Coins,
  CreditCard,
  Wrench,
  Search,
  BarChart3,
  Activity,
  Zap,
  Table,
  Settings,
  SlidersHorizontal,
  ChevronRight,
  ChevronsUpDown,
  Check,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentPath: NavPath;
  onNavigate: (path: NavPath) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

// 现代扁平导航项结构，支持细粒度角色权限过滤
interface MenuItemLeaf {
  type: 'leaf';
  title: string;
  path: NavPath;
  icon?: string;
  badge?: string | number;
  badgeColor?: string;
  roles?: UserRole[]; // 若未定义则全部角色可见；定义后仅指定角色或管理员可见
}

interface MenuItemBranch {
  type: 'branch';
  title: string;
  icon?: string;
  defaultPath?: NavPath;
  children: MenuItemLeaf[];
  roles?: UserRole[];
}

interface MenuGroup {
  groupTitle: string;
  tagline?: string;
  icon?: string;
  roles?: UserRole[];
  items: (MenuItemLeaf | MenuItemBranch)[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  currentRole,
  onRoleChange,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const currentRoleConfig = ROLE_DEFINITIONS[currentRole] || ROLE_DEFINITIONS.operations;

  // 10 大核心模块完整权限映射表 (严格遵循架构规范表)
  const ALL_MENU_STRUCTURE: MenuGroup[] = [
    // 1. 工作台 (今天我要处理什么)
    {
      groupTitle: '工作台',
      tagline: '今天我要处理什么',
      icon: 'dashboard',
      items: [
        { type: 'leaf', title: '运营工作台', path: 'workbench-operations', icon: 'campaign', roles: ['operations', 'u_rate_manager'] },
        { type: 'leaf', title: '客服工作台', path: 'workbench-cs', icon: 'support_agent', roles: ['customer_service', 'operations'] },
        { type: 'leaf', title: '财务工作台', path: 'workbench-finance', icon: 'account_balance', roles: ['finance'] },
        { type: 'leaf', title: '在线客服', path: 'online-service', icon: 'chat', badge: '实时', badgeColor: 'bg-emerald-100 text-emerald-800', roles: ['customer_service'] },
        { type: 'leaf', title: '我的消息', path: 'my-messages', icon: 'notifications', badge: 2, badgeColor: 'bg-rose-500 text-white' },
      ],
    },

    // 2. 交易管理 (每笔交易发生了什么)
    {
      groupTitle: '交易管理',
      tagline: '每笔交易发生了什么',
      icon: 'swap_horiz',
      roles: ['customer_service', 'operations', 'finance', 'u_rate_manager'],
      items: [
        { type: 'leaf', title: '卡单管理', path: 'order-management', icon: 'receipt_long' },
        { type: 'leaf', title: '售后争议', path: 'dispute-resolution', icon: 'gavel', badge: 2, badgeColor: 'bg-purple-100 text-purple-700', roles: ['customer_service', 'operations', 'finance'] },
      ],
    },

    // 3. 报价运营 (平台报价有没有竞争力)
    {
      groupTitle: '报价运营',
      tagline: '平台报价有没有竞争力',
      icon: 'price_change',
      roles: ['operations', 'u_rate_manager', 'customer_service'],
      items: [
        { type: 'leaf', title: '报价管理', path: 'quote-management', icon: 'tune', roles: ['operations', 'u_rate_manager'] },
        { type: 'leaf', title: '报价监控', path: 'quote-monitor', icon: 'visibility', badge: 8, badgeColor: 'bg-amber-100 text-amber-800', roles: ['operations', 'u_rate_manager', 'customer_service'] },
        { type: 'leaf', title: '市场行情', path: 'market-trends', icon: 'trending_up', roles: ['operations', 'u_rate_manager', 'customer_service'] },
      ],
    },

    // 4. 用户与商户 (用户和商户是谁)
    {
      groupTitle: '用户与商户',
      tagline: '用户和商户是谁',
      icon: 'groups',
      roles: ['operations', 'customer_service', 'finance'],
      items: [
        { type: 'leaf', title: '用户管理', path: 'user-management', icon: 'person', roles: ['operations', 'customer_service'] },
        { type: 'leaf', title: '商户管理', path: 'merchant-management', icon: 'storefront', roles: ['operations', 'customer_service', 'finance'] },
      ],
    },

    // 5. 运营管理 (怎么改善经营)
    {
      groupTitle: '运营管理',
      tagline: '怎么改善经营',
      icon: 'rocket_launch',
      roles: ['operations'],
      items: [
        { type: 'leaf', title: '增长运营', path: 'growth-overview', icon: 'trending_up' },
        { type: 'leaf', title: '商户运营', path: 'merchant-ops-overview', icon: 'store' },
        { type: 'leaf', title: '会员运营', path: 'member-levels', icon: 'card_membership' },
        { type: 'leaf', title: '运营计划', path: 'operation-plans', icon: 'assignment' },
      ],
    },

    // 6. 风控管理 (有什么风险、怎么处置)
    {
      groupTitle: '风控管理',
      tagline: '有什么风险、怎么处置',
      icon: 'security',
      roles: ['operations', 'customer_service'],
      items: [
        { type: 'leaf', title: '风控总览', path: 'risk-overview', icon: 'shield', roles: ['operations'] },
        { type: 'leaf', title: '风险监控', path: 'risk-monitor', icon: 'warning', badge: 3, badgeColor: 'bg-rose-100 text-rose-700', roles: ['operations', 'customer_service'] },
      ],
    },

    // 7. 财务结算 (钱在哪里、怎么结、哪里有问题)
    {
      groupTitle: '财务结算',
      tagline: '钱在哪里、怎么结、哪里有问题',
      icon: 'account_balance_wallet',
      roles: ['finance'],
      items: [
        { type: 'leaf', title: '资金账户', path: 'points-account', icon: 'wallet' },
        { type: 'leaf', title: '结算对账', path: 'platform-settlement', icon: 'payments' },
        { type: 'leaf', title: '财务异常', path: 'abnormal-finance', icon: 'credit_card_off', badge: 1, badgeColor: 'bg-rose-100 text-rose-700' },
      ],
    },

    // 8. 卡工具管理 (有什么工具、谁能用、调用过什么)
    {
      groupTitle: '卡工具管理',
      tagline: '有什么工具、谁能用、调用过什么',
      icon: 'build',
      roles: ['operations', 'customer_service', 'u_rate_manager'],
      items: [
        { type: 'leaf', title: '工具管理', path: 'card-tools-management', icon: 'handyman' },
        { type: 'leaf', title: '卡查询', path: 'card-tools-query', icon: 'search_check' },
        { type: 'leaf', title: '工具记录', path: 'card-tools-records', icon: 'receipt_long' },
      ],
    },

    // 9. 经营分析 (经营结果怎么样、为什么)
    {
      groupTitle: '经营分析',
      tagline: '经营结果怎么样、为什么',
      icon: 'insights',
      roles: ['operations', 'finance', 'customer_service', 'u_rate_manager'],
      items: [
        { type: 'leaf', title: '经营总览', path: 'business-overview', icon: 'analytics', roles: ['operations', 'finance'] },
        { type: 'leaf', title: '经营专题', path: 'analytics-trade', icon: 'query_stats', roles: ['operations', 'finance', 'u_rate_manager'] },
        { type: 'leaf', title: '作业效能', path: 'service-analytics', icon: 'speed', roles: ['operations', 'customer_service'] },
        { type: 'leaf', title: '报表中心', path: 'report-standard', icon: 'table_chart', roles: ['operations', 'finance', 'u_rate_manager'] },
      ],
    },

    // 10. 平台配置 (平台按照什么规则运行)
    {
      groupTitle: '平台配置',
      tagline: '平台按照什么规则运行',
      icon: 'settings',
      roles: ['operations', 'u_rate_manager', 'admin'],
      items: [
        { type: 'leaf', title: '业务配置', path: 'card-config', icon: 'credit_card', roles: ['operations', 'u_rate_manager'] },
        { type: 'leaf', title: '规则配置', path: 'rule-quote', icon: 'rule', roles: ['operations', 'u_rate_manager'] },
        { type: 'leaf', title: '权限管理', path: 'permission-config', icon: 'admin_panel_settings', roles: ['admin'] },
        { type: 'leaf', title: '系统管理', path: 'basic-config', icon: 'manufacturing', roles: ['admin'] },
      ],
    },
  ];

  // 校验当前角色是否可见
  const isItemVisible = (itemRoles?: UserRole[]) => {
    if (currentRole === 'admin') return true;
    if (!itemRoles || itemRoles.length === 0) return true;
    return itemRoles.includes(currentRole);
  };

  // 根据当前角色动态过滤计算可见菜单
  const visibleMenuStructure = useMemo(() => {
    return ALL_MENU_STRUCTURE.map(group => {
      // 检查分组本身权限
      if (group.roles && currentRole !== 'admin' && !group.roles.includes(currentRole)) {
        return null;
      }

      const filteredItems = group.items.map(item => {
        if (item.type === 'leaf') {
          return isItemVisible(item.roles) ? item : null;
        }
        // 分支菜单 (branch)
        if (!isItemVisible(item.roles)) return null;
        const filteredChildren = item.children.filter(child => isItemVisible(child.roles));
        if (filteredChildren.length === 0) return null;
        return {
          ...item,
          children: filteredChildren,
        };
      }).filter(Boolean) as (MenuItemLeaf | MenuItemBranch)[];

      if (filteredItems.length === 0) return null;

      return {
        ...group,
        items: filteredItems,
      };
    }).filter(Boolean) as MenuGroup[];
  }, [currentRole]);

  // 展开状态记录 (二级折叠项)
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({
    '用户管理': true,
    '商户管理': false,
    '渠道运营': false,
    '增长运营': false,
    '商户运营': false,
    '会员运营': false,
    '活动运营': false,
    '权益管理': false,
    '运营计划': false,
    '经营专题': false,
    '作业效能': false,
    '报表中心': false,
    '规则配置': false,
  });

  // 自动展开包含当前选中的分支
  useEffect(() => {
    visibleMenuStructure.forEach(group => {
      group.items.forEach(item => {
        if (item.type === 'branch') {
          const hasActiveChild = item.children.some(c => c.path === currentPath);
          if (hasActiveChild) {
            setOpenBranches(prev => ({ ...prev, [item.title]: true }));
          }
        }
      });
    });
  }, [currentPath, visibleMenuStructure]);

  const toggleBranch = (title: string, defaultPath?: NavPath) => {
    setOpenBranches(prev => ({ ...prev, [title]: !prev[title] }));
    if (defaultPath && !isBranchActive(title)) {
      onNavigate(defaultPath);
    }
  };

  const isBranchActive = (branchTitle: string) => {
    for (const group of visibleMenuStructure) {
      for (const item of group.items) {
        if (item.type === 'branch' && item.title === branchTitle) {
          return item.children.some(c => c.path === currentPath);
        }
      }
    }
    return false;
  };

  const isPathActive = (path: NavPath) => {
    if (currentPath === path) return true;
    if (path === 'workbench-operations' && currentPath === 'workbench' && currentRole === 'operations') return true;
    if (path === 'workbench-cs' && currentPath === 'workbench' && currentRole === 'customer_service') return true;
    if (path === 'workbench-finance' && currentPath === 'workbench' && currentRole === 'finance') return true;
    if (path === 'workbench-cs' && (currentPath === 'workbench-cs-orders' || currentPath === 'workbench-cs-merchant' || currentPath === 'workbench-cs-promotion')) return true;
    if (path === 'order-management' && (currentPath === 'order-management' || currentPath === 'exception-orders' || currentPath === 'transaction-operations')) return true;
    if (path === 'dispute-resolution' && (currentPath === 'dispute-resolution' || currentPath === 'claim-audit')) return true;
    if (path === 'quote-management' && (currentPath === 'quote-management' || currentPath === 'quote-operations' || currentPath === 'quote-realtime' || currentPath === 'price-adjust-logs')) return true;
    if (path === 'quote-monitor' && (currentPath === 'quote-monitor' || currentPath === 'quote-anomalies')) return true;
    if (path === 'market-trends' && currentPath === 'market-trends') return true;
    if (path === 'user-management' && (currentPath === 'user-management' || currentPath === 'user-list' || currentPath === 'user-profile' || currentPath === 'user-tags' || currentPath === 'user-segments' || currentPath === 'user-operations')) return true;
    if (path === 'merchant-management' && (currentPath === 'merchant-management' || currentPath === 'merchant-list' || currentPath === 'merchant-profile' || currentPath === 'merchant-capacity' || currentPath === 'merchant-anomalies' || currentPath === 'merchant-operations')) return true;
    if (path === 'growth-overview' && (currentPath === 'growth-overview' || currentPath === 'growth-funnel' || currentPath === 'growth-cohort' || currentPath === 'growth-conversion-issues' || currentPath === 'growth-strategy' || currentPath === 'growth-operations' || currentPath === 'campaign-promotion' || currentPath === 'promotion-operations' || currentPath === 'channel-overview')) return true;
    if (path === 'merchant-ops-overview' && (currentPath === 'merchant-ops-overview' || currentPath === 'merchant-tiering' || currentPath === 'merchant-ops-issues' || currentPath === 'merchant-ops')) return true;
    if (path === 'member-levels' && (currentPath === 'member-levels' || currentPath === 'member-growth' || currentPath === 'member-lifecycle' || currentPath === 'member-operations' || currentPath === 'activity-management' || currentPath === 'benefit-config')) return true;
    if (path === 'operation-plans' && (currentPath === 'operation-plans' || currentPath === 'plan-management' || currentPath === 'plan-actions' || currentPath === 'plan-verification')) return true;
    if (path === 'risk-overview' && (currentPath === 'risk-overview' || currentPath === 'risk-precheck')) return true;
    if (path === 'risk-monitor' && (currentPath === 'risk-monitor' || currentPath === 'abnormal-cards' || currentPath === 'risk-records')) return true;
    if (path === 'points-account' && (currentPath === 'points-account' || currentPath === 'recharge-management' || currentPath === 'points-management' || currentPath === 'points-transactions' || currentPath === 'points-flow')) return true;
    if (path === 'platform-settlement' && (currentPath === 'platform-settlement' || currentPath === 'financial-reconciliation' || currentPath === 'merchant-reconciliation')) return true;
    if (path === 'abnormal-finance' && (currentPath === 'abnormal-finance' || currentPath === 'discrepancy-accounts')) return true;
    if (path === 'card-tools-management' && (currentPath === 'card-tools-management' || currentPath === 'card-tools-auth' || currentPath === 'card-tools')) return true;
    if (path === 'card-tools-query' && (currentPath === 'card-tools-query' || currentPath === 'card-tools-apple')) return true;
    if (path === 'card-tools-logs' && (currentPath === 'card-tools-logs' || currentPath === 'card-tools-records' || currentPath === 'card-tools-evidence')) return true;
    if (path === 'business-overview' && currentPath === 'business-overview') return true;
    if (path === 'analytics-trade' && (currentPath === 'analytics-trade' || currentPath === 'analytics-special' || currentPath === 'transaction-analytics' || currentPath === 'user-analytics' || currentPath === 'merchant-analytics' || currentPath === 'financial-analytics')) return true;
    if (path === 'service-analytics' && (currentPath === 'service-analytics' || currentPath === 'fulfillment-analytics' || currentPath === 'robot-analytics' || currentPath === 'efficiency-analytics')) return true;
    if (path === 'report-standard' && (currentPath === 'report-standard' || currentPath === 'report-custom' || currentPath === 'report-export' || currentPath === 'report-center' || currentPath === 'data-reports')) return true;
    if (path === 'card-config' && (currentPath === 'card-config' || currentPath === 'card-catalog' || currentPath === 'trading-config' || currentPath === 'business-config')) return true;
    if (path === 'rule-quote' && (currentPath === 'rule-quote' || currentPath === 'rule-card-check' || currentPath === 'rule-risk' || currentPath === 'rule-sla' || currentPath === 'rule-loss' || currentPath === 'rules-config' || currentPath === 'trading-rules')) return true;
    if (path === 'permission-config' && currentPath === 'permission-config') return true;
    if (path === 'basic-config' && (currentPath === 'basic-config' || currentPath === 'system-management' || currentPath === 'message-config' || currentPath === 'audit-logs')) return true;
    return false;
  };

  // 角色切换联动处理：更新角色状态并自动导航至该角色的首要工作台
  const handleRoleSelect = (role: UserRole) => {
    onRoleChange(role);
    setRoleMenuOpen(false);
    const targetPath = ROLE_DEFINITIONS[role]?.primaryPath || 'workbench-operations';
    onNavigate(targetPath);
  };

  // 图标映射映射表，防止 WebFont 字体加载受阻时降级为巨大英文字符
  const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
    dashboard: LayoutDashboard,
    campaign: Megaphone,
    support_agent: Headphones,
    account_balance: Landmark,
    chat: MessageSquare,
    notifications: Bell,
    swap_horiz: ArrowLeftRight,
    receipt_long: Receipt,
    gavel: Gavel,
    price_change: Tag,
    tune: Sliders,
    visibility: Eye,
    trending_up: TrendingUp,
    groups: Users,
    person: User,
    storefront: Store,
    rocket_launch: Rocket,
    store: Store,
    card_membership: Award,
    assignment: ClipboardList,
    security: Shield,
    shield: Shield,
    warning: AlertTriangle,
    account_balance_wallet: Wallet,
    wallet: Wallet,
    payments: Coins,
    credit_card_off: CreditCard,
    build: Wrench,
    handyman: Wrench,
    search_check: Search,
    insights: BarChart3,
    analytics: BarChart3,
    query_stats: Activity,
    speed: Zap,
    table_chart: Table,
    credit_card: CreditCard,
    rule: SlidersHorizontal,
    admin_panel_settings: ShieldCheck,
    manufacturing: Settings,
  };

  // 渲染菜单图标
  const renderMenuIcon = (iconName: string, active: boolean) => {
    if (iconName === 'apple') {
      return (
        <span className={`w-5 h-5 flex items-center justify-center shrink-0 ${active ? 'text-white' : 'text-slate-400'}`}>
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.77 1.05-1.84.93-2.92-.93.04-2.02.63-2.67 1.4-.58.68-.99 1.77-.85 2.83 1.03.08 2.07-.58 2.59-1.31z" />
          </svg>
        </span>
      );
    }
    const IconComponent = ICON_MAP[iconName] || LayoutDashboard;
    return (
      <span className={`w-5 h-5 flex items-center justify-center shrink-0 ${active ? 'text-white' : 'text-slate-400'}`}>
        <IconComponent className="w-4 h-4" />
      </span>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-slate-200/90 shadow-[1px_0_4px_rgba(0,0,0,0.02)] z-50 flex flex-col justify-between overflow-y-auto select-none custom-scroll">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div 
          onClick={() => onNavigate(currentRoleConfig.primaryPath)} 
          className="h-14 px-4 flex items-center gap-2.5 border-b border-slate-100 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs font-bold shrink-0">
            <CreditCard className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13.5px] font-bold text-slate-900 tracking-tight leading-tight truncate">
              平台作业端
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              OWO 运营控制中心
            </span>
          </div>
        </div>

        {/* 角色身份切换卡 (切换登录角色实时联动菜单) */}
        <div className="p-2.5 border-b border-slate-100 bg-slate-50/70 relative">
          <div className="text-[10px] text-slate-400 font-medium px-1 pb-1.5 flex items-center justify-between">
            <span>当前登录角色</span>
            <span className="text-[9.5px] text-blue-600 font-medium">
              {currentRole === 'admin' ? '全域权限' : `${visibleMenuStructure.length}个可见模块`}
            </span>
          </div>

          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className={`w-full px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${currentRoleConfig.badgeBg}`}
            type="button"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                currentRole === 'operations' ? 'bg-blue-600' :
                currentRole === 'customer_service' ? 'bg-emerald-600' :
                currentRole === 'finance' ? 'bg-amber-600' :
                currentRole === 'u_rate_manager' ? 'bg-cyan-600' : 'bg-purple-600'
              }`}></span>
              <div className="flex flex-col text-left truncate">
                <span className="text-xs font-bold leading-tight truncate">{currentRoleConfig.name}</span>
                <span className="text-[9.5px] opacity-75 truncate">{currentRoleConfig.shortName}</span>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 opacity-70 shrink-0" />
          </button>

          {/* 角色切换下拉弹窗 */}
          {roleMenuOpen && (
            <div className="absolute left-2.5 right-2.5 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 space-y-1">
              {(['operations', 'customer_service', 'finance', 'u_rate_manager', 'admin'] as UserRole[]).map(roleKey => {
                const item = ROLE_DEFINITIONS[roleKey];
                const active = currentRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    onClick={() => handleRoleSelect(roleKey)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer flex flex-col ${
                      active ? 'bg-slate-100 font-bold text-slate-900 border border-slate-200' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          roleKey === 'operations' ? 'bg-blue-600' :
                          roleKey === 'customer_service' ? 'bg-emerald-600' :
                          roleKey === 'finance' ? 'bg-amber-600' :
                          roleKey === 'u_rate_manager' ? 'bg-cyan-600' : 'bg-purple-600'
                        }`}></span>
                        <span>{item.name}</span>
                      </div>
                      {active && <Check className="w-3.5 h-3.5 text-blue-600 font-bold shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 truncate pl-3.5">
                      {item.tagline}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 动态角色联动过滤后的纯净菜单列表 */}
        <nav className="px-2.5 py-3 flex flex-col gap-4 pb-8">
          {visibleMenuStructure.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col">
              {/* 分组标题与定位 */}
              <div className="px-2.5 pb-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider">
                <span>{group.groupTitle}</span>
                {group.tagline && (
                  <span className="text-[9.5px] font-normal text-slate-400/80 truncate max-w-[110px]" title={group.tagline}>
                    {group.tagline}
                  </span>
                )}
              </div>

              {/* 菜单项列表 */}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item, itemIdx) => {
                  if (item.type === 'leaf') {
                    const active = isPathActive(item.path);
                    return (
                      <button
                        key={itemIdx}
                        type="button"
                        onClick={() => onNavigate(item.path)}
                        className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left transition-all text-xs cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white font-medium shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {item.icon && renderMenuIcon(item.icon, active)}
                          <span className="truncate">{item.title}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-1 shrink-0 ${
                            active ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-200 text-slate-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  }

                  // 二级折叠分支 (如 客服工作台、用户管理、渠道运营等)
                  const isBranchOpen = openBranches[item.title] ?? false;
                  const branchActive = isBranchActive(item.title);

                  return (
                    <div key={itemIdx} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => toggleBranch(item.title, item.defaultPath)}
                        className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left transition-all text-xs cursor-pointer ${
                          branchActive && !isBranchOpen
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {item.icon && renderMenuIcon(item.icon, branchActive)}
                          <span className="truncate">{item.title}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                          isBranchOpen ? 'rotate-90 text-slate-600' : ''
                        }`} />
                      </button>

                      {/* 子项列表：纯净内缩进 */}
                      {isBranchOpen && (
                        <div className="flex flex-col gap-0.5 pl-6 pr-1 py-0.5">
                          {item.children.map((sub, subIdx) => {
                            const subActive = isPathActive(sub.path);
                            return (
                              <button
                                key={subIdx}
                                type="button"
                                onClick={() => onNavigate(sub.path)}
                                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-left transition-all text-[11.5px] cursor-pointer ${
                                  subActive
                                    ? 'bg-blue-600 text-white font-medium shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    subActive ? 'bg-white' : 'bg-slate-300'
                                  }`}></span>
                                  <span className="truncate">{sub.title}</span>
                                </div>
                                {sub.badge !== undefined && (
                                  <span className={`text-[9px] font-mono px-1 py-0.2 rounded-full font-bold ml-1 shrink-0 ${
                                    subActive ? 'bg-white/20 text-white' : sub.badgeColor || 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {sub.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Status Footer */}
      <div className="p-3 border-t border-slate-100 bg-white text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-600 font-medium">{currentRoleConfig.name}视角</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {visibleMenuStructure.length} 模块可见
        </span>
      </div>
    </aside>
  );
};
