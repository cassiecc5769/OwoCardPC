import React, { useState } from 'react';
import { ChannelItem } from './types';
import { MOCK_CHANNELS } from './mockData';
import { ChannelListView } from './ChannelListView';
import { ChannelDetailView } from './ChannelDetailView';
import {
  NewChannelModal,
  TrackingLinkModal,
  EditChannelModal,
  AttributionRulesModal,
  BudgetRebalanceModal
} from './ChannelModals';

export const ChannelManagementView: React.FC = () => {
  const [channels, setChannels] = useState<ChannelItem[]>(MOCK_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<ChannelItem | null>(null);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [targetLinkChannel, setTargetLinkChannel] = useState<ChannelItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [targetEditChannel, setTargetEditChannel] = useState<ChannelItem | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCreateChannel = (newChan: Partial<ChannelItem>) => {
    const fullChan = newChan as ChannelItem;
    setChannels(prev => [fullChan, ...prev]);
    showToast(`成功创建渠道: ${fullChan.name} (${fullChan.id})`);
  };

  const handleUpdateChannel = (updated: Partial<ChannelItem>) => {
    if (!targetEditChannel) return;
    setChannels(prev =>
      prev.map(c => (c.id === targetEditChannel.id ? { ...c, ...updated } : c))
    );
    if (selectedChannel && selectedChannel.id === targetEditChannel.id) {
      setSelectedChannel(prev => (prev ? { ...prev, ...updated } : null));
    }
    showToast(`已更新渠道: ${targetEditChannel.name}`);
  };

  const handleToggleStatus = (channelId: string) => {
    setChannels(prev =>
      prev.map(c => {
        if (c.id === channelId) {
          const newStatus = c.status === '已暂停' ? '投放中' : '已暂停';
          showToast(`渠道 ${c.name} 状态已变更为: ${newStatus}`);
          return { ...c, status: newStatus as any };
        }
        return c;
      })
    );
    if (selectedChannel && selectedChannel.id === channelId) {
      setSelectedChannel(prev => {
        if (!prev) return null;
        const newStatus = prev.status === '已暂停' ? '投放中' : '已暂停';
        return { ...prev, status: newStatus as any };
      });
    }
  };

  const handleApplyRebalance = () => {
    // Rebalance budgets mock: shift from Facebook to WhatsApp & Ikeja
    setChannels(prev =>
      prev.map(c => {
        if (c.id === 'CH-FB-002') {
          return { ...c, budget: Math.max(c.budget - 2000, 1000) };
        }
        if (c.id === 'CH-WA-002') {
          return { ...c, budget: c.budget + 1200 };
        }
        if (c.id === 'CH-IK-004') {
          return { ...c, budget: c.budget + 800 };
        }
        return c;
      })
    );
    showToast('已成功执行智能预算重平衡！增配高ROI渠道 +$2,000 USD。');
  };

  const handleOpenLinkModal = (channel: ChannelItem) => {
    setTargetLinkChannel(channel);
    setIsLinkModalOpen(true);
  };

  const handleOpenEditModal = (channel: ChannelItem) => {
    setTargetEditChannel(channel);
    setIsEditModalOpen(true);
  };

  return (
    <div className="w-full relative min-h-[600px] animate-fade-in">
      {/* Toast Notification Notification Pill */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main View Switcher: List vs Detail */}
      {selectedChannel ? (
        <ChannelDetailView
          channel={selectedChannel}
          onBack={() => setSelectedChannel(null)}
          onOpenLinkModal={() => handleOpenLinkModal(selectedChannel)}
          onOpenEditModal={() => handleOpenEditModal(selectedChannel)}
          onToggleStatus={() => handleToggleStatus(selectedChannel.id)}
          onShowToast={showToast}
        />
      ) : (
        <ChannelListView
          channels={channels}
          onSelectChannel={chan => setSelectedChannel(chan)}
          onOpenNewChannel={() => setIsNewModalOpen(true)}
          onOpenLinkModal={chan => handleOpenLinkModal(chan)}
          onToggleStatus={handleToggleStatus}
          onOpenRules={() => setIsRulesModalOpen(true)}
          onOpenRebalance={() => setIsRebalanceModalOpen(true)}
          onShowToast={showToast}
        />
      )}

      {/* Modals */}
      <NewChannelModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateChannel}
      />

      <TrackingLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        channel={targetLinkChannel || selectedChannel}
        onSuccess={showToast}
      />

      <EditChannelModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        channel={targetEditChannel || selectedChannel}
        onSave={handleUpdateChannel}
      />

      <AttributionRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <BudgetRebalanceModal
        isOpen={isRebalanceModalOpen}
        onClose={() => setIsRebalanceModalOpen(false)}
        onApply={handleApplyRebalance}
      />
    </div>
  );
};
