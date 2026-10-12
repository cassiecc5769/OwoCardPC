import React from 'react';
import { NavPath } from '../types';
import { SettlementManagementModule } from './finance/settlement';

interface SettlementManagementViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const SettlementManagementView: React.FC<SettlementManagementViewProps> = ({ onNavigate }) => {
  return <SettlementManagementModule onNavigate={onNavigate} />;
};
