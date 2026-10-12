import React, { useState } from 'react';
import { PromoterItem, SettlementBatchItem } from './types';

// -------------------------------------------------------------
// 1. 分配新推广员 (IAM 关联) 弹窗
// -------------------------------------------------------------
interface AssignPromoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promoter: Partial<PromoterItem>) => void;
}

export const AssignPromoterModal: React.FC<AssignPromoterModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [empName, setEmpName] = useState('');
  const [empId, setEmpId] = useState('EMP-0' + Math.floor(4900 + Math.random() * 900));
  const [team, setTeam] = useState('拉各斯地推一战队');
  const [title, setTitle] = useState('推广专员');
  const [phone, setPhone] = useState('+234 ');
  const [inviteCode, setInviteCode] = useState('M' + Math.floor(10000 + Math.random() * 90000));

  if (!isOpen) return null;

  const handleGenerateCode = () => {
    const letters = ['A', 'B', 'C', 'N', 'T', 'W'];
    const prefix = letters[Math.floor(Math.random() * letters.length)];
    const num = Math.floor(10000 + Math.random() * 90000);
    setInviteCode(`${prefix}${num}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return;

    const initials = empName.slice(0, 2).toUpperCase();
    const newPromoter: Partial<PromoterItem> = {
      id: empId,
      name: empName,
      initials: initials,
      avatarBg: 'bg-blue-100 text-blue-700',
      title,
      inviteCode,
      teamId: 'custom-team',
      teamName: team,
      teamLeader: '张建国',
      status: 'active',
      phone,
      tier1Count: 0,
      tier2Count: 0,
      blockedCount: 0,
      firstOrderConversion: 0,
      monthlyOrders: 0,
      gmv: 0,
      estimatedCommission: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    onSubmit(newPromoter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">分配新推广员 (IAM 授权中心关联)</h3>
              <p className="text-[11px] text-slate-500">遵循全员平级体系与一人一码终身锁客规范</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 text-xs leading-relaxed flex items-start gap-2.5">
            <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">verified_user</span>
            <span>
              <strong>合规红线预检：</strong>平台推广员地位一律平级，不设层级抽水总代。分配后系统将自动生成全局唯一的防伪邀请码，并向 IAM 授权中心注记。
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-medium mb-1.5 text-xs">推广员工号 (IAM-ID)</label>
              <input
                type="text"
                value={empId}
                onChange={e => setEmpId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 font-code-token text-slate-900 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1.5 text-xs">员工真实姓名</label>
              <input
                type="text"
                value={empName}
                onChange={e => setEmpName(e.target.value)}
                placeholder="例如: 林晓东"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-slate-900 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-medium mb-1.5 text-xs">所属战队</label>
              <select
                value={team}
                onChange={e => setTeam(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-slate-900 bg-white text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              >
                <option value="拉各斯地推一战队">拉各斯地推一战队 (张建国)</option>
                <option value="线上海外投放大队">线上海外投放大队 (Sarah Lin)</option>
                <option value="大客商务运营组">大客商务运营组 (赵宏博)</option>
                <option value="中东直营先锋战队">中东直营先锋战队 (Tariq Aziz)</option>
                <option value="阿布贾地推二战队">阿布贾地推二战队 (Emmanuel Obi)</option>
                <option value="加纳阿克拉地推战队">加纳阿克拉地推战队 (Kwame Mensah)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1.5 text-xs">业务职衔</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-slate-900 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1.5 text-xs">联系电话 (含国际区号)</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+234 803 000 0000"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 font-code-token text-slate-900 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 font-medium text-xs">专属邀请码 (一人一码)</label>
              <button
                type="button"
                onClick={handleGenerateCode}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>重新生成防伪码</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-200 font-code-token font-bold text-blue-600 bg-blue-50/40 text-xs focus:border-blue-500 focus:outline-none"
                required
              />
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check</span>
                <span>唯一码通过</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              客户首次扫码或注册录入该码后，终身归因不可篡改，第3级裂变将触发智能合约熔断。
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium text-xs cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium text-xs shadow-xs cursor-pointer"
            >
              确认分配并颁发专属码
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. 两级归因风控规则详情 弹窗
// -------------------------------------------------------------
interface AttributionRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttributionRulesModal: React.FC<AttributionRulesModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs font-bold">
              <span className="material-symbols-outlined text-[18px]">policy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-sm">PRD 4.1 两级归因风控与合规红线白皮书</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-code-token text-[10px] font-semibold border border-emerald-200">
                  审计通过
                </span>
              </div>
              <p className="text-xs text-slate-500">平台作业端最高合规等级 · 智能合约熔断与出账隔离</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* 核心拓扑图解 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="font-semibold text-slate-900 mb-3 flex items-center justify-between">
              <span>两级归因封顶（第3级熔断）模型图解</span>
              <span className="text-[10px] font-code-token text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60 font-semibold">
                CONTRACT RULE: STRICT_2_TIER_CAP
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Level 1 */}
              <div className="p-3 bg-white rounded-xl border-2 border-blue-500 shadow-xs relative">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-code-token font-semibold">
                  一级直属客 (Tier 1)
                </span>
                <div className="mt-2 text-2xl font-bold font-numeric-stat text-blue-600">4.0%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">直属客出单佣金比例</div>
                <div className="mt-2 text-[10px] text-emerald-700 bg-emerald-50 py-0.5 rounded-md font-code-token font-semibold border border-emerald-200/60">
                  一人一码终身锁客
                </div>
              </div>

              {/* Level 2 */}
              <div className="p-3 bg-white rounded-xl border-2 border-indigo-400 shadow-xs relative">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-code-token font-semibold">
                  二级裂变客 (Tier 2)
                </span>
                <div className="mt-2 text-2xl font-bold font-numeric-stat text-indigo-600">1.0%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">次级转介佣金比例</div>
                <div className="mt-2 text-[10px] text-indigo-700 bg-indigo-50 py-0.5 rounded-md font-code-token font-semibold border border-indigo-200/60">
                  仅穿透一级客转介
                </div>
              </div>

              {/* Level 3 */}
              <div className="p-3 bg-rose-50/60 rounded-xl border-2 border-dashed border-rose-300 shadow-xs relative">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-code-token font-semibold">
                  第3级及以上 (Tier 3+)
                </span>
                <div className="mt-2 text-2xl font-bold font-numeric-stat text-rose-600">0.0%</div>
                <div className="text-[11px] text-rose-600 font-semibold mt-0.5">强制智能阻断拦截</div>
                <div className="mt-2 text-[10px] text-rose-700 bg-rose-100 py-0.5 rounded-md font-code-token font-semibold border border-rose-200/60">
                  拦截率 100% · 熔断记账
                </div>
              </div>
            </div>
          </div>

          {/* 四大红线逐条说明 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 text-xs font-label-caps uppercase tracking-wider">四大红线风控机制细则</h4>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs">
                <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
                <span>红线一：全员平级体系，绝无金字塔代理</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                平台内所有推广员在 IAM 中均属于扁平员工或直营团队，不设“代理商/团队长抽成模式”。各推广员无论入职先后，提成点位均按平台公开标准独立核算，杜绝多层抽水。
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs">
                <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                <span>红线二：一人一码终身锁客，防止抢单飞单</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                每个专属邀请码均由平台密钥算法生成。客户首单或首次注册绑定后，不可随意解绑或重绑其他专员，保障业务一线劳动成果。
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-xs">
                <span className="material-symbols-outlined text-[16px]">block</span>
                <span>红线三：两级归因封顶，第 3 级系统熔断</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                系统在订单结算钩子中植入了死循环防范与层级截断。一旦识别出客户关系超过 2 级，该笔订单对应的高层级提成自动置为 0，且不生成预估账单，彻底斩断传销涉险。
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                <span className="material-symbols-outlined text-[16px]">account_balance</span>
                <span>红线四：与财务结算硬隔离，仅做只读凭证移交</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                推广工作台内展示的所有佣金均为“出单预估参考态”。推广端无任何出金或转账接口。每半月经合规审计通过后，将生成不可篡改的加密数字凭证，单向推送到 04 财务结算中心，由财务专员进行资金复核与实际划款。
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <span className="text-[11px] text-slate-400 font-code-token">HASH: 0x9b441f82c...2024-v4.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-xs shadow-xs cursor-pointer"
          >
            我已知悉并遵循
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. 归因客户穿透抽屉 (CustomerAttributionDrawer)
// -------------------------------------------------------------
interface CustomerAttributionDrawerProps {
  promoter: PromoterItem | null;
  onClose: () => void;
}

export const CustomerAttributionDrawer: React.FC<CustomerAttributionDrawerProps> = ({
  promoter,
  onClose
}) => {
  const [activeTier, setActiveTier] = useState<'all' | 'tier1' | 'tier2'>('all');

  if (!promoter) return null;

  // 模拟该专员下的客户
  const customers = [
    {
      uid: 'UID-889021',
      phone: '+234 803 *** 1290',
      tier: 'tier1',
      joined: '2024-03-12',
      firstCard: 'Apple Gift Card ($100)',
      totalOrders: 18,
      gmv: 1950.0,
      commission: 78.0,
      status: 'NORMAL'
    },
    {
      uid: 'UID-889045',
      phone: '+234 812 *** 8832',
      tier: 'tier2',
      parentUid: 'UID-889021',
      joined: '2024-03-15',
      firstCard: 'Steam Wallet Card ($50)',
      totalOrders: 12,
      gmv: 820.0,
      commission: 8.2,
      status: 'NORMAL'
    },
    {
      uid: 'UID-889104',
      phone: '+234 809 *** 4410',
      tier: 'tier1',
      joined: '2024-03-16',
      firstCard: 'Razer Gold ($200)',
      totalOrders: 6,
      gmv: 1200.0,
      commission: 48.0,
      status: 'NORMAL'
    },
    {
      uid: 'UID-889218',
      phone: '+234 703 *** 5521',
      tier: 'tier2',
      parentUid: 'UID-889104',
      joined: '2024-03-18',
      firstCard: 'Google Play ($50)',
      totalOrders: 4,
      gmv: 350.0,
      commission: 3.5,
      status: 'NORMAL'
    },
    {
      uid: 'UID-889330',
      phone: '+234 901 *** 0022',
      tier: 'tier1',
      joined: '2024-03-19',
      firstCard: 'Vanilla Visa ($500)',
      totalOrders: 2,
      gmv: 1000.0,
      commission: 40.0,
      status: 'NORMAL'
    }
  ];

  const filtered = customers.filter(c => {
    if (activeTier === 'tier1') return c.tier === 'tier1';
    if (activeTier === 'tier2') return c.tier === 'tier2';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${promoter.avatarBg} font-bold flex items-center justify-center font-code-token text-sm shadow-xs`}>
              {promoter.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-sm">{promoter.name} 的归因客户全景</h3>
                <span className="font-code-token text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-semibold border border-blue-200/60">
                  专属码: {promoter.inviteCode}
                </span>
              </div>
              <p className="text-xs text-slate-500">{promoter.id} · {promoter.teamName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Top summary stats */}
        <div className="p-6 bg-slate-50/40 border-b border-slate-100 grid grid-cols-3 gap-3">
          <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">一级直属绑客</span>
            <div className="font-numeric-stat text-xl font-bold text-blue-600 mt-1">{promoter.tier1Count} <span className="text-xs font-normal text-slate-400 font-sans">人</span></div>
            <span className="text-[11px] text-slate-500">提成比例: 4.0%</span>
          </div>
          <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">二级裂变转介</span>
            <div className="font-numeric-stat text-xl font-bold text-indigo-600 mt-1">{promoter.tier2Count} <span className="text-xs font-normal text-slate-400 font-sans">人</span></div>
            <span className="text-[11px] text-slate-500">提成比例: 1.0%</span>
          </div>
          <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">第3级熔断阻断</span>
            <div className="font-numeric-stat text-xl font-bold text-rose-600 mt-1">{promoter.blockedCount} <span className="text-xs font-normal text-slate-400 font-sans">次拦截</span></div>
            <span className="text-[11px] text-emerald-700 font-medium">合规 0 穿透</span>
          </div>
        </div>

        {/* Filter */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTier('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer text-xs ${activeTier === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              全部归因 ({customers.length})
            </button>
            <button
              onClick={() => setActiveTier('tier1')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer text-xs ${activeTier === 'tier1' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              一级直属 (3)
            </button>
            <button
              onClick={() => setActiveTier('tier2')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer text-xs ${activeTier === 'tier2' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              二级裂变 (2)
            </button>
          </div>
          <span className="text-xs text-slate-400 font-code-token">一人一码终身锁客已校验</span>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filtered.map(c => (
            <div key={c.uid} className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-code-token font-semibold text-slate-900 text-xs">{c.uid}</span>
                  <span className={`px-2 py-0.5 rounded-full font-code-token text-[10px] font-semibold border ${
                    c.tier === 'tier1' ? 'bg-blue-50 text-blue-700 border-blue-200/60' : 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                  }`}>
                    {c.tier === 'tier1' ? '一级直属 (4%)' : '二级裂变 (1%)'}
                  </span>
                  {c.parentUid && (
                    <span className="text-[11px] text-slate-400">来自 {c.parentUid} 转介</span>
                  )}
                </div>
                <span className="font-numeric-table text-xs font-bold text-emerald-700">+${c.commission.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-numeric-table">
                <div>
                  <span className="text-slate-400 font-sans">首单卡种: </span>
                  <span className="font-medium text-slate-800 font-sans">{c.firstCard}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans">累计单量: </span>
                  <span className="font-medium text-slate-800">{c.totalOrders} 笔</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans">累计 GMV: </span>
                  <span className="font-bold text-slate-800">${c.gmv.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5 font-code-token text-[11px]">
                <span>绑定手机: {c.phone}</span>
                <span>锁客时间: {c.joined}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <span className="text-xs text-slate-500 font-code-token">归因链路已生成防伪指纹</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-900 transition-colors text-xs cursor-pointer shadow-xs"
          >
            关闭全景
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. 对账明细弹窗 (ReconciliationModal)
// -------------------------------------------------------------
interface ReconciliationModalProps {
  promoter: PromoterItem | null;
  onClose: () => void;
}

export const ReconciliationModal: React.FC<ReconciliationModalProps> = ({
  promoter,
  onClose
}) => {
  if (!promoter) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">{promoter.name} · 本月核销提成对账单</h3>
              <p className="text-xs text-slate-500">工号: <span className="font-code-token">{promoter.id}</span> | 邀请码: <span className="font-code-token font-bold text-blue-600">{promoter.inviteCode}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* 对账汇总 */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">有效核销单量</span>
              <div className="font-numeric-stat text-lg font-bold text-slate-900 mt-1">{promoter.monthlyOrders} <span className="text-xs font-normal text-slate-400 font-sans">笔</span></div>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">贡献有效 GMV</span>
              <div className="font-numeric-stat text-lg font-bold text-slate-900 mt-1">${promoter.gmv.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">预估提成收益</span>
              <div className="font-numeric-stat text-lg font-bold text-emerald-700 mt-1">${promoter.estimatedCommission.toFixed(2)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-slate-800 text-xs font-label-caps">提成核算拆解 (基于两级封顶模型)</span>
            <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-label-caps text-[11px]">
                  <tr>
                    <th className="px-3.5 py-2 font-medium">归因层级</th>
                    <th className="px-3.5 py-2 font-medium text-right">核销金额 (GMV)</th>
                    <th className="px-3.5 py-2 font-medium text-right">计算比例</th>
                    <th className="px-3.5 py-2 font-medium text-right">预估佣金</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-numeric-table text-xs">
                  <tr>
                    <td className="px-3.5 py-2.5 font-sans font-medium text-blue-600">一级直属客户 (Tier 1)</td>
                    <td className="px-3.5 py-2.5 text-right font-medium text-slate-700">${(promoter.gmv * 0.75).toFixed(2)}</td>
                    <td className="px-3.5 py-2.5 text-right text-blue-600 font-semibold font-code-token">4.0%</td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-slate-900">${(promoter.gmv * 0.75 * 0.04).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2.5 font-sans font-medium text-indigo-600">二级裂变客户 (Tier 2)</td>
                    <td className="px-3.5 py-2.5 text-right font-medium text-slate-700">${(promoter.gmv * 0.25).toFixed(2)}</td>
                    <td className="px-3.5 py-2.5 text-right text-indigo-600 font-semibold font-code-token">1.0%</td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-slate-900">${(promoter.gmv * 0.25 * 0.01).toFixed(2)}</td>
                  </tr>
                  <tr className="bg-rose-50/40">
                    <td className="px-3.5 py-2.5 font-sans font-medium text-rose-600">第3级及以上裂变</td>
                    <td className="px-3.5 py-2.5 text-right text-slate-400 font-medium">$3,420.00</td>
                    <td className="px-3.5 py-2.5 text-right text-rose-600 font-semibold font-code-token">0.0% (熔断)</td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-slate-400">$0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-amber-800 text-xs leading-relaxed flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">lock</span>
            <span>
              <strong>财务隔离提示：</strong>此对账明细仅供推广运营端业务复核。账期结束后，合规专员将生成不可逆的只读凭证批次，推送到 <strong>04 财务结算中心</strong> 由财务专员打款，推广端无直接放款权限。
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-900 transition-colors text-xs cursor-pointer shadow-xs"
            >
              关闭对账单
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 5. 风控解冻 / 状态干预 弹窗 (RiskInterventionModal)
// -------------------------------------------------------------
interface RiskInterventionModalProps {
  promoter: PromoterItem | null;
  onClose: () => void;
  onResolve: (promoterId: string, newStatus: 'active' | 'paused') => void;
}

export const RiskInterventionModal: React.FC<RiskInterventionModalProps> = ({
  promoter,
  onClose,
  onResolve
}) => {
  const [remark, setRemark] = useState('');

  if (!promoter) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">风控合规熔断干预核验</h3>
              <p className="text-xs text-slate-500">针对触碰风控规则推广专员的处理</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-xs">{promoter.name} (<span className="font-code-token">{promoter.id}</span>)</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-code-token font-semibold text-[10px] border border-rose-200">
                {promoter.status === 'paused' ? '暂停派码 (熔断)' : '正常接单'}
              </span>
            </div>
            <p className="text-slate-600 text-xs">所属战队: {promoter.teamName} · 专属码: <span className="font-code-token font-semibold text-blue-600">{promoter.inviteCode}</span></p>
            {promoter.statusReason && (
              <p className="text-rose-700 font-medium text-xs mt-1 bg-rose-50 p-2 rounded-lg border border-rose-100 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] shrink-0">error</span>
                <span>触发原因: {promoter.statusReason}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1.5 text-xs">合规核验与复议意见</label>
            <textarea
              rows={3}
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="请输入核验依据、IP交叉比对结果或合规解除说明..."
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs cursor-pointer"
            >
              取消
            </button>
            {promoter.status === 'paused' ? (
              <button
                onClick={() => {
                  onResolve(promoter.id, 'active');
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-xs text-xs cursor-pointer"
              >
                合规解除 · 恢复接单
              </button>
            ) : (
              <button
                onClick={() => {
                  onResolve(promoter.id, 'paused');
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 shadow-xs text-xs cursor-pointer"
              >
                实施风控熔断冻结
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 6. 移交财务只读凭证弹窗 (VoucherTransferModal)
// -------------------------------------------------------------
interface VoucherTransferModalProps {
  batch: SettlementBatchItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmTransfer: (batchNo: string) => void;
}

export const VoucherTransferModal: React.FC<VoucherTransferModalProps> = ({
  batch,
  isOpen,
  onClose,
  onConfirmTransfer
}) => {
  if (!isOpen || !batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">移交财务结算中心 (只读凭证出具)</h3>
              <p className="text-xs text-slate-500">红线四：与财务结算硬隔离 · 规范化凭证移交</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-2.5 text-xs font-numeric-table">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">结算批次:</span>
              <span className="font-bold text-slate-900 font-code-token">{batch.batchNo}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">账期跨度:</span>
              <span className="text-slate-800 font-sans">{batch.period}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">核销有效推广员:</span>
              <span className="text-slate-800 font-sans font-medium">{batch.promoterCount} 位专员</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200/80 pt-2">
              <span className="text-slate-500 font-sans">撬动出单流水 (GMV):</span>
              <span className="font-bold text-blue-600">${batch.totalGmv.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">预估提成总金额:</span>
              <span className="font-bold text-emerald-700 text-sm font-numeric-stat">${batch.totalCommission.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-emerald-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>两级封顶合规审计结果: PASS (无超额穿透)</span>
            </div>
            <p className="text-emerald-700 text-xs leading-relaxed">
              确认移交后，系统将锁定该批次为 READ-ONLY 状态，生成防篡改凭证哈希值并投递给 <strong>04 财务结算中心</strong> 执行批量打款。
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs cursor-pointer"
            >
              返回复核
            </button>
            <button
              onClick={() => {
                onConfirmTransfer(batch.batchNo);
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>确认生成凭证并移交财务</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
