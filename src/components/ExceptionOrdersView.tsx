import React, { useState, useMemo } from 'react';
import { NavPath } from '../types';

export type AnomalyType = '查询失败' | '风险拦截' | '拒单' | '超时' | '处理失败' | '转单' | '其他';

export interface ExceptionArchiveRecord {
  id: string; // 异常档案单号
  orderNo: string; // 关联卡单号
  cardName: string;
  country: string;
  countryFlag: string;
  faceValue: number;
  currency: string;
  tradeAmount: number;

  // 异常类型
  anomalyType: AnomalyType;
  anomalyTypeCode: string;

  // 支持查看的核心 5 大结构化字段：
  // 1. 异常原因
  anomalyReason: {
    title: string;
    detail: string;
    errorCode: string;
    detectedAt: string;
    sourceNode: string; // 触发源
  };

  // 2. 处理过程
  processHistory: Array<{
    nodeIndex: number;
    time: string;
    actor: string; // 客服/系统/商户
    action: string;
    remark: string;
    statusTag: string;
  }>;

  // 3. 责任人
  responsibleParty: {
    type: '商户责任' | '用户责任' | '平台系统' | '运营客服';
    ownerName: string; // 责任主体名称或工号
    responsibilityRatio: string; // 责任比例 e.g. 100%
    comment: string;
  };

  // 4. 最终结果
  finalOutcome: {
    resultStatus: '已转单挽回' | '判定坏卡驳回' | '平台先行垫付' | '商户扣保结清' | '挂起待裁';
    completedAt: string;
    summaryText: string;
  };

  // 5. 是否产生损失
  lossAssessment: {
    hasLoss: boolean;
    lossAmount: number; // 损失金额
    currency: string;
    lossBearer: '平台坏账承担' | '商户质押扣赔' | '出卡用户承担' | '无资金损失';
    recoveryStatus: '已完全追偿' | '无法追偿' | '不涉及损失';
  };

  userUid: string;
  userName: string;
  merchantMid: string;
  merchantName: string;
  createdAt: string;
}

const INITIAL_ARCHIVE_DATA: ExceptionArchiveRecord[] = [
  {
    id: 'EX-ARCH-20261005-01',
    orderNo: 'ORD-20261005-88392',
    cardName: 'Steam 充值卡 (阿根廷)',
    country: 'AR',
    countryFlag: '🇦🇷',
    faceValue: 100,
    currency: 'USD',
    tradeAmount: 86.00,
    anomalyType: '拒单',
    anomalyTypeCode: 'MERCHANT_REJECT',
    anomalyReason: {
      title: '商户因汇率瞬时倒挂主动拒单',
      detail: '商户拉美数字通可用接单汇率 84.5% 低于平台买入价 86.0%，商户节点触发限价保护并拒绝认领，导致卡单滞留。',
      errorCode: 'ERR_RATE_INVERTED_REJECT',
      detectedAt: '14:32:10',
      sourceNode: '商户网关 API (MID-LATAM-01)'
    },
    processHistory: [
      { nodeIndex: 1, time: '14:31:40', actor: '系统撮合', action: '派单给商户 MID-LATAM-01', remark: '订单进入商户承接等待队列', statusTag: '派单' },
      { nodeIndex: 2, time: '14:32:10', actor: '商户网关', action: '商户返回 409 拒单', remark: '报错码: RATE_DROP_BELOW_THRESHOLD', statusTag: '拒单' },
      { nodeIndex: 3, time: '14:32:15', actor: '异常档案系统', action: '捕获异常生成档案', remark: '自动写入异常交易档案库，记录倒挂损失归因', statusTag: '归档' },
      { nodeIndex: 4, time: '14:32:30', actor: '公海转单引擎', action: '自动转单至兜底自营席位', remark: '自营保障席位以保本价承兑核销', statusTag: '挽回' }
    ],
    responsibleParty: {
      type: '商户责任',
      ownerName: '拉美数字通 (MID-LATAM-01)',
      responsibilityRatio: '100%',
      comment: '商户在约定挂牌期内无故拒接符合阈值的卡单，记入季度履约考核扣分。'
    },
    finalOutcome: {
      resultStatus: '已转单挽回',
      completedAt: '14:33:05',
      summaryText: '经自营席位改派后核销成功，出卡用户正常放款，未造成交易中断。'
    },
    lossAssessment: {
      hasLoss: true,
      lossAmount: 1.50,
      currency: 'USD',
      lossBearer: '商户质押扣赔',
      recoveryStatus: '已完全追偿'
    },
    userUid: 'U776102',
    userName: 'Mateo Rossi',
    merchantMid: 'MID-LATAM-01',
    merchantName: '拉美数字通',
    createdAt: '14:31:40'
  },
  {
    id: 'EX-ARCH-20261005-02',
    orderNo: 'ORD-20261005-88380',
    cardName: 'Amazon eGift US',
    country: 'US',
    countryFlag: '🇺🇸',
    faceValue: 250,
    currency: 'USD',
    tradeAmount: 212.50,
    anomalyType: '超时',
    anomalyTypeCode: 'PROCESS_TIMEOUT',
    anomalyReason: {
      title: '商户接口核销超过 SLA 阈值无心跳',
      detail: '商户泰坦卡业认领 $250.00 大额卡后超过 180 秒未产生有效核销回执，系统多次探活均返回 504 Gateway Timeout。',
      errorCode: 'ERR_MERCHANT_SLA_BREACH',
      detectedAt: '14:31:18',
      sourceNode: 'SLA 监控守护引擎'
    },
    processHistory: [
      { nodeIndex: 1, time: '14:28:15', actor: '系统网关', action: '接收订单', remark: '官方探针校验卡密正常', statusTag: '接收' },
      { nodeIndex: 2, time: '14:28:18', actor: '商户网关', action: '商户确认认领', remark: '锁定卡单并预扣商户质押金', statusTag: '锁定' },
      { nodeIndex: 3, time: '14:31:18', actor: 'SLA守护进程', action: '熔断强拔卡单', remark: '超过 180s 无心跳，触发超时异常中断', statusTag: '超时' },
      { nodeIndex: 4, time: '14:32:00', actor: '风控应急小组', action: '人工核准垫付', remark: '先行赔付用户，对商户启动超时违约调查', statusTag: '先行垫付' }
    ],
    responsibleParty: {
      type: '商户责任',
      ownerName: '泰坦卡业北美专线 (MID-US-TITAN)',
      responsibilityRatio: '100%',
      comment: '商户承兑网关宕机，未在时限内释放锁定或回传结果。'
    },
    finalOutcome: {
      resultStatus: '平台先行垫付',
      completedAt: '14:35:00',
      summaryText: '出卡方获得平台全额先行垫付放款 $212.50 USD，商户质押金等额扣减清算。'
    },
    lossAssessment: {
      hasLoss: true,
      lossAmount: 212.50,
      currency: 'USD',
      lossBearer: '商户质押扣赔',
      recoveryStatus: '已完全追偿'
    },
    userUid: 'U339102',
    userName: 'Elena Rostova',
    merchantMid: 'MID-US-TITAN',
    merchantName: '泰坦卡业北美专线',
    createdAt: '14:28:15'
  },
  {
    id: 'EX-ARCH-20261005-03',
    orderNo: 'ORD-20261005-88405',
    cardName: 'Razer Gold PIN Global',
    country: 'US',
    countryFlag: '🇺🇸',
    faceValue: 500,
    currency: 'USD',
    tradeAmount: 420.00,
    anomalyType: '查询失败',
    anomalyTypeCode: 'PRECHECK_FAILURE',
    anomalyReason: {
      title: 'OCR 视觉提取与探针解析字符残缺',
      detail: '小票涂层反光严重，OCR 算法仅提取出 14/15 位字符，探针验证失败阻断进入自动撮合队列。',
      errorCode: 'ERR_OCR_CONFIDENCE_LOW',
      detectedAt: '14:35:12',
      sourceNode: '前置 OCR 视觉引擎'
    },
    processHistory: [
      { nodeIndex: 1, time: '14:35:10', actor: '用户终端', action: '上传图片与凭证', remark: '提交 7-Eleven 实体小票与涂层实拍', statusTag: '上传' },
      { nodeIndex: 2, time: '14:35:12', actor: 'OCR引擎', action: '置信度报警 (78.4%)', remark: '第14位字符灰度脱失，生成异常查询档案', statusTag: '预检异常' },
      { nodeIndex: 3, time: '14:35:30', actor: '客服专席 OP-99', action: '调取高对比度切片人工纠错', remark: '核正修正第14位字符为 9', statusTag: '人工修复' }
    ],
    responsibleParty: {
      type: '用户责任',
      ownerName: '出卡用户 (Tan Wei Long)',
      responsibilityRatio: '60%',
      comment: '用户拍摄小票时光源反光严重，导致自动化前置识别失败。'
    },
    finalOutcome: {
      resultStatus: '已转单挽回',
      completedAt: '14:36:10',
      summaryText: '人工核正卡密后重新发起官方 Card Check 成功，恢复撮合完成履约。'
    },
    lossAssessment: {
      hasLoss: false,
      lossAmount: 0.00,
      currency: 'USD',
      lossBearer: '无资金损失',
      recoveryStatus: '不涉及损失'
    },
    userUid: 'U109204',
    userName: 'Tan Wei Long',
    merchantMid: 'DESK-MANUAL-02',
    merchantName: '人工做卡专席 #OP-99',
    createdAt: '14:35:10'
  },
  {
    id: 'EX-ARCH-20261005-04',
    orderNo: 'ORD-20261004-77192',
    cardName: 'Steam Wallet USD',
    country: 'US',
    countryFlag: '🇺🇸',
    faceValue: 100,
    currency: 'USD',
    tradeAmount: 82.00,
    anomalyType: '处理失败',
    anomalyTypeCode: 'CODE_ALREADY_USED',
    anomalyReason: {
      title: '商户官方核销接口返回 Redeem Error: Already Used',
      detail: '商户核销通道调用 Steam 网关回执提示卡密已于 3 小时前被其他账号兑换，双方发生碰卡争议。',
      errorCode: 'ERR_GATEWAY_REDEEM_DUPLICATE',
      detectedAt: '10:20:15',
      sourceNode: 'Steam 官方兑换网关'
    },
    processHistory: [
      { nodeIndex: 1, time: '10:18:00', actor: '用户提交', action: '提交数字码', remark: '未上传实体购买小票', statusTag: '提交' },
      { nodeIndex: 2, time: '10:20:15', actor: '商户网关', action: '回执 409 冲突', remark: '商户提交官方回执 TraceID 与碰卡存证', statusTag: '处理失败' },
      { nodeIndex: 3, time: '10:22:00', actor: '异常档案归档', action: '固化证据链', remark: '锁定商户上报时间与官方接口响应日志', statusTag: '归档' },
      { nodeIndex: 4, time: '10:35:00', actor: '仲裁专员', action: '裁定坏卡驳回', remark: '官方时间戳早于提交时间，判定出卡人提交已兑换卡密', statusTag: '驳回' }
    ],
    responsibleParty: {
      type: '用户责任',
      ownerName: '出卡散户 (CardMaster_K)',
      responsibilityRatio: '100%',
      comment: '提交的卡密官方核销时间戳早于平台接单时间，涉嫌二次转卖空卡。'
    },
    finalOutcome: {
      resultStatus: '判定坏卡驳回',
      completedAt: '10:38:00',
      summaryText: '驳回出卡人兑付申请，扣除商户预扣积分，商户无责任免于扣款。'
    },
    lossAssessment: {
      hasLoss: false,
      lossAmount: 0.00,
      currency: 'USD',
      lossBearer: '出卡用户承担',
      recoveryStatus: '不涉及损失'
    },
    userUid: 'U-33291',
    userName: 'CardMaster_K',
    merchantMid: 'M-1003',
    merchantName: '极速易换点卡行',
    createdAt: '10:18:00'
  },
  {
    id: 'EX-ARCH-20261004-05',
    orderNo: 'ORD-20261004-77180',
    cardName: 'Google Play Gift Card',
    country: 'US',
    countryFlag: '🇺🇸',
    faceValue: 200,
    currency: 'USD',
    tradeAmount: 160.00,
    anomalyType: '风险拦截',
    anomalyTypeCode: 'RISK_HARD_INTERCEPT',
    anomalyReason: {
      title: '高频批量换号出卡，命中多账号撞卡黑名单',
      detail: '同一设备指纹与 IP 在 10 分钟内切换 8 个未实名新账号上传大额礼品卡，触发反欺诈引擎 P0 硬熔断拦截。',
      errorCode: 'ERR_DEVICE_FINGERPRINT_FRAUD',
      detectedAt: '09:12:44',
      sourceNode: '中央风控欺诈拦截网关'
    },
    processHistory: [
      { nodeIndex: 1, time: '09:12:40', actor: '用户端', action: '快速并发提交', remark: '设备ID关联历史5起碰卡争议', statusTag: '提交' },
      { nodeIndex: 2, time: '09:12:44', actor: '反欺诈引擎', action: '熔断拦截', remark: '风险评分 98 分，直接打断撮合流程', statusTag: '拦截' },
      { nodeIndex: 3, time: '09:13:00', actor: '安全合规组', action: '写入异常档案', remark: '关联同批次 8 笔卡单全部冻结核查', statusTag: '档案冻结' }
    ],
    responsibleParty: {
      type: '用户责任',
      ownerName: '黑产批量团伙 (Device_0x99a)',
      responsibilityRatio: '100%',
      comment: '恶意利用虚拟定位与设备多开批量出二手卡，列入永久黑名单。'
    },
    finalOutcome: {
      resultStatus: '判定坏卡驳回',
      completedAt: '09:30:00',
      summaryText: '全批次订单作废阻断，未下发给任何商户，成功阻断资金外流。'
    },
    lossAssessment: {
      hasLoss: false,
      lossAmount: 0.00,
      currency: 'USD',
      lossBearer: '无资金损失',
      recoveryStatus: '不涉及损失'
    },
    userUid: 'U-FRAUD-09',
    userName: 'Anon_99182',
    merchantMid: 'NONE',
    merchantName: '未指派商户',
    createdAt: '09:12:40'
  },
  {
    id: 'EX-ARCH-20261004-06',
    orderNo: 'ORD-20261004-77160',
    cardName: 'Vanilla Visa PrePaid',
    country: 'US',
    countryFlag: '🇺🇸',
    faceValue: 300,
    currency: 'USD',
    tradeAmount: 246.00,
    anomalyType: '转单',
    anomalyTypeCode: 'AUTO_REROUTE_FAIL',
    anomalyReason: {
      title: '商户质押额度耗尽拒接，自动转单多节点重试',
      detail: '原主选商户极客卡业可用质押金降至警戒线下拒绝撮合，系统触发跨通道转单调度，转派至顺达环球卡券。',
      errorCode: 'ERR_MERCHANT_CAPACITY_EXHAUST',
      detectedAt: '08:40:12',
      sourceNode: '商户承揽容量监控器'
    },
    processHistory: [
      { nodeIndex: 1, time: '08:40:00', actor: '用户提交', action: '提交有效实体卡', remark: '官方验证通过', statusTag: '提交' },
      { nodeIndex: 2, time: '08:40:12', actor: '主商户节点', action: '因额度耗尽拒接', remark: '自动回退进入公海优先重派队列', statusTag: '拒接' },
      { nodeIndex: 3, time: '08:40:18', actor: '自动调度器', action: '执行转单重派', remark: '转派给第二承揽梯队商户顺达卡券', statusTag: '转单成功' }
    ],
    responsibleParty: {
      type: '商户责任',
      ownerName: '极客卡业 (美区专线)',
      responsibilityRatio: '100%',
      comment: '商户未按承诺保持足额质押金承接大额卡单。'
    },
    finalOutcome: {
      resultStatus: '已转单挽回',
      completedAt: '08:41:20',
      summaryText: '第二承揽商户顺达卡券完成核销出金，卡单顺利完结。'
    },
    lossAssessment: {
      hasLoss: false,
      lossAmount: 0.00,
      currency: 'USD',
      lossBearer: '无资金损失',
      recoveryStatus: '不涉及损失'
    },
    userUid: 'U-77218',
    userName: 'GiftHero_US',
    merchantMid: 'M-1002',
    merchantName: '极客卡业',
    createdAt: '08:40:00'
  }
];

interface ExceptionOrdersViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const ExceptionOrdersView: React.FC<ExceptionOrdersViewProps> = ({ onNavigate }) => {
  const [archives] = useState<ExceptionArchiveRecord[]>(INITIAL_ARCHIVE_DATA);

  // 17 异常类型筛选
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchKey, setSearchKey] = useState('');
  const [lossFilter, setLossFilter] = useState<'ALL' | 'LOSS_ONLY' | 'NO_LOSS'>('ALL');

  // 查看档案详情模态框
  const [activeArchive, setActiveArchive] = useState<ExceptionArchiveRecord | null>(null);

  // 过滤结果
  const filteredList = useMemo(() => {
    return archives.filter(item => {
      // 1. 异常类型
      if (selectedType !== 'ALL' && item.anomalyType !== selectedType) return false;

      // 2. 是否产生损失
      if (lossFilter === 'LOSS_ONLY' && !item.lossAssessment.hasLoss) return false;
      if (lossFilter === 'NO_LOSS' && item.lossAssessment.hasLoss) return false;

      // 3. 关键字搜索
      if (searchKey.trim()) {
        const q = searchKey.trim().toLowerCase();
        const matchId = item.id.toLowerCase().includes(q);
        const matchOrder = item.orderNo.toLowerCase().includes(q);
        const matchCard = item.cardName.toLowerCase().includes(q);
        const matchMerchant = item.merchantName.toLowerCase().includes(q);
        const matchUser = item.userName.toLowerCase().includes(q) || item.userUid.toLowerCase().includes(q);
        const matchReason = item.anomalyReason.title.toLowerCase().includes(q);
        if (!matchId && !matchOrder && !matchCard && !matchMerchant && !matchUser && !matchReason) return false;
      }

      return true;
    });
  }, [archives, selectedType, lossFilter, searchKey]);

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased text-xs space-y-4">
      {/* 头部定位与档案库性质声明 */}
      <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">异常订单档案库</h1>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
              档案查询 · 不承担当前实时作业
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            定位：异常交易档案历史归档查询、责任复盘与审计溯源。实时客服流转与催单作业请前往「客服工作台」。
          </p>
        </div>

        {/* 统计指标卡 */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-right">
            <span className="text-[10px] text-slate-400 block font-medium">总归档异常</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{archives.length} 卷</span>
          </div>
          <div className="bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 text-right">
            <span className="text-[10px] text-rose-600 block font-medium">涉及资金损失</span>
            <span className="font-mono font-bold text-rose-700 text-sm">
              {archives.filter(a => a.lossAssessment.hasLoss).length} 笔 ($
              {archives.filter(a => a.lossAssessment.hasLoss).reduce((s, a) => s + a.lossAssessment.lossAmount, 0).toFixed(2)})
            </span>
          </div>
        </div>
      </section>

      {/* 异常类型与多维过滤条 */}
      <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600 text-[18px]">filter_alt</span>
            <span className="font-bold text-slate-900 text-xs">异常类型过滤（十七规范标准七分类）</span>
          </div>
          <span className="text-slate-400 font-mono text-xs">
            当前显示: <strong className="text-slate-900">{filteredList.length}</strong> / {archives.length} 卷档案
          </span>
        </div>

        {/* 异常类型 Tab 快速过滤 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              selectedType === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全部类型 ({archives.length})
          </button>
          {[
            { type: '查询失败', desc: '探针/OCR' },
            { type: '风险拦截', desc: '欺诈/熔断' },
            { type: '拒单', desc: '商户退单' },
            { type: '超时', desc: 'SLA违约' },
            { type: '处理失败', desc: '核销接口错' },
            { type: '转单', desc: '改派兜底' },
            { type: '其他', desc: '特殊异常' }
          ].map(item => {
            const count = archives.filter(a => a.anomalyType === item.type).length;
            const isSelected = selectedType === item.type;
            return (
              <button
                key={item.type}
                onClick={() => setSelectedType(item.type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{item.type}</span>
                <span className={`px-1 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 搜索与损失筛选条 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              value={searchKey}
              onChange={e => setSearchKey(e.target.value)}
              placeholder="搜索异常单号、卡单号、卡种、商户、出卡人、异常原因关键字..."
              className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-300 text-xs outline-none focus:border-rose-500 bg-slate-50/50"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
          </div>

          <div>
            <select
              value={lossFilter}
              onChange={e => setLossFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-rose-500 bg-white font-medium text-slate-800"
            >
              <option value="ALL">全部损失状态 (已产损 / 无损失)</option>
              <option value="LOSS_ONLY">仅查看产生资金损失档案</option>
              <option value="NO_LOSS">仅查看无资金损失档案</option>
            </select>
          </div>
        </div>
      </section>

      {/* 异常档案列表展示 (严格支持查看：异常原因｜处理过程｜责任人｜最终结果｜是否产生损失) */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">档案编号 / 关联卡单</th>
                <th className="py-2.5 px-3">异常类型</th>
                <th className="py-2.5 px-3">卡种 / 面额</th>
                <th className="py-2.5 px-3 min-w-[200px]">异常原因 (归因与错误码)</th>
                <th className="py-2.5 px-3">责任人 (主体)</th>
                <th className="py-2.5 px-3">最终结果</th>
                <th className="py-2.5 px-3">是否产生损失</th>
                <th className="py-2.5 px-3">归档时间</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map(item => (
                <tr key={item.id} className="hover:bg-rose-50/20 transition-colors">
                  {/* 档案编号 / 卡单号 */}
                  <td className="py-3 px-3">
                    <div className="space-y-0.5">
                      <span className="font-mono font-bold text-slate-900 block">{item.id}</span>
                      <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1 py-0.2 rounded border border-blue-100">
                        {item.orderNo}
                      </span>
                    </div>
                  </td>

                  {/* 异常类型 */}
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[11px] bg-rose-50 text-rose-700 border border-rose-200">
                      {item.anomalyType}
                    </span>
                  </td>

                  {/* 卡种 / 面额 */}
                  <td className="py-3 px-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <span>{item.countryFlag}</span>
                        <span className="truncate max-w-[110px]">{item.cardName}</span>
                      </div>
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        ${item.faceValue.toFixed(2)} {item.currency}
                      </div>
                    </div>
                  </td>

                  {/* 1. 异常原因 */}
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900 flex items-center gap-1">
                        <span className="material-symbols-outlined text-rose-600 text-[14px]">error</span>
                        <span className="truncate max-w-[240px]">{item.anomalyReason.title}</span>
                      </div>
                      <div className="font-mono text-[10px] text-rose-700 bg-rose-50 px-1 rounded w-fit">
                        {item.anomalyReason.errorCode}
                      </div>
                    </div>
                  </td>

                  {/* 3. 责任人 */}
                  <td className="py-3 px-3">
                    <div className="space-y-0.5">
                      <span className={`inline-block font-semibold text-[10px] px-1.5 py-0.5 rounded border ${
                        item.responsibleParty.type === '商户责任' ? 'bg-amber-50 text-amber-700 border-amber-200/80' :
                        item.responsibleParty.type === '用户责任' ? 'bg-purple-50 text-purple-700 border-purple-200/80' :
                        'bg-slate-100 text-slate-700 border-slate-200/80'
                      }`}>
                        {item.responsibleParty.type}
                      </span>
                      <div className="text-[11px] text-slate-700 truncate max-w-[120px]">
                        {item.responsibleParty.ownerName}
                      </div>
                    </div>
                  </td>

                  {/* 4. 最终结果 */}
                  <td className="py-3 px-3">
                    <span className={`inline-block font-bold text-[11px] px-2 py-0.5 rounded ${
                      item.finalOutcome.resultStatus === '已转单挽回' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      item.finalOutcome.resultStatus === '平台先行垫付' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {item.finalOutcome.resultStatus}
                    </span>
                  </td>

                  {/* 5. 是否产生损失 */}
                  <td className="py-3 px-3">
                    {item.lossAssessment.hasLoss ? (
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-rose-600 text-xs">
                          产生损失: ${item.lossAssessment.lossAmount.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          承担: {item.lossAssessment.lossBearer}
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-emerald-700 text-xs font-semibold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        无资金损失
                      </span>
                    )}
                  </td>

                  {/* 归档时间 */}
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                    {item.createdAt}
                  </td>

                  {/* 操作 */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setActiveArchive(item)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      查阅档案
                    </button>
                  </td>
                </tr>
              ))}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <span className="material-symbols-outlined text-[32px] text-slate-300">inventory</span>
                      <span>暂无匹配的异常交易档案记录</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 结构化档案全卷查阅模态框 (支持查看完整 5 大结构化要素) */}
      {activeArchive && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
            {/* 模态框顶部 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <span className="material-symbols-outlined text-[20px]">folder_special</span>
                </span>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">异常交易档案全卷 · 责任复盘底稿</h2>
                  <p className="text-slate-400 font-mono text-xs">
                    档案卷号: {activeArchive.id} · 关联卡单: {activeArchive.orderNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveArchive(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* 5 大核心模块固定查阅区 */}
            <div className="space-y-3.5">
              {/* 1. 异常原因 */}
              <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">report_problem</span>
                    【异常原因】归因与错误码
                  </span>
                  <span className="font-mono text-xs text-rose-800 bg-rose-100 px-2 py-0.5 rounded font-bold">
                    {activeArchive.anomalyReason.errorCode}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{activeArchive.anomalyReason.title}</div>
                <p className="text-slate-700 text-xs leading-relaxed">{activeArchive.anomalyReason.detail}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-rose-200/60 font-mono">
                  <span>触发源: {activeArchive.anomalyReason.sourceNode}</span>
                  <span>捕获时间: {activeArchive.anomalyReason.detectedAt}</span>
                </div>
              </div>

              {/* 2. 处理过程 (时间轴跟踪) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[16px]">timeline</span>
                  【处理过程】事件演进轨迹与系统/客服介入
                </span>

                <div className="space-y-2 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                  {activeArchive.processHistory.map((step, idx) => (
                    <div key={idx} className="relative space-y-0.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-400 font-bold">{step.time}</span>
                        <span className="font-semibold text-slate-900">{step.actor}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          {step.statusTag}
                        </span>
                      </div>
                      <div className="font-medium text-slate-800">{step.action}</div>
                      <div className="text-slate-500 text-[11px]">{step.remark}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 & 4: 责任人与最终结果 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 3. 责任人 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-purple-600 text-[16px]">person_alert</span>
                    【责任人】主体判定
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{activeArchive.responsibleParty.ownerName}</span>
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {activeArchive.responsibleParty.type}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {activeArchive.responsibleParty.comment}
                  </p>
                </div>

                {/* 4. 最终结果 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified</span>
                    【最终结果】处置结论
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {activeArchive.finalOutcome.resultStatus}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      完成时间: {activeArchive.finalOutcome.completedAt}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {activeArchive.finalOutcome.summaryText}
                  </p>
                </div>
              </div>

              {/* 5. 是否产生损失 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-[16px]">account_balance_wallet</span>
                  【是否产生损失】资金损益审计与承担主体
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">是否存在资金损失</span>
                    <span className={`font-bold text-xs ${activeArchive.lossAssessment.hasLoss ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {activeArchive.lossAssessment.hasLoss ? '是 (产生损失)' : '否 (无资金净损失)'}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">核定损失金额</span>
                    <span className="font-bold text-slate-900 text-xs">
                      ${activeArchive.lossAssessment.lossAmount.toFixed(2)} {activeArchive.lossAssessment.currency}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">最终损失承担主体</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {activeArchive.lossAssessment.lossBearer}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 模态框底部按钮 */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                数字存证哈希: 0x88f9102bc...archive_sealed
              </span>
              <button
                onClick={() => setActiveArchive(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold cursor-pointer"
              >
                关闭底稿
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
