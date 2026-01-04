import { SafeHtml } from '@angular/platform-browser';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type TAlertType = 'inform' | 'fail' | 'success' | 'confirm' | 'warning';

export type IconBgColor = 'green' | 'blue' | 'red' | 'yellow';

export interface IAlertContent {
  /**
   * Title of the alert
   */
  title?: string | null;
  /**
   * Subtitle of the alert
   */
  content?: string;
  /**
   * Confirm a message of the alert
   */
  doneMsg?: string;
  /**
   * Cancel a message of the alert
   */
  cancelMsg?: string;
  /**
   * Automatic close the alert modal
   */
  close?: boolean;
  /**
   * Closes the alert after the given value
   */
  timeout?: number;
  /**
   * Show Confirm button of the alert
   */
  isOk?: boolean;
  /**
   * Show Cancel button of the alert
   */
  isCancel?: boolean;

  icon?: IconDefinition;

  btnClass?: string;
  iconClass?: string;
  iconBgColor?: IconBgColor;
}

export interface IAlertDefaultContent {
  title: string;
  content: string | SafeHtml;
  doneMsg: string;
  cancelMsg: string;
  close: boolean;
  timeout: number;
  isOk: boolean;
  icon: IconDefinition;
  isCancel: boolean;
  refresh?: boolean;
  btnClass?: string;
  iconClass?: string;
  iconBgColor: IconBgColor;
}

export interface IAlertData {
  alertType: string;
  data: IAlertDefaultContent;
}
