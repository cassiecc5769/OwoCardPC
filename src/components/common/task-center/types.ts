import { NavPath, UserRole } from '../../../types';

export type ExceptionSourceSystem = '风控系统' | '报价机器人' | '交易核心' | '渠道推广' | '财务资金网关' | '系统基础设施';

export type ExceptionObjectType = '卡密' | '订单' | '商户' | '渠道' | '账单流水' | '接口服务';

export type ExceptionSeverity = 'P0_FATAL' | 'P1_SEVERE' | 'P2_MEDIUM' | 'P3_INFO';

export type ExceptionStatus = 'pending' | 'auto_processing' | 'task_generated' | 'auto_resolved' | 'manually_resolved';

export type ExceptionHandlingType = 'auto_process' | 'dispatch_task' | 'rule_escalate';

export interface UnifiedExceptionItem {
  id: string; // Exception ID, e.g. "EXP-20261005-0082"
  sourceSystem: ExceptionSourceSystem;
  businessObject: string; // e.g. "订单 #ORD-88201", "卡密 #CARD-9921", "商户 MID-1002"
  objectType: ExceptionObjectType;
  exceptionType: string; // e.g. "Card Check余额与申报不符", "商户超时未接单", "报价偏离市场基准>8%"
  severity: ExceptionSeverity;
  firstDiscoveredTime: string;
  lastOccurredTime: string;
  occurrenceCount: number;
  status: ExceptionStatus;
  handlingType: ExceptionHandlingType;
  generatedTaskId?: string;
  rootCauseDesc: string;
  autoProcessResult?: string;
}

export type TaskSource = '统一异常中心' | '交易风控' | '财务对账' | '报价监控' | '运营计划';

export type TaskType = 
  | '异常卡人工核验' 
  | '争议责任仲裁' 
  | '商户转单确认' 
  | '三账差错处理' 
  | '报价异常调优' 
  | '挂账/赔付审批'
  | '渠道骤降排查';

export type TaskPriority = 'P0_URGENT' | 'P1_HIGH' | 'P2_MEDIUM' | 'P3_LOW';

export type TaskStatus = 'pending' | 'processing' | 'verifying' | 'completed' | 'timeout' | 'closed' | 'escalated';

export interface UnifiedTaskItem {
  id: string; // Task ID, e.g. "TSK-20261005-0104"
  source: TaskSource;
  businessObject: string; // e.g. "订单 ORD-20261005-88201", "商户 MID-1002"
  objectType: ExceptionObjectType;
  taskType: TaskType;
  targetRole: UserRole; // 'customer_service' | 'operations' | 'finance' | 'admin'
  priority: TaskPriority;
  assignee: string; // 负责人或 '待认领 (Unassigned)'
  slaDeadline: string; // e.g. "2026-10-05 14:30:00"
  slaRemainingMinutes: number; // 负数表示已超时
  slaStandardDuration: string; // e.g. "15分钟SLA"
  systemRecommendation: string; // 系统建议, e.g. "原商户缺额建议转单至MID-1003报价92.5%"
  status: TaskStatus;
  processResult?: string; // 处理结果
  verificationResult?: string; // 自动复核结果: "自动复核通过: 卡密已重新核销"
  exceptionId?: string;
  createdTime: string;
  updatedTime: string;
  completedTime?: string;
}
