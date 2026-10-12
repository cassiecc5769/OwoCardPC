import React, { useState, useEffect } from 'react';
import { CardSkuMasterItem, FaceValueLadder } from './types';

interface FaceValueLadderModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardSkuMasterItem | null;
  onSaveLadders: (cardId: string, ladders: FaceValueLadder[]) => void;
}

export const FaceValueLadderModal: React.FC<FaceValueLadderModalProps> = ({
  isOpen,
  onClose,
  card,
  onSaveLadders,
}) => {
  const [ladders, setLadders] = useState<FaceValueLadder[]>([]);
  const [newAmount, setNewAmount] = useState<number>(50);
  const [newRate, setNewRate] = useState<number>(85.0);
  const [newMerchantRate, setNewMerchantRate] = useState<number>(80.0);
  const [newLimit, setNewLimit] = useState<number>(100000);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (card) {
      setLadders(card.ladders || []);
    }
  }, [card, isOpen]);

  if (!isOpen || !card) return null;

  const handleToggleLadder = (index: number) => {
    const next = [...ladders];
    next[index].enabled = !next[index].enabled;
    setLadders(next);
  };

  const handleUpdateLadder = (index: number, field: keyof FaceValueLadder, value: any) => {
    const next = [...ladders];
    next[index] = { ...next[index], [field]: value };
    setLadders(next);
  };

  const handleDeleteLadder = (index: number) => {
    setLadders(ladders.filter((_, i) => i !== index));
  };

  const handleAddLadder = () => {
    if (newAmount <= 0) return;
    if (ladders.some((l) => l.amount === newAmount)) {
      setErrorMsg(`面值 $${newAmount} 档位已存在，不可重复添加！`);
      setTimeout(() => setErrorMsg(null), 3200);
      return;
    }
    setErrorMsg(null);
    const next = [
      ...ladders,
      {
        amount: newAmount,
        rateDiscount: newRate,
        minMerchantRate: newMerchantRate,
        dailyLimit: newLimit,
        enabled: true,
      },
    ].sort((a, b) => a.amount - b.amount);

    setLadders(next);
  };

  const handleSave = () => {
    onSaveLadders(card.id, ladders);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                面值阶梯与浮动区间配置 · {card.brandName}
              </h3>
              <span className="font-code-token text-[11px] text-slate-500">
                {card.id} · {card.currencyDesc} · 模式: {card.faceValueModel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* Summary Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-slate-400 block text-[11px]">当前在跑阶梯数</span>
              <span className="font-mono text-base font-bold text-slate-900 mt-0.5 block">
                {ladders.length} 个档位
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">有效承揽金额区间</span>
              <span className="font-mono text-base font-bold text-blue-600 mt-0.5 block">
                {card.faceValueRangeDesc}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">支持形态</span>
              <span className="font-mono text-base font-bold text-emerald-600 mt-0.5 block">
                {card.faceValueModel === 'RANGE' ? '范围浮动面值' : '固定阶梯面值'}
              </span>
            </div>
          </div>

          {/* Ladders Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                  <th className="px-3.5 py-2.5">面值金额 ({card.currency})</th>
                  <th className="px-3.5 py-2.5">建议基准折率 (%)</th>
                  <th className="px-3.5 py-2.5">商户分润底线 (%)</th>
                  <th className="px-3.5 py-2.5">单日承揽限额 ({card.currency})</th>
                  <th className="px-3.5 py-2.5 text-center">状态</th>
                  <th className="px-3.5 py-2.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {ladders.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-3.5 py-2 font-mono font-bold text-slate-900">
                      ${item.amount.toFixed(2)}
                    </td>
                    <td className="px-3.5 py-2">
                      <input
                        type="number"
                        step="0.1"
                        value={item.rateDiscount}
                        onChange={(e) =>
                          handleUpdateLadder(index, 'rateDiscount', parseFloat(e.target.value))
                        }
                        className="w-16 h-6 px-1.5 bg-white border border-slate-200 rounded font-mono text-slate-800 text-xs text-center"
                      />
                    </td>
                    <td className="px-3.5 py-2">
                      <input
                        type="number"
                        step="0.1"
                        value={item.minMerchantRate}
                        onChange={(e) =>
                          handleUpdateLadder(index, 'minMerchantRate', parseFloat(e.target.value))
                        }
                        className="w-16 h-6 px-1.5 bg-white border border-slate-200 rounded font-mono text-slate-800 text-xs text-center"
                      />
                    </td>
                    <td className="px-3.5 py-2">
                      <input
                        type="number"
                        step="1000"
                        value={item.dailyLimit}
                        onChange={(e) =>
                          handleUpdateLadder(index, 'dailyLimit', parseInt(e.target.value))
                        }
                        className="w-24 h-6 px-1.5 bg-white border border-slate-200 rounded font-mono text-slate-800 text-xs"
                      />
                    </td>
                    <td className="px-3.5 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleLadder(index)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono cursor-pointer ${
                          item.enabled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {item.enabled ? '启用' : '禁用'}
                      </button>
                    </td>
                    <td className="px-3.5 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteLadder(index)}
                        className="text-rose-600 hover:text-rose-800 cursor-pointer p-1"
                        title="删除阶梯"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Add Ladder */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60 flex flex-wrap items-end gap-2 text-xs">
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">新增面值金额</label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(Number(e.target.value))}
                className="w-24 h-7 px-2 bg-white border border-slate-200 rounded font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">基准折率 (%)</label>
              <input
                type="number"
                step="0.5"
                value={newRate}
                onChange={(e) => setNewRate(Number(e.target.value))}
                className="w-20 h-7 px-2 bg-white border border-slate-200 rounded font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">商户底线 (%)</label>
              <input
                type="number"
                step="0.5"
                value={newMerchantRate}
                onChange={(e) => setNewMerchantRate(Number(e.target.value))}
                className="w-20 h-7 px-2 bg-white border border-slate-200 rounded font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">单日承揽限额</label>
              <input
                type="number"
                step="5000"
                value={newLimit}
                onChange={(e) => setNewLimit(Number(e.target.value))}
                className="w-28 h-7 px-2 bg-white border border-slate-200 rounded font-mono text-xs"
              />
            </div>
            <button
              type="button"
              onClick={handleAddLadder}
              className="h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>添加阶梯</span>
            </button>
          </div>
          {errorMsg && (
            <div className="mt-2 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-rose-600 text-[16px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            阶梯变更实时广播至挂单做卡池
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>保存阶梯策略</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
