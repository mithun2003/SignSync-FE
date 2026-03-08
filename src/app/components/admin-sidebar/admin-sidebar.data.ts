// admin-sidebar.data.ts
import {
  faHouse,
  faClipboardList,
  faUsers,
  faChartBar,
  faFileLines,
  faGear,
  faScroll,
  faCloudArrowUp,
  faDownload,
  faArrowsRotate,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

// ─── Interfaces ───
export interface NavItem {
  label: string;
  route: string;
  icon: IconDefinition;
  badge?: string;
  badgeColor?: 'warning' | 'info' | 'success' | 'danger';
  dot?: boolean; // Live indicator (green pulse)
  disabled?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface QuickAction {
  label: string;
  icon: IconDefinition;
  action: string; // Method name to call
}

// ─── Data ───
export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Main',
    items: [{ label: 'Dashboard', route: '/admin/dashboard', icon: faHouse }],
  },
  {
    title: 'Management',
    items: [
      { label: 'Signs', route: '/admin/signs', icon: faClipboardList },
      { label: 'Todos', route: '/admin/todos', icon: faClipboardList },
      { label: 'Users', route: '/admin/users', icon: faUsers },
      { label: 'Analytics', route: '/admin/analytics', icon: faChartBar },
      { label: 'Reports', route: '/admin/reports', icon: faFileLines },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', route: '/admin/settings', icon: faGear },
      { label: 'System Logs', route: '/admin/logs', icon: faScroll },
      {
        label: 'Backup & Restore',
        route: '/admin/backup',
        icon: faCloudArrowUp,
      },
    ],
  },
];

export const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Create Backup', icon: faDownload, action: 'createBackup' },
  { label: 'Clear Cache', icon: faArrowsRotate, action: 'clearCache' },
];
