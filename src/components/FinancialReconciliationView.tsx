import React from 'react';
import { NavPath } from '../types';
import { FinancialReconciliationModule } from './finance/reconciliation';

interface FinancialReconciliationViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const FinancialReconciliationView: React.FC<FinancialReconciliationViewProps> = ({ onNavigate }) => {
  return <FinancialReconciliationModule onNavigate={onNavigate} />;
};
