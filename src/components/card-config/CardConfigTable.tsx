import React, { useEffect, useState } from 'react';
import { CardSkuMasterItem, TransactionElementGroup } from './types';
import { CardBrandLogo } from './CardBrandLogo';

interface CardConfigTableProps {
  cards: CardSkuMasterItem[];
  onToggleGrabOrder: (id: string) => void;
  onToggleListing: (id: string) => void;
  onOpenDetail: (card: CardSkuMasterItem) => void;
  onOpenRules: (card: CardSkuMasterItem) => void;
  onOpenFailureAudit: (card: CardSkuMasterItem) => void;
  onOpenColumnSettings: () => void;
}

const DEFAULT_TRANSACTION_ELEMENTS: TransactionElementGroup[] = [
  { category: '速度', values: ['Fast', 'Slow'] },
  { category: '介质', values: ['Physical', 'ECode'] },
];

const truncate = (value: string) => (
  <span title={value} className="block max-w-[152px] truncate text-slate-600">
    {value}
  </span>
);

const getCountries = (card: CardSkuMasterItem) =>
  card.associatedCountries?.length
    ? card.associatedCountries.join(',')
    : `${card.countryCode}${card.countryName
        .replace(/\s*\(.+?\)/g, '')
        .replace(/[🇺🇸🇬🇧🇩🇪🇯🇵🇳🇬🌍]/g, '')
        .replace(/\s*\/\s*/g, ',')}`;

const getFaceValues = (card: CardSkuMasterItem) =>
  (card.commonFaceValues?.length
    ? card.commonFaceValues
    : card.ladders.filter((item) => item.enabled).map((item) => item.amount)
  ).join(',');

const getCode = (card: CardSkuMasterItem) => {
  if (card.cardCode) return card.cardCode;
  // 兼容旧 SKU mock 数据，同时按主数据编码规范展示为 Kind000004 形式。
  const legacySequence = Number(card.internalId.replace(/\D/g, '')) - 837;
  return `Kind${String(Math.max(1, legacySequence)).padStart(6, '0')}`;
};

const Toggle: React.FC<{
  checked: boolean;
  onChange: () => void;
  onLabel: string;
  offLabel: string;
}> = ({ checked, onChange, onLabel, offLabel }) => (
  <label
    className="inline-flex items-center gap-1.5 cursor-pointer select-none"
    title={checked ? onLabel : offLabel}
  >
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <span className="relative w-9 h-5 rounded-full bg-slate-300 transition-colors peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" />
    <span
      className={`text-[11px] font-medium whitespace-nowrap ${
        checked ? 'text-emerald-700' : 'text-slate-500'
      }`}
    >
      {checked ? onLabel : offLabel}
    </span>
  </label>
);

export const CardConfigTable: React.FC<CardConfigTableProps> = ({
  cards,
  onToggleGrabOrder,
  onToggleListing,
  onOpenDetail,
  onOpenRules,
  onOpenFailureAudit,
  onOpenColumnSettings,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(cards.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const pageCards = cards.slice(startIndex, startIndex + pageSize);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-slate-800 whitespace-nowrap">主数据列表明细</span>
          <span className="font-mono text-slate-500 truncate">共计 {cards.length} 个已配置卡种</span>
        </div>
        <button
          type="button"
          onClick={onOpenColumnSettings}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium cursor-pointer whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[15px]">view_column</span>
          自定义字段
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-[2020px] w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200 select-none whitespace-nowrap">
              <th className="px-4 py-3.5">卡种编码</th>
              <th className="px-4 py-3.5">卡品牌及名称</th>
              <th className="px-4 py-3.5">所属大类</th>
              <th className="px-4 py-3.5">交易要素</th>
              <th className="px-4 py-3.5">关联国家</th>
              <th className="px-4 py-3.5">常见面值</th>
              <th className="px-4 py-3.5">面值范围</th>
              <th className="px-4 py-3.5">录入要素</th>
              <th className="px-4 py-3.5">创建时间</th>
              <th className="px-4 py-3.5">更新时间</th>
              <th className="px-4 py-3.5 text-center">抢单模式</th>
              <th className="px-4 py-3.5 text-center">上架状态</th>
              <th className="px-4 py-3.5 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {pageCards.map((card) => {
              const transactionElements = card.transactionElements || DEFAULT_TRANSACTION_ELEMENTS;
              const isListed = card.listed ?? card.status === 'active';
              const grabOrderEnabled = card.grabOrderEnabled ?? true;
              const category = card.category.includes('游戏') ? '游戏类' : '商超类';
              const attributes = (
                card.otherAttributes?.length ? card.otherAttributes : ['Card image', 'ECode']
              ).join(',');

              return (
                <tr key={card.id} className="hover:bg-slate-50/80 transition-colors align-middle">
                  <td className="px-4 py-3.5 font-mono font-semibold text-blue-600 whitespace-nowrap">
                    {getCode(card)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5 min-w-[180px]">
                      <CardBrandLogo card={card} />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate max-w-[190px]" title={card.brandName}>
                          {card.brandName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[190px]" title={card.subTitle}>
                          {card.subTitle}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded border font-medium ${category === '游戏类' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>
                      {category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="max-w-[180px] space-y-1">
                      {transactionElements.map((group) => (
                        <div key={group.category} className="flex gap-1.5 min-w-0">
                          <span className="shrink-0 text-slate-400">{group.category}:</span>
                          {truncate(group.values.join(','))}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">{truncate(getCountries(card))}</td>
                  <td className="px-4 py-3.5 font-mono">{truncate(getFaceValues(card))}</td>
                  <td className="px-4 py-3.5 font-mono font-medium text-slate-800 whitespace-nowrap">
                    {card.minAmount}-{card.maxAmount}
                  </td>
                  <td className="px-4 py-3.5">{truncate(attributes)}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                    {card.createdAt || card.lastUpdated || '--'}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                    {card.lastUpdated || '--'}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Toggle checked={grabOrderEnabled} onChange={() => onToggleGrabOrder(card.id)} onLabel="是" offLabel="否" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Toggle checked={isListed} onChange={() => onToggleListing(card.id)} onLabel="上架" offLabel="下架" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                      <button type="button" onClick={() => onOpenDetail(card)} className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer">编辑</button>
                      <button type="button" onClick={() => onOpenRules(card)} className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer">规则设置</button>
                      <button type="button" onClick={() => onOpenFailureAudit(card)} className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer">失败审核设置</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {pageCards.length === 0 && (
              <tr><td colSpan={13} className="py-12 text-center text-slate-400">暂无匹配的卡种主数据</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span>显示第 <strong className="text-slate-800 font-mono">{cards.length ? startIndex + 1 : 0}</strong> 到 <strong className="text-slate-800 font-mono">{Math.min(startIndex + pageSize, cards.length)}</strong> 条，共 <strong className="text-slate-800 font-mono">{cards.length}</strong> 条记录</span>
          <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="h-7 px-2 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
            <option value="10">每页 10 条</option><option value="20">每页 20 条</option><option value="50">每页 50 条</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center disabled:text-slate-300 disabled:cursor-not-allowed text-slate-600 hover:bg-slate-50 cursor-pointer"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, index) => index + 1).map((page) => <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg font-semibold font-mono text-xs ${page === currentPage ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'} cursor-pointer`}>{page}</button>)}
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center disabled:text-slate-300 disabled:cursor-not-allowed text-slate-600 hover:bg-slate-50 cursor-pointer"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
        </div>
      </div>
    </section>
  );
};
