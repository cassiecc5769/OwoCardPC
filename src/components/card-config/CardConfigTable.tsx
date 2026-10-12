import React, { useState } from 'react';
import { CardSkuMasterItem } from './types';
import { CardBrandLogo } from './CardBrandLogo';

interface CardConfigTableProps {
  cards: CardSkuMasterItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (all: boolean) => void;
  onToggleStatus: (id: string) => void;
  onOpenDetail: (card: CardSkuMasterItem) => void;
  onOpenLadder: (card: CardSkuMasterItem) => void;
  onOpenChannelLog: (card: CardSkuMasterItem) => void;
  includeInactive: boolean;
  onToggleIncludeInactive: (val: boolean) => void;
  onOpenColumnSettings: () => void;
}

export const CardConfigTable: React.FC<CardConfigTableProps> = ({
  cards,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onToggleStatus,
  onOpenDetail,
  onOpenLadder,
  onOpenChannelLog,
  includeInactive,
  onToggleIncludeInactive,
  onOpenColumnSettings,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const allSelected = cards.length > 0 && cards.every((c) => selectedIds.includes(c.id));

  const totalPages = Math.max(1, Math.ceil(cards.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageCards = cards.slice(startIndex, startIndex + pageSize);

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'error':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Top Meta */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">主数据列表明细</span>
          <span className="font-mono text-slate-500">
            共计 {cards.length} 个已定义 SKU 规则
          </span>
          {selectedIds.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium font-mono text-[11px]">
              已选中 {selectedIds.length} 项
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => onToggleIncludeInactive(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
            />
            <span>包含停收卡种</span>
          </label>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={onOpenColumnSettings}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">view_column</span>
            <span>自定义字段</span>
          </button>
        </div>
      </div>

      {/* Table Responsive Wrapper */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200 select-none">
              <th className="w-10 px-4 py-3.5 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                />
              </th>
              <th className="px-4 py-3.5">卡种编码 (SKU)</th>
              <th className="px-4 py-3.5">卡品牌及定义</th>
              <th className="px-4 py-3.5">发行属地 / 币种</th>
              <th className="px-4 py-3.5">支持面值模型与区间</th>
              <th className="px-4 py-3.5">卡密校验正则与形态</th>
              <th className="px-4 py-3.5">OCR 与风控核验能力</th>
              <th className="px-4 py-3.5 text-center">收卡状态</th>
              <th className="px-4 py-3.5 text-right">配置操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {pageCards.map((card) => {
              const isSelected = selectedIds.includes(card.id);
              const isMaintenance = card.status === 'maintenance';

              return (
                <tr
                  key={card.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isMaintenance ? 'bg-slate-50/30' : ''
                  } ${isSelected ? 'bg-blue-50/30' : ''}`}
                >
                  {/* Select Checkbox */}
                  <td className="px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(card.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                    />
                  </td>

                  {/* SKU & ID */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <span
                        className={`font-mono font-semibold ${
                          isMaintenance ? 'text-slate-500' : 'text-blue-600'
                        }`}
                      >
                        {card.id}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        ID: {card.internalId}
                      </span>
                    </div>
                  </td>

                  {/* Brand & Subtitle */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <CardBrandLogo card={card} />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold ${
                              isMaintenance ? 'text-slate-700' : 'text-slate-900'
                            }`}
                          >
                            {card.brandName}
                          </span>
                          {card.riskBadge && (
                            <span
                              className={`px-1.5 py-0.2 rounded font-medium text-[10px] ${
                                card.riskBadge === '高风控'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {card.riskBadge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {card.subTitle}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Geo & Currency */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <div
                        className={`flex items-center gap-1 font-medium ${
                          isMaintenance ? 'text-slate-600' : 'text-slate-800'
                        }`}
                      >
                        <span>{card.countryFlag}</span>
                        <span>{card.countryName}</span>
                      </div>
                      <span
                        className={`font-mono text-[11px] font-medium ${
                          isMaintenance ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {card.currencyDesc}
                      </span>
                    </div>
                  </td>

                  {/* Face Value Model & Range */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <span
                        className={`font-mono font-semibold ${
                          isMaintenance ? 'text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {card.faceValueRangeDesc}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {card.ladderDetailDesc}
                      </span>
                    </div>
                  </td>

                  {/* Regex & Card Material */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <code
                        className={`font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-200/80 w-fit ${
                          isMaintenance
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {card.regexDisplay}
                      </code>
                      <span className="text-[11px] text-slate-400">
                        {card.cardMaterial}
                      </span>
                    </div>
                  </td>

                  {/* OCR & Risk Badges */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {card.ocrCapabilities.map((badge, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded border text-[10px] font-mono ${getBadgeClass(
                            badge.type
                          )}`}
                        >
                          {badge.text}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status Switch */}
                  <td className="px-4 py-3.5 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={card.status === 'active'}
                        onChange={() => onToggleStatus(card.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right relative">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(card)}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
                      >
                        配置详情
                      </button>

                      {isMaintenance ? (
                        <button
                          type="button"
                          onClick={() => onOpenChannelLog(card)}
                          className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          通道日志
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenLadder(card)}
                          className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          面值阶梯
                        </button>
                      )}

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(activeMenuId === card.id ? null : card.id)
                          }
                          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            more_vert
                          </span>
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === card.id && (
                          <div className="absolute right-0 top-7 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 text-left text-xs animate-fadeIn">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onOpenLadder(card);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px] text-slate-400">
                                tune
                              </span>
                              <span>面值阶梯</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onOpenChannelLog(card);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px] text-slate-400">
                                terminal
                              </span>
                              <span>通道日志</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onToggleStatus(card.id);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px] text-slate-400">
                                power_settings_new
                              </span>
                              <span>{card.status === 'active' ? '暂停收卡' : '恢复在收'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span>
            显示第{' '}
            <strong className="text-slate-800 font-mono">
              {cards.length === 0 ? 0 : startIndex + 1}
            </strong>{' '}
            到{' '}
            <strong className="text-slate-800 font-mono">
              {Math.min(startIndex + pageSize, cards.length)}
            </strong>{' '}
            条
          </span>
          <span>·</span>
          <span>
            共 <strong className="text-slate-800 font-mono">{cards.length}</strong> 条记录
          </span>
          <span>·</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-7 px-2 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
            <option value="50">每页 50 条</option>
          </select>
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={`w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${
              currentPage === 1
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg font-semibold font-mono text-xs flex items-center justify-center transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}

          {totalPages > 5 && (
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              className={`w-8 h-8 rounded-lg font-mono text-xs border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === totalPages ? 'bg-blue-600 text-white' : ''
              }`}
            >
              {totalPages}
            </button>
          )}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={`w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-colors ${
              currentPage === totalPages
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
