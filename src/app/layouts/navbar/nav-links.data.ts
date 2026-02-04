import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface INavItem {
  id?: string;
  title: string;
  icon?: IconDefinition;
  tooltip?: string;
  routerLink?: string;
  onClick?: string;
}

export const NAV_LINKS: INavItem[] = [
  { title: 'Home', routerLink: '/' },
  { title: 'Detect', routerLink: '/gesture-detection' },
  { title: 'Translate', routerLink: '/translate' },
  // { title: 'Dashboard', routerLink: '/dashboard' }
];
