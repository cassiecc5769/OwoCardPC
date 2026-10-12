import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { NavPath, UserItem, UserRole } from './types';
import { INITIAL_USERS } from './data/mockData';
import { ROLE_DEFINITIONS } from './data/rolesData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OperationsCockpit } from './components/workbench/OperationsCockpit';
import { CustomerServiceCockpit } from './components/workbench/CustomerServiceCockpit';
import { FinanceCockpit } from './components/workbench/FinanceCockpit';
import { UserManagementView } from './components/UserManagementView';
import { OrderManagementView } from './components/OrderManagementView';
import { QuoteManagementView } from './components/QuoteManagementView';
import { TransactionOperationsView } from './components/TransactionOperationsView';
import { ExceptionOrdersView } from './components/ExceptionOrdersView';
import { DisputeResolutionView } from './components/DisputeResolutionView';
import { PointsTransactionsView } from './components/PointsTransactionsView';
import { FinanceAccountManagementView } from './components/FinanceAccountManagementView';
import { RechargeManagementView } from './components/RechargeManagementView';
import { SettlementManagementView } from './components/SettlementManagementView';
import { FinancialReconciliationView } from './components/FinancialReconciliationView';
import { AbnormalFinanceView } from './components/AbnormalFinanceView';
import { MerchantManagementView } from './components/MerchantManagementView';
import { GrowthOperationsView } from './components/GrowthOperationsView';
import { OperationPlansView } from './components/OperationPlansView';
import { BusinessOverviewView } from './components/BusinessOverviewView';
import { TransactionAnalyticsView } from './components/TransactionAnalyticsView';
import { UserAnalyticsView } from './components/UserAnalyticsView';
import { MerchantAnalyticsView } from './components/MerchantAnalyticsView';
import { FinancialAnalyticsView } from './components/FinancialAnalyticsView';
import { CardConfigView } from './components/CardConfigView';
import { TradingConfigView } from './components/trading-config/TradingConfigView';
import { RulesConfigView, RuleCategory } from './components/rules-config/RulesConfigView';
import { MessageConfigView } from './components/MessageConfigView';
import { BasicConfigView } from './components/BasicConfigView';
import { AiPromotionView } from './components/growth/ai-promotion/AiPromotionView';
import { RiskManagementView } from './components/risk/RiskManagementView';
import { RiskMonitorView } from './components/risk/RiskMonitorView';
import { RobotAnalyticsView } from './components/analytics/RobotAnalyticsView';
import { CardToolsManagementView } from './components/cardtools/CardToolsManagementView';
import { CardQueryView } from './components/cardtools/CardQueryView';
import { ToolRecordsView } from './components/cardtools/ToolRecordsView';
import { OnlineServiceView } from './components/workbench/OnlineServiceView';
import { MyMessagesView } from './components/workbench/MyMessagesView';
import { BusinessReportsView } from './components/analytics/BusinessReportsView';
import { SpecializedAnalyticsView } from './components/analytics/SpecializedAnalyticsView';
import { OperationalEfficiencyView } from './components/analytics/efficiency/OperationalEfficiencyView';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-6 bg-white rounded-2xl border border-rose-200 shadow-sm max-w-xl mx-auto text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-1">页面组件加载异常</h3>
          <p className="text-slate-500 text-xs mb-4">
            {this.state.error?.message || '请尝试点击下方按钮重置当前视图'}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              if (this.props.onReset) this.props.onReset();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            返回客服工作台
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      return (localStorage.getItem('jremix_current_role') as UserRole) || 'customer_service';
    } catch {
      return 'customer_service';
    }
  });

  const [currentPath, setCurrentPath] = useState<NavPath>(() => {
    try {
      return (localStorage.getItem('jremix_current_path') as NavPath) || 'workbench-cs';
    } catch {
      return 'workbench-cs';
    }
  });

  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);

  useEffect(() => {
    try {
      localStorage.setItem('jremix_current_role', currentRole);
    } catch {}
  }, [currentRole]);

  useEffect(() => {
    try {
      localStorage.setItem('jremix_current_path', currentPath);
    } catch {}
  }, [currentPath]);

  const handleUpdateUser = (updatedUser: UserItem) => {
    setUsers(prev => {
      const exists = prev.some(u => u.id === updatedUser.id);
      if (exists) {
        return prev.map(u => (u.id === updatedUser.id ? updatedUser : u));
      }
      return [updatedUser, ...prev];
    });
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    const targetPath = ROLE_DEFINITIONS[role]?.primaryPath || 'workbench-operations';
    setCurrentPath(targetPath);
  };

  const isGrowthRoute = (path: NavPath) =>
    path === 'channel-management' ||
    path === 'channel-operations' ||
    path === 'channel-overview' ||
    path === 'channel-quality' ||
    path === 'channel-user-quality' ||
    path === 'channel-issues' ||
    path === 'growth-operations' ||
    path === 'growth-overview' ||
    path === 'growth-funnel' ||
    path === 'growth-cohort' ||
    path === 'growth-conversion-issues' ||
    path === 'growth-strategy' ||
    path === 'merchant-ops' ||
    path === 'merchant-ops-overview' ||
    path === 'merchant-tiering' ||
    path === 'merchant-ops-issues' ||
    path === 'member-operations' ||
    path === 'member-levels' ||
    path === 'member-growth' ||
    path === 'member-lifecycle' ||
    path === 'activity-operations' ||
    path === 'activity-management' ||
    path === 'activity-config' ||
    path === 'activity-performance' ||
    path === 'benefit-management' ||
    path === 'benefit-config' ||
    path === 'benefit-distribution' ||
    path === 'benefit-records' ||
    path === 'benefits-governance' ||
    path === 'coupon-management' ||
    path === 'marketing-assets' ||
    path === 'campaign-promotion' ||
    path === 'promotion-operations';

  // 渲染当前角色对应的工作台
  const renderRoleWorkbench = () => {
    if (currentRole === 'customer_service') {
      return <CustomerServiceCockpit onNavigate={setCurrentPath} />;
    }
    if (currentRole === 'finance') {
      return <FinanceCockpit onNavigate={setCurrentPath} />;
    }
    // operations 或 admin
    return <OperationsCockpit onNavigate={setCurrentPath} />;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0b1c30]">
      {/* 240px Fixed Left Sidebar with Role Switcher & Dynamic Domain Filtering */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={setCurrentPath}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
      />

      {/* Main Content Area */}
      <div className="pl-[240px]">
        <Header
          currentPath={currentPath}
          onNavigate={setCurrentPath}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
        />

        <main className="w-full pt-14 px-6 pb-8 bg-[#f8fafc]">
          <ErrorBoundary onReset={() => setCurrentPath('workbench-cs')}>
            {/* 01 工作台：根据当前角色自动呈现对应的角色工作台 */}
          {currentPath === 'workbench' && renderRoleWorkbench()}

          {/* 显式支持直接跳转指定工作台 */}
          {currentPath === 'workbench-operations' && (
            <OperationsCockpit onNavigate={setCurrentPath} />
          )}
          {(currentPath === 'workbench-cs' ||
            currentPath === 'workbench-cs-orders' ||
            currentPath === 'workbench-cs-merchant' ||
            currentPath === 'workbench-cs-promotion') && (
            <CustomerServiceCockpit onNavigate={setCurrentPath} />
          )}
          {currentPath === 'workbench-finance' && (
            <FinanceCockpit onNavigate={setCurrentPath} />
          )}
          {currentPath === 'online-service' && (
            <OnlineServiceView onNavigate={setCurrentPath} />
          )}
          {currentPath === 'my-messages' && (
            <MyMessagesView onNavigate={setCurrentPath} />
          )}

          {/* 02 交易管理 */}
          {currentPath === 'order-management' && (
            <OrderManagementView onNavigate={setCurrentPath} />
          )}
          {(currentPath === 'transaction-operations' || currentPath === 'exception-handling') && (
            <TransactionOperationsView onNavigate={setCurrentPath} />
          )}
          {currentPath === 'exception-orders' && (
            <ExceptionOrdersView onNavigate={setCurrentPath} />
          )}
          {(currentPath === 'dispute-resolution' || currentPath === 'claim-audit') && (
            <DisputeResolutionView onNavigate={setCurrentPath} />
          )}

          {/* 03 报价运营 */}
          {(currentPath === 'quote-management' ||
            currentPath === 'quote-operations' ||
            currentPath === 'quote-monitor' ||
            currentPath === 'quote-realtime' ||
            currentPath === 'quote-anomalies' ||
            currentPath === 'market-trends' ||
            currentPath === 'price-adjust-logs') && (
            <QuoteManagementView
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          )}

          {/* 04 用户与商户 */}
          {(currentPath === 'user-management' ||
            currentPath === 'user-list' ||
            currentPath === 'user-profile' ||
            currentPath === 'user-tags' ||
            currentPath === 'user-segments' ||
            currentPath === 'user-operations') && (
            <UserManagementView
              users={users}
              onUpdateUser={handleUpdateUser}
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          )}
          {(currentPath === 'merchant-management' ||
            currentPath === 'merchant-list' ||
            currentPath === 'merchant-profile' ||
            currentPath === 'merchant-capacity' ||
            currentPath === 'merchant-anomalies' ||
            currentPath === 'merchant-operations') && (
            <MerchantManagementView
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          )}

          {/* 05 运营管理 */}
          {(currentPath === 'operation-plans' ||
            currentPath === 'plan-management' ||
            currentPath === 'plan-actions' ||
            currentPath === 'plan-verification') && (
            <OperationPlansView onNavigate={setCurrentPath} />
          )}
          {currentPath === 'ai-promotion' && (
            <AiPromotionView onNavigate={setCurrentPath} />
          )}
          {isGrowthRoute(currentPath) && (
            <GrowthOperationsView
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          )}

          {/* 06 风控管理 */}
          {(currentPath === 'risk-management' ||
            currentPath === 'risk-overview' ||
            currentPath === 'risk-precheck' ||
            currentPath === 'risk-trends') && (
            <RiskManagementView
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          )}
          {(currentPath === 'risk-monitor' ||
            currentPath === 'abnormal-cards' ||
            currentPath === 'card-check-logs' ||
            currentPath === 'risk-records' ||
            currentPath === 'risk-rules') && (
            <RiskMonitorView
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          )}

          {/* 07 财务结算 */}
          {(currentPath === 'points-account' || currentPath === 'collateral-management') && (
            <FinanceAccountManagementView onNavigate={setCurrentPath} />
          )}
          {currentPath === 'recharge-management' && (
            <RechargeManagementView onNavigate={setCurrentPath} />
          )}
          {(currentPath === 'points-management' ||
            currentPath === 'points-transactions' ||
            currentPath === 'points-flow' ||
            currentPath === '03-points-flow') && (
            <PointsTransactionsView onNavigate={setCurrentPath} />
          )}
          {currentPath === 'platform-settlement' && (
            <SettlementManagementView onNavigate={setCurrentPath} />
          )}
          {(currentPath === 'financial-reconciliation' ||
            currentPath === 'merchant-reconciliation') && (
            <FinancialReconciliationView onNavigate={setCurrentPath} />
          )}
          {(currentPath === 'abnormal-finance' || currentPath === 'discrepancy-accounts') && (
            <AbnormalFinanceView onNavigate={setCurrentPath} />
          )}

          {/* 08 卡工具管理 */}
          {(currentPath === 'card-tools' ||
            currentPath === 'card-tools-management' ||
            currentPath === 'card-tools-auth' ||
            currentPath === 'card-tools-apple' ||
            currentPath === 'card-tools-batch') && (
            <CardToolsManagementView
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          )}
          {currentPath === 'card-tools-query' && (
            <CardQueryView
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          )}
          {(currentPath === 'card-tools-records' ||
            currentPath === 'card-tools-logs' ||
            currentPath === 'card-tools-evidence' ||
            currentPath === 'card-tools-order') && (
            <ToolRecordsView
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          )}

          {/* 09 经营分析 */}
          {currentPath === 'business-overview' && (
            <BusinessOverviewView onNavigate={setCurrentPath} />
          )}
          {(currentPath === 'analytics-trade' ||
            currentPath === 'analytics-special' ||
            currentPath === 'transaction-analytics' ||
            currentPath === 'user-analytics' ||
            currentPath === 'merchant-analytics' ||
            currentPath === 'financial-analytics' ||
            currentPath === 'growth-analytics' ||
            currentPath === 'channel-analytics' ||
            currentPath === 'fulfillment-analytics') && (
            <SpecializedAnalyticsView
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          )}
          {(currentPath === 'service-analytics' ||
            currentPath === 'efficiency-analytics' ||
            currentPath === 'robot-analytics') && (
            <OperationalEfficiencyView
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          )}
          {(currentPath === 'report-standard' ||
            currentPath === 'report-custom' ||
            currentPath === 'report-export' ||
            currentPath === 'data-reports') && (
            <BusinessReportsView
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          )}

          {/* 10 平台配置 */}
          {(currentPath === 'card-config' || currentPath === 'card-catalog') && (
            <CardConfigView onNavigate={setCurrentPath} />
          )}
          {currentPath === 'trading-config' && (
            <TradingConfigView onNavigate={setCurrentPath} />
          )}
          {(currentPath === 'trading-rules' ||
            currentPath === 'business-rules' ||
            currentPath === 'quote-rules' ||
            currentPath === 'rule-quote' ||
            currentPath === 'rule-card-check' ||
            currentPath === 'rule-risk' ||
            currentPath === 'rule-sla' ||
            currentPath === 'rule-loss') && (
            <RulesConfigView
              initialCategory={
                currentPath === 'rule-card-check'
                  ? 'card_check'
                  : currentPath === 'rule-risk'
                  ? 'risk'
                  : currentPath === 'rule-sla'
                  ? 'sla'
                  : currentPath === 'rule-loss'
                  ? 'loss'
                  : 'quote'
              }
              onNavigate={setCurrentPath}
            />
          )}
          {currentPath === 'message-config' && (
            <MessageConfigView onNavigate={setCurrentPath} />
          )}
          {(currentPath === 'permission-config' ||
            currentPath === 'basic-config' ||
            currentPath === 'audit-logs' ||
            currentPath === 'operation-settings') && (
            <BasicConfigView onNavigate={setCurrentPath} />
          )}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
