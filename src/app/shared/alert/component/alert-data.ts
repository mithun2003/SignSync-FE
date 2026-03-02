// alert-data.ts - Updated with new design system
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleQuestion,
  faTriangleExclamation
} from '@fortawesome/pro-solid-svg-icons';
import { IAlertData } from '../model/alert.model';

export class AlertData {
  static getAlertInfo(): IAlertData[] {
    return [
      {
        alertType: 'inform',
        data: {
          title: 'Info',
          content: "You won't be able to revert this!",
          doneMsg: 'OK',
          cancelMsg: 'Cancel',
          close: false,
          timeout: 1000,
          isOk: true,
          isCancel: false,
          icon: faCircleExclamation,
          btnClass: '',
          iconClass: 'text-info',  // ✅ Updated
          iconBgColor: 'blue'
        }
      },
      {
        alertType: 'fail',
        data: {
          title: 'Oops!',
          content: 'Something went wrong!',
          doneMsg: 'OK',
          cancelMsg: 'Cancel',
          close: false,
          timeout: 1000,
          isOk: true,
          isCancel: false,
          icon: faCircleExclamation,
          btnClass: '',
          iconClass: 'text-danger',  // ✅ Updated
          iconBgColor: 'red'
        }
      },
      {
        alertType: 'success',
        data: {
          title: 'Success!',
          content: 'Completed Successfully',
          doneMsg: 'OK',
          cancelMsg: 'Cancel',
          close: false,
          timeout: 1000,
          isOk: true,
          isCancel: false,
          icon: faCircleCheck,
          btnClass: '',
          iconClass: 'text-success',  // ✅ Updated
          iconBgColor: 'green'
        }
      },
      {
        alertType: 'confirm',
        data: {
          title: 'Confirm',
          content: "You won't be able to revert this!",
          doneMsg: 'Confirm',
          cancelMsg: 'Cancel',
          close: false,
          timeout: 1000,
          isOk: true,
          isCancel: true,
          icon: faCircleQuestion,
          btnClass: '',
          iconClass: 'text-primary',  // ✅ Updated
          iconBgColor: 'blue'
        }
      },
      {
        alertType: 'warning',
        data: {
          title: 'Warning',
          content: 'Please review before continuing.',
          doneMsg: 'OK',
          cancelMsg: 'Cancel',
          close: false,
          timeout: 1000,
          isOk: true,
          isCancel: false,
          icon: faTriangleExclamation,
          btnClass: '',
          iconClass: 'text-warning',  // ✅ Updated
          iconBgColor: 'yellow'
        }
      }
    ];
  }
}