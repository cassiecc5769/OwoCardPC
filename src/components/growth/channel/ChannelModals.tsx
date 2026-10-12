import React, { useState } from 'react';
import { ChannelItem } from './types';

interface NewChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (channel: Partial<ChannelItem>) => void;
}

export const NewChannelModal: React.FC<NewChannelModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('社媒广告');
  const [manager, setManager] = useState('David.K');
  const [budget, setBudget] = useState(5000);
  const [shortCode, setShortCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const genId = `CH-${type === '社媒广告' ? 'AD' : type === '官方私域' ? 'WA' : 'GEN'}-${Math.floor(100 + Math.random() * 900)}`;
    const shortUrl = `ngn.cash/c?p=${shortCode || 'track_' + Math.floor(Math.random() * 1000)}`;
    onSubmit({
      id: genId,
      name,
      type,
      manager,
      budget,
      spent: 0,
      quotaPercent: 0,
      shortUrl,
      fullUrl: `https://${shortUrl}&src=new_campaign`,
      uv: 0,
      registered: 0,
      registeredRate: '0.0%',
      quoteRate: '0.0%',
      tradingUsers: 0,
      firstOrderConvRate: '0.0%',
      gmv: 0,
      cac: 0,
      status: '投放中',
      roi: '1:0.0',
      ltv: 0,
      verificationPassRate: '100%',
      note: '新建获客推广链路，已生效参数追踪。'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">add_circle</span>
            <span className="font-semibold text-slate-900 text-sm">新建获客渠道 (New Acquisition Channel)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">渠道名称 *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如：TikTok 西非电子卡开箱挑战赛"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">渠道类型</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 outline-none focus:border-blue-500 text-xs"
              >
                <option value="社媒广告">社媒广告 (TikTok/Meta/Twitter)</option>
                <option value="官方私域">官方私域 (WhatsApp/Telegram群)</option>
                <option value="社群合作">KOL/博主合作</option>
                <option value="线下物料">线下档口物料 (易拉宝/门禁卡)</option>
                <option value="自然搜索流量">自然自营与搜索引擎</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">负责人</label>
              <input
                type="text"
                value={manager}
                onChange={e => setManager(e.target.value)}
                placeholder="例如：David.K"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">投放初始预算 (USD)</label>
              <input
                type="number"
                min="0"
                step="100"
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">短链参数别名 (Slug)</label>
              <input
                type="text"
                value={shortCode}
                onChange={e => setShortCode(e.target.value)}
                placeholder="例如：tk_challenge_q3"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 flex items-start gap-2 text-slate-600">
            <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">info</span>
            <p className="text-[11px] leading-relaxed">
              系统将自动为新渠道生成首触点指纹、30天归因Cookie埋点，并分配专属 UTM 参数。保存后可即刻生成物料二维码及专属加价券。
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 cursor-pointer shadow-sm"
            >
              立即建档生效
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface TrackingLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel?: ChannelItem | null;
  onSuccess: (msg: string) => void;
}

export const TrackingLinkModal: React.FC<TrackingLinkModalProps> = ({ isOpen, onClose, channel, onSuccess }) => {
  const [destType, setDestType] = useState<'ai_chat' | 'trade'>('ai_chat');
  const [source, setSource] = useState('tiktok');
  const [medium, setMedium] = useState('video_review');
  const [campaign, setCampaign] = useState('q3_bonus');
  const [content, setContent] = useState('unboxing_v1');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = destType === 'ai_chat' ? 'https://ngn.cash/ai-chat' : 'https://ngn.cash/trade';
  const generatedUrl = `${baseUrl}?c=${channel?.id.toLowerCase() || 'ch_gen'}&type=${destType}&utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}&utm_content=${content}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onSuccess('已复制带参追踪链接到剪贴板！');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">add_link</span>
            <span className="font-semibold text-slate-900 text-sm">生成新追踪参数 (Tracking Parameter Generator)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-slate-800">{channel?.name || '当前渠道'}</span>
            </div>
            <span className="font-mono text-slate-500">{channel?.id || 'CH-ID'}</span>
          </div>

          {/* 推广承接落地页类型 (PRD V6.0: 区分 AI推广机器人H5 与 标准交易页H5) */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">承接目标终端 (Landing Type)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDestType('ai_chat')}
                className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all ${
                  destType === 'ai_chat'
                    ? 'border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500 text-indigo-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-indigo-600 text-[18px] shrink-0 mt-0.5">smart_toy</span>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    AI 推广机器人 H5
                    <span className="text-[10px] px-1 bg-indigo-200 text-indigo-800 rounded font-normal">推荐</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    7×24h 智能接待、自动答疑报价、实时引导注册首单
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDestType('trade')}
                className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all ${
                  destType === 'trade'
                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">storefront</span>
                <div>
                  <div className="font-bold text-xs">标准交易端 H5</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    直接进入礼品卡极速出卡行情与报价核销页面
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">UTM Source (渠道源)</label>
              <input
                type="text"
                value={source}
                onChange={e => setSource(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">UTM Medium (媒介形式)</label>
              <input
                type="text"
                value={medium}
                onChange={e => setMedium(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">UTM Campaign (推广计划)</label>
              <input
                type="text"
                value={campaign}
                onChange={e => setCampaign(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">UTM Content (广告素材区分)</label>
              <input
                type="text"
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">生成落地短链与反作弊指纹 URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedUrl}
                className="w-full px-3 py-2 bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-mono text-[11px] select-all outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shrink-0 cursor-pointer transition-colors"
              >
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              完成并关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EditChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel?: ChannelItem | null;
  onSave: (updated: Partial<ChannelItem>) => void;
}

export const EditChannelModal: React.FC<EditChannelModalProps> = ({ isOpen, onClose, channel, onSave }) => {
  const [name, setName] = useState(channel?.name || '');
  const [manager, setManager] = useState(channel?.manager || '');
  const [budget, setBudget] = useState(channel?.budget || 10000);
  const [status, setStatus] = useState<ChannelItem['status']>(channel?.status || '投放中');
  const [note, setNote] = useState(channel?.note || '');

  React.useEffect(() => {
    if (channel) {
      setName(channel.name);
      setManager(channel.manager);
      setBudget(channel.budget);
      setStatus(channel.status);
      setNote(channel.note || '');
    }
  }, [channel]);

  if (!isOpen || !channel) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      manager,
      budget,
      status,
      note
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">tune</span>
            <span className="font-semibold text-slate-900 text-sm">编辑渠道配置 ({channel.id})</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">渠道名称</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 outline-none text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">负责人</label>
              <input
                type="text"
                value={manager}
                onChange={e => setManager(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">渠道运行状态</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 outline-none text-xs"
              >
                <option value="投放中">投放中 (ACTIVE)</option>
                <option value="活跃中">活跃中 (HEALTHY)</option>
                <option value="正常">正常 (NORMAL)</option>
                <option value="已暂停">暂停投放 (PAUSED)</option>
                <option value="长期有效">长期有效 (LONG-TERM)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">本期预算上限 (USD)</label>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">运营备忘与策略说明</label>
            <textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 outline-none text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 cursor-pointer shadow-sm"
            >
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AttributionRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttributionRulesModal: React.FC<AttributionRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">analytics</span>
            <span className="font-semibold text-slate-900 text-sm">全域归因模型规则 (Attribution Model Engine)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px] shrink-0">verified</span>
            <div>
              <div className="font-semibold text-blue-900">当前激活: 首触点加权归因 (First-Touch 70% + Last-Touch 30%)</div>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                西非礼品卡新客决策链具有“初次触达认知高、最终兑付多比价”特点，首触点占据引流核心信用，尾触点保障结算归属。
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 rounded-lg border border-slate-200 bg-slate-50">
              <span className="font-medium text-slate-700">归因跟踪有效时间窗口 (Attribution Window)</span>
              <span className="font-mono font-bold text-blue-600">30 自然天 (30 Days)</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg border border-slate-200 bg-slate-50">
              <span className="font-medium text-slate-700">设备指纹与IP碰撞反作弊拦截率</span>
              <span className="font-mono font-bold text-emerald-700">99.8% 拦截自刷</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg border border-slate-200 bg-slate-50">
              <span className="font-medium text-slate-700">跨设备回溯机制</span>
              <span className="font-mono text-slate-800">Phone Hash + Browser Fingerprint</span>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 cursor-pointer"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BudgetRebalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export const BudgetRebalanceModal: React.FC<BudgetRebalanceModalProps> = ({ isOpen, onClose, onApply }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-[20px]">auto_fix_high</span>
            <span className="font-semibold text-slate-900 text-sm">渠道预算智能重平衡建议 (Smart Budget Rebalance)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2 text-slate-700">
            <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0">lightbulb</span>
            <p className="text-[11px] leading-relaxed">
              基于过去 14 天各渠道的首单 CAC 与 GMV 产出比，算法推荐将高获客成本渠道资金倾斜至高 ROI 标杆渠道，预计可提升整体 <strong>+18.6%</strong> GMV 产出。
            </p>
          </div>

          <div className="space-y-2 font-mono">
            <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 font-sans">调减: Facebook 图文信息流</span>
                <div className="text-[10px] text-slate-500 font-sans">CAC $3.40 偏高，ROI仅 1:14.2</div>
              </div>
              <span className="text-rose-700 font-bold">-$2,000 USD</span>
            </div>

            <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 font-sans">增配: WhatsApp 西非大客社群</span>
                <div className="text-[10px] text-slate-500 font-sans">CAC $0.42，ROI高达 1:54.2</div>
              </div>
              <span className="text-emerald-700 font-bold">+$1,200 USD</span>
            </div>

            <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 font-sans">增配: 拉各斯 Ikeja 电脑城档口</span>
                <div className="text-[10px] text-slate-500 font-sans">转化率 24.85%，实体卡源高毛利</div>
              </div>
              <span className="text-emerald-700 font-bold">+$800 USD</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              稍后考虑
            </button>
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 cursor-pointer shadow-sm"
            >
              确认并一键应用调仓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
