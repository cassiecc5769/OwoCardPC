import React from 'react';
import {
  CreditCard,
  Store,
  Megaphone,
  Gavel,
  Copy,
  X,
  Trash2,
  Plus,
  ZoomIn,
  CheckCircle2,
  Headphones,
  MessageSquare,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  RefreshCw,
  RotateCcw,
  Send,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileEdit,
  SlidersHorizontal,
  Search,
  User,
  Shield,
  Wallet,
  Settings,
  Download,
  Upload,
  ExternalLink,
  History,
  Lock,
  Layers,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  credit_card: CreditCard,
  credit_card_off: CreditCard,
  storefront: Store,
  store: Store,
  campaign: Megaphone,
  gavel: Gavel,
  content_copy: Copy,
  close: X,
  delete: Trash2,
  add: Plus,
  zoom_in: ZoomIn,
  task_alt: CheckCircle2,
  check_circle: CheckCircle2,
  done: CheckCircle2,
  done_all: CheckCircle2,
  support_agent: Headphones,
  chat: MessageSquare,
  forum: MessageSquare,
  warning: AlertTriangle,
  report: AlertTriangle,
  report_problem: AlertTriangle,
  error: AlertCircle,
  info: Info,
  schedule: Clock,
  timer: Clock,
  timer_off: Clock,
  refresh: RefreshCw,
  autorenew: RefreshCw,
  sync: RefreshCw,
  undo: RotateCcw,
  send: Send,
  arrow_forward: ArrowRight,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  edit_note: FileEdit,
  tune: SlidersHorizontal,
  search: Search,
  person: User,
  account_circle: User,
  shield: Shield,
  verified_user: Shield,
  account_balance_wallet: Wallet,
  wallet: Wallet,
  settings: Settings,
  download: Download,
  file_download: Download,
  upload: Upload,
  publish: Upload,
  upload_file: Upload,
  open_in_new: ExternalLink,
  history: History,
  history_toggle_off: History,
  lock: Lock,
  layers: Layers,
  help: HelpCircle,
};

interface MaterialIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number | string;
  className?: string;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  size,
  className = '',
  ...props
}) => {
  const IconComponent = ICON_MAP[name.trim().toLowerCase()];

  if (IconComponent) {
    const sizeStyle = size ? { width: size, height: size } : undefined;
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 leading-none ${className}`}
        style={sizeStyle}
        {...props}
      >
        <IconComponent className="w-full h-full max-w-full max-h-full" />
      </span>
    );
  }

  // Fallback to Material Symbols ligature if not in map
  return (
    <span
      className={`material-symbols-outlined leading-none select-none ${className}`}
      style={size ? { fontSize: size } : undefined}
      {...props}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
