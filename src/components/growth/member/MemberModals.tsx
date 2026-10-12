import React, { useState } from 'react';
import { MemberProfile, MemberTierConfig, GrowthFormulaRule, RetentionPolicyConfig } from './types';

interface Member360ModalProps {
  member: MemberProfile | null;
  onClose: () => void;
  onAdjustPoints: (member: MemberProfile) => void;
  onSendCoupon: (member: MemberProfile) => void;
}

export const Member360Modal: React.FC<Member360ModalProps> = ({
  member,
  onClose,
  onAdjustPoints,
  onSendCoupon,
}) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl ${member.avatarBg} text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm`}>
              {member.tier}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">{member.uid}</span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 text-blue-700">
                  {member.tierName}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  {member.riskTag}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                绑定手机: {member.phone} · 注册时间: {member.registeredDate}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
          {/* Card 1: 成长值与保级进度 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">成长值资产与保级进度 (Rolling 180天)</span>
              <span className="font-mono text-xs font-bold text-indigo-600">{member.currentPts.toLocaleString()} PTS</span>
            </div>
            
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>当前等级积分</span>
                <span className="font-medium text-slate-700">{member.nextTierGapText}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{
                    width: member.tier === 'LV5' ? '100%' : `${Math.min(100, (member.currentPts / (member.tier === 'LV4' ? 80000 : member.tier === 'LV3' ? 25000 : member.tier === 'LV2' ? 8000 : 2000)) * 100)}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">近180天出卡笔数</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{member.tradesCount180d} 笔</div>
                <div className="text-[10px] text-emerald-600 font-medium">≥ 3笔保级达成</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">近30天出卡流水</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">${member.gmv30d.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">活跃度 {member.activeRate}</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">享受溢价加点</div>
                <div className="font-mono font-bold text-emerald-600 mt-0.5">{member.bonusRate}</div>
                <div className="text-[10px] text-blue-600 font-medium">报价结算 100%</div>
              </div>
            </div>
          </div>

          {/* Card 2: 享受特权明细 */}
          <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-500 text-[18px]">verified</span>
              <span>当前等级赋予权益清单</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50">
                <span className="material-symbols-outlined text-blue-600 text-[16px]">speed</span>
                <div>
                  <div className="text-slate-500">出卡核销通道</div>
                  <div className="font-semibold text-slate-800">
                    {member.tier === 'LV5' ? '专属API直连 (极速秒批)' : member.tier === 'LV4' ? '绿色优先专线' : member.tier === 'LV3' ? '极速秒批通道' : '标准队列'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50">
                <span className="material-symbols-outlined text-indigo-600 text-[16px]">support_agent</span>
                <div>
                  <div className="text-slate-500">专属客服保障</div>
                  <div className="font-semibold text-slate-800">
                    {member.tier === 'LV5' ? '7×24 资深专家驻场' : member.tier === 'LV4' ? '1对1专属大客经理' : member.tier === 'LV3' ? '1对1专属客服' : '智能客服'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50">
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">currency_exchange</span>
                <div>
                  <div className="text-slate-500">专属溢价比例</div>
                  <div className="font-semibold text-emerald-600">{member.bonusRate} 折率额外加成</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50">
                <span className="material-symbols-outlined text-purple-600 text-[16px]">shield</span>
                <div>
                  <div className="text-slate-500">KYC 审核状态</div>
                  <div className="font-semibold text-slate-800">{member.kycStatus}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: 核心卡种与近期交易 */}
          <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">credit_card</span>
                <span>偏好卡种与近期核销</span>
              </h4>
              <div className="flex gap-1">
                {member.preferredCards.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {member.recentTradeCards && member.recentTradeCards.length > 0 ? (
              <div className="space-y-1.5 mt-2">
                {member.recentTradeCards.map((tx) => (
                  <div key={tx.id} className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-slate-800">{tx.card}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.id} · {tx.time}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-slate-900">${tx.amount} {tx.currency}</div>
                      <div className="text-[10px] text-emerald-600 font-mono font-medium">+{tx.ptsEarned} PTS</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs">暂无更多交易记录</div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-slate-400 text-xs">
            当前专属跟进人: <span className="text-slate-700 font-medium">{member.assignedManager || '系统公共池'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onAdjustPoints(member);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors cursor-pointer"
            >
              调分审批
            </button>
            <button
              onClick={() => {
                onClose();
                onSendCoupon(member);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
            >
              派发关怀挽留券
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 调分审批弹窗
interface MemberPointAdjustModalProps {
  member: MemberProfile | null;
  onClose: () => void;
  onSubmit: (data: { uid: string; type: string; delta: number; reason: string; ticket: string }) => void;
}

export const MemberPointAdjustModal: React.FC<MemberPointAdjustModalProps> = ({
  member,
  onClose,
  onSubmit,
}) => {
  if (!member) return null;

  const [adjustType, setAdjustType] = useState<string>('人工补发调分');
  const [pointsDelta, setPointsDelta] = useState<number>(500);
  const [reason, setReason] = useState<string>('大额卡单核销结算补偿激励');
  const [ticketNo, setTicketNo] = useState<string>('WO-20260919-' + Math.floor(1000 + Math.random() * 9000));

  const handleConfirm = () => {
    const delta = adjustType.includes('扣罚') ? -Math.abs(pointsDelta) : Math.abs(pointsDelta);
    onSubmit({
      uid: member.uid,
      type: adjustType,
      delta,
      reason,
      ticket: ticketNo,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">tune</span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">成长值人工调整审批</h3>
              <p className="text-slate-400 text-xs">调整会员当前存量积分与等级权重</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Member Info */}
          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">{member.uid} ({member.tierName})</div>
              <div className="text-slate-400 font-mono mt-0.5">{member.phone}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400">当前成长值存量</div>
              <div className="font-mono font-bold text-indigo-600 text-sm">{member.currentPts.toLocaleString()} PTS</div>
            </div>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">调整类型与业务归因</label>
            <select
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="人工补发调分">人工补发调分 (奖励/体验补偿)</option>
              <option value="争议仲裁补偿">争议仲裁补偿 (系统误判补发)</option>
              <option value="活动额外通关激励">活动额外通关激励 (特别加成)</option>
              <option value="风控违规扣罚">风控违规扣罚 (恶意出卡扣分)</option>
            </select>
          </div>

          {/* Points Delta */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              变动分值 ({adjustType.includes('扣罚') ? '扣减 PTS' : '增加 PTS'})
            </label>
            <div className="relative">
              <input
                type="number"
                value={pointsDelta}
                onChange={(e) => setPointsDelta(Number(e.target.value))}
                min="10"
                step="10"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="例如: 500"
              />
              <span className="absolute right-3 top-2 text-slate-400 font-mono font-semibold">PTS</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              变动后预估总分: <span className="font-mono font-bold text-slate-800">
                {(member.currentPts + (adjustType.includes('扣罚') ? -pointsDelta : pointsDelta)).toLocaleString()} PTS
              </span>
            </div>
          </div>

          {/* Approval Ticket & Reason */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">关联工单编号</label>
            <input
              type="text"
              value={ticketNo}
              onChange={(e) => setTicketNo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">调整审批理由 (将存入合规审计日志)</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors cursor-pointer"
          >
            确认提交并入账
          </button>
        </div>
      </div>
    </div>
  );
};

// 定向派发关怀券/挽留券弹窗
interface MemberCareCouponModalProps {
  member: MemberProfile | null;
  onClose: () => void;
  onSubmit: (couponName: string, channel: string, message: string) => void;
}

export const MemberCareCouponModal: React.FC<MemberCareCouponModalProps> = ({
  member,
  onClose,
  onSubmit,
}) => {
  if (!member) return null;

  const [couponType, setCouponType] = useState<string>('加点上浮券: +0.50% 出卡专属加价券');
  const [channel, setChannel] = useState<string>('App Push + 站内短信');
  const [messageText, setMessageText] = useState<string>(
    `尊敬的 ${member.uid}，平台特为您发放高阶特权加成券，出卡尊享限时溢价 +0.50%！`
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[22px]">card_giftcard</span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">定向派发会员特权 / 挽留关怀券</h3>
              <p className="text-slate-400 text-xs">激发会员出卡复交或在降级预警期完成保级</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800">{member.uid}</span>
              <span className="ml-2 text-xs font-mono font-bold text-blue-700">{member.tierName}</span>
              <div className="text-slate-400 text-[11px] mt-0.5">
                {member.status === '预警下调' ? (
                  <span className="text-red-600 font-semibold">⚠️ 距降级仅剩 {member.warningDaysRemaining || 7} 天</span>
                ) : (
                  <span>稳定活跃度 {member.activeRate}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">近30天贡献 GMV</div>
              <div className="font-mono font-bold text-slate-800">${member.gmv30d.toLocaleString()}</div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">选择定向权益券类型</label>
            <select
              value={couponType}
              onChange={(e) => setCouponType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="加点上浮券: +0.50% 出卡专属加价券">加点上浮券: +0.50% 出卡专属加价券 (有效期7天)</option>
              <option value="加点上浮券: +0.80% 殿堂尊享溢价券">加点上浮券: +0.80% 殿堂尊享溢价券 (仅限大单)</option>
              <option value="通道特权: 极速秒批优先核销通行卡">通道特权: 极速秒批优先核销通行卡 (免排队)</option>
              <option value="出金特权: 提现免手续费卡 (可抵扣$10)">出金特权: 提现免手续费卡 (可抵扣$10)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">触达通道与下发形式</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="App Push + 站内短信">App Push + 站内系统短信 (即时触发)</option>
              <option value="大客户经理 1对1 电联沟通">大客户经理 1对1 电话/IM 专线跟进</option>
              <option value="静默发放 (自动放入用户卡包)">静默发放 (自动放入用户卡包，无打扰)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">推送文案预览</label>
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={() => onSubmit(couponType, channel, messageText)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>立即下发并推送</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 等级规则与特权配置弹窗
interface TierRuleConfigModalProps {
  tierConfig: MemberTierConfig | null;
  onClose: () => void;
  onSave: (updated: MemberTierConfig) => void;
}

export const TierRuleConfigModal: React.FC<TierRuleConfigModalProps> = ({
  tierConfig,
  onClose,
  onSave,
}) => {
  if (!tierConfig) return null;

  const [thresholdPts, setThresholdPts] = useState<number>(tierConfig.thresholdPts);
  const [bonusPercent, setBonusPercent] = useState<string>(tierConfig.bonusPercent);
  const [queueChannel, setQueueChannel] = useState<string>(tierConfig.queueChannel);
  const [csGuarantee, setCsGuarantee] = useState<string>(tierConfig.csGuarantee);

  const handleSave = () => {
    onSave({
      ...tierConfig,
      thresholdPts,
      bonusPercent,
      queueChannel,
      csGuarantee,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">settings</span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">配置 {tierConfig.name} ({tierConfig.tier}) 规则</h3>
              <p className="text-slate-400 text-xs">调整晋升门槛、额外溢价及服务通道特权</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">晋升门槛成长值 (PTS)</label>
            <input
              type="number"
              value={thresholdPts}
              onChange={(e) => setThresholdPts(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              当前在籍会员: {tierConfig.memberCount.toLocaleString()} 人
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">额外溢价加点系数</label>
            <input
              type="text"
              value={bonusPercent}
              onChange={(e) => setBonusPercent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="+0.30%"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">核销队列通道</label>
            <select
              value={queueChannel}
              onChange={(e) => setQueueChannel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="标准排队">标准排队</option>
              <option value="标准队列">标准队列</option>
              <option value="极速秒批通道">极速秒批通道</option>
              <option value="绿色优先专线">绿色优先专线</option>
              <option value="专属API直连">专属API直连</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">客服保障模式</label>
            <select
              value={csGuarantee}
              onChange={(e) => setCsGuarantee(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="智能客服">智能客服</option>
              <option value="首单返现权益包">首单返现权益包</option>
              <option value="1对1专属客服">1对1专属客服</option>
              <option value="专属大额溢价">专属大额溢价</option>
              <option value="7×24 资深专家驻场">7×24 资深专家驻场</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors cursor-pointer"
          >
            保存等级参数
          </button>
        </div>
      </div>
    </div>
  );
};

// 成长值公式配置弹窗
interface GrowthFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: GrowthFormulaRule[]) => void;
  rules: GrowthFormulaRule[];
}

export const GrowthFormulaModal: React.FC<GrowthFormulaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  rules,
}) => {
  if (!isOpen) return null;

  const [ruleList, setRuleList] = useState<GrowthFormulaRule[]>(rules);

  const handleUpdate = (idx: number, formulaText: string) => {
    const updated = [...ruleList];
    updated[idx].formulaText = formulaText;
    setRuleList(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">calculate</span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">成长值计算与结算公式引擎配置</h3>
              <p className="text-slate-400 text-xs">PRD 5.2.1 实时折算模型参数设置</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {ruleList.map((rule, idx) => (
            <div key={rule.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{rule.code}. {rule.title}</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${rule.badgeClass}`}>
                  {rule.type === 'accrual' ? '增加成长值' : '扣减惩戒'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">{rule.desc}</p>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">计算公式规则</label>
                <input
                  type="text"
                  value={rule.formulaText}
                  onChange={(e) => handleUpdate(idx, e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={() => onSave(ruleList)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors cursor-pointer"
          >
            保存并热更新
          </button>
        </div>
      </div>
    </div>
  );
};

// 审计快照弹窗
export const AuditSnapshotModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[22px]">history</span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">会员等级审计快照 (Snapshot)</h3>
              <p className="text-slate-400 text-xs">不可篡改的平台合规等级基线归档</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
              <div>
                <div className="font-bold">最新快照 SNAP-20260919-0400</div>
                <div className="text-[11px] text-emerald-700">生成时间: 2026-09-19 04:00:00 (自动CRON触发)</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-200 font-mono text-[10px] font-bold">SHA-256 VALID</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">在籍会员总盘记录</span>
              <span className="font-mono font-bold text-slate-900">68,430 人</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">成长值存量池</span>
              <span className="font-mono font-bold text-slate-900">128,450,000 PTS</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">高阶大客池 (LV4+LV5)</span>
              <span className="font-mono font-bold text-indigo-600">4,210 人 (GMV占比 58.4%)</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">合规签章审计员</span>
              <span className="font-mono text-slate-700">COMPLIANCE-BOT-SEC5</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">哈希: 8e7f12a...cb9021</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 text-xs shadow-sm cursor-pointer"
          >
            完成查阅
          </button>
        </div>
      </div>
    </div>
  );
};

// 发布全网生效规则弹窗
export const PublishRuleModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void }> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">rule_folder</span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">发布全网生效规则 (PRD v2.0 SEC-5)</h3>
              <p className="text-slate-400 text-xs">下发至全网清算撮合引擎与移动APP端</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs text-slate-700">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800">
            <div className="font-bold">即将发布以下全网配置变动:</div>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-blue-700">
              <li>LV1~LV5 会员等级成长值晋升门槛与加点加成比率</li>
              <li>出卡成长值实时折算公式 ($1.00 USD = +10 PTS)</li>
              <li>180天滚动考量周期与 15天 倒计时自动化预警机制</li>
            </ul>
          </div>
          <p className="text-slate-500 text-[11px]">
            发布后，规则将立即同步至所有出卡报价接口与会员端展示，预计生效延迟 &lt; 0.5 秒。
          </p>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors cursor-pointer"
          >
            确认立即全网发布
          </button>
        </div>
      </div>
    </div>
  );
};
