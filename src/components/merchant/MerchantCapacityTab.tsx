import React, { useState, useMemo } from 'react';

interface MerchantCapacityTabProps {
  showToast: (msg: string) => void;
}

export interface MerchantCapacitySKUItem {
  id: string;
  merchantName: string;
  merchantMid: string;
  merchantTier: string;
  // 商户承接能力关键字段：
  // 国家 ｜ 卡种 ｜ 卡形式 ｜ 面额 ｜ 是否接单 ｜ 当前报价 ｜ 积点 ｜ 成功率 ｜ 异常处理能力
  country: string; // 1. 国家
  cardBrand: string; // 2. 卡种
  cardForm: 'E-Code' | 'Physical' | 'Receipt' | 'Direct-PIN'; // 3. 卡形式
  denomination: number; // 4. 面额
  isAcceptingOrders: boolean; // 5. 是否接单
  currentQuoteRate: number; // 6. 当前报价 (%)
  capacityPoints: number; // 7. 积点
  fulfillmentSuccessRate: number; // 8. 成功率 (%)
  anomalyHandlingAbility: '高 (秒级响应/自主兜底)' | '中 (需客服协同)' | '低 (频繁超时拒单)'; // 9. 异常处理能力
  isEligibleForFailover: boolean; // 作为「异常转单」候选池资格
}

const INITIAL_CAPACITY_DATA: MerchantCapacitySKUItem[] = [
  {
    id: 'CAP-01',
    merchantName: '招财进宝数卡科技',
    merchantMid: 'MID-1001',
    merchantTier: 'Tier-S',
    country: 'US',
    cardBrand: 'Apple Gift Card',
    cardForm: 'E-Code',
    denomination: 100,
    isAcceptingOrders: true,
    currentQuoteRate: 92.2,
    capacityPoints: 480000,
    fulfillmentSuccessRate: 99.4,
    anomalyHandlingAbility: '高 (秒级响应/自主兜底)',
    isEligibleForFailover: true
  },
  {
    id: 'CAP-02',
    merchantName: '万丰国际卡行',
    merchantMid: 'MID-1003',
    merchantTier: 'Tier-S',
    country: 'US',
    cardBrand: 'Apple Gift Card',
    cardForm: 'E-Code',
    denomination: 100,
    isAcceptingOrders: true,
    currentQuoteRate: 91.9,
    capacityPoints: 310000,
    fulfillmentSuccessRate: 98.9,
    anomalyHandlingAbility: '高 (秒级响应/自主兜底)',
    isEligibleForFailover: true
  },
  {
    id: 'CAP-03',
    merchantName: '鼎盛数字科技',
    merchantMid: 'MID-1002',
    merchantTier: 'Tier-A',
    country: 'US',
    cardBrand: 'Apple Gift Card',
    cardForm: 'Physical',
    denomination: 200,
    isAcceptingOrders: true,
    currentQuoteRate: 91.5,
    capacityPoints: 120000,
    fulfillmentSuccessRate: 97.8,
    anomalyHandlingAbility: '中 (需客服协同)',
    isEligibleForFailover: true
  },
  {
    id: 'CAP-04',
    merchantName: '极速易换点卡商行',
    merchantMid: 'MID-1004',
    merchantTier: 'Tier-B',
    country: 'Global',
    cardBrand: 'Steam Wallet',
    cardForm: 'E-Code',
    denomination: 50,
    isAcceptingOrders: false, // 暂停接单
    currentQuoteRate: 86.5,
    capacityPoints: 45000,
    fulfillmentSuccessRate: 95.2,
    anomalyHandlingAbility: '低 (频繁超时拒单)',
    isEligibleForFailover: false
  },
  {
    id: 'CAP-05',
    merchantName: '拉美数字通',
    merchantMid: 'MID-1005',
    merchantTier: 'Tier-A',
    country: 'Global',
    cardBrand: 'Razer Gold',
    cardForm: 'Direct-PIN',
    denomination: 100,
    isAcceptingOrders: true,
    currentQuoteRate: 85.0,
    capacityPoints: 85000,
    fulfillmentSuccessRate: 88.5,
    anomalyHandlingAbility: '低 (频繁超时拒单)',
    isEligibleForFailover: false
  }
];

export const MerchantCapacityTab: React.FC<MerchantCapacityTabProps> = ({ showToast }) => {
  const [capacities, setCapacities] = useState<MerchantCapacitySKUItem[]>(INITIAL_CAPACITY_DATA);
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterCountry, setFilterCountry] = useState('ALL');
  const [filterAcceptingOnly, setFilterAcceptingOnly] = useState(false);

  const filteredList = useMemo(() => {
    return capacities.filter(item => {
      if (filterBrand !== 'ALL' && !item.cardBrand.includes(filterBrand)) return false;
      if (filterCountry !== 'ALL' && item.country !== filterCountry) return false;
      if (filterAcceptingOnly && !item.isAcceptingOrders) return false;
      return true;
    });
  }, [capacities, filterBrand, filterCountry, filterAcceptingOnly]);

  const handleToggleAccept = (id: string) => {
    setCapacities(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const next = !c.isAcceptingOrders;
        showToast(`商户【${c.merchantName}】针对【${c.cardBrand} ${c.denomination}】承接状态已变更为：${next ? '开启接单' : '暂停接单'}`);
        return { ...c, isAcceptingOrders: next };
      })
    );
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 顶部标题与基础定位卡 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">network_node</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">商户承接能力大盘（正常匹配 + 异常转单 的底层基础）</h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                智能撮合路由底座
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              严格规范关键字段：<span className="font-mono font-bold text-slate-800">国家 ｜ 卡种 ｜ 卡形式 ｜ 面额 ｜ 是否接单 ｜ 当前报价 ｜ 积点 ｜ 成功率 ｜ 异常处理能力</span>。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-mono text-xs">
            在收商户: <strong className="text-emerald-700">{capacities.filter(c => c.isAcceptingOrders).length}</strong> / {capacities.length} 条承接线
          </span>
        </div>
      </div>

      {/* 筛选过滤工具条 */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterBrand}
            onChange={e => setFilterBrand(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
          >
            <option value="ALL">全部卡种</option>
            <option value="Apple">Apple Gift Card</option>
            <option value="Steam">Steam Wallet</option>
            <option value="Razer">Razer Gold</option>
          </select>

          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
          >
            <option value="ALL">全部国家/地区</option>
            <option value="US">🇺🇸 美国 (US)</option>
            <option value="Global">🌐 全球 (Global)</option>
          </select>

          <button
            onClick={() => setFilterAcceptingOnly(!filterAcceptingOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterAcceptingOnly
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            仅看在线接单中
          </button>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">匹配 {filteredList.length} 条细分承接能力规则</span>
      </div>

      {/* 核心承接能力表格：严格呈现 9 大关键字段 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50/90 font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 h-9">
                <th className="py-2.5 px-3">商户主体</th>
                <th className="py-2.5 px-2 font-mono">1. 国家</th>
                <th className="py-2.5 px-3">2. 卡种</th>
                <th className="py-2.5 px-2">3. 卡形式</th>
                <th className="py-2.5 px-2 font-mono">4. 面额</th>
                <th className="py-2.5 px-2 text-center">5. 是否接单</th>
                <th className="py-2.5 px-2 font-mono">6. 当前报价</th>
                <th className="py-2.5 px-2 font-mono">7. 授信积点</th>
                <th className="py-2.5 px-2 font-mono">8. 成功率</th>
                <th className="py-2.5 px-3">9. 异常处理能力</th>
                <th className="py-2.5 px-3 text-right">异常转单资格</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
              {filteredList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-sans">
                    <strong className="text-slate-900 block">{item.merchantName}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{item.merchantMid} · {item.merchantTier}</span>
                  </td>
                  <td className="py-2.5 px-2 font-bold text-slate-800">{item.country}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{item.cardBrand}</td>
                  <td className="py-2.5 px-2 font-sans">
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                      {item.cardForm}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-bold text-slate-900">${item.denomination}</td>
                  <td className="py-2.5 px-2 text-center font-sans">
                    <button
                      onClick={() => handleToggleAccept(item.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all border ${
                        item.isAcceptingOrders
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-300'
                      }`}
                    >
                      {item.isAcceptingOrders ? '接单中' : '已暂停'}
                    </button>
                  </td>
                  <td className="py-2.5 px-2 font-black text-blue-700">{item.currentQuoteRate.toFixed(1)}%</td>
                  <td className="py-2.5 px-2 text-slate-800">{(item.capacityPoints / 10000).toFixed(1)}万</td>
                  <td className="py-2.5 px-2 font-bold text-emerald-600">{item.fulfillmentSuccessRate.toFixed(1)}%</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 text-[11px]">{item.anomalyHandlingAbility}</td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                        item.isEligibleForFailover
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {item.isEligibleForFailover ? '准入转单公海' : '不作为转单承接'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
